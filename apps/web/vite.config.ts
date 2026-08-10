import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages demo uses BASE_PATH=/trade-union-test-online/ (or repo name).
// Production hosting serves from domain root.
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Trade Union Learning',
        short_name: 'Trade Union',
        description: 'Учебная платформа курса «Младшая медсестра по уходу за больными»',
        theme_color: '#155eef',
        background_color: '#f6f8fc',
        display: 'standalone',
        lang: 'ru',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Cache shell + previously opened static assets only. Auth/API stay network-first.
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
    {
      name: 'force-exit-after-build',
      enforce: 'post',
      closeBundle() {
        // vite-plugin-pwa / Rolldown can keep the Node process alive after build.
        setTimeout(() => process.exit(0), 0)
      },
    },
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
