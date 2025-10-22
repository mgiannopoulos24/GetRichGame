import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      '/api/v1/ws': {
        target: 'http://localhost:8000', 
        ws: true,
        changeOrigin: true,
      },
      '/api/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    }
  }
})