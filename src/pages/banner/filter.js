import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { Form, Button, Row, Col, Select } from 'antd';

import FilterItem from '../../components/filter-item';


const Option = Select.Option;

const ColProps = {
  sm: 8,
  style: {
    marginBottom: 16,
  },
};

const selectAll = [{ code: '', name: '全部' }];

const status = [
  { value: '', label: '全部' },
  { value: 'not_start', label: '未开始' },
  { value: 'underway', label: '进行中' },
  { value: 'finished', label: '已结束' },
];

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
      positions,
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

    const handleSelectChange = (field, value) => {
      let fields = getFieldsValue();
      fields[field] = value;
      onFilterChange(fields);
    };

    const statusOptions = status.map((item) => {
      return <Option key={item.value} value={item.value}>{item.label}</Option>;
    });

    const positionOptions = selectAll.concat(positions).map(position => {
      return <Option key={position.code} value={position.code}>{position.name}</Option>;
    });
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
        <Col {...ColProps}>
          <FilterItem label="广告位置">
            {getFieldDecorator('positionCode', { initialValue: filter.positionCode ? filter.positionCode : '' })(
              <Select style={{ width: '100%' }} size="large" onChange={handleSelectChange.bind(this, 'positionCode')}>{positionOptions}</Select>
            )}
          </FilterItem>
        </Col>
        <Col {...ColProps}>
          <FilterItem label="广告状态">
            {getFieldDecorator('advStatus', { initialValue: filter.advStatus ? filter.advStatus : '' })(
              <Select style={{ width: '100%' }} size="large" onChange={handleSelectChange.bind(this, 'advStatus')}>{statusOptions}</Select>
            )}
          </FilterItem>
        </Col>
        <Col {...ColProps}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div >
              {/* <Button type="primary" size="large" className="margin-right" onClick={handleSubmit}>查询</Button> */}
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
  positions: PropTypes.array.isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

Filter.defaultProps = {
  query: null,
};

export default Form.create()(Filter);
