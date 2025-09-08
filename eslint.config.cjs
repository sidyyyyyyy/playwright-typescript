/**
 * @fileoverview ESLint Configuration - TypeScript linting rules and patterns
 * @description Configures ESLint for TypeScript projects with recommended rules and type-aware linting
 * @author Anand Sogalad
 */

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
    '@typescript-eslint/consistent-type-exports': ['warn'],
    'no-console': 'off',
  },
  ignorePatterns: ['dist/', 'node_modules/'],
};
