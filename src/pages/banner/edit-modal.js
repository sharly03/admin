import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, InputNumber, Modal, Icon, DatePicker, Select } from 'antd';
import moment from 'moment';

import { FileInput } from '../../components/form/file-input';
import { APP_TIPS } from '../../utils/constants';


const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { Option } = Select;
const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

class AdModal extends React.Component {
  state = {
    adpOptions: null,
    isTips: true,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible) {
      if (!nextProps.visible) {
        // 窗口关闭前，重置form
        this.props.form.resetFields();
      } else {
        const isTips = nextProps.item.positionCode === APP_TIPS;
        this.setState({ isTips });
      }
    }
  }

  handleOk = () => {
    this.props.form.validateFields((errors) => {
      if (errors) {
        return;
      }
      let fields = this.props.form.getFieldsValue();
      fields = this.processFields(fields);
      this.props.onOk(fields);
    });
  };

  handlePositionChange = (value) => {
    this.setState({ isTips: value === APP_TIPS });
    this.props.form.resetFields(['title']);
  }

  // 选择器过滤条件
  handleFilterOption = (input, option) => {
    return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  processFields = (fields) => {
    const { dataArea } = fields;
    if (dataArea.length) {
      fields.startTime = dataArea[0].format('YYYY-MM-DD HH:mm:ss');
      fields.endTime = dataArea[1].format('YYYY-MM-DD HH:mm:ss');
    }
    delete fields.dataArea;
    fields.id = this.props.item.id;

    return fields;
  };

  renderUploadButton = () => {
    return (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">点击上传</div>
      </div>
    );
  }

  render() {
    const {
      visible,
      type,
      item = {},
      onCancel,
      positions,
      form: {
        getFieldDecorator,
      },
    } = this.props;

    const positionOptions = positions.map(position => {
      return <Option key={position.code} value={position.code}>{position.name}</Option>;
    });
    const { isTips } = this.state;
    const modalOpts = {
      title: `${type === 'create' ? '新增广告' : '编辑广告'}`,
      visible,
      onOk: this.handleOk,
      onCancel,
      wrapClassName: 'vertical-center-modal',
    };

    let initialCreateTime = [];
    if (item.startTime) {
      initialCreateTime[0] = moment(item.startTime);
    }
    if (item.endTime) {
      initialCreateTime[1] = moment(item.endTime);
    }

    return (
      <Modal {...modalOpts}>
        <Form layout="horizontal" autoComplete="off">
          <FormItem label="广告位置" {...formItemLayout}>
            {getFieldDecorator('positionCode', {
              initialValue: item.positionCode,
              rules: [
                {
                  required: true,
                  message: '广告位不能为空',
                },
              ],
            })(<Select showSearch
              optionFilterProp="children"
              filterOption={this.handleFilterOption}
              onChange={this.handlePositionChange}
              disabled={type === 'edit'}
              placeholder="请选择广告位"
            >{positionOptions}</Select>)}
          </FormItem>

          <FormItem label={isTips ? '小贴士内容' : '广告名称'} hasFeedback {...formItemLayout}>
            {getFieldDecorator('title', {
              initialValue: item.title,
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: `${isTips ? '小贴士内容' : '广告名称'}不能为空`,
                },
                {
                  max: 20,
                  message: '请控制长度在20个字符以内',
                },
              ],
            })(<Input placeholder="请输入广告位名称" />)}
          </FormItem>

          { isTips ? null : <FormItem label="跳转地址" hasFeedback {...formItemLayout}>
            {getFieldDecorator('url', {
              initialValue: item.url,
              rules: [
                {
                  type: 'url',
                  message: 'url不合法，请重新输入',
                },
                {
                  max: 100,
                  message: '请控制长度在100个字符以内',
                },
              ],
            })(<Input placeholder="请输入跳转地址" />)}
          </FormItem>}

          <FormItem label="有效时间" {...formItemLayout}>
            {getFieldDecorator('dataArea', {
              initialValue: initialCreateTime,
              rules: [
                {
                  required: true,
                  message: '请输入有效时间',
                },
              ],
            })(
              <RangePicker showTime placeholder={['开始时间', '结束时间']} format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} size="large" />
            )}
          </FormItem>

          { isTips ? null : <FormItem label="广告banner图" {...formItemLayout} extra="请上传640*260px的图片；图片大小不得超过1M; 仅支持jpg、jpeg、png格式的图片；">
            {getFieldDecorator('imgKey', {
              initialValue: item.imgKey,
              rules: [
                {
                  required: true,
                  message: '请上传广告banner图',
                },
              ],
            })(<FileInput token={this.props.token} maxLength={3} onTokenRefresh={this.props.onTokenRefresh} />)}
          </FormItem>}

          <FormItem label="显示顺序" {...formItemLayout}>
            {getFieldDecorator('sequence', {
              initialValue: item.sequence,
              rules: [
                {
                  required: true,
                  message: '请输入显示顺序',
                },
                {
                  min: 0,
                  type: 'number',
                  message: '最小值为0',
                },
                {
                  max: 10000,
                  type: 'number',
                  message: '最大值为10000',
                },
              ],
            })(<InputNumber />)}
            <span>数值越大，排序越前</span>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

AdModal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired,
  item: PropTypes.object.isRequired,
  positions: PropTypes.array.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  onTokenRefresh: PropTypes.func.isRequired,
};

export default Form.create()(AdModal);
