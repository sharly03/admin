import request from '../utils/request';
import { api } from './api';
// import menu from './mock/menu';

export default {
  fetch(data = {}) {
    return request({
      url: api.newsList,
      method: 'get',
      data,
    });
  },
  add(data) {
    return request({
      url: api.addNews,
      method: 'post',
      data,
    });
  },
  edit(data) {
    return request({
      url: api.editNews,
      method: 'post',
      data,
    });
  },
  detail(data) {
    return request({
      url: api.newsDetail,
      data,
    });
  },
  remove(id) {
    return request({
      url: api.deleteNews,
      method: 'post',
      data: {
        id,
      },
    });
  },
  recommendOperation(id, isRecommend = false) {
    return request({
      url: isRecommend ? api.recommendNews : api.unrecommendNews,
      method: 'post',
      data: {
        id,
      },
    });
  },
};
