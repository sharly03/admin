export const api = {
  // userLogin: '/api/admin/login',
  userLogin: '/api/management/auth/login',
  // userLogin: '/api/test',
  userLogout: '/api/logout',
  userInfo: '/api/userInfo',
  // users: '/api/users',
  backendUsers: '/api/management/models/platformUser/list',
  addBackendUser: '/api/management/models/platformUser/add',
  editBackendUser: '/api/management/models/platformUser/update',
  removeBackendUser: '/api/management/models/platformUser/delete',
  roles: '/api/management/roles',
  users: '/api/admin/account/list',
  lockUser: '/api/admin/account/lock',
  unlockUser: '/api/admin/account/unlock',
  user: '/api/user/:id',
  menu: '/api/menu',

  qiniuToken: '/api/management/tools/qiniu/gettoken',
  qiniuTestToken: '/api/admin/upload_config_test',

  newsList: '/api/admin/news/list',
  addNews: '/api/admin/news/add',
  editNews: '/api/admin/news/edit',
  newsDetail: '/api/admin/news/detail',
  deleteNews: '/api/admin/news/delete',
  recommendNews: '/api/admin/news/recommend',
  unrecommendNews: '/api/admin/news/unrecommend',

  // noticeList: '/api/json/posts', // mock
  noticeList: '/api/admin/news/list/media',

  // 广告管理
  adPositions: '/api/management/operation/adv/list-position-items',
  advList: '/api/management/operation/adv/adv-items',
  addAdv: '/api/management/operation/adv/save',
  editAdv: '/api/management/operation/adv/update',
  deleteAdv: '/api/management/operation/adv/delete',

  reportList: '/api/admin/report/list',
  reportDetail: '/api/admin/report/detail',
  addReport: '/api/admin/report/add',
  editReport: '/api/admin/report/edit',
  deleteReport: '/api/admin/report/delete',

  dataList: '/api/admin/increasing/list',
  dataAdd: '/api/admin/increasing/add',
  dataDelete: '/api/admin/increasing/delete',
  // dashboard: '/api/dashboard',

  activityList: '/api/admin/activity/list',
  activityDetail: '/api/admin/activity/detail',
  addActivity: '/api/admin/activity/add',
  editActivity: '/api/admin/activity/edit',
  deleteActivity: '/api/admin/activity/delete',
  changeActivityDisplayStatus: '/api/admin/activity/change_display',
  activityQualificationList: '/api/admin/activity/qualification_list',
  downloadActivityLogs: '/api/admin/activity/download_logs',
  sendMaterialGift: '/api/admin/activity/send_material_gift',
  searchResourceApi: '/api/admin/activity/search_resource',

  giftList: '/api/admin/gift/list',
  addGift: '/api/admin/gift/add',
  editGift: '/api/admin/gift/edit',
  deleteGift: '/api/admin/gift/delete',

  giftCodeList: '/api/admin/gift_code/codes',
  addGiftCodes: '/api/admin/gift_code/add',
  downloadAcquireCode: '/api/admin/gift_code/download_codes',

  // 用户管理接口
  userItems: '/api/management/models/appuser/items',
  userDetail: '/api/management/models/appuser/detail',
  userCapital: '/api/management/models/appuser/capital-items',
  userPurchase: '/api/management/models/appuser/purchase-items',
  userTrade: '/api/management/models/appuser/rechargeOrWithdraw-items',
  userChangeMobile: '/api/management/models/appuser/changeMobile',

  // 标的管理
  commodityQuery: '/api/management/models/commodity/page',
  commodityDetail: '/api/management/models/commodity/detail', // 标的基本信息
  commoditySubmit: '/api/management/models/commodity/send-audit',
  commoditySend: '/api/management/models/commodity/send-bank',
  commodityAudit: '/api/management/core/audit/auditing',
  baseUpdate: '/api/management/models/commodity/saveOrUpdate',
  fetchAssets: '/api/management/models/coopusers/list-cooperarive-users',
  fetchContracts: '/api/management/models/coopcontract/list',
  templateList: '/api/management/models/commodity/template-list',

  // 销售管理
  productList: '/api/management/models/equityproduct/list',
  orderList: '/api/management/models/equitypurchase/queryEquityPurchaseOrder',
  submitAudit: '/api/management/core/loan/submitAuditRecord',
  upAndDownShelf: '/api/management/models/equityproduct/onOrOffshelves',
  fullFlow: '/api/management/models/equityproduct/isFullScale',
  portionMaintain: '/api/management/models/equityproduct/updateEquityProduct',
  orderCancel: '/api/management/models/equitypurchase/cancelEquityPurchaseOrder',

  // 放款管理
  loanList: '/api/management/core/loan/items',
  loanDetail: '/api/management/core/loan/getDetailByLoanRequestId',
  auditRequest: '/api/management/core/loan/auditRequest',
  loanExecute: '/api/management/core/loan/execute',

  // 还款管理
  refundQuery: '/api/management/core/refund/queryCommodityRefund',
  refundPeriods: '/api/management/core/refund/queryCommodityRefundRecordByPeroid',
  refundRecord: '/api/management/core/refund/queryUserCommodityRefundRecord',
  refundSubmit: '/api/management/core/refund/submitCommodityRefund',
  refundPlan: '/api/management/core/settle/getCommodityRefundPlan',
  settleSubmit: '/api/management/core/settle/executeSettlement',

  // 合作方管理接口
  partnerDataList: '/api/management/models/coopusers/list-cooperarive-users',
  partnerDataPage: '/api/management/models/coopusers/cooperarive-users',
  partnerDataDetail: '/api/management/models/coopusers/detail',
  partnerDataSave: '/api/management/models/coopusers/saveOrUpdate',
  partnerAuditConfig: '/api/management/models/coopusers/list-auditConfig-all',
  updatePartnerInformation: '/api/management/models/coopusers/update-baseInfo',
  updatePartnerCredit: '/api//management/models/coopusers/update-relationship',
  updatePartnerAudit: '/api/management/models/coopusers/update-audit-config',
  updatePartnerMaterial: '/api/management/models/coopusers/update-audit-info',

  // 合同管理接口
  contractItems: '/api/management/models/coopcontract/list-items',
  contractDetail: '/api/management/models/coopcontract/detail',
  contractAdd: '/api/management/models/coopcontract/save',
  bankItem: '/api/ipay/biz/common/getEnterpriseBankSupportedBanks',
  cityItem: '/api/ipay/biz/common/getAllDistricts',
  assetSummary: '/api/management/models/coopusers/asset-summary',
  selectBranch: '/api/ipay/biz/common/getBankBranches',
  modifyAsset: '/api/management/models/coopcontract/alter',
};
