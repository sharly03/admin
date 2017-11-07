import React from 'react';
import PropTypes from 'prop-types';
import { Form, Icon, Button, Input } from 'antd';

const FormItem = Form.Item;

const hasError = (fieldsValue, fieldsError) => Object.keys(fieldsValue).some(field => fieldsValue[field].length === 0) ||
  Object.keys(fieldsError).some(field => fieldsError[field]);

class EditForm extends React.Component {
  state = { editing: false };

  toEdit = () => this.setState({ editing: true });

  handleSubmit = e => {
    e.preventDefault();
    const { prevent, onSave } = this.props;
    !prevent && this.setState({ editing: false });
    const { input } = this.props.form.getFieldsValue();
    input && onSave(input);
  };
  handleCancel = () => {
    this.setState({ editing: false });
    this.props.onCancel();
  };

  render() {
    const { editing } = this.state;
    const { label, value, editable, rule } = this.props;
    const { getFieldDecorator, getFieldsError, getFieldsValue } = this.props.form;

    return (
      <Form style={{ height: '44px' }} layout="inline" onSubmit={this.handleSubmit}>
        <FormItem label={label} style={{ marginRight: 10 }}>
          {editing ? getFieldDecorator('input', {
            initialValue: value,
            rules: [rule],
          })(<Input style={{ width: '120px' }} size="default" maxLength="11" />) :
            [
              value && <span style={{ marginRight: '8px' }} key="value">{value}</span>,
              editable && <a onClick={this.toEdit} key="edit"><Icon type="edit" /></a>,
            ]
          }
        </FormItem>
        {editing &&
          <FormItem>
            <Button
              style={{ padding: '0 8px' }}
              size="default"
              type="primary"
              htmlType="submit"
              disabled={hasError(getFieldsValue(), getFieldsError())}
            >保存</Button>
            <Button style={{ padding: '0 8px', marginLeft: '8px' }} size="default" onClick={this.handleCancel}>取消</Button>
          </FormItem>
        }
      </Form>
    );
  }
}

EditForm.defaultProps = {
  label: '',
  value: '',
  prevent: false,
  editable: false,
  rule: {},
  onSave: () => {},
  onCancel: () => {},
};
EditForm.propTypes = {
  form: PropTypes.object.isRequired,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  prevent: PropTypes.bool,
  editable: PropTypes.bool,
  rule: PropTypes.object,
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
};

export default Form.create()(EditForm);
