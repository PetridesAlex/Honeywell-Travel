/**
 * Open the user's mail app (Outlook when set as default) or Outlook on the web.
 * Sends from CRM_SENDER_EMAIL (honeywelltravel1@asg.com.cy) when Outlook is signed in with that account.
 */

import { CRM_SENDER_EMAIL, CRM_SENDER_NAME } from '../constants'

export function getCrmSenderEmail() {
  return CRM_SENDER_EMAIL
}

export function normalizeEmailAddress(email) {
  return String(email || '').trim()
}

export function buildReplySubject({ recipientName, destination, companyName } = {}) {
  if (companyName) return `Honeywell Travel – ${companyName}`
  if (destination) return `Honeywell Travel – ${destination}`
  const name = String(recipientName || '').trim()
  if (name) return `Honeywell Travel – enquiry for ${name}`
  return 'Honeywell Travel – your enquiry'
}

export function buildEmailSignature() {
  return `\n\n--\n${CRM_SENDER_NAME}\n${CRM_SENDER_EMAIL}`
}

/** Append Honeywell signature when using templates (not for blank quick replies). */
export function withEmailSignature(body = '', { force = false } = {}) {
  const text = String(body || '')
  if (!text.trim() && !force) return text
  if (text.includes(CRM_SENDER_EMAIL)) return text
  return `${text}${buildEmailSignature()}`
}

export function buildMailtoHref({ to, subject = '', body = '' } = {}) {
  const email = normalizeEmailAddress(to)
  if (!email) return null

  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  const query = params.toString()
  return `mailto:${email}${query ? `?${query}` : ''}`
}

/** Microsoft 365 / Outlook on the web — login_hint opens the Honeywell mailbox */
export function buildOutlookWebHref({ to, subject = '', body = '' } = {}) {
  const email = normalizeEmailAddress(to)
  if (!email) return null

  const params = new URLSearchParams({
    to: email,
    login_hint: CRM_SENDER_EMAIL
  })
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  return `https://outlook.office.com/mail/deeplink/compose?${params.toString()}`
}

export function openMailtoCompose(options) {
  const href = buildMailtoHref(options)
  if (!href) return false
  window.location.href = href
  return true
}

export function openOutlookWebCompose(options) {
  const href = buildOutlookWebHref(options)
  if (!href) return false
  window.open(href, '_blank', 'noopener,noreferrer')
  return true
}

export function getComposeLinks(context = {}) {
  const to = normalizeEmailAddress(context.to)
  if (!to) {
    return {
      to: '',
      from: CRM_SENDER_EMAIL,
      mailto: null,
      outlookWeb: null,
      subject: ''
    }
  }

  const subject = context.subject || buildReplySubject(context)
  const body = context.appendSignature ? withEmailSignature(context.body || '') : context.body || ''
  return {
    to,
    from: CRM_SENDER_EMAIL,
    subject,
    mailto: buildMailtoHref({ to, subject, body }),
    outlookWeb: buildOutlookWebHref({ to, subject, body })
  }
}
