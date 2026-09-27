const ICON_PREV = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>'
const ICON_NEXT = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
const ICON_CLOSE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'

export function initLightbox(items) {
  const dialog = document.createElement('dialog')
  dialog.className = 'lightbox'
  dialog.innerHTML = `
    <div class="lb-card">
      <div class="lb-media"><img class="lb-img" alt="" width="2000" height="2000" /></div>
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

  const img = dialog.querySelector('.lb-img')
  const kind = dialog.querySelector('.lb-kind')
  const name = dialog.querySelector('.lb-name')
  const desc = dialog.querySelector('.lb-desc')
  const tbody = dialog.querySelector('tbody')
  const pos = dialog.querySelector('.lb-pos')

  let current = 0

  function show(index) {
    current = (index + items.length) % items.length
    const item = items[current]

    const type = item.attributes.find((a) => a.trait_type === 'Type')
    kind.textContent = type ? type.value : 'Mochi Friend'
    name.textContent = (item.attributes.find((a) => a.trait_type === "Legendary") || {}).value || item.name.replace(/\s*#\d+/, "")
    desc.textContent = item.description
    pos.textContent = `${current + 1} of ${items.length}`

    img.alt = item.name
    img.src = item.thumb
    const full = new Image()
    full.onload = () => {
      if (items[current] === item) img.src = item.image
    }
    full.src = item.image

    tbody.innerHTML = item.attributes
      .filter((a) => a.trait_type !== 'Type')
      .map((a) => `
        <tr>
          <th scope="row">${a.trait_type}</th>
          <td>
            ${a.rare ? '<span class="rare-badge">Rare</span>' : ''}
            <span>${a.value}</span>
            <span class="lb-percent">${a.percent}%</span>
          </td>
        </tr>`)
      .join('')
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

  return {
    open(index) {
      show(index)
      dialog.showModal()
    },
  }
}
