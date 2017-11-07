import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Menu } from 'antd';
import { redirect } from '../../utils/location-helper';
import { AUTH_TOKEN_KEY, USER_INFO_KEY } from '../../utils/constants';

import styles from './layout.less';

const { SubMenu } = Menu;

export default class CommonHeader extends React.Component {
  static propTypes = {
    onSwitchSider: PropTypes.func.isRequired,
    siderFold: PropTypes.bool,
    profile: PropTypes.object.isRequired,
  };

  static defaultProps = {
    siderFold: '',
  }

  handleLogOut = () => {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(USER_INFO_KEY);
    redirect('/login', true);
  };

  render() {
    const { profile, siderFold } = this.props;
    const username = profile ? profile.name : '';
    return (
      <div className={styles.header}>
        <div className={styles.button} onClick={this.props.onSwitchSider.bind(this, siderFold)}>
          <Icon type={siderFold ? 'menu-fold' : 'menu-unfold'} />
        </div>
        <div className={styles.rightWarpper}>
          <Menu mode="horizontal" onClick={this.handleLogOut}>
            <SubMenu style={{ float: 'right' }} title={<span > <Icon type="user" /> {username} </span>}>
              <Menu.Item key="logout">
                退出
              </Menu.Item>
            </SubMenu>
          </Menu>
        </div>
      </div>
    );
  }
}
