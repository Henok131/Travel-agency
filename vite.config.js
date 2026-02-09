import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'

// Read the backend port written by the Express server (auto-fallback if 3001 busy)
const backendPortFile = path.resolve(process.cwd(), '.backend-port')
let backendPort = null
if (fs.existsSync(backendPortFile)) {
  backendPort = (fs.readFileSync(backendPortFile, 'utf8') || '').trim()
}

const apiTarget =
  process.env.VITE_API_PROXY_TARGET ||
  (backendPort ? `http://localhost:${backendPort}` : 'http://localhost:3001')

console.log(`[vite] proxy target -> ${apiTarget}`)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: Number(process.env.VITE_DEV_PORT || 5173),
    host: true, // Allow access from network (for mobile QR code scanning)
    strictPort: false,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
        // Keep the /api prefix so backend routes match 1:1
        rewrite: path => path
      }
    }
  }
})
