import { resolve } from 'node:path'
import { defineConfig } from 'vite'

const SITE = 'https://mochifriend.art'
const IMAGE = `${SITE}/og-image.png`

// Deskripsi setiap halaman (untuk Google dan kartu preview di X)
const DESCRIPTIONS = {
  '/': 'Mochi Friend: cozy chibi keepers, each hugging their own little mochi friend. Art by @Dzany_Mochi.',
  '/collections/': 'Explore the art collections by @Dzany_Mochi: Mochi Friend, Chibi and Muse.',
  '/mochi/': 'Browse Mochi Friend: cozy chibi keepers with their traits and metadata.',
  '/legendary/': 'Legendary 1/1 Mochi Friend: hand-drawn one-of-one keepers.',
  '/chibi/': 'Chibi: little risograph characters by @Dzany_Mochi.',
  '/muse/': 'Muse: animated code-art portraits by @Dzany_Mochi.',
  '/about/': 'About @Dzany_Mochi, the artist behind Mochi Friend, Chibi and Muse.',
  '/404': 'This page wandered off. Head back to Mochi Friend.',
}

// Menambahkan favicon, deskripsi, dan tag preview (Open Graph / X) ke setiap halaman
function seoTags() {
  return {
    name: 'mochi-seo',
    transformIndexHtml(html, ctx) {
      const path = ctx.path.replace(/index\.html$/, '').replace(/\.html$/, '')
      const description = DESCRIPTIONS[path] || DESCRIPTIONS['/']
      const title = (html.match(/<title>(.*?)<\/title>/) || [])[1] || 'Mochi Friend'
      const url = SITE + (path === '/404' ? '/' : path)
      const tags = `
    <meta name="description" content="${description}" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/favicon.png" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Mochi Friend" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${IMAGE}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@Dzany_Mochi" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${IMAGE}" />
`
      return html.replace('</head>', `${tags}  </head>`)
    },
  }
}

const page = (path) => resolve(import.meta.dirname, path)

export default defineConfig({
  plugins: [seoTags()],
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
        notfound: page('404.html'),
      },
    },
  },
})
