var path = require('path');
var webpack = require('webpack');
var express = require('express');
var proxy = require('http-proxy-middleware');
var args = require('minimist')(process.argv.slice(2));
var session = require('express-session');
var bodyParser = require('body-parser');

var config = require('./webpack.dev.js');
var opn = require('opn');
// console.log(config.plugins);
var app = express();
// proxy middleware options
var options = {
  target: 'https://api.douban.com', // target host
  changeOrigin: true,               // needed for virtual hosted sites
  // ws: true,                         // proxy websockets
  pathRewrite: {
    // '^/api/old-path' : '/api/new-path',     // rewrite path
    // '^/api/remove/path' : '/path',           // remove base path
    '^/api' : '/v2'
  },
  // router: {
  //   // when request.headers.host == 'dev.localhost:3000',
  //   // override target 'http://www.example.org' to 'http://localhost:8000'
  //   'dev.localhost:3000' : 'http://localhost:8000'
  // }
};
var port = 5500; // 服务端口号

// app.use('/action/*', proxy('/action', {target: 'https://sandbox.api.ones.ai/v1/'}));
// app.use('/api', proxy(options));
app.use( proxy('/admin/', {target: 'http://ow.xinlebao.com', changeOrigin: true}));
app.use( proxy('/api/', {target: 'http://192.168.3.217:8087', pathRewrite: {'^/api': '/'},  changeOrigin: true}));
// app.use( proxy('/json', {target: 'http://jsonplaceholder.typicode.com',   pathRewrite: {'^/json': '/'}, changeOrigin: true}));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


//
app.use(require('connect-history-api-fallback')());

if (args.env && args.env === 'dist') {
  // 第一个参数是浏览器访问链接或资源的配置的url， 第二参数则是配置这个链接对应具体的目录
  app.use('/static', express.static('./dist/static'));
  app.use('/', express.static('./dist'));

} else {
  var compiler = webpack(config);
  var devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: config.output.publicPath,
    watchOptions: {
      ignored: /node_modules/,
    },
    stats: {
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }
  });
  var hotMiddleware = require('webpack-hot-middleware')(compiler, {
    path: '/__webpack_hmr',
  });


  // force page reload when html-webpack-plugin template changes
  compiler.plugin('compilation', function (compilation) {
    compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
      hotMiddleware.publish({ action: 'refresh' });
      cb()
    })
  });
  app.use(devMiddleware);
  app.use(hotMiddleware);
  app.use('/static', express.static('./static'));
  devMiddleware.waitUntilValid(() => {
    var url = 'http://localhost:' + port;
    console.log('> Listening at ' + url + '\n');
    // when env is testing, don't need open it
    if (process.env.NODE_ENV !== 'testing') {
      opn(url);
    }
  });
}

console.log('> Starting dev server... \n');

app.listen(port, function(err) {
  if (err) {
    return console.error(err);
  }
});
