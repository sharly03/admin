import React from 'react';
import PropTypes from 'prop-types';
import { message } from 'antd';

import { AddPartnerForm, EditInformationForm, EditCreditForm, EditAuditForm, EditMaterialForm } from './detail/index';
import PartnerDao from '../../../dao/partner';
import BaseDao from '../../../dao/base';
import { getParam } from '../../../utils';

import './index.less';

class PartnerDetailPage extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
    location: PropTypes.object,
  };

  state = {
    informationEditing: false,
    auditEditing: false,
    materialEditing: false,
    creditEditing: false,

    token: '',
    informationData: {},
    creditData: {},
    userAuditConfig: [],
    resourceManageList: [],
    guaranteeList: [],
    projectList: [],

    query: [],
    auditDataList: [],
  };
  componentWillUnmount() {
    this.listPending && this.listPending.cancel();
    this.detailPending && this.detailPending.cancel();
    this.listPending && this.listPending.cancel();
    this.submitPending && this.submitPending.cancel();
  }
  componentDidMount() {
    this.id = getParam('id');
    this.informationLoading && this.informationLoading.cancel();

    this.auditLoading && this.auditLoading.cancel();
    this.auditLoading = PartnerDao.partnerAuditConfig();

    this.fetchSelectList();
    this.fetchImageToken();
    this.auditLoading.then((data) => {
      if (data.code === 0) {
        const dataList = data.data;
        const auditDataList = dataList.filter(item => {
          return item.disableFalg === false;
        });
        this.setState({ auditDataList });
      }
    });
    this.isEdit() && this.fetchDetail({ id: this.id });
  }

  fetchImageToken = async () => {
    this.tokenPending && this.tokenPending.cancel();
    this.tokenPending = BaseDao.fetchQiniuToken();
    const result = await this.tokenPending;
    if (result.code === 0) {
      this.setState({
        token: result.data,
      });
    } else {
      message.error(result.msg || '加载图片上传token失败');
    }
  }

  fetchSelectList = async () => {
    this.listPending && this.listPending.cancel();
    this.listPending = Promise.all([PartnerDao.partnerItemsList({ cooperationType: 'cooperation_guarantee' }), PartnerDao.partnerItemsList({ cooperationType: 'cooperation_project' })]);
    const [result1, result2] = await this.listPending;
    if (result1.code === 0 && result2.code === 0) {
      this.setState({
        guaranteeList: result1.data,
        projectList: result2.data,
      });
    } else {
      message.error('加载合作方数据失败');
    }
  }
  // 详情
  async fetchDetail(query) {
    this.detailPending && this.detailPending.cancel();
    const result = await PartnerDao.partnerDetail(query);
    if (result.code === 0) {
      const {
        cooperativeUserVO,
        userAuditConfig,
        resourceManageList,
        creditLine,
        guarantees,
        projects,
      } = result.data;
      this.setState({
        informationData: cooperativeUserVO,
        creditData: { creditLine, guarantees, projects },
        userAuditConfig,
        resourceManageList,
      });
    } else {
      message.error(result.msg || '加载合作方数据失败');
    }
  }
  // 新增编辑
  handleSubmit = async (data) => {
    this.submitPending = PartnerDao.addPartnerData(data);
    const result = await this.submitPending;
    if (result.code === 0) {
      message.success('保存成功！');
      this.handleBackList();
    } else {
      message.error(result.msg || '保存失败！');
    }
  };

  handleSubmitInformation = async (data) => {
    this.submitInfoPending = PartnerDao.updateInformation(data);
    const result = await this.submitInfoPending;
    if (result.code === 0) {
      this.fetchDetail({ id: this.id });
      this.setState({ informationEditing: false });
      message.success('保存成功！');
    } else {
      message.error(result.msg || '保存失败！');
    }
  }
  handleSubmitAudit = async (data) => {
    this.submitAuditPending = PartnerDao.updateAudit(data);
    const result = await this.submitAuditPending;
    if (result.code === 0) {
      this.fetchDetail({ id: this.id });
      this.setState({ auditEditing: false });
      message.success('保存成功！');
    } else {
      message.error(result.msg || '保存失败！');
    }
  }
  handleSubmitCredit = async (data) => {
    this.submitCreditPending = PartnerDao.updateCredit(data);
    const result = await this.submitCreditPending;
    if (result.code === 0) {
      this.fetchDetail({ id: this.id });
      this.setState({ creditEditing: false });
      message.success('保存成功！');
    } else {
      message.error(result.msg || '保存失败！');
    }
  }
  handleSubmitMaterial = async (data) => {
    this.submitMaterialPending = PartnerDao.updateMaterial(data);
    const result = await this.submitMaterialPending;
    if (result.code === 0) {
      this.fetchDetail({ id: this.id });
      this.setState({ materialEditing: false });
      message.success('保存成功！');
    } else {
      message.error(result.msg || '保存失败！');
    }
  }

  handleBackList = () => {
    this.context.router.replace('/partner');
  };
  isEdit() {
    return !!this.context.location.query.id;
  }

  /**
   * 点击编辑
   * @param editing 编辑区域名称
   */
  handleEdit = (editing) => {
    this.setState({
      [editing]: true,
    });
  };
  handleCancelEdit = (editing) => {
    this.setState({
      [editing]: false,
    });
  }

  // 新增时的取消
  handleCancelAdd = () => {
    this.handleBackList();
  }

  handleRefreshToken = (token) => {
    this.setState({ token });
  }

  render() {
    const {
      informationEditing,
      auditEditing,
      materialEditing,
      creditEditing,
      token,
      informationData,
      creditData,
      guaranteeList,
      projectList,
      userAuditConfig,
      resourceManageList,
      auditDataList,
    } = this.state;
    const commonProps = {
      onEditClick: this.handleEdit,
      onCancelEdit: this.handleCancelEdit,
    };
    const commonPropsAdd = {
      isEditing: true,
      onEditClick: () => {},
      onCancelEdit: this.handleCancelAdd,
      token,
      onTokenRefresh: this.handleRefreshToken,
      onSubmit: this.handleSubmit,
      projectList,
      guaranteeList,
      auditDataList,
    };

    const editProps = {
      information: {
        item: informationData,
        isEditing: informationEditing,
        onSubmit: this.handleSubmitInformation,
      },
      credit: {
        item: creditData,
        isEditing: creditEditing,
        projectList,
        guaranteeList,
        onSubmit: this.handleSubmitCredit,
      },
      audit: {
        item: userAuditConfig,
        isEditing: auditEditing,
        auditDataList,
        onSubmit: this.handleSubmitAudit,
      },
      material: {
        item: resourceManageList,
        isEditing: materialEditing,
        token,
        onTokenRefresh: this.handleRefreshToken,
        onSubmit: this.handleSubmitMaterial,
      },
    };
    return (
      <div style={{ padding: '30px 20px' }}>
        {this.isEdit() ? (
          <div>
            <EditInformationForm {...commonProps} {...editProps.information} />
            <EditCreditForm {...commonProps} {...editProps.credit} />
            <EditAuditForm {...commonProps} {...editProps.audit} />
            <EditMaterialForm {...commonProps} {...editProps.material} />
          </div>
        ) : (
          <div>
            <AddPartnerForm {...commonPropsAdd} />
          </div>
        )}
      </div>
    );
  }
}

export default PartnerDetailPage;
