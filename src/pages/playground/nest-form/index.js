import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button, Col, Row, Icon, Upload } from 'antd';
import { FileInput } from '../../../components/form/file-input';
import BaseDao from '../../../dao/base';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

const leftColLayout = {
  labelCol: { span: 12 },
  wrapperCol: { span: 12 },
};

const rightColLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 },
};

const buttonItemLayout = {
  wrapperCol: { offset: 6, span: 8 },
};

class NestFormPage extends React.Component {
  state = {
    token: '',
    childForm: [],
    initialChild: null,
  }
  componentWillUnmount() {
    this.initPending && this.initPending.cancel();
  }
  componentDidMount() {
    this.initPending && this.initPending.cancel();
    this.initPending = BaseDao.fetchQiniuToken();
    this.initPending.then(tokenData => {
      this.setState({
        loading: false,
        token: tokenData.data,
      });
    });
  }

  handleAddChild = () => {
    const childForm = this.state.childForm;
    // const { getFieldValue, setFieldsValue } = this.props.form;
    // const initialValue = getFieldValue('initialChild');
    // setFieldsValue({ initialChild: null });
    let k = 0;
    if (childForm.length > 0) {
      k = childForm[childForm.length - 1].key;
      k++;
    }
    const item = {
      key: k,
      name: 'cars',
      initialValue: this.state.initialChild,
    };

    const nextChildForm = childForm.concat(item);
    this.setState({
      childForm: nextChildForm,
      initialChild: null,
    });
  }

  handleInitialChild = (e) => {
    this.setState({
      initialChild: e.target.value,
    });
  }
  handleRemoveChild = (index) => {
    console.log(index);
    const childForm = [...this.state.childForm];
    childForm.splice(index, 1);
    this.setState({ childForm });
  }

  handleTokenRefresh = (token) => {
    this.setState({ token });
  }

  onProgress = (step, file) => {
    console.log('onProgress', Math.round(step.percent), file.name);
  };


  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (err) {
        return;
      }
      console.log(data);
    });
  }

  renderChildForm = () => {
    const { getFieldDecorator } = this.props.form;
    return this.state.childForm.map((child, index) => (
      <Row key={child.key} >
        <Col span={12}>
          <FormItem label="标题12" {...leftColLayout}>
            {getFieldDecorator(`${child.name}[${child.key}]['a']`, {
              rules: [
                {
                  required: true,
                  message: '请填写标题',
                },
                {
                  max: 30,
                  message: '您输入的标题过长，请控制在30个字以内',
                },
              ],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem label="标题22" {...rightColLayout}>
            {getFieldDecorator(`${child.name}[${child.key}]['b']`, {
              rules: [
                {
                  required: true,
                  message: '请填写标题',
                },
                {
                  max: 30,
                  message: '您输入的标题过长，请控制在30个字以内',
                },
              ],
            })(<Input style={{ width: '80%', marginRight: 20 }} />)}
            <Icon
              style={{ fontSize: 16, color: '#108ee9' }}
              type="minus-circle"
              onClick={this.handleRemoveChild.bind(null, index)}
            />
          </FormItem>
        </Col>
      </Row>
    ));
  }
  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="form-wrapper">
        <Form onSubmit={this.handleSubmit}>
          <Row>
            <Col span={12}>
              <FormItem label="标题" {...leftColLayout}>
                {getFieldDecorator('title', {
                  initialValue: 'aaaaa',
                  rules: [
                    {
                      required: true,
                      message: '请填写标题',
                    },
                    {
                      max: 30,
                      message: '您输入的标题过长，请控制在30个字以内',
                    },
                  ],
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="标题" {...rightColLayout}>
                {getFieldDecorator('title1', {
                  initialValue: 'aaaaa',
                  rules: [
                    {
                      required: true,
                      message: '请填写标题',
                    },
                    {
                      max: 30,
                      message: '您输入的标题过长，请控制在30个字以内',
                    },
                  ],
                })(<Input />)}
              </FormItem>
            </Col>
          </Row>
          <FormItem label="标题" {...formItemLayout}>
            {getFieldDecorator('title1', {
              initialValue: 'aaaaa',
              rules: [
                {
                  required: true,
                  message: '请填写标题',
                },
                {
                  max: 30,
                  message: '您输入的标题过长，请控制在30个字以内',
                },
              ],
            })(<Input />)}
          </FormItem>
          <FormItem label="标题" {...formItemLayout}>
            <Upload data={{ token: this.state.token }} listType="picture-card">上传</Upload>
          </FormItem>
          <FormItem label="资料上传" {...formItemLayout}>
            {getFieldDecorator('file', {
              initialValue: 'FoVoK4arLNgb9g81-K51y3chuRp-',
              rules: [
                {
                  required: true,
                  message: '请上传资料',
                },
              ],
            })(<FileInput type="text" maxLength={10} token={this.state.token} onTokenRefresh={this.handleTokenRefresh} />)}
          </FormItem>

          <FormItem label="资料上传" {...formItemLayout}>
            {getFieldDecorator('file1', {
              initialValue: 'FoVoK4arLNgb9g81-K51y3chuRp-',
              rules: [
                {
                  required: true,
                  message: '请上传资料',
                },
              ],
            })(<FileInput type="picture" maxSize={10240} maxLength={10} token={this.state.token} onTokenRefresh={this.handleTokenRefresh} />)}
          </FormItem>

          <FormItem label="资料上传" {...formItemLayout}>
            {getFieldDecorator('file2', {
              initialValue: 'FoVoK4arLNgb9g81-K51y3chuRp-',
              rules: [
                {
                  required: true,
                  message: '请上传资料',
                },
              ],
            })(<FileInput type="picture-card" maxSize={10240} maxLength={10} token={this.state.token} onTokenRefresh={this.handleTokenRefresh} />)}
          </FormItem>

          <FormItem label="资料上传" {...formItemLayout}>
            {getFieldDecorator('file3', {
              initialValue: [{ uuid: 'FoVoK4arLNgb9g81-K51y3chuRp-', desc: '' }, { uuid: 'FuC7VIzefdD47S72ak4abWOuzqRk', desc: '哈哈哈' }, { uuid: 'FuC7VIzefdD47S72ak4abWOuzqRk', desc: '' }, { uuid: 'FuC7VIzefdD47S72ak4abWOuzqRk', desc: '' }, { uuid: 'FoVoK4arLNgb9g81-K51y3chuRp-', desc: '' }, { uuid: 'FuC7VIzefdD47S72ak4abWOuzqRk', desc: '哈哈哈' }, { uuid: 'FuC7VIzefdD47S72ak4abWOuzqRk', desc: '' }, { uuid: 'FuC7VIzefdD47S72ak4abWOuzqRk', desc: '' }],
              rules: [
                {
                  required: true,
                  type: 'array',
                  message: '请上传资料',
                },
              ],
            })(<FileInput descPlaceholder="请输入描述" type="picture-desc" maxSize={10240} maxLength={10} token={this.state.token} onTokenRefresh={this.handleTokenRefresh} />)}
          </FormItem>
          <FormItem {...buttonItemLayout}>
            <Button type="default" onClick={this.handleAddChild}>加一个</Button>
          </FormItem>
          {this.renderChildForm()}
          <FormItem {...buttonItemLayout}>
            <Button type="primary" htmlType="submit" className="margin-right" size="large">保存</Button>
            <Button type="default" size="large" onClick={this.handleBackList}>返回</Button>
          </FormItem>
        </Form>

      </div>
    );
  }
}

NestFormPage.propTypes = {
  form: PropTypes.object.isRequired,
};

export default Form.create()(NestFormPage);
