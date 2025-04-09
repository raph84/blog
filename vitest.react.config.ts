import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'react',
    include: ['src/**/react/*.test.tsx'],
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    mockReset: true, // Reset mocks between each test
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
