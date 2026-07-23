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
  return {
    legacy_id: Number(pkg.id),
    title: pkg.title || 'Untitled package',
    destination: pkg.destination || null,
    category: pkg.category || null,
    price: pkg.price != null ? Number(pkg.price) : null,
    duration: pkg.duration || null,
    description: pkg.description || null,
    long_description: pkg.longDescription || null,
    image: pkg.image || null,
    featured: Boolean(pkg.featured),
    package_type: pkg.packageType || null,
    hidden: Boolean(pkg.hidden),
    published: true,
    details: cloneJson(pkg.details || {}),
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
