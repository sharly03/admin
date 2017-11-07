import React from 'react';
import PropTypes from 'prop-types';
import { Form, Row, Col, Select, Input, Button, message } from 'antd';
import { parseParam } from '../../../utils/location-helper';
import dao from '../../../dao/commodity';


const FormItem = Form.Item;
const Option = Select.Option;
const TextArea = Input.TextArea;

class ProductForm extends React.Component {
  state = {
    protocolSource: [],
    introduceSource: [],
  };

  componentDidMount() {
    this.fetchTplList(parseParam(location.search));
  }
  componentWillUnmount() {
    this.tplPendding && this.tplPendding.cancel();
  }

  async fetchTplList(query) {
    this.tplPendding && this.tplPendding.cancel();
    this.tplPendding = dao.templateList(query);
    const data = await this.tplPendding;
    if (data.code === 0) {
      const protocolSource = data.data.filter(item => item.type === '03');
      const introduceSource = data.data.filter(item => item.type === '04');
      this.setState({ protocolSource, introduceSource });
    } else {
      message.error(data.msg || '加载数据出错');
    }
  }

  handleProtocolChange = value => {
    const { protocolSource } = this.state;
    const { setFieldsValue } = this.props.form;
    protocolSource.forEach(item => {
      if (item.code === value) {
        setFieldsValue({ protocol: item.content });
      }
    });
  };
  handleIntroduceChange = value => {
    const { introduceSource } = this.state;
    const { setFieldsValue } = this.props.form;
    introduceSource.forEach(item => {
      if (item.code === value) {
        setFieldsValue({ introduce: item.content });
      }
    });
  };

  handleLast = () => this.props.onLast();
  handleNext = () => {
    const { form, isNext, onNext, onSubmit } = this.props;
    form.validateFields((err, fields) => {
      if (!err) isNext ? onNext(fields) : onSubmit(fields);
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const { type, isNext } = this.props;
    const isPreview = type === 'preview' || type === 'audit';

    const { protocolSource = [], introduceSource = [] } = this.state;
    const protocolChildren = protocolSource.map(({ code, name }) => <Option key={code}>{name}</Option>);
    const introduceChildren = introduceSource.map(({ code, name }) => <Option key={code}>{name}</Option>);
    const initialProtocol = protocolSource[0] || {};
    const initialIntroduce = introduceSource[0] || {};
    return (
      <Row gutter={24} type="flex">
        <Col span={24}>
          <FormItem
            label="模板列表"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 7 }}
          >
            {getFieldDecorator('protocolList', {
              initialValue: initialProtocol.name || '请选择模板',
              rules: [{ message: '输入不能为空', required: true }],
            })(
              <Select style={{ width: '100%' }} onChange={this.handleProtocolChange}>
                {protocolChildren}
              </Select>
            )}
          </FormItem>
        </Col>
        <Col span={24}>
          <FormItem
            label="服务协议"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 16 }}
          >
            {getFieldDecorator('protocol', {
              initialValue: initialProtocol.content,
              rules: [{ message: '输入不能为空', required: true }],
            })(
              <TextArea autosize={{ minRows: 6, maxRows: 10 }} disabled={isPreview} />
            )}
          </FormItem>
        </Col>
        <Col span={24}>
          <FormItem
            label="模板列表"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 7 }}
          >
            {getFieldDecorator('introduceList', {
              initialValue: initialIntroduce.name || '请选择模板',
              rules: [{ message: '输入不能为空', required: true }],
            })(
              <Select style={{ width: '100%' }} onChange={this.handleIntroduceChange}>
                {introduceChildren}
              </Select>
            )}
          </FormItem>
        </Col>
        <Col span={24}>
          <FormItem
            label="项目介绍"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 16 }}
          >
            {getFieldDecorator('introduce', {
              initialValue: initialIntroduce.content,
              rules: [{ message: '输入不能为空', required: true }],
            })(
              <TextArea autosize={{ minRows: 6, maxRows: 10 }} disabled={isPreview} />
            )}
          </FormItem>
        </Col>
        <Col span={24}>
          <FormItem style={{ textAlign: 'center' }}>
            {
              !isPreview &&
              <div>
                <Button type="default" onClick={this.handleLast}>上一步</Button>
                <span style={{ display: 'inline-block', width: 16 }} />
                <Button type="primary" onClick={this.handleNext}>{isNext ? '下一步' : '保存'}</Button>
              </div>
            }
          </FormItem>
        </Col>
      </Row>
    );
  }
}

ProductForm.defaultProps = {
  isNext: true,
  onLast: () => {},
  onNext: () => {},
  onSubmit: () => {},
};
ProductForm.propTypes = {
  form: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  isNext: PropTypes.bool,
  onLast: PropTypes.func,
  onNext: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default Form.create()(ProductForm);
