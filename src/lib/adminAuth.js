import { supabase } from './supabase'

export const ADMIN_MAGIC_LINK_SUCCESS_MESSAGE =
  'Check your email for your secure login link.'

export const ADMIN_MAGIC_LINK_SUCCESS_MESSAGE_DEV =
  'Link sent. In Outlook: right-click the login button → Copy link. Paste it below to open logged in inside Cursor (do not open in Safari).'

export const ADMIN_UNAUTHORIZED_MESSAGE = 'You are not authorized to access this CRM.'

export const ADMIN_DASHBOARD_PATH = '/admin/dashboard'
export const ADMIN_LOGIN_PATH = '/admin/login'

/** Production magic-link landing URL (must be allowlisted in Supabase Auth). */
export const ADMIN_MAGIC_LINK_REDIRECT = 'https://www.honeywelltravel.com.cy/admin/dashboard'

/** Redirect target for signInWithOtp — local dev always returns to this machine (Cursor / localhost). */
export function getAdminMagicLinkRedirectUrl() {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return `${window.location.origin}${ADMIN_DASHBOARD_PATH}`
  }
  const fromEnv = import.meta.env.VITE_ADMIN_AUTH_REDIRECT_URL?.trim()
  if (fromEnv) return fromEnv
  return ADMIN_MAGIC_LINK_REDIRECT
}

/** Dev-only: browse CRM in Cursor without login (`?preview=dev`). Not available in production builds. */
export const ADMIN_CRM_PREVIEW_PARAM = 'preview'

export function isCrmUiPreviewMode(search = '') {
  if (!import.meta.env.DEV) return false
  const query =
    search ||
    (typeof window !== 'undefined' ? window.location.search.replace(/^\?/, '') : '')
  return new URLSearchParams(query).get(ADMIN_CRM_PREVIEW_PARAM) === 'dev'
}

/**
 * Dev-only layout preview: open /admin/dashboard?preview=dev in Cursor without login.
 * Requires the explicit preview query param — never auto-preview when unauthenticated,
 * so magic-link login is not confused with a fake logged-in shell.
 */
export function shouldUseCrmDesignPreview({
  search = '',
  authReady = false,
  authed = false
} = {}) {
  if (!import.meta.env.DEV) return false
  if (hasAuthCallbackInUrl()) return false
  if (authed) return false
  return isCrmUiPreviewMode(search)
}

export function getCrmPreviewSearch(search = '') {
  return isCrmUiPreviewMode(search) ? '?preview=dev' : ''
}

export function withCrmPreviewPath(path, search = '') {
  const suffix = getCrmPreviewSearch(search)
  return suffix ? `${path}${suffix}` : path
}

export const CRM_DEV_PREVIEW_DASHBOARD = ADMIN_DASHBOARD_PATH

export function getLocalAdminDashboardUrl() {
  if (typeof window === 'undefined') return ADMIN_DASHBOARD_PATH
  return `${window.location.origin}${ADMIN_DASHBOARD_PATH}`
}

/**
 * Magic-link callbacks must land on /admin/dashboard so Supabase can restore the session
 * and the CRM shell loads (not the login page).
 */
export function ensureAuthCallbackLandsOnDashboard() {
  if (typeof window === 'undefined' || !hasAuthCallbackInUrl()) return false
  if (window.location.pathname === ADMIN_DASHBOARD_PATH) return false
  if (!window.location.pathname.startsWith('/admin')) return false

  window.location.replace(
    `${getLocalAdminDashboardUrl()}${window.location.search}${window.location.hash}`
  )
  return true
}

/** Dev helper: paste magic link from email and stay in Cursor (rewrites www → localhost when needed). */
export function resolveDevMagicLinkUrl(raw) {
  const trimmed = String(raw || '').trim()
  if (!trimmed || !import.meta.env.DEV) return null

  try {
    const url = new URL(trimmed)
    const isSupabaseVerify =
      url.hostname.includes('supabase.co') &&
      (url.pathname.includes('/auth/v1/verify') || url.pathname.includes('/auth/v1/confirm'))
    const isAppCallback =
      url.hash.includes('access_token') ||
      url.hash.includes('type=magiclink') ||
      url.search.includes('code=') ||
      url.search.includes('token_hash=')

    if (!isSupabaseVerify && !isAppCallback) return null

    if (typeof window === 'undefined') return trimmed

    const localDashboard = getLocalAdminDashboardUrl()

    if (isSupabaseVerify) {
      url.searchParams.set('redirect_to', localDashboard)
      return url.toString()
    }

    if (url.origin !== window.location.origin && url.pathname.startsWith('/admin')) {
      const path = url.pathname === ADMIN_LOGIN_PATH ? ADMIN_DASHBOARD_PATH : url.pathname
      return `${window.location.origin}${path}${url.search}${url.hash}`
    }

    if (isAppCallback && url.pathname !== ADMIN_DASHBOARD_PATH) {
      return `${localDashboard}${url.search}${url.hash}`
    }

    return trimmed
  } catch {
    return null
  }
}

export function hasAuthCallbackInUrl() {
  if (typeof window === 'undefined') return false
  const hash = window.location.hash || ''
  const search = window.location.search || ''
  return (
    hash.includes('access_token') ||
    hash.includes('refresh_token') ||
    hash.includes('type=magiclink') ||
    hash.includes('type=recovery') ||
    search.includes('code=') ||
    search.includes('token_hash=')
  )
}

/** Remove OAuth tokens from the address bar after magic link sign-in. */
export function cleanAdminAuthUrlAfterLogin() {
  if (typeof window === 'undefined' || !hasAuthCallbackInUrl()) return

  window.history.replaceState({}, document.title, ADMIN_DASHBOARD_PATH)
}

export function isUnauthorizedOtpError(error) {
  if (!error) return false
  const msg = `${error.message || ''} ${error.code || ''}`.toLowerCase()
  return (
    msg.includes('signup') ||
    msg.includes('sign up') ||
    msg.includes('not allowed') ||
    msg.includes('user not found') ||
    msg.includes('no user') ||
    (msg.includes('invalid') && msg.includes('email')) ||
    error.code === 'otp_disabled' ||
    error.status === 403
  )
}

export function getMagicLinkErrorMessage(error) {
  if (!error?.message) return 'Could not send login link. Please try again.'
  if (isUnauthorizedOtpError(error)) return ADMIN_UNAUTHORIZED_MESSAGE
  const msg = error.message.toLowerCase()
  if (msg.includes('captcha')) {
    return 'Please complete the security check below, then try again.'
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Too many requests. Please wait a few minutes and try again.'
  }
  if (msg.includes('not configured')) return error.message
  if (msg.includes('valid email')) return 'Please enter a valid email address.'
  return error.message
}

export async function sendAdminMagicLink(email, captchaToken) {
  const normalized = String(email || '')
    .trim()
    .toLowerCase()

  if (!normalized) {
    return { error: { message: 'Please enter your email address.' } }
  }

  if (!captchaToken) {
    return { error: { message: 'Please complete the security check before continuing.' } }
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    email: normalized,
    options: {
      captchaToken,
      shouldCreateUser: false,
      emailRedirectTo: getAdminMagicLinkRedirectUrl()
    }
  })

  return { data, error }
}

export async function getAdminSession() {
  const { data, error } = await supabase.auth.getSession()
  return { session: data?.session ?? null, error }
}

export async function signOutAdmin() {
  return supabase.auth.signOut()
}
