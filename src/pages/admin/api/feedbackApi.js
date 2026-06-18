import { supabase } from '../../../lib/supabase'

export const FEEDBACK_CAMPAIGN_STATUSES = ['draft', 'active', 'closed']

export const FEEDBACK_QUESTION_TYPES = [
  { value: 'rating_stars', label: 'Star rating (1–5)' },
  { value: 'nps', label: 'NPS (0–10)' },
  { value: 'text', label: 'Short text' },
  { value: 'textarea', label: 'Long text' },
  { value: 'yes_no', label: 'Yes / No' },
  { value: 'select', label: 'Select options' },
]

export const DEFAULT_FEEDBACK_QUESTIONS = [
  { question_type: 'rating_stars', label: 'Overall satisfaction with your trip', sort_order: 0, is_required: true },
  { question_type: 'nps', label: 'How likely are you to recommend Honeywell Travel to a colleague?', sort_order: 1, is_required: true },
  { question_type: 'textarea', label: 'What went well during your trip?', sort_order: 2, is_required: false },
  { question_type: 'textarea', label: 'What could we improve?', sort_order: 3, is_required: false },
  { question_type: 'textarea', label: 'Additional comments', sort_order: 4, is_required: false },
]

function buildCampaignPayload(raw = {}) {
  return {
    company_name: (raw.company_name || '').trim(),
    trip_name: (raw.trip_name || '').trim(),
    destination: (raw.destination || '').trim() || null,
    travel_date_start: raw.travel_date_start || null,
    travel_date_end: raw.travel_date_end || null,
    status: raw.status || 'draft',
    notes: (raw.notes || '').trim() || null,
    corporate_group_id: raw.corporate_group_id || null,
    updated_at: new Date().toISOString(),
  }
}

function generateTokenValue() {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function fetchFeedbackCampaigns() {
  const { data, error } = await supabase
    .from('feedback_campaigns')
    .select('*')
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

export async function fetchFeedbackCampaignById(id) {
  const { data, error } = await supabase.from('feedback_campaigns').select('*').eq('id', id).single()
  return { data, error }
}

export async function createFeedbackCampaign(payload) {
  const clean = buildCampaignPayload(payload)
  const { data, error } = await supabase.from('feedback_campaigns').insert(clean).select().single()
  if (error || !data) return { data, error }

  const questions = DEFAULT_FEEDBACK_QUESTIONS.map((q) => ({
    ...q,
    campaign_id: data.id,
    options: [],
    is_active: true,
  }))

  const { error: qError } = await supabase.from('feedback_questions').insert(questions)
  if (qError) return { data, error: qError }

  return { data, error: null }
}

export async function updateFeedbackCampaign(id, payload) {
  const clean = buildCampaignPayload(payload)
  const { data, error } = await supabase
    .from('feedback_campaigns')
    .update(clean)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function deleteFeedbackCampaign(id) {
  const { error } = await supabase.from('feedback_campaigns').delete().eq('id', id)
  return { error }
}

export async function fetchFeedbackQuestions(campaignId) {
  const { data, error } = await supabase
    .from('feedback_questions')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('sort_order', { ascending: true })
  return { data: data || [], error }
}

export async function createFeedbackQuestion(payload) {
  const { data, error } = await supabase
    .from('feedback_questions')
    .insert({
      campaign_id: payload.campaign_id,
      question_type: payload.question_type || 'textarea',
      label: (payload.label || '').trim(),
      options: Array.isArray(payload.options) ? payload.options : [],
      sort_order: payload.sort_order ?? 0,
      is_required: Boolean(payload.is_required),
      is_active: payload.is_active !== false,
    })
    .select()
    .single()
  return { data, error }
}

export async function updateFeedbackQuestion(id, payload) {
  const { data, error } = await supabase
    .from('feedback_questions')
    .update({
      question_type: payload.question_type,
      label: (payload.label || '').trim(),
      options: Array.isArray(payload.options) ? payload.options : [],
      sort_order: payload.sort_order ?? 0,
      is_required: Boolean(payload.is_required),
      is_active: payload.is_active !== false,
    })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function deleteFeedbackQuestion(id) {
  const { error } = await supabase.from('feedback_questions').delete().eq('id', id)
  return { error }
}

export async function fetchFeedbackTokens(campaignId) {
  const query = supabase
    .from('feedback_tokens')
    .select('*')
    .order('created_at', { ascending: false })
  const { data, error } = campaignId ? await query.eq('campaign_id', campaignId) : await query
  return { data: data || [], error }
}

export async function createFeedbackToken(campaignId, expiresAt = null) {
  const token = generateTokenValue()
  const { data, error } = await supabase
    .from('feedback_tokens')
    .insert({
      campaign_id: campaignId,
      token,
      expires_at: expiresAt || null,
      is_active: true,
    })
    .select()
    .single()
  return { data, error }
}

export async function updateFeedbackToken(id, payload) {
  const { data, error } = await supabase
    .from('feedback_tokens')
    .update({
      is_active: payload.is_active,
      expires_at: payload.expires_at || null,
    })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function fetchFeedbackResponses(campaignId) {
  const query = supabase
    .from('feedback_responses')
    .select('*')
    .order('submitted_at', { ascending: false })
  const { data, error } = campaignId ? await query.eq('campaign_id', campaignId) : await query
  return { data: data || [], error }
}

export function buildFeedbackPublicUrl(token) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.honeywelltravel.com.cy'
  return `${origin}/feedback/${token}`
}

export function computeFeedbackStats(responses = [], tokens = []) {
  const total = responses.length
  const ratings = responses.map((r) => Number(r.overall_score)).filter((n) => Number.isFinite(n))
  const npsScores = responses.map((r) => Number(r.nps_score)).filter((n) => Number.isFinite(n))
  const avgRating = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : null
  const avgNps = npsScores.length
    ? Math.round((npsScores.reduce((a, b) => a + b, 0) / npsScores.length) * 10) / 10
    : null
  const activeTokens = tokens.filter((t) => t.is_active).length
  return { total, avgRating, avgNps, activeTokens, tokenCount: tokens.length }
}
