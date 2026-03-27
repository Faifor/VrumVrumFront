import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:8000',
        // Browser page refreshes (Accept: text/html) must be served by SPA, not proxied.
        // Axios API calls send Accept: application/json — proxy those to FastAPI.
        bypass(req) {
          if (req.headers['accept']?.includes('text/html')) return '/index.html'
          return null
        },
      },
      '/users': {
        target: 'http://localhost:8000',
        bypass(req) {
          if (req.headers['accept']?.includes('text/html')) return '/index.html'
          return null
        },
      },
      '/admin': {
        target: 'http://localhost:8000',
        bypass(req) {
          if (req.headers['accept']?.includes('text/html')) return '/index.html'
          return null
        },
      },
      '/api': {
        target: 'http://localhost:8000',
        bypass(req) {
          if (req.headers['accept']?.includes('text/html')) return '/index.html'
          return null
        },
      },
      '/health': 'http://localhost:8000',
    },
  },
})
