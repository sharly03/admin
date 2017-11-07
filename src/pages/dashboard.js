import React from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';
import { Bread, Sidebar, Header, Footer } from '../components/layout';
import BaseDao from '../dao/base';

import styles from './dashboard.less';

const { Content } = Layout;
export default class Container extends React.Component {
  static childContextTypes = {
    location: PropTypes.object,
  };

  static propTypes = {
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
  }

  getChildContext() {
    return {
      location: this.props.location,
    };
  }

  state = {
    profile: null,
    menus: null,
    siderFold: true,
  };

  componentDidMount() {
    const profile = BaseDao.getCurrentUser();
    this.dataLoading && this.dataLoading.cancel();
    this.dataLoading = BaseDao.fetchMenu().then((menus) => {
      this.setState({
        menus: menus.data,
        // profile: {'name': 'admin', 'role': 'ADMIN', 'uid': 1},
        profile,
      });
    });
  }
  handleSwitchSider = (collapsed) => {
    this.setState({
      siderFold: !collapsed,
    });
  };

  render() {
    if (!this.state.menus) return null;
    return (
      <Layout className={`ant-layout-has-sider ${styles.main}`}>
        <Sidebar menu={this.state.menus} siderFold={this.state.siderFold} onSwitchSider={this.handleSwitchSider} />
        <Layout id="dashboard_main_wrap" className={styles['dashboard-main']}>
          <Header profile={this.state.profile} siderFold={this.state.siderFold} onSwitchSider={this.handleSwitchSider} />
          <Content className={styles.content} style={{ margin: '0 16px' }}>
            <Bread menu={this.state.menus} location={this.props.location} />
            <Layout className={styles.page}>
              {this.props.children}
            </Layout>
          </Content>
          <Footer />
        </Layout>
      </Layout>
    );
  }
}
