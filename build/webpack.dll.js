const path = require('path');
const webpack = require('webpack');

const packageJson = require('../package.json');

const dependencies = Object.keys(packageJson.dependencies || {});
console.log('dependencies building...');

module.exports = {
  entry: {
    vendor: dependencies
  },
  devtool: '#source-map',
  output: {
    path: path.resolve('dll'),
    filename: '[name].dll.js',
    library: '[name]_library'
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join('dll', '[name]-manifest.json'),
      name: '[name]_library'
    })
  ]
};
