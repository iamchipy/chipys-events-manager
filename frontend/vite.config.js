import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // here we are altering port to something we want and a proxy for backend easy of access
    port: 3000,
    proxy: {
      '/api':{
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
