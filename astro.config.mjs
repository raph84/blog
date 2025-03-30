// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import AstroPWA from '@vite-pwa/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://raphberube.com',
  integrations: [
    mdx(),
    sitemap(),
    AstroPWA({
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
        navigateFallback: '/',
        globPatterns: ['**/*.{css,js,html,svg,png,ico,txt}'],
      },
      devOptions: {
        enabled: true,
        navigateFallbackAllowlist: [/^\//],
      },
      experimental: {
        directoryAndTrailingSlashHandler: true,
      },
      // ... other options
    }),
  ],
});
