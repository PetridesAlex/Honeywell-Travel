const EXPIRING_SOON_DAYS = 90

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
