/**
 * GET /api/xs2event/test
 * Verifies Honeywell ↔ XS2Event TEST API connectivity via /v1/sports.
 */
import {
  xs2eventGet,
  sendXs2EventError,
} from '../_lib/xs2event.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  try {
    const data = await xs2eventGet('/v1/sports', { page_size: '10', page: '1' })
    const apiUrl = (process.env.XS2EVENT_API_URL || '').toLowerCase()
    const environment = apiUrl.includes('testapi') ? 'test' : 'production'
    return res.status(200).json({
      success: true,
      environment,
      message: 'XS2Event API connected successfully',
      data,
    })
  } catch (err) {
    return sendXs2EventError(res, err)
  }
}
