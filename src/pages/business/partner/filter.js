import React from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Row, Col, Input, Select } from 'antd';
import isEqual from 'lodash/isEqual';

import FilterItem from '../../../components/filter-item';

const Search = Input.Search;
const { Option } = Select;

const ColProps = {
  xs: 24,
  sm: 12,
  style: {
    marginBottom: 16,
  },
};

const TwoColProps = {
  ...ColProps,
  xl: 96,
};

class Filter extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.query, this.props.query)) {
      this.props.form.resetFields();
    }
  }

  render() {
    const {
      onFilterChange,
      filter,
      form: {
        getFieldDecorator,
        getFieldsValue,
        setFieldsValue,
      },
    } = this.props;

    const handleSubmit = () => {
      let fields = getFieldsValue();
      onFilterChange(fields);
    };

    const handleSelectChange = (value) => {
      let fields = getFieldsValue();
      fields.userType = value;
      onFilterChange(fields);
    };

    const handleReset = () => {
      const fields = getFieldsValue();
      for (let item in fields) {
        if ({}.hasOwnProperty.call(fields, item)) {
          if (fields[item] instanceof Array) {
            fields[item] = [];
          } else {
            fields[item] = '';
          }
        }
      }
      setFieldsValue(fields);
      handleSubmit();
    };

    return (
      <Row gutter={24}>
        <Col {...ColProps} xl={{ span: 6 }} md={{ span: 4 }} sm={{ span: 12 }}>
          <FilterItem label="合作方类型">
            {getFieldDecorator('userType', { initialValue: filter.settleType ? filter.settleType : '' })(
              <Select style={{ width: '100%' }} size="large" onChange={handleSelectChange}>
                <Option value="">全部</Option>
                <Option value="02">企业</Option>
                <Option value="01">个人</Option>
              </Select>
            )}
          </FilterItem>
        </Col>
        <Col {...ColProps} xl={{ span: 6 }} md={{ span: 6 }} sm={{ span: 12 }}>
          <FilterItem label="合作方名称">
            {getFieldDecorator('displayName', { initialValue: filter.title })(<Search placeholder="请输入合作方" size="large" onSearch={handleSubmit} />)}
          </FilterItem>
        </Col>
        <Col {...TwoColProps} xl={{ span: 12 }} md={{ span: 7 }} sm={{ span: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div >
              <Button type="primary" size="large" className="margin-right" onClick={handleSubmit}>查询</Button>
              <Button size="large" onClick={handleReset}>重置</Button>
            </div>
          </div>
        </Col>
      </Row>
    );
  }
}


Filter.propTypes = {
  query: PropTypes.object,
  form: PropTypes.object.isRequired,
  filter: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

Filter.defaultProps = {
  query: null,
};

export default Form.create()(Filter);
