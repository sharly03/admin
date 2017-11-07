import React from 'react';
import PropTypes from 'prop-types';
import { Table, Modal, message, Button } from 'antd';
import moment from 'moment';
import isEqual from 'lodash/isEqual';

import Filter from './filter';
import NewsDao from '../../dao/news';
import { queryTo, redirect } from '../../utils/location-helper';


const confirm = Modal.confirm;

export default class News extends React.Component {
  static contextTypes = {
    location: PropTypes.object,
    router: PropTypes.object.isRequired,
  };

  state = {
    dataSource: [],
    loading: false,
    current: 1,
    total: null,
    pageSize: null,
    query: [],
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
    this.dataLoading = NewsDao.fetch(query);

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

  handleEditClick = (id) => {
    redirect('/news/edit', false, { id });
  };

  handleDeleteClick = (news) => {
    confirm({
      title: '确定删除该条新闻公告？',
      content: '删除操作成功后数据不可恢复',
      onOk: () => {
        this.deleteLoading && this.deleteLoading.cancel();
        this.deleteLoading = NewsDao.remove(news.id);
        this.deleteLoading.then((data) => {
          if (data.code === 0) {
            message.success('已删除！');
            this.setState({
              loading: true,
            });
            return NewsDao.fetch();
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

  handleRecommendClick = (news) => {
    this.dataLoading && this.dataLoading.cancel();
    this.setState({
      loading: true,
    });
    this.dataLoading = NewsDao.recommendOperation(news.id, !news.is_recommended);
    this.dataLoading.then((result) => {
      if (result.code === 0) {
        const dataSource = this.state.dataSource.map((item) => {
          if (item.id === news.id) {
            item.is_recommended = !item.is_recommended;
          }
          return item;
        });
        this.setState({
          loading: false,
          dataSource,
        });
      } else {
        this.setState({
          loading: false,
        });
        message.error(result.msg);
      }
    });
  }

  handleAdd = () => {
    // add open add page
    this.context.router.push('/news/edit');
  };

  // 点击查询按钮回调
  handleSearch = (fields) => {
    this.handleFilterChange(fields);
  };

  // 单个过滤条件变化的回调
  handleFilterChange = (fields) => {
    // console.log(fields);
    queryTo(location, fields);
  };

  handleChangePage = (page) => {
    queryTo(location, Object.assign({}, this.context.location.query, {
      page,
      page_size: this.state.pageSize,
    }));
  };

  render() {
    const columns = [
      {
        title: '序号',
        dataIndex: 'key',
        key: 'key',
      }, {
        title: '标题',
        dataIndex: 'title',
        key: 'title',
      }, {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        render: (text, record) => {
          return (
            <div>{record.type === 'media_report' ? '媒体报道' : '网站公告'}</div>
          );
        },
      }, {
        title: '发布时间',
        dataIndex: 'publish_date',
        key: 'publish_date',
        render: (text, record) => {
          return (
            <div>{moment(record.publish_date * 1000).format('YYYY-MM-DD')}</div>
          );
        },
      }, {
        title: '是否显示',
        dataIndex: 'is_display',
        key: 'is_display',
        render: (text, record) => {
          return record.is_display ? '是' : '否';
        },
      }, {
        title: '是否推荐',
        dataIndex: 'is_recommended',
        key: 'is_recommended',
        render: (text, record) => {
          return record.is_recommended ? '是' : '否';
        },
      }, {
        title: '操作',
        key: 'operation',
        width: 200,
        render: (text, record) => {
          return (
            <div>
              <Button size="small" className="margin-right" onClick={this.handleEditClick.bind(this, record.id)}>编辑</Button>
              <Button type="danger" className="margin-right" size="small" onClick={this.handleDeleteClick.bind(this, record)}>删除</Button>
              <Button size="small" onClick={this.handleRecommendClick.bind(this, record)}>{record.is_recommended ? '取消推荐' : '推荐'}</Button>
            </div>
          );
        },
      },
    ];

    const query = this.context.location.query;

    const { current, total, pageSize } = this.state;
    return (
      <div style={{ margin: '16px' }}>
        <Filter filter={query} onAdd={this.handleAdd} onSearch={this.handleSearch} onFilterChange={this.handleFilterChange} />
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
      </div>
    );
  }
}
