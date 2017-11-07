export const commodityQuery = {
  code: 0,
  msg: 'ok',
  data: {
    'items|0-10': [{
      'id|+1': 0,
      commodityNo: '@string',
      financialType: '@string',
      commodityType: /0[1-3]/,
      totalAmount: '@float(0, 10000000, 0, 2)',
      annualRate: '@float(0, 15, 0, 1)',
      repayStyle: /0[1-3]/,
      buyBeginTime: '@datetime("T")',
      buyEndTime: '@datetime("T")',
      incomeBeginDate: '@datetime("T")',
      incomeEndDate: '@datetime("T")',
      status: /0[1-4]/,
    }],
    pageIndex: '@integer(1, 100)',
    pageSize: 20,
    pagesCount: 1,
    totalRowsCount: '@integer(0, 10000)',
  },
};
