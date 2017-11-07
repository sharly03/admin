import request from '../utils/request';
import { api } from './api';

export default {
  removeUser(data) {
    return request({ url: api.removeBackendUser, method: 'post', data });
  },
};
