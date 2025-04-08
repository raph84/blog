import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'react', // Name of this test configuration
    include: ['src/**/react/*.test.*'],
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'], // Re-use the same setup file
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
