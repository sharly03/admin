import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table, Modal, message } from 'antd';
import moment from 'moment';
import isEqual from 'lodash/isEqual';


import DataDao from '../../dao/data';
import EditDataModal from './edit-data-modal';
import { queryTo } from '../../utils/location-helper';

const confirm = Modal.confirm;

export default class Banner extends React.Component {
  static contextTypes = {
    location: PropTypes.object,
    router: PropTypes.object.isRequired,
  };

  state = {
    dataSource: [],
    loading: false,
    modalVisible: false,
    currentItem: {},
    modalType: 'create',
    current: 1,
    total: null,
    pageSize: null,
  };

  componentWillUnmount() {
    this.dataLoading && this.dataLoading.cancel();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (!isEqual(nextContext.location.query, this.context.location.query)) {
      const query = nextContext.location.query;
      this.loadPaginationData(query);
    }
  }

  componentDidMount() {
    let query = this.context.location.query;
    this.loadPaginationData(query);
  }

  loadPaginationData = (query) => {
    this.setState({
      current: parseInt(query.page, 10),
      pageSize: parseInt(query.page_size, 10),
      loading: true,
    });

    this.dataLoading && this.dataLoading.cancel();
    this.dataLoading = DataDao.fetch(query);

    this.dataLoading.then((result) => {
      this.processListData(result);
    });
  };

  processListData = (result) => {
    if (result.code === 0) {
      this.setState({
        loading: false,
        dataSource: result.data,
        total: result.page_info.total,
        pageSize: parseInt(result.page_info.page_size, 10),
        current: parseInt(result.page_info.current_page, 10),
      });
    } else {
      this.setState({
        loading: false,
      });
      message.error(result.msg);
    }
  };

  handleAddData = () => {
    this.setState({
      modalType: 'create',
      currentItem: {},
      modalVisible: true,
    });
  };

  handleDeleteClick = (id) => {
    confirm({
      title: '确定删除该运营数据吗？',
      onOk: () => {
        this.deleteLoading && this.deleteLoading.cancel();
        this.deleteLoading = DataDao.delete({ id });
        this.deleteLoading.then((data) => {
          if (data.code === 0) {
            message.success('已删除！');
            this.setState({
              loading: true,
            });
            return DataDao.fetch();
          }
          return Promise.reject(data.msg);
        }).then((result) => {
          this.processListData(result);
        }).catch((err) => {
          message.error(err);
        });
      },
    });
  };

  handelSubmitData = (data) => {
    console.log(data);
    this.submitLoading && this.submitLoading.cancel();
    if (this.state.modalType === 'create') {
      this.submitLoading = DataDao.add(data);
    } else {
      // this.submitLoading = BannerDao.editAdPosition(data);
    }
    this.submitLoading.then((result) => {
      if (result.code === 0) {
        message.success('保存成功！');
        this.setState({
          modalVisible: false,
          loading: true,
          currentItem: {},
        });
        return DataDao.fetch();
      }
      return Promise.reject();
    }).then((result) => {
      this.processListData(result);
    }).catch((err) => {
      console.log(err);
      message.error('保存失败！');
    });
  };

  handelCancelEditData = () => {
    this.setState({
      modalVisible: false,
    });
  };

  handleChangePage = (page) => {
    queryTo(location, {
      page,
      page_size: this.state.pageSize,
    });
  };

  render() {
    const columns = [
      {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
      }, {
        title: '现金成交额（亿）',
        dataIndex: 'cash_done',
        key: 'cash_done',
      }, {
        title: '累计投资笔数（万笔）',
        dataIndex: 'invest_time',
        key: 'invest_time',
      }, {
        title: '注册用户数（万人）',
        dataIndex: 'user_total',
        key: 'user_total',
      }, {
        title: '安全运营天数（天）',
        dataIndex: 'safe_duration',
        key: 'safe_duration',
      }, {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (text, record) => {
          return (
            <div>{moment(record.created_at * 1000).format('YYYY-MM-DD HH:mm:ss')}</div>
          );
        },
      }, {
        title: '操作',
        key: 'operation',
        width: 100,
        render: (text, record) => {
          return (
            <div style={{ cursor: 'pointer' }}>
              <Button type="danger" size="small" className="operation-warn" onClick={this.handleDeleteClick.bind(this, record.id)}>删除</Button>
            </div>
          );
        },
      },
    ];

    const { current, total, pageSize } = this.state;
    return (
      <div style={{ margin: '16px' }}>
        <div className="filter-bar">
          <div className="operation-primary">
            <Button size="large" type="primary" onClick={this.handleAddData}>新增数据</Button>
          </div>
        </div>
        <Table loading={this.state.loading}
          dataSource={this.state.dataSource}
          columns={columns}
          pagination={{
            current,
            total,
            pageSize,
            onChange: this.handleChangePage,
          }}
        />
        <EditDataModal
          item={this.state.modalType === 'create' ? {} : this.state.currentItem}
          type={this.state.modalType}
          visible={this.state.modalVisible}
          onOk={this.handelSubmitData}
          onCancel={this.handelCancelEditData}
        />
      </div>
    );
  }
}
