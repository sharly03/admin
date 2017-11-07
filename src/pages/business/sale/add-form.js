import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Form, Radio, Input, Select, Button } from 'antd';

const FormItem = Form.Item;
const { Group: RadioGroup, Button: RadioButton } = Radio;
const { TextArea } = Input;
const { Option } = Select;

class AddForm extends React.Component {
  state = {
    type: 'group',
  };

  handleRadioChange = e => {
    const type = e.target.value;
    const { resetFields } = this.props.form;
    this.setState({ type });
    resetFields();
  };
  handleMaintainSubmit = () => {
    const { getFieldsValue } = this.props.form;
    console.log('--------------', getFieldsValue());
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { type } = this.state;

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };

    return (
      <Row gutter={24} type="flex">
        <Col span={12}>
          <FormItem wrapperCol={{ span: 12, offset: 6 }}>
            {getFieldDecorator('type', { initialValue: 'group' })(
              <RadioGroup onChange={this.handleRadioChange}>
                <RadioButton value="group">用户组</RadioButton>
                <RadioButton value="user">新增用户</RadioButton>
              </RadioGroup>
            )}
          </FormItem>
          {
            type === 'group' &&
            <FormItem label="用户组" {...formItemLayout}>
              {getFieldDecorator('group')(
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  palaceholder="请选择"
                  optionFilterProp="children"
                >
                  <Option value="01">薪乐宝</Option>
                  <Option value="02">高富帅</Option>
                  <Option value="04">矮矬穷</Option>
                  <Option value="05">矮矬穷</Option>
                  <Option value="06">abc</Option>
                  <Option value="07">矮矬穷</Option>
                  <Option value="08">矮矬穷</Option>
                </Select>
              )}
            </FormItem>
          }
          {
            type === 'user' &&
            <FormItem label="用户手机号" {...formItemLayout}>
              {getFieldDecorator('mobile')(<TextArea placeholder="每个号码请用英文（;）隔开" autosize={{ minRows: 2, maxRows: 6 }} />)}
            </FormItem>
          }
          <FormItem label="购买限额" {...formItemLayout}>
            {getFieldDecorator('buy', {
              rules: [{ message: '请输入购买限额', required: true }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col span={24}>
          <FormItem style={{ textAlign: 'center' }}>
            <Button type="primary" onClick={this.handleMaintainSubmit}>添加</Button>
          </FormItem>
        </Col>
      </Row>
    );
  }
}

AddForm.propTypes = {
  form: PropTypes.object.isRequired,
};

export default Form.create()(AddForm);
