import request from '../utils/request';
import { api } from './api';
// import menu from './mock/menu';

export default {
  fetch(data = {}) {
    return request({
      url: api.reportList,
      method: 'get',
      data,
      // method: 'post',
    });
  },
  add(data) {
    return request({
      url: api.addReport,
      method: 'post',
      data,
    });
  },
  edit(data) {
    return request({
      url: api.editReport,
      method: 'post',
      data,
    });
  },
  remove(data) {
    return request({
      url: api.deleteReport,
      method: 'post',
      data,
    });
  },
  detail(data) {
    return request({
      url: api.reportDetail,
      method: 'get',
      data,
    });
  },
};
