import request from '../utils/request';
import { api } from './api';

export default {
  fetchCommodity: data => request({ url: api.commodityQuery, method: 'post', data }),
  commodityDetail: data => request({ url: api.commodityDetail, method: 'post', data }),
  commoditySubmit: data => request({ url: api.commoditySubmit, method: 'post', data }),
  commoditySend: data => request({ url: api.commoditySend, method: 'post', data }),
  commodityAudit: data => request({ url: api.commodityAudit, method: 'post', data }),
  fetchAssets: data => request({ url: api.fetchAssets, method: 'post', data }),
  fetchContracts: data => request({ url: api.fetchContracts, method: 'post', data }),
  baseUpdate: data => request({ url: api.baseUpdate, method: 'post', data }),
  templateList: data => request({ url: api.templateList, method: 'post', data }),
};
