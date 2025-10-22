import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true
  },
  base: process.env.NODE_ENV === 'production' ? '/treasure-hunt-vue/' : '/',
  build: {
    outDir: 'dist'
  }
})