/**
 * Upsert all static website packages into cms_packages (service role).
 * Usage: npm run sync:cms-packages
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { travelPackages } from '../src/data/packages.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function loadEnv(path) {
  const out = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line || line.trim().startsWith('#')) continue
    const i = line.indexOf('=')
    if (i < 0) continue
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return out
}

function isUsableImageSrc(value) {
  if (value == null) return false
  const src = String(value).trim()
  if (!src) return false
  return (
    src.startsWith('/') ||
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('data:') ||
    src.startsWith('blob:')
  )
}

function resolvePackageCoverImage(pkgOrRow) {
  if (!pkgOrRow) return ''
  const details = pkgOrRow.details || {}
  const gallery = Array.isArray(details.gallery) ? details.gallery : []
  const hotels = Array.isArray(details.hotels) ? details.hotels : []
  const candidates = [
    details.coverImage,
    details.thumbnailImage,
    gallery[0],
    pkgOrRow.image,
    ...hotels.map((hotel) => hotel?.image),
  ]
  for (const candidate of candidates) {
    if (isUsableImageSrc(candidate)) return String(candidate).trim()
  }
  return ''
}

function staticPackageToCmsRow(pkg) {
  const details = JSON.parse(JSON.stringify(pkg.details || {}))
  const cover = resolvePackageCoverImage({ ...pkg, details })
  if (cover) {
    if (!isUsableImageSrc(details.coverImage)) details.coverImage = cover
    if (!isUsableImageSrc(details.thumbnailImage)) details.thumbnailImage = cover
  }
  return {
    legacy_id: Number(pkg.id),
    title: pkg.title || 'Untitled package',
    destination: pkg.destination || null,
    category: pkg.category || null,
    price: pkg.price != null ? Number(pkg.price) : null,
    duration: pkg.duration || null,
    description: pkg.description || null,
    long_description: pkg.longDescription || null,
    image: isUsableImageSrc(pkg.image) ? pkg.image : cover || null,
    featured: Boolean(pkg.featured),
    package_type: pkg.packageType || null,
    hidden: Boolean(pkg.hidden),
    published: true,
    details,
    updated_at: new Date().toISOString(),
  }
}

const env = loadEnv(join(root, '.env'))
const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL
const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL and SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })
const CHUNK = 40
const rows = travelPackages.map(staticPackageToCmsRow)

console.log(`Syncing ${rows.length} packages …`)

let imported = 0
for (let i = 0; i < rows.length; i += CHUNK) {
  const chunk = rows.slice(i, i + CHUNK)
  const { error } = await supabase.from('cms_packages').upsert(chunk, { onConflict: 'legacy_id' })
  if (error) {
    console.error(`Upsert failed at ${imported}/${rows.length}:`, error.message)
    process.exit(1)
  }
  imported += chunk.length
  console.log(`  ${imported}/${rows.length}`)
}

const { data: pkg24, error: e24 } = await supabase
  .from('cms_packages')
  .select('legacy_id, title, price, duration, updated_at')
  .eq('legacy_id', 24)
  .maybeSingle()

if (e24) {
  console.error('Verify #24 failed:', e24.message)
  process.exit(1)
}

console.log('Done. Package #24:', pkg24)
