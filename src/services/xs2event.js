/**
 * Browser-safe XS2Event client.
 * Talks only to Honeywell /api/xs2event/* — never holds the XS2Event API key.
 */

/**
 * @typedef {object} Xs2EventSport
 * @property {string} [sport_id]
 */

/**
 * @typedef {object} Xs2EventPagination
 * @property {number} [total_size]
 * @property {number} [page_size]
 * @property {number} [page_number]
 * @property {string} [next_page]
 * @property {string} [previous_page]
 */

/**
 * @typedef {object} Xs2EventSportsResponse
 * @property {Xs2EventSport[]} [sports]
 * @property {Xs2EventPagination} [pagination]
 */

/**
 * @typedef {object} Xs2EventConnectionTestResponse
 * @property {boolean} success
 * @property {string} [environment]
 * @property {string} [message]
 * @property {string} [code]
 * @property {Xs2EventSportsResponse} [data]
 */

/**
 * @param {Record<string, string | number | boolean | undefined | null>} [params]
 * @returns {string}
 */
function toQueryString(params = {}) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '') continue
    search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

/**
 * @param {string} path
 * @param {Record<string, string | number | boolean | undefined | null>} [params]
 */
async function honeywellXs2Fetch(path, params) {
  const response = await fetch(`${path}${toQueryString(params)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const error = new Error(
      'Sports tickets API is not reachable. Run `npm run dev:api` (keep it running), then use that URL — or keep Vite on :5173 with the API proxy after restarting `npm run dev`.',
    )
    error.status = response.status
    error.code = 'xs2event_api_unreachable'
    throw error
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Honeywell XS2Event proxy failed (${response.status})`
    const error = new Error(message)
    error.status = response.status
    error.code = data?.code
    error.payload = data
    throw error
  }

  return data
}

/** @returns {Promise<Xs2EventConnectionTestResponse>} */
export function getConnectionTest() {
  return honeywellXs2Fetch('/api/xs2event/test')
}

/**
 * @param {Record<string, string | number | boolean | undefined | null>} [params]
 * @returns {Promise<Xs2EventSportsResponse>}
 */
export function getSports(params) {
  return honeywellXs2Fetch('/api/xs2event/sports', params)
}

/**
 * @param {Record<string, string | number | boolean | undefined | null>} [params]
 * @returns {Promise<object>}
 */
export function getEvents(params) {
  return honeywellXs2Fetch('/api/xs2event/events', params)
}

/**
 * Fetch every events page for the given filters (XS2Event default page cap is low).
 * @param {Record<string, string | number | boolean | undefined | null>} [params]
 * @param {{ maxPages?: number, pageSize?: number }} [options]
 * @returns {Promise<{ events: object[], pagination: Xs2EventPagination | null, pagesFetched: number }>}
 */
export async function getEventsAllPages(params = {}, options = {}) {
  const pageSize = Math.min(Number(options.pageSize) || 100, 100)
  const maxPages = Math.min(Number(options.maxPages) || 20, 50)
  const events = []
  let pagination = null
  let page = 1

  while (page <= maxPages) {
    const data = await getEvents({ ...params, page_size: pageSize, page })
    const batch = Array.isArray(data?.events) ? data.events : []
    events.push(...batch)
    pagination = data?.pagination || null
    const total = Number(pagination?.total_size)
    const hasNext = Boolean(pagination?.next_page) || (Number.isFinite(total) && events.length < total)
    if (!hasNext || batch.length === 0) break
    page += 1
  }

  return { events, pagination, pagesFetched: page }
}

/**
 * Lightweight total from pagination (one request).
 * @param {Record<string, string | number | boolean | undefined | null>} [params]
 * @returns {Promise<number>}
 */
export async function getEventsTotal(params = {}) {
  const data = await getEvents({ ...params, page_size: 1, page: 1 })
  const total = Number(data?.pagination?.total_size)
  if (Number.isFinite(total)) return total
  return Array.isArray(data?.events) ? data.events.length : 0
}

/**
 * @param {Record<string, string | number | boolean | undefined | null>} [params]
 * @returns {Promise<object>}
 */
export function getTickets(params) {
  return honeywellXs2Fetch('/api/xs2event/tickets', params)
}

/**
 * @param {Record<string, string | number | boolean | undefined | null>} [params]
 * @param {{ maxPages?: number, pageSize?: number }} [options]
 */
export async function getTicketsAllPages(params = {}, options = {}) {
  const pageSize = Math.min(Number(options.pageSize) || 100, 100)
  const maxPages = Math.min(Number(options.maxPages) || 10, 30)
  const tickets = []
  let page = 1

  while (page <= maxPages) {
    const data = await getTickets({ ...params, page_size: pageSize, page })
    const batch = Array.isArray(data?.tickets) ? data.tickets : []
    tickets.push(...batch)
    const pagination = data?.pagination || null
    const total = Number(pagination?.total_size)
    const hasNext = Boolean(pagination?.next_page) || (Number.isFinite(total) && tickets.length < total)
    if (!hasNext || batch.length === 0) break
    page += 1
  }

  return tickets
}

/**
 * Create a temporary XS2Event reservation (hold). No payment / booking.
 * @param {{ ticket_id: string, quantity: number, booking_email: string, notes?: string }} payload
 */
export async function createReservation(payload) {
  const response = await fetch('/api/xs2event/reservations', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Reservation failed (${response.status})`
    const error = new Error(message)
    error.status = response.status
    error.code = data?.code
    error.payload = data
    throw error
  }

  return data
}

export const RESERVATION_SESSION_KEY = 'honeywell_xs2event_last_reservation'

export function storeReservationSession(payload) {
  try {
    sessionStorage.setItem(RESERVATION_SESSION_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota / private mode
  }
}

export function readReservationSession() {
  try {
    const raw = sessionStorage.getItem(RESERVATION_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const BOOKING_SESSION_KEY = 'honeywell_xs2event_last_booking'

export function storeBookingSession(payload) {
  try {
    sessionStorage.setItem(BOOKING_SESSION_KEY, JSON.stringify(payload))
  } catch {
    // ignore
  }
}

export function readBookingSession() {
  try {
    const raw = sessionStorage.getItem(BOOKING_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

async function honeywellXs2Json(path, { method = 'GET', body, params } = {}) {
  const url = `${path}${params ? (() => {
    const search = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value == null || value === '') continue
      search.set(key, String(value))
    }
    const qs = search.toString()
    return qs ? `?${qs}` : ''
  })() : ''}`

  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const error = new Error(
      'Sports tickets API is not reachable. Run `npm run dev:api` and use that server (or Vite with API proxy).',
    )
    error.status = response.status
    error.code = 'xs2event_api_unreachable'
    throw error
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Honeywell XS2Event proxy failed (${response.status})`
    const error = new Error(message)
    error.status = response.status
    error.code = data?.code
    error.payload = data
    throw error
  }

  return data
}

export function getReservationGuestData(reservationId, params) {
  return honeywellXs2Json(
    `/api/xs2event/reservations/${encodeURIComponent(reservationId)}/guestdata`,
    { params },
  )
}

export function saveReservationGuestData(reservationId, payload) {
  return honeywellXs2Json(
    `/api/xs2event/reservations/${encodeURIComponent(reservationId)}/guestdata`,
    { method: 'POST', body: payload },
  )
}

export function createBooking(payload) {
  return honeywellXs2Json('/api/xs2event/bookings', { method: 'POST', body: payload })
}
