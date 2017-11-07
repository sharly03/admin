import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Form, Button, Row, Col, Input, DatePicker, Select, Icon } from 'antd';
import { queryTo } from '../../utils/location-helper';
import FilterItem from '../../components/filter-item';
import { bankList } from './const';

import styles from './user.less';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

class Filter extends React.Component {
  state = {
    expand: false,
  };
  // 展开/收起
  toggle = () => this.setState(pre => ({ expand: !pre.expand }));
  // 清空表单
  clear = () => {
    queryTo(location, {}, true);
    this.props.form.resetFields();
    this.props.onChange({});
  };

  handleSubmit = () => {
    const { getFieldsValue } = this.props.form;
    const fieldsValue = getFieldsValue();
    console.log('submit', fieldsValue);
    const { bankCode, bindCardStatus, registerTime, openCardTime, ...remindFields } = fieldsValue;
    // 解析参数
    const [registerStartTime, registerEndTime] = registerTime ? registerTime.map(mt => mt.format('x')) : [];
    const [openCardStartTime, openCardEndTime] = openCardTime ? openCardTime.map(mt => mt.format('x')) : [];
    const query = {
      ...remindFields,
      registerStartTime,
      registerEndTime,
      openCardStartTime,
      openCardEndTime,
      bindCardStatus: bindCardStatus || undefined,
      bankName: bankCode,
    };
    queryTo(location, query, true);
    this.props.onChange(query);
  };

  render() {
    const getFieldContainer = children => {
      const count = this.state.expand ? 7 : 2;
      const { getFieldDecorator } = this.props.form;
      const {
        mobile,
        name,
        idCard,
        registerStartTime,
        registerEndTime,
        bindCardStatus = '',
        openCardStartTime,
        openCardEndTime,
        bankName,
      } = this.props.filter;
      const registerTime = registerStartTime && registerEndTime && [moment(registerStartTime, 'x'), moment(registerEndTime, 'x')];
      const openCardTime = openCardStartTime && openCardEndTime && [moment(openCardStartTime, 'x'), moment(openCardEndTime, 'x')];
      const filedList = [
        { label: '注册手机号', id: 'mobile', value: mobile },
        { label: '用户姓名', id: 'name', value: name },
        { label: '身份证号', id: 'idCard', value: idCard },
        { label: '注册时间', id: 'registerTime', value: registerTime },
        { label: '开户状态', id: 'bindCardStatus', value: bindCardStatus },
        { label: '开户时间', id: 'openCardTime', value: openCardTime },
        { label: '开户银行', id: 'bankCode', value: bankName || '' },
      ];

      return filedList.map((filed, index) => {
        const { id, label, value } = filed;
        return (
          <Col
            xl={{ span: 6 }}
            md={{ span: 8 }}
            key={id}
            style={{
              display: index < count ? 'block' : 'none',
              marginBottom: 16,
            }}
          >
            <FilterItem label={label}>
              {getFieldDecorator(id, { initialValue: value })(children[index])}
            </FilterItem>
          </Col>
        );
      });
    };

    const { expand } = this.state;

    return (
      <Row gutter={24} type="flex">
        {getFieldContainer([
          <Search placeholder="请输入" maxLength="11" size="large" onSearch={this.handleSubmit} />,
          <Search placeholder="请输入" maxLength="10" size="large" onSearch={this.handleSubmit} />,
          <Search placeholder="请输入" maxLength="18" size="large" onSearch={this.handleSubmit} />,
          <RangePicker style={{ width: '100%' }} size="large" />,
          <Select style={{ width: '100%' }} size="large" >
            <Option value="">全部</Option>
            <Option value="01">未开户</Option>
            <Option value="02">已开户</Option>
          </Select>,
          <RangePicker style={{ width: '100%' }} size="large" />,
          <Select style={{ width: '100%' }} size="large" >
            <Option value="">全部</Option>
            {bankList.map(bank => <Option key={bank.code}>{bank.name}</Option>)}
          </Select>,
        ])}
        <Col
          md={{ span: 8, offset: expand && 8 }}
          xl={{ span: 6, offset: expand ? 0 : 6 }}
        >
          <div style={{ marginLeft: 16 }}>
            <Button type="primary" htmlType="submit" size="large" onClick={this.handleSubmit}>查询</Button>
            <span style={{ marginLeft: 24 }}>
              <a
                className={styles['clear-btn']}
                style={{ display: expand ? 'inline-block' : 'none' }}
                onClick={this.clear}
              >清空</a>
              <a onClick={this.toggle}>
                {expand ? '收起' : '展开'} <Icon type={expand ? 'up' : 'down'} />
              </a>
            </span>
          </div>
        </Col>
      </Row>
    );
  }
}

Filter.propTypes = {
  form: PropTypes.object.isRequired,
  filter: PropTypes.object,
  onChange: PropTypes.func,
};
Filter.defaultProps = {
  filter: {},
  onChange: () => {},
};

export default Form.create()(Filter);
