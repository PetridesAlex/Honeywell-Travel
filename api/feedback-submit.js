import { Resend } from 'resend'
import { buildFeedbackEmailContent } from './feedbackEmailTemplate.js'
import {
  checkRateLimit,
  FEEDBACK_RECIPIENTS,
  formatTravelDates,
  FROM_EMAIL,
  getClientIp,
  getSupabaseAdmin,
  isValidEmail,
  loadTokenContext,
} from './feedbackShared.js'

function validateAnswer(question, value) {
  const type = question.question_type
  const raw = value == null ? '' : String(value).trim()

  if (question.is_required && raw === '') {
    return { ok: false, message: `"${question.label}" is required.` }
  }
  if (raw === '') return { ok: true, value: null }

  if (type === 'rating_stars') {
    const n = Number(raw)
    if (!Number.isFinite(n) || n < 1 || n > 5) {
      return { ok: false, message: `"${question.label}" must be between 1 and 5.` }
    }
    return { ok: true, value: n }
  }

  if (type === 'nps') {
    const n = Number(raw)
    if (!Number.isInteger(n) || n < 0 || n > 10) {
      return { ok: false, message: `"${question.label}" must be between 0 and 10.` }
    }
    return { ok: true, value: n }
  }

  if (type === 'yes_no') {
    if (!['yes', 'no'].includes(raw.toLowerCase())) {
      return { ok: false, message: `"${question.label}" must be Yes or No.` }
    }
    return { ok: true, value: raw.toLowerCase() }
  }

  if (type === 'select') {
    const options = Array.isArray(question.options) ? question.options : []
    if (options.length && !options.includes(raw)) {
      return { ok: false, message: `Please select a valid option for "${question.label}".` }
    }
    return { ok: true, value: raw }
  }

  return { ok: true, value: raw }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' })
  }

  const body = req.body || {}
  const honeypot = String(body.honeypot || body._hp || '').trim()
  if (honeypot) {
    return res.status(200).json({ ok: true })
  }

  const token = String(body.token || '').trim()
  const travelerName = String(body.travelerName || '').trim()
  const travelerEmail = String(body.travelerEmail || '').trim()
  const answersInput = body.answers && typeof body.answers === 'object' ? body.answers : {}

  if (!token) {
    return res.status(400).json({ error: 'Invalid feedback link.' })
  }
  if (!travelerName) {
    return res.status(400).json({ error: 'Your name is required.' })
  }
  if (travelerEmail && !isValidEmail(travelerEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' })
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return res.status(503).json({ error: 'Service unavailable.' })
  }

  const ctx = await loadTokenContext(supabase, token)
  if (!ctx.ok) {
    return res.status(400).json({ error: 'This feedback link is no longer available.' })
  }

  if (travelerEmail) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: recent } = await supabase
      .from('feedback_responses')
      .select('id')
      .eq('token_id', ctx.tokenRow.id)
      .eq('traveler_email', travelerEmail.toLowerCase())
      .gte('submitted_at', since)
      .limit(1)

    if (recent?.length) {
      return res.status(400).json({
        error: 'Feedback has already been submitted with this email address. Thank you.',
      })
    }
  }

  const validatedAnswers = {}
  let overallScore = null
  let npsScore = null
  const answerRows = []

  for (const question of ctx.questions) {
    const result = validateAnswer(question, answersInput[question.id])
    if (!result.ok) {
      return res.status(400).json({ error: result.message })
    }
    if (result.value != null) {
      validatedAnswers[question.id] = result.value
      answerRows.push({ label: question.label, value: String(result.value) })
      if (question.question_type === 'rating_stars' && overallScore == null) {
        overallScore = result.value
      }
      if (question.question_type === 'nps') {
        npsScore = result.value
      }
    }
  }

  const travelDates = formatTravelDates(
    ctx.campaign.travel_date_start,
    ctx.campaign.travel_date_end
  )

  const { error: insertError } = await supabase.from('feedback_responses').insert({
    campaign_id: ctx.campaign.id,
    token_id: ctx.tokenRow.id,
    traveler_name: travelerName,
    traveler_email: travelerEmail ? travelerEmail.toLowerCase() : null,
    overall_score: overallScore,
    nps_score: npsScore,
    answers: validatedAnswers,
  })

  if (insertError) {
    console.error('feedback_responses insert failed:', insertError.message)
    return res.status(502).json({ error: 'Failed to save feedback. Please try again.' })
  }

  await supabase
    .from('feedback_tokens')
    .update({ submission_count: (ctx.tokenRow.submission_count || 0) + 1 })
    .eq('id', ctx.tokenRow.id)

  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    const { subject, text, html } = buildFeedbackEmailContent({
      companyName: ctx.campaign.company_name,
      tripName: ctx.campaign.trip_name,
      destination: ctx.campaign.destination,
      travelDates,
      travelerName,
      travelerEmail,
      overallScore,
      npsScore,
      answerRows,
    })

    try {
      const resend = new Resend(apiKey)
      const { error: sendError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: FEEDBACK_RECIPIENTS,
        replyTo: travelerEmail || undefined,
        subject,
        text,
        html,
      })
      if (sendError) {
        console.error('Feedback Resend error:', sendError)
      }
    } catch (err) {
      console.error('Feedback email error:', err)
    }
  }

  return res.status(200).json({ ok: true })
}
