const { defineConfig } = require('eslint-define-config');

module.exports = defineConfig({
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.eslint.json',
    ecmaVersion: 13,
    sourceType: 'module',
  },
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',

    '@typescript-eslint/no-use-before-define': ['error', {
      functions: false,
    }],

    'operator-linebreak': ['error', 'after'],
  },
});
