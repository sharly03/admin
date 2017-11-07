import React from 'react';
import PropTypes from 'prop-types';
import { Form, Button } from 'antd';
import AssetsInfo from './assets-info';
import ContractInfo from './contract-info';
import { getId } from '../../../utils';

const EDITING_NAME = 'contractEditing';


const AddContract = (props) => {
  const { onSubmit, form, ...otherProps } = props;
  const { assetProps, contractProps } = otherProps;
  // const assetProps = { form, fetching, assetsList, fetchUser };
  // const contractProps = { form, ...anotherProps };

  const handleSubmit = (e) => {
    e.preventDefault();
    form.validateFieldsAndScroll((err, fields) => {
      if (err) {
        return;
      }
      fields.districtCode = fields.district[1];
      fields.incomeBeginDate = fields.loanDate[0].format('x');
      fields.incomeEndDate = fields.loanDate[1].format('x');
      fields.assetId = fields.assertSiteInfo.key;
      onSubmit(fields);
    });
  };

  return (<Form layout="horizontal" autoComplete="off" onSubmit={handleSubmit}>
    <h2>资产方信息</h2>
    <AssetsInfo {...{ ...assetProps, form }} />
    <h2 style={{ marginBottom: '20px' }}>
      合同信息
    </h2>
    <ContractInfo {...{ ...contractProps, form }} />
    <div style={{ marginLeft: 100 }} >
      <Button size="large" type="primary" htmlType="submit" className="margin-right">保存</Button>
      <Button size="large" type="ghost">取消</Button>
    </div>
  </Form>);
};

AddContract.propTypes = {
  form: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

const EditAssets = (props) => {
  const { onSubmit, form } = props;
  const handleSubmit = (e) => {
    e.preventDefault();
    form.validateFieldsAndScroll((err, fields) => {
      if (err) {
        return;
      }
      fields.contractId = getId();
      fields.assetsCooperativeUserId = fields.assertSiteInfo.key;

      onSubmit(fields);
    });
  };
  return (<Form layout="horizontal" autoComplete="off" onSubmit={handleSubmit} style={{ marginTop: 20 }}>
    <h2>资产方信息</h2>
    <AssetsInfo {...props} />
  </Form>);
};
EditAssets.propTypes = {
  form: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

const EditContract = (props) => {
  const {
    onSubmit,
    onEditContract,
    onCancelEditContract,
    form,
    contractEditing,
  } = props;

  const handleSubmit = (e) => {
    e.preventDefault();
    form.validateFieldsAndScroll((err, fields) => {
      if (err) {
        return;
      }
      fields.id = getId();
      fields.districtCode = fields.district[1];
      fields.incomeBeginDate = fields.loanDate[0].format('x');
      fields.incomeEndDate = fields.loanDate[1].format('x');
      onSubmit(fields);
    });
  };
  return (<Form layout="horizontal" autoComplete="off" onSubmit={handleSubmit}>
    <h2 style={{ marginBottom: '20px' }}>
      合同信息
      {!contractEditing && (<a className="edit-contract" onClick={onEditContract.bind(null, EDITING_NAME)}>编辑</a>)}
    </h2>
    <ContractInfo {...props} />
    {contractEditing &&
    <div style={{ marginLeft: 100 }} >
      <Button size="large" type="primary" htmlType="submit" className="margin-right">保存</Button>
      <Button size="large" type="ghost" onClick={onCancelEditContract.bind(null, EDITING_NAME)}>取消</Button>
    </div>}
  </Form>);
};
EditContract.propTypes = {
  form: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  contractEditing: PropTypes.bool.isRequired,
  onEditContract: PropTypes.func.isRequired,
  onCancelEditContract: PropTypes.func.isRequired,
};

export const AddContractForm = Form.create()(AddContract);
export const EditAssetsForm = Form.create()(EditAssets);
export const EditContractForm = Form.create()(EditContract);

