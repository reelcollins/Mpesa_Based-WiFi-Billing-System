import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Ensure sourcemaps are generated for better debugging
    sourcemap: true,
  },
  // Make sure server correctly sets up for production
  server: {
    port: process.env.PORT || 5173,
    host: true
  }
})
