/// @ts-check
// ========================================
// VERCEL CONFIGURATION (BACKUP)
// ========================================
// This is the original Vercel configuration
// Keep this file for potential rollback to Vercel

import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel({
    functionPerRoute: false,
  }),
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['react-leaflet', 'react-hot-toast', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities', 'leaflet'],
      external: ['react', 'react-dom']
    },
    resolve: {
      conditions: ['browser', 'module', 'import']
    }
  }
});
