/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['src/**/*.test.*'],
    coverage: {
      include: ['src/**/*.astro', 'src/**/*.ts', 'src/**/*.tsx'],
      provider: 'v8',
    },
  },
});
