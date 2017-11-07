import request from '../utils/request';
import { api } from './api';

export default {
  fetchList: data => request({ url: api.loanList, method: 'post', data }),
  loanDetail: data => request({ url: api.loanDetail, method: 'post', data }),
  auditRequest: data => request({ url: api.auditRequest, method: 'post', data }),
  loanExecute: data => request({ url: api.loanExecute, method: 'post', data }),
  fullFlow: data => request({ url: api.fullFlow, method: 'post', data }),
};
