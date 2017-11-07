import React from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Row, Col, Input, Select, message, Badge, Modal } from 'antd';
import FilterItem from '../../../components/filter-item';
import { PageList } from '../../../components/page-list';
import { parseParam, queryTo, redirect } from '../../../utils/location-helper';
import { formatDecimal2, datetimeFormat } from '../../../utils';
import dao from '../../../dao/sale';

import styles from './sale.less';

const Search = Input.Search;
const Option = Select.Option;

const Filter = ({ form, filter, onSearch }) => {
  const handleSubmit = params => {
    const { getFieldsValue } = form;
    const fieldsValue = getFieldsValue();
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
    const { mobile, orderStatus = '' } = filter;
    const filedList = [
      { label: '手机号', id: 'mobile', value: mobile },
      { label: '状态', id: 'orderStatus', value: orderStatus },
    ];

    return filedList.map((filed, index) => {
      const { id, label, value } = filed;
      return (
        <Col
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
        <Search placeholder="请输入" size="large" onSearch={() => handleSubmit()} />,
        <Select style={{ width: '100%' }} size="large" onChange={value => handleSubmit({ orderStatus: value })}>
          <Option value="">全部</Option>
          <Option value="success">成功</Option>
          <Option value="fail">失败</Option>
          <Option value="process">处理中</Option>
          <Option value="GS_520">已流标</Option>
        </Select>,
      ])}
      <Col
        md={{ span: 8, offset: 0 }}
        xl={{ span: 6, offset: 6 }}
      >
        <Button type="primary" htmlType="submit" size="large" onClick={() => handleSubmit()}>查询</Button>
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

const tradeStatus = {
  success: { text: '成功', status: 'success' },
  fail: { text: '失败', status: 'error' },
  process: { text: '处理中', status: 'processing' },
  GS_520: { text: '已流标', status: 'default' },
};

class SaleDetai extends React.Component {
  state = {
    loading: false,
    totalRowsCount: 0,
    orderDetail: [],
  };

  componentDidMount() {
    this.fetchOrderList(parseParam(location.search));
  }
  componentWillUnmount() {
    this.orderPendding && this.orderPendding.cancel();
  }

  async fetchOrderList(query) {
    this.orderPendding && this.orderPendding.cancel();
    this.setState({ loading: true });
    this.orderPendding = dao.orderList({ ...query, pageSize: query.pageSize || 10 });
    const data = await this.orderPendding;
    this.setState({ loading: false });
    if (data.code === 0) {
      const { items, totalRowsCount } = data.data;
      this.setState({ orderDetail: items, totalRowsCount });
    } else {
      message.error(data.msg || '数据加载失败');
    }
  }

  handleSearch = query => this.fetchOrderList(query);
  handlePageChange = (pageIndex, pageSize) => {
    const query = {
      ...parseParam(location.search),
      pageIndex,
      pageSize,
    };
    queryTo(location, query, true);
    this.fetchOrderList(query);
  };
  handleOrderCancel = record => {
    console.log('order cancel', record);
    const { userMobile, purchaseOrderId } = record;
    confirm({
      title: `确定要取消手机号${userMobile}的订单吗？`,
      onOk: async () => {
        const data = await dao.orderCancel({ equityPurchaseOrderId: purchaseOrderId });
        if (data.code === 0) {
          this.fetchOrderList(parseParam(location.search));
          message.success(data.msg);
        } else {
          message.error(data.msg);
        }
      },
    });
  };

  render() {
    const orderColumns = [
      // { dataIndex: 'order', title: '序号', render: (text, record, index) => index + 1 },
      {
        dataIndex: 'commodityNo',
        title: '标的编号',
        render: (text, { commodityId }) => <a onClick={() => redirect('/business/commodity/preview', false, { commodityId })}>{text}</a>,
      },
      { dataIndex: 'userMobile', title: '手机号' },
      { dataIndex: 'orderAmount', title: '投资金额（元）', className: 'align-right', render: text => formatDecimal2(text) },
      { dataIndex: 'purchaseDate', title: '投资时间', render: text => datetimeFormat(text) },
      { dataIndex: 'statusCode', title: '购买状态', render: status => <Badge {...tradeStatus[status]} /> },
      { dataIndex: 'statusDesc', title: '状态说明' },
      {
        dataIndex: 'operation',
        title: '操作',
        render: (text, record) => record.statusCode === 'success' && <a onClick={() => this.handleOrderCancel(record)}>取消下单</a>,
      },
    ];
    const query = parseParam(location.search);
    const { loading, totalRowsCount, orderDetail } = this.state;
    const pagination = {
      total: totalRowsCount,
      current: parseInt(query.pageIndex, 10) || 1,
      pageSize: parseInt(query.pageSize, 10) || 10,
      onChange: this.handlePageChange,
    };
    return (
      <div style={{ margin: 16 }} className={styles['sale-detail']}>
        <FilterForm filter={query} onSearch={this.handleSearch} />
        <PageList
          rowKey="purchaseOrderId"
          loading={loading}
          columns={orderColumns}
          dataSource={orderDetail}
          pagination={pagination}
        />
      </div>
    );
  }
}

export default SaleDetai;
