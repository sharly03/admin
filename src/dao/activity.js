import request from '../utils/request';
import { api } from './api';

export default {
  fetch(data = {}) {
    return request({
      url: api.activityList,
      method: 'get',
      data,
    });
  },
  add(data) {
    return request({
      url: api.addActivity,
      method: 'post',
      data,
    });
  },
  edit(data) {
    return request({
      url: api.editActivity,
      method: 'post',
      data,
    });
  },
  detail(data) {
    return request({
      url: api.activityDetail,
      data,
    });
  },
  remove(id) {
    return request({
      url: api.deleteActivity,
      method: 'post',
      data: {
        id,
      },
    });
  },
  changeDisplayStatus(id) {
    return request({
      url: api.changeActivityDisplayStatus,
      method: 'post',
      data: {
        id,
      },
    });
  },
  qualificationList(data = {}) {
    return request({
      url: api.activityQualificationList,
      method: 'get',
      data,
    });
  },
  sendMaterialGift(data) {
    return request({
      url: api.sendMaterialGift,
      method: 'post',
      data,
    });
  },
  searchResourceApi(data) {
    return request({
      url: api.searchResourceApi,
      method: 'get',
      data,
    });
  },
};
