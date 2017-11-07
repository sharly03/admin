import React from 'react';
import PropTypes from 'prop-types';
import { Form, Row, Col, Radio, Input, DatePicker, Button } from 'antd';

import styles from './refund.less';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Search = Input.Search;

class SettleForm extends React.Component {
  state = { status: '0' };

  handleSettleChange = e => {
    e.preventDefault();
    this.props.form.resetFields();
    this.setState({ status: e.target.value });
  };

  handleSettleSubmit = () => {
    const { validateFields } = this.props.form;
    validateFields((err, values) => {
      if (!err) {
        const { settleDate, ...fields } = values;
        settleDate && (fields.settleDate = settleDate.format('x'));
        this.props.onSubmit(fields);
      }
    });
  };

  render() {
    const settleWayOptions = [
      { label: '正常', value: '0' },
      { label: '提前', value: '-1' },
      { label: '逾期', value: '1' },
    ];
    const itemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 12 },
    };
    const { getFieldDecorator } = this.props.form;
    const status = this.state.status;
    return (
      <Row className={styles['settle-form']} gutter={24} type="flex">
        <Col span={12}>
          <p className="list-title">结算方式</p>
          <FormItem label="结算方式" {...itemLayout}>
            {getFieldDecorator('settleMode', { initialValue: '0' })(
              <RadioGroup options={settleWayOptions} onChange={this.handleSettleChange} />
            )}
          </FormItem>
          {
            status === '-1' &&
            <FormItem label="结算日期" {...itemLayout}>
              {getFieldDecorator('settleDate', {
                rules: [{ required: true, message: '请填写结算日期' }],
              })(<DatePicker style={{ width: '100%' }} />)}
            </FormItem>
          }
          {
            (status === '-1' || status === '1') &&
            <FormItem label="补息天数" {...itemLayout}>
              {getFieldDecorator('penaltyDays', {
                rules: [{ required: true, whitespace: true, message: '请填写补息天数' }],
              })(<Search placeholder="请输入" onSearch={this.handleSettleSubmit} />)}
            </FormItem>
          }
        </Col>
        <Col span={24}>
          <FormItem style={{ textAlign: 'center' }}>
            <Button type="primary" onClick={this.handleSettleSubmit}>提交</Button>
          </FormItem>
        </Col>
      </Row>
    );
  }
}

SettleForm.propTypes = {
  form: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default Form.create()(SettleForm);
