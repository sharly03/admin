import request from '../utils/request';
import { api } from './api';

export default {
  fetchList: data => request({ url: api.productList, method: 'post', data }),
  portionMaintain: data => request({ url: api.portionMaintain, method: 'post', data }),
  submitAudit: data => request({ url: api.submitAudit, method: 'post', data }),
  upAndDownShelf: data => request({ url: api.upAndDownShelf, method: 'post', data }),
  fullFlow: data => request({ url: api.fullFlow, method: 'post', data }),
  orderList: data => request({ url: api.orderList, method: 'post', data }),
  orderCancel: data => request({ url: api.orderCancel, method: 'post', data }),
};
