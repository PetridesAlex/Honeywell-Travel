import { CRM_ADMIN_LOGIN_EMAIL } from '../constants'

/** Known admin emails → friendly first name shown in sidebar */
const DISPLAY_NAME_BY_EMAIL = {
  [CRM_ADMIN_LOGIN_EMAIL]: 'Alex',
  'honey@gmail.com': 'Alex',
  'honeywelltravel1@asg.com.cy': 'Alex'
}

/**
 * First name (or friendly label) for the signed-in admin user.
 */
export function getAdminDisplayName(user) {
  if (!user) return null

  const email = String(user.email || '')
    .trim()
    .toLowerCase()

  const envName = import.meta.env.VITE_CRM_ADMIN_DISPLAY_NAME?.trim()
  if (envName && email === CRM_ADMIN_LOGIN_EMAIL) {
    return envName
  }

  if (DISPLAY_NAME_BY_EMAIL[email]) {
    return DISPLAY_NAME_BY_EMAIL[email]
  }

  const meta = user.user_metadata || {}
  if (meta.display_name) return String(meta.display_name).trim()
  if (meta.full_name) return String(meta.full_name).trim().split(/\s+/)[0]
  if (meta.name) return String(meta.name).trim().split(/\s+/)[0]

  const local = email.split('@')[0]
  if (!local) return null

  return local.charAt(0).toUpperCase() + local.slice(1).replace(/[._-]/g, ' ')
}
