/**
 * Server-side website form handler — Resend email + Supabase website_submissions log.
 * RESEND_API_KEY and SUPABASE_SECRET_KEY must stay server-side only.
 */
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { buildFormEmailContent, getEmailSubject } from './formEmailTemplate.js'

const RECIPIENTS = [
  'limassol@honeywelltravel.com.cy',
  'infohoneywell@asg.com.cy',
]
const FROM_EMAIL = 'Honeywell Travel <offers@honeywelltravel.com.cy>'

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

  const subject = getEmailSubject(payload)
  const { text, html } = buildFormEmailContent(payload)

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
