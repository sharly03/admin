import request from '../utils/request';
import { api } from './api';
import { USER_INFO_KEY } from '../utils/constants';
import menu from './mock/menu';

export default {
  fetchMenu() {
    return new Promise((resolve) => {
      resolve({ data: menu });
    });
  },

  fetchQiniuToken(data = { fileType: 'images', isPublic: 1 }) {
    return request({
      url: api.qiniuToken,
      method: 'post',
      data,
    });
  },

  fetchTestQiniuToken() {
    return request({
      url: api.qiniuTestToken,
    });
  },
  login(data) {
    return request({
      url: api.userLogin,
      method: 'post',
      data,
    });
  },
  fetchUserInfo() {
    return request({
      url: api.userInfo,
    });
  },
  updateCurrentUser(userInfo) {
    window.localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  },

  getCurrentUser() {
    const userStr = window.localStorage.getItem(USER_INFO_KEY);
    if (!userStr) return { name: '未登录' };
    return JSON.parse(userStr);
  },


};
