import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Radio, Checkbox, Button, message, DatePicker } from 'antd';
import moment from 'moment';

import QuillEditor from '../../components/editor';
import BaseDao from '../../dao/base';
import NewsDao from '../../dao/news';

const FormItem = Form.Item;

const CONTENT_TYPE_URL = 'url';
const CONTENT_TYPE_RICHTEXT = 'text';
const TYPE_NEWS = 'media_report';
const TYPE_NOTICE = 'website_notice';

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
const editorLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
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

const plainOptions = [
  { label: '标题加红', value: 'red' },
  { label: '标题加粗', value: 'bold' },
];

const contentTypeOptions = [
  { label: '媒体报道', value: TYPE_NEWS },
  { label: '网站公告', value: TYPE_NOTICE },
];

const newsTypeOptions = [
  { label: '地址型', value: CONTENT_TYPE_URL },
  { label: '内容型', value: CONTENT_TYPE_RICHTEXT },
];

class NewsForm extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
    location: PropTypes.object,
  };

  static propTypes = {
    form: PropTypes.object.isRequired,
  };

  state = {
    confirmDirty: false,
    editorContent: null,
    token: null,
    news: null,
    titleStyle: [],
    isShowNewsType: true, // 显示新闻类型
    isShowUrl: true, // 显示URL字段
    isShowEditor: false, // 显示富文本
  };

  componentDidMount() {
    this.tokenLoading && this.tokenLoading.cancel();
    this.tokenLoading = BaseDao.fetchQiniuToken();
    this.tokenLoading.then((data) => {
      if (data.code === 0) {
        this.setState({
          token: data.token,
        });
      }
    });

    if (this.isEdit()) {
      this.detailLoading && this.detailLoading.cancel();
      this.detailLoading = NewsDao.detail({ id: this.context.location.query.id });
      this.detailLoading.then((result) => {
        let news = result.data;
        console.log('news', news);
        let isShowUrl = true;
        let isShowEditor = false;
        if (result.code === 0) {
          if (news.type === TYPE_NOTICE) { // 公告
            isShowUrl = false;
            isShowEditor = true;
          } else if (news.content_type === CONTENT_TYPE_RICHTEXT) { // 富文本新闻
            isShowUrl = false;
            isShowEditor = true;
          } else {
            this.props.form.setFieldsValue({ url: news.content });
          }


          this.setState({
            news,
            isShowUrl,
            isShowEditor,
            editorContent: news.content,
            titleStyle: news.title_css,
          });
        }
      });
    } else {
      this.props.form.setFieldsValue({ type: TYPE_NEWS }); // 默认显示url
      this.props.form.setFieldsValue({ content_type: CONTENT_TYPE_URL }); // 默认显示url
    }
  }

  isEdit() {
    return !!this.context.location.query.id;
  }

  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, data) => {
      if (err) {
        return;
      }
      if (data.content_type !== CONTENT_TYPE_URL && this.state.editorContent) {
        data.content = this.state.editorContent;
      }

      if (data.content_type === CONTENT_TYPE_URL) {
        data.content = data.url;
      }

      console.log(data.publish_date);

      data.publish_date = data.publish_date.format('YYYY-MM-DD');

      if (this.state.news) { // 编辑态带上id
        data.id = this.state.news.id;
      }

      console.log('表单的数据: ', data);
      this.submitLoading && this.submitLoading.cancel();
      if (this.isEdit()) {
        this.submitLoading = NewsDao.edit(data);
      } else {
        this.submitLoading = NewsDao.add(data);
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
    this.context.router.replace('/news');
  };

  handleEditorChange = (editorContent) => {
    this.setState({ editorContent });
  };

  handleTypeChange = (event) => {
    console.log(event.target.value);
    if (event.target.value === TYPE_NOTICE) {
      // 公告 隐藏url，隐藏 内容类型选择
      this.setState({
        isShowNewsType: false,
        isShowUrl: false,
        isShowEditor: true,
      });
    } else {
      this.setState({
        isShowNewsType: true,
        isShowUrl: true,
        isShowEditor: false,
      }, () => {
        this.props.form.setFieldsValue({ content_type: CONTENT_TYPE_URL });
      });
    }
  };

  handleContentTypeChange = (event) => {
    let isUrl = false;
    const type = event.target.value;
    if (type === 'url') {
      isUrl = true;
    }
    this.setState({
      isShowNewsType: true,
      isShowUrl: isUrl,
      isShowEditor: !isUrl,
    });
  };

  handleTitleStyleChecked = (value) => {
    console.log(value);
    this.setState({
      titleStyle: value,
    });
  };


  render() {
    const { getFieldDecorator } = this.props.form;
    const item = this.state.news || {};

    let initialPublishDate = item.publish_date && moment(item.publish_date * 1000);

    return (
      <div className="form-wrapper">
        <Form onSubmit={this.handleSubmit}>
          <FormItem label="文章类型" {...formItemLayout}>
            {getFieldDecorator('type', {
              initialValue: item.type,
              rules: [
                {
                  required: true,
                  message: '请选择要发布的是新闻还是公告',
                },
              ],
            })(
              <Radio.Group options={contentTypeOptions} onChange={this.handleTypeChange} disabled={this.isEdit()} />
            )}
          </FormItem>
          <FormItem label="标题" hasFeedback {...formItemLayout}>
            {getFieldDecorator('title', {
              initialValue: item.title,
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

          <FormItem label="标题样式" {...formItemLayout} style={{ marginBottom: 8 }}>
            {getFieldDecorator('title_css', {
              valuePropName: 'checked',
            })(
              <Checkbox.Group options={plainOptions} value={this.state.titleStyle} onChange={this.handleTitleStyleChecked} />
            )}
          </FormItem>

          <FormItem label="发布日期" {...formItemLayout}>
            {getFieldDecorator('publish_date', {
              initialValue: initialPublishDate,
              rules: [
                {
                  required: true,
                  message: '请选择发布日期',
                },
              ],
            })(<DatePicker format="YYYY-MM-DD" placeholder="请选择发布日期" />)}
          </FormItem>


          {this.state.isShowNewsType ?
            <FormItem label="新闻类型" {...formItemLayout}>
              {getFieldDecorator('content_type', {
                initialValue: item.content_type,
                rules: [
                  {
                    required: true,
                    message: '请选择新闻类型',
                  },
                ],
              })(
                <Radio.Group options={newsTypeOptions} onChange={this.handleContentTypeChange} />
              )}
            </FormItem> : '' }

          {this.state.isShowUrl ?
            <FormItem label="URL地址" hasFeedback {...formItemLayout}>
              {getFieldDecorator('url', {
                initialValue: item.url,
                rules: [
                  {
                    required: true,
                    message: '请填写URL地址',
                  },
                  {
                    pattern: /^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/,
                    message: 'url不合法，请重新输入',
                  },
                ],
              })(<Input placeholder="请填写URL地址" />)}
            </FormItem> : '' }

          {this.state.isShowEditor ?
            <FormItem label="新闻内容" {...editorLayout}>
              <QuillEditor value={this.state.editorContent} token={this.state.token} onChange={this.handleEditorChange} />
            </FormItem> : '' }

          <FormItem {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit" className="margin-right" size="large">保存</Button>
            <Button type="default" size="large" onClick={this.handleBackList}>返回</Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default Form.create()(NewsForm);
