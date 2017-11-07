import React from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Row, Col, Input, Select, message, Badge, Modal } from 'antd';
import FilterItem from '../../../components/filter-item';
import OperationLink from '../operation-link';
import { PageList } from '../../../components/page-list';
import { parseParam, queryTo, redirect } from '../../../utils/location-helper';
import { formatDecimal2 } from '../../../utils';
import dao from '../../../dao/loan';

import styles from './loan.less';


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
    const { commodityCode, contractNo, status = '', assetName } = filter;
    const filedList = [
      { label: '标的编号', id: 'commodityCode', value: commodityCode },
      { label: '合同编号', id: 'contractNo', value: contractNo },
      { label: '状态', id: 'status', value: status },
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
        <Search placeholder="请输入" size="large" onSearch={() => handleSubmit()} />,
        <Search placeholder="请输入" size="large" onSearch={() => handleSubmit()} />,
        <Select style={{ width: '100%' }} size="large" onChange={value => handleSubmit({ status: value })}>
          <Option value="">全部</Option>
          <Option value="01">待放款审核</Option>
          <Option value="02">放款审核驳回</Option>
          <Option value="03">待放款</Option>
          <Option value="04">放款中</Option>
          <Option value="05">放款失败</Option>
        </Select>,
        <Search placeholder="请输入" size="large" onSearch={() => handleSubmit()} />,
      ])}
      <Col
        md={{ span: 8, order: 1 }}
        xl={{ span: 6, order: 2 }}
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

const loanStatus = {
  '01': { status: 'default', text: '待提交' },
  '02': { status: 'default', text: '待放款审核' },
  '03': { status: 'error', text: '放款审核驳回' },
  '04': { status: 'default', text: '待放款' },
  '05': { status: 'success', text: '放款中' },
  '06': { status: 'success', text: '放款成功' },
  '07': { status: 'error', text: '放款失败' },
};

class Loan extends React.Component {
  state = {
    loading: false,
    totalRowsCount: 0,
    loanItems: [],
  };

  componentDidMount() {
    this.fetchLoanList(parseParam(location.search));
  }
  componentWillUnmount() {
    this.loanPendding && this.loanPendding.cancel();
  }

  async fetchLoanList(query) {
    this.loanPendding && this.loanPendding.cancel();
    this.setState({ loading: true });
    this.loanPendding = dao.fetchList({ ...query, pageSize: query.pageSize || 10 });
    const data = await this.loanPendding;
    this.setState({ loading: false });
    if (data.code === 0) {
      const { items, totalRowsCount } = data.data;
      this.setState({ loanItems: items, totalRowsCount });
    } else {
      message.error(data.msg || '数据加载失败');
    }
  }

  handleSearch = query => this.fetchLoanList(query);
  handlePageChange = (pageIndex, pageSize) => {
    const query = {
      ...parseParam(location.search),
      pageIndex,
      pageSize,
    };
    queryTo(location, query, true);
    this.fetchLoanList(query);
  };

  render() {
    const getOperations = record => {
      const { statusCode: status, equityProductId, loanRequestId } = record;
      const audit = { text: '审核', action: () => redirect('/business/loan/audit/edit', false, { loanRequestId }) };
      const flow = {
        text: '流标',
        action: () => {
          confirm({
            title: '确定流标吗？',
            okText: '继续',
            onOk: async () => {
              const data = await dao.fullFlow({ equityProductId, fullScaleFlag: true });
              if (data.code === 0) {
                this.fetchLoanList(parseParam(location.search));
                message.success(data.msg);
              } else {
                message.error(data.msg);
              }
            },
          });
        },
      };
      const loan = {
        text: '放款',
        action: () => {
          confirm({
            title: '确定放款吗？',
            okText: '继续',
            onOk: async () => {
              const data = await dao.loanExecute({ loanRequestId });
              if (data.code === 0) {
                this.fetchLoanList(parseParam(location.search));
                message.success(data.msg);
              } else {
                message.error(data.msg);
              }
            },
          });
        },
      };
      const loanDetail = { text: '放款详情', action: () => redirect('/business/loan/audit/preview', false, { loanRequestId }) };
      const operations = {
        '01': [],
        '02': [audit, loanDetail],
        '03': [flow, loanDetail],
        '04': [loan, loanDetail],
        '05': [loanDetail],
        '06': [],
        '07': [loan, loanDetail],
      };
      return operations[status];
    };
    const loanColumns = [
      {
        dataIndex: 'commodityCode',
        title: '标的编号',
        render: (text, { id }) => <a onClick={() => redirect('/business/commodity/preview', false, { commodityId: id })}>{text}</a>,
      },
      { dataIndex: 'contractNo', title: '合同编号', render: (_, { contractVO }) => contractVO.contractNo },
      { dataIndex: 'assetNo', title: '资产编号', render: (_, { contractVO }) => contractVO.assetNo },
      { dataIndex: 'assetName', title: '资产方名称', render: (_, { contractVO }) => contractVO.assetsCooperativeUserName },
      { dataIndex: 'commodityTotalAmount', title: '标的金额（元）', className: 'align-right', render: text => formatDecimal2(text) },
      { dataIndex: 'saledNumber', title: '已销售金额（元）', className: 'align-right', render: text => formatDecimal2(text) },
      { dataIndex: 'loanAmount', title: '放款额度（元）', className: 'align-right', render: text => formatDecimal2(text) },
      { dataIndex: 'statusCode', title: '状态', render: status => <Badge {...loanStatus[status]} /> },
      { dataIndex: 'operation', title: '操作', render: (_, record) => <OperationLink options={getOperations(record)} /> },
    ];
    const query = parseParam(location.search);
    const { loading, totalRowsCount, loanItems } = this.state;
    const pagination = {
      total: totalRowsCount,
      current: parseInt(query.pageIndex, 10) || 1,
      pageSize: parseInt(query.pageSize, 10) || 10,
      onChange: this.handlePageChange,
    };
    return (
      <div style={{ margin: 16 }} className={styles['loan-page']}>
        <FilterForm filter={query} onSearch={this.handleSearch} />
        <PageList
          rowKey="equityProductId"
          loading={loading}
          columns={loanColumns}
          dataSource={loanItems}
          pagination={pagination}
        />
      </div>
    );
  }
}

export default Loan;
