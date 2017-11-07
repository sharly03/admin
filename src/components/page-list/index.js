import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';

/**
 * 页面列表组件，修改了antd的默认分页样式，
 * API与Table组件保持一致
 * @returns {XML}
 * @constructor
 */
export const PageList = ({ pagination, ...otherProps }) => {
  const { onChange } = pagination;

  const props = {
    ...otherProps,
    pagination: {
      defaultPageSize: 20,
      defaultCurrent: 1,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      showTotal: (total) => {
        return <div>共 {total} 条数据</div>;
      },
      ...pagination,
      onShowSizeChange: onChange,
    },
  };

  return (
    <div>
      <Table {...props} />
    </div>
  );
};

PageList.propTypes = {
  pagination: PropTypes.shape({
    current: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
  }).isRequired,
};
