/**
 * 授信与担保模块
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Card, InputNumber, Select, Tag } from 'antd';

const { Option } = Select;
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
export class Credit extends React.Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    item: PropTypes.object,
    isEditing: PropTypes.bool.isRequired,
    guaranteeList: PropTypes.array.isRequired,
    projectList: PropTypes.array.isRequired,
    onEditClick: PropTypes.func.isRequired,
  };
  static defaultProps = {
    item: {},
  };
  // 选择器过滤条件，根据显示的值来进行筛选
  handleFilterOption = (input, option) => {
    return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };
  render() {
    const {
      item,
      isEditing,
      onEditClick,
      guaranteeList,
      projectList,
      form: {
        getFieldDecorator,
      },
    } = this.props;
    const editorText = isEditing || <a onClick={onEditClick.bind(null, 'creditEditing')}>编辑</a>;

    const guaranteeOptions = guaranteeList.map(guarantee => (
      <Option key={guarantee.id}>{guarantee.name}</Option>
    ));
    const projectOptions = projectList.map(project => (
      <Option key={project.id}>{project.name}</Option>
    ));
    const projects = item.projects && item.projects.map(project => ({ key: project.id, label: project.name }));
    const guarantees = item.guarantees && item.guarantees.map(guarantee => ({ key: guarantee.id, label: guarantee.name }));

    const projectTags = item.projects && item.projects.map(project => (<Tag key={project.id}>{project.name}</Tag>));
    const guaranteeTags = item.guarantees && item.guarantees.map(guarantee => (<Tag key={guarantee.id}>{guarantee.name}</Tag>));

    return (
      <Card className="card-head" title={<h3>授信与担保<small>若该合作方为资产方，请务必填写授信额度</small></h3>} bordered={false} extra={editorText} noHovering>
        <FormItem style={{ whiteSpace: 'nowrap' }} label="授信额度" {...formItemLayout}>
          {isEditing ? getFieldDecorator('creditLine', {
            initialValue: item.creditLine,
            rules: [
              {
                required: false,
                message: '请填写授信额度',
              },
              {
                min: 0,
                type: 'number',
                message: '最小值为0',
              },
              {
                max: 100000000,
                type: 'number',
                message: '最大值为1亿',
              },
            ],
          })(<InputNumber style={{ width: '60%' }} />) : <span>{item.creditLine}</span>}
          <span style={{ marginLeft: 10 }}>元</span>
        </FormItem>
        <FormItem label="担保方" {...formItemLayout}>
          {isEditing ? getFieldDecorator('guarantees', {
            initialValue: guarantees,
          })(<Select filterOption={this.handleFilterOption} placeholder="请输入担保方查询" labelInValue mode="multiple">{guaranteeOptions}</Select>) : <span>{guaranteeTags}</span>}
        </FormItem>
        <FormItem label="项目方" {...formItemLayout}>
          {isEditing ? getFieldDecorator('projects', {
            initialValue: projects,
          })(<Select filterOption={this.handleFilterOption} placeholder="请输入项目方查询" labelInValue mode="multiple">{projectOptions}</Select>) : <span>{projectTags}</span>}
        </FormItem>
      </Card>
    );
  }
}
