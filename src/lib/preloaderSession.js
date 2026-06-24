const PRELOADER_SESSION_KEY = 'hw-travel-preloader-complete'

export function hasCompletedPreloaderThisSession() {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(PRELOADER_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function markPreloaderComplete() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(PRELOADER_SESSION_KEY, '1')
  } catch {
    // Private browsing / storage disabled — ignore.
  }
}
