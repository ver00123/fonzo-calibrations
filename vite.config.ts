import { defineConfig } from 'vite'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React and React-DOM into separate chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Split Supabase into separate chunk
          'supabase-vendor': ['@supabase/supabase-js'],
          // Split UI libraries
          'ui-vendor': ['lucide-react', 'react-hot-toast'],
          // Split charting library if you have one
          'chart-vendor': ['recharts'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
})
