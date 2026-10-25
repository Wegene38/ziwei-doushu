import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 部署在子路径 /ziwei-doushu/ 下;CI 环境自动启用,本地开发不受影响
  base: process.env.CI ? '/ziwei-doushu/' : '/',
  plugins: [react()],
})
