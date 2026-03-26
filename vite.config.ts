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
      '/auth': 'http://localhost:8000',
      '/users': 'http://localhost:8000',
      '/admin': {
        target: 'http://localhost:8000',
        // Browser page refreshes send Accept: text/html — serve SPA instead of proxying to backend.
        // Axios API calls always carry Authorization header — proxy those to FastAPI.
        bypass(req) {
          const accept = req.headers['accept'] ?? ''
          const hasAuth = !!req.headers['authorization']
          if (accept.includes('text/html') && !hasAuth) return '/index.html'
          return null
        },
      },
      '/api': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
})
