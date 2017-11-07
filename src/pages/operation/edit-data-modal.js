import React from 'react';
import PropTypes from 'prop-types';
import { Form, InputNumber, Modal } from 'antd';


const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 12,
  },
};

class OperationDataModal extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible) {
      if (!nextProps.visible) {
        // 窗口关闭前，重置form
        this.props.form.resetFields();
      }
    }
  }

  handleOk = () => {
    this.props.form.validateFields((errors) => {
      if (errors) {
        return;
      }

      this.props.onOk({
        ...this.props.form.getFieldsValue(),
        id: this.props.item.id,
      });
    });
  };

  render() {
    const {
      visible,
      type,
      item = {},
      onCancel,
      form: {
        getFieldDecorator,
      },
    } = this.props;

    const modalOpts = {
      title: `${type === 'create' ? '新增运营数据' : '编辑运营数据'}`,
      visible,
      onOk: this.handleOk,
      onCancel,
      wrapClassName: 'vertical-center-modal',
    };
    // resetFields();
    return (
      <Modal {...modalOpts}>
        <Form layout="horizontal">
          <FormItem label="现金成交额(亿)" {...formItemLayout}>
            {getFieldDecorator('cash_done', {
              initialValue: item.cash_done,
              rules: [
                {
                  required: true,
                  type: 'number',
                  message: '现金成交额不能为空',
                },
              ],
            })(<InputNumber style={{ width: '100%' }} step={0.1} placeholder="请输入现金成交额" />)}
          </FormItem>

          <FormItem label="累计投资笔数(万笔)" {...formItemLayout}>
            {getFieldDecorator('invest_time', {
              initialValue: item.invest_time,
              rules: [
                {
                  required: true,
                  type: 'number',
                  message: '累计投资笔数不能为空',
                },
              ],
            })(<InputNumber style={{ width: '100%' }} step={0.1} placeholder="请输入累计投资笔数" />)}
          </FormItem>

          <FormItem label="注册用户数(万人)" {...formItemLayout}>
            {getFieldDecorator('user_total', {
              initialValue: item.user_total,
              rules: [
                {
                  required: true,
                  type: 'number',
                  message: '注册用户数不能为空',
                },
              ],
            })(
              <InputNumber style={{ width: '100%' }} step={0.1} placeholder="请输入注册用户数" />
            )}
          </FormItem>

          <FormItem label="安全运营天数(天)" {...formItemLayout}>
            {getFieldDecorator('safe_duration', {
              initialValue: item.safe_duration,
              rules: [
                {
                  required: true,
                  type: 'number',
                  message: '安全运营天数不能为空',
                },
              ],
            })(
              <InputNumber style={{ width: '100%' }} step={1} placeholder="请输入安全运营天数" />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

OperationDataModal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  item: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
};

export default Form.create()(OperationDataModal);
