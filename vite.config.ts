import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub 저장소 이름이 'classroom-arcade'인 경우 아래 설정이 맞습니다.
  base: "/classroom-arcade/",
})