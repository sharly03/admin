// import Mock from 'mockjs';

// const Random = Mock.Random;

export const user = {
  name: 'admin',
  role: 'ADMIN',
  uid: 1,
};


export const backendUsers = {
  code: 0,
  msk: 'ok',
  data: {
    'items|0-21': [{
      'id|+1': 0,
      name: '@cname',
      'role|1': ['客服', '运营', '风控'],
      mobile: /1[3-8]\d{9}/,
      email: '@email',
      createTime: 1500065615,
      'status|1': [0, 1],
    }],
    pageIndex: 1,
    pageSize: 20,
    totalRowsCount: 20,
  },
};

export const roles = {
  code: 0,
  msk: 'ok',
  'data|3': [{
    'id|+1': ['8a9a81fe5868e5a6015870ea119f148b', 'mock1', 'mock2'],
    'roleName|+1': ['客服', '运营', '风控'],
    // 'roleCode|1': ['1', '2', '3'],
  }],
};
