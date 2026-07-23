import { isPackageVisible, travelPackages } from '../data/packages'
import { fetchPublishedCmsPackages, isPackagesCmsSchemaMissing } from './packagesCms'
import { isSupabaseConfigured } from './supabase'

let cache = null
let cacheAt = 0
let loadPromise = null

const CACHE_MS = 60_000

function staticVisiblePackages() {
  return travelPackages.filter(isPackageVisible)
}

/**
 * Merge static website packages with published CMS rows.
 * CMS wins for matching legacy ids so employee edits appear on the site.
 */
export function mergeStaticWithCms(staticList, cmsList) {
  const map = new Map()
  for (const pkg of staticList || []) {
    if (pkg?.id != null) map.set(Number(pkg.id), pkg)
  }
  for (const pkg of cmsList || []) {
    if (pkg?.id != null) map.set(Number(pkg.id), pkg)
  }
  return Array.from(map.values()).filter(isPackageVisible)
}

export function clearPackagesCatalogCache() {
  cache = null
  cacheAt = 0
  loadPromise = null
}

/**
 * Load merged catalog (static + CMS). Falls back to static if CMS is empty or unavailable.
 */
export async function loadMergedPackages({ force = false } = {}) {
  const now = Date.now()
  if (!force && cache && now - cacheAt < CACHE_MS) {
    return cache
  }

  if (!force && loadPromise) {
    return loadPromise
  }

  loadPromise = (async () => {
    const staticList = staticVisiblePackages()

    if (!isSupabaseConfigured) {
      cache = staticList
      cacheAt = Date.now()
      return cache
    }

    try {
      const { data, error } = await fetchPublishedCmsPackages()
      if (error) {
        if (!isPackagesCmsSchemaMissing(error)) {
          console.warn('Package CMS load failed, using static catalog:', error.message)
        }
        cache = staticList
        cacheAt = Date.now()
        return cache
      }

      if (!data?.length) {
        cache = staticList
        cacheAt = Date.now()
        return cache
      }

      cache = mergeStaticWithCms(staticList, data)
      cacheAt = Date.now()
      return cache
    } catch (err) {
      console.warn('Package CMS load failed, using static catalog:', err)
      cache = staticList
      cacheAt = Date.now()
      return cache
    } finally {
      loadPromise = null
    }
  })()

  return loadPromise
}

export async function getMergedPackageById(id) {
  const packages = await loadMergedPackages()
  const numericId = parseInt(id, 10)
  return packages.find((pkg) => pkg.id === numericId)
}

export async function getMergedPackagesByFilter(category = 'Any', destination = 'Any') {
  const packages = await loadMergedPackages()
  let filtered = packages

  if (category !== 'Any') {
    filtered = filtered.filter((pkg) => pkg.category === category)
  }

  if (destination !== 'Any') {
    filtered = filtered.filter((pkg) => pkg.destination === destination)
  }

  return filtered
}
