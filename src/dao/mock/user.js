/* eslint-disable */
import queryString, { extract } from 'query-string';

// 用户列表
export const userItems = {
  code: 0,
  msg: 'ok',
  data: {
    'items|0-20': [{
      'id|+1': 0,
      mobile: /1[3-8]\d{9}/,
      name: '@cname',
      idCard: /\d{15,17}[\dX]/,
      bindCardStatus: '@boolean',
      registerTime: '@datetime("T")',
      totalAssets: '@float(0, 10000000, 0, 2)',
    }],
    pageIndex: '@integer(1, 100)',
    pageSize: 20,
    pagesCount: 1,
    totalRowsCount: '@integer(0, 10000)',
  },
};

export const getUserItems = options => {
  // const { type, url, body } = options;
  const query = queryString.parse(extract(options.url));
  return userItems;
};


// 用户详情
export const userDetail = {
  code: 0,
  msg: 'success',
  data: {
    userInfo: {
      id: /\d{1,4}/,
      mobile: /1[3-8]\d{9}/,
      name: '@cname',
      age: '@integer(18, 100)',
      sex: /[男女]/,
      idCard: /^\d{6} \*{4} \*{4} \d{3}[\dX]$/,
      bindCardStatus: '@boolean',
      registerTime: '@datetime("T")',
      totalAssets: '@float(0, 10000000, 0, 2)',
    },
    userAccountInfoVo: {
      accountRemaining: '@float(0, 10000000, 0, 2)',
      amountTotal: '@float(0, 10000000, 0, 2)',
      freezeMoney: '@float(0, 10000000, 0, 2)',
      payments: '@float(0, 10000000, 0, 2)',
      totalIncome: '@float(0, 10000000, 0, 2)',
      balance: '@float(0, 10000000, 0, 2)',
      rechargeAmount: '@float(0, 10000000, 0, 2)',
    },
    superviseAccount: {
      reservedMobileNo: /1[3-8]\d{9}/,
      eCardNo: /\d{10}/,
      superviseAccountStatus: /(已开户)|(未开户)/,
      openAccountTime: '@datetime("T")',
      bankName: '中国建设银行',
      openAccountPlace: '广东省深圳市',
      subbranchBank: '中国建设银行深圳支行',
      bankNo: /\d{4} \*{4} \*{4} \d{4}/,
    },
  },
};

// 资产明细
export const capitalDetail = {
  code: 0,
  message: 'success',
  data: {
    'items|0-10': [{
      purchaseOrderId: /[A-Z\d]{12}/,
      commodityNo: /\d{4}/,
      orderAmount: '@float(0, 100000, 0, 2)',
      purchaseDate: '@datetime("T")',
      incomeBeginDate: '@datetime("T")',
      incomeEndDate: '@datetime("T")',
      usedVoucher: '优惠券信息',
      statusCode: 'WAITING_INCOME',
      statusDesc: '成功',
    }],
    pageIndex: '@integer(1, 100)',
    pageSize: 10,
    pagesCount: 1,
    totalRowsCount: '@integer(0, 10000)',
  },
};

// 购买记录
export const purchaseRecord = {
  code: 0,
  message: 'success',
  data: {
    'items|0-10': [{
      purchaseOrderId: /[A-Z\d]{12}/,
      commodityNo: /\d{4}/,
      orderAmount: '@float(0, 100000, 0, 2)',
      purchaseDate: '@datetime("T")',
      incomeBeginDate: '@datetime("T")',
      incomeEndDate: '@datetime("T")',
      usedVoucher: '优惠券信息',
      statusCode: 'success',
      statusDesc: '成功',
    }],
    pageIndex: '@integer(1, 100)',
    pageSize: 10,
    pagesCount: 1,
    totalRowsCount: '@integer(0, 10000)',
  },
};

// 交易记录
export const tradeRecord = {
  code: 0,
  message: 'success',
  data: {
    'items|0-10': [{
      orderNo: /[A-Z\d]{12}/,
      tradeAmount: '@float(0, 100000, 0, 2)',
      tradeDate: '@datetime("T")',
      tradeStatus: 'success',
      tradeStatusDesc: '提现失败',
      tradeNo: /[A-Z\d]{12}/,
    }],
    pageIndex: '@integer(1, 100)',
    pageSize: 10,
    pagesCount: 1,
    totalRowsCount: '@integer(0, 10000)',
  },
};
