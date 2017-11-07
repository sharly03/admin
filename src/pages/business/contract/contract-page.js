import React from 'react';
import PropTypes from 'prop-types';
import { message } from 'antd';
import isEqual from 'lodash/isEqual';
import Filter from './filter';

import { queryTo, redirect } from '../../../utils/location-helper';
import { dateFormat, formatDecimal2 } from '../../../utils';

import dao from '../../../dao/contract';
import { PageList } from '../../../components/page-list';

import './contract.less';

const RepaymentStatus = {
  '01': { text: '按月付息' },
  '02': { text: '按季付息' },
  '03': { text: '一次性付息' },
  '04': { text: '等额本息' },
  '05': { text: '先息后本' },
  '06': { text: '到期还本付息' },
};

export default class ContractPage extends React.Component {
  static contextTypes = {
    location: PropTypes.object,
    router: PropTypes.object.isRequired,
  };
  state = {
    loading: false,
    dataSource: [],
    current: 1,
    pageIndex: 1,
    pageSize: 20,
    total: 0,
    query: [],
  };
  componentWillUnmount() {
    this.initPending && this.initPending.cancel();
    this.submitPending && this.submitPending.cancel();
  }

  componentDidMount() {
    const query = this.context.location.query;
    this.loadPaginationData(query);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (!isEqual(nextContext.location.query, this.context.location.query)) {
      const query = nextContext.location.query;
      this.loadPaginationData(query);
    }
  }

  loadPaginationData = async (query) => {
    this.initPending && this.initPending.cancel();
    this.setState({
      loading: true,
    });
    this.initPending = dao.fetchItems(query);
    const result = await this.initPending;
    if (result.code === 0) {
      console.log('=====', result);
      const data = result.data;
      this.setState({
        loading: false,
        dataSource: data.items,
        total: data.totalRowsCount,
        pageSize: data.pageSize,
        current: data.pageIndex,
      });
    } else {
      this.setState({
        loading: false,
      });
      message.error('加载用户数据失败');
    }
  }
  handleAdd = () => {
    let route = '/contract/addContract';
    console.log(route);
    this.context.router.push(route);
  };
  // 编辑
  handleEditClick = (id) => {
    redirect('/contract/editContract', false, { id });
  }
  handleFilterChange = (fields) => {
    console.log(fields);
    queryTo(location, fields);
  }

  handleChangePage = (pageIndex, pageSize) => {
    queryTo(location, {
      ...this.context.location.query,
      pageIndex,
      pageSize: pageSize || this.state.pageSize,
    });
  };

  render() {
    const columns = [
      {
        title: '合同编号',
        dataIndex: 'contractNo',
        key: 'contractNo',
      },
      {
        title: '资产方名称',
        dataIndex: 'assetsCooperativeUserName',
        key: 'assetsCooperativeUserName',
      },
      {
        title: '还款方式',
        dataIndex: 'settlementType',
        key: 'settlementType',
        render: (key) => RepaymentStatus[key].text,
      },
      {
        title: '合同金额',
        dataIndex: 'contractAmount',
        key: 'contractAmount',
        className: 'align-right',
        render: (text) => formatDecimal2(text),
      },
      {
        title: '融资利率',
        dataIndex: 'financingRate',
        key: 'financingRate',
        render: (text) => `${text}%`,
      },
      {
        title: '借款时间',
        dataIndex: 'loanDate',
        key: 'loanDate',
        render: (text, record) => {
          return <div>{dateFormat(record.incomeBeginDate)} ~ {dateFormat(record.incomeEndDate)}</div>;
        },
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        render: (text, record) => (
          <div>
            <a onClick={this.handleEditClick.bind(this, record.id)} >详情</a>
          </div>
        ),
      },
    ];
    const { current, total, pageSize } = this.state;
    const query = this.context.location.query;
    return (
      <div style={{ margin: '16px' }}>
        <Filter filter={query} onAdd={this.handleAdd} onSearch={this.handleSearch} onFilterChange={this.handleFilterChange} />
        <PageList loading={this.state.loading}
          rowKey="id"
          dataSource={this.state.dataSource}
          columns={columns}
          pagination={{
            current,
            total,
            pageSize,
            onChange: this.handleChangePage,
          }}
        />
      </div>
    );
  }
}
