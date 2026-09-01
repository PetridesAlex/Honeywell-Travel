#!/usr/bin/env node
/**
 * Compare key paths between en.json and el.json.
 * Exit 1 if any keys are missing in either locale.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function flattenKeys(obj, prefix = '') {
  const keys = []
  for (const [key, value] of Object.entries(obj || {})) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, path))
    } else {
      keys.push(path)
    }
  }
  return keys
}

const en = JSON.parse(readFileSync(join(root, 'src/i18n/locales/en.json'), 'utf8'))
const el = JSON.parse(readFileSync(join(root, 'src/i18n/locales/el.json'), 'utf8'))

const enKeys = new Set(flattenKeys(en))
const elKeys = new Set(flattenKeys(el))

const missingInEl = [...enKeys].filter((k) => !elKeys.has(k)).sort()
const missingInEn = [...elKeys].filter((k) => !enKeys.has(k)).sort()

if (missingInEl.length === 0 && missingInEn.length === 0) {
  console.log(`i18n parity OK (${enKeys.size} keys in en.json and el.json)`)
  process.exit(0)
}

if (missingInEl.length) {
  console.error(`Missing in el.json (${missingInEl.length}):`)
  missingInEl.slice(0, 50).forEach((k) => console.error(`  - ${k}`))
  if (missingInEl.length > 50) console.error(`  ... and ${missingInEl.length - 50} more`)
}

if (missingInEn.length) {
  console.error(`Missing in en.json (${missingInEn.length}):`)
  missingInEn.slice(0, 50).forEach((k) => console.error(`  - ${k}`))
  if (missingInEn.length > 50) console.error(`  ... and ${missingInEn.length - 50} more`)
}

process.exit(1)
