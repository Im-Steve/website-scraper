module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-await-in-loop': 'off',
    'no-console': 'off',
    'no-irregular-whitespace': 'off',
    'no-param-reassign': 'off',
    'no-restricted-syntax': 'off',
  },
};
