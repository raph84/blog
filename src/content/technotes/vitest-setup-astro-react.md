---
title: Vitest Workspace Configuration
description: Implementation of Vitest workspace to test both Astro and React components with a single configuration
pubDate: '2025-04-07'
author: Raph
---

# Vitest Workspace Configuration

## Problem Statement

The codebase contains both Astro and React components, requiring different testing environments:

| Component Type | Testing Requirements |
|----------------|---------------------|
| Astro          | Astro's test utilities |
| React          | jsdom environment, React Testing Library |

Previously maintained two separate Vitest configs - inefficient and required running multiple test commands.

## Solution: Vitest Workspaces

Implemented Vitest's workspace feature to combine configurations while maintaining specialized testing environments.

### Key Files

1. **`vitest.workspace.ts`** - Entry point for all tests

```typescript
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'vitest.astro.config.ts',
  'vitest.react.config.ts',
]);
```

2. **`vitest.astro.config.ts`** - Astro-specific configuration

```typescript
import { getViteConfig } from 'astro/config';
import react from '@vitejs/plugin-react';

export default getViteConfig({
  plugins: [react()],
  test: {
    name: 'astro',
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
```

3. **`vitest.react.config.ts`** - React-specific configuration

```typescript
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
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

> **NOTE**: Original `vitest.config.ts` has been removed as it's no longer needed.

## Usage Instructions

### Available Commands

```bash
# Run all tests
pnpm test

# Run only Astro tests
pnpm test:astro

# Run only React tests
pnpm test:react

# Run all tests with coverage
pnpm coverage
```

### Package.json Configuration

```json
{
  "scripts": {
    "test": "vitest",
    "test:astro": "vitest --workspace=astro",
    "test:react": "vitest --workspace=react",
    "coverage": "vitest run --coverage"
  }
}
```

## File Organization

```
src/
├── components/
│   └── *.test.ts     # Astro component tests
└── react/
    └── *.test.tsx    # React component tests
```

## Benefits

- ✅ Single command to run all tests
- ✅ Environment-specific configurations
- ✅ Unified test reporting
- ✅ Reduced configuration duplication
- ✅ Simplified CI/CD pipeline
- ✅ Clear separation of test types

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests not running in correct environment | Check file path matches the include patterns |
| React tests failing with DOM errors | Ensure the test file is in a path matched by React config |
| Coverage report incomplete | Check the include patterns in coverage configuration |

## Usage Examples

### Testing an Astro Component

```typescript
// src/components/Header.test.ts
import { expect, test, describe } from 'vitest';
import { AstroContainer } from 'astro/container';
import Header from './Header.astro';

describe('Header', () => {
  test('renders correctly', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Header, {});
    expect(result).toContain('Site Title');
  });
});
```

### Testing a React Component

```typescript
// src/react/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click Me');
  });
});
```

> **TIP**: When adding new test files, ensure they follow the path patterns defined in the configuration files to be picked up by the correct workspace.
