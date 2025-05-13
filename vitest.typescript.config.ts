import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [],
  test: {
    name: 'typescript', // Name of this test configuration
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts'],
    exclude: ['src/**/react/*.test.ts', 'src/**/*.astro.test.ts'],
    coverage: {
      include: ['src/**/*.ts'],
      provider: 'v8',
    },
    mockReset: true, // Reset mocks between each test
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
