export const productList = {
  code: 0,
  msg: 'ok',
  data: {
    'items|0-10': [{
      'id|+1': 0,
      commodityCode: '@string',
      contractNo: '@string',
      totalAmount: '@float(0, 10000000, 0, 2)',
      annualRate: '@float(0, 15, 0, 1)',
      saledAmount: '@float(0, 10000000, 0, 2)',
      buyEndDate: '@datetime("T")',
      buyBeginDate: '@datetime("T")',
      salesTargetCode: '@pick(["all","part","enterprise"])',
      status: '@pick(["GS_100","GS_200","GS_300","GS_400","GS_410",,"GS_520","GS_530"])',
    }],
    pageIndex: '@integer(1, 100)',
    pageSize: 20,
    pagesCount: 1,
    totalRowsCount: '@integer(0, 10000)',
  },
};

export const orderList = {
  code: 0,
  msg: 'ok',
  data: {
    'items|0-10': [{
      'id|+1': 0,
      commodityCode: '@string',
      userMobile: /^1[3-8]\d{9}$/,
      orderAmount: '@float(0, 10000000, 0, 2)',
      purchaseDate: '@datetime("T")',
      statusCode: '@pick(["success","fail","process","GS_520"])',
      statusDesc: '状态描述',
      allowCancelflag: '@boolean',
    }],
    pageIndex: '@integer(1, 100)',
    pageSize: 20,
    pagesCount: 1,
    totalRowsCount: '@integer(0, 10000)',
  },
};
