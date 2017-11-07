import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import isEqual from 'lodash/isEqual';
import { Form, Button, Row, Col, Input, Select } from 'antd';

import FilterItem from '../../components/filter-item';

const Search = Input.Search;
const { Option } = Select;

const ColProps = {
  md: 8,
  style: {
    marginBottom: 16,
  },
};

class Filter extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.query, this.props.query)) {
      this.props.form.resetFields();
    }
  }

  render() {
    const {
      onAdd,
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
    const handleSelectType = (value) => {
      let fields = getFieldsValue();
      fields.roleId = value;
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

    let initialCreateTime = [];
    if (filter.start_at) {
      initialCreateTime[0] = moment(filter.start_at);
    }
    if (filter.end_at) {
      initialCreateTime[1] = moment(filter.end_at);
    }

    return (
      <Row gutter={24}>
        <Col {...ColProps} >
          <FilterItem label="姓名">
            {getFieldDecorator('name', { initialValue: filter.name })(<Search placeholder="请输入姓名" size="large" onSearch={handleSubmit} />)}
          </FilterItem>
        </Col>
        <Col {...ColProps} >
          <FilterItem label="类型">
            {getFieldDecorator('roleId', { initialValue: filter.roleId ? filter.roleId : '' })(
              <Select style={{ width: '100%' }} size="large" onChange={handleSelectType}>
                <Option key="" value="">全部</Option>
                <Option key="1" value="1">客服</Option>
                <Option key="2" value="2">研发</Option>
              </Select>
            )}
          </FilterItem>
        </Col>
        <Col {...ColProps} >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <Button size="large" onClick={handleReset}>重置</Button>
            </div>
            <div>
              <Button size="large" type="primary" onClick={onAdd}>新增</Button>
            </div>
          </div>
        </Col>
      </Row>
    );
  }
}


Filter.propTypes = {
  query: PropTypes.object,
  onAdd: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  filter: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

Filter.defaultProps = {
  query: null,
};

export default Form.create()(Filter);
