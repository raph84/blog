import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, describe } from 'vitest';
import Footer from './Footer.astro';
import pkg from '../../package.json';

describe('Footer', () => {
  test('Footer with semantic version', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Footer, {});

    expect(result).toEqual(expect.stringMatching(/v\d\.\d\.\d/));
  });
  test('Footer with version from package.json', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Footer, {});

    expect(result).toContain(pkg.version);
  });
});
