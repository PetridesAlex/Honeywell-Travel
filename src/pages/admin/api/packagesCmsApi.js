import { supabase } from '../../../lib/supabase'
import { travelPackages } from '../../../data/packages'
import {
  cloneJson,
  cmsRowToSitePackage,
  isPackagesCmsSchemaMissing,
  isUsableImageSrc,
  resolvePackageCoverImage,
  staticPackageToCmsRow
} from '../../../lib/packagesCms'

export { cmsRowToSitePackage, isPackagesCmsSchemaMissing, staticPackageToCmsRow }

export const PACKAGES_CMS_SETUP_HINT =
  'Open Supabase → SQL Editor → New query → paste the contents of supabase/fix_packages_cms.sql → Run. Then click “Check again” on this page.'

function formatError(error) {
  if (isPackagesCmsSchemaMissing(error)) {
    return 'Package CMS tables are not set up in Supabase yet.'
  }
  return error?.message || 'Request failed'
}

export async function fetchCmsPackages({ includeHidden = true } = {}) {
  let query = supabase
    .from('cms_packages')
    .select(
      'id, legacy_id, title, destination, category, price, duration, image, featured, package_type, hidden, published, details, updated_at, created_at'
    )
    .order('legacy_id', { ascending: true })

  if (!includeHidden) {
    query = query.eq('hidden', false).eq('published', true)
  }

  const { data, error } = await query

  if (error) {
    return {
      data: [],
      error: { message: formatError(error), schemaMissing: isPackagesCmsSchemaMissing(error) }
    }
  }

  return { data: data || [], error: null, schemaMissing: false }
}

export async function fetchCmsPackageById(id) {
  const { data, error } = await supabase.from('cms_packages').select('*').eq('id', id).maybeSingle()

  if (error) {
    return {
      data: null,
      error: { message: formatError(error), schemaMissing: isPackagesCmsSchemaMissing(error) }
    }
  }

  if (!data) {
    return { data: null, error: { message: 'Package not found.' } }
  }

  return { data, error: null }
}

export async function getNextLegacyId() {
  const [{ data: cmsRows, error: cmsError }, staticMax] = await Promise.all([
    supabase.from('cms_packages').select('legacy_id').order('legacy_id', { ascending: false }).limit(1),
    Promise.resolve(Math.max(0, ...travelPackages.map((pkg) => Number(pkg.id) || 0)))
  ])

  if (cmsError) {
    return {
      legacyId: staticMax + 1,
      error: { message: formatError(cmsError), schemaMissing: isPackagesCmsSchemaMissing(cmsError) }
    }
  }

  const cmsMax = Number(cmsRows?.[0]?.legacy_id) || 0
  return { legacyId: Math.max(cmsMax, staticMax) + 1, error: null }
}

export async function saveCmsPackage(row) {
  const details = cloneJson(row.details || {})
  const hotels = Array.isArray(details.hotels) ? details.hotels : []
  const cheapestDouble = hotels.reduce((min, hotel) => {
    const value = Number(hotel?.prices?.double)
    if (Number.isFinite(value) && value > 0 && value < min) return value
    return min
  }, Infinity)

  const resolvedCover = resolvePackageCoverImage({ ...row, details })
  if (resolvedCover) {
    if (!isUsableImageSrc(details.coverImage)) details.coverImage = resolvedCover
    if (!isUsableImageSrc(details.thumbnailImage)) details.thumbnailImage = resolvedCover
  }

  const payload = {
    title: (row.title || 'Untitled package').trim(),
    destination: (row.destination || '').trim() || null,
    category: (row.category || '').trim() || null,
    price:
      row.price != null && row.price !== ''
        ? Number(row.price)
        : cheapestDouble !== Infinity
          ? cheapestDouble
          : null,
    duration: (row.duration || '').trim() || null,
    description: (row.description || '').trim() || null,
    long_description: (row.long_description || '').trim() || null,
    image: isUsableImageSrc(row.image) ? row.image : resolvedCover || null,
    featured: Boolean(row.featured),
    package_type: row.package_type || null,
    hidden: Boolean(row.hidden),
    published: row.published !== false,
    details,
    updated_at: new Date().toISOString()
  }

  if (row.id) {
    const { data, error } = await supabase
      .from('cms_packages')
      .update(payload)
      .eq('id', row.id)
      .select('*')
      .single()

    if (error) {
      return {
        data: null,
        error: { message: formatError(error), schemaMissing: isPackagesCmsSchemaMissing(error) }
      }
    }
    return { data, error: null }
  }

  const insertPayload = {
    ...payload,
    legacy_id: Number(row.legacy_id)
  }

  const { data, error } = await supabase.from('cms_packages').insert(insertPayload).select('*').single()

  if (error) {
    return {
      data: null,
      error: { message: formatError(error), schemaMissing: isPackagesCmsSchemaMissing(error) }
    }
  }
  return { data, error: null }
}

export async function deleteCmsPackage(id) {
  const { error } = await supabase.from('cms_packages').delete().eq('id', id)
  return {
    error: error ? { message: formatError(error), schemaMissing: isPackagesCmsSchemaMissing(error) } : null
  }
}

const IMPORT_CHUNK = 40

/**
 * Upsert all static website packages into cms_packages (by legacy_id).
 * Existing CMS rows are overwritten with the current website snapshot.
 */
export async function importStaticPackagesIntoCms({ onProgress } = {}) {
  const rows = travelPackages.map(staticPackageToCmsRow)
  let imported = 0

  for (let i = 0; i < rows.length; i += IMPORT_CHUNK) {
    const chunk = rows.slice(i, i + IMPORT_CHUNK)
    const { error } = await supabase.from('cms_packages').upsert(chunk, { onConflict: 'legacy_id' })

    if (error) {
      return {
        imported,
        total: rows.length,
        error: { message: formatError(error), schemaMissing: isPackagesCmsSchemaMissing(error) }
      }
    }

    imported += chunk.length
    if (typeof onProgress === 'function') {
      onProgress({ imported, total: rows.length })
    }
  }

  return { imported, total: rows.length, error: null }
}

export async function countCmsPackages() {
  const { count, error } = await supabase
    .from('cms_packages')
    .select('id', { count: 'exact', head: true })

  if (error) {
    return {
      count: 0,
      error: { message: formatError(error), schemaMissing: isPackagesCmsSchemaMissing(error) }
    }
  }

  return { count: count || 0, error: null }
}
