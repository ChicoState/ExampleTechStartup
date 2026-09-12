import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      exclude: ['tests/**', 'scripts/**', '**/*.config.*'],
      thresholds: {
        lines: 70,
        functions: 70
      }
    }
  }
});
