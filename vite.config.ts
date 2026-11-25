import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Relative base so the built dist/ folder works from any path when it is hosted later.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // registered in src/main.tsx
      includeAssets: ['favicon.svg', 'favicon-32.png', 'icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Shopping list',
        short_name: 'Shopping',
        description: 'A shopping list that sorts products into shop aisles.',
        lang: 'en',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#161616',
        background_color: '#161616',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: 'index.html'
      }
    })
  ]
});
