import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    includeAssets: ['favicon.svg', 'icons/*.png'],
    manifest: {
      id: './', name: 'Offline Tasks — место для ваших планов', short_name: 'Offline Tasks',
      description: 'Задачи, которые всегда с вами. Работает без интернета.', lang: 'ru',
      start_url: './', scope: './', display: 'standalone',
      theme_color: '#304f3e', background_color: '#f6f5f0',
      icons: [
        { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: { globPatterns: ['**/*.{html,js,css,png,svg,woff,woff2}'], cleanupOutdatedCaches: true, navigateFallback: 'index.html' },
  })],
})
