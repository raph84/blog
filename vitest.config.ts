/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';
import react from '@vitejs/plugin-react';

export default getViteConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.*'],
    coverage: {
      include: ['src/**/*.astro', 'src/**/*.ts', 'src/**/*.tsx'],
      provider: 'v8',
    },
    environmentOptions: {
      jsdom: {
        // Add any JSDOM-specific options here
      },
    },
  },
});
