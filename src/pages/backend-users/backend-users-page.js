import React from 'react';
import PropTypes from 'prop-types';
import { message, Modal, Badge } from 'antd';
import isEqual from 'lodash/isEqual';
import moment from 'moment';


import UserDao from '../../dao/backendUser';
import Filter from './filter';
import { queryTo } from '../../utils/location-helper';
import { PageList } from '../../components/page-list';
import EditModal from './edit-modal';

const userStatus = {
  normal: { text: '正常', status: 'success' },
  freeze: { text: '冻结', status: 'error' },
};

export default class BackendUsersPage extends React.Component {
  static contextTypes = {
    location: PropTypes.object,
    router: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      current: 1,
      total: 0,
      pageSize: 20,
      loading: false,
      modalVisible: false,
      modalType: '',
      submitting: false,
      roles: [],
    };
  }

  componentWillUnmount() {
    this.initPending && this.initPending.cancel();
    this.submitPending && this.submitPending.cancel();
    this.delPending && this.delPending.cancel();
    this.lockPending && this.lockPending.cancel();
    this.unlockPending && this.unlockPending.cancel();
  }

  componentDidMount() {
    const query = this.context.location.query;
    this.loadPaginationData(query);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (!isEqual(nextContext.location.query, this.context.location.query)) {
      const query = nextContext.location.query;
      this.loadPaginationData(query);
    }
  }

  loadPaginationData = async (query) => {
    this.initPending && this.initPending.cancel();
    this.setState({
      loading: true,
    });
    this.initPending = Promise.all([UserDao.fetch(query), UserDao.fetchRoles()]);
    const [userData, roleData] = await this.initPending;
    if (userData.code === 0 && roleData.code === 0) {
      const data = userData.data;
      this.setState({
        loading: false,
        dataSource: data.items,
        total: data.totalRowsCount,
        pageSize: data.pageSize,
        current: data.pageIndex,
        roles: roleData.data,
      });
    } else {
      this.setState({
        loading: false,
      });
      message.error('加载用户数据失败');
    }
  }

  handleFilterChange = (fields) => {
    console.log(fields);
    queryTo(location, fields);
  }

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

  handleLockUser = (user) => {
    if (user.status) {
      this.unlockBackendUser(user);
    } else {
      this.lockBackendUser(user);
    }
  }

  handleChangePage = (pageIndex) => {
    queryTo(location, {
      ...this.context.location.query,
      pageIndex,
      pageSize: this.state.pageSize,
    });
  };
  // 提交弹窗表单
  handelSubmitEdit = async (data) => {
    console.log('submit', data);
    this.setState({
      submitting: true,
    });
    this.submitPending && this.submitPending.cancel();
    this.submitPending = UserDao.saveUser(data);
    const ret = await this.submitPending;
    if (ret.code === 0) {
      message.success('保存成功！');
      this.setState({
        modalVisible: false,
        submitting: false,
        loading: true,
        currentItem: {},
      });
      this.loadPaginationData(this.context.location.query);
    } else {
      message.error(ret.msg || '保存失败！');
      this.setState({
        submitting: false,
      });
    }
  };

  // 关闭编辑弹窗
  handelCancelEdit = () => {
    this.setState({
      modalVisible: false,
    });
  };

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
        this.delPending = UserDao.removeUser({ id: record.id });
        const result = await this.delPending;
        this.refreshList(result);
      },
    });
  }

  lockBackendUser = (user) => {
    Modal.confirm({
      title: '确定锁定该用户吗？',
      content: '用户被锁定后将无法登录',
      onOk: async () => {
        this.lockPending && this.lockPending.cancel();
        this.setState({
          loading: true,
        });
        this.lockPending = UserDao.lock(user.id);
        const result = await this.lockPending;
        this.refreshList(result);
      },
    });
  }

  unlockBackendUser = async (user) => {
    this.unlockPending && this.unlockPending.cancel();
    this.setState({
      loading: true,
    });
    this.unlockPending = UserDao.unlock(user.id);
    const result = await this.unlockPending;
    this.refreshList(result);
  }

  refreshList = (result) => {
    if (result.code === 0) {
      message.success('操作成功');
      console.log('5555', result);
      this.loadPaginationData(this.context.location.query);
    } else {
      this.setState({
        loading: false,
      });
      message.error(result.msg);
    }
  }

  render() {
    const columns = [
      {
        title: '姓名',
        dataIndex: 'name',
      }, {
        title: '角色',
        dataIndex: 'role',
        render: () => <div>TODO</div>,
      }, {
        title: '手机号码',
        dataIndex: 'mobile',
        key: 'mobile',
      }, {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
      }, {
        title: '创建时间',
        dataIndex: 'createDate',
        key: 'createDate',
        render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
      }, {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (text) => {
          return (
            <Badge {...userStatus[text]} />
          );
        },
      }, {
        title: '操作',
        dataIndex: 'operation',
        width: 150,
        render: (text, record) => (
          <div>
            <a className="margin-right" onClick={this.handleEditClick.bind(this, record)}>编辑</a>
            <a className="margin-right" onClick={this.handleLockUser.bind(this, record)}>{record.status === 'NORMAL' ? '冻结' : '解冻' }</a>
            <a onClick={this.handleDeleteUser.bind(this, record)}>删除</a>
          </div>
        ),
      },
    ];
    const { current, total, pageSize } = this.state;
    const query = this.context.location.query;
    return (
      <div style={{ margin: '16px' }}>
        <Filter filter={query} onAdd={this.handleAdd} onSearch={this.handleSearch} onFilterChange={this.handleFilterChange} />
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
        <EditModal
          item={this.state.modalType === 'edit' ? this.state.currentItem : {}}
          type={this.state.modalType}
          visible={this.state.modalVisible}
          submitting={this.state.submitting}
          roles={this.state.roles}
          onOk={this.handelSubmitEdit}
          onCancel={this.handelCancelEdit}
        />
      </div>
    );
  }
}
