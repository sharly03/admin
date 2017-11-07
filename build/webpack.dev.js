const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const autoprefixer = require('autoprefixer');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');

const utils = require('./utils');
const baseWebpackConfig = require('./webpack.base');
process.traceDeprecation = true;  // 显示报错的具体模块来源
process.env.NODE_ENV = 'development';
process.env.PUBLISH_ENV = 'development';


const devEntry = [
  'react-hot-loader/patch', // hmr
  './build/client', // reload
  // 'webpack-dev-server/client?http://localhost:3000',
  // 'webpack/hot/only-dev-server',
];

Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = devEntry.concat(baseWebpackConfig.entry[name])
});

module.exports = merge(baseWebpackConfig, {
  output: {
    path: path.resolve('dist'),
    filename: 'static/js/[name].js',// 这里别加什么时间戳，否则会触发html模板发生变化，而html变化浏览器会刷新
    chunkFilename: 'static/js/[id].js',
    publicPath: '/'     // 静态文件目录直接设根路径
  },
  module: {
    rules: utils.styleLoaders().concat([{
      test: /\.js$/,
      enforce: 'pre',
      exclude: /node_modules/,
      loader: 'eslint-loader'
    }]),
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),

    new webpack.NamedModulesPlugin(),    // prints more readable module names in the browser console on HMR updates

    new webpack.NoEmitOnErrorsPlugin(),

    new webpack.DllReferencePlugin({
      context: path.resolve(__dirname, '..'),
      manifest: require('../dll/vendor-manifest.json')
    }),
    new AddAssetHtmlPlugin({
      filepath: path.resolve(__dirname,'../dll/*.dll.js'),
    }),
  ],
});


