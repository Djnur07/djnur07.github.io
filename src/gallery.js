const PLAY_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>'

function attr(item, type) {
  const found = (item.attributes || []).find((a) => a.trait_type === type)
  return found ? found.value : null
}

function thumbMedia(item) {
  if (item.thumb) return `<img src="${item.thumb}" alt="" width="400" height="400" loading="lazy" />`
  if (item.video) return `<video src="${item.video}#t=0.1" muted playsinline preload="metadata"></video>`
  return ''
}

// Gambar ulang isi grid (dipakai juga oleh filter)
export function renderGrid(grid, items, offset = 0) {
  if (!items.length) {
    grid.innerHTML = '<p class="grid-empty">No keepers match these traits.</p>'
    return
  }
  grid.innerHTML = items.map((item, index) => {
    const hasRare = (item.attributes || []).some((a) => a.rare && a.trait_type !== 'Type')
    // Mochi: tanpa label. Legendary: nama karakter. Chibi/Muse: judul karya.
    const label = attr(item, 'Legendary') || attr(item, 'Character') || (item.media ? item.name : '')
    const isVideo = item.media === 'video'

    return `
      <button class="thumb" type="button" data-index="${offset + index}" aria-label="Open ${label || item.name}">
        <span class="thumb-img">
          ${thumbMedia(item)}
          ${hasRare ? '<span class="rare-dot" title="Has a rare trait"></span>' : ''}
          ${isVideo ? `<span class="play-badge">${PLAY_ICON}</span>` : ''}
        </span>
        ${label ? `<span class="thumb-label">${label}</span>` : ''}
      </button>`
  }).join('')
}

export async function initGallery({ dataUrl, kind }) {
  const grid = document.getElementById('grid')
  const count = document.getElementById('count')

  const items = await fetch(dataUrl, { cache: 'no-cache' }).then((r) => r.json())

  // "On display": teks dari data-caption di HTML, atau jumlah Legendary
  if (count) {
    count.textContent = count.dataset.caption || (kind === 'legendary' ? `${items.length} one-of-ones` : '')
  }

  renderGrid(grid, items)
  return items
}
