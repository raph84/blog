// src/components/FirebaseAuth.integration.test.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, describe } from 'vitest';
import FirebaseAuth from './FirebaseAuth.astro';

// Create a more focused integration test for static rendering
describe('FirebaseAuth Component Integration', () => {
  test('component renders correctly with firebase integration', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(FirebaseAuth);

    // Verify that the component renders with expected elements
    expect(result).toContain('id="sign-in-button"');
    expect(result).toContain('id="user"');
    expect(result).toContain('type="module"'); // Script is loaded as a module
  });

  test('structure contains proper authentication elements', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(FirebaseAuth);

    // Verify login and user sections exist
    expect(result).toContain('id="login"');
    expect(result).toContain('id="user"');

    // Verify proper accessibility attributes
    expect(result).toContain('aria-label="Sign in"');
    expect(result).toContain('aria-label="User profile"');

    // Verify initial state (not authenticated)
    expect(result).toContain('id="user" class="hidden"');
    expect(result).toContain('id="login" class="block"');
  });

  test('includes script tag for client-side functionality', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(FirebaseAuth);

    // Verify script tag is present for client-side functionality
    expect(result).toContain('<script');

    // The script is loaded as a module with a proper src
    expect(result).toMatch(/<script[^>]*type="module"[^>]*>/);
  });
});
