import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Modal, Select, Radio } from 'antd';

const FormItem = Form.Item;
const { Option } = Select;

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};
const NORMAL = 'normal';
const statusOptions = [
  { label: '正常', value: NORMAL },
  { label: '冻结', value: 'freeze' },
];
class EditModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roleOptions: null,
    };
  }
  state = {
    roleOptions: null,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible) {
      if (!nextProps.visible) {
        // 窗口关闭前，重置form
        this.props.form.resetFields();
      } else {
        const roleOptions = nextProps.roles.map(({ roleName, id }) => {
          return <Option key={id} value={id}>{roleName}</Option>;
        });
        this.setState({ roleOptions });
      }
    }
  }

  handleOk = () => {
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        return;
      }
      if (this.props.type === 'edit') {
        values.id = this.props.item.id;
      }
      console.log(values);
      this.props.onOk(values);
    });
  };

  // 选择器过滤条件，根据显示的值来进行筛选
  handleFilterOption = (input, option) => {
    return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
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
      title: `${type === 'create' ? '新增后台用户' : '编辑后台用户'}`,
      visible,
      onOk: this.handleOk,
      onCancel,
      confirmLoading: this.props.submitting,
      wrapClassName: 'vertical-center-modal',
    };

    return (
      <Modal {...modalOpts}>
        <Form layout="horizontal">
          <FormItem label="角色" {...formItemLayout}>
            {getFieldDecorator('role', {
              initialValue: item.role && String(item.role),
              rules: [
                {
                  required: true,
                  message: '角色不能为空',
                },
              ],
            })(<Select showSearch
              optionFilterProp="children"
              filterOption={this.handleFilterOption}
              placeholder="请选择角色"
            >{this.state.roleOptions}</Select>)}
          </FormItem>

          <FormItem label="姓名" hasFeedback {...formItemLayout}>
            {getFieldDecorator('name', {
              initialValue: item.name,
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: '姓名不能为空',
                },
              ],
            })(<Input placeholder="请输入姓名" />)}
          </FormItem>
          <FormItem label="手机号" hasFeedback {...formItemLayout}>
            {getFieldDecorator('mobile', {
              initialValue: item.mobile,
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: '手机号不能为空',
                },
              ],
            })(<Input placeholder="请输入手机号" />)}
          </FormItem>

          <FormItem label="邮箱" hasFeedback {...formItemLayout}>
            {getFieldDecorator('email', {
              initialValue: item.email,
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: '邮箱不能为空',
                },
                {
                  type: 'url',
                  message: 'url不合法，请重新输入',
                },
              ],
            })(<Input placeholder="请输入邮箱" />)}
          </FormItem>

          { type === 'create' ? <FormItem label="密码" hasFeedback {...formItemLayout}>
            {getFieldDecorator('password', {
              initialValue: item.password,
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: '密码不能为空',
                },
              ],
            })(<Input type="" placeholder="请输入密码" />)}
          </FormItem> : null }

          <FormItem label="状态" {...formItemLayout}>
            {getFieldDecorator('status', {
              initialValue: item.status || NORMAL,
              rules: [
                {
                  required: true,
                  message: '请选择状态',
                },
              ],
            })(
              <Radio.Group options={statusOptions} />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

EditModal.propTypes = {
  form: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  roles: PropTypes.array.isRequired,
  type: PropTypes.string.isRequired,
  item: PropTypes.object.isRequired,
  submitting: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
};

export default Form.create()(EditModal);
