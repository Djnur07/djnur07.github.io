const pad = (n) => String(n).padStart(4, '0')

function attr(item, type) {
  const found = item.attributes.find((a) => a.trait_type === type)
  return found ? found.value : null
}

export async function initGallery({ dataUrl, kind }) {
  const grid = document.getElementById('grid')
  const count = document.getElementById('count')

  const items = await fetch(dataUrl, { cache: 'no-cache' }).then((r) => r.json())

  // Keterangan di samping grid (tanpa angka supply)
  if (kind === 'legendary') {
    count.textContent = `${items.length} one-of-ones`
  } else {
    const first = pad(items[0].id)
    const last = pad(items[items.length - 1].id)
    count.textContent = `#${first} – #${last}`
  }

  grid.innerHTML = items.map((item, index) => {
    const hasRare = item.attributes.some((a) => a.rare && a.trait_type !== 'Type')
    const character = attr(item, 'Legendary') || attr(item, 'Character')
    const label = character ? `#${pad(item.id)} · ${character}` : `#${pad(item.id)}`

    return `
      <button class="thumb" type="button" data-index="${index}" aria-label="Open ${item.name}">
        <span class="thumb-img">
          <img src="${item.thumb}" alt="" width="400" height="400" loading="lazy" />
          ${hasRare ? '<span class="rare-dot" title="Has a rare trait"></span>' : ''}
        </span>
        <span class="thumb-label">${label}</span>
      </button>`
  }).join('')

  return items
}
