import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://7869-89-236-218-10.ngrok-free.app', // URL для прокси
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // убираем префикс `/api` для совпадения с серверным маршрутом
      }
    }
  }
})
