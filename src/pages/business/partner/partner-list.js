import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';

import Filter from './filter';
import { PageList } from '../../../components/page-list';
import { queryTo, redirect } from '../../../utils/location-helper';


export default class PartnerList extends React.Component {
  static contextTypes = {
    location: PropTypes.object,
    router: PropTypes.object.isRequired,
  };

  static defaultProps = {
    cooperationType: 'all',
  }

  static propTypes = {
    dataSource: PropTypes.object.isRequired,
    cooperationType: PropTypes.string,
  };
  state = {
    query: [],
  };
  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.dataSource, this.props.dataSource)) {
      console.log(nextProps.dataSource, this.props.dataSource);
      // this.setState({
      //   total: nextProps.dataSource.totalRowsCount,
      // });
    }
  }
  handleEditClick = (id) => {
    redirect('/partner/edit', false, { id });
  }
  handleChangePage = (pageIndex, pageSize) => {
    queryTo(location, {
      ...this.context.location.query,
      pageIndex,
      pageSize,
    });
  };

  handleFilterChange = (fields) => {
    console.log(fields);
    queryTo(location, {
      cooperationType: this.props.cooperationType,
      ...fields,
    });
  }
  render() {
    const { dataSource, cooperationType } = this.props;
    const pagination = {
      total: dataSource.totalRowsCount || 0,
      current: dataSource.pageIndex || 1,
      pageSize: dataSource.pageSize || 20,
      onChange: this.handleChangePage,
    };
    const query = this.context.location.query;
    const columns1 = [
      {
        title: '合作方类型',
        dataIndex: 'userType',
        render: (text, record) => {
          return (
            <div>{record.status === '01' ? '个人' : '企业'}</div>
          );
        },
      }, {
        title: '合作方名称',
        dataIndex: 'name',
      },
    ];
    const columns2 = [
      {
        title: '授信额度（元）',
        dataIndex: 'creditLine',
      }, {
        title: '剩余额度（元）',
        dataIndex: 'remainingLine',
        render: (text, record) => {
          return (
            <div>{parseFloat(record.creditLine) - parseFloat(record.usedCreditLine)}</div>
          );
        },
      },
    ];
    const columns3 = [
      {
        title: '创建时间',
        dataIndex: 'createAt',
      }, {
        title: '操作',
        width: 100,
        render: (text, record) => {
          return (
            <div>
              <a onClick={this.handleEditClick.bind(this, record.id)}>详情</a>
            </div>
          );
        },
      },
    ];
    let columns = columns1.concat(columns3);
    if (cooperationType === 'cooperation_asset') {
      columns = columns1.concat(columns2).concat(columns3);
    }
    return (
      <div>
        <Filter filter={query} onSearch={this.handleFilterChange} onFilterChange={this.handleFilterChange} />
        <PageList rowKey="id" columns={columns} dataSource={dataSource.items} pagination={pagination} />
      </div>
    );
  }
}
