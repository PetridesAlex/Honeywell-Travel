import {
  getSupabaseAdmin,
  loadTokenContext,
  sanitizeCampaignForPublic,
  sanitizeQuestionsForPublic,
} from './feedbackShared.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = String(req.query?.token || '').trim()
  if (!token) {
    return res.status(400).json({ error: 'Token is required.' })
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return res.status(503).json({ error: 'Service unavailable.' })
  }

  const ctx = await loadTokenContext(supabase, token)
  if (!ctx.ok) {
    const messages = {
      missing: 'This feedback link is invalid.',
      invalid: 'This feedback link is invalid.',
      inactive: 'This feedback link is no longer active.',
      expired: 'This feedback link has expired.',
      closed: 'This feedback campaign is closed.',
      error: 'Unable to load feedback form.',
    }
    return res.status(404).json({ error: messages[ctx.reason] || messages.invalid })
  }

  return res.status(200).json({
    ok: true,
    campaign: sanitizeCampaignForPublic(ctx.campaign),
    questions: sanitizeQuestionsForPublic(ctx.questions),
  })
}
