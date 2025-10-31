// Flat ESLint config for Next.js 15
import next from 'eslint-config-next';

export default [
  ...next,
  {
    rules: {
      'react/jsx-boolean-value': ['error', 'always'],
      'react/jsx-no-useless-fragment': 'error',
      'react/jsx-no-leaked-render': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'import/order': ['error', { 'newlines-between': 'always' }],
      // Add more strict rules as needed
    },
  },
];
