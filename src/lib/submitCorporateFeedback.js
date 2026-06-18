import {
  FEEDBACK_ERROR_MESSAGE,
  FEEDBACK_SUCCESS_MESSAGE,
} from './formConstants.js'

export async function validateFeedbackToken(token) {
  const value = String(token || '').trim()
  if (!value) {
    return { ok: false, error: 'Invalid feedback link.' }
  }

  const res = await fetch(`/api/feedback-validate?token=${encodeURIComponent(value)}`)
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    return { ok: false, error: data.error || FEEDBACK_ERROR_MESSAGE }
  }

  return { ok: true, campaign: data.campaign, questions: data.questions || [] }
}

export async function submitCorporateFeedback({ token, travelerName, travelerEmail, answers, honeypot }) {
  if (honeypot) {
    return { ok: true, message: FEEDBACK_SUCCESS_MESSAGE }
  }

  const res = await fetch('/api/feedback-submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      travelerName: String(travelerName || '').trim(),
      travelerEmail: String(travelerEmail || '').trim(),
      answers: answers || {},
      honeypot: honeypot || '',
    }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    return { ok: false, error: data.error || FEEDBACK_ERROR_MESSAGE }
  }

  return { ok: true, message: FEEDBACK_SUCCESS_MESSAGE }
}
