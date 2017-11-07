import React from 'react';
import PropTypes from 'prop-types';
import { Form, Row, Col, Input, Select, Button, message, Badge } from 'antd';
import FilterItem from '../../../components/filter-item';
import { PageList } from '../../../components/page-list';
import { parseParam, queryTo, redirect } from '../../../utils/location-helper';
import { formatDecimal2 } from '../../../utils';
import dao from '../../../dao/refund';

import styles from './refund.less';

const Search = Input.Search;
const Option = Select.Option;

const Filter = ({ form, filter, onSearch }) => {
  const handleSearch = params => {
    const { getFieldsValue } = form;
    const fieldsValue = getFieldsValue();
    console.log('filter submit', fieldsValue);
    // 解析参数
    const query = {
      ...parseParam(location.search),
      ...fieldsValue,
      ...params,
      pageIndex: 1,
    };
    queryTo(location, query, true);
    onSearch(query);
  };

  const getFieldContainer = children => {
    const { getFieldDecorator } = form;
    const { mobile, name, status } = filter;
    const filedList = [
      { label: '手机号', id: 'mobile', value: mobile },
      { label: '用户姓名', id: 'name', value: name },
      { label: '状态', id: 'status', value: status || '' },
    ];

    return filedList.map((filed, index) => {
      const { id, label, value } = filed;
      return (
        <Col
          order={index}
          xl={{ span: 6 }}
          md={{ span: 8 }}
          key={id}
          style={{
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

  return (
    <Row gutter={24} type="flex">
      {getFieldContainer([
        <Search placeholder="请输入" size="large" onSearch={() => handleSearch()} />,
        <Search placeholder="请输入" size="large" onSearch={() => handleSearch()} />,
        <Select style={{ width: '100%' }} size="large" onChange={value => handleSearch({ status: value })}>
          <Option value="">全部</Option>
          <Option value="pending">待还款</Option>
          <Option value="process">处理中</Option>
          <Option value="success">还款成功</Option>
          <Option value="fail">还款失败</Option>
        </Select>,
      ])}
      <Col
        md={{ span: 8, order: 1 }}
        xl={{ span: 6, order: 2 }}
      >
        <Button type="primary" htmlType="submit" size="large" onClick={() => handleSearch()}>查询</Button>
      </Col>
    </Row>
  );
};

Filter.propTypes = {
  form: PropTypes.object.isRequired,
  filter: PropTypes.object.isRequired,
  onSearch: PropTypes.func.isRequired,
};

const FilterForm = Form.create()(Filter);

const refundStatus = {
  pending: { status: 'default', text: '待还款' },
  other: { status: 'default', text: '其他' },
  process: { status: 'processing', text: '还款中' },
  success: { status: 'success', text: '还款成功' },
  fail: { status: 'error', text: '还款失败' },
};

class RefundRecord extends React.Component {
  state = {
    loading: false,
    totalRowsCount: 0,
    refundItems: [],
  };

  componentDidMount() {
    this.refundRecord(parseParam(location.search));
  }
  componentWillUnmount() {
    this.recordPendding && this.recordPendding.cancel();
  }

  async refundRecord(query) {
    this.recordPendding && this.recordPendding.cancel();
    this.setState({ loading: true });
    this.recordPendding = dao.refundRecord({ ...query, pageSize: query.pageSize || 10 });
    const data = await this.recordPendding;
    this.setState({ loading: false });
    if (data.code === 0) {
      const { items, totalRowsCount } = data.data;
      this.setState({ refundItems: items, totalRowsCount });
    } else {
      message.error(data.msg || '数据加载失败');
    }
  }

  handleSearch = query => this.refundRecord(query);

  handlePageChange = (pageIndex, pageSize) => {
    const query = {
      ...parseParam(location.search),
      pageIndex,
      pageSize,
    };
    queryTo(location, query, true);
    this.refundRecord(query);
  };

  render() {
    const { loading, totalRowsCount, refundItems } = this.state;
    const refundColumns = [
      // { dataIndex: 'order', title: '序号', render: (text, record, index) => index + 1 },
      {
        dataIndex: 'commodityCode',
        title: '标的编号',
        render: (text, { id }) => <a onClick={() => redirect('/business/commodity/preview', false, { commodityId: id })}>{text}</a>,
      },
      { dataIndex: 'peroids', title: '期数', className: 'align-center' },
      { dataIndex: 'name', title: '用户姓名' },
      { dataIndex: 'mobile', title: '手机号' },
      { dataIndex: 'settledPrincipal', title: '还款本金（元）', className: 'align-right', render: text => formatDecimal2(text) },
      { dataIndex: 'settledIncome', title: '还款利息（元）', className: 'align-right', render: text => formatDecimal2(text) },
      { dataIndex: 'overduePenaltyAmount', title: '罚息（元）', className: 'align-right', render: text => formatDecimal2(text) },
      { dataIndex: 'advancePenaltyAmount', title: '补息（元）', className: 'align-right', render: text => formatDecimal2(text) },
      { dataIndex: 'couponSettledIncome', title: '券的收益（元）', className: 'align-right', render: text => formatDecimal2(text) },
      { dataIndex: 'tradeStatus', title: '状态', render: (text) => <Badge {...refundStatus[text]} /> },
    ];
    const query = parseParam(location.search);
    const pagination = {
      total: totalRowsCount,
      current: parseInt(query.pageIndex, 10) || 1,
      pageSize: parseInt(query.pageSize, 10) || 10,
      onChange: this.handlePageChange,
    };
    return (
      <div style={{ margin: 16 }} className={styles['refund-record']}>
        <FilterForm filter={query} onSearch={this.handleSearch} />
        <PageList
          rowKey="id"
          loading={loading}
          columns={refundColumns}
          dataSource={refundItems}
          pagination={pagination}
        />
      </div>
    );
  }
}

RefundRecord.propTypes = {
  form: PropTypes.object.isRequired,
};

export default Form.create()(RefundRecord);
