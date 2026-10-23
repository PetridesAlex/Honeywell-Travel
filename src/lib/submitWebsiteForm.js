import { createLead } from './leads'
import {
  FORM_ERROR_MESSAGE,
  FORM_SUCCESS_MESSAGE,
  FORM_TURNSTILE_ERROR_MESSAGE,
  FORM_TURNSTILE_FAILED_CODE,
  FORM_TYPES,
} from './formConstants'

export {
  FORM_SUCCESS_MESSAGE,
  FORM_ERROR_MESSAGE,
  FORM_TURNSTILE_ERROR_MESSAGE,
  FORM_TURNSTILE_FAILED_CODE,
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
}

export function validateFormFields({ name, email, message, honeypot }) {
  if (honeypot && String(honeypot).trim()) {
    return { spam: true }
  }
  if (!String(name || '').trim()) {
    return { error: 'Name is required.' }
  }
  if (!String(email || '').trim()) {
    return { error: 'Email is required.' }
  }
  if (!isValidEmail(email)) {
    return { error: 'Please enter a valid email address.' }
  }
  if (!String(message || '').trim()) {
    return { error: 'Message is required.' }
  }
  return { ok: true }
}

/**
 * Prefer the translated Turnstile message when verification failed.
 */
export function formSubmitErrorMessage(result, t) {
  if (result?.code === FORM_TURNSTILE_FAILED_CODE) {
    return t('forms.turnstileError')
  }
  return result?.error || t('forms.error')
}

/**
 * Submit a public website form via /api/submit-form (Resend + website_submissions).
 * Optionally syncs to the leads table / Travel Hub CRM after a successful send.
 */
export async function submitWebsiteForm({
  formType,
  name,
  email,
  phone = '',
  destination = '',
  travelDates = '',
  passengers = '',
  message,
  pageUrl = typeof window !== 'undefined' ? window.location.href : '',
  honeypot = '',
  turnstileToken = '',
  extraFields = {},
  leadData = null,
}) {
  const validation = validateFormFields({ name, email, message, honeypot })
  if (validation.spam) {
    return { ok: true, message: FORM_SUCCESS_MESSAGE }
  }
  if (validation.error) {
    return { ok: false, error: validation.error }
  }

  if (!String(turnstileToken || '').trim()) {
    return {
      ok: false,
      code: FORM_TURNSTILE_FAILED_CODE,
      error: FORM_TURNSTILE_ERROR_MESSAGE,
    }
  }

  try {
    const response = await fetch('/api/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formType,
        name: String(name).trim(),
        email: String(email).trim(),
        phone,
        destination,
        travelDates,
        passengers,
        message: String(message).trim(),
        pageUrl,
        honeypot,
        turnstileToken: String(turnstileToken).trim(),
        extraFields,
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      if (data?.code === FORM_TURNSTILE_FAILED_CODE) {
        return {
          ok: false,
          code: FORM_TURNSTILE_FAILED_CODE,
          error: data.error || FORM_TURNSTILE_ERROR_MESSAGE,
        }
      }
      return { ok: false, error: data?.error || FORM_ERROR_MESSAGE }
    }

    if (leadData) {
      createLead(leadData).then(({ error: leadError }) => {
        if (leadError) {
          console.error('Lead insert failed (non-blocking):', leadError)
        }
      })
    }

    return { ok: true, message: FORM_SUCCESS_MESSAGE }
  } catch (err) {
    console.error('submitWebsiteForm failed:', err)
    return { ok: false, error: FORM_ERROR_MESSAGE }
  }
}

export async function submitGiftVoucherForm(voucherData) {
  const message = [
    'Gift voucher request',
    '',
    `Recipient: ${voucherData.toName}`,
    `Amount: €${voucherData.amount}`,
    '',
    voucherData.message ? `Personal message:\n${voucherData.message}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const result = await submitWebsiteForm({
    formType: FORM_TYPES.GIFT_VOUCHER,
    name: voucherData.fromName,
    email: voucherData.fromEmail,
    message,
    extraFields: {
      'Recipient name': voucherData.toName,
      amount: `€${voucherData.amount}`,
    },
    honeypot: voucherData.honeypot || '',
    turnstileToken: voucherData.turnstileToken || '',
  })

  if (result.ok) {
    return { success: true }
  }
  return { success: false, error: result.error, code: result.code }
}
