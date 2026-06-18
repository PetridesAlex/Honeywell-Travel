/**
 * Shared helpers for corporate feedback API routes.
 */
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

export const FEEDBACK_RECIPIENTS = [
  'limassol@honeywelltravel.com.cy',
  'info@honeywelltravel.com.cy',
]

export const FROM_EMAIL = 'Honeywell Travel <offers@honeywelltravel.com.cy>'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 8
const rateLimitMap = new Map()

export function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}

export function checkRateLimit(ip) {
  const now = Date.now()
  let entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS }
  }
  entry.count += 1
  rateLimitMap.set(ip, entry)
  if (rateLimitMap.size > 5000) {
    for (const [key, value] of rateLimitMap) {
      if (now > value.resetAt) rateLimitMap.delete(key)
    }
  }
  return entry.count <= RATE_LIMIT_MAX
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
}

export function generateFeedbackToken() {
  return randomBytes(24).toString('base64url')
}

export function formatTravelDates(start, end) {
  if (!start && !end) return ''
  const fmt = (d) => {
    if (!d) return ''
    try {
      return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(d))
    } catch {
      return String(d)
    }
  }
  const a = fmt(start)
  const b = fmt(end)
  if (a && b) return `${a} – ${b}`
  return a || b
}

export async function loadTokenContext(supabase, tokenValue) {
  const token = String(tokenValue || '').trim()
  if (!token) return { ok: false, reason: 'missing' }

  const { data: tokenRow, error: tokenError } = await supabase
    .from('feedback_tokens')
    .select('id, campaign_id, token, expires_at, is_active, submission_count')
    .eq('token', token)
    .maybeSingle()

  if (tokenError || !tokenRow) return { ok: false, reason: 'invalid' }
  if (!tokenRow.is_active) return { ok: false, reason: 'inactive' }
  if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
    return { ok: false, reason: 'expired' }
  }

  const { data: campaign, error: campaignError } = await supabase
    .from('feedback_campaigns')
    .select('*')
    .eq('id', tokenRow.campaign_id)
    .maybeSingle()

  if (campaignError || !campaign) return { ok: false, reason: 'invalid' }
  if (campaign.status !== 'active') return { ok: false, reason: 'closed' }

  const { data: questions, error: questionsError } = await supabase
    .from('feedback_questions')
    .select('id, question_type, label, options, sort_order, is_required')
    .eq('campaign_id', campaign.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (questionsError) return { ok: false, reason: 'error' }

  return {
    ok: true,
    tokenRow,
    campaign,
    questions: questions || [],
  }
}

export function sanitizeQuestionsForPublic(questions) {
  return (questions || []).map((q) => ({
    id: q.id,
    question_type: q.question_type,
    label: q.label,
    options: Array.isArray(q.options) ? q.options : [],
    sort_order: q.sort_order,
    is_required: q.is_required,
    image_url: q.image_url || null,
  }))
}

export function sanitizeCampaignForPublic(campaign) {
  return {
    company_name: campaign.company_name,
    trip_name: campaign.trip_name,
    destination: campaign.destination,
    travel_date_start: campaign.travel_date_start,
    travel_date_end: campaign.travel_date_end,
    travel_dates: formatTravelDates(campaign.travel_date_start, campaign.travel_date_end),
    cover_image_url: campaign.cover_image_url || null,
  }
}
