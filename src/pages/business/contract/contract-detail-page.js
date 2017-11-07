import React from 'react';
import PropTypes from 'prop-types';
import { message } from 'antd';
import contractDao from '../../../dao/contract';
import { queryTo, parseParam } from '../../../utils/location-helper';

import { AddContractForm, EditAssetsForm, EditContractForm } from './contract-form-wrap';
import './contract.less';

class ContractDetailPage extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
    location: PropTypes.object,
  };

  static propTypes = {
  };

  constructor(props) {
    super(props);
    this.lastFetchId = 0;

    this.state = {
      contractData: {}, // 合同详情数据（包含了合同信息和资产方信息）
      banks: [], // 银行信息
      assetsList: [], // 所有资产列表
      bankBranches: [], // 支行信息，根据省市和银行信息获取
      fetching: false,
      contractEditing: !this.isDetail(), // 合同信息是否在编辑态
      assetsEditing: !this.isDetail(), // 资产方是否在编辑态
    };
  }

  componentWilUnmount() {
    this.bankPending && this.bankPending.cancel();
    this.contractPending && this.contractPending.cancel();
    this.assetsPending && this.assetsPending.cancel();
    this.bankBranchPending && this.bankBranchPending.cancel();
    this.submitPending && this.submitPending.cancel();
    this.AssetSubmitPending && this.AssetSubmitPending.cancel();
  }

  componentDidMount() {
    this.isDetail() && this.fetchItems({ id: this.context.location.query.id });
    this.fetchBankItems();
  }

  // 拉取合同详情信息
  async fetchItems(query) {
    this.contractPending && this.contractPending.cancel();
    this.contractPending = contractDao.fetchDetail(query);
    const result = await this.contractPending;
    if (result.code === 0) {
      console.log('合同详情数据', result);
      this.setState({ contractData: result.data });
    } else {
      message.error(result.msg || '加载合同数据失败');
    }
  }

  // 查询资产方
  fetchUser = async (value) => {
    if (!value) return;
    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;
    const sendData = { displayName: value };
    this.setState({ fetching: true });
    this.assetsPending && this.assetsPending.cancel();
    this.assetsPending = contractDao.assetSummary(sendData);
    const result = await this.assetsPending;
    this.setState({ fetching: false });
    if (fetchId !== this.lastFetchId) { // for fetch callback order
      return;
    }
    if (result.code === 0) {
      this.setState({ assetsList: result.data });
    } else {
      message.error(result.msg || '加载资产方信息失败');
    }
  }

  // 加载银行
  async fetchBankItems() {
    this.bankPending && this.bankPending.cancel();
    this.bankPending = contractDao.bankItem();
    const result = await this.bankPending;
    if (result.code === 0) {
      this.setState({ banks: result.data.items });
    } else {
      message.error(result.msg || '加载银行数据失败');
    }
  }

  // 查询支行
  onSelectBranch = async (bank, cityCode) => {
    const bankData = { appBankCode: bank, districtCode: cityCode };
    this.bankBranchPending && this.bankBranchPending.cancel();
    this.bankBranchPending = contractDao.selectBranch(bankData);
    const result = await this.bankBranchPending;
    if (result.code === 0) {
      const bankBranches = result.data;
      this.setState({ bankBranches });
    } else {
      message.error(result.msg || '加载支行数据失败');
    }
  }
  isDetail = () => {
    const query = parseParam(location.search);
    return !!query.id;
  }
  handleFilterChange = (fields) => {
    console.log(fields);
    queryTo(location, fields);
  }
  handleEdit = (editing) => {
    this.setState({
      [editing]: true,
    });
  };
  handleCancel = (editing) => {
    this.setState({
      [editing]: false,
    });
  }
  handleAssetSubmit = (data) => {
    this.AssetSubmitPending && this.AssetSubmitPending.cancel();
    this.AssetSubmitPending = contractDao.modifyAsset(data);
    this.AssetSubmitPending.then((ret) => {
      if (ret.code === 0) {
        message.success('保存成功！');
        this.setState({ assetsEditing: false });
      } else {
        message.error(ret.msg || '保存失败！');
      }
    });
  };
  handleSubmit = (data) => {
    this.submitPending && this.submitPending.cancel();
    this.submitPending = contractDao.contractAdd(data);
    this.submitPending.then((ret) => {
      if (ret.code === 0) {
        message.success('保存成功！');
        if (this.state.assetsEditing) {
          this.context.router.replace('/contract/list');
        }
      } else {
        message.error(ret.msg || '保存失败！');
      }
    });
  };
  render() {
    const { fetching, assetsList, contractData, banks, bankBranches, contractEditing, assetsEditing } = this.state;
    const assetProps = {
      fetching,
      assetsList,
      assets: {
        id: contractData.assetCooperativeUserId,
        assetName: contractData.assetsCooperativeUserName,
        assetType: contractData.assetType,
        creditLine: contractData.creditLine,
        guarantee: contractData.guguaranteeUserName,
        project: contractData.projectCooperativeUserName,
      },
      fetchUser: this.fetchUser,
      onSubmit: this.handleAssetSubmit,
      assetsEditing,
      onEditAssets: this.handleEdit,
      onCancelEditAssets: this.handleCancel,
    };
    const contractProps = {
      banks,
      onSelectBranch: this.onSelectBranch,
      bankBranches,
      dataSource: contractData,
      contractEditing,
      onSubmit: this.handleSubmit,
      onEditContract: this.handleEdit,
      onCancelEditContract: this.handleCancel,
    };
    const addContractProps = {
      assetProps,
      contractProps,
      onSubmit: this.handleSubmit,
    };

    return (
      <div style={{ margin: '16px' }}>
        <div className="main">
          { this.isDetail() ? <div>
            <EditAssetsForm {...assetProps} />
            <EditContractForm {...contractProps} />
          </div> : <AddContractForm {...addContractProps} />}
        </div>
      </div>
    );
  }
}

export default ContractDetailPage;
