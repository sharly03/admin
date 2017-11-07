import React from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';
import styles from './layout.less';

const { Footer } = Layout;

export default class CommonFooter extends React.Component {
  static propTypes = {
    className: PropTypes.string,
  };
  static defaultProps = {
    className: '',
  }

  thisYear = new Date().getFullYear();

  render() {
    return (
      <Footer className={`${styles.footer} ${this.props.className}`}>
         薪乐宝 版权所有 © 2015-{this.thisYear}
      </Footer>
    );
  }
}
