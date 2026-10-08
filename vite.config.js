import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Caminhos relativos ("./assets/...") em vez de absolutos ("/assets/...").
  // Necessário no GitHub Pages, onde o site fica numa subpasta:
  // https://usuario.github.io/nome-do-repositorio/
  base: './',
  // "define" troca um nome no código por um valor na hora do build.
  // Credits.jsx usa __BUILD_DATE__ para mostrar quando o site foi atualizado.
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
})
