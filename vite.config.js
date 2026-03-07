import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'

const backendPortFile = path.resolve(process.cwd(), '.backend-port')

// Helper: read the backend port at call-time (not just at startup)
const getBackendTarget = () => {
  if (process.env.VITE_API_PROXY_TARGET) return process.env.VITE_API_PROXY_TARGET
  try {
    const port = fs.readFileSync(backendPortFile, 'utf8').trim()
    if (port) return `http://localhost:${port}`
  } catch { /* file not written yet */ }
  return 'http://localhost:3001'
}

// Log once at startup for debugging
console.log(`[vite] initial proxy target -> ${getBackendTarget()}`)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: Number(process.env.VITE_DEV_PORT || 5173),
    host: true,
    strictPort: false,
    proxy: {
      '/api': {
        // Dynamic target: re-reads .backend-port on every request
        // so even if Express restarts on a new port, the proxy still works
        target: 'http://localhost:3001', // default fallback
        changeOrigin: true,
        secure: false,
        router: () => getBackendTarget(),
        rewrite: path => path
      }
    }
  }
})
