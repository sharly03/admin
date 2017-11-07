import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button, Icon, Radio, DatePicker, Switch, message, Tooltip } from 'antd';
import moment from 'moment';

import './report.less';
import BaseDao from '../../dao/base';
import ReportDao from '../../dao/report';
import { FileInput } from '../../components/form/file-input';

const FormItem = Form.Item;
const { MonthPicker } = DatePicker;

const PC = 'pc';
const MOBILE = 'app';

const typeOptions = [
  { label: 'PC端', value: PC },
  { label: '移动端', value: MOBILE },
];

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 14,
      offset: 6,
    },
  },
};

class ReportForm extends React.Component {
  state = {
    token: null,
    showMobileFields: false,
    report: null,
    isDisplay: true,
  };

  static contextTypes = {
    router: PropTypes.object,
    location: PropTypes.object,
  };

  static propTypes = {
    form: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.initLoading && this.initLoading.cancel();
    let query = this.context.location.query;
    if (query.id) {
      this.detailLoading && this.detailLoading.cancel();
      this.detailLoading = ReportDao.detail({ id: query.id });
      this.detailLoading.then((result) => {
        if (result.code === 0) {
          const report = result.report;

          this.setState({
            report,
            showMobileFields: report.platform === MOBILE,
            isDisplay: !!report.is_display,
          });
        }
      });
    }
    this.initLoading = BaseDao.fetchQiniuToken();
    this.initLoading.then((data) => {
      if (data.code === 0) {
        this.setState({
          token: data.data,
        });
      }
    });
  }

  componentWillUnmount() {
    this.initLoading && this.initLoading.cancel();
    this.detailLoading && this.detailLoading.cancel();
  }

  isEditReport() {
    return !!this.context.location.query.id;
  }

  handlePlatformChange = (event) => {
    console.log(event.target.value);
    let showMobileFields = event.target.value === MOBILE;
    this.setState({
      showMobileFields,
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((errors) => {
      if (errors) {
        return;
      }

      const data = {
        ...this.props.form.getFieldsValue(),
      };
      data.month = Number(data.month.format('YYYYMM'));
      data.is_display = this.state.isDisplay ? 1 : 0;
      data.publish_date = data.publish_date && data.publish_date.format('YYYY-MM-DD');


      if (this.state.report) { // 编辑态带上id
        data.id = this.state.report.id;
      }

      console.log(data);

      this.submitLoading && this.submitLoading.cancel();
      if (this.isEditReport()) {
        this.submitLoading = ReportDao.edit(data);
      } else {
        this.submitLoading = ReportDao.add(data);
      }
      this.submitLoading.then((ret) => {
        if (ret.code === 0) {
          message.success('保存成功！');
          this.handleBackList();
        } else {
          message.error(ret.msg || '保存失败！');
        }
      });
    });
  };

  handleBackList = () => {
    this.context.router.replace('/report');
  };

  handlePickerChange = (date, dateString) => {
    console.log(dateString);
  };

  handleDisplayCheck = (isDisplay) => {
    this.setState({ isDisplay });
  };

  renderMobileFiled() {
    const { getFieldDecorator } = this.props.form;
    const item = this.state.report || {};

    return (<div>
      <FormItem label="分享文案" hasFeedback {...formItemLayout}>
        {getFieldDecorator('share_title', {
          initialValue: item.share_title,
          rules: [
            {
              required: true,
              message: '请填写分享文案',
            },
            {
              max: 50,
              message: '您输入的分享文案过长，请控制在50个字以内',
            },
          ],
        })(<Input placeholder="请填写分享文案，控制在50个字以内" />)}
      </FormItem>

      <FormItem label="分享小图标" {...formItemLayout}>
        {getFieldDecorator('share_picture_uuid', {
          initialValue: item.share_picture_uuid,
          rules: [
            {
              required: true,
              message: '请上传分享图标',
            },
          ],
        })(<FileInput token={this.state.token} />)}
      </FormItem>
      <FormItem label={(<span>运营报告背景图&nbsp;<Tooltip title="该图片将作为每页运营报告的背景"><Icon type="question-circle-o" /></Tooltip></span>)}
        {...formItemLayout}
      >
        {getFieldDecorator('background', {
          initialValue: item.background,
          rules: [
            {
              required: true,
              message: '请上传运营报告背景图片',
            },
          ],
        })(<FileInput token={this.state.token} />)}
      </FormItem>
    </div>);
  }

  renderUploadButton = () => {
    return (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">点击上传</div>
      </div>
    );
  }

  render() {
    if (!this.state.token) return null;
    const { getFieldDecorator } = this.props.form;

    const item = this.state.report || {};
    let initialMonth = item.month && moment(item.month, 'YYYYMM');

    let initialPublishDate = item.publish_date && moment(item.publish_date * 1000);

    const renderImageLabel = () => {
      return (<span>运营报告图片&nbsp;
        {this.state.showMobileFields ? <Tooltip title="请使用透明背景的png切图，而非效果图">
          <Icon type="question-circle-o" />
        </Tooltip> : null}
      </span>);
    };

    return (
      <div className="form-wrapper">
        <Form onSubmit={this.handleSubmit}>

          <FormItem label="平台选择" {...formItemLayout}>
            {getFieldDecorator('platform', {
              initialValue: item.platform,
              rules: [
                {
                  required: true,
                  message: '请选择要发布的平台',
                },
              ],
            })(
              <Radio.Group options={typeOptions} onChange={this.handlePlatformChange} disabled={this.isEditReport()} />
            )}
          </FormItem>
          <FormItem label="运营报告名称" hasFeedback {...formItemLayout}>
            {getFieldDecorator('title', {
              initialValue: item.title,
              rules: [
                {
                  required: true,
                  message: '请填写报告名称',
                },
                {
                  max: 15,
                  message: '您输入的报告名称过长，请控制在15个字以内',
                },
              ],
            })(<Input placeholder="请控制在15个字以内" />)}
          </FormItem>
          <FormItem label="运营报告所属月份" {...formItemLayout}>
            {getFieldDecorator('month', {
              initialValue: initialMonth,
              rules: [
                {
                  required: true,
                  message: '请选择运营报告所属月份',
                },
              ],
            })(<MonthPicker onChange={this.handlePickerChange} format="YYYYMM" placeholder="请选择所属月份" />)}
          </FormItem>

          { this.state.showMobileFields ? null : <FormItem label="是否在列表页显示" {...formItemLayout}>
            <Switch checked={this.state.isDisplay} onChange={this.handleDisplayCheck} />
          </FormItem>}

          <FormItem label="发布日期" {...formItemLayout}>
            {getFieldDecorator('publish_date', {
              initialValue: initialPublishDate,
            })(<DatePicker format="YYYY-MM-DD" placeholder="请选择发布日期" />)}
          </FormItem>

          {this.state.showMobileFields ? this.renderMobileFiled() : ''}
          <FormItem label={renderImageLabel()} {...formItemLayout} >
            {getFieldDecorator('pictures', {
              initialValue: item.pictures,
              rules: [
                {
                  required: true,
                  message: '请上传运营报告图片',
                },
              ],
            })(<FileInput maxLength={20} token={this.state.token} />)}
          </FormItem>

          <FormItem {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit" className="margin-right" size="large">保存</Button>
            <Button type="default" size="large" onClick={this.handleBackList}>返回</Button>
          </FormItem>

        </Form>
      </div>
    );
  }
}

export default Form.create()(ReportForm);
