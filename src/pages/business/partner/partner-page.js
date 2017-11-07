import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Button, message } from 'antd';
import isEqual from 'lodash/isEqual';
import { queryTo, parseParam } from '../../../utils/location-helper';
import PartnerList from './partner-list';
import dao from '../../../dao/partner';

const TabPane = Tabs.TabPane;

export default class PartnerPage extends React.Component {
  static contextTypes = {
    location: PropTypes.object,
    router: PropTypes.object.isRequired,
  };
  state = {
    loading: false,
    allData: {},
    assetData: {},
    guaranteeData: {},
    projectData: {},
  };
  componentWillUnmount() {
    this.initPending && this.initPending.cancel();
    this.submitPending && this.submitPending.cancel();
    this.delPending && this.delPending.cancel();
    this.lockPending && this.lockPending.cancel();
    this.unlockPending && this.unlockPending.cancel();
  }

  componentDidMount() {
    const query = this.context.location.query;
    this.loadPaginationData(query);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const nextQuery = nextContext.location.query;
    const query = this.context.location.query;
    if (!isEqual(query, nextQuery)) {
      console.log('receiveProps query', nextQuery.cooperationType);
      const key = this.getDataSourceKeyByType(nextQuery.cooperationType);
      // 合作方类型改变，且 对应data中有值的，不去拉取新的数据
      if (nextQuery.cooperationType !== query.cooperationType && this.state[key].pageIndex) {
        return;
      }
      this.loadPaginationData(query);
    }
  }

  getDataSourceKeyByType = (cooperationType) => {
    switch (cooperationType) {
      case 'cooperation_guarantee':
        return 'guaranteeData';
      case 'cooperation_asset':
        return 'assetData';
      case 'cooperation_project':
        return 'projectData';
      case 'cooperation_all':
        return 'allData';
      default:
        console.warn('not match any DataSource');
        return 'allData';
    }
  }

  loadPaginationData = async () => {
    console.log('search: ', location.search);
    const query = parseParam(location.search);

    this.initPending && this.initPending.cancel();
    this.setState({
      loading: true,
    });
    this.initPending = dao.partnerItems(query);
    const result = await this.initPending;
    this.setState({
      loading: false,
    });
    if (result.code === 0) {
      const data = result.data;

      // 加上条件查询数据
      data.userType = query.userType || '';
      data.displayName = query.displayName || '';
      const key = this.getDataSourceKeyByType(query.cooperationType);
      this.setState({ [key]: data });
    } else {
      message.error(result.msg || '加载合作方数据失败');
    }
  }
  handleAdd = () => {
    this.context.router.push('/partner/add');
  };
  // 点击查询按钮回调
  handleSearch = (fields) => {
    this.handleFilterChange(fields);
  };

  // 单个过滤条件变化的回调
  handleFilterChange = (fields) => {
    // console.log(fields);
    queryTo(location, fields);
  };
  handleChangeTab = (key) => {
    const index = this.getDataSourceKeyByType(key);
    const { pageIndex, pageSize, userType, displayName } = this.state[index];
    queryTo(location, {
      cooperationType: key,
      pageIndex,
      pageSize,
      userType,
      displayName,
    });
  };
  render() {
    const operations = <Button size="large" onClick={this.handleAdd}>新增</Button>;
    const query = parseParam(location.search);
    return (
      <Tabs
        style={{ padding: 20 }}
        animated={{ inkBar: true, tabPane: false }}
        defaultActiveKey={query.cooperationType}
        tabBarExtraContent={operations}
        onChange={this.handleChangeTab}
      >
        <TabPane tab="全部" key="cooperation_all">
          <PartnerList cooperationType="cooperation_all" dataSource={this.state.allData} />
        </TabPane>
        <TabPane tab="资产方" key="cooperation_asset">
          <PartnerList cooperationType="cooperation_asset" dataSource={this.state.assetData} />
        </TabPane>
        <TabPane tab="担保方" key="cooperation_guarantee">
          <PartnerList cooperationType="cooperation_guarantee" dataSource={this.state.guaranteeData} />
        </TabPane>
        <TabPane tab="项目方" key="cooperation_project">
          <PartnerList cooperationType="cooperation_project" dataSource={this.state.projectData} />
        </TabPane>
      </Tabs>
    );
  }
}
