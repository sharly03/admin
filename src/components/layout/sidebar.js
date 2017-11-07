import React from 'react';
import PropTypes from 'prop-types';
import { Layout, Menu, Icon } from 'antd';
import { Link } from 'react-router';
import pathToRegexp from 'path-to-regexp';

import { arrayToTree, queryArray } from '../../utils';
import styles from './layout.less';
import logo from '../../images/logo.png';

const { Sider } = Layout;
const { SubMenu } = Menu;


export default class Sidebar extends React.Component {
  static contextTypes = {
    location: PropTypes.object,
  };

  static propTypes = {
    menu: PropTypes.array.isRequired,
    siderFold: PropTypes.bool.isRequired,
    onSwitchSider: PropTypes.func.isRequired,
  };

  static defaultProps = {
    navOpenKeys: {},
  }

  state ={
    menuTree: arrayToTree(this.props.menu.filter(_ => _.mpid !== -1), 'id', 'mpid'),
  };

  levelMap = {};

  getMenus = (menuTreeN = [], siderFoldN) => {
    return menuTreeN.map(item => {
      if (item.children) {
        if (item.mpid) {
          this.levelMap[item.id] = item.mpid;
        }
        return (
          <SubMenu
            key={item.id}
            title={<span>
              {item.icon && <Icon type={item.icon} />}
              <span>{(!siderFoldN || this.state.menuTree.indexOf(item) < 0) && item.name}</span>
            </span>}
          >
            {this.getMenus(item.children, siderFoldN)}
          </SubMenu>
        );
      }
      return (
        <Menu.Item key={item.id}>
          <Link to={item.router}>
            {item.icon && <Icon type={item.icon} />}
            <span>{item.name}</span>
          </Link>
        </Menu.Item>
      );
    });
  };

  // 保持选中
  getAncestorKeys = (key) => {
    let map = {};
    const getParent = (index) => {
      const result = [String(this.levelMap[index])];
      if (this.levelMap[result[0]]) {
        result.unshift(getParent(result[0])[0]);
      }
      return result;
    };
    for (let index in this.levelMap) {
      if ({}.hasOwnProperty.call(this.levelMap, index)) {
        map[index] = getParent(index);
      }
    }
    return map[key] || [];
  };

  // onOpenChange = (openKeys) => {
  //   const latestOpenKey = openKeys.find(key => !(this.props.navOpenKeys.indexOf(key) > -1));
  //   const latestCloseKey = this.props.navOpenKeys.find(key => !(openKeys.indexOf(key) > -1));
  //   let nextOpenKeys = [];
  //   if (latestOpenKey) {
  //     nextOpenKeys = this.getAncestorKeys(latestOpenKey).concat(latestOpenKey);
  //   }
  //   if (latestCloseKey) {
  //     nextOpenKeys = this.getAncestorKeys(latestCloseKey);
  //   }
  //   this.props.changeOpenKeys(nextOpenKeys);
  // }


  render() {
    // 寻找选中路由
    let currentMenu;
    let defaultSelectedKeys;

    const collapsed = !this.props.siderFold;
    const mode = collapsed ? 'vertical' : 'inline';

    for (const item of this.props.menu) {
      if (item.router && pathToRegexp(item.router).exec(location.pathname)) {
        currentMenu = item;
        break;
      }
    }
    const getPathArray = (array, current, pid, id) => {
      const result = [String(current[id])];
      const getPath = (item) => {
        if (item && item[pid]) {
          result.unshift(String(item[pid]));
          getPath(queryArray(array, item[pid], id));
        }
      };
      getPath(current);
      return result;
    };

    if (currentMenu) {
      defaultSelectedKeys = getPathArray(this.props.menu, currentMenu, 'mpid', 'id');
    }

    return (
      <Sider
        width={220}
        collapsible
        collapsed={collapsed}
        trigger={null}
        onCollapse={this.props.onSwitchSider}
      >
        <div className={styles.logo}>
          <img alt="logo" src={logo} />
          {collapsed ? '' : <span>薪乐宝运营管理平台</span>}
        </div>
        <Menu theme="dark" mode={mode} defaultOpenKeys={defaultSelectedKeys} selectedKeys={defaultSelectedKeys}>
          {this.getMenus(this.state.menuTree, collapsed)}
        </Menu>
      </Sider>
    );
  }
}
