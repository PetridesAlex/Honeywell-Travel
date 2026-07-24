import { supabase, isSupabaseConfigured } from './supabase'

export function isPackagesCmsSchemaMissing(error) {
  if (!error) return false
  const msg = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase()
  return (
    msg.includes('cms_package') &&
    (msg.includes('schema cache') ||
      msg.includes('does not exist') ||
      msg.includes('could not find') ||
      msg.includes('relation') ||
      error?.code === '42P01' ||
      error?.code === 'PGRST205')
  )
}

export function cloneJson(value) {
  return JSON.parse(JSON.stringify(value ?? null))
}

/** True when a value can be used as an <img src> (paths/URLs, not emoji flags). */
export function isUsableImageSrc(value) {
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

/**
 * Pick the best cover image for cards / sticky headers.
 * Order: cover → thumbnail → gallery → package image → first hotel image.
 */
export function resolvePackageCoverImage(pkgOrRow) {
  if (!pkgOrRow) return ''
  const details = pkgOrRow.details || {}
  const gallery = Array.isArray(details.gallery) ? details.gallery : []
  const hotels = Array.isArray(details.hotels) ? details.hotels : []
  const candidates = [
    details.coverImage,
    details.thumbnailImage,
    gallery[0],
    pkgOrRow.image,
    ...hotels.map((hotel) => hotel?.image)
  ]

  for (const candidate of candidates) {
    if (isUsableImageSrc(candidate)) return String(candidate).trim()
  }
  return ''
}

/** Map a cms_packages row to the website package shape. */
export function cmsRowToSitePackage(row) {
  if (!row) return null
  return {
    id: Number(row.legacy_id),
    title: row.title,
    destination: row.destination,
    category: row.category,
    price: row.price != null ? Number(row.price) : 0,
    duration: row.duration,
    description: row.description || '',
    longDescription: row.long_description || '',
    image: row.image || '',
    featured: Boolean(row.featured),
    packageType: row.package_type || 'individual',
    hidden: Boolean(row.hidden),
    details: row.details || {},
    _cmsId: row.id,
    _cmsUpdatedAt: row.updated_at
  }
}

/** Map a static website package into a cms_packages row payload. */
export function staticPackageToCmsRow(pkg) {
  const details = cloneJson(pkg.details || {})
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
    updated_at: new Date().toISOString()
  }
}

export async function fetchPublishedCmsPackages() {
  if (!isSupabaseConfigured) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('cms_packages')
    .select('*')
    .eq('published', true)
    .eq('hidden', false)
    .order('legacy_id', { ascending: true })

  if (error) {
    return {
      data: [],
      error: {
        message: isPackagesCmsSchemaMissing(error)
          ? 'Package CMS tables are not set up in Supabase yet.'
          : error.message || 'Request failed',
        schemaMissing: isPackagesCmsSchemaMissing(error)
      }
    }
  }

  return { data: (data || []).map(cmsRowToSitePackage), error: null }
}

/**
 * Legacy IDs that staff have marked draft/hidden in CMS.
 * These must not fall back to the static website catalog.
 */
export async function fetchSuppressedCmsLegacyIds() {
  if (!isSupabaseConfigured) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('cms_packages')
    .select('legacy_id, hidden, published')
    .or('hidden.eq.true,published.eq.false')

  if (error) {
    return {
      data: [],
      error: {
        message: isPackagesCmsSchemaMissing(error)
          ? 'Package CMS tables are not set up in Supabase yet.'
          : error.message || 'Request failed',
        schemaMissing: isPackagesCmsSchemaMissing(error)
      }
    }
  }

  const ids = (data || [])
    .map((row) => Number(row.legacy_id))
    .filter((id) => Number.isFinite(id))

  return { data: ids, error: null }
}
