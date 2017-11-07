import React from 'react';
import PropTypes from 'prop-types';

const OperationLink = ({ options }) => {
  const [, ...children] = options.reduce((pre, next, index) => {
    const { key = index, text, action } = next;
    return [
      ...pre,
      <span key={`${key}-span`} className="ant-divider" />,
      <a key={`${key}-a`} onClick={action}>{text}</a>,
    ];
  }, []);

  return <span>{children}</span>;
};
OperationLink.defaultProps = {
  options: [],
};
OperationLink.propTypes = {
  options: PropTypes.array.isRequired,
};

export default OperationLink;
