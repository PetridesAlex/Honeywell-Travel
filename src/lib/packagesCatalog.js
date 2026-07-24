import { isPackageVisible, travelPackages } from '../data/packages'
import {
  fetchPublishedCmsPackages,
  fetchSuppressedCmsLegacyIds,
  isPackagesCmsSchemaMissing
} from './packagesCms'
import { isSupabaseConfigured } from './supabase'

let cache = null
let cacheAt = 0
let loadPromise = null

/** Keep public catalog nearly live after CMS saves (was 60s). */
const CACHE_MS = 8_000
const CATALOG_BUST_KEY = 'hw_packages_catalog_bust'
const CATALOG_CHANNEL = 'hw-packages-catalog'

function staticVisiblePackages() {
  return travelPackages.filter(isPackageVisible)
}

function resetCatalogMemory() {
  cache = null
  cacheAt = 0
  loadPromise = null
}

/**
 * Merge static website packages with published CMS rows.
 * CMS wins for matching legacy ids so employee edits appear on the site.
 * suppressedIds = CMS draft/hidden packages that must not fall back to static data.
 */
export function mergeStaticWithCms(staticList, cmsList, suppressedIds = []) {
  const map = new Map()
  for (const pkg of staticList || []) {
    if (pkg?.id != null) map.set(Number(pkg.id), pkg)
  }
  for (const pkg of cmsList || []) {
    if (pkg?.id != null) map.set(Number(pkg.id), pkg)
  }
  for (const id of suppressedIds || []) {
    const numericId = Number(id)
    if (Number.isFinite(numericId)) map.delete(numericId)
  }
  return Array.from(map.values()).filter(isPackageVisible)
}

/**
 * Clear in-memory catalog and notify other tabs/windows so the live site refetches ASAP.
 */
export function clearPackagesCatalogCache() {
  resetCatalogMemory()

  if (typeof window === 'undefined') return

  try {
    const token = String(Date.now())
    window.localStorage.setItem(CATALOG_BUST_KEY, token)
  } catch {
    // ignore quota / private mode
  }

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(CATALOG_CHANNEL)
      channel.postMessage({ type: 'bust', at: Date.now() })
      channel.close()
    }
  } catch {
    // ignore unsupported environments
  }
}

/**
 * Load merged catalog (static + CMS). Falls back to static if CMS is empty or unavailable.
 * Pass `{ force: true }` after CMS saves or when opening public package pages.
 */
export async function loadMergedPackages({ force = false } = {}) {
  const now = Date.now()

  if (!force && cache && now - cacheAt < CACHE_MS) {
    return cache
  }

  if (!force && loadPromise) {
    return loadPromise
  }

  const thisPromise = (async () => {
    const staticList = staticVisiblePackages()

    if (!isSupabaseConfigured) {
      cache = staticList
      cacheAt = Date.now()
      return cache
    }

    try {
      const [publishedResult, suppressedResult] = await Promise.all([
        fetchPublishedCmsPackages(),
        fetchSuppressedCmsLegacyIds()
      ])

      if (publishedResult.error) {
        if (!isPackagesCmsSchemaMissing(publishedResult.error)) {
          console.warn(
            'Package CMS load failed, using static catalog:',
            publishedResult.error.message
          )
        }
        cache = staticList
        cacheAt = Date.now()
        return cache
      }

      const suppressedIds = suppressedResult.error ? [] : suppressedResult.data || []
      const data = publishedResult.data || []

      if (!data.length && !suppressedIds.length) {
        cache = staticList
        cacheAt = Date.now()
        return cache
      }

      cache = mergeStaticWithCms(staticList, data, suppressedIds)
      cacheAt = Date.now()
      return cache
    } catch (err) {
      console.warn('Package CMS load failed, using static catalog:', err)
      cache = staticList
      cacheAt = Date.now()
      return cache
    } finally {
      if (loadPromise === thisPromise) {
        loadPromise = null
      }
    }
  })()

  loadPromise = thisPromise
  return thisPromise
}

export async function getMergedPackageById(id, { force = false } = {}) {
  const packages = await loadMergedPackages({ force })
  const numericId = parseInt(id, 10)
  return packages.find((pkg) => pkg.id === numericId)
}

export async function getMergedPackagesByFilter(category = 'Any', destination = 'Any', { force = false } = {}) {
  const packages = await loadMergedPackages({ force })
  let filtered = packages

  if (category !== 'Any') {
    filtered = filtered.filter((pkg) => pkg.category === category)
  }

  if (destination !== 'Any') {
    filtered = filtered.filter((pkg) => pkg.destination === destination)
  }

  return filtered
}

/** Keep public pages synced when CMS saves in another tab or the user returns to the page. */
export function subscribePackagesCatalogRefresh(onRefresh) {
  if (typeof window === 'undefined' || typeof onRefresh !== 'function') {
    return () => {}
  }

  const run = () => {
    onRefresh()
  }

  const onStorage = (event) => {
    if (event.key === CATALOG_BUST_KEY) {
      resetCatalogMemory()
      run()
    }
  }

  const onVisible = () => {
    if (document.visibilityState === 'visible') run()
  }

  window.addEventListener('storage', onStorage)
  document.addEventListener('visibilitychange', onVisible)
  window.addEventListener('focus', run)

  let channel = null
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(CATALOG_CHANNEL)
      channel.onmessage = () => {
        resetCatalogMemory()
        run()
      }
    }
  } catch {
    channel = null
  }

  return () => {
    window.removeEventListener('storage', onStorage)
    document.removeEventListener('visibilitychange', onVisible)
    window.removeEventListener('focus', run)
    try {
      channel?.close()
    } catch {
      // ignore
    }
  }
}
