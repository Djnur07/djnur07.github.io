import { readFileSync, writeFileSync, readdirSync, cpSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { toEnglish } from './legendary-en.mjs'

const BASE = join(homedir(), 'Documents', 'PROJECT NFT', 'mochi friend NFT')
const DIR = join(BASE, 'metadata')
const BACKUP = join(BASE, 'metadata-backup-id')

if (!existsSync(BACKUP)) {
  cpSync(DIR, BACKUP, { recursive: true })
  console.log('Backup dibuat:', BACKUP)
}

let changed = 0
for (const f of readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  const file = join(DIR, f)
  const meta = JSON.parse(readFileSync(file, 'utf8'))
  let dirty = false
  for (const a of meta.attributes || []) {
    const en = toEnglish(a.value)
    if (en !== a.value) { a.value = en; dirty = true }
  }
  if (dirty) { writeFileSync(file, JSON.stringify(meta, null, 2)); changed++ }
}
console.log(`File metadata yang diterjemahkan: ${changed}`)
