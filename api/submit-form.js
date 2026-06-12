/**
 * Server-side website form handler — Resend email + Supabase website_submissions log.
 * RESEND_API_KEY and SUPABASE_SECRET_KEY must stay server-side only.
 */
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const RECIPIENTS = [
  'limassol@honeywelltravel.com.cy',
  'infohoneywell@asg.com.cy',
]
const FROM_EMAIL = 'Honeywell Travel <offers@honeywelltravel.com.cy>'

const SUBJECT_BY_FORM_TYPE = {
  contact: 'New Website Contact Form Submission',
  our_world: 'New Website Contact Form Submission',
  newsletter: 'Newsletter Subscription',
  build_your_trip: 'New Travel Inquiry',
  honeymoon: 'New Travel Inquiry',
  flight_booking: 'New Travel Inquiry',
  cruise: 'New Travel Inquiry',
  dmc: 'New Group Request',
  corporate: 'New Quote Request',
  hotel_quote: 'New Quote Request',
  package: 'New Quote Request',
  gift_voucher: 'New Gift Voucher Request',
}

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 8
const rateLimitMap = new Map()

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}

function checkRateLimit(ip) {
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

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
}

function formatSubmittedAt() {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: 'Asia/Nicosia',
  }).format(new Date())
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildExtraFieldsBlock(extraFields = {}) {
  const entries = Object.entries(extraFields).filter(
    ([, value]) => value != null && String(value).trim() !== ''
  )
  if (!entries.length) return { text: '', html: '' }

  const text = `\n\nAdditional Details:\n${entries.map(([k, v]) => `${k}: ${v}`).join('\n')}`
  const htmlRows = entries
    .map(
      ([key, value]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;width:180px;">${escapeHtml(key)}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(value)}</td></tr>`
    )
    .join('')

  return {
    text,
    html: `<h3 style="margin:24px 0 8px;font-size:14px;color:#333;">Additional Details</h3><table style="width:100%;border-collapse:collapse;font-size:14px;">${htmlRows}</table>`,
  }
}

function buildEmailContent(payload) {
  const formLabel = SUBJECT_BY_FORM_TYPE[payload.formType] || 'Website Form Submission'
  const submittedAt = formatSubmittedAt()
  const extra = buildExtraFieldsBlock(payload.extraFields)

  const fields = [
    ['Name', payload.name],
    ['Email', payload.email],
    ['Phone', payload.phone],
    ['Destination / Service', payload.destination],
    ['Travel Dates', payload.travelDates],
    ['Number of Passengers', payload.passengers],
    ['Page URL', payload.pageUrl],
    ['Submitted', submittedAt],
  ].filter(([, value]) => value != null && String(value).trim() !== '')

  const textLines = [
    formLabel,
    '='.repeat(formLabel.length),
    '',
    ...fields.map(([label, value]) => `${label}: ${value}`),
    '',
    'Message / Notes:',
    payload.message || '—',
    extra.text,
  ]

  const htmlFieldRows = fields
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;width:180px;">${escapeHtml(label)}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(value)}</td></tr>`
    )
    .join('')

  const html = `<!DOCTYPE html>
<html>
<body style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#222;margin:0;padding:0;background:#f5f5f5;">
  <div style="max-width:600px;margin:24px auto;background:#fff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
    <div style="background:#c41230;color:#fff;padding:20px 24px;">
      <h1 style="margin:0;font-size:20px;">Honeywell Travel</h1>
      <p style="margin:6px 0 0;font-size:14px;opacity:0.95;">${escapeHtml(formLabel)}</p>
    </div>
    <div style="padding:24px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">${htmlFieldRows}</table>
      <h3 style="margin:0 0 8px;font-size:14px;color:#333;">Message / Notes</h3>
      <div style="background:#f9f9f9;border:1px solid #eee;border-radius:6px;padding:12px 16px;font-size:14px;white-space:pre-wrap;">${escapeHtml(payload.message || '—')}</div>
      ${extra.html}
      <p style="margin:24px 0 0;font-size:12px;color:#888;">Reply directly to this email to reach the customer (${escapeHtml(payload.email)}).</p>
    </div>
  </div>
</body>
</html>`

  return { text: textLines.join('\n').trim(), html }
}

function getSubject(payload) {
  const amount =
    payload.extraFields?.amount ||
    payload.extraFields?.Amount ||
    payload.extraFields?.['Amount']

  if (payload.formType === 'gift_voucher' && amount) {
    return `New Gift Voucher Request - ${amount}`
  }
  return SUBJECT_BY_FORM_TYPE[payload.formType] || 'New Website Contact Form Submission'
}

function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

async function logSubmission(payload) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    console.warn('website_submissions: Supabase admin credentials not configured')
    return
  }
  const { error } = await supabase.from('website_submissions').insert({
    name: payload.name || null,
    email: payload.email || null,
    phone: payload.phone || null,
    form_type: payload.formType || 'unknown',
    message: payload.message || null,
    page_url: payload.pageUrl || null,
  })
  if (error) {
    console.error('website_submissions insert failed:', error.message)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment and try again.',
    })
  }

  const body = req.body || {}
  const honeypot = String(body.honeypot || body._hp || '').trim()

  if (honeypot) {
    return res.status(200).json({ ok: true })
  }

  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim()
  const message = String(body.message || '').trim()
  const formType = String(body.formType || 'contact').trim()

  if (!name) {
    return res.status(400).json({ error: 'Name is required.' })
  }
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' })
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' })
  }
  if (!message) {
    return res.status(400).json({ error: 'Message is required.' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return res.status(503).json({
      error: 'Email service is not configured. Add RESEND_API_KEY in environment variables.',
    })
  }

  const payload = {
    formType,
    name,
    email,
    phone: String(body.phone || '').trim(),
    destination: String(body.destination || '').trim(),
    travelDates: String(body.travelDates || '').trim(),
    passengers: String(body.passengers || '').trim(),
    message,
    pageUrl: String(body.pageUrl || '').trim(),
    extraFields:
      body.extraFields && typeof body.extraFields === 'object' ? body.extraFields : {},
  }

  const subject = getSubject(payload)
  const { text, html } = buildEmailContent(payload)

  try {
    const resend = new Resend(apiKey)
    const { error: sendError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: RECIPIENTS,
      replyTo: email,
      subject,
      text,
      html,
    })

    if (sendError) {
      console.error('Resend error:', sendError)
      return res.status(502).json({ error: 'Failed to send email.' })
    }

    await logSubmission(payload)
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('submit-form handler error:', err)
    return res.status(502).json({ error: err.message || 'Failed to send email.' })
  }
}
