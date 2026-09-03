/**
 * GET /api/xs2event/tickets
 * Proxies allowlisted query params to XS2Event GET /v1/tickets.
 * Requires event_id (official tickets endpoint is event-scoped).
 */
import {
  xs2eventGet,
  pickAllowedQuery,
  sendXs2EventError,
  Xs2EventError,
  TICKETS_QUERY_ALLOWLIST,
} from '../_lib/xs2event.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  try {
    const params = pickAllowedQuery(req.query, TICKETS_QUERY_ALLOWLIST)

    if (!params.event_id) {
      throw new Xs2EventError(
        'event_id is required to fetch tickets.',
        400,
        'xs2event_missing_event_id',
      )
    }

    if (!params.ticket_status) {
      params.ticket_status = 'available'
    }

    const data = await xs2eventGet('/v1/tickets', params)
    return res.status(200).json(data)
  } catch (err) {
    return sendXs2EventError(res, err)
  }
}
