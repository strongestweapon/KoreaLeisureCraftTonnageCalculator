import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages subpath 서빙 (https://strongestweapon.github.io/KoreaLeisureCraftTonnageCalculator/)
export default defineConfig({
  base: '/KoreaLeisureCraftTonnageCalculator/',
  plugins: [react()],
})
