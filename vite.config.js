import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-dom') || id.includes('react/')) {
            return 'vendor'
          }
          if (id.includes('docx')) {
            return 'docx'
          }
        }
      }
    }
  }
})