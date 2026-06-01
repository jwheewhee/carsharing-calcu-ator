import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// SEO를 위한 Vite 설정
export default defineConfig({
  plugins: [
    react(),
  ],
  // 빌드 최적화
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        }
      }
    }
  }
})
