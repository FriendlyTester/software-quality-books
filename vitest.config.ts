import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true
  },
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.{ts,tsx}']
        }
      },
      {
        extends: true,
        test: {
          name: 'components',
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
          include: ['tests/components/*.test.{ts,tsx}']
        }
      },
      {
        extends: true,
        test: {
          name: 'pact',
          environment: 'node',
          include: ['tests/pact/*.pact.spec.{ts,tsx}']
        }
      }
    ]
  }
})
