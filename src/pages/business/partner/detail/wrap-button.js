import React from 'react';
import PropTypes from 'prop-types';
import { Form, Button } from 'antd';

const FormItem = Form.Item;
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


export const Wrap = ({ children, onSubmit, isEditing, onCancelEdit }) => {
  return (
    <div>
      <Form>
        {children}
        {isEditing ? (
          <div>
            <FormItem {...tailFormItemLayout}>
              <Button type="primary" htmlType="submit" className="margin-right" size="large" onClick={onSubmit}>保存</Button>
              <Button type="default" size="large" onClick={onCancelEdit}>取消</Button>
            </FormItem>
          </div>
        ) : null}
      </Form>
    </div>
  );
};
Wrap.propTypes = {
  form: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
};

