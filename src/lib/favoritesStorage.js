const STORAGE_KEY = 'hw_favorite_packages'
const CHANGE_EVENT = 'hw-favorites-change'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function normalizeId(id) {
  if (id == null) return null
  const value = String(id).trim()
  return value || null
}

export function readFavoriteIds() {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return [...new Set(parsed.map(normalizeId).filter(Boolean))]
  } catch {
    return []
  }
}

export function writeFavoriteIds(ids) {
  if (!canUseStorage()) return []
  const next = [...new Set((ids || []).map(normalizeId).filter(Boolean))]
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore quota / private mode
  }
  try {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { ids: next } }))
  } catch {
    // ignore
  }
  return next
}

export function isFavoriteId(id, ids = readFavoriteIds()) {
  const key = normalizeId(id)
  if (!key) return false
  return ids.includes(key)
}

export function toggleFavoriteId(id) {
  const key = normalizeId(id)
  if (!key) return readFavoriteIds()
  const current = readFavoriteIds()
  const next = current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
  return writeFavoriteIds(next)
}

export function removeFavoriteId(id) {
  const key = normalizeId(id)
  if (!key) return readFavoriteIds()
  return writeFavoriteIds(readFavoriteIds().filter((item) => item !== key))
}

export function clearFavoriteIds() {
  return writeFavoriteIds([])
}

export function subscribeFavoriteIds(listener) {
  if (typeof window === 'undefined') return () => {}

  const onCustom = (event) => {
    listener(event?.detail?.ids || readFavoriteIds())
  }
  const onStorage = (event) => {
    if (event.key === STORAGE_KEY || event.key == null) {
      listener(readFavoriteIds())
    }
  }

  window.addEventListener(CHANGE_EVENT, onCustom)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onCustom)
    window.removeEventListener('storage', onStorage)
  }
}
