import React from 'react';
import PropTypes from 'prop-types';
import { Modal, message, Badge } from 'antd';
import moment from 'moment';
import isEqual from 'lodash/isEqual';

import { PageList } from '../../components/page-list';
import Filter from './filter';
import BannerDao from '../../dao/banner';
import BaseDao from '../../dao/base';

import { queryTo } from '../../utils/location-helper';
import EditAdModal from './edit-modal';
import { APP_TIPS } from '../../utils/constants';

const confirm = Modal.confirm;

const adStatus = {
  not_start: { text: '未开始', status: 'default' },
  underway: { text: '进行中', status: 'processing' },
  finished: { text: '已结束', status: 'default' },
};

export default class AdManagePage extends React.Component {
  static contextTypes = {
    location: PropTypes.object,
    router: PropTypes.object.isRequired,
  };

  state = {
    dataSource: [],
    loading: true,
    current: 1,
    total: null,
    pageSize: null,
    modalVisible: false,
    currentItem: {},
    modalType: '',
    token: '',
    positions: [],
  };

  componentWillUnmount() {
    this.dataPending && this.dataPending.cancel();
    this.initPending && this.initPending.cancel();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (!isEqual(nextContext.location.query, this.context.location.query)) {
      const query = nextContext.location.query;
      this.loadPaginationData(query);
    }
  }


  componentDidMount() {
    let query = this.context.location.query;
    // this.loadPaginationData(query);
    this.initPageData(query);
  }

  initPageData = async (query) => {
    this.initPending && this.initPending.cancel();
    this.initPending = Promise.all([BannerDao.fetchAdv(query), BaseDao.fetchQiniuToken(), BannerDao.fetchPositions()]);
    const [advData, tokenData, adpData] = await this.initPending;
    if (advData.code === 0 && tokenData.code === 0 && adpData.code === 0) {
      const { items, totalRowsCount, pageSize, pageIndex } = advData.data;
      this.setState({
        loading: false,
        token: tokenData.data,
        positions: adpData.data,
        dataSource: items,
        total: totalRowsCount,
        pageSize,
        current: pageIndex,
      });
    } else {
      this.setState({
        loading: false,
      });
      advData.code !== 0 && advData.msg && message.error(advData.msg);
      adpData.code !== 0 && adpData.msg && message.error(adpData.msg);
      tokenData.code !== 0 && tokenData.msg && message.error(tokenData.msg);
    }
  }

  loadPaginationData = async (query) => {
    this.setState({
      loading: true,
    });

    this.dataPending && this.dataPending.cancel();
    this.dataPending = BannerDao.fetchAdv(query);

    const result = await this.dataPending;
    const data = result && result.data;
    if (result.code === 0) {
      this.setState({
        loading: false,
        dataSource: data.items,
        total: data.totalRowsCount,
        pageSize: data.pageSize,
        current: data.pageIndex,
      });
    } else {
      message.error(data.msg);
      this.setState({
        loading: false,
      });
    }
  };

  handleDeleteClick = (id) => {
    confirm({
      title: '确定删除该条广告？',
      onOk: () => {
        // do something
        this.deletePending && this.deletePending.cancel();
        this.deletePending = BannerDao.deleteAdv({ id });
        this.deletePending.then((data) => {
          if (data.code === 0) {
            message.success('已删除！');
            this.setState({
              loading: true,
            });
            this.loadPaginationData(this.context.location.query);
          } else {
            message.error(data.msg);
          }
        });
      },
    });
  };

  // 点击新增广告
  handleAdd = () => {
    // add open add modal
    this.setState({
      modalType: 'create',
      currentItem: {},
      modalVisible: true,
    });
  };

  // 编辑列表中的广告
  handleEditClick = (currentItem) => {
    this.setState({
      modalType: 'edit',
      currentItem,
      modalVisible: true,
    });
  };

  // 点击查询按钮回调
  handleSearch = (fields) => {
    this.handleFilterChange(fields);
  };

  // 单个过滤条件变化的回调
  handleFilterChange = (fields) => {
    console.log(fields);
    queryTo(location, fields);
  };

  // 点击翻页
  handleChangePage = (pageIndex, pageSize) => {
    queryTo(location, Object.assign({}, this.context.location.query, {
      pageIndex,
      pageSize: pageSize || this.state.pageSize,
    }));
  };

  handleTokenRefresh = (token) => {
    this.setState({ token });
  }
  // 提交弹窗表单
  handelSubmitEdit = (data) => {
    if (data.positionCode === APP_TIPS) {
      data.content = data.title; // 小贴士类型title和content相同
    }
    console.log('submit', data);
    this.submitPending && this.submitPending.cancel();
    if (this.state.modalType === 'create') {
      this.submitPending = BannerDao.addAdv(data);
    } else {
      this.submitPending = BannerDao.editAdv(data);
    }
    this.submitPending.then((ret) => {
      if (ret.code === 0) {
        message.success('保存成功！');
        this.setState({
          modalVisible: false,
          loading: true,
          currentItem: {},
        });
        this.loadPaginationData(this.context.location.query);
      } else {
        message.error(ret.msg || '保存失败！');
      }
    });
  };

  // 关闭编辑弹窗
  handelCancelEdit = () => {
    this.setState({
      modalVisible: false,
    });
  };

  render() {
    const renderDate = (timestamp) => <div>{moment(timestamp).format('YYYY-MM-DD HH:mm:ss')}</div>;

    const columns = [
      {
        title: '广告位置',
        dataIndex: 'positionName',
        key: 'positionName',
      }, {
        title: '广告名称/小贴士内容',
        dataIndex: 'title',
        key: 'title',
      }, {
        title: '广告状态',
        dataIndex: 'advStatus',
        key: 'advStatus',
        render: (value) => <Badge {...adStatus[value]} />,
      }, {
        title: '显示顺序',
        dataIndex: 'sequence',
        key: 'sequence',
      }, {
        title: '开始时间',
        dataIndex: 'startTime',
        key: 'startTime',
        render: renderDate,

      }, {
        title: '结束时间',
        dataIndex: 'endTime',
        key: 'endTime',
        render: renderDate,
      }, {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text, record) => {
          return (
            <div>
              <a className="margin-right" onClick={this.handleEditClick.bind(this, record)}>编辑</a>
              {record.positionCode === 'APP_TIPS' || !record.url ? null : <a className="margin-right" target="_blank" href={record.url}>查看跳转地址</a>}
              <a onClick={this.handleDeleteClick.bind(this, record.id)}>删除</a>
            </div>
          );
        },
      },
    ];

    const query = this.context.location.query;
    const { current, total, pageSize, positions, token } = this.state;
    return (
      <div style={{ margin: '16px' }}>
        <Filter filter={query} onAdd={this.handleAdd} onSearch={this.handleSearch} positions={positions} onFilterChange={this.handleFilterChange} />
        <PageList loading={this.state.loading}
          rowKey="id"
          dataSource={this.state.dataSource}
          columns={columns}
          pagination={{
            current,
            total,
            pageSize,
            onChange: this.handleChangePage,
          }}
        />
        <EditAdModal
          item={this.state.modalType === 'edit' ? this.state.currentItem : {}}
          type={this.state.modalType}
          token={token}
          onTokenRefresh={this.handleTokenRefresh}
          positions={positions}
          visible={this.state.modalVisible}
          onOk={this.handelSubmitEdit}
          onCancel={this.handelCancelEdit}
        />
      </div>
    );
  }
}
