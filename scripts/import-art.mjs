// Import koleksi Chibi (gambar) dan Muse (video) dari Documents/Collection art.
// Metadata dibaca dari Get Info (Title, Description, Keywords, Authors, Copyright, durasi, ukuran).
// File asli hanya DIBACA, tidak pernah diubah.
import { readdirSync, mkdirSync, copyFileSync, writeFileSync, rmSync, renameSync, existsSync } from 'node:fs'
import { join, extname, basename } from 'node:path'
import { homedir } from 'node:os'
import { execFileSync } from 'node:child_process'

const BASE = join(homedir(), 'Documents', 'Collection art')
const THUMB_SIZE = 400    // thumbnail grid (px)
const LARGE_SIZE = 1600   // gambar besar di jendela detail (px)

// Trait tetap untuk koleksi Muse (boleh diganti)
const MUSE_SERIES = 'The Silent Muse'
const MUSE_MEDIUM = 'Generative code art'
const MUSE_ARTIST = '@zanymochi'

const FIELDS = [
  'kMDItemTitle', 'kMDItemDescription', 'kMDItemKeywords', 'kMDItemAuthors',
  'kMDItemCopyright', 'kMDItemFinderComment', 'kMDItemComment',
  'kMDItemDurationSeconds', 'kMDItemPixelWidth', 'kMDItemPixelHeight',
]

// Baca metadata Get Info dengan mdls → JSON
function readMeta(file) {
  try {
    const args = ['-plist', '-']
    for (const f of FIELDS) args.push('-name', f)
    args.push(file)
    const plist = execFileSync('mdls', args)
    const json = execFileSync('plutil', ['-convert', 'json', '-o', '-', '-'], { input: plist })
    return JSON.parse(json.toString())
  } catch {
    return {}
  }
}

const capitalize = (w) => w.charAt(0).toUpperCase() + w.slice(1)

// "muse-golden-hour" → "Golden Hour", "Bandana-Bee" → "Bandana Bee"
const toTitle = (stem) =>
  stem.replace(/^muse[-_ ]/i, '').split(/[-_ ]+/).filter(Boolean).map(capitalize).join(' ')

const toSlug = (stem) => stem.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const listFiles = (dir, exts) =>
  readdirSync(dir).filter((f) => exts.includes(extname(f).toLowerCase())).sort()

const cleanKeywords = (m) => [...new Set((m.kMDItemKeywords || []).map((k) => String(k).trim()).filter(Boolean))]

function formatDuration(seconds) {
  const s = Math.round(seconds)
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function prepareFolder(out, subfolders) {
  rmSync(out, { recursive: true, force: true })
  for (const s of subfolders) mkdirSync(join(out, s), { recursive: true })
}

// Metadata dasar dari Get Info
function buildMeta(stem, m) {
  const authors = (m.kMDItemAuthors || []).join(', ')
  const attributes = []
  if (authors) attributes.push({ trait_type: 'Artist', value: authors })
  if (m.kMDItemCopyright) attributes.push({ trait_type: 'Copyright', value: m.kMDItemCopyright })

  return {
    name: m.kMDItemTitle || toTitle(stem),
    description: m.kMDItemDescription || m.kMDItemFinderComment || m.kMDItemComment || '',
    keywords: cleanKeywords(m),
    attributes,
  }
}

// ---------- Chibi (gambar) ----------
function importChibi() {
  const src = join(BASE, 'Chibi')
  const out = 'public/chibi'
  prepareFolder(out, ['images', 'thumbs'])

  return listFiles(src, ['.png', '.jpg', '.jpeg']).map((file) => {
    const path = join(src, file)
    const stem = basename(file, extname(file))
    const slug = toSlug(stem)
    const ext = extname(file).toLowerCase()
    execFileSync('sips', ['-Z', String(LARGE_SIZE), path, '--out', `${out}/images/${slug}${ext}`], { stdio: 'ignore' })
    execFileSync('sips', ['-Z', String(THUMB_SIZE), path, '--out', `${out}/thumbs/${slug}${ext}`], { stdio: 'ignore' })
    return {
      id: slug,
      ...buildMeta(stem, readMeta(path)),
      media: 'image',
      image: `/chibi/images/${slug}${ext}`,
      thumb: `/chibi/thumbs/${slug}${ext}`,
    }
  })
}

// ---------- Muse (video) ----------
function importMuse() {
  const src = join(BASE, 'Muse', 'Animasi')
  const out = 'public/muse'
  prepareFolder(out, ['videos', 'thumbs'])

  const files = listFiles(src, ['.mp4', '.m4v', '.mov'])
  const metas = files.map((file) => readMeta(join(src, file)))

  // Keyword yang ada di SEMUA video = keyword umum koleksi, bukan tema khas video
  const sets = metas.map((m) => new Set(cleanKeywords(m).map((k) => k.toLowerCase())))
  const common = new Set([...(sets[0] || [])].filter((k) => sets.every((s) => s.has(k))))

  return files.map((file, i) => {
    const m = metas[i]
    const path = join(src, file)
    const stem = basename(file, extname(file))
    const slug = toSlug(stem)
    const ext = extname(file).toLowerCase()
    copyFileSync(path, `${out}/videos/${slug}${ext}`)

    // Gambar sampul dari video (Quick Look bawaan macOS)
    let thumb = null
    try {
      execFileSync('qlmanage', ['-t', '-s', String(THUMB_SIZE * 2), '-o', `${out}/thumbs`, path], { stdio: 'ignore' })
      const made = `${out}/thumbs/${file}.png`
      if (existsSync(made)) {
        renameSync(made, `${out}/thumbs/${slug}.png`)
        thumb = `/muse/thumbs/${slug}.png`
      }
    } catch {
      // Kalau gagal, website memakai frame pertama video sebagai sampul
    }

    const base = buildMeta(stem, m)
    const theme = cleanKeywords(m)
      .filter((k) => !common.has(k.toLowerCase()))
      .map(capitalize)
      .join(', ')

    const attributes = [
      { trait_type: 'Series', value: MUSE_SERIES },
      { trait_type: 'Medium', value: MUSE_MEDIUM },
      theme && { trait_type: 'Theme', value: theme },
      m.kMDItemDurationSeconds && { trait_type: 'Duration', value: formatDuration(m.kMDItemDurationSeconds) },
      m.kMDItemPixelWidth && m.kMDItemPixelHeight && {
        trait_type: 'Resolution',
        value: `${m.kMDItemPixelWidth} × ${m.kMDItemPixelHeight}`,
      },
      ...(base.attributes.length ? base.attributes : [{ trait_type: 'Artist', value: MUSE_ARTIST }]),
    ].filter(Boolean)

    return {
      id: slug,
      ...base,
      attributes,
      media: 'video',
      video: `/muse/videos/${slug}${ext}`,
      thumb,
    }
  })
}

mkdirSync('public/data', { recursive: true })
const chibi = importChibi()
const muse = importMuse()
writeFileSync('public/data/chibi.json', JSON.stringify(chibi, null, 2))
writeFileSync('public/data/muse.json', JSON.stringify(muse, null, 2))

console.log(`Chibi: ${chibi.length} gambar`)
console.log(`Muse : ${muse.length} video`)
for (const v of muse) {
  console.log(`   - ${v.name}: ${v.attributes.map((a) => `${a.trait_type}=${a.value}`).join(' | ')}`)
}
console.log(`Sampul video dibuat: ${muse.filter((m) => m.thumb).length} dari ${muse.length}`)
