import request from '../utils/request';
import { api } from './api';

export default {
  fecthRefund: data => request({ url: api.refundQuery, method: 'post', data }),
  refundPeriods: data => request({ url: api.refundPeriods, method: 'post', data }),
  refundRecord: data => request({ url: api.refundRecord, method: 'post', data }),
  refundSubmit: data => request({ url: api.refundSubmit, method: 'post', data }),
  settleSubmit: data => request({ url: api.settleSubmit, method: 'post', data }),
  refundPlan: data => request({ url: api.refundPlan, method: 'post', data }),
};
