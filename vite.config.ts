import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    legacy({
      targets: [
        'defaults',
        'not IE 11',
        'android >= 5',
        'chrome >= 53',
        'safari >= 12'
      ],
      additionalLegacyPolyfills: [
        'regenerator-runtime/runtime',
        'core-js/stable'
      ],
      renderLegacyChunks: true,
      polyfills: [
        'es.symbol',
        'es.promise',
        'es.object.assign',
        'es.object.entries',
        'es.object.values',
        'es.array.includes',
        'es.array.find',
        'es.array.find-index',
        'es.array.from',
        'es.array.iterator',
        'es.string.includes',
        'es.string.starts-with',
        'es.string.ends-with',
        'es.string.pad-start',
        'es.string.pad-end'
      ],
      modernPolyfills: true
    }),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'P.commerce',
        short_name: 'P.commerce',
        description: 'Professional Inventory Management System',
        theme_color: '#f97316',
        background_color: '#ffffff',
        display: 'minimal-ui',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        lang: 'ar',
        dir: 'rtl',
        icons: [
          { src: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5
              }
            }
          }
        ],
        disableDevLogs: true
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  optimizeDeps: {
    include: ['vue-i18n'],
  },
  build: {
    target: 'es2015',
    modulePreload: false,
    chunkSizeWarningLimit: 600,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('exceljs') || id.includes('xlsx')) {
              return 'vendor-excel';
            }
            if (id.includes('@supabase') || id.includes('supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vendor-vue';
            }
            if (id.includes('@vueuse') || id.includes('date-fns')) {
              return 'vendor-ui';
            }
            return 'vendor';
          }
        },
      },
    },
  },
})