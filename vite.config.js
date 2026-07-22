import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Viteの設定 - Reactプラグインを使用
export default defineConfig({
  plugins: [react()],
})
