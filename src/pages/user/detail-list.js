import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import EditForm from '../../components/edit-form';

import styles from './detail.less';

const DetailList = ({ title, lists, dataSource }) => {
  const getLists = lists.map((list, index) => {
    const { key, render, ...remindProps } = list;
    const value = render && render instanceof Function ? render(dataSource[key], list, index) : dataSource[key];
    return (
      <Col span={8} key={key}>
        <EditForm {...remindProps} value={value} />
      </Col>
    );
  });

  return (
    <Row style={{ margin: '8px' }} gutter={24}>
      {title && <Col className={styles.title} span={24}>{title}</Col>}
      {getLists}
    </Row>
  );
};

DetailList.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  lists: PropTypes.array.isRequired,
  dataSource: PropTypes.object,
};
DetailList.defaultProps = {
  title: null,
  dataSource: {},
};

export default DetailList;
