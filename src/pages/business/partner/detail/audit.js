/**
 * 审核信息模块
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Form, Card, Checkbox, Row, Col } from 'antd';

const FormItem = Form.Item;
export class Audit extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
    location: PropTypes.object,
  };
  static propTypes = {
    form: PropTypes.object.isRequired,
    item: PropTypes.array,
    auditDataList: PropTypes.array,
    isEditing: PropTypes.bool.isRequired,
    onEditClick: PropTypes.func.isRequired,
  };

  static defaultProps = {
    auditDataList: [],
    item: [],
  };

  checkboxItem = () => {
    const { auditDataList, isEditing } = this.props;
    const auditData = auditDataList.map(item => {
      return <Col key={String(item.id)} span={4} ><Checkbox disabled={!isEditing} value={item.id}>{item.item}</Checkbox></Col>;
    });
    return auditData;
  };
  render() {
    const {
      item,
      isEditing,
      onEditClick,
      form: {
        getFieldDecorator,
      },
    } = this.props;
    const editorText = isEditing || <a onClick={onEditClick.bind(null, 'auditEditing')}>编辑</a>;

    return (
      <Card className="card-head" title={<h3>审核信息</h3>} bordered={false} extra={editorText} noHovering>
        <FormItem>
          {getFieldDecorator('userAuditConfig', {
            initialValue: item,
            rules: [
              {
                required: true,
                message: '请选择审核信息',
              },
            ],
          })(<Checkbox.Group>
            <Row>
              {this.checkboxItem()}
            </Row>
          </Checkbox.Group>)}
        </FormItem>
      </Card>
    );
  }
}
