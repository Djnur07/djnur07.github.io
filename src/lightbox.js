const ICON_PREV = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>'
const ICON_NEXT = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
const ICON_CLOSE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'

export function initLightbox(items, { eyebrow } = {}) {
  const dialog = document.createElement('dialog')
  dialog.className = 'lightbox'
  dialog.innerHTML = `
    <div class="lb-card">
      <div class="lb-media"></div>
      <div class="lb-info">
        <span class="eyebrow lb-kind"></span>
        <h2 class="lb-name"></h2>
        <p class="lb-desc"></p>
        <table class="lb-attrs">
          <caption class="sr-only">Attributes</caption>
          <tbody></tbody>
        </table>
        <div class="lb-controls">
          <button type="button" class="lb-btn" data-action="prev" aria-label="Previous">${ICON_PREV}</button>
          <button type="button" class="lb-btn" data-action="next" aria-label="Next">${ICON_NEXT}</button>
          <span class="lb-pos"></span>
        </div>
      </div>
      <button type="button" class="lb-close" data-action="close" aria-label="Close">${ICON_CLOSE}</button>
    </div>`
  document.body.appendChild(dialog)

  const media = dialog.querySelector('.lb-media')
  const kind = dialog.querySelector('.lb-kind')
  const name = dialog.querySelector('.lb-name')
  const desc = dialog.querySelector('.lb-desc')
  const table = dialog.querySelector('.lb-attrs')
  const tbody = dialog.querySelector('tbody')
  const pos = dialog.querySelector('.lb-pos')

  let current = 0

  function renderMedia(item, title) {
    media.innerHTML = ''
    media.dataset.fit = item.media ? 'contain' : 'cover'

    if (item.media === 'video') {
      const video = document.createElement('video')
      video.className = 'lb-img'
      video.src = item.video
      if (item.thumb) video.poster = item.thumb
      video.controls = true
      video.autoplay = true
      video.loop = true
      video.muted = true
      video.playsInline = true
      video.setAttribute('aria-label', title)
      media.appendChild(video)
      return
    }

    // Gambar: tampilkan thumbnail dulu, lalu ganti ke versi besar
    const img = document.createElement('img')
    img.className = 'lb-img'
    img.alt = title
    img.src = item.thumb || item.image
    media.appendChild(img)
    if (item.image && item.image !== item.thumb) {
      const full = new Image()
      full.onload = () => {
        if (items[current] === item) img.src = item.image
      }
      full.src = item.image
    }
  }

  function show(index) {
    current = (index + items.length) % items.length
    const item = items[current]
    const attrs = item.attributes || []

    // Judul tanpa nomor token; Legendary pakai nama karakter
    const type = attrs.find((a) => a.trait_type === 'Type')
    const legendary = attrs.find((a) => a.trait_type === 'Legendary')
    const title = legendary ? legendary.value : String(item.name || '').replace(/\s*#\d+/, '')

    kind.textContent = type ? type.value : (item.collection || eyebrow || 'Mochi Friend')
    name.textContent = title
    desc.textContent = item.description || ''
    desc.hidden = !item.description

    const rows = attrs.filter((a) => a.trait_type !== 'Type')
    table.hidden = rows.length === 0
    tbody.innerHTML = rows
      .map((a) => `
        <tr>
          <th scope="row">${a.trait_type}</th>
          <td>
            ${a.rare ? '<span class="rare-badge">Rare</span>' : ''}
            <span>${a.value}</span>
            ${a.percent != null ? `<span class="lb-percent">${a.percent}%</span>` : ''}
          </td>
        </tr>`)
      .join('')

    pos.textContent = `${current + 1} of ${items.length}`
    renderMedia(item, title)
  }

  dialog.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action
    if (action === 'prev') show(current - 1)
    else if (action === 'next') show(current + 1)
    else if (action === 'close') dialog.close()
    else if (e.target === dialog) dialog.close()
  })

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(current - 1)
    if (e.key === 'ArrowRight') show(current + 1)
  })

  // Hentikan video saat jendela ditutup
  dialog.addEventListener('close', () => {
    media.innerHTML = ''
  })

  return {
    open(index) {
      show(index)
      dialog.showModal()
    },
  }
}
