module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
    "ecmaVersion": 8,
    "ecmaFeatures": {
      "jsx": true,
      "experimentalObjectRestSpread": true
    }
  },
  env: {
    browser: true,
  },
  'extends': 'airbnb',
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,

    // allow async-await
    'generator-star-spacing': 0,

    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    "arrow-body-style": 0,
    'no-param-reassign': 0,
    // 'no-unused-vars': 1,
    'no-mixed-operators': 0,
    'no-plusplus': 0,
    'no-console': 0,
    'no-extend-native': 0,
    'no-restricted-syntax': 0,
    'no-unused-expressions': [0, {
      'allowShortCircuit': true,
      'allowTernary': true,
    }],
    "no-underscore-dangle": 0,
    'consistent-return': 0,
    "prefer-const": 0,
    'max-len': 0,
    'import/prefer-default-export': 0,
    'camelcase': 0,
    'comma-dangle': [2, 'always-multiline'],
    'func-names': 0,
    'import/no-mutable-exports':0,

    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/href-no-hash': 0,

    'react/jsx-first-prop-new-line': 0,
    'react/sort-comp': 0,
    'react/jsx-no-bind': 0,
    'react/jsx-filename-extension': 0,
    'react/forbid-prop-types': 0,
    'react/no-array-index-key': 0,
  },
}
