import request from '../utils/request';
import { api } from './api';

export default {
  fetchItems: data => request({ url: api.userItems, method: 'post', data }),
  fetchDetail: data => request({ url: api.userDetail, method: 'post', data }),
  fetchCapital: data => request({ url: api.userCapital, method: 'post', data }),
  fetchPurchase: data => request({ url: api.userPurchase, method: 'post', data }),
  fetchTrade: data => request({ url: api.userTrade, method: 'post', data }),
  changeMobile: data => request({ url: api.userChangeMobile, method: 'post', data }),
};
