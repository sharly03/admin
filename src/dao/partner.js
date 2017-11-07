import request from '../utils/request';
import { api } from './api';

export default {
  partnerItemsList: data => request({ url: api.partnerDataList, data, method: 'post' }),
  partnerItems: data => request({ url: api.partnerDataPage, data, method: 'post' }),
  partnerDetail: data => request({ url: api.partnerDataDetail, data, method: 'post' }),
  addPartnerData: data => request({ url: api.partnerDataSave, data, method: 'post' }),
  partnerAuditConfig: data => request({ url: api.partnerAuditConfig, data, method: 'post' }),
  updateInformation: data => request({ url: api.updatePartnerInformation, data, method: 'post' }),
  updateCredit: data => request({ url: api.updatePartnerCredit, data, method: 'post' }),
  updateAudit: data => request({ url: api.updatePartnerAudit, data, method: 'post' }),
  updateMaterial: data => request({ url: api.updatePartnerMaterial, data, method: 'post' }),
};
