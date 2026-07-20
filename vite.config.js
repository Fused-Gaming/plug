import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/plug/',
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
  },
})
