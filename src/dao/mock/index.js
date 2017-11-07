/* eslint-disable no-unused-vars */
import Mock from 'mockjs';

import { api } from '../api';
import { positions, adList } from './banner';
import { userItems, userDetail, capitalDetail, purchaseRecord, tradeRecord } from './user';
import { refundQuery, refundPeriods, refundRecord } from './refund';
import { commodityQuery } from './commodity';
import { productList, orderList, portionMaintain } from './sale';
import { roles } from './auth';
import { partnerDataList, partnerDataDetail } from './partner';


// Mock.mock(new RegExp(api.users), userData);
const saveSuccess = {
  code: 0,
  msg: 'ok',
};
const token = {
  code: 0,
  msg: 'ok',
  token: '',
};

// 广告管理
// Mock.mock(new RegExp(api.adPositions), positions);
// Mock.mock(new RegExp(api.advList), adList);
// Mock.mock(new RegExp(api.addAdv), saveSuccess);
// Mock.mock(new RegExp(api.qiniuToken), token);

// 用户管理

// Mock.mock(new RegExp(api.backendUsers), backendUsers);
// Mock.mock(new RegExp(api.editBackendUser), saveSuccess);
// Mock.mock(new RegExp(api.removeBackendUser), saveSuccess);
// Mock.mock(new RegExp(api.unlockUser), saveSuccess);
// Mock.mock(new RegExp(api.lockUser), saveSuccess);
Mock.mock(new RegExp(api.roles), roles);

// Mock.mock(new RegExp(api.userItems), userItems);
// Mock.mock(new RegExp(api.userDetail), userDetail);
// Mock.mock(new RegExp(api.userCapital), capitalDetail);
// Mock.mock(new RegExp(api.userPurchase), purchaseRecord);
// Mock.mock(new RegExp(api.userTransaction), tradeRecord);
// Mock.mock(new RegExp(api.userDetail), userDetail);
// Mock.mock(new RegExp(api.userCapital), capitalDetail);
// Mock.mock(new RegExp(api.userPurchase), purchaseRecord);
// Mock.mock(new RegExp(api.userTrade), tradeRecord);
// Mock.mock(new RegExp(api.userChangeMobile), saveSuccess);


// 标的管理
// Mock.mock(new RegExp(api.commodityQuery), commodityQuery);

// 销售管理
// Mock.mock(new RegExp(api.productList), productList);
// Mock.mock(new RegExp(api.orderList), orderList);
// Mock.mock(new RegExp(api.orderCancel), saveSuccess);
// Mock.mock(new RegExp(api.portionMaintain), saveSuccess);
// Mock.mock(new RegExp(api.upAndDownShelf), saveSuccess);
// Mock.mock(new RegExp(api.fullFlow), saveSuccess);

// 还款管理
// Mock.mock(new RegExp(api.refundQuery), refundQuery);
// Mock.mock(new RegExp(api.refundPeriods), refundPeriods);
// Mock.mock(new RegExp(api.refundRecord), refundRecord);
// Mock.mock(new RegExp(api.refundSubmit), saveSuccess);

// 合作方管理
// Mock.mock(new RegExp(api.partnerDataList), partnerDataList);
// Mock.mock(new RegExp(api.partnerDataDetail), partnerDataDetail);

