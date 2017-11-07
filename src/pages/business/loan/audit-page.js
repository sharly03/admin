import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Form, Radio, Input, Button, message, Modal } from 'antd';
import { formatDecimal2, dateFormat } from '../../../utils';
import { parseParam, redirect } from '../../../utils/location-helper';
import dao from '../../../dao/loan';

import styles from './loan.less';


const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const TextArea = Input.TextArea;

const FormList = ({ title, lists, dataSource }) => {
  const children = lists.map((item, index) => {
    const { dataIndex, label, render } = item;
    const value = render && render instanceof Function ? render(dataSource[dataIndex], dataSource, index) : dataSource[dataIndex];
    return (
      <Col key={dataIndex} span={12}>
        <FormItem label={label} labelCol={{ span: 6 }}>
          {value}
        </FormItem>
      </Col>
    );
  });

  return (
    <div className={styles['form-list']}>
      {title && <p className="list-title">{title}</p>}
      <Row gutter={24} type="flex">
        {children}
      </Row>
    </div>
  );
};
FormList.defaultProps = {
  title: null,
};
FormList.propTypes = {
  title: PropTypes.string,
  lists: PropTypes.array.isRequired,
  dataSource: PropTypes.object.isRequired,
};

const Audit = ({ form, dataSource = {}, isPreview, onSubmit }) => {
  const { getFieldDecorator } = form;
  const itemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 12 },
  };
  const auditOptions = [
    { label: '通过', value: '04' },
    { label: '驳回', value: '03' },
  ];
  const { statusCode = '04', remark } = dataSource;

  const handleAuditSubmit = () => {
    const { validateFields } = form;
    validateFields((err, values) => {
      if (!err) {
        onSubmit(values);
      }
    });
  };

  return (
    <Row className={styles['audit-form']} gutter={24} type="flex">
      <Col span={12}>
        <p className="list-title">审核信息</p>
        <FormItem label="审核意见" {...itemLayout}>
          {getFieldDecorator('auditFlag', {
            initialValue: statusCode,
            rules: [{ required: true, message: '请选择审核意见' }],
          })(
            <RadioGroup options={auditOptions} disabled={isPreview} onChange={handleAuditSubmit} />
          )}
        </FormItem>
        <FormItem label="审核备注" {...itemLayout}>
          {getFieldDecorator('remark', {
            initialValue: isPreview ? remark : '',
            rules: [{ required: true, whitespace: true, message: '请填写备注信息' }],
          })(<TextArea placeholder="请输入" disabled={isPreview} autosize={{ minRows: 2, maxRows: 6 }} />)}
        </FormItem>
      </Col>
      {
        !isPreview &&
        <Col span={24}>
          <FormItem style={{ textAlign: 'center' }}>
            <Button type="primary" onClick={handleAuditSubmit}>提交</Button>
          </FormItem>
        </Col>
      }
    </Row>
  );
};
Audit.defaultProps = {
  isPreview: true,
  dataSource: {},
  onSubmit: () => {},
};
Audit.propTypes = {
  form: PropTypes.object.isRequired,
  isPreview: PropTypes.bool,
  dataSource: PropTypes.object,
  onSubmit: PropTypes.func,
};

const AuditForm = Form.create()(Audit);
const confirm = Modal.confirm;

class LoanAudit extends React.Component {
  state = {
    loading: false,
    loanDetailSource: {},
    auditSource: {},
  };

  componentDidMount() {
    this.fetchLoanDetail(parseParam(location.search));
  }
  componentWillUnmount() {
    this.auditPendding && this.auditPendding.cancel();
  }

  async fetchLoanDetail(query) {
    this.auditPendding && this.auditPendding.cancel();
    this.setState({ loading: true });
    this.auditPendding = dao.loanDetail(query);
    const data = await this.auditPendding;
    this.setState({ loading: false });
    if (data.code === 0) {
      const { statusCode, remark } = data.data;
      const auditSource = { statusCode, remark };
      this.setState({ loanDetailSource: data.data, auditSource });
    } else {
      message.error(data.msg || '数据加载失败');
    }
  }

  handleAuditSubmit = query => {
    console.log('=====', query);
    confirm({
      title: '确定提交吗？',
      onText: '继续',
      onOk: async () => {
        const data = await dao.auditRequest({
          ...parseParam(location.search),
          ...query,
        });
        if (data.code === 0) {
          redirect('/business/loan', false);
          message.success(data.msg);
        } else {
          message.error(data.msg);
        }
      },
    });
  };

  render() {
    const settleWays = {
      '01': '按月付息',
      '02': '按季付息',
      '03': '一次性付息',
      '04': '等额本费',
      '05': '到期还本付息',
      '06': '先息后本',
    };
    const { type } = this.props.params;
    const isPreview = type === 'preview';
    const loanDetailLists = [
      { dataIndex: 'commodityCode', label: '标的编号' },
      { dataIndex: 'contractNo', label: '合同编号', render: (_, { contractVO = {} }) => contractVO.contractNo },
      { dataIndex: 'assetNo', label: '资产编号', render: (_, { contractVO = {} }) => contractVO.assetNo },
      { dataIndex: 'assetName', label: '资产方名称', render: (_, { contractVO = {} }) => contractVO.assetsCooperativeUserName },
      { dataIndex: 'commodityTotalAmount', label: '标的金额', render: text => formatDecimal2(text) },
      { dataIndex: 'annualRate', label: '预期年化率', render: text => text && `${text}%` },
      { dataIndex: 'incomeDate', label: '收益期', render: (_, { contractVO = {} }) => `${dateFormat(contractVO.incomeBeginDate)}~${dateFormat(contractVO.incomeEndDate)}` },
      { dataIndex: 'incomePeriod', label: '期限' },
      { dataIndex: 'settlementType', label: '还款方式', render: (_, { contractVO = {} }) => contractVO.settlementType && settleWays[contractVO.settlementType] },
      { dataIndex: 'serviceFeeRate', label: '服务费率', render: (_, { contractVO = {} }) => contractVO.serviceFee && `${contractVO.serviceFee}%` },
      { dataIndex: 'serviceFee', label: '服务费', render: text => formatDecimal2(text) },
      { dataIndex: 'saledNumber', label: '已销售额度', render: text => formatDecimal2(text) },
      { dataIndex: 'loanAmount', label: '放款额度', render: text => formatDecimal2(text) },
    ];
    isPreview && loanDetailLists.push(
      { dataIndex: 'auditBy', label: '执行放款人' },
      { dataIndex: 'auditAt', label: '执行放款时间', render: text => dateFormat(text) },
    );

    const { loanDetailSource, auditSource } = this.state;

    return (
      <div style={{ margin: 16 }} className={styles['loan-audit']}>
        <FormList title="放款详细信息" lists={loanDetailLists} dataSource={loanDetailSource} />
        <AuditForm dataSource={isPreview ? auditSource : {}} isPreview={isPreview} onSubmit={this.handleAuditSubmit} />
      </div>
    );
  }
}

LoanAudit.propTypes = {
  params: PropTypes.object.isRequired,
};

export default LoanAudit;
