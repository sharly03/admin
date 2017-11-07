import React from 'react';
import PropTypes from 'prop-types';
import { Form, Row, Col, Radio, Input, Checkbox, Select, Button, DatePicker, message, Spin, Modal } from 'antd';
import moment from 'moment';
import { dateFormat, formatDecimal2, formatDecimal } from '../../../utils/index';
import dao from '../../../dao/commodity';
import { parseParam } from '../../../utils/location-helper';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
const confirm = Modal.confirm;

// const commodityTypes = {
//   '01': '普通标',
//   '02': '体验标',
//   '03': '新手标',
//   '04': '定向标',
// };
const itemLayout1 = {
  labelCol: { span: 3 },
  wrapperCol: { span: 21 },
};
const itemLayout2 = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};

class BaseForm extends React.Component {
  state = {
    loading: false,
    assetsSource: [],
    contractSource: [],
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataSource !== this.props.dataSource) {
      console.log('will props', nextProps);
      const currentContract = nextProps.dataSource.contract;
      this.setState({ contractSource: [currentContract] });
    }
  }

  async fetchAssets(query) {
    this.assetPendding && this.assetPendding.cancel();
    this.assetPendding = dao.fetchAssets(query);
    this.setState({ loading: true });
    const data = await this.assetPendding;
    this.setState({ loading: false });
    if (data.code === 0) {
      this.setState({ assetsSource: data.data });
    } else {
      message.error(data.msg);
    }
  }
  async fetchContract(query) {
    this.contractPendding && this.contractPendding.cancel();
    this.contractPendding = dao.fetchContracts(query);
    const data = await this.contractPendding;
    if (data.code === 0) {
      this.setState({ contractSource: data.data });
    } else {
      message.error(data.msg);
    }
  }

  saveCommodityBase(query) {
    confirm({
      title: '确定保存吗？',
      okText: '继续',
      onOk: async () => {
        const { commodityId } = parseParam(location.search);
        const data = await dao.baseUpdate({ ...query, id: commodityId });
        if (data.code === 0) {
          message.success(data.msg);
          this.props.onNext();
        } else {
          message.error(data.msg);
        }
      },
    });
  }

  handleCommodityTypeChange = value => {
    const { dataSource } = this.props;
    this.props.onDataChange({
      ...dataSource,
      commodityType: value,
    });
  };
  handleBaseRateChange = value => {
    const { getFieldValue, setFieldsValue } = this.props.form;
    let incentiveAnnualRate = parseFloat(getFieldValue('incentiveAnnualRate'));
    isNaN(incentiveAnnualRate) && (incentiveAnnualRate = 0);
    isNaN(value) && (value = 0);
    const annualRate = incentiveAnnualRate + value;
    const thousandsIncome = annualRate * 100 / 365;
    setFieldsValue({
      annualRate: formatDecimal2(annualRate),
      thousandsIncome: formatDecimal(thousandsIncome, 3),
    });
  };
  handleIncentiveChange = value => {
    const { getFieldValue, setFieldsValue } = this.props.form;
    let baseAnnualRate = parseFloat(getFieldValue('baseAnnualRate'));
    isNaN(baseAnnualRate) && (baseAnnualRate = 0);
    isNaN(value) && (value = 0);
    const annualRate = baseAnnualRate + value;
    const thousandsIncome = annualRate * 100 / 365;
    setFieldsValue({
      annualRate: formatDecimal2(annualRate),
      thousandsIncome: formatDecimal(thousandsIncome, 3),
    });
  };
  handleIncomeDate = dates => {
    const [start, end] = dates;
    const incomeBeginDate = start.unix();
    const incomeEndDate = end.unix();
    const incomePeriod = (incomeEndDate - incomeBeginDate) / 3600 / 24 + 1;
    const { setFieldsValue } = this.props.form;
    setFieldsValue({ incomePeriod });
  };
  handleAssetSelectSearch = value => {
    if (!value) return;
    this.timer && clearTimeout(this.timer);
    this.timer = setTimeout(() => this.fetchAssets({ displayName: value }), 500);
  };
  handleAssetSelect = value => {
    console.log('-----', value);
    this.fetchContract({ assetsCooperativeUserId: value });
  };
  handleNext = () => {
    const { validateFields } = this.props.form;
    validateFields((err, fields) => {
      if (!err) {
        const { incomeDate, repayDate, buyTime, contract } = fields;
        const [incomeBeginDate, incomeEndDate] = incomeDate.map(mt => mt && mt.format('x'));
        const [buyBeginTime, buyEndTime] = buyTime.map(mt => mt && mt.format('x'));
        const form = {
          ...fields,
          incomeBeginDate,
          incomeEndDate,
          buyBeginTime,
          buyEndTime,
          repayDate: repayDate && repayDate.format('x'),
        };
        if (contract) {
          const { assetsSource, contractSource } = this.state;
          const currentContract = contractSource.find(item => item.contractNo === contract.contractNo);
          const currentAsset = assetsSource.find(item => `${item.id}` === contract.assetsCooperativeUserName);
          form.contract = {
            assetsCooperativeUserName: currentAsset ? currentAsset.displayName : undefined,
            ...currentContract,
          };
        }
        this.saveCommodityBase(form);
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { type, dataSource } = this.props;
    const isPreview = type === 'preview' || type === 'audit';
    const {
      commodityType = '01',
      contract = {},
      commodityCode,
      baseAnnualRate,
      incentiveAnnualRate,
      annualRate,
      thousandsIncome,
      incomeBeginDate,
      incomeEndDate,
      incomePeriod,
      totalAmount,
      repayDate,
      buyBeginTime,
      buyEndTime,
      overduePenaltyRate,
      minPurchaseAmount,
      purchaseStepAmount,
      sealPeriodDays,
      promotionCode,
    } = dataSource;
    const { loading, assetsSource, contractSource } = this.state;
    const assetOptions = assetsSource.map(({ id, displayName }) => <Option key={id}>{displayName}</Option>);
    const contractOptions = contractSource.map(({ contractNo, id }) => <Option key={id} value={contractNo}>{contractNo}</Option>);

    return (
      <Row gutter={24} type="flex">
        <Col span={24}>
          <FormItem label="项目类型" {...itemLayout1} required>
            <Radio checked disabled={isPreview}>薪享宝</Radio>
          </FormItem>
        </Col>
        <Col span={24}>
          <FormItem label="产品类型" {...itemLayout1} required>
            {getFieldDecorator('commodityType', {
              initialValue: '01',
              rules: [{ message: '输入不能为空', required: true }],
            })(
              <RadioGroup disabled={isPreview} onChange={e => this.handleCommodityTypeChange(e.target.value)}>
                <Radio value="01">普通标</Radio>
                <Radio value="02">体验标</Radio>
                <Radio value="03">新手标</Radio>
              </RadioGroup>
            )}
          </FormItem>
        </Col>
        {
          commodityType !== '02' && <Col span={24}>
            <FormItem label="资产方名称" {...itemLayout1} required>
              <Col span={7}>
                <FormItem>
                  {
                    isPreview ? <span>{contract.assetsCooperativeUserName}</span> : getFieldDecorator('contract.assetsCooperativeUserName', {
                      rules: [{ message: '输入不能为空', required: true }],
                    })(<Select
                      style={{ width: '100%' }}
                      notFoundContent={loading ? <Spin size="small" /> : null}
                      defaultActiveFirstOption={false}
                      showArrow={false}
                      showSearch
                      filterOption={false}
                      onSearch={this.handleAssetSelectSearch}
                      onSelect={this.handleAssetSelect}
                    >{assetOptions}</Select>)
                  }
                </FormItem>
              </Col>
              <Col span={1} />
              <Col span={16}>
                <FormItem>
                  <Col span={8}>
                    <FormItem>
                      {getFieldDecorator('showAssetUserData', { valuePropName: 'checked' })(<Checkbox disabled={isPreview}>显示融资方审核材料图片</Checkbox>)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem>
                      {getFieldDecorator('showGuarantorData', { valuePropName: 'checked' })(<Checkbox disabled={isPreview}>显示担保方审核材料图片</Checkbox>)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem>
                      {getFieldDecorator('showGuarantorIntroduce', { valuePropName: 'checked' })(<Checkbox disabled={isPreview}>显示担保方介绍信息</Checkbox>)}
                    </FormItem>
                  </Col>
                </FormItem>
              </Col>
            </FormItem>
          </Col>
        }
        {
          commodityType !== '02' && <Col span={12}>
            <FormItem label="合同编号" {...itemLayout2} required>
              {
                isPreview ? <span>{contract.contractNo}</span> : getFieldDecorator('contract.contractNo', {
                  rules: [{ message: '输入不能为空', required: true }],
                })(
                  <Select style={{ width: '100%' }}>
                    {contractOptions}
                  </Select>
                )
              }
            </FormItem>
          </Col>
        }
        <Col span={12}>
          <FormItem label="产品编号" {...itemLayout2} required>
            {
              isPreview ? <span>{commodityCode}</span> : getFieldDecorator('commodityCode', {
                rules: [{ message: '输入不能为空', required: true, whitespace: true }],
              })(<Input />)
            }
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem label="基础利率" {...itemLayout2} required>
            <Col span={8}>
              <FormItem>
                {
                  isPreview ? <span>{baseAnnualRate && `${baseAnnualRate}%`}</span> : getFieldDecorator('baseAnnualRate', {
                    rules: [{ message: '输入不能为空', required: true, transform: value => parseFloat(value), type: 'number' }],
                  })(<Input onChange={e => this.handleBaseRateChange(parseFloat(e.target.value))} maxLength="10" />)
                }
              </FormItem>
            </Col>
            {!isPreview && <Col span={1}><span style={{ marginLeft: 8 }}>%</span></Col>}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem label="奖励" {...itemLayout2}>
            <Col span={8}>
              <FormItem>
                {
                  isPreview ? <span>{incentiveAnnualRate && `${incentiveAnnualRate}%`}</span> :
                    getFieldDecorator('incentiveAnnualRate')(<Input onChange={e => this.handleIncentiveChange(parseFloat(e.target.value))} maxLength="10" />)
                }
              </FormItem>
            </Col>
            {!isPreview && <Col span={1}><span style={{ marginLeft: 8 }}>%</span></Col>}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem label="预期年化率" {...itemLayout2} required>
            <Col span={8}>
              <FormItem>
                {
                  isPreview ? <span>{annualRate && `${annualRate}%`}</span> : getFieldDecorator('annualRate', {
                    rules: [{ message: '输入不能为空', required: true, whitespace: true }],
                  })(<Input disabled />)
                }
              </FormItem>
            </Col>
            {!isPreview && <Col span={1}><span style={{ marginLeft: 8 }}>%</span></Col>}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem label="万分日收益" {...itemLayout2} required>
            <Col span={8}>
              <FormItem>
                {
                  isPreview ? <span>{thousandsIncome}</span> : getFieldDecorator('thousandsIncome', {
                    rules: [{ message: '输入不能为空', required: true, whitespace: true }],
                  })(<Input disabled />)
                }
              </FormItem>
            </Col>
            {!isPreview && <Col span={1}><span style={{ marginLeft: 8 }}>元</span></Col>}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem label="收益期" {...itemLayout2} required>
            {
              isPreview ? <span>{incomeBeginDate && incomeEndDate && `${dateFormat(incomeBeginDate)}~${dateFormat(incomeEndDate)}`}</span> : getFieldDecorator('incomeDate', {
                rules: [{ message: '输入不能为空', required: true }],
              })(<RangePicker onChange={this.handleIncomeDate} />)
            }
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem label="产品期限" {...itemLayout2} required>
            <Col span={8}>
              <FormItem>
                {
                  isPreview ? <span>{incomePeriod}</span> : getFieldDecorator('incomePeriod', {
                    rules: [{ message: '输入不能为空', required: true }],
                  })(<Input disabled />)
                }
              </FormItem>
            </Col>
            {!isPreview && <Col span={1}><span style={{ marginLeft: 8 }}>天</span></Col>}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem label="总金额" {...itemLayout2} required>
            <Col span={8}>
              <FormItem>
                {
                  isPreview ? <span>{totalAmount}</span> : getFieldDecorator('totalAmount', {
                    rules: [{ message: '输入不能为空', required: true, whitespace: true }],
                  })(<Input />)
                }
              </FormItem>
            </Col>
            {!isPreview && <Col span={1}><span style={{ marginLeft: 8 }}>元</span></Col>}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem label="还款日" {...itemLayout2} required>
            {
              isPreview ? <span>{repayDate && dateFormat(repayDate)}</span> : getFieldDecorator('repayDate', {
                rules: [{ message: '输入不能为空', required: true }],
              })(<DatePicker />)
            }
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem label="预售期" {...itemLayout2} required>
            {
              isPreview ? <span>{buyBeginTime && buyEndTime && `${dateFormat(buyBeginTime)}~${dateFormat(buyEndTime)}`}</span> : getFieldDecorator('buyTime', {
                rules: [{ message: '输入不能为空', required: true }],
              })(<RangePicker />)
            }
          </FormItem>
        </Col>
        {
          commodityType !== '02' && <Col span={12}>
            <FormItem label="逾期罚息率" {...itemLayout2} required>
              <Col span={8}>
                <FormItem>
                  {
                    isPreview ? <span>{overduePenaltyRate && `${overduePenaltyRate}%`}</span> : getFieldDecorator('overduePenaltyRate', {
                      rules: [{ message: '输入不能为空', required: true, whitespace: true }],
                    })(<Input />)
                  }
                </FormItem>
              </Col>
              {!isPreview && <Col span={1}><span style={{ marginLeft: 8 }}>%</span></Col>}
            </FormItem>
          </Col>
        }
        <Col span={12}>
          <FormItem label="最低购买金额" {...itemLayout2} required>
            <Col span={8}>
              <FormItem>
                {
                  isPreview ? <span>{minPurchaseAmount}</span> : getFieldDecorator('minPurchaseAmount', {
                    rules: [{ message: '输入不能为空', required: true, whitespace: true }],
                  })(<Input />)
                }
              </FormItem>
            </Col>
            {!isPreview && <Col span={1}><span style={{ marginLeft: 8 }}>元</span></Col>}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem label="最低购买步长" {...itemLayout2} required>
            <Col span={8}>
              <FormItem>
                {
                  isPreview ? <span>{purchaseStepAmount}</span> : getFieldDecorator('purchaseStepAmount', {
                    rules: [{ message: '输入不能为空', required: true, whitespace: true }],
                  })(<Input />)
                }
              </FormItem>
            </Col>
            {!isPreview && <Col span={1}><span style={{ marginLeft: 8 }}>元</span></Col>}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem label="封闭期" {...itemLayout2} required>
            <Col span={8}>
              <FormItem>
                {
                  isPreview ? <span>{sealPeriodDays}</span> : getFieldDecorator('sealPeriodDays', {
                    rules: [{ message: '输入不能为空', required: true }],
                  })(<Input />)
                }
              </FormItem>
            </Col>
            {!isPreview && <Col span={1}><span style={{ marginLeft: 8 }}>天</span></Col>}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem label="产品促销" {...itemLayout2}>
            {
              isPreview ? <span>{promotionCode}</span> : getFieldDecorator('promotionCode')(<Input maxLength="30" />)
            }
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem wrapperCol={{ span: 12, offset: 6 }}>
            <Col span={12}>
              <FormItem>
                {getFieldDecorator('canUseCoupon', { valuePropName: 'checked' })(<Checkbox disabled={isPreview}>允许使用券</Checkbox>)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem>
                {getFieldDecorator('interestEnsure', { valuePropName: 'checked' })(<Checkbox disabled={isPreview}>本息保障</Checkbox>)}
              </FormItem>
            </Col>
          </FormItem>
        </Col>
        {
          !isPreview &&
          <Col span={24}>
            <FormItem style={{ textAlign: 'center' }}>
              <Button type="primary" onClick={this.handleNext}>下一步</Button>
            </FormItem>
          </Col>
        }
      </Row>
    );
  }
}
BaseForm.defaultProps = {
  dataSource: {},
  onNext: () => {},
  onDataChange: () => {},
};
BaseForm.propTypes = {
  type: PropTypes.string.isRequired,
  form: PropTypes.object.isRequired,
  dataSource: PropTypes.object,
  onNext: PropTypes.func,
  onDataChange: PropTypes.func,
};

export default Form.create({
  mapPropsToFields: props => {
    const {
      commodityType = '01',
      contract = {},
      showAssetUserData,
      showGuarantorData,
      showGuarantorIntroduce,
      commodityCode,
      baseAnnualRate,
      incentiveAnnualRate,
      annualRate,
      thousandsIncome,
      incomeBeginDate,
      incomeEndDate,
      incomePeriod,
      totalAmount,
      repayDate,
      buyBeginTime,
      buyEndTime,
      overduePenaltyRate,
      minPurchaseAmount,
      purchaseStepAmount,
      sealPeriodDays,
      promotionCode,
      canUseCoupon,
      interestEnsure,
    } = props.dataSource;
    return {
      commodityType: { value: commodityType },
      'contract.assetsCooperativeUserName': { value: contract.assetsCooperativeUserName },
      'contract.contractNo': { value: contract.contractNo },
      showAssetUserData: { value: showAssetUserData },
      showGuarantorData: { value: showGuarantorData },
      showGuarantorIntroduce: { value: showGuarantorIntroduce },
      commodityCode: { value: commodityCode },
      baseAnnualRate: { value: baseAnnualRate },
      incentiveAnnualRate: { value: incentiveAnnualRate },
      annualRate: { value: annualRate },
      thousandsIncome: { value: thousandsIncome },
      incomeDate: { value: [moment(incomeBeginDate, 'x'), moment(incomeEndDate, 'x')] },
      incomePeriod: { value: incomePeriod },
      totalAmount: { value: totalAmount },
      repayDate: { value: moment(repayDate, 'x') },
      buyTime: { value: [moment(buyBeginTime, 'x'), moment(buyEndTime, 'x')] },
      overduePenaltyRate: { value: overduePenaltyRate },
      minPurchaseAmount: { value: minPurchaseAmount },
      purchaseStepAmount: { value: purchaseStepAmount },
      sealPeriodDays: { value: sealPeriodDays },
      promotionCode: { value: promotionCode },
      canUseCoupon: { value: canUseCoupon },
      interestEnsure: { value: interestEnsure },
    };
  },
})(BaseForm);
