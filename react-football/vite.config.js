import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/game_info': 'http://127.0.0.1:5000',
      '/start_round': 'http://127.0.0.1:5000',
      '/get_hint': 'http://127.0.0.1:5000',
      '/check_answer': 'http://127.0.0.1:5000',
    },
  },
})
