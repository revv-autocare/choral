import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        id: '/',
        name: 'Choral',
        short_name: 'Choral',
        description: 'Song bank, rehearsals, attendance, and service-day tools for your choir.',
        theme_color: '#1B1740',
        background_color: '#1B1740',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icons/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Lyrics/song JSON comes from Supabase REST; cache it so flagged songs
        // and their lyrics are readable offline. Audio stems are cached on
        // demand from the song detail screen (see src/lib/offlineCache.ts).
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/rest/v1/songs'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'choral-songs-api' },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/storage/v1/object/sign'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'choral-audio',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ url }) => /\.(woff2?|ttf)$/.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'choral-fonts' },
          },
        ],
      },
    }),
  ],
});
