import React from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb, Icon } from 'antd';
import pathToRegexp from 'path-to-regexp';
import { Link } from 'react-router';
import styles from './layout.less';
import { queryArray } from '../../utils';


export default class Bread extends React.PureComponent {
  render() {
    const { menu, location } = this.props;

    // 匹配当前路由
    let pathArray = [];

    let current = menu.find(item => item.router && pathToRegexp(item.router).exec(location.pathname));

    const getPathArray = (item) => {
      pathArray.unshift(item);
      if (item.bpid) {
        getPathArray(queryArray(menu, item.bpid, 'id'));
      }
    };

    if (!current) {
      pathArray.push({
        id: 404,
        name: 'Not Found',
      });
    } else {
      getPathArray(current);
    }

    // 递归查找父级
    const breads = pathArray.map((item, key) => {
      const content = (
        <span>{item.icon
          ? <Icon type={item.icon} style={{ marginRight: 4 }} />
          : ''}{item.name}</span>
      );
      return (
        <Breadcrumb.Item key={key}>
          {((pathArray.length - 1) !== key)
            ? <Link to={item.router}>
              {content}
            </Link>
            : content}
        </Breadcrumb.Item>
      );
    });

    return (
      <div className={styles.bread}>
        <Breadcrumb>
          {breads}
        </Breadcrumb>
      </div>
    );
  }
}

Bread.propTypes = {
  menu: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,
};
