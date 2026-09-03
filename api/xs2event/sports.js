/**
 * GET /api/xs2event/sports
 * Proxies allowlisted query params to XS2Event GET /v1/sports.
 */
import {
  xs2eventGet,
  pickAllowedQuery,
  sendXs2EventError,
  SPORTS_QUERY_ALLOWLIST,
} from '../_lib/xs2event.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  try {
    const params = pickAllowedQuery(req.query, SPORTS_QUERY_ALLOWLIST)
    const data = await xs2eventGet('/v1/sports', params)
    return res.status(200).json(data)
  } catch (err) {
    return sendXs2EventError(res, err)
  }
}
