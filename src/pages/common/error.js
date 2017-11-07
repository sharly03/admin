import React from 'react';
import styles from './error.less';

export const NotFound = () => {
  return (
    <div className={styles.error}>
      <span>
        Opps, 你所访问的页面没有被找到..
      </span>
    </div>
  );
};

