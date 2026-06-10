const parseDateTokenList = (value) => {
  if (!value || typeof value !== 'string') return []
  return String(value)
    .split(/[,\n;]+/)
    .map((part) => part.trim())
    .filter((part) => part && part !== '—' && part !== '-')
}

/** Parse DD/MM or DD/MM/YYYY into a Date at local midnight. Rolls to next year if date has passed. */
export function parseDepartureDateString(dateStr, now = new Date()) {
  const m = String(dateStr)
    .trim()
    .match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/)
  if (!m) return null

  const day = parseInt(m[1], 10)
  const month = parseInt(m[2], 10)
  if (month < 1 || month > 12 || day < 1 || day > 31) return null

  let year = m[3] ? parseInt(m[3], 10) : now.getFullYear()
  if (year < 100) year += 2000

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let candidate = new Date(year, month - 1, day)

  if (!m[3] && candidate < startOfToday) {
    candidate = new Date(year + 1, month - 1, day)
  }

  return candidate
}

const collectDepartureDateStrings = (details) => {
  const strings = []

  if (details?.departureDate) {
    strings.push(...parseDateTokenList(details.departureDate))
  }
  if (Array.isArray(details?.departureDates)) {
    strings.push(...details.departureDates.filter(Boolean))
  }

  const outboundFlight = (details?.flights || []).find((flight) =>
    /^departure/i.test(String(flight?.direction || ''))
  )
  if (outboundFlight?.date) {
    strings.push(...parseDateTokenList(outboundFlight.date))
  }

  const year = details?.departureYear
  if (year) {
    return strings.map((token) => {
      if (/\d{4}$/.test(token) || /\/(\d{4})$/.test(token)) return token
      return `${token}/${year}`
    })
  }

  return strings
}

/**
 * Days until the nearest upcoming departure for a package.
 * Returns null when no valid future date or countdown is disabled.
 */
export function getPackageDepartureCountdown(pkg, now = new Date()) {
  const details = pkg?.details
  if (!details || details.showDepartureCountdown !== true) return null

  const strings = collectDepartureDateStrings(details)
  if (strings.length === 0) return null

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const upcoming = strings
    .map((token) => parseDepartureDateString(token, now))
    .filter(Boolean)
    .filter((date) => date >= startOfToday)
    .sort((a, b) => a - b)

  if (upcoming.length === 0) return null

  const target = upcoming[0]
  const days = Math.round((target - startOfToday) / 86400000)
  if (days < 0) return null

  const day = String(target.getDate()).padStart(2, '0')
  const month = String(target.getMonth() + 1).padStart(2, '0')
  const year = target.getFullYear()

  return {
    days,
    dateIso: target.toISOString(),
    dateLabel: `${day}/${month}/${year}`
  }
}
