import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { apiMiddleware } from './vite.middleware.js'

export default defineConfig({
  plugins: [react()],
  base: '/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'ES2020',
    rollupOptions: {
      output: {
        manualChunks: {
          maplibre: ['maplibre-gl'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    configureServer(server) {
      return () => {
        server.middlewares.use(apiMiddleware)
      }
    },
  },
})
