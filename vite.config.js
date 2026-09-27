import { resolve } from 'node:path'
import { defineConfig } from 'vite'

const page = (path) => resolve(import.meta.dirname, path)

export default defineConfig({
  build: {
    rolldownOptions: {
      input: {
        home: page('index.html'),
        collections: page('collections/index.html'),
        mochi: page('mochi/index.html'),
        legendary: page('legendary/index.html'),
        chibi: page('chibi/index.html'),
        muse: page('muse/index.html'),
        about: page('about/index.html'),
      },
    },
  },
})
