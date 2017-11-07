import request from '../utils/request';
import { api } from './api';
// import menu from './mock/menu';

export default {
  fetchPositions() {
    return request({
      url: api.adPositions,
      method: 'post',
      // method: 'post',
    });
  },

  // 获取广告列表
  fetchAdv(data = {}) {
    return request({
      url: api.advList,
      method: 'post',
      data,
    });
  },
  addAdv(data) {
    return request({
      url: api.addAdv,
      method: 'post',
      data,
    });
  },
  editAdv(data) {
    return request({
      url: api.editAdv,
      method: 'post',
      data,
    });
  },
  deleteAdv(data) {
    return request({
      url: api.deleteAdv,
      method: 'post',
      data,
    });
  },
};
