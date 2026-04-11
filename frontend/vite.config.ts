import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import * as path from "node:path";

export default defineConfig({
  plugins: [
      react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // Автоматически обновляет service worker
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Moola',
        description: 'Управление личными финансами',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-256x256.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
