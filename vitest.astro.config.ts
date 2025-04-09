import { getViteConfig } from 'astro/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default getViteConfig({
  plugins: [react()],
  test: {
    name: 'astro', // Name of this test configuration
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.*'],
    exclude: ['src/**/react/*.test.*'],
    coverage: {
      include: ['src/**/*.astro', 'src/**/*.ts', 'src/**/*.tsx'],
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
