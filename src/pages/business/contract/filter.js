import React from 'react';
import PropTypes from 'prop-types';
import { Col, Button, Input, Form, Select, Row } from 'antd';
import isEqual from 'lodash/isEqual';
import FilterItem from '../../../components/filter-item';

const { Option } = Select;

const Search = Input.Search;

const ColProps = {
  md: 6,
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
      fields.settleType = value;
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
        <Col {...ColProps}>
          <FilterItem label="合同编号">
            {getFieldDecorator('contractNo', { initialValue: filter.contractNo })(<Search placeholder="请输入" size="large" onSearch={handleSubmit} />)}
          </FilterItem>
        </Col>

        <Col {...ColProps}>
          <FilterItem label="资产方名称">
            {getFieldDecorator('assetsCooperativeUserName', { initialValue: filter.assetsCooperativeUserName })(<Search placeholder="请输入" size="large" onSearch={handleSubmit} />)}
          </FilterItem>
        </Col>

        <Col {...ColProps}>
          <FilterItem label="状态">
            {getFieldDecorator('settleType', { initialValue: filter.settleType ? filter.settleType : '' })(
              <Select style={{ width: '100%' }} size="large" onChange={handleSelectType}>
                <Option value="">全部</Option>
                <Option value="01">按月付息</Option>
                <Option value="02">按季付息</Option>
                <Option value="03">一次性付息</Option>
                <Option value="04">等额本息</Option>
                <Option value="05">先息后本</Option>
                <Option value="06">到期还本付息</Option>
              </Select>
            )}
          </FilterItem>
        </Col>

        <Col {...ColProps}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <Button size="large" onClick={handleReset}>重置</Button>
            </div>
            <div>
              <Button type="primary" size="large" onClick={onAdd}>新增</Button>
            </div>
          </div>
        </Col>
      </Row>
    );
  }
}

Filter.propTypes = {
  onAdd: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  filter: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  query: PropTypes.object,
};

Filter.defaultProps = {
  query: null,
};

export default Form.create()(Filter);
