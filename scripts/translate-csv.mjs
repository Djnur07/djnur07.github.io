import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { LEGENDARY_EN } from './legendary-en.mjs'

const BASE = join(homedir(), 'Documents', 'Mochi Friend NFT')
const FILES = ['metadata.csv', 'opensea-metadata.csv']

// Nama terpanjang diganti dulu, supaya "Penyihir Bintang" tidak berubah jadi "Witch Bintang"
const pairs = Object.entries(LEGENDARY_EN).sort((a, b) => b[0].length - a[0].length)

for (const name of FILES) {
  const file = join(BASE, name)
  if (!existsSync(file)) { console.log(`Lewati (tidak ada): ${name}`); continue }

  const backup = `${file}.backup-id`
  if (!existsSync(backup)) copyFileSync(file, backup)

  let text = readFileSync(file, 'utf8')
  let replaced = 0
  for (const [id, en] of pairs) {
    const parts = text.split(id)
    replaced += parts.length - 1
    text = parts.join(en)
  }
  writeFileSync(file, text)
  console.log(`${name}: ${replaced} nama diterjemahkan`)
}
