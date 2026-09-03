/**
 * GET /api/xs2event/events
 * Proxies allowlisted query params to XS2Event GET /v1/events.
 * When no date filter is provided, defaults date_stop=ge:today (UTC)
 * per XS2Event getting-started guidance for future events.
 */
import {
  xs2eventGet,
  pickAllowedQuery,
  sendXs2EventError,
  todayUtcDate,
  EVENTS_QUERY_ALLOWLIST,
} from '../_lib/xs2event.js'
import { decorateEventsWithSalesPrice, getXs2EventMarkupPercent } from '../_lib/xs2eventPricing.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  try {
    const params = pickAllowedQuery(req.query, EVENTS_QUERY_ALLOWLIST)

    const hasDateFilter =
      Boolean(params.date_start) ||
      Boolean(params.date_stop) ||
      Boolean(params.updated) ||
      Boolean(params.created)

    if (!hasDateFilter) {
      params.date_stop = `ge:${todayUtcDate()}`
    }

    const data = await xs2eventGet('/v1/events', params)
    const events = decorateEventsWithSalesPrice(data?.events)
    return res.status(200).json({
      ...data,
      events,
      honeywell_pricing: {
        markup_percent: getXs2EventMarkupPercent(),
      },
    })
  } catch (err) {
    return sendXs2EventError(res, err)
  }
}
