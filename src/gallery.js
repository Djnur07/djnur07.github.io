function attr(item, type) {
  const found = item.attributes.find((a) => a.trait_type === type)
  return found ? found.value : null
}

export async function initGallery({ dataUrl, kind }) {
  const grid = document.getElementById('grid')
  const count = document.getElementById('count')

  const items = await fetch(dataUrl, { cache: 'no-cache' }).then((r) => r.json())

  // Keterangan "On display" di samping grid (tanpa angka)
  count.textContent = kind === 'legendary' ? `${items.length} one-of-ones` : 'The first little keepers'

  // Kotak gambar: tanpa nomor ID. Legendary hanya menampilkan nama karakter.
  grid.innerHTML = items.map((item, index) => {
    const hasRare = item.attributes.some((a) => a.rare && a.trait_type !== 'Type')
    const label = attr(item, 'Legendary') || attr(item, 'Character') || ''

    return `
      <button class="thumb" type="button" data-index="${index}" aria-label="Open ${item.name}">
        <span class="thumb-img">
          <img src="${item.thumb}" alt="" width="400" height="400" loading="lazy" />
          ${hasRare ? '<span class="rare-dot" title="Has a rare trait"></span>' : ''}
        </span>
        ${label ? `<span class="thumb-label">${label}</span>` : ''}
      </button>`
  }).join('')

  return items
}
