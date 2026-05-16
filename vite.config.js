import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isGhPages = process.env.DEPLOY_TARGET === 'gh-pages'

export default defineConfig({
  base: isGhPages ? '/2dbeamcalculator/' : '/',
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