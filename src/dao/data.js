import request from '../utils/request';
import { api } from './api';

export default {
  fetch(data = {}) {
    return request({
      url: api.dataList,
      method: 'get',
      data,
    });
  },
  add(data) {
    return request({
      url: api.dataAdd,
      method: 'post',
      data,
    });
  },
  delete(id) {
    return request({
      url: api.dataDelete,
      method: 'post',
      data: {
        id,
      },
    });
  },
};
