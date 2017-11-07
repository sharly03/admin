import React from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb } from 'antd';

export default class Navigator extends React.PureComponent {
  render() {
    const { path } = this.props;
    const bread = path.map((item) => (
      <Breadcrumb.Item key={`bc-${item.key}`}>{item.name}</Breadcrumb.Item>
    ));
    return (
      <Breadcrumb style={{ margin: '12px 0' }}>
        <Breadcrumb.Item key="bc-0">首页</Breadcrumb.Item>
        {bread}
      </Breadcrumb>
    );
  }
}

Navigator.defaultProps = {
  path: [],
};

Navigator.propTypes = {
  path: PropTypes.array,
};
