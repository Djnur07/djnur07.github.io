import './style.css'
import { renderNav } from './nav.js'
import { initGallery } from './gallery.js'
import { initLightbox } from './lightbox.js'

renderNav()

async function setupGallery(dataUrl, kind) {
  const items = await initGallery({ dataUrl, kind })
  const lightbox = initLightbox(items)

  document.getElementById('grid').addEventListener('click', (e) => {
    const thumb = e.target.closest('.thumb')
    if (thumb) lightbox.open(Number(thumb.dataset.index))
  })
}

const page = document.body.dataset.page

if (page === 'mochi') setupGallery('/data/mochi.json', 'mochi')
if (page === 'legendary') setupGallery('/data/legendary.json', 'legendary')
