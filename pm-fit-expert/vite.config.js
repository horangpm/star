import { defineConfig } from 'vite'

export default defineConfig({
  base: '/healthsaju/', // 저장소 이름인 healthsaju를 경로로 지정하여 404 에러 방지
  build: {
    outDir: 'dist',
  }
})
