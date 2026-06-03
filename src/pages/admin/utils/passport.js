const EXPIRING_SOON_DAYS = 90
const WARNING_12_MONTHS_DAYS = 365
const WARNING_6_MONTHS_DAYS = 180

export function getPassportStatus(expiresOn) {
  if (!expiresOn) return 'missing'

  const today = new Date()
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const expiry = new Date(expiresOn)
  const expiryMidnight = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate())

  if (expiryMidnight < todayMidnight) return 'expired'

  const soon = new Date(todayMidnight)
  soon.setDate(soon.getDate() + EXPIRING_SOON_DAYS)
  if (expiryMidnight <= soon) return 'expiring_soon'

  return 'valid'
}

export function maskPassportNumber(number) {
  const value = String(number || '').trim()
  if (!value) return '—'
  if (value.length <= 4) return value
  return `•••• ${value.slice(-4)}`
}

export const PASSPORT_STATUS_LABELS = {
  valid: 'Valid',
  expiring_soon: 'Expiring soon',
  expired: 'Expired',
  missing: 'No passport on file'
}

export const PASSPORT_STATUS_SHORT_LABELS = {
  valid: 'Valid',
  expiring_soon: 'Expiring',
  expired: 'Expired',
  missing: 'Missing'
}

export function getDaysUntilExpiry(expiresOn) {
  if (!expiresOn) return null
  const today = new Date()
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const expiry = new Date(expiresOn)
  const expiryMidnight = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate())
  return Math.ceil((expiryMidnight - todayMidnight) / (1000 * 60 * 60 * 24))
}

/** CRM warnings: 6 months (critical), 12 months (caution). */
export function getPassportExpiryWarning(expiresOn) {
  const days = getDaysUntilExpiry(expiresOn)
  if (days === null) return null
  if (days < 0) {
    return { level: 'critical', code: 'expired', message: 'Passport has expired' }
  }
  if (days <= WARNING_6_MONTHS_DAYS) {
    return {
      level: 'critical',
      code: 'expires_6m',
      message: 'Passport expires within 6 months'
    }
  }
  if (days <= WARNING_12_MONTHS_DAYS) {
    return {
      level: 'caution',
      code: 'expires_12m',
      message: 'Passport expires within 12 months'
    }
  }
  return null
}
