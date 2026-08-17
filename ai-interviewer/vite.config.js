import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
    ),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
      process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || ''
    )
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/transcribe': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})