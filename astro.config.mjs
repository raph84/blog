// @ts-check
import { defineConfig /*envField*/ } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import AstroPWA from '@vite-pwa/astro';
import { loadEnv } from 'vite';
import process from 'node:process';

import tailwindcss from '@tailwindcss/vite';

const { SW_DEV } = loadEnv('env', process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  site: 'https://raphberube.com',

  // env: {
  //   schema: {
  //     ENV_VAR: envField.string({
  //       context: 'server',
  //       access: 'public',
  //       optional: true,
  //     }),
  //   },
  // },
  integrations: [
    mdx(),
    sitemap(),
    AstroPWA({
      registerType: 'prompt',
      strategies: 'injectManifest',
      // base: '/',
      srcDir: 'src',
      filename: 'sw.ts', // Service Worker
      injectManifest: {
        sourcemap: true,
        enableWorkboxModulesLogs: true,
      },
      manifest: {
        name: 'raphberube.com',
        short_name: 'raphberube.com',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
          {
            src: 'logo_512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'logo_192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
        screenshots: [
          {
            src: 'screenshot_mobile.png',
            sizes: '1290x2796',
            form_factor: 'narrow',
            label: 'Mobile view showing the home page',
          },
          {
            src: 'screenshot_desktop.png',
            sizes: '1068x919',
            form_factor: 'wide',
            label: 'Desktop view showing the home page',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: '/',
        globPatterns: ['**/*.{css,js,html,svg,png,ico,txt}'],
      },
      devOptions: {
        // enabled: true,
        enabled: SW_DEV === 'true',
        type: 'module',
        navigateFallbackAllowlist: [/^\//],
      },
      experimental: {
        directoryAndTrailingSlashHandler: true,
      },
      // ... other options
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
