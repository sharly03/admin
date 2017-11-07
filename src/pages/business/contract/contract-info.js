import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
// import moment from 'moment';
import { Form, Radio, Input, Row, Col, DatePicker, InputNumber, Select, Cascader } from 'antd';
import address from '../../../dao/address';
import { getPopupContainer, mapObjectToOptions, dateAreaToMoment } from '../../../utils';


const { Option } = Select;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const colProps = {
  span: 12,
};
const codeFormItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};
const leftFormItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};
const rightFormItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 10,
  },
};
const rightLongFormItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

// 借款人 or 放款人 类型
const BORROWER_TYPE = {
  enterprise: '企业',
  personal: '个人',
};
const borrowerOptions = mapObjectToOptions(BORROWER_TYPE);

// 证件类型
const CERTIFICATE_TYPE = {
  1: '组织结构代码',
  2: '营业执照',
  3: '组织代码（附属机构）',
  4: '其他',
  5: '身份证',
};
const certificateOptions = mapObjectToOptions(CERTIFICATE_TYPE);

// 还款方式
const SETTLEMENT_TYPE = {
  '01': '按月付息',
  '02': '按季付息',
  '03': '一次性付息',
  '04': '等额本息',
  '05': '先息后本',
  '06': '到期还本付息',
};


class ContractInfo extends React.Component {
  state = {
    isAllowAdvance: false,
    isAllowDelay: false,
    bankOptions: [],
    districtCode: [],
    bankCode: [],
  };
  static propTypes = {
    form: PropTypes.object.isRequired,
    contractEditing: PropTypes.bool.isRequired,
    dataSource: PropTypes.object.isRequired,
    banks: PropTypes.array.isRequired,
    onSelectBranch: PropTypes.func.isRequired,
    bankBranches: PropTypes.array.isRequired,
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.dataSource.overdueEnabled !== nextProps.dataSource.overdueEnabled && nextProps.dataSource.overdueEnabled === 1) {
      this.setState({ isAllowDelay: true });
    }
    if (this.props.dataSource.advanceEnabled !== nextProps.dataSource.advanceEnabled && nextProps.dataSource.advanceEnabled === 1) {
      this.setState({ isAllowAdvance: true });
    }

    if (!isEqual(this.props.banks, nextProps.banks)) {
      const bankOptions = nextProps.banks.map(item => {
        return <Option key={item.id} value={item.appBankCode}>{item.bankName}</Option>;
      });
      this.setState({ bankOptions });
    }

    if (!isEqual(this.props.bankBranches, nextProps.bankBranches)) {
      const bankBranchOptions = nextProps.bankBranches.map(item => {
        return <Option key={item.unionBankNumber} value={item.unionBankNumber}>{item.bankName}</Option>;
      });
      this.setState({ bankBranchOptions });
    }
  }
  renderMaxAdvance = () => {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <FormItem label="最大提前天数" {...leftFormItemLayout}>
          {this.props.contractEditing ? getFieldDecorator('advanceMaxDays', {
            initialValue: this.props.dataSource.advanceMaxDays,
            rules: [
              {
                required: true,
                message: '最大提前天数不能为空',
              },
              {
                type: 'number',
                min: 0,
                message: '最小值0',
              },
              {
                type: 'number',
                max: 1000,
                message: '最大值为1000',
              },
            ],
          })(<InputNumber />) : <span>{this.props.dataSource.advanceMaxDays}</span>}
          <span className="margin-left">天</span>
        </FormItem>
      </div>
    );
  };

  renderMaxDelay = () => {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <FormItem label="最大逾期天数" {...rightFormItemLayout}>
          {this.props.contractEditing ? getFieldDecorator('overdueMaxDays', {
            initialValue: this.props.dataSource.overdueMaxDays,
            rules: [
              {
                required: true,
                message: '最大逾期天数不能为空',
              },
              {
                type: 'number',
                min: 0,
                message: '最小值0',
              },
              {
                type: 'number',
                max: 1000,
                message: '最大值为1000',
              },
            ],
          })(<InputNumber min={0} max={1000} />) : <span>{this.props.dataSource.advanceMaxDays}</span>}
          <span className="margin-left">天</span>
        </FormItem>
      </div>
    );
  };
  handleRadioChangeAd = (e) => {
    this.setState({
      isAllowAdvance: e.target.value,
    });
  };

  handleRadioChangeDelay = (e) => {
    this.setState({
      isAllowDelay: e.target.value,
    });
  };
  handleBankChange = (bank) => {
    const district = this.props.form.getFieldValue('district');
    const districtCode = district[1];
    this.props.form.setFieldsValue({ bankBranchName: null });
    districtCode && this.props.onSelectBranch(bank, districtCode);
  }

  handleCityChange = (district) => {
    const bank = this.props.form.getFieldValue('loanAccountBank');
    const districtCode = district[1];
    this.props.form.setFieldsValue({ bankBranchName: null });
    bank && this.props.onSelectBranch(bank, districtCode);
  };

  // 计算融资人利息 融资利率 * 融资利率 ？？
  handleRateChange = (value) => {
    const amount = this.props.form.getFieldValue('contractAmount');
    const date = this.props.form.getFieldValue('loanDate');
    if (isNaN(value) || !amount || date.length === 0) return;
    const timeDiff = date[1].diff(date[0], 'days');
    const interest = Math.floor(amount * value / 100 * (timeDiff + 1) / 365 * 100) / 100;
    this.props.form.setFieldsValue({ interest });
  }
  // 计算融资人利息
  handleAmountChange = (value) => {
    const rate = this.props.form.getFieldValue('financingRate');
    const date = this.props.form.getFieldValue('loanDate');
    if (isNaN(value) || !rate || date.length === 0) return;
    const timeDiff = date[1].diff(date[0], 'days');
    const interest = Math.floor(rate * value / 100 * (timeDiff + 1) / 365 * 100) / 100;
    this.props.form.setFieldsValue({ interest });
  }
  // 计算借款起止日期天数
  handleDateChange = (value) => {
    const rate = this.props.form.getFieldValue('financingRate');
    const amount = this.props.form.getFieldValue('contractAmount');
    const date = value[1].diff(value[0], 'days');
    if (!amount || !rate || date.length === 0) return;
    const interest = Math.floor(rate * rate / 100 * (date + 1) / 365 * 100) / 100;
    this.props.form.setFieldsValue({ interest });
  }

  render() {
    const {
      form: {
        getFieldDecorator,
      },
    } = this.props;
    const item = this.props.dataSource;
    // item.bank = {
    //   value: item.bankCode,
    //   label: item.bankName,
    // };
    item.city = {
      value: item.provinceCode,
      label: item.provinceName,
    };

    const district = [];
    if (item.provinceCode && item.districtCode) {
      district.push(item.provinceCode);
      district.push(item.districtCode);
    }
    const loanDate = dateAreaToMoment(item.incomeBeginDate, item.incomeEndDate);
    // if (item.incomeBeginDate) {
    //   loanDate[0] = moment(item.incomeBeginDate);
    // }
    // if (item.incomeEndDate) {
    //   loanDate[1] = moment(item.incomeEndDate);
    // }

    const addressList = address;
    const { contractEditing } = this.props;
    return (
      <div className="main">
        <Row gutter={24} className="line-depart">
          <Col {...colProps}>
            <FormItem label="合同编号" {...codeFormItemLayout}>
              {contractEditing ? getFieldDecorator('contractNo', {
                initialValue: item.contractNo,
                rules: [
                  {
                    required: true,
                    message: '合同编号不能为空',
                  },
                  {
                    maxLength: 100,
                    message: '合同编号不能超过100个字符',
                  },
                ],
              })(<Input />) : <span>{item.contractNo}</span>}
            </FormItem>
          </Col>
          <Col {...colProps}>
            <FormItem label="融资利率" {...rightFormItemLayout}>
              {contractEditing ? getFieldDecorator('financingRate', {
                initialValue: item.financingRate,
                rules: [
                  {
                    required: true,
                    message: '融资利率不能为空',
                  },
                  {
                    type: 'number',
                    min: 0,
                    message: '最小值为0',
                  },
                  {
                    type: 'number',
                    max: 100,
                    message: '最大值为100',
                  },
                ],
              })(<InputNumber onChange={this.handleRateChange} />) : <span>{item.financingRate}</span>}
              <span className="margin-left">%</span>
            </FormItem>
          </Col>
          <Col {...colProps}>
            <FormItem label="合同金额" {...leftFormItemLayout}>
              {contractEditing ? getFieldDecorator('contractAmount', {
                initialValue: item.contractAmount,
                rules: [
                  {
                    required: true,
                    message: '合同金额不能为空',
                  },
                  {
                    type: 'number',
                    min: 0,
                    message: '最小值为0',
                  },
                  {
                    type: 'number',
                    max: 100000000,
                    message: '最大值为1亿',
                  },
                ],
              })(<InputNumber onChange={this.handleAmountChange} style={{ width: '70%' }} />) : <span>{item.contractAmount}</span>}
              <span className="margin-left">元</span>
            </FormItem>
          </Col>
          <Col {...colProps}>
            <FormItem label="融资人利息" {...rightFormItemLayout}>
              {contractEditing ? getFieldDecorator('interest', {
                initialValue: item.interest,
                rules: [
                  {
                    required: true,
                    message: '融资人利息不能为空',
                  },
                ],
              })(<Input readOnly style={{ width: '50%' }} />) : <span>{item.interest}</span>}
              <span className="margin-left">元</span>
            </FormItem>
          </Col>
          <Col {...colProps}>
            <FormItem label="借款起止日期" className="fix-range-picker-height" {...leftFormItemLayout}>
              {contractEditing ? getFieldDecorator('loanDate', {
                initialValue: loanDate,
                rules: [
                  {
                    required: true,
                    message: '借款起止日期不能为空',
                  },
                ],
              })(<RangePicker onChange={this.handleDateChange} placeholder={['开始日期', '结束日期']} format="YYYY-MM-DD" />) : <span>{loanDate[0] && loanDate[0].format('YYYY-MM-DD')} ~ {loanDate[1] && loanDate[1].format('YYYY-MM-DD')}</span>}
            </FormItem>
          </Col>
          <Col {...colProps}>
            <FormItem label="服务费率" {...rightFormItemLayout}>
              {contractEditing ? getFieldDecorator('serviceFee', {
                initialValue: item.serviceFee,
                rules: [
                  {
                    required: true,
                    message: '服务费率不能为空',
                  },
                  {
                    type: 'number',
                    min: 0,
                    message: '最小值0',
                  },
                  {
                    type: 'number',
                    max: 100,
                    message: '最大值为100',
                  },
                ],
              })(<InputNumber min={0} max={100} />) : <span>{item.serviceFee}</span>}
              <span className="margin-left">%</span>
            </FormItem>
          </Col>
          <Col {...colProps}>
            <FormItem label="还款方式" {...leftFormItemLayout}>
              {contractEditing ? getFieldDecorator('settlementType', {
                initialValue: item.settlementType,
                rules: [
                  {
                    required: true,
                    message: '还款方式不能为空',
                  },
                ],
              })(
                <Select getPopupContainer={getPopupContainer} size="large">
                  <Option value="01">按月付息</Option>
                  <Option value="02">按季付息</Option>
                  <Option value="03">一次性付息</Option>
                  <Option value="04">等额本息</Option>
                  <Option value="05">先息后本</Option>
                  <Option value="06">到期还本付息</Option>
                </Select>) : <span>{SETTLEMENT_TYPE[item.settlementType]}</span>}
            </FormItem>
          </Col>
          <Col {...colProps}>
            <FormItem label="账户管理费率" {...rightFormItemLayout}>
              {contractEditing ? getFieldDecorator('accountManageFee', {
                initialValue: item.accountManageFee,
                rules: [
                  {
                    required: true,
                    message: '账户管理费率不能为空',
                  },
                  {
                    type: 'number',
                    min: 0,
                    message: '最小值0',
                  },
                  {
                    type: 'number',
                    max: 100,
                    message: '最大值为100',
                  },
                ],
              })(<InputNumber min={1} max={100} />) : <span>{item.accountManageFee}</span>}
              <span className="margin-left">%</span>
            </FormItem>
          </Col>
          <Col {...colProps}>
            <FormItem label="还款期数" {...rightFormItemLayout}>
              {contractEditing ? getFieldDecorator('settlementPeriods', {
                initialValue: item.settlementPeriods,
                rules: [
                  {
                    required: true,
                    message: '还款期数不能为空',
                  },
                  {
                    type: 'number',
                    message: '请输入0~100数字',
                  },
                ],
              })(<InputNumber min={1} max={100} />) : <span>{item.settlementPeriods}</span>}
              <span className="margin-left">期</span>
            </FormItem>
          </Col>
          <Col {...colProps}>
            <FormItem label="逾期罚息率" {...rightFormItemLayout}>
              {contractEditing ? getFieldDecorator('overduePenaltyRate', {
                initialValue: item.overduePenaltyRate,
                rules: [
                  {
                    type: 'number',
                    min: 0,
                    message: '最小值0',
                  },
                  {
                    type: 'number',
                    max: 100,
                    message: '最大值为100',
                  },
                ],
              })(<InputNumber min={0} max={100} />) : <span>{item.overduePenaltyRate}</span>}
              <span className="margin-left">%</span>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24} className="line-depart">
          <Col {...colProps}>
            <FormItem label="借款人类型" {...leftFormItemLayout}>
              {contractEditing ? getFieldDecorator('accountType', {
                initialValue: item.accountType,
                rules: [
                  {
                    required: true,
                    message: '借款人类型不能为空',
                  },
                ],
              })(
                <Select getPopupContainer={getPopupContainer} style={{ width: '100%' }} size="large">
                  {borrowerOptions}
                </Select>
              ) : <span>{BORROWER_TYPE[item.accountType]}</span>}
            </FormItem>
          </Col>
          <Col {...colProps}>
            <FormItem label="借款人户名"{...rightLongFormItemLayout}>
              {contractEditing ? getFieldDecorator('accountName', {
                initialValue: item.accountName,
                rules: [
                  {
                    required: true,
                    message: '借款人户名不能为空',
                  },
                  {
                    maxLength: 50,
                    message: '请输入1~50字符',
                  },
                ],
              })(<Input />) : <span>{item.accountName}</span>}
            </FormItem>
          </Col>
          <Col {...colProps}>
            <FormItem label="借款人证件类型" {...leftFormItemLayout}>
              {contractEditing ? getFieldDecorator('certificateType', {
                initialValue: item.certificateType,
                rules: [
                  {
                    required: true,
                    message: '借款人证件类型不能为空',
                  },
                ],
              })(<Select getPopupContainer={getPopupContainer} style={{ width: '100%' }} size="large">{certificateOptions}</Select>) : <span>{CERTIFICATE_TYPE[item.certificateType]}</span>}
            </FormItem>
          </Col>
          <Col {...colProps}>
            <FormItem label="借款人账号" {...rightLongFormItemLayout}>
              {contractEditing ? getFieldDecorator('accountNo', {
                initialValue: item.accountNo,
                rules: [
                  {
                    required: true,
                    message: '借款人账号不能为空',
                  },
                  {
                    maxLength: 50,
                    message: '请输入1~50字符',
                  },
                ],
              })(<Input />) : <span>{item.accountNo}</span>}
            </FormItem>
          </Col>
          <Col {...colProps}>
            <FormItem label="借款人证件号码" {...leftFormItemLayout}>
              {contractEditing ? getFieldDecorator('certificateNo', {
                initialValue: item.certificateNo,
                rules: [
                  {
                    required: true,
                    message: '借款人证件号码不能为空',
                  },
                  {
                    maxLength: 50,
                    message: '请输入1~50字符',
                  },
                ],
              })(<Input />) : <span>{item.certificateNo}</span>}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24} className="line-depart">
          <Col {...colProps}>
            <FormItem label="放款账户类型" {...leftFormItemLayout}>
              {contractEditing ? getFieldDecorator('loanAccountType', {
                initialValue: item.loanAccountType,
                rules: [
                  {
                    required: true,
                    message: '放款账户类型不能为空',
                  },
                ],
              })(
                <Select getPopupContainer={getPopupContainer} style={{ width: '100%' }} size="large">
                  {borrowerOptions}
                </Select>) : <span>{BORROWER_TYPE[item.loanAccountType]}</span>}
            </FormItem>
          </Col>
          <Col {...colProps}>
            <FormItem label="请选择银行" {...rightLongFormItemLayout}>
              {contractEditing ? getFieldDecorator('loanAccountBank', {
                initialValue: item.loanAccountBank,
                rules: [
                  {
                    required: true,
                    message: '请选择银行',
                  },
                ],
              })(
                <Select getPopupContainer={getPopupContainer} style={{ width: '100%' }} size="large" onChange={this.handleBankChange}>
                  {this.state.bankOptions}
                </Select>
              ) : <span>{item.loanAccountBankName}</span> }
            </FormItem>
          </Col>
          <Col {...colProps}>
            <FormItem label="放款账户户名" {...leftFormItemLayout}>
              {contractEditing ? getFieldDecorator('loanAccountName', {
                initialValue: item.loanAccountName,
                rules: [
                  {
                    required: true,
                    message: '放款账户户名不能为空',
                  },
                  {
                    maxLength: 50,
                    message: '请输入1~50字符',
                  },
                ],
              })(<Input />) : <span>{item.loanAccountName}</span>}
            </FormItem>
          </Col>
          <Col {...colProps}>
            <FormItem label="请选择省市" {...rightLongFormItemLayout}>
              {contractEditing ? getFieldDecorator('district', {
                initialValue: district,
                rules: [
                  {
                    required: true,
                    type: 'array',
                    message: '请选择银行省市',
                  },
                ],
              })(<Cascader placeholder="请选择省市" options={addressList} getPopupContainer={getPopupContainer} onChange={this.handleCityChange} />) : <span>{item.provinceName} {item.districtName}</span>}
            </FormItem>
          </Col>
          <Col {...colProps}>
            <FormItem label="放款账户账号" {...leftFormItemLayout}>
              {contractEditing ? getFieldDecorator('loanAccountNo', {
                initialValue: item.loanAccountNo,
                rules: [
                  {
                    required: true,
                    message: '放款账户账号不能为空',
                  },
                  {
                    maxLength: 50,
                    message: '请输入1~50字符',
                  },
                ],
              })(<Input />) : <span>{item.loanAccountNo}</span>}
            </FormItem>
          </Col>
          <Col {...colProps}>
            <FormItem label="请选择支行" {...rightLongFormItemLayout}>
              {contractEditing ? getFieldDecorator('bankBranchName', {
                initialValue: item.bankBranchName,
                rules: [
                  {
                    required: true,
                    message: '请选择银行支行',
                  },
                ],
              })(<Select getPopupContainer={getPopupContainer} style={{ width: '100%' }} size="large">
                {this.state.bankBranchOptions}
              </Select>) : <span>{item.bankBranchName}</span>}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24} className="line-depart">
          <Col {...colProps}>
            <FormItem label="允许提前还款" {...leftFormItemLayout}>
              {contractEditing ? getFieldDecorator('advanceEnabled', {
                initialValue: item.advanceEnabled,
                rules: [
                  {
                    required: true,
                    type: 'number',
                    message: '请选择是否允许提前还款',
                  },
                ],
              })(<RadioGroup onChange={this.handleRadioChangeAd}>
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </RadioGroup>) : <span>{item.advanceEnabled === 1 ? '是' : '否'}</span>}
            </FormItem>
            {this.state.isAllowAdvance ? this.renderMaxAdvance() : ''}
            <FormItem label="借钱用途" {...codeFormItemLayout}>
              {contractEditing ? getFieldDecorator('borrowPurpose', {
                initialValue: item.borrowPurpose,
                rules: [
                  {
                    required: true,
                    message: '借钱用途不能为空',
                  },
                  {
                    maxLength: 300,
                    message: '请输入1~300字符',
                  },
                ],
              })(<TextArea rows={4} style={{ resize: 'none' }} />) : <span>{item.borrowPurpose}</span>}
            </FormItem>
          </Col>
          <Col {...colProps}>
            <FormItem label="允许逾期还款" {...leftFormItemLayout}>
              {contractEditing ? getFieldDecorator('overdueEnabled', {
                initialValue: item.overdueEnabled,
                rules: [
                  {
                    required: true,
                    type: 'number',
                    message: '请选择是否允许逾期还款',
                  },
                ],
              })(<RadioGroup disabled={!contractEditing} onChange={this.handleRadioChangeDelay}>
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </RadioGroup>) : <span>{item.overdueEnabled === 1 ? '是' : '否'}</span>}
            </FormItem>
            {this.state.isAllowDelay ? this.renderMaxDelay() : ''}
          </Col>
        </Row>
      </div>
    );
  }
}

export default ContractInfo;
