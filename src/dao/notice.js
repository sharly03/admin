import request from '../utils/request';
import { api } from './api';
// import menu from './mock/menu';

export default {
  fetch() {
    return request({
      url: api.noticeList,
      method: 'get',
      // method: 'post',
    });
  },
  add(data) {
    return request({
      url: api.addNotice,
      method: 'post',
      data,
    });
  },

};
