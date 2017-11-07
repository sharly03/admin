import React from 'react';
import { Badge, message } from 'antd';
import Filter from './filter';
import { datetimeFormat } from '../../utils';
import { parseParam, redirect, queryTo } from '../../utils/location-helper';
import { PageList } from '../../components/page-list';

import styles from './user.less';
import dao from '../../dao/user';

const openAccountStatus = {
  '01': { text: '未开户', status: 'error' },
  '02': { text: '已开户', status: 'success' },
};

class User extends React.Component {
  state = {
    totalRowsCount: 0,
    userItems: [],
    // 加载状态
    loading: false,
  };

  componentDidMount() {
    this.fetchItems(parseParam(location.search));
  }
  componentWillUnmount() {
    this.userPendding && this.userPendding.cancel();
    this.setLoading(false);
  }

  setLoading(loading) {
    this.setState({ loading });
  }

  async fetchItems(query) {
    this.userPendding = dao.fetchItems(query);
    this.setLoading(true);
    const data = await this.userPendding;
    this.setLoading(false);
    if (data.code === 0) {
      console.log('=====', data);
      const { items, totalRowsCount } = data.data;
      this.setState({ userItems: items, totalRowsCount });
    } else {
      message.error(data.msg || '加载用户数据失败');
    }
  }

  handleFilterChange = query => this.fetchItems(query);
  handleTableChange = (pageIndex, pageSize) => {
    console.log(pageSize);
    const query = {
      ...parseParam(location.search),
      pageIndex,
      pageSize,
    };
    queryTo(location, query, true);
    this.fetchItems(query);
  };

  render() {
    const { totalRowsCount, userItems, loading } = this.state;
    const query = parseParam(location.search);
    const pagination = {
      total: totalRowsCount,
      current: parseInt(query.pageIndex, 10) || 1,
      pageSize: parseInt(query.pageSize, 10) || 20,
      onChange: this.handleTableChange,
    };
    const userColumns = [
      { dataIndex: 'mobile', title: '注册手机号' },
      { dataIndex: 'name', title: '用户姓名', render: text => text || '--' },
      { dataIndex: 'idCard', title: '身份证号', render: text => text || '--' },
      { dataIndex: 'bindCardStatus', title: '开户状态', render: text => <Badge {...openAccountStatus[text]} /> },
      { dataIndex: 'registerTime', title: '注册时间', width: 180, render: text => datetimeFormat(text) },
      {
        dataIndex: 'operation',
        title: '操作',
        render: (text, record) => <a onClick={() => redirect('/user/detail', false, { userId: record.id })}>详情</a>,
      },
    ];

    return (
      <div style={{ margin: 16 }} className={styles['user-page']}>
        <Filter filter={query} onChange={this.handleFilterChange} />
        <PageList
          rowKey="id"
          loading={loading}
          columns={userColumns}
          dataSource={userItems}
          pagination={pagination}
        />
      </div>
    );
  }
}

export default User;
