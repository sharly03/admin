import React from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Row, Col, DatePicker, Input, Select } from 'antd';
import isEqual from 'lodash/isEqual';
import moment from 'moment';

import FilterItem from '../../components/filter-item';

const Search = Input.Search;
const { Option } = Select;
const { RangePicker } = DatePicker;

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
      onAdd,
      onFilterChange,
      filter,
      form: {
        getFieldDecorator,
        getFieldsValue,
        setFieldsValue,
      },
    } = this.props;

    const handleFields = (fields) => {
      const { dataArea } = fields;
      if (dataArea.length) {
        fields.start_at = dataArea[0].format('YYYY-MM-DD');
        fields.end_at = dataArea[1].format('YYYY-MM-DD');
      }
      return fields;
    };

    const handleSubmit = () => {
      let fields = getFieldsValue();
      fields = handleFields(fields);
      onFilterChange(fields);
    };

    const handleSelectType = (value) => {
      let fields = getFieldsValue();
      fields.type = value;
      fields = handleFields(fields);
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

    // 日期范围选择
    const handleChange = (key, values) => {
      let fields = getFieldsValue();
      fields[key] = values;
      fields = handleFields(fields);
      onFilterChange(fields);
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
        <Col {...ColProps} xl={{ span: 9 }} md={{ span: 6 }} sm={{ span: 12 }}>
          <FilterItem label="标题">
            {getFieldDecorator('title', { initialValue: filter.title })(<Search placeholder="请输入新闻公告标题" size="large" onSearch={handleSubmit} />)}
          </FilterItem>
        </Col>
        <Col {...ColProps} xl={{ span: 4 }} md={{ span: 4 }} sm={{ span: 12 }}>
          <FilterItem label="类型">
            {getFieldDecorator('type', { initialValue: filter.type ? filter.type : '' })(
              <Select style={{ width: '100%' }} size="large" onChange={handleSelectType}>
                <Option value="">全部</Option>
                <Option value="media_report">媒体报道</Option>
                <Option value="website_notice">网站公告</Option>
              </Select>
            )}
          </FilterItem>
        </Col>
        <Col {...ColProps} xl={{ span: 5 }} md={{ span: 7 }} sm={{ span: 24 }}>
          <FilterItem label="发布日期">
            {getFieldDecorator('dataArea', { initialValue: initialCreateTime })(
              <RangePicker showTime placeholder={['开始日期', '结束日期']} format="YYYY-MM-DD" style={{ width: '100%' }} size="large" onOk={handleChange.bind(null, 'dataArea')} />
            )}
          </FilterItem>
        </Col>
        <Col {...TwoColProps} xl={{ span: 6 }} md={{ span: 7 }} sm={{ span: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div >
              <Button size="large" onClick={handleReset}>重置</Button>
            </div>
            <div>
              <Button size="large" type="ghost" onClick={onAdd}>新增</Button>
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
