import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';
import { Information } from './information';
import { Credit } from './credit';
import { Audit } from './audit';
import { Material } from './material';
import { Wrap } from './wrap-button';
import { getParam } from '../../../../utils/index';

const processCredit = (data) => {
  data.projects = data.projects && data.projects.map(project => ({ id: parseInt(project.key, 10) }));
  data.guarantees = data.guarantees && data.guarantees.map(guarantee => ({ id: parseInt(guarantee.key, 10) }));
};

const processInfo = (data) => {
  data.registrationDate = data.registrationDate && data.registrationDate.format('YYYY-MM-DD');
};

const processFile = (data) => {
  data.resourceManageList = data.resourceManageList && data.resourceManageList.map(file => ({ name: file.uuid, description: file.desc }));
};

export const AddPartner = (props) => {
  const { form, onSubmit } = props;
  const handleSubmit = (e) => {
    e.preventDefault();
    form.validateFieldsAndScroll((err, data) => {
      if (err) {
        return;
      }
      processInfo(data);
      processCredit(data);
      processFile(data);
      console.log(data);
      onSubmit(data);
    });
  };

  // const informationProps = { form };
  // const creditProps = { form };
  // const auditProps = { form };
  // const materialProps = { form };
  // const childProps = { form };

  return (
    <Wrap {...props} onSubmit={handleSubmit}>
      <div>
        <Information {...props} />
        <Credit {...props} />
        <Audit {...props} />
        <Material {...props} />
      </div>
    </Wrap>
  );
};
AddPartner.propTypes = {
  form: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export const EditInformation = (props) => {
  const { form, onCancelEdit, onSubmit } = props;
  const handleSubmit = (e) => {
    e.preventDefault();
    form.validateFieldsAndScroll((err, data) => {
      if (err) {
        return;
      }
      data.id = getParam('id');
      processInfo(data);
      console.log(data);
      onSubmit(data);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancelEdit('informationEditing');
  };

  return (
    <Wrap {...props} onSubmit={handleSubmit} onCancelEdit={handleCancel}>
      <Information {...props} />
    </Wrap>
  );
};
EditInformation.propTypes = {
  form: PropTypes.object.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export const EditCredit = (props) => {
  const { form, onCancelEdit, onSubmit } = props;
  const handleSubmit = (e) => {
    e.preventDefault();
    form.validateFieldsAndScroll((err, data) => {
      if (err) {
        return;
      }
      data.id = getParam('id');
      processCredit(data);
      console.log(data);
      onSubmit(data);
    });
  };
  const handleCancel = () => {
    form.resetFields();
    onCancelEdit('creditEditing');
  };
  return (
    <Wrap {...props} onSubmit={handleSubmit} onCancelEdit={handleCancel}>
      <Credit {...props} />
    </Wrap>
  );
};
EditCredit.propTypes = {
  form: PropTypes.object.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export const EditAudit = (props) => {
  const { form, onCancelEdit, onSubmit } = props;
  const handleSubmit = (e) => {
    e.preventDefault();
    form.validateFieldsAndScroll((err, data) => {
      if (err) {
        return;
      }
      data.id = getParam('id');

      console.log(data);
      onSubmit(data);
    });
  };
  const handleCancel = () => {
    form.resetFields();
    onCancelEdit('auditEditing');
  };
  return (
    <Wrap {...props} onSubmit={handleSubmit} onCancelEdit={handleCancel}>
      <Audit {...props} />
    </Wrap>
  );
};
EditAudit.propTypes = {
  form: PropTypes.object.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export const EditMaterial = (props) => {
  const { form, onCancelEdit, onSubmit } = props;
  const handleSubmit = (e) => {
    e.preventDefault();
    form.validateFieldsAndScroll((err, data) => {
      if (err) {
        return;
      }
      data.id = getParam('id');
      processFile(data);
      console.log(data);
      onSubmit(data);
    });
  };
  const handleCancel = () => {
    form.resetFields();
    onCancelEdit('materialEditing');
  };
  return (
    <Wrap {...props} onSubmit={handleSubmit} onCancelEdit={handleCancel}>
      <Material {...props} />
    </Wrap>
  );
};
EditMaterial.propTypes = {
  form: PropTypes.object.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export const EditMaterialForm = Form.create()(EditMaterial);
export const EditInformationForm = Form.create()(EditInformation);
export const AddPartnerForm = Form.create()(AddPartner);
export const EditAuditForm = Form.create()(EditAudit);
export const EditCreditForm = Form.create()(EditCredit);
