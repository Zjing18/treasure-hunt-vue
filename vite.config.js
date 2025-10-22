import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true
  },
  base: '/',  // 改为根路径
  build: {
    outDir: 'dist'
  }
})