// Menyalin gambar + metadata asli dari Documents/Mochi Friend NFT ke website.
// File asli di folder Mochi Friend NFT hanya DIBACA, tidak pernah diubah.
import { readFileSync, readdirSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { execFileSync } from 'node:child_process'

const SOURCE = join(homedir(), 'Documents', 'Mochi Friend NFT')
const MOCHI_FROM = 1
const MOCHI_TO = 50
const LEGENDARY_COUNT = 10
const THUMB_SIZE = 400   // lebar thumbnail (px)
const RARE_PERCENT = 2   // trait yang muncul ≤ 2% ditandai "Rare"

// Deskripsi untuk website: buang semua angka supply
//  "3,333 cozy chibi keepers, ..."   → "Cozy chibi keepers, ..."
//  "... One of 33 hand-drawn keepers" → "... Hand-drawn keepers"
function cleanDescription(text) {
  let s = String(text || '')
  s = s.replace(/\b(one|1)\s+of\s+(the\s+)?[\d,]+\s*/gi, '')     // "one of 33 "
  s = s.replace(/\s*\bof\s+[\d,]+\b/gi, '')                       // " of 3,333"
  s = s.replace(/\b\d{1,3}(,\d{3})+\b\s*/g, '')                   // "3,333 "
  s = s.replace(/\b\d+\s+(?=[a-z])/gi, '')                        // "33 legendary"
  s = s.replace(/\s{2,}/g, ' ').replace(/\s+([.,!?])/g, '$1').trim()
  s = s.replace(/(^|[.!?]\s+)([a-z])/g, (m, p, c) => p + c.toUpperCase())
  return s
}

// 1. Baca semua metadata
const all = readdirSync(join(SOURCE, 'metadata'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => {
    const id = Number(f.replace('.json', ''))
    const meta = JSON.parse(readFileSync(join(SOURCE, 'metadata', f), 'utf8'))
    return { id, ...meta }
  })
  .sort((a, b) => a.id - b.id)

// 2. Hitung berapa kali setiap trait muncul di seluruh koleksi
const counts = {}
for (const m of all) {
  for (const a of m.attributes || []) {
    const key = `${a.trait_type}::${a.value}`
    counts[key] = (counts[key] || 0) + 1
  }
}
const percentOf = (a) => Math.round((counts[`${a.trait_type}::${a.value}`] / all.length) * 1000) / 10

const isLegendary = (m) =>
  (m.attributes || []).some((a) => a.trait_type === 'Type' && /legendary/i.test(String(a.value)))

// 3. Salin gambar, buat thumbnail, rapikan metadata
function prepare(m, folder) {
  const src = join(SOURCE, 'images', `${m.id}.png`)
  mkdirSync(`public/${folder}/images`, { recursive: true })
  mkdirSync(`public/${folder}/thumbs`, { recursive: true })
  copyFileSync(src, `public/${folder}/images/${m.id}.png`)
  execFileSync('sips', ['-Z', String(THUMB_SIZE), src, '--out', `public/${folder}/thumbs/${m.id}.png`], { stdio: 'ignore' })

  return {
    id: m.id,
    name: m.name,
    description: cleanDescription(m.description),
    image: `/${folder}/images/${m.id}.png`,
    thumb: `/${folder}/thumbs/${m.id}.png`,
    attributes: (m.attributes || []).map((a) => {
      const percent = percentOf(a)
      return { trait_type: a.trait_type, value: a.value, percent, rare: percent <= RARE_PERCENT }
    }),
  }
}

// Bersihkan hasil lama (hanya di folder website)
for (const dir of ['public/mochi', 'public/legendary']) rmSync(dir, { recursive: true, force: true })
mkdirSync('public/data', { recursive: true })

const mochiSource = all.filter((m) => m.id >= MOCHI_FROM && m.id <= MOCHI_TO)
const legendarySource = all.filter((m) => isLegendary(m) && m.id > MOCHI_TO).slice(0, LEGENDARY_COUNT)

const mochi = mochiSource.map((m) => prepare(m, 'mochi'))
const legendary = legendarySource.map((m) => prepare(m, 'legendary'))

writeFileSync('public/data/mochi.json', JSON.stringify(mochi, null, 2))
writeFileSync('public/data/legendary.json', JSON.stringify(legendary, null, 2))
rmSync('public/data/collection.json', { force: true })

console.log(`Mochi Friend : ${mochi.length} token (#${MOCHI_FROM}–#${MOCHI_TO})`)
console.log(`Legendary    : ${legendary.length} token → ${legendary.map((m) => '#' + m.id).join(', ')}`)
console.log(`Deskripsi Mochi    : "${mochi[0]?.description}"`)
console.log(`Deskripsi Legendary: "${legendary[0]?.description}"`)
