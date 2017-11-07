import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table, Modal, message } from 'antd';
import isEqual from 'lodash/isEqual';

import ReportDao from '../../dao/report';
import { queryTo, redirect } from '../../utils/location-helper';
import { OW_URL, activityURL } from '../../utils/constants';

const confirm = Modal.confirm;


export default class Report extends React.Component {
  static contextTypes = {
    location: PropTypes.object,
    router: PropTypes.object.isRequired,
  };

  state = {
    dataSource: null,
    loading: false,
    current: 1,
    total: null,
    pageSize: null,
  };

  componentWillUnmount() {
    this.dataLoading && this.dataLoading.cancel();
  }

  componentDidMount() {
    let query = this.context.location.query;
    this.loadPaginationData(query);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (!isEqual(nextContext.location.query, this.context.location.query)) {
      const query = nextContext.location.query;
      this.loadPaginationData(query);
    }
  }

  loadPaginationData = (query) => {
    this.setState({
      current: parseInt(query.page, 10),
      pageSize: parseInt(query.page_size, 10),
      loading: true,
    });

    this.dataLoading && this.dataLoading.cancel();
    this.dataLoading = ReportDao.fetch(query);

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

  handleDeleteClick = (id) => {
    confirm({
      title: '确定删除该运营报告吗？',
      // content: 'Some descriptions',
      onOk: () => {
        // do something
        this.deleteLoading && this.deleteLoading.cancel();
        this.deleteLoading = ReportDao.remove({ id });
        this.deleteLoading.then((data) => {
          if (data.code === 0) {
            message.success('已删除！');
            this.setState({
              loading: true,
            });
            return ReportDao.fetch();
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

  handleAdd = () => {
    // add open add page
    this.context.router.push('/report/edit');
  };

  handleEditClick = (id) => {
    redirect('/report/edit', false, { id });
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
        dataIndex: 'key',
        key: 'key',
      }, {
        title: '报告标题',
        dataIndex: 'title',
        key: 'title',
      }, {
        title: '报告月份',
        dataIndex: 'month',
        key: 'month',
      }, {
        title: '所属平台',
        dataIndex: 'platform',
        key: 'platform',
      }, {
        title: '是否显示',
        dataIndex: 'is_display',
        key: 'is_display',
        render: (text, record) => (record.is_display ? '是' : '否'),
      }, {
        title: '预览地址',
        dataIndex: 'view_month',
        key: 'view_month',
        render: (text, record) => {
          if (record.platform === 'app') {
            return (<a target="_blank" href={`${activityURL}/report/home?month=${text}`} style={{ cursor: 'pointer' }}>点击预览</a>);
          }
          return (<a target="_blank" href={`${OW_URL}/report_detail?month=${text}`} style={{ cursor: 'pointer' }}>点击预览</a>);
        },
      }, {
        title: '操作',
        key: 'operation',
        width: 150,
        render: (text, record) => (
          <div>
            <Button size="small" className="operation-primary margin-right" onClick={this.handleEditClick.bind(this, record.id)}>编辑</Button>
            <Button type="danger" size="small" className="operation-warn" onClick={this.handleDeleteClick.bind(this, record.id)}>删除</Button>
          </div>
        ),
      },
    ];

    const { current, total, pageSize } = this.state;

    const pagination = {
      current,
      total,
      pageSize,
      onChange: this.handleChangePage,
    };

    return (
      <div style={{ margin: '16px' }}>
        <div className="filter-bar">
          <div className="operation-primary">
            <Button size="large" type="primary" onClick={this.handleAdd}>新增运营报告</Button>
          </div>
        </div>
        <Table loading={this.state.loading}
          dataSource={this.state.dataSource}
          columns={columns}
          pagination={pagination}
        />
      </div>
    );
  }
}
