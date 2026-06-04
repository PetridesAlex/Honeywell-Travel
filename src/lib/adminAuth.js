import { supabase } from './supabase'

export const ADMIN_MAGIC_LINK_SUCCESS_MESSAGE =
  'Check your email for your secure login link.'

export const ADMIN_UNAUTHORIZED_MESSAGE = 'You are not authorized to access this CRM.'

export const ADMIN_DASHBOARD_PATH = '/admin/dashboard'
export const ADMIN_LOGIN_PATH = '/admin/login'

/** Production magic-link landing URL (must be allowlisted in Supabase Auth). */
export const ADMIN_MAGIC_LINK_REDIRECT = 'https://www.honeywelltravel.com.cy/admin/dashboard'

/** Redirect target for signInWithOtp — dev uses localhost, production uses www site. */
export function getAdminMagicLinkRedirectUrl() {
  const fromEnv = import.meta.env.VITE_ADMIN_AUTH_REDIRECT_URL?.trim()
  if (fromEnv) return fromEnv
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return `${window.location.origin}${ADMIN_DASHBOARD_PATH}`
  }
  return ADMIN_MAGIC_LINK_REDIRECT
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
    search.includes('code=')
  )
}

/** Remove OAuth tokens from the address bar after magic link sign-in. */
export function cleanAdminAuthUrlAfterLogin() {
  if (typeof window === 'undefined' || !hasAuthCallbackInUrl()) return

  const path = window.location.pathname
  const nextPath =
    path.startsWith('/admin') && path !== ADMIN_LOGIN_PATH ? path : ADMIN_DASHBOARD_PATH

  window.history.replaceState({}, document.title, nextPath)
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
