// Filter trait untuk koleksi Mochi Friend
const ORDER = ['Background', 'Hair', 'Eyes', 'Expression', 'Accessory', 'Outfit', 'Holding']

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

export function initFilters(container, items, onChange) {
  if (!container) return

  // Kumpulkan semua nilai trait beserta jumlahnya
  const groups = {}
  for (const item of items) {
    for (const a of item.attributes || []) {
      if (a.trait_type === 'Type') continue
      groups[a.trait_type] ??= {}
      groups[a.trait_type][a.value] = (groups[a.trait_type][a.value] || 0) + 1
    }
  }
  const types = [
    ...ORDER.filter((t) => groups[t]),
    ...Object.keys(groups).filter((t) => !ORDER.includes(t)),
  ]

  container.innerHTML =
    types.map((t) => {
      const options = Object.entries(groups[t])
        .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
        .map(([value, n]) => `<option value="${esc(value)}">${esc(value)} (${n})</option>`)
        .join('')
      return `
        <label class="filter">
          <span class="filter-label">${esc(t)}</span>
          <select data-trait="${esc(t)}"><option value="">All</option>${options}</select>
        </label>`
    }).join('') +
    '<button type="button" class="filter-reset" hidden>Clear filters</button>'

  const selects = [...container.querySelectorAll('select')]
  const reset = container.querySelector('.filter-reset')

  function apply() {
    const active = selects.filter((s) => s.value).map((s) => [s.dataset.trait, s.value])
    reset.hidden = active.length === 0
    const filtered = items.filter((item) =>
      active.every(([t, v]) => (item.attributes || []).some((a) => a.trait_type === t && String(a.value) === v))
    )
    onChange(filtered)
  }

  selects.forEach((s) => s.addEventListener('change', apply))
  reset.addEventListener('click', () => {
    selects.forEach((s) => (s.value = ''))
    apply()
  })
}
