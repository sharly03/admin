/**
 * 审核材料模块
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Card } from 'antd';
import { FileInput } from '../../../../components/form/file-input';

const FormItem = Form.Item;
export class Material extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
    location: PropTypes.object,
  };
  static propTypes = {
    form: PropTypes.object.isRequired,
    item: PropTypes.array,
    isEditing: PropTypes.bool.isRequired,
    token: PropTypes.string.isRequired,
    onEditClick: PropTypes.func.isRequired,
    onTokenRefresh: PropTypes.func.isRequired,
  };
  static defaultProps = {
    item: [],
  };

  render() {
    const {
      item,
      isEditing,
      onEditClick,
      token,
      onTokenRefresh,
      form: {
        getFieldDecorator,
      },
    } = this.props;
    const editorText = isEditing || <a onClick={onEditClick.bind(null, 'materialEditing')}>编辑</a>;
    const resourceManageList = item && item.map(file => ({ uuid: file.name, desc: file.description }));
    return (
      <Card className="card-head" title={<h3>审核材料<small>上传图片前，请提前将图片上的关键信息进行马赛克处理；仅支持jpg、jpeg、png格式的图片，最多上传20张图片，每张图片不超过1M</small></h3>} bordered={false} extra={editorText} noHovering>
        <FormItem>
          {getFieldDecorator('resourceManageList', {
            initialValue: resourceManageList,
          })(<FileInput disabled={!isEditing} descMaxLength={20} maxLength={20} descPlaceholder="请输入描述" type="picture-desc" token={token} onTokenRefresh={onTokenRefresh} />)}
        </FormItem>
      </Card>
    );
  }
}
