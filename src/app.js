import React from 'react';
import { Router, browserHistory } from 'react-router';

import routes from './routes';
import './utils/promise-polyfill';
import './styles/global.less';
import './styles/theme.less';

console.log('PUBLISH_ENV: ', process.env.PUBLISH_ENV);
// 只在本地开发和测试环境引入 mock
if (process.env.PUBLISH_ENV !== 'production') {
  /* eslint-disable global-require */
  require('./dao/mock');
}

export default () => {
  let history = browserHistory;
  // if (module.hot) {
  //   let oldHistory = module.hot.data && module.hot.data.history;
  //   if (oldHistory) {
  //     history = oldHistory
  //   }
  //   module.hot.dispose(function(data){
  //     data.history = history
  //   })
  // }

  return (
    <div>
      <Router history={history} routes={routes} />
    </div>
  );
};
