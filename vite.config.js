import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND = 'http://localhost:5000'

const proxyEntry = (target) => ({ target, changeOrigin: true })

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // If Flask is slow to start, Vite will retry proxy requests automatically
    proxy: {
      '/api':             proxyEntry(BACKEND),
      '/recognize':       proxyEntry(BACKEND),
      '/retrain':         proxyEntry(BACKEND),
      '/has-residents':   proxyEntry(BACKEND),
      '/intruders':       proxyEntry(BACKEND),
      '/intruder_images': proxyEntry(BACKEND),  // ← was missing, caused 404 on snapshots
      '/users':           proxyEntry(BACKEND),
      '/health':          proxyEntry(BACKEND),
      '/verify-otp':      proxyEntry(BACKEND),
      '/test-email':      proxyEntry(BACKEND),
      '/test-otp':        proxyEntry(BACKEND),
      '/api/access-log':  proxyEntry(BACKEND),
      '/api/access-stats':proxyEntry(BACKEND),
      '/api/door':        proxyEntry(BACKEND),
    }
  }
})
