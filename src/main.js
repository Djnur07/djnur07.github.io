import './style.css'
import { renderNav } from './nav.js'
import { initSearch } from './search.js'
import { initGallery, renderGrid } from './gallery.js'
import { initLightbox } from './lightbox.js'
import { initFilters } from './filters.js'

renderNav()
initSearch()

const PAGE_SIZE = 50 // jumlah Mochi per halaman

const GALLERIES = {
  mochi: { dataUrl: '/data/mochi.json' },
  legendary: { dataUrl: '/data/legendary.json' },
  chibi: { dataUrl: '/data/chibi.json', eyebrow: 'Chibi' },
  muse: { dataUrl: '/data/muse.json', eyebrow: 'Muse' },
}

// Link langsung: alamat berubah menjadi /mochi/#8 saat Mochi #8 dibuka
const hashId = () => decodeURIComponent(location.hash.slice(1))
const setHash = (id) =>
  history.replaceState(null, '', id ? `#${encodeURIComponent(id)}` : location.pathname + location.search)

async function setupGallery(kind, { dataUrl, eyebrow }) {
  const all = await initGallery({ dataUrl, kind })
  const grid = document.getElementById('grid')
  const pager = document.getElementById('pager')
  const paged = Boolean(pager) // hanya halaman Mochi yang punya tombol halaman

  let shown = all
  let page = 0
  let lightbox = null

  const pageCount = () => Math.max(1, Math.ceil(shown.length / PAGE_SIZE))

  function renderPage() {
    if (!paged) {
      renderGrid(grid, shown)
      return
    }
    const start = page * PAGE_SIZE
    renderGrid(grid, shown.slice(start, start + PAGE_SIZE), start)

    const total = pageCount()
    pager.hidden = total <= 1
    pager.innerHTML = `
      <button type="button" class="pager-btn" data-go="prev" ${page === 0 ? 'disabled' : ''}>‹ Previous</button>
      <span class="pager-status">Page ${page + 1} of ${total}</span>
      <button type="button" class="pager-btn" data-go="next" ${page >= total - 1 ? 'disabled' : ''}>Next ›</button>`
  }

  function goTo(p) {
    page = Math.min(Math.max(p, 0), pageCount() - 1)
    renderPage()
    document.querySelector('.gallery')?.scrollTo(0, 0)
  }

  function buildLightbox() {
    if (lightbox) lightbox.destroy()
    lightbox = initLightbox(shown, {
      eyebrow,
      onShow: (item) => {
        setHash(item.id)
        // Grid ikut pindah halaman saat ‹ › melewati batas halaman
        if (paged) {
          const p = Math.floor(shown.indexOf(item) / PAGE_SIZE)
          if (p !== page) {
            page = p
            renderPage()
          }
        }
      },
      onClose: () => setHash(''),
    })
  }

  renderPage()
  buildLightbox()

  grid.addEventListener('click', (e) => {
    const thumb = e.target.closest('.thumb')
    if (thumb) lightbox.open(Number(thumb.dataset.index))
  })

  if (paged) {
    pager.addEventListener('click', (e) => {
      const go = e.target.closest('[data-go]')?.dataset.go
      if (go === 'prev') goTo(page - 1)
      if (go === 'next') goTo(page + 1)
    })
  }

  // Filter trait, hanya di koleksi Mochi
  if (kind === 'mochi') {
    initFilters(document.getElementById('filters'), all, (filtered) => {
      shown = filtered
      page = 0
      renderPage()
      buildLightbox()
    })
  }

  // Buka karya dari link langsung, misalnya mochifriend.art/mochi/#80
  const id = hashId()
  if (id) {
    const index = shown.findIndex((item) => String(item.id) === id)
    if (index >= 0) {
      if (paged) {
        page = Math.floor(index / PAGE_SIZE)
        renderPage()
      }
      lightbox.open(index)
    }
  }
}

const page = document.body.dataset.page
if (GALLERIES[page]) setupGallery(page, GALLERIES[page])

// Video Home: jangan diputar otomatis untuk pengunjung yang memilih "kurangi gerakan"
const heroVideo = document.querySelector('.hero-video')
if (heroVideo && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  heroVideo.removeAttribute('autoplay')
  heroVideo.pause()
}
