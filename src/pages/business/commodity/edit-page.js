import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Form, Row, Col, Radio, Input, Button, message, Modal } from 'antd';
import BaseForm from './base-form';
import ProductForm from './product-form';
import { parseParam, redirect } from '../../../utils/location-helper';
import dao from '../../../dao/commodity';

import styles from './commodity.less';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const TextArea = Input.TextArea;

// 审核表单
const Audit = ({ form, dataSource, type, onSubmit }) => {
  const { getFieldDecorator, validateFields } = form;
  const { auditOpinion = true, auditRemark } = dataSource;
  const itemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 12 },
  };
  const handleSubmit = () => {
    validateFields((err, fields) => {
      !err && onSubmit({
        ...fields,
        auditOpinion: fields.auditOpinion === '01',
      });
    });
  };
  const isAudit = type === 'audit';
  return (
    <Row className={styles['settle-form']} gutter={24} type="flex">
      <Col span={12}>
        <p className="list-title">审核信息</p>
        <FormItem label="审核意见" {...itemLayout} required>
          {getFieldDecorator('auditOpinion', {
            initialValue: auditOpinion ? '01' : '02',
          })(
            <RadioGroup disabled={!isAudit}>
              <Radio value="01">通过</Radio>
              <Radio value="02">驳回</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem label="审核备注" {...itemLayout}>
          {getFieldDecorator('auditRemark', {
            initialValue: auditRemark,
            rules: [{ required: true, message: '输入不能为空' }],
          })(<TextArea disabled={!isAudit} />)}
        </FormItem>
      </Col>
      {
        isAudit &&
        <Col span={24}>
          <FormItem style={{ textAlign: 'center' }}>
            <Button type="primary" onClick={handleSubmit}>提交</Button>
          </FormItem>
        </Col>
      }
    </Row>
  );
};
Audit.defaultProps = {
  type: 'audit',
  dataSource: {},
  onSubmit: () => {},
};
Audit.propTypes = {
  form: PropTypes.object.isRequired,
  type: PropTypes.string,
  dataSource: PropTypes.object,
  onSubmit: PropTypes.func,
};

// 2. 产品说明

// 3. 风险控制
const Risk = ({ isPreview }) => {
  // const handleLast = () => {
  //   const fields = form.getFieldsValue();
  //   console.log('---------', fields);
  //   onLast(fields);
  // };
  // const handleSubmit = () => {
  //   const fields = form.getFieldsValue();
  //   console.log('---------', fields);
  //   onSubmit(fields);
  // };

  return (
    <div>{isPreview}</div>
  );
};
Risk.defaultProps = {
  isPreview: false,
  onLast: () => {},
  onSubmit: () => {},
};
Risk.propTypes = {
  // form: PropTypes.object.isRequired,
  isPreview: PropTypes.bool,
  // onLast: PropTypes.func,
  // onSubmit: PropTypes.func,
};

const RiskForm = Form.create()(Risk);
const AuditForm = Form.create()(Audit);
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;

const tabKeys = ['base', 'product', 'risk'];

class CommodityEdit extends React.Component {
  constructor(props) {
    super(props);
    const { type } = props.params;
    this.isAdd = type === 'add';
    this.isEdit = type === 'edit';
    this.isAudit = type === 'audit';
    this.isPreview = type === 'preview';
  }
  state = {
    tabIndex: 0,
    // 表单数据
    baseSource: {},
    productSource: {},
    riskSource: {},
  };

  componentDidMount() {
    const { type } = this.props.params;
    type !== 'add' && this.fetchBaseDetail(parseParam(location.search));
  }
  componentWillUnmount() {
    this.detailPendding && this.detailPendding.cancel();
    this.riskPendding && this.riskPendding.cancel();
  }

  async fetchBaseDetail(query) {
    this.detailPendding && this.detailPendding.cancel();
    this.detailPendding = dao.commodityDetail(query);
    const data = await this.detailPendding;
    if (data.code === 0) {
      this.setState({ baseSource: data.data });
    } else {
      message.error(data.msg || '数据加载失败');
    }
  }
  async fetchRiskDetail(query) {
    this.riskPendding && this.riskPendding.cancel();
    this.setState({ loading: true });
    this.riskPendding = dao.commodityDetail(query);
    const data = await this.riskPendding;
    this.setState({ loading: false });
    if (data.code === 0) {
      this.setState({ riskSource: data.data });
    } else {
      message.error(data.msg || '数据加载失败');
    }
  }

  handleTabsLast = () => {
    const { tabIndex } = this.state;
    this.setState({ tabIndex: tabIndex - 1 });
  };
  handleTabsNext = (form, index) => {
    // 保存表单内容
    console.log('保存表单内容', form);
    const { tabIndex } = this.state;
    if (index === 0) {
      this.setState({
        tabIndex: tabIndex + 1,
        baseSource: form,
      });
    } else if (index === 1) {
      this.setState({
        tabIndex: tabIndex + 1,
        productSource: form,
      });
    }
  };
  handleSubmit = form => {
    const { baseSource, productSource, riskSource } = this.state;
    const query = { ...baseSource, ...productSource, ...riskSource, ...form };
    console.log('提交表单', query);
  };
  handleBaseChange = data => {
    this.setState({ baseSource: data });
  };
  handleTabsChange = value => {
    const tabIndex = tabKeys.indexOf(value);
    this.setState({ tabIndex });
    if (tabIndex === 2) {
      this.fetchRiskDetail(parseParam(location.search));
    }
  };
  handleAuditSubmit = query => {
    confirm({
      title: '确定提交审核吗？',
      okText: '继续',
      onOk: async () => {
        const data = await dao.commodityAudit({ ...parseParam(location.search), ...query });
        if (data.code === 0) {
          redirect('/business/commodity', true);
          message.success(data.msg);
        } else {
          message.error(data.msg);
        }
      },
    });
  };

  render() {
    const tabsDisabled = this.isEdit || this.isAdd;
    const basePreview = this.isPreview || this.isAudit;
    const { type } = this.props.params;
    const { tabIndex, baseSource, productSource, riskSource } = this.state;
    const hiddenRiskTab = baseSource.commodityType === '02';
    return (
      <div style={{ margin: 16 }} className={styles['commodity-edit']}>
        <Tabs
          activeKey={tabKeys[tabIndex]}
          animated={false}
          onChange={this.handleTabsChange}
        >
          <TabPane tab="基本信息" key={tabKeys[0]} disabled={tabsDisabled}>
            <BaseForm type={type} dataSource={baseSource} onNext={form => this.handleTabsNext(form, 0)} onDataChange={this.handleBaseChange} />
          </TabPane>
          <TabPane tab="产品说明" key={tabKeys[1]} disabled={tabsDisabled}>
            <ProductForm
              dataSource={productSource}
              type={type}
              isNext={baseSource.commodityType !== '02'}
              onLast={this.handleTabsLast}
              onNext={form => this.handleTabsNext(form, 1)}
              onSubmit={this.handleSubmit}
            />
          </TabPane>
          {
            !hiddenRiskTab && <TabPane tab="风险控制" key={tabKeys[2]} disabled={tabsDisabled}>
              <RiskForm
                dataSource={riskSource}
                isPreview={basePreview}
                onLast={this.handleTabsLast}
                onSubmit={this.handleSubmit}
              />
            </TabPane>
          }
        </Tabs>
        {basePreview && <AuditForm dataSource={baseSource} type={type} onSubmit={this.handleAuditSubmit} />}
      </div>
    );
  }
}
CommodityEdit.propTypes = {
  params: PropTypes.object.isRequired,
};

export default CommodityEdit;
