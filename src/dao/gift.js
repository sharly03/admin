import request from '../utils/request';
import { api } from './api';

export default {
  fetch(data) {
    return request({
      url: api.giftList,
      method: 'get',
      data,
    });
  },
  addGift(data) {
    return request({
      url: api.addGift,
      method: 'post',
      data,
    });
  },
  editGift(data) {
    return request({
      url: api.editGift,
      method: 'post',
      data,
    });
  },
  deleteGift(id) {
    return request({
      url: api.deleteGift,
      method: 'post',
      data: {
        id,
      },
    });
  },
  fetchGiftCodes(data) {
    return request({
      url: api.giftCodeList,
      method: 'get',
      data,
    });
  },
  addGiftCodes(data) {
    return request({
      url: api.addGiftCodes,
      method: 'post',
      data,
    });
  },
  downloadAcquireCode(data) {
    return request({
      url: api.downloadAcquireCode,
      method: 'get',
      data,
    });
  },
};
