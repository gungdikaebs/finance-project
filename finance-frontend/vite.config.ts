import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['nalara-favicon.png', 'nalara-app-icon.svg', 'nalara-apple-touch-icon.png', 'nalara-app-icon-192.png', 'nalara-app-icon-512.png'],
      manifest: {
        name: 'Nalara Keuangan Pribadi',
        short_name: 'Nalara',
        description: 'Kelola keuangan pribadi: catat transaksi, pantau anggaran, dan wujudkan target impian.',
        theme_color: '#0B192C',
        background_color: '#F8FAFC',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'nalara-app-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'nalara-app-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'nalara-maskable-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
              },
            },
          },
        ],
      },
    }),
  ],
});
