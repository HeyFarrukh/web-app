import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind()],
  outDir: './astro-dist',
  publicDir: './public',
  // Set the base path for Astro routes
  base: '/resources',
  // Configure build settings
  build: {
    // Ensure Astro doesn't conflict with Next.js build
    format: 'file',
    assets: '_astro'
  }
});
