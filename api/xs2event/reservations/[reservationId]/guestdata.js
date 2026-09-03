/**
 * GET/POST /api/xs2event/reservations/[reservationId]/guestdata
 * Proxies XS2Event reservation guest-data endpoints.
 */
import {
  xs2eventGet,
  xs2eventPost,
  sendXs2EventError,
  Xs2EventError,
} from '../../../_lib/xs2event.js'

const ALLOWED_GUEST_FIELDS = new Set([
  'first_name',
  'last_name',
  'passport_number',
  'contact_email',
  'contact_phone',
  'lead_guest',
  'date_of_birth',
  'gender',
  'country_of_residence',
  'street_name',
  'additional_street_name',
  'city',
  'zip',
  'province',
  'supported_team',
  'guest_id',
])

function sanitizeReservationId(value) {
  const id = String(value || '').trim()
  if (!/^[A-Za-z0-9_-]+$/.test(id) || id.length > 80) {
    throw new Xs2EventError('Invalid reservation_id.', 400, 'xs2event_invalid_reservation_id')
  }
  return id
}

function sanitizeGuest(guest) {
  if (!guest || typeof guest !== 'object') return {}
  const out = {}
  for (const [key, value] of Object.entries(guest)) {
    if (!ALLOWED_GUEST_FIELDS.has(key)) continue
    if (key === 'lead_guest') {
      out.lead_guest = Boolean(value)
      continue
    }
    if (value == null || value === '') continue
    out[key] = typeof value === 'string' ? value.trim() : value
  }
  return out
}

export default async function handler(req, res) {
  try {
    const reservationId = sanitizeReservationId(req.query.reservationId)

    if (req.method === 'GET') {
      const query = {}
      if (req.query.include_conditions === 'true' || req.query.include_conditions === true) {
        query.include_conditions = 'true'
      }
      if (req.query.country_hint) {
        query.country_hint = String(req.query.country_hint).trim().slice(0, 3).toUpperCase()
      }
      const data = await xs2eventGet(`/v1/reservations/${reservationId}/guestdata`, query)
      return res.status(200).json(data)
    }

    if (req.method === 'POST') {
      const body = req.body && typeof req.body === 'object' ? req.body : {}
      const itemsIn = Array.isArray(body.items) ? body.items : null
      if (!itemsIn || itemsIn.length === 0) {
        throw new Xs2EventError(
          'items with guest data are required.',
          400,
          'xs2event_invalid_guest_payload',
        )
      }

      const items = itemsIn.map((item) => {
        const ticketId = String(item?.ticket_id || '').trim()
        const quantity = Number(item?.quantity)
        const guests = Array.isArray(item?.guests) ? item.guests.map(sanitizeGuest) : []
        if (!ticketId) {
          throw new Xs2EventError('Each item requires ticket_id.', 400, 'xs2event_missing_ticket_id')
        }
        if (!Number.isInteger(quantity) || quantity < 1) {
          throw new Xs2EventError('Each item requires a valid quantity.', 400, 'xs2event_invalid_quantity')
        }
        // Some tickets require no guest fields (XS2Event returns guests: []).
        // Only reject when the client sent a guests array that is malformed empty
        // while claiming guest objects — allow empty guests to pass through.
        return { ticket_id: ticketId, quantity, guests }
      })

      const data = await xs2eventPost(`/v1/reservations/${reservationId}/guestdata`, { items })
      return res.status(200).json({ success: true, data })
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' })
  } catch (err) {
    return sendXs2EventError(res, err)
  }
}
