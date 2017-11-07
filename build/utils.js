const path = require('path');
const fs  = require('fs');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const lessToJs = require('less-vars-to-js');
const themeVariables = lessToJs(fs.readFileSync(path.resolve('./src/styles/theme.less'), 'utf8'));

console.log('themeVariables', themeVariables);
// __dirname是指当前这个问题所在的目录，而不是根目录位置
// ./ 是指node server运行根路劲，要不就是项目根路劲？？待验证
exports.resolve = function(dir) {
  return path.join(__dirname, '..', dir);
};

exports.styleLoaders = function (options={}) {
  let output = ['css', 'less', 'scss', 'stylus'].reduce((arr, extension) => {
    return arr.concat(generateStyleLoader(options, extension));
  },[]);
  return output;
};

function generateStyleLoader(options, extension) {
  return [
    {
      test: new RegExp('\\.' + extension + '$'),
      include: path.resolve('src'),
      use: composeLoaders(Object.assign({module: true}, options), extension),
    },
    {
      test: new RegExp('\\.' + extension + '$'),
      exclude: path.resolve('src'),
      use: composeLoaders(Object.assign({module: false}, options), extension),
    },
  ]
}


function generateCssLoader(options) {
  const loader = {
    loader: 'css-loader',
    options: {
      minimize: options.minimize,
      sourceMap: options.sourceMap,
    }
  };
  if (options.module) {
    Object.assign(loader.options, {
      modules: true,
      localIdentName: '[name]-[local]-[hash:base64:5]',
    });
  }
  return loader;
}

function generatePostcssLoader() {
  return {
    loader: 'postcss-loader',
    options: {
      plugins: () => [
        autoprefixer({
          browsers: [
            '>1%',
            'last 4 versions',
            'Firefox ESR',
            'not ie < 9', // React doesn't support IE8 anyway
          ],
          cascade: false
        }),
      ]
    }
  };
}

function composeLoaders(options, preCss) {
  const loaders = [
    generateCssLoader(options),
    generatePostcssLoader(),
  ];

  if (preCss != 'css') {
    if (preCss === 'scss') {
      preCss = 'sass';
    }
    loaders.push({
      loader: preCss + '-loader',
      options: {
        modifyVars: themeVariables
      }
    });
  }

  if (options.extract) {
    return ExtractTextPlugin.extract({
      use: loaders,
      fallback: 'style-loader',
    })
  } else {
    return ['style-loader'].concat(loaders);
  }
}
