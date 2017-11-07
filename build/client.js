/* eslint-disable */
require('eventsource-polyfill');
const hotClient = require('webpack-hot-middleware/client?http://localhost:5000&reload=true');

hotClient.subscribe(function (event) {
  if (event.action === 'reload') {
    window.location.reload()
  }
});
