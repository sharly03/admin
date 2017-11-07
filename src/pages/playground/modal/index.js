import React from 'react';
import PropTypes from 'prop-types';

import { Modal, Button, Form, Input, InputNumber } from 'antd';

import styles from './modal.less';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

class ModalPage extends React.Component {
  state = { visible: false }
  showModal = () => {
    this.setState({
      visible: true,
    });
  }
  handleOk = (e) => {
    console.log(e);
    this.props.form.resetFields();
    this.setState({
      visible: false,
    });
  }
  handleCancel = (e) => {
    console.log(e);
    this.props.form.resetFields();
    this.setState({
      visible: false,
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    // const item = {};
    return (
      <div>
        <Button type="primary" onClick={this.showModal}>Open</Button>
        <Modal
          title="Basic Modal"
          visible={this.state.visible}
          wrapClassName={styles['long-modal']}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <FormItem label="显示顺序" {...formItemLayout}>
            {getFieldDecorator('display_sequence', {
              // initialValue: item.display_sequence,
            })(<InputNumber />)}
          </FormItem>
          <FormItem label="广告标题" {...formItemLayout}>
            <InputNumber />
          </FormItem>
          <FormItem label="广告标题" {...formItemLayout}>
            <Input placeholder="请输入广告位标题" />
          </FormItem>
          <FormItem label="广告标题" {...formItemLayout}>
            <Input placeholder="请输入广告位标题" />
          </FormItem>
          <FormItem label="广告标题" {...formItemLayout}>
            <Input placeholder="请输入广告位标题" />
          </FormItem>
          <FormItem label="广告标题" {...formItemLayout}>
            <Input placeholder="请输入广告位标题" />
          </FormItem>
          <FormItem label="广告标题" {...formItemLayout}>
            <Input placeholder="请输入广告位标题" />
          </FormItem>
          <FormItem label="广告标题" {...formItemLayout}>
            <Input placeholder="请输入广告位标题" />
          </FormItem>
          <FormItem label="广告标题" {...formItemLayout}>
            <Input placeholder="请输入广告位标题" />
          </FormItem>
          <FormItem label="广告标题last" {...formItemLayout}>
            <Input placeholder="请输入广告位标题" />
          </FormItem>
        </Modal>
      </div>
    );
  }
}

ModalPage.propTypes = {
  form: PropTypes.object.isRequired,
};

export default Form.create()(ModalPage);
