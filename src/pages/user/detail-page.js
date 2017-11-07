import React from 'react';
import { message, Tabs, Popover, Icon, Badge } from 'antd';
import DetailList from './detail-list';
import { PageList } from '../../components/page-list';
import dao from '../../dao/user';
import { queryTo, parseParam } from '../../utils/location-helper';
import { formatDecimal2, dateFormat, datetimeFormat } from '../../utils/index';

import styles from './detail.less';

const TabPane = Tabs.TabPane;

const sexStatus = {
  '01': '女',
  '02': '男',
};
const openAccountStatus = {
  '01': { text: '未开户', status: 'error' },
  '02': { text: '已开户', status: 'success' },
};
const statusCodeList = {
  PAYING: { text: '支付中', status: 'processing' },
  WAITING_INCOME: { text: '等待起息', status: 'processing' },
  REFUNDING: { text: '回款中', status: 'processing' },
  WAITING_SETTLE: { text: '等待结算', status: 'processing' },
  REFUNDED: { text: '已回款', status: 'success' },
  BUY_FAILED: { text: '购买失败', status: 'error' },

  pending: { text: '未处理', status: 'default' },
  process: { text: '处理中', status: 'processing' },
  fail: { text: '失败', status: 'error' },
  success: { text: '成功', status: 'success' },
  other: { text: '其他', status: 'default' },
  cancel_success: { text: '取消成功', status: 'success' },
  cancel_fail: { text: '取消失败', status: 'error' },
  cancel_process: { text: '取消处理中', status: 'processing' },
  GS_520: { text: '已流标', status: 'default' },
  flow_fail: { text: '流标失败', status: 'error' },
  flow_process: { text: '流标处理中', status: 'processing' },
};

class UserDetail extends React.Component {
  state = {
    loading: false,
    // 用户信息
    userInfo: {},
    userAccountInfoVo: {},
    superviseAccount: {},
    // Tab分页参数
    capitalPagination: {},
    purchasePagination: {},
    rechargePagination: {},
    withdrawPagination: {},
    // Tab数据
    capitalSource: [],
    purchaseSource: [],
    rechargeSource: [],
    withdrawSource: [],
  };

  componentDidMount() {
    // 获取URI中的参数（第一次加载或刷新时）
    const { userId, key, ...remindItems } = parseParam(location.search);
    this.fetchItems({ userId });
    const query = {
      ...remindItems,
      userId,
    };
    // 根据key值来确定获取哪一个Tab的数据
    switch (key) {
      case 'capital':
        this.fetchCapital(query);
        break;
      case 'purchase':
        this.fetchPurchase(query);
        break;
      case 'recharge':
        this.fetchRecharge({ ...query, czbTradeTypeCode: '01' });
        break;
      case 'withdraw':
        this.fetchWithdraw({ ...query, czbTradeTypeCode: '02' });
        break;
      default:
        this.fetchCapital(query);
    }
  }
  componentWillUnmount() {
    this.initPending && this.initPending.cancel();
    this.capitalPending && this.capitalPending.cancel();
    this.purchasePending && this.purchasePending.cancel();
    this.rechangePending && this.rechangePending.cancel();
    this.withdrawPending && this.withdrawPending.cancel();
    this.setLoading(false);
  }

  setLoading(loading) {
    this.setState({ loading });
  }

  async fetchItems(query) {
    this.initPending && this.initPending.cancel();
    this.initPending = dao.fetchDetail(query);
    const data = await this.initPending;
    if (data.code === 0) {
      const { userInfo, userAccountInfoVo, superviseAccount } = data.data;
      this.setState({ userInfo, userAccountInfoVo, superviseAccount });
    } else {
      message.error(data.msg || '加载用户数据失败');
    }
  }
  async fetchCapital(query) {
    this.capitalPending && this.capitalPending.cancel();
    this.capitalPending = dao.fetchCapital({ ...query, pageSize: query.pageSize || 10 });
    this.setLoading(true);
    const data = await this.capitalPending;
    this.setLoading(false);
    if (data.code === 0) {
      const { items, totalRowsCount } = data.data;
      const capitalPagination = {
        total: totalRowsCount,
        current: parseInt(query.pageIndex, 10) || 1,
        pageSize: parseInt(query.pageSize, 10) || 10,
      };
      this.setState({ capitalSource: items, capitalPagination });
    } else {
      message.error(data.msg || '加载用户数据失败');
    }
  }
  async fetchPurchase(query) {
    this.purchasePending && this.purchasePending.cancel();
    this.purchasePending = dao.fetchPurchase({ ...query, pageSize: query.pageSize || 10 });
    this.setLoading(true);
    const data = await this.purchasePending;
    this.setLoading(false);
    if (data.code === 0) {
      const { items, totalRowsCount } = data.data;
      const purchasePagination = {
        total: totalRowsCount,
        current: parseInt(query.pageIndex, 10) || 1,
        pageSize: parseInt(query.pageSize, 10) || 10,
      };
      this.setState({ purchaseSource: items, purchasePagination });
    } else {
      message.error(data.msg || '加载用户数据失败');
    }
  }
  async fetchRecharge(query) {
    this.rechangePending && this.rechangePending.cancel();
    this.rechangePending = dao.fetchTrade({ ...query, pageSize: query.pageSize || 10 });
    this.setLoading(true);
    const data = await this.rechangePending;
    this.setLoading(false);
    if (data.code === 0) {
      const { items, totalRowsCount } = data.data;
      const rechargePagination = {
        total: totalRowsCount,
        current: parseInt(query.pageIndex, 10) || 1,
        pageSize: parseInt(query.pageSize, 10) || 10,
      };
      this.setState({ rechargeSource: items, rechargePagination });
    } else {
      message.error(data.msg || '加载用户数据失败');
    }
  }
  async fetchWithdraw(query) {
    this.withdrawPending && this.withdrawPending.cancel();
    this.withdrawPending = dao.fetchTrade({ ...query, pageSize: query.pageSize || 10 });
    this.setLoading(true);
    const data = await this.withdrawPending;
    this.setLoading(false);
    if (data.code === 0) {
      const { items, totalRowsCount } = data.data;
      const withdrawPagination = {
        total: totalRowsCount,
        current: parseInt(query.pageIndex, 10) || 1,
        pageSize: parseInt(query.pageSize, 10) || 10,
      };
      this.setState({ withdrawSource: items, withdrawPagination });
    } else {
      message.error(data.msg || '加载用户数据失败');
    }
  }
  async changeMobile(query) {
    this.changeMobilePendding && this.changeMobilePendding.cancel();
    this.changeMobilePendding = dao.changeMobile(query);
    const data = await this.changeMobilePendding;
    if (data.code === 0) {
      const userInfo = this.state.userInfo;
      this.setState({
        userInfo: {
          ...userInfo,
          mobile: query.mobile,
        },
      });
      message.success('修改成功');
    } else {
      message.error(data.msg || '修改失败');
    }
  }

  handleModifyMobile = mobile => {
    const localMobile = this.state.userInfo.mobile;
    if (localMobile === mobile) return;
    const { userId } = parseParam(location.search);
    this.changeMobile({ userId, mobile });
  };
  handleTabsChange = key => {
    const { userId } = parseParam(location.search);
    let pageIndex;
    let pageSize;
    switch (key) {
      case 'capital':
        pageIndex = this.state.capitalPagination.current;
        pageSize = this.state.capitalPagination.pageSize;
        !pageIndex && this.fetchCapital({ userId });
        break;
      case 'purchase':
        pageIndex = this.state.purchasePagination.current;
        pageSize = this.state.purchasePagination.pageSize;
        !pageIndex && this.fetchPurchase({ userId });
        break;
      case 'recharge':
        pageIndex = this.state.rechargePagination.current;
        pageSize = this.state.rechargePagination.pageSize;
        !pageIndex && this.fetchRecharge({ userId, czbTradeTypeCode: '01' });
        break;
      case 'withdraw':
        pageIndex = this.state.withdrawPagination.current;
        pageSize = this.state.withdrawPagination.pageSize;
        !pageIndex && this.fetchWithdraw({ userId, czbTradeTypeCode: '02' });
        break;
      default:
        pageIndex = this.state.capitalPagination.current;
        pageSize = this.state.capitalPagination.pageSize;
        !pageIndex && this.fetchCapital({ userId });
    }
    // 在URI中添加key参数
    queryTo(location, { userId, key, pageIndex, pageSize }, true);
  };
  handleTableChange = (pageIndex, pageSize) => {
    const { key, ...remindItems } = parseParam(location.search);
    queryTo(location, { ...remindItems, key, pageIndex, pageSize }, true);
    switch (key) {
      case 'capital':
        this.fetchCapital({ ...remindItems, pageIndex, pageSize });
        break;
      case 'purchase':
        this.fetchPurchase({ ...remindItems, pageIndex, pageSize });
        break;
      case 'recharge':
        this.fetchRecharge({ ...remindItems, czbTradeTypeCode: '01', pageIndex, pageSize });
        break;
      case 'withdraw':
        this.fetchWithdraw({ ...remindItems, czbTradeTypeCode: '02', pageIndex, pageSize });
        break;
      default:
        this.fetchCapital({ ...remindItems, pageIndex, pageSize });
    }
  };

  render() {
    const {
      loading,
      // 用户信息
      userInfo,
      userAccountInfoVo,
      superviseAccount,
      // Tab
      capitalSource,
      purchaseSource,
      rechargeSource,
      withdrawSource,
      capitalPagination,
      purchasePagination,
      rechargePagination,
      withdrawPagination,
    } = this.state;
    const { key = 'capital' } = parseParam(location.search);

    const userLists = [
      { key: 'name', label: '用户姓名', render: text => text || '--' },
      {
        key: 'mobile',
        label: '注册手机号',
        editable: true,
        rule: { message: '请正确填写手机号', pattern: /^1[3-8]\d{9}$/ },
        onSave: this.handleModifyMobile,
      },
      { key: 'id', label: '用户ID' },
      { key: 'idCard', label: '身份证号', render: text => text || '--' },
      { key: 'sex', label: '性别', render: text => (text ? sexStatus[text] : '--') },
      { key: 'age', label: '年龄', render: text => text || '--' },
      { key: 'registerTime', label: '注册时间', render: text => text && datetimeFormat(text) },
    ];
    const userAccountLists = [
      { key: 'total', label: '总资产（元）', render: text => formatDecimal2(text) },
      { key: 'pendingAmount', label: '待回款本金（元）', render: text => formatDecimal2(text) },
      { key: 'frozenAmount', label: '冻结金额（元）', render: text => formatDecimal2(text) },
      { key: 'accountBalance', label: '账户余额（元）', render: text => formatDecimal2(text) },
      { key: 'accountRemaining', label: '可提现金额（元）', render: text => formatDecimal2(text) },
      { key: 'accumulatedIncome', label: '累计收益（元）', render: text => formatDecimal2(text) },
    ];
    const superviseAccountLists = [
      { key: 'superviseAccountStatus', label: '开户状态', render: text => (text ? openAccountStatus[text].text : '--') },
      { key: 'eCardNo', label: '存管账户', render: text => text || '--' },
      { key: 'openAccountTime', label: '开户时间', render: text => (text ? datetimeFormat(text) : '--') },
      { key: 'bankName', label: '开户银行', render: text => text || '--' },
      { key: 'bankNo', label: '银行卡号', render: text => text || '--' },
      { key: 'reservedMobileNo', label: '银行预留手机号', render: text => text || '--' },
      { key: 'openAccountPlace', label: '开卡省市', render: text => text || '--' },
      { key: 'subbranchBank', label: '开卡支行', render: text => text || '--' },
    ];

    const capitalColumns = [
      { dataIndex: 'purchaseDate', title: '投资时间', render: text => datetimeFormat(text) },
      { dataIndex: 'purchaseOrderId', title: '订单号' },
      { dataIndex: 'commodityNo', title: '标的编号' },
      { dataIndex: 'orderAmount', title: '投资金额（元）', className: 'align-right', render: text => formatDecimal2(text) },
      { dataIndex: 'usedVoucher', title: '优惠券', render: text => text || '--' },
      {
        dataIndex: 'incomeDate',
        title: '收益期',
        render: (text, { incomeBeginDate, incomeEndDate }) => `${dateFormat(incomeBeginDate)}~${dateFormat(incomeEndDate)}`,
      },
      { dataIndex: 'statusCode', title: '状态', render: text => <Badge {...statusCodeList[text]} /> },
    ];
    const purchaseColumns = [
      { dataIndex: 'purchaseDate', title: '投资时间', render: text => datetimeFormat(text) },
      { dataIndex: 'purchaseOrderId', title: '订单号' },
      { dataIndex: 'commodityNo', title: '标的编号' },
      { dataIndex: 'orderAmount', title: '投资金额（元）', className: 'align-right', render: text => formatDecimal2(text) },
      { dataIndex: 'usedVoucher', title: '优惠券', render: text => text || '--' },
      {
        dataIndex: 'incomeDate',
        title: '收益期',
        render: (text, { incomeBeginDate, incomeEndDate }) => `${dateFormat(incomeBeginDate)}~${dateFormat(incomeEndDate)}`,
      },
      { dataIndex: 'statusCode', title: '状态', render: text => <Badge {...statusCodeList[text]} /> },
      { dataIndex: 'statusDesc', title: '备注', render: text => text || '--' },
    ];
    const rechargeColumns = [
      { dataIndex: 'tradeDate', title: '充值时间', render: text => datetimeFormat(text) },
      { dataIndex: 'orderNo', title: '订单号' },
      { dataIndex: 'tradeNo', title: '交易流水号' },
      { dataIndex: 'tradeAmount', title: '充值金额（元）', className: 'align-right', render: text => formatDecimal2(text) },
      { dataIndex: 'tradeStatus', title: '状态', render: text => <Badge {...statusCodeList[text]} /> },
      { dataIndex: 'tradeStatusDesc', title: '备注', render: text => text || '--' },
    ];
    const withdrawColumns = [
      { dataIndex: 'tradeDate', title: '提现时间', render: text => datetimeFormat(text) },
      { dataIndex: 'orderNo', title: '订单号' },
      { dataIndex: 'tradeNo', title: '交易流水号' },
      { dataIndex: 'tradeAmount', title: '提现金额（元）', className: 'align-right', render: text => formatDecimal2(text) },
      { dataIndex: 'tradeStatus', title: '状态', render: text => <Badge {...statusCodeList[text]} /> },
      { dataIndex: 'tradeStatusDesc', title: '备注', render: text => text || '--' },
    ];

    return (
      <div className={styles['detail-container']}>
        <DetailList title="基本信息" lists={userLists} dataSource={userInfo} />
        <DetailList
          title={
            <span>
              <span style={{ marginRight: '8px' }}>资产信息</span>
              <Popover
                placement="right"
                arrowPointAtCenter
                content={
                  <div>
                    <p>总资产=账户余额+冻结金额+待回款本金</p>
                    <p>账户余额=可提现金额+充值待清算金额-冻结金额</p>
                    <p>冻结金额=购买标的未放款金额</p>
                    <p>累计收益=已收利息总和+奖励总和</p>
                  </div>
                }
              >
                <Icon style={{ cursor: 'pointer' }} type="question-circle" />
              </Popover>
            </span>
          }
          lists={userAccountLists}
          dataSource={userAccountInfoVo}
        />
        <DetailList title="开户信息" lists={superviseAccountLists} dataSource={superviseAccount} />
        <Tabs
          style={{ marginTop: '16px' }}
          activeKey={key}
          onChange={this.handleTabsChange}
          animated={{ inkBar: true, tabPane: false }}
        >
          <TabPane tab="资产明细" key="capital">
            <PageList
              rowKey="id"
              loading={loading}
              columns={capitalColumns}
              dataSource={capitalSource}
              pagination={{
                ...capitalPagination,
                onChange: this.handleTableChange,
              }}
            />
          </TabPane>
          <TabPane tab="购买记录" key="purchase">
            <PageList
              rowKey="id"
              loading={loading}
              columns={purchaseColumns}
              dataSource={purchaseSource}
              pagination={{
                ...purchasePagination,
                onChange: this.handleTableChange,
              }}
            />
          </TabPane>
          <TabPane tab="充值记录" key="recharge">
            <PageList
              rowKey="id"
              loading={loading}
              columns={rechargeColumns}
              dataSource={rechargeSource}
              pagination={{
                ...rechargePagination,
                onChange: this.handleTableChange,
              }}
            />
          </TabPane>
          <TabPane tab="提现记录" key="withdraw">
            <PageList
              rowKey="id"
              loading={loading}
              columns={withdrawColumns}
              dataSource={withdrawSource}
              pagination={{
                ...withdrawPagination,
                onChange: this.handleTableChange,
              }}
            />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default UserDetail;
