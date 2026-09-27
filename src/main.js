import './style.css'
import { renderNav } from './nav.js'
import { initSearch } from './search.js'
import { initGallery } from './gallery.js'
import { initLightbox } from './lightbox.js'

renderNav()
initSearch()

const GALLERIES = {
  mochi: { dataUrl: '/data/mochi.json' },
  legendary: { dataUrl: '/data/legendary.json' },
  chibi: { dataUrl: '/data/chibi.json', eyebrow: 'Chibi' },
  muse: { dataUrl: '/data/muse.json', eyebrow: 'Muse' },
}

async function setupGallery(kind, { dataUrl, eyebrow }) {
  const items = await initGallery({ dataUrl, kind })
  const lightbox = initLightbox(items, { eyebrow })

  document.getElementById('grid').addEventListener('click', (e) => {
    const thumb = e.target.closest('.thumb')
    if (thumb) lightbox.open(Number(thumb.dataset.index))
  })
}

const page = document.body.dataset.page
if (GALLERIES[page]) setupGallery(page, GALLERIES[page])
