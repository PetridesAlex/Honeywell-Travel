import { supabase } from './supabase'

export const ADMIN_UNAUTHORIZED_MESSAGE = 'You are not authorized to access this CRM.'

export const ADMIN_DASHBOARD_PATH = '/admin/dashboard'
export const ADMIN_LOGIN_PATH = '/admin/login'

/** @deprecated Kept for redirect URL allowlists / recovery emails. */
export const ADMIN_AUTH_REDIRECT = 'https://www.honeywelltravel.com.cy/admin/dashboard'

export function getAdminAuthRedirectUrl() {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return `${window.location.origin}${ADMIN_DASHBOARD_PATH}`
  }
  const fromEnv = import.meta.env.VITE_ADMIN_AUTH_REDIRECT_URL?.trim()
  if (fromEnv) return fromEnv
  return ADMIN_AUTH_REDIRECT
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
 * Requires the explicit preview query param — never auto-preview when unauthenticated.
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
 * Auth callbacks (e.g. password recovery) must land on /admin/dashboard so Supabase
 * can restore the session and the CRM shell loads.
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

export function hasAuthCallbackInUrl() {
  if (typeof window === 'undefined') return false
  const hash = window.location.hash || ''
  const search = window.location.search || ''
  return (
    hash.includes('access_token') ||
    hash.includes('refresh_token') ||
    hash.includes('type=recovery') ||
    hash.includes('type=signup') ||
    search.includes('code=') ||
    search.includes('token_hash=')
  )
}

/** Remove auth tokens from the address bar after callback sign-in. */
export function cleanAdminAuthUrlAfterLogin() {
  if (typeof window === 'undefined' || !hasAuthCallbackInUrl()) return

  window.history.replaceState({}, document.title, ADMIN_DASHBOARD_PATH)
}

export function getPasswordAuthErrorMessage(error) {
  if (!error?.message) return 'Sign in failed. Please try again.'
  const msg = error.message.toLowerCase()
  const code = String(error.code || '').toLowerCase()

  if (
    msg.includes('invalid login credentials') ||
    msg.includes('invalid credentials') ||
    code === 'invalid_credentials'
  ) {
    return 'Invalid email or password.'
  }
  if (msg.includes('email not confirmed')) {
    return 'Email not confirmed. Confirm the user in Supabase Authentication → Users, or check your inbox.'
  }
  if (msg.includes('user not found') || msg.includes('no user')) {
    return ADMIN_UNAUTHORIZED_MESSAGE
  }
  if (msg.includes('captcha')) {
    return 'Login is blocked by captcha in Supabase. Disable captcha under Authentication → Attack Protection, then try again.'
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Too many requests. Please wait a few minutes and try again.'
  }
  if (msg.includes('not configured')) return error.message
  if (msg.includes('valid email')) return 'Please enter a valid email address.'
  return error.message
}

export function getSignUpErrorMessage(error) {
  if (!error?.message) return 'Could not create account. Please try again.'
  const msg = error.message.toLowerCase()
  if (msg.includes('already registered') || msg.includes('already been registered')) {
    return 'An account with this email already exists. Sign in instead.'
  }
  if (msg.includes('password') && (msg.includes('least') || msg.includes('weak') || msg.includes('short'))) {
    return 'Password is too weak. Use at least 6 characters.'
  }
  if (msg.includes('captcha')) {
    return 'Signup is blocked by captcha in Supabase. Disable captcha under Authentication → Attack Protection.'
  }
  if (msg.includes('not configured')) return error.message
  return error.message
}

export async function signInAdminWithPassword(email, password) {
  const normalized = String(email || '')
    .trim()
    .toLowerCase()
  const passwordValue = String(password || '')

  if (!normalized) {
    return { data: null, error: { message: 'Please enter your email address.' } }
  }
  if (!passwordValue) {
    return { data: null, error: { message: 'Please enter your password.' } }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalized,
    password: passwordValue
  })

  return { data, error }
}

export async function signUpAdmin(email, password) {
  const normalized = String(email || '')
    .trim()
    .toLowerCase()
  const passwordValue = String(password || '')

  if (!normalized) {
    return { data: null, error: { message: 'Please enter your email address.' } }
  }
  if (!passwordValue) {
    return { data: null, error: { message: 'Please enter a password.' } }
  }
  if (passwordValue.length < 6) {
    return { data: null, error: { message: 'Password must be at least 6 characters.' } }
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalized,
    password: passwordValue,
    options: {
      emailRedirectTo: getAdminAuthRedirectUrl()
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
