export const refundQuery = {
  code: 0,
  msg: 'ok',
  data: {
    'items|0-10': [{
      'id|+1': 0,
      commodityCode: '@string',
      realSettlePrincipal: '@float(0, 10000000, 0, 2)',
      periods: '@integer(0, 100)',
      remainSequence: '@integer(0, 100)',
      overduePenaltyDays: '@integer(0, 100)',
      advancePenaltyDays: '@integer(0, 100)',
      couponAmount: '@float(0, 10000000, 0, 2)',
      incomeEndDate: '@datetime("T")',
      refundStatusCode: '@pick(["WS","SF","WR","IR","RF","RS"])',
    }],
    pageIndex: '@integer(1, 100)',
    pageSize: 20,
    pagesCount: 1,
    totalRowsCount: '@integer(0, 10000)',
  },
};

export const refundPeriods = {
  code: 0,
  msg: 'ok',
  data: {
    'items|0-10': [{
      'id|+1': 0,
      commodityCode: '@string',
      realSettlePrincipal: '@float(0, 10000000, 0, 2)',
      realSettleIncome: '@float(0, 10000000, 0, 2)',
      sequence: '@integer(0, 100)',
      overduePenaltyAmount: '@float(0, 10000000, 0, 2)',
      advancePenaltyAmount: '@float(0, 10000000, 0, 2)',
      couponAmount: '@float(0, 10000000, 0, 2)',
      refundPersonCount: '@integer(0, 100)',
      incomeEndDate: '@datetime("T")',
      settleStatus: '@pick(["WS","SF","WR","IR","RF","RS"])',
      refundStatusCode: '@pick(["WS","SF","WR","IR","RF","RS"])',
    }],
    pageIndex: '@integer(1, 100)',
    pageSize: 20,
    pagesCount: 1,
    totalRowsCount: '@integer(0, 10000)',
  },
};

export const refundRecord = {
  code: 0,
  msg: 'ok',
  data: {
    'items|0-10': [{
      'id|+1': 0,
      commodityCode: '@string',
      periods: '@integer(0, 100)',
      name: '@cname',
      mobile: /^1[3-8]\d{9}$/,
      settledPrincipal: '@float(0, 10000000, 0, 2)',
      settledIncome: '@float(0, 10000000, 0, 2)',
      overduePenaltyAmount: '@float(0, 10000000, 0, 2)',
      advancePenaltyAmount: '@float(0, 10000000, 0, 2)',
      couponSettledIncome: '@float(0, 10000000, 0, 2)',
      tradeStatus: '@pick(["WS","SF","WR","IR","RF","RS"])',
    }],
    pageIndex: '@integer(1, 100)',
    pageSize: 20,
    pagesCount: 1,
    totalRowsCount: '@integer(0, 10000)',
  },
};
