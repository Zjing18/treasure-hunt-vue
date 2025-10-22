import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true
  },
  base: '/treasure-hunt-vue/', // 添加这一行，确保静态资源路径正确
  build: {
    outDir: 'dist', // 构建输出目录
    assetsDir: 'assets' // 静态资源目录
  }
})