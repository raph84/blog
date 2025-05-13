import { defineWorkspace } from 'vitest/config';

// The workspace configuration file must export the defineWorkspace function
export default defineWorkspace([
  // Config for Astro components
  'vitest.astro.config.ts',

  // Config for React components
  'vitest.react.config.ts',

  // Config for TypeScript components
  'vitest.typescript.config.ts',
]);
