import React from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Row, Col, Input, Select, message, Badge, Modal } from 'antd';
import FilterItem from '../../../components/filter-item';
import { parseParam, queryTo, redirect } from '../../../utils/location-helper';
import { dateFormat, formatDecimal2 } from '../../../utils/index';
import { PageList } from '../../../components/page-list';
import OperationLink from '../operation-link';
import dao from '../../../dao/commodity';

import styles from './commodity.less';

const Search = Input.Search;
const Option = Select.Option;

const Filter = ({ form, filter, onSearch, onAdd }) => {
  // 搜索
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
  // 新增
  const handleAdd = () => {
    console.log('add');
    onAdd();
  };

  const getFieldContainer = children => {
    const { commodityNo, contractNo, commodityStatus = '', commodityType = '', cooperationName } = filter;
    const filedList = [
      { label: '标的编号', id: 'commodityNo', value: commodityNo },
      { label: '合同编号', id: 'contractNo', value: contractNo },
      { label: '状态', id: 'commodityStatus', value: commodityStatus },
      { label: '标的类型', id: 'commodityType', value: commodityType },
      { label: '资产方名称', id: 'cooperationName', value: cooperationName },
    ];

    return filedList.map((filed, index) => {
      const { id, label, value } = filed;
      const { getFieldDecorator } = form;
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
        <Search placeholder="请输入" size="large" onSearch={() => handleSubmit()} />,
        <Search placeholder="请输入" size="large" onSearch={() => handleSubmit()} />,
        <Select style={{ width: '100%' }} size="large" onChange={value => handleSubmit({ commodityStatus: value })}>
          <Option value="">全部</Option>
          <Option value="01">待提交</Option>
          <Option value="02">待审核</Option>
          <Option value="03">审核不通过</Option>
          <Option value="04">待上送</Option>
          <Option value="07">银行审核不通过</Option>
        </Select>,
        <Select style={{ width: '100%' }} size="large" onChange={value => handleSubmit({ commodityType: value })}>
          <Option value="">全部</Option>
          <Option value="01">普通标</Option>
          <Option value="02">体验标</Option>
          <Option value="03">新手标</Option>
          <Option value="04">定向标</Option>
        </Select>,
        <Search placeholder="请输入" size="large" onSearch={() => handleSubmit()} />,
      ])}
      <Col
        md={{ span: 8, order: 4 }}
        xl={{ span: 6, order: 2 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button type="primary" htmlType="submit" size="large" onClick={() => handleSubmit()}>搜索</Button>
          <Button size="large" onClick={handleAdd}>新增</Button>
        </div>
      </Col>
    </Row>
  );
};

Filter.defaultProps = {
  filter: {},
  onSearch: () => {},
  onAdd: () => {},
};
Filter.propTypes = {
  form: PropTypes.object.isRequired,
  filter: PropTypes.object,
  onSearch: PropTypes.func,
  onAdd: PropTypes.func,
};

const FilterForm = Form.create()(Filter);
const confirm = Modal.confirm;

const commodityStatus = {
  '01': { status: 'success', text: '待提交' },
  '02': { status: 'success', text: '待审核' },
  '03': { status: 'error', text: '审核不通过' },
  '04': { status: 'processing', text: '待上送' },
  '07': { status: 'error', text: '银行审核不通过' },
};
const commodityTypes = {
  '01': '普通标',
  '02': '体验标',
  '03': '新手标',
  '04': '定向标',
};
const settleWays = {
  '01': '等额本息',
  '02': '先息后本',
  '03': '到期还本付息',
};

class Commodity extends React.Component {
  state = {
    loading: false,
    totalRowsCount: 0,
    commodityItems: [],
  };

  componentDidMount() {
    this.fetchCommodity(parseParam(location.search));
  }
  componentWillUnmount() {
    this.commodityPendding && this.commodityPendding.cancel();
  }

  async fetchCommodity(query) {
    this.commodityPendding && this.commodityPendding.cancel();
    this.setState({ loading: true });
    this.commodityPendding = dao.fetchCommodity(query);
    const data = await this.commodityPendding;
    this.setState({ loading: false });
    if (data.code === 0) {
      const { items, totalRowsCount } = data.data;
      this.setState({ commodityItems: items, totalRowsCount });
    } else {
      message.error(data.msg || '数据加载失败');
    }
  }

  handleSearch = query => this.fetchCommodity(query);
  handlePageChange = (pageIndex, pageSize) => {
    const query = {
      ...parseParam(location.search),
      pageIndex,
      pageSize,
    };
    queryTo(location, query, true);
    this.fetchCommodity(query);
  };

  render() {
    const getOperations = record => {
      const { status, id: commodityId } = record;
      const submit = {
        text: '提交',
        action: () => {
          confirm({
            title: '确定要提交到审核吗？',
            okText: '继续',
            onOk: async () => {
              const data = await dao.commoditySubmit({ commodityId });
              if (data.code === 0) {
                this.fetchCommodity(parseParam(location.search));
                message.success(data.msg);
              } else {
                message.error(data.msg);
              }
            },
          });
        },
      };
      const edit = { text: '编辑', action: () => redirect('/business/commodity/edit', false, { commodityId }) };
      const audit = { text: '审核', action: () => redirect('/business/commodity/audit', false, { commodityId }) };
      const detail = { text: '详情', action: () => redirect('/business/commodity/preview', false, { commodityId }) };
      const send = {
        text: '上送',
        action: () => {
          confirm({
            title: '确定上送吗？',
            okText: '继续',
            onOk: async () => {
              const data = await dao.commoditySend({ commodityId });
              if (data.code === 0) {
                this.fetchCommodity(parseParam(location.search));
                message.success(data.msg);
              } else {
                message.error(data.msg);
              }
            },
          });
        },
      };
      const operations = {
        '01': [edit, submit],
        '02': [audit, detail],
        '03': [edit, submit],
        '04': [send, detail],
        '07': [edit, submit],
      };
      return operations[status];
    };
    const commodityColumns = [
      // { dataIndex: 'order', title: '序号', render: (text, record, index) => index + 1 },
      {
        dataIndex: 'commodityCode',
        title: '标的编号',
        render: (text, { id }) => <a onClick={() => redirect('/business/commodity/preview', false, { commodityId: id })}>{text}</a>,
      },
      { dataIndex: 'financialType', title: '项目类型' },
      { dataIndex: 'commodityType', title: '标的类型', render: text => commodityTypes[text] },
      { dataIndex: 'totalAmount', title: '标的金额', className: 'align-right', render: text => formatDecimal2(text) },
      { dataIndex: 'annualRate', title: '预期年化率', className: 'align-center', render: text => `${text}%` },
      { dataIndex: 'settleType', title: '还款方式', render: text => settleWays[text] },
      {
        dataIndex: 'buyTime',
        title: '预售期',
        render: (text, { buyBeginTime, buyEndTime }) => `${dateFormat(buyBeginTime)}~${dateFormat(buyEndTime)}`,
      },
      {
        dataIndex: 'incomeDate',
        title: '收益期',
        render: (text, { incomeBeginDate, incomeEndDate }) => `${dateFormat(incomeBeginDate)}~${dateFormat(incomeEndDate)}`,
      },
      { dataIndex: 'status', title: '状态', render: text => <Badge {...commodityStatus[text]} /> },
      { dataIndex: 'operation', title: '操作', render: (_, record) => <OperationLink options={getOperations(record)} /> },
    ];
    const query = parseParam(location.search);
    const { loading, totalRowsCount, commodityItems } = this.state;
    const pagination = {
      total: totalRowsCount,
      current: parseInt(query.pageIndex, 10) || 1,
      pageSize: parseInt(query.pageSize, 10) || 10,
      onChange: this.handlePageChange,
    };
    return (
      <div style={{ margin: 16 }} className={styles['commodity-container']}>
        <FilterForm
          filter={query}
          onSearch={this.handleSearch}
          onAdd={() => redirect('/business/commodity/add', false)}
        />
        <PageList
          rowKey="id"
          loading={loading}
          columns={commodityColumns}
          dataSource={commodityItems}
          pagination={pagination}
        />
      </div>
    );
  }
}

export default Commodity;
