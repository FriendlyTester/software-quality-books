// Flat ESLint config for Next.js 15
import tseslint from '@typescript-eslint/eslint-plugin'
import next from 'eslint-config-next'

const config = [
  {
    ignores: [
      'coverage/**',
      'playwright-report/**',
      'test-results/**'
    ],
  },
  ...next,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'react/jsx-boolean-value': ['error', 'always'],
      'react/jsx-no-useless-fragment': 'error',
      'react/jsx-no-leaked-render': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'import/order': ['error', { 'newlines-between': 'always' }],
    },
  },
  {
    files: ['tests/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      'react/jsx-no-leaked-render': 'off',
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
]

export default config
