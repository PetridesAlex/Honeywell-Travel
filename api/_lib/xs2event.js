/**
 * Server-only XS2Event API client.
 * Never import this from browser/src code. Never log or return the API key.
 */

export class Xs2EventError extends Error {
  constructor(message, status = 502, code = 'xs2event_error') {
    super(message)
    this.name = 'Xs2EventError'
    this.status = status
    this.code = code
  }
}

function getConfig() {
  const apiUrl = (process.env.XS2EVENT_API_URL || '').trim().replace(/\/$/, '')
  const apiKey = (process.env.XS2EVENT_API_KEY || '').trim()

  if (!apiUrl || !apiKey) {
    throw new Xs2EventError(
      'XS2Event is not configured. Add XS2EVENT_API_URL and XS2EVENT_API_KEY on the server.',
      503,
      'xs2event_not_configured',
    )
  }

  return { apiUrl, apiKey }
}

/**
 * Pick only allowlisted query keys from an incoming query object.
 * @param {Record<string, unknown>} query
 * @param {string[]} allowlist
 * @returns {Record<string, string>}
 */
export function pickAllowedQuery(query, allowlist) {
  const source = query && typeof query === 'object' ? query : {}
  const out = {}
  for (const key of allowlist) {
    const value = source[key]
    if (value == null) continue
    if (Array.isArray(value)) {
      const first = value.find((item) => item != null && String(item).trim() !== '')
      if (first != null) out[key] = String(first)
      continue
    }
    const asString = String(value).trim()
    if (asString !== '') out[key] = asString
  }
  return out
}

function mapUpstreamStatus(status) {
  if (status === 401) {
    return {
      status: 401,
      message: 'XS2Event rejected the API credentials.',
      code: 'xs2event_unauthorized',
    }
  }
  if (status === 403) {
    return {
      status: 403,
      message: 'XS2Event denied access to this resource.',
      code: 'xs2event_forbidden',
    }
  }
  if (status === 404) {
    return {
      status: 404,
      message: 'XS2Event resource was not found.',
      code: 'xs2event_not_found',
    }
  }
  if (status === 400 || status === 422) {
    return {
      status: status === 400 ? 400 : 422,
      message: 'XS2Event rejected the request parameters.',
      code: 'xs2event_invalid_params',
    }
  }
  if (status === 429) {
    return {
      status: 429,
      message: 'XS2Event rate limit exceeded. Please try again later.',
      code: 'xs2event_rate_limited',
    }
  }
  if (status >= 500) {
    return {
      status: 502,
      message: 'Unable to communicate with XS2Event.',
      code: 'xs2event_upstream_error',
    }
  }
  return {
    status: 502,
    message: 'Unable to communicate with XS2Event.',
    code: 'xs2event_upstream_error',
  }
}

/**
 * Request a path on the XS2Event API (path should start with /v1/...).
 * @param {string} method
 * @param {string} path
 * @param {{ query?: Record<string, string>, body?: unknown }} [options]
 * @returns {Promise<unknown>}
 */
export async function xs2eventRequest(method, path, options = {}) {
  const { apiUrl, apiKey } = getConfig()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${apiUrl}${normalizedPath}`)

  for (const [key, value] of Object.entries(options.query || {})) {
    if (value != null && String(value).trim() !== '') {
      url.searchParams.set(key, String(value))
    }
  }

  const headers = {
    'X-Api-Key': apiKey,
    Accept: 'application/json',
  }

  const init = { method: method.toUpperCase(), headers }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(options.body)
  }

  let response
  try {
    response = await fetch(url.toString(), init)
  } catch {
    throw new Xs2EventError(
      'Unable to reach XS2Event. Check network connectivity and XS2EVENT_API_URL.',
      502,
      'xs2event_network_error',
    )
  }

  const rawText = await response.text()
  let data = null
  if (rawText) {
    try {
      data = JSON.parse(rawText)
    } catch {
      if (response.ok || response.status === 201) {
        throw new Xs2EventError(
          'XS2Event returned an invalid JSON response.',
          502,
          'xs2event_invalid_json',
        )
      }
    }
  }

  if (!response.ok && response.status !== 201) {
    const mapped = mapUpstreamStatus(response.status)
    const detail =
      (data && (data.message || data.title || data.detail)) ||
      mapped.message
    throw new Xs2EventError(String(detail), mapped.status, mapped.code)
  }

  return data
}

/**
 * GET a path on the XS2Event API (path should start with /v1/...).
 * @param {string} path
 * @param {Record<string, string>} [queryParams]
 * @returns {Promise<unknown>}
 */
export async function xs2eventGet(path, queryParams = {}) {
  return xs2eventRequest('GET', path, { query: queryParams })
}

/**
 * POST JSON to the XS2Event API.
 * @param {string} path
 * @param {unknown} body
 * @returns {Promise<unknown>}
 */
export async function xs2eventPost(path, body) {
  return xs2eventRequest('POST', path, { body })
}

/**
 * Send a safe JSON error for Honeywell API handlers.
 */
export function sendXs2EventError(res, err) {
  if (err instanceof Xs2EventError) {
    const payload = {
      success: false,
      message: err.message,
      code: err.code,
    }
    return res.status(err.status).json(payload)
  }

  return res.status(500).json({
    success: false,
    message: 'Unable to communicate with XS2Event',
    code: 'xs2event_unexpected_error',
  })
}

export const SPORTS_QUERY_ALLOWLIST = ['sorting', 'page_size', 'page']

export const EVENTS_QUERY_ALLOWLIST = [
  'sorting',
  'page_size',
  'page',
  'sport_type',
  'tournament_type',
  'date_start',
  'date_stop',
  'venue_id',
  'event_id',
  'tournament_id',
  'team_id',
  'hometeam_id',
  'visitingteam_id',
  'city',
  'location_id',
  'event_status',
  'country',
  'event_name',
  'tournament_name',
  'tickets_available',
  'booked',
  'popular_events',
  'ticket_price_eur',
  'slug',
  'accept_language',
  'season',
  'updated',
  'created',
]

/** Official GET /v1/tickets query params (playground). */
export const TICKETS_QUERY_ALLOWLIST = [
  'sorting',
  'page_size',
  'page',
  'ticket_validfrom',
  'ticket_validuntil',
  'face_value',
  'stock',
  'venue_id',
  'event_id',
  'ticket_id',
  'ticket_type',
  'ticket_status',
  'city',
  'supplier_type',
  'supplier_id',
  'organiser_id',
  'category_id',
  'sport_type',
  'tournament_id',
  'sub_category',
  'category_type',
  'show_deleted',
  'ticket_validity',
  'vat_category',
  'updated',
  'created',
  'include_youth',
]

/** Today UTC as YYYY-MM-DD for XS2Event ge: date filters. */
export function todayUtcDate() {
  return new Date().toISOString().slice(0, 10)
}
