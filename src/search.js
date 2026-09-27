import { initLightbox } from './lightbox.js'

// Koleksi yang bisa dicari. Koleksi baru cukup ditambahkan di sini.
const SOURCES = [
  { url: '/data/mochi.json', collection: 'Mochi Friend' },
  { url: '/data/legendary.json', collection: 'Legendary' },
  { url: '/data/chibi.json', collection: 'Chibi' },
  { url: '/data/muse.json', collection: 'Muse' },
]

const ICON_SEARCH = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>'

const escapeHtml = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

function searchText(item, collection) {
  const attrs = (item.attributes || []).map((a) => `${a.trait_type} ${a.value}`)
  return [collection, item.name, item.description, ...attrs, ...(item.keywords || [])].join(' ').toLowerCase()
}

let indexPromise = null
function loadIndex() {
  if (!indexPromise) {
    indexPromise = Promise.all(
      SOURCES.map(async (src) => {
        try {
          const items = await fetch(src.url, { cache: 'no-cache' }).then((r) => r.json())
          return items.map((item) => ({ item, collection: src.collection, text: searchText(item, src.collection) }))
        } catch {
          return []
        }
      })
    ).then((lists) => lists.flat())
  }
  return indexPromise
}

function titleOf(entry) {
  const legendary = (entry.item.attributes || []).find((a) => a.trait_type === 'Legendary')
  if (legendary) return legendary.value
  return String(entry.item.name || entry.collection).replace(/\s*#\d+/, '')
}

// Trait / keyword yang cocok dengan kata kunci, untuk ditampilkan di bawah hasil
function matchedWords(entry, terms) {
  const values = [
    ...(entry.item.attributes || []).filter((a) => a.trait_type !== 'Type').map((a) => String(a.value)),
    ...(entry.item.keywords || []),
  ]
  const hits = values.filter((v) => terms.some((t) => v.toLowerCase().includes(t)))
  return [...new Set(hits)].slice(0, 3)
}

export function initSearch() {
  const header = document.getElementById('site-header')
  if (!header) return

  const form = document.createElement('form')
  form.className = 'search'
  form.setAttribute('role', 'search')
  form.innerHTML = `
    <label class="sr-only" for="site-search">Search collections</label>
    <span class="search-icon">${ICON_SEARCH}</span>
    <input id="site-search" type="search" placeholder="Search collections" autocomplete="off" />`
  header.insertBefore(form, header.querySelector('.nav'))

  const panel = document.createElement('div')
  panel.className = 'search-panel'
  panel.hidden = true
  header.appendChild(panel)

  const input = form.querySelector('input')
  let results = []

  form.addEventListener('submit', (e) => e.preventDefault())

  input.addEventListener('input', async () => {
    const q = input.value.trim().toLowerCase()
    if (q.length < 2) {
      panel.hidden = true
      panel.innerHTML = ''
      results = []
      return
    }
    const terms = q.split(/\s+/)
    const index = await loadIndex()
    if (input.value.trim().toLowerCase() !== q) return // masih mengetik
    results = index.filter((entry) => terms.every((t) => entry.text.includes(t)))
    render(q, terms)
  })

  function render(q, terms) {
    panel.hidden = false
    if (!results.length) {
      panel.innerHTML = `<p class="search-empty">No results for “${escapeHtml(q)}”</p>`
      return
    }
    panel.innerHTML = `
      <p class="search-count">${results.length} result${results.length > 1 ? 's' : ''}</p>
      <div class="search-grid">
        ${results.map((entry, i) => {
          const words = matchedWords(entry, terms)
          return `
            <button type="button" class="search-result" data-index="${i}">
              <img src="${entry.item.thumb || ''}" alt="" width="400" height="400" loading="lazy" />
              <span class="search-title">${escapeHtml(titleOf(entry))}</span>
              <span class="search-sub">${escapeHtml(words.length ? words.join(' · ') : entry.collection)}</span>
            </button>`
        }).join('')}
      </div>`
  }

  panel.addEventListener('click', (e) => {
    const btn = e.target.closest('.search-result')
    if (!btn) return
    document.querySelectorAll('dialog.lightbox[data-search]').forEach((d) => d.remove())
    const lightbox = initLightbox(results.map((r) => ({ ...r.item, collection: r.collection })))
    const dialogs = document.querySelectorAll('dialog.lightbox')
    dialogs[dialogs.length - 1].dataset.search = '1'
    lightbox.open(Number(btn.dataset.index))
  })

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = ''
      panel.hidden = true
    }
  })
  input.addEventListener('focus', () => {
    if (results.length) panel.hidden = false
  })
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target) && !e.target.closest('dialog')) panel.hidden = true
  })
}
