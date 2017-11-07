// const Random = Mock.Random;

// 列表
export const partnerDataList = {
  code: 0,
  msg: 'ok',
  data: {
    'content|0-20': [{
      'id|+1': 0,
      type: /(企业)|(个人)/,
      partnerName: '@cname',
      creditLine: /\d{1,8}/,
      remainingLine: /\d{1,8}/,
      createTime: '@date("yyyy-MM-dd")',
    }],
    pageIndex: 1,
    pageSize: 20,
    totalRowsCount: 20,
  },
};
// 详情
export const partnerDataDetail = {
  code: 0,
  msg: 'success',
  data: {
    cooperativeUserVO: {
      id: /\d{1,4}/,
      userType: /(企业)|(个人)/,
      name: '@cname',
      displayName: '@cname',
      registeredCapital: /\d{1,10}/,
      registrationDate: '@date("yyyy-MM-dd")',
      businessScope: /(电子商务)|(电子政务系统开发与应用服务)|(网络商务服务)|(数据库服务)/,
    },
    creditGuarantee: {
      creditLine: /\d{1,8}/,
      guguaranteeUsers: '深圳市后河财富金融服务有限公司',
      projectCooperative: '深圳市后河财富金融服务有限公司',
    },
    aduitInformation: {
      isChecked: true,
    },
    auditMaterial: {
      image: 'FgALBgr0p_Ni6Qf724viXO3VnbmF',
    },
  },
};
