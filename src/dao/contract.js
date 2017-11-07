import request from '../utils/request';
import { api } from './api';

export default {
  fetchItems: data => request({ url: api.contractItems, method: 'post', data }),
  fetchDetail: data => request({ url: api.contractDetail, method: 'post', data }),
  contractAdd: data => request({ url: api.contractAdd, method: 'post', data }),
  bankItem: data => request({ url: api.bankItem, method: 'post', data }),
  cityItem: data => request({ url: api.cityItem, method: 'post', data }),
  assetSummary: data => request({ url: api.assetSummary, method: 'post', data }),
  selectBranch: data => request({ url: api.selectBranch, method: 'post', data }),
  modifyAsset: data => request({ url: api.modifyAsset, method: 'post', data }),
};

