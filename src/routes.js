import React from 'react';
import { Route, IndexRedirect } from 'react-router';
import Dashboard from './pages/dashboard';
import Playground from './pages/playground';
import UploadPage from './pages/playground/upload';
import RichTextPage from './pages/playground/rich-text';
import SortableUpload from './pages/playground/sortable-upload';
import LeavePage from './pages/playground/leave-page';
import MultiUploadPage from './pages/playground/multi-upload';
import NestFormPage from './pages/playground/nest-form';
import ModalPage from './pages/playground/modal';

import Login from './pages/login';

import User from './pages/user/user-page';
import UserDetail from './pages/user/detail-page';
import Report from './pages/report';
import RolePage from './pages/role/role-page';
import BackendUsers from './pages/backend-users/backend-users-page';
import AdList from './pages/banner/ad-manage-page';
import News from './pages/news';
import NewsEdit from './pages/news/edit';
import ReportEdit from './pages/report/report-edit';
import DataList from './pages/operation/data-list';
import Commodity from './pages/business/commodity/commodity-page';
import CommodityEdit from './pages/business/commodity/edit-page';
import Loan from './pages/business/loan/loan-page';
import LoanAudit from './pages/business/loan/audit-page';
import Refund from './pages/business/refund/refund-page';
import RefundPeriods from './pages/business/refund/periods-page';
import RefundRecord from './pages/business/refund/record-page';
import RefundSettle from './pages/business/refund/settle-page';
import Sale from './pages/business/sale/sale-page';
import SaleDetail from './pages/business/sale/detail-page';
import UserMaintain from './pages/business/sale/maintain-page';

import { AUTH_TOKEN_KEY } from './utils/constants';
import Partner from './pages/business/partner/partner-page';
import PartnerDetail from './pages/business/partner/detail-page';

import Contract from './pages/business/contract/contract-page';
import ContractDetail from './pages/business/contract/contract-detail-page';
import { NotFound } from './pages/common/error';

// 第一次进入页面时对登录态进行检测
const validate = (next, replace, callback) => {
  const isLoggedIn = !!window.localStorage.getItem(AUTH_TOKEN_KEY);
  if (!isLoggedIn && next.location.pathname !== '/playground') {
    replace('/login');
  }
  callback();
};

let routes = (
  <Route path="/">
    <IndexRedirect to="backendUsers" />

    <Route path="login" component={Login} />
    <Route path="register" component={Login} />
    <Route path="upload" component={UploadPage} />
    <Route path="sortable" component={SortableUpload} />
    <Route path="richtext" component={RichTextPage} />
    <Route path="leave" component={LeavePage} />
    <Route path="multi" component={MultiUploadPage} />
    <Route path="modal" component={ModalPage} />

    <Route component={Dashboard} onEnter={validate}>
      <Route path="user/list" component={User} />
      <Route path="user/detail" component={UserDetail} />
      <Route path="backendUsers" component={BackendUsers} />
      <Route path="news" component={News} />
      <Route path="news/edit" component={NewsEdit} />
      <Route path="operation/data" component={DataList} />

      <Route path="banner/adList" component={AdList} />

      <Route path="report" component={Report} />
      <Route path="report/edit" component={ReportEdit} />
      <Route path="partner" component={Partner} />
      <Route path="partner/add" component={PartnerDetail} />
      <Route path="partner/edit" component={PartnerDetail} />

      <Route path="contract/list" component={Contract} />
      <Route path="contract/addContract" component={ContractDetail} />
      <Route path="contract/editContract" component={ContractDetail} />
      <Route path="settings/role" component={RolePage} />

      <Route path="business/commodity" component={Commodity} />
      <Route path="business/commodity/:type" component={CommodityEdit} />
      <Route path="business/loan" component={Loan} />
      <Route path="business/loan/audit/:type" component={LoanAudit} />
      <Route path="business/refund" component={Refund} />
      <Route path="business/refund/periods" component={RefundPeriods} />
      <Route path="business/refund/record" component={RefundRecord} />
      <Route path="business/refund/settle" component={RefundSettle} />
      <Route path="business/sale" component={Sale} />
      <Route path="business/sale/detail" component={SaleDetail} />
      <Route path="business/sale/maintain" component={UserMaintain} />

      {/* 测试页面 */}
      <Route path="playground" component={Playground} />
      <Route path="nest" component={NestFormPage} />

      <Route path="*" component={NotFound} />
      {/* 写在这里的路由均无效，因为已经被*匹配走了 */}
    </Route>
  </Route>
);

// Any update within the app will bubble up to this file
// We can't create a new <Route> element though, because Router won't accept
// updates to its routes prop.
// So we're passing the previous export from update to update to prevent Router from complaining
// The React components themselves will still update properly

if (module.hot) {
  let oldRoutes = module.hot.data && module.hot.data.routes;
  if (oldRoutes) {
    routes = oldRoutes;
  }
  module.hot.dispose((data) => {
    data.routes = routes;
  });
}

export default routes;
