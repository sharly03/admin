import request from '../utils/request';
import { api } from './api';
// import menu from './mock/menu';

export default {
  fetch(data = {}) {
    return request({
      url: api.backendUsers,
      method: 'post',
      data,
    });
  },
  lock(userId) {
    return request({
      url: api.lockUser,
      method: 'post',
      data: {
        id: userId,
      },
    });
  },
  unlock(userId) {
    return request({
      url: api.unlockUser,
      method: 'post',
      data: {
        id: userId,
      },
    });
  },
  fetchRoles() {
    return request({ url: api.roles });
  },
  saveUser(data) {
    const url = data.id ? api.editBackendUser : api.addBackendUser;
    return request({ url, method: 'post', data });
  },
  removeUser(data) {
    return request({ url: api.removeBackendUser, method: 'post', data });
  },
};
