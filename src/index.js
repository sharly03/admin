import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './app';

/* eslint-disable react/no-render-return-value */
const renderApp = (Component) => ReactDOM.render(
  <AppContainer>
    <Component />
  </AppContainer>
  , document.getElementById('root'));

renderApp(App);

if (module.hot) {
  module.hot.accept('./app', () => {
    /* eslint-disable global-require */
    const nextApp = require('./app').default;
    renderApp(nextApp);
  });
}
