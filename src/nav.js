const LINKS = [
  { page: 'home', href: '/', label: 'Home' },
  { page: 'mochi', href: '/mochi/', label: 'Mochi Friend' },
  { page: 'legendary', href: '/legendary/', label: 'Legendary' },
  { page: 'about', href: '/about/', label: 'About' },
]

const X_URL = 'https://x.com/ZelythMochi'

const X_ICON = `
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>`

export function renderNav() {
  const header = document.getElementById('site-header')
  if (!header) return

  const current = document.body.dataset.page

  const links = LINKS.map((link) => {
    const active = link.page === current ? ' aria-current="page"' : ''
    return `<a href="${link.href}" class="nav-link"${active}>${link.label}</a>`
  }).join('')

  header.className = 'site-header'
  header.innerHTML = `
    <a href="/" class="brand">Mochi Friend <span class="brand-by">by @ZelythMochi</span></a>
    <nav class="nav" aria-label="Main">
      ${links}
      <a href="${X_URL}" class="nav-x" target="_blank" rel="noopener" aria-label="@ZelythMochi on X">${X_ICON}</a>
    </nav>`
}
