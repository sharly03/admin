import React from 'react';
import PropTypes from 'prop-types';
import { message, Modal, Button } from 'antd';

import { queryTo } from '../../utils/location-helper';
import { PageList } from '../../components/page-list';
import RoleDao from '../../dao/role';

export default class RolePage extends React.Component {
  static contextTypes = {
    location: PropTypes.object,
    router: PropTypes.object.isRequired,
  };

  state = {
    current: 1,
    total: null,
    pageSize: 20,
  };

  handleChangePage = (pageIndex) => {
    queryTo(location, {
      ...this.context.location.query,
      pageIndex,
      pageSize: this.state.pageSize,
    });
  };
  handelSubmitEdit = () => {
    message.success();
  }

  handleDeleteUser = (record) => {
    console.log(record);
    Modal.confirm({
      title: '确定删除该后台用户吗？',
      content: '用户被删除后将无法恢复',
      onOk: async () => {
        this.setState({
          loading: true,
        });
        this.delPending && this.delPending.cancel();
        this.delPending = RoleDao.removeUser({ id: record.id });
        const result = await this.delPending;
        this.refreshList(result);
      },
    });
  }

  render() {
    const { current, total, pageSize } = this.state;
    const columns = [
      {
        title: '角色名称',
        dataIndex: 'roleName',
      }, {
        title: '角色描述',
        dataIndex: 'description',
      }, {
        title: '操作',
        render: (text, record) => (
          <div>
            <a className="margin-right" onClick={this.handleEditClick.bind(this, record)}>编辑</a>
            <a onClick={this.handleDeleteUser.bind(this, record)}>删除</a>
          </div>
        ),
      },
    ];

    return (
      <div style={{ margin: '16px' }}>
        <div className="filter-bar">
          <div className="operation-btn">
            <Button size="large" type="primary" onClick={this.handleAddRole}>新增</Button>
          </div>
        </div>
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
      </div>
    );
  }
}
