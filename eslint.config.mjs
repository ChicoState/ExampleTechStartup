import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      // Product entrypoints are intentionally deferred; enable this once pages exist.
      '@next/next/no-html-link-for-pages': 'off'
    }
  },
  globalIgnores([
    '.next/**',
    'coverage/**',
    'node_modules/**',
    'playwright-report/**',
    'test-results/**'
  ])
]);
