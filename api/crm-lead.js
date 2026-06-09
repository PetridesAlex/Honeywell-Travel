/**
 * Server-side proxy: forwards website form leads to Travel Hub CRM.
 * Keeps CRM_AGENCY_API_KEY off the browser.
 */
const DEFAULT_CRM_URL = 'https://travel-hub-crm.vercel.app/api/leads/inbound'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.CRM_AGENCY_API_KEY
  const crmUrl = process.env.CRM_INBOUND_URL || DEFAULT_CRM_URL

  if (!apiKey) {
    return res.status(503).json({
      error: 'CRM sync is not configured. Add CRM_AGENCY_API_KEY in Vercel environment variables.',
    })
  }

  try {
    const response = await fetch(crmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Agency-Api-Key': apiKey,
      },
      body: JSON.stringify(req.body || {}),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || `CRM request failed (${response.status})`,
      })
    }

    return res.status(response.status).json(data)
  } catch (err) {
    return res.status(502).json({
      error: err.message || 'Failed to reach Travel Hub CRM.',
    })
  }
}
