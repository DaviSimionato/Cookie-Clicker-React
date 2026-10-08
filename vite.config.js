import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Caminhos relativos ("./assets/...") em vez de absolutos ("/assets/...").
  // Necessário no GitHub Pages, onde o site fica numa subpasta:
  // https://usuario.github.io/nome-do-repositorio/
  base: './',
})
