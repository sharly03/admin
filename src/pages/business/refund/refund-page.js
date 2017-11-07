import React from 'react';
import PropTypes from 'prop-types';
import { Form, Row, Col, Button, Input, Select, message, Badge } from 'antd';
import { PageList } from '../../../components/page-list';
import FilterItem from '../../../components/filter-item';
import { parseParam, redirect, queryTo } from '../../../utils/location-helper';
import { formatDecimal2, dateFormat } from '../../../utils';
import dao from '../../../dao/refund';

import styles from './refund.less';

const Search = Input.Search;
const Option = Select.Option;


// Filter 组件
const Filter = ({ form, filter, onSearch }) => {
  const handleSubmit = () => {
    const { getFieldsValue } = form;
    const fieldsValue = getFieldsValue();
    console.log('filter submit', fieldsValue);
    // 解析参数
    const query = {
      ...parseParam(location.search),
      ...fieldsValue,
      pageIndex: 1,
    };
    queryTo(location, query, true);
    onSearch(query);
  };

  const getFieldContainer = children => {
    const { getFieldDecorator } = form;
    const { commodityCode, contractNo, status, commodityType, assetName } = filter;
    const filedList = [
      { label: '标的编号', id: 'commodityCode', value: commodityCode },
      { label: '合同编号', id: 'contractNo', value: contractNo },
      { label: '状态', id: 'status', value: status || '' },
      { label: '标的类型', id: 'commodityType', value: commodityType || '' },
      { label: '资产方名称', id: 'assetName', value: assetName },
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
        <Search placeholder="请输入" size="large" onSearch={handleSubmit} />,
        <Search placeholder="请输入" size="large" onSearch={handleSubmit} />,
        <Select style={{ width: '100%' }} size="large">
          <Option value="">全部</Option>
          <Option value="WR">待还款</Option>
          <Option value="IR">处理中</Option>
          <Option value="RS">还款成功</Option>
          <Option value="RF">还款失败</Option>
        </Select>,
        <Select style={{ width: '100%' }} size="large">
          <Option value="">全部</Option>
          <Option value="01">普通标</Option>
          <Option value="02">体验标</Option>
          <Option value="03">新手标</Option>
          <Option value="04">定向标</Option>
        </Select>,
        <Search placeholder="请输入" size="large" onSearch={handleSubmit} />,
      ])}
      <Col
        md={{ span: 8, order: 4 }}
        xl={{ span: 6, order: 2 }}
      >
        <Button type="primary" htmlType="submit" size="large" onClick={handleSubmit}>查询</Button>
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
  WS: { status: 'default', text: '待还款' },
  SF: { status: 'default', text: '待还款' },
  WR: { status: 'default', text: '待还款' },
  IR: { status: 'processing', text: '还款中' },
  RS: { status: 'success', text: '还款成功' },
  RF: { status: 'error', text: '还款失败' },
};

// 还款主页面
class Refund extends React.Component {
  state = {
    loading: false,
    totalRowsCount: 0,
    refundItems: [],
  };

  componentDidMount() {
    this.fetchRefund(parseParam(location.search));
  }
  componentWillUnmount() {
    this.refundPendding && this.refundPendding.cancel();
  }

  async fetchRefund(query) {
    this.refundPendding && this.refundPendding.cancel();
    this.setState({ loading: true });
    this.refundPendding = dao.fecthRefund({ ...query, pageSize: query.pageSize || 10 });
    const data = await this.refundPendding;
    this.setState({ loading: false });
    if (data.code === 0) {
      const { items, totalRowsCount } = data.data;
      this.setState({ refundItems: items, totalRowsCount });
    } else {
      message.error(data.msg || '数据加载失败');
    }
  }

  handleSearch = query => this.fetchRefund(query);
  handlePageChange = (pageIndex, pageSize) => {
    const query = {
      ...parseParam(location.search),
      pageIndex,
      pageSize,
    };
    queryTo(location, query, true);
    this.fetchRefund(query);
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
      { dataIndex: 'realSettlePrincipal', title: '还款本金（元）', className: 'align-right', render: (text) => formatDecimal2(text) },
      { dataIndex: 'periods', title: '总期数', className: 'align-center' },
      { dataIndex: 'remainSequence', title: '未还期数', className: 'align-center' },
      { dataIndex: 'overduePenaltyDays', title: '罚息时长（天）', className: 'align-center' },
      { dataIndex: 'advancePenaltyDays', title: '补息时长（天）', className: 'align-center' },
      { dataIndex: 'couponAmount', title: '券的收益（元）', className: 'align-right', render: text => formatDecimal2(text) },
      { dataIndex: 'incomeEndDate', title: '止息日', render: text => dateFormat(text) },
      { dataIndex: 'refundStatusCode', title: '状态', render: text => <Badge {...refundStatus[text]} /> },
      {
        dataIndex: 'operation',
        title: '操作',
        render: (text, { commodityCode }) => <a onClick={() => redirect('/business/refund/periods', false, { commodityCode })}>还款期数详情</a>,
      },
    ];
    const query = parseParam(location.search);
    const pagination = {
      total: totalRowsCount,
      current: parseInt(query.pageIndex, 10) || 1,
      pageSize: parseInt(query.pageSize, 10) || 10,
      onChange: this.handlePageChange,
    };
    return (
      <div style={{ margin: 16 }} className={styles['refund-container']}>
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

export default Refund;
