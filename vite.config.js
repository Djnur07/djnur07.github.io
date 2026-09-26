import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        mochi: resolve(import.meta.dirname, 'mochi/index.html'),
        legendary: resolve(import.meta.dirname, 'legendary/index.html'),
        about: resolve(import.meta.dirname, 'about/index.html'),
      },
    },
  },
})
