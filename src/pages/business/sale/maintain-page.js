/* eslint-disable */
import React from 'react';
// import { Form, Radio, Input, Select } from 'antd';
import AddForm from './add-form';
import { PageList } from '../../../components/page-list';
import { parseParam, queryTo } from '../../../utils/location-helper';

import styles from './sale.less';


class UserMaintain extends React.Component {
  state = { loading: false, userItems: [], totalRowsCount: 0 };

  async fetchUserList(query) {
    console.log('======', query);
    await 0;
    this.setState({ loading: false });
  }

  handlePageChange = (pageIndex, pageSize) => {
    const query = {
      ...parseParam(location.search),
      pageIndex,
      pageSize,
    };
    queryTo(location, query, true);
    this.fetchUserList(query);
  };
  handleDelete = () => {};

  render() {
    const userColumns = [
      { dataIndex: 'commodityCode', title: '标的编号' },
      { dataIndex: 'mobile', title: '手机号' },
      { dataIndex: 'name', title: '用户姓名' },
      { dataIndex: 'operation', title: '操作', render: () => <a onClick={this.handleDelete}>删除</a> },
    ];
    const { loading, userItems, totalRowsCount } = this.state;
    const query = parseParam(location.search);
    const pagination = {
      total: totalRowsCount,
      current: parseInt(query.pageIndex, 10) || 1,
      pageSize: parseInt(query.pageSize, 10) || 10,
      onChange: this.handlePageChange,
    };
    return (
      <div style={{ margin: 16 }} className={styles['user-maintain']}>
        <p className="list-title">用户维护信息</p>
        <AddForm />
        <p className="list-title">开放用户信息</p>
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

export default UserMaintain;
