import { CRM_ADMIN_LOGIN_EMAIL, CRM_SENDER_EMAIL } from '../constants'

/**
 * Known admin emails → friendly first name (Welcome Back, {name} + sidebar).
 * Add new staff here when you create them in Supabase Auth.
 */
const DISPLAY_NAME_BY_EMAIL = {
  [CRM_ADMIN_LOGIN_EMAIL]: 'Alex',
  [CRM_SENDER_EMAIL]: 'Alex',
  'honey@gmail.com': 'Alex',
  'honeywelltravel1@asg.com.cy': 'Alex',
  'v.avraam@asg.com.cy': 'Valentina'
}

/** Fallback when only the email local-part is known */
const DISPLAY_NAME_BY_LOCAL = {
  petridesalexeu: 'Alex',
  honeywelltravel1: 'Alex',
  'v.avraam': 'Valentina',
  vavraam: 'Valentina'
}

function normalizeEmail(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function localPart(email) {
  return normalizeEmail(email).split('@')[0].replace(/[._+\-]/g, '')
}

function nameFromKnownMaps(email) {
  const normalized = normalizeEmail(email)
  if (!normalized) return null
  if (DISPLAY_NAME_BY_EMAIL[normalized]) return DISPLAY_NAME_BY_EMAIL[normalized]

  const local = normalized.split('@')[0]
  if (DISPLAY_NAME_BY_LOCAL[local]) return DISPLAY_NAME_BY_LOCAL[local]

  const compact = localPart(normalized)
  if (DISPLAY_NAME_BY_LOCAL[compact]) return DISPLAY_NAME_BY_LOCAL[compact]

  if (compact.includes('petrides') || compact.includes('alexeu')) return 'Alex'
  return null
}

/**
 * First name (or friendly label) for the signed-in admin user.
 */
export function getAdminDisplayName(user) {
  if (!user) return null

  const email = normalizeEmail(user.email)
  const envName = import.meta.env.VITE_CRM_ADMIN_DISPLAY_NAME?.trim()
  if (envName && email === CRM_ADMIN_LOGIN_EMAIL) {
    return envName
  }

  const fromEmail = nameFromKnownMaps(email)
  if (fromEmail) return fromEmail

  const identityEmails = (user.identities || [])
    .map((identity) => normalizeEmail(identity?.identity_data?.email || identity?.email))
    .filter(Boolean)

  for (const identityEmail of identityEmails) {
    const fromIdentity = nameFromKnownMaps(identityEmail)
    if (fromIdentity) return fromIdentity
  }

  const meta = user.user_metadata || {}
  const metaCandidates = [meta.display_name, meta.full_name, meta.name]
    .map((value) => String(value || '').trim())
    .filter(Boolean)

  for (const candidate of metaCandidates) {
    const compact = candidate.toLowerCase().replace(/[._+\-\s]/g, '')
    if (compact.includes('petrides') || compact.includes('alexeu')) return 'Alex'
    if (compact.includes('avraam') || compact.includes('valentina')) return 'Valentina'
  }

  if (meta.display_name) return String(meta.display_name).trim().split(/\s+/)[0]
  if (meta.full_name) return String(meta.full_name).trim().split(/\s+/)[0]
  if (meta.name) return String(meta.name).trim().split(/\s+/)[0]

  const local = email.split('@')[0]
  if (!local) return null

  return local.charAt(0).toUpperCase() + local.slice(1).replace(/[._-]/g, ' ')
}
