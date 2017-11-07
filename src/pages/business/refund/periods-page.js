import React from 'react';
import PropTypes from 'prop-types';
import { Form, Row, Col, Input, Select, Button, Modal, message, Badge } from 'antd';
import FilterItem from '../../../components/filter-item';
import OperationLink from '../operation-link';
import { PageList } from '../../../components/page-list';
import { parseParam, queryTo, redirect } from '../../../utils/location-helper';
import { formatDecimal2, dateFormat } from '../../../utils';
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
    const { commodityCode, settleStatus, status } = filter;
    const filedList = [
      { label: '标的编号', id: 'commodityCode', value: commodityCode },
      { label: '结算状态', id: 'settleStatus', value: settleStatus || '' },
      { label: '标的状态', id: 'status', value: status || '' },
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
        <Select style={{ width: '100%' }} size="large" onChange={value => handleSearch({ settleStatus: value })}>
          <Option value="">全部</Option>
          <Option value="WS">待结算</Option>
          <Option value="WR">结算成功</Option>
          <Option value="SF">结算失败</Option>
        </Select>,
        <Select style={{ width: '100%' }} size="large" onChange={value => handleSearch({ status: value })}>
          <Option value="">全部</Option>
          <Option value="WR">待还款</Option>
          <Option value="IR">还款中</Option>
          <Option value="RS">还款成功</Option>
          <Option value="RF">还款失败</Option>
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
const confirm = Modal.confirm;

// 获取还款状态
const getRefundStatus = status => {
  switch (status) {
    case 'WR':
    case 'WS':
    case 'SF':
      return { status: 'default', text: '待还款' };
    case 'IR':
      return { status: 'processing', text: '还款中' };
    case 'RS':
      return { status: 'success', text: '还款成功' };
    case 'RF':
      return { status: 'error', text: '还款失败' };
    default:
  }
};
// 获取结算状态
const getSettleStatus = status => {
  switch (status) {
    case 'WS':
      return { status: 'processing', text: '待结算' };
    case 'SF':
      return { status: 'error', text: '结算失败' };
    case 'IR':
    case 'RS':
    case 'RF':
    case 'WR':
      return { status: 'success', text: '结算成功' };
    default:
  }
};

class RefundPeriods extends React.Component {
  state = {
    loading: false,
    totalRowsCount: 0,
    periodItems: [],
  };

  componentDidMount() {
    this.refundPeriods(parseParam(location.search));
  }
  componentWillUnmount() {
    this.periodsPendding && this.periodsPendding.cancel();
  }

  async refundPeriods(query) {
    this.periodsPendding && this.periodsPendding.cancel();
    this.setState({ loading: true });
    this.periodsPendding = dao.refundPeriods({ ...query, pageSize: query.pageSize || 10 });
    const data = await this.periodsPendding;
    this.setState({ loading: false });
    if (data.code === 0) {
      const { items, totalRowsCount } = data.data;
      this.setState({ periodItems: items, totalRowsCount });
    } else {
      message.error(data.msg || '数据加载失败');
    }
  }
  refundOk = async query => {
    const data = await dao.refundSubmit(query);
    if (data.code === 0) {
      message.success(data.msg || '还款成功');
    } else {
      message.error(data.msg || '还款失败');
    }
  };
  handleSearch = query => this.refundPeriods(query);
  handlePageChange = (pageIndex, pageSize) => {
    const query = {
      ...parseParam(location.search),
      pageIndex,
      pageSize,
    };
    queryTo(location, query, true);
    this.refundPeriods(query);
  };

  render() {
    const { loading, totalRowsCount, periodItems } = this.state;
    // 获取操作状态
    const getOperationStatus = record => {
      const { refundStatusCode: status, commodityId, id, periods: peroid } = record;
      const settle = {
        text: '结算',
        action: () => redirect('/business/refund/settle', false, { commodityRefundPlanId: id }),
      };
      const refund = {
        text: '还款',
        action: () => confirm({
          title: '确定还款吗？',
          okText: '继续',
          onOk: () => this.refundOk({ refundPlanId: id, refundType: '01' }),
        }),
      };
      const detail = {
        text: '还款人员清单',
        action: () => redirect('/business/refund/record', false, { commodityId, peroid }),
      };
      switch (status) {
        case 'WS':
        case 'SF':
          return [settle, detail];
        case 'WR':
        case 'RS':
        case 'IR':
        case 'RF':
          return [refund, detail];
        default:
      }
    };
    const periodColumns = [
      // { dataIndex: 'order', title: '序号', render: (text, record, index) => index + 1 },
      {
        dataIndex: 'commodityCode',
        title: '标的编号',
        render: (text, { id }) => <a onClick={() => redirect('/business/commodity/preview', false, { commodityId: id })}>{text}</a>,
      },
      { dataIndex: 'realSettlePrincipal', title: '还款本金（元）', className: 'align-right', render: text => formatDecimal2(text) },
      { dataIndex: 'realSettleIncome', title: '还款利息（元）', className: 'align-right', render: text => formatDecimal2(text) },
      { dataIndex: 'sequence', title: '期数', className: 'align-center' },
      { dataIndex: 'overduePenaltyAmount', title: '罚息（元）', className: 'align-right', render: text => formatDecimal2(text) },
      { dataIndex: 'advancePenaltyAmount', title: '补息（元）', className: 'align-right', render: text => formatDecimal2(text) },
      { dataIndex: 'couponAmount', title: '券的收益（元）', className: 'align-right', render: text => formatDecimal2(text) },
      { dataIndex: 'refundPersonCount', title: '还款人数', className: 'align-center' },
      { dataIndex: 'incomeEndDate', title: '止息日', render: text => dateFormat(text) },
      { dataIndex: 'settleStatus', title: '结算状态', render: (text, { refundStatusCode: status }) => <Badge {...getSettleStatus(status)} /> },
      { dataIndex: 'refundStatusCode', title: '还款状态', render: (text) => <Badge {...getRefundStatus(text)} /> },
      {
        dataIndex: 'operation',
        title: '操作',
        render: (text, record) => <OperationLink options={getOperationStatus(record)} />,
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
      <div style={{ margin: 16 }} className={styles['refund-periods']}>
        <FilterForm filter={query} onSearch={this.handleSearch} />
        <PageList
          rowKey="id"
          loading={loading}
          columns={periodColumns}
          dataSource={periodItems}
          pagination={pagination}
        />
      </div>
    );
  }
}

RefundPeriods.propTypes = {
  form: PropTypes.object.isRequired,
};

export default Form.create()(RefundPeriods);
