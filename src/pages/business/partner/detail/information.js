/**
 * 基本信息模块
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Radio, Card, Input, InputNumber, DatePicker } from 'antd';
import moment from 'moment';
import { parseParam } from '../../../../utils/location-helper';

const { TextArea } = Input;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
};
export const contentTypeOptions = [
  { label: '企业', value: '02' },
  { label: '个人', value: '01' },
];

export class Information extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
    location: PropTypes.object,
  };
  static propTypes = {
    form: PropTypes.object.isRequired,
    isEditing: PropTypes.bool.isRequired,
    item: PropTypes.object,
    onEditClick: PropTypes.func.isRequired,
  };
  static defaultProps = {
    item: {},
  };
  isAdd = () => {
    const query = parseParam(location.search);
    return !query.id;
  }
  render() {
    const {
      item,
      isEditing,
      onEditClick,
      form: {
        getFieldDecorator,
      },
    } = this.props;
    let registrationDate = item.registrationDate && moment(item.registrationDate); // moment对象
    const editorText = isEditing || <a onClick={onEditClick.bind(null, 'informationEditing')}>编辑</a>;


    return (
      <Card className="card-head" title={<h3>基本信息</h3>} bordered={false} extra={editorText} noHovering>
        <FormItem label="合作方类型" {...formItemLayout}>
          {isEditing ? getFieldDecorator('cooperativeUserVO.userType', {
            initialValue: item.userType || '02',
            rules: [
              {
                required: true,
                message: '请选择合作方类型',
              },
            ],
          })(
            <Radio.Group options={contentTypeOptions} disabled={!this.isAdd()} />
          ) : <span>{item.userType === '02' ? '企业' : '个人'}</span>}
        </FormItem>
        <FormItem label="合作方名称" {...formItemLayout}>
          {isEditing ? getFieldDecorator('cooperativeUserVO.name', {
            initialValue: item.name,
            rules: [
              {
                required: true,
                message: '请填写合作方名称',
              },
              {
                maxLength: 30,
                message: '您输入的标题过长，请控制在30个字以内',
              },
            ],
          })(<Input disabled={!this.isAdd()} />) : <span>{item.name}</span>}
        </FormItem>
        <FormItem label="合作方名称(前台展示)" {...formItemLayout}>
          {isEditing ? getFieldDecorator('cooperativeUserVO.displayName', {
            initialValue: item.displayName,
            rules: [
              {
                required: true,
                message: '例：深圳市****财富金融服务有限公司',
              },
              {
                max: 30,
                message: '您输入的标题过长，请控制在30个字以内',
              },
            ],
          })(<Input />) : <span>{item.displayName}</span>}
        </FormItem>
        <FormItem style={{ whiteSpace: 'nowrap' }} label="注册资本" {...formItemLayout}>
          {isEditing ? getFieldDecorator('cooperativeUserVO.registeredCapital', {
            initialValue: item.registeredCapital,
            rules: [
              {
                required: true,
                message: '请输入注册资本',
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
          })(<InputNumber />) : <span>{item.registeredCapital}</span>}
          <span style={{ marginLeft: 10 }}>万元</span>
        </FormItem>
        <FormItem label="公司成立时间" {...formItemLayout}>
          {isEditing ? getFieldDecorator('cooperativeUserVO.registrationDate', {
            initialValue: registrationDate,
            rules: [
              {
                required: true,
                message: '请选择公司成立时间',
              },
            ],
          })(<DatePicker />) : <span>{registrationDate && registrationDate.format('YYYY-MM-DD')}</span>}
        </FormItem>
        <FormItem label="经营范围" {...formItemLayout}>
          {isEditing ? getFieldDecorator('cooperativeUserVO.businessScope', {
            initialValue: item.businessScope,
            rules: [
              {
                required: true,
                message: '请填写经营范围',
              },
              {
                max: 300,
                message: '您输入的字数过多',
              },
            ],
          })(<TextArea autosize={{ minRows: 6 }} style={{ resize: 'none' }} />) : <span>{item.businessScope}</span>}
        </FormItem>
      </Card>
    );
  }
}
