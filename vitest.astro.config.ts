import { getViteConfig } from 'astro/config';
import react from '@vitejs/plugin-react';

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
  },
});
