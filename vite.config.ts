import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      // ✅ FIX 1: Use 'prompt' instead of 'autoUpdate'
      registerType: 'prompt',
      
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png', 'icons/*.png'],
      
      manifest: {
        name: 'P.commerce',
        short_name: 'P.commerce',
        description: 'Professional Inventory Management System',
        // ✅ FIX 2: Use 'minimal-ui' for better compatibility
        theme_color: '#f97316',
        background_color: '#ffffff',
        display: 'minimal-ui',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        lang: 'ar',
        dir: 'rtl',
        icons: [
          // ✅ FIX 3: Remove 'maskable' purpose
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
        // ✅ FIX 4: Remove problematic file types from globPatterns
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
          // ✅ FIX 5: Add Supabase caching for better performance
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              }
            }
          }
        ],
        
        // ✅ FIX 6: Disable workbox logging in production
        disableDevLogs: true
      },
      
      // ✅ FIX 7: Remove devOptions - NEVER use in production
      // devOptions: { ... } // <-- REMOVED COMPLETELY
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
    chunkSizeWarningLimit: 600,
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