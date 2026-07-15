import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Alias @ a la carpeta src (convención heredada del maquetado de Figma).
      '@': path.resolve(__dirname, './src'),
    },
  },
})
