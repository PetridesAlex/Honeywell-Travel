/** Helpers for XS2Event browse UI (amounts are typically minor units / cents). */

/**
 * XS2Event lists parent sport ids that often have 0 events while sibling ids do
 * (e.g. motorsport vs formula1/motogp). Expand so browse covers related catalogs.
 */
const SPORT_TYPE_ALIASES = {
  motorsport: ['motorsport', 'formula1', 'motogp', 'dtm', 'superbike'],
  formula1: ['formula1'],
  motogp: ['motogp'],
  basketball: ['basketball', 'nba'],
  nba: ['nba', 'basketball'],
  combatsport: ['combatsport', 'boxing'],
  boxing: ['boxing', 'combatsport'],
  // XS2Event treats soccer/football as the same event catalog.
  soccer: ['soccer'],
  football: ['soccer'],
}

export function expandSportTypes(sportId) {
  const id = String(sportId || '').trim().toLowerCase()
  if (!id) return []
  const list = SPORT_TYPE_ALIASES[id] || [id]
  return [...new Set(list)]
}

export function formatSportLabel(sportId) {
  if (!sportId) return ''
  return String(sportId)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatEventWhen(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return String(iso)
  return date.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** XS2Event monetary fields are usually in cents. */
export function formatXs2Money(amount, currency = 'EUR') {
  if (amount == null || amount === '') return null
  const n = Number(amount)
  if (!Number.isFinite(n)) return null
  const value = Math.abs(n) >= 1000 ? n / 100 : n
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `€${value.toFixed(2)}`
  }
}

export function ticketDisplayPrice(ticket) {
  const local = ticket?.local_rates || {}
  return (
    formatXs2Money(local.face_value_eur ?? ticket?.face_value_eur ?? local.net_rate_eur ?? ticket?.net_rate_eur) ||
    formatXs2Money(ticket?.face_value ?? ticket?.net_rate) ||
    null
  )
}

/**
 * Group tickets by category + sub_category (XS2Event getting-started guidance).
 * Picks the cheapest available option in each group for list display.
 */
export function groupTicketsForDisplay(tickets = []) {
  const map = new Map()

  for (const ticket of tickets) {
    if (!ticket) continue
    const key = [
      ticket.category_id || ticket.category_name || 'unknown',
      ticket.sub_category || 'default',
    ].join('::')

    const price = Number(ticket.face_value_eur ?? ticket.net_rate_eur ?? ticket.face_value ?? ticket.net_rate ?? Infinity)
    const existing = map.get(key)
    if (!existing || price < existing.price) {
      map.set(key, { key, ticket, price, options: existing ? existing.options + 1 : 1 })
    } else {
      existing.options += 1
    }
  }

  return [...map.values()].sort((a, b) => a.price - b.price)
}
