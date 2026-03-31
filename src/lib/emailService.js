import emailjs from '@emailjs/browser'

const FALLBACK_EMAILJS_CONFIG = {
  serviceId: 'service_y7tl9ds',
  publicKey: 'CE3ZnCuFY0A6MeGg9'
}

const FALLBACK_TEMPLATES = {
  AUTOREPLY: 'template_2oj1fwh',
  CONTACT: 'template_4gmq6qs',
  CRUISE: 'template_fnadu7a',
  CORPORATE: 'template_y67t1qn',
  DMC: 'template_cqd1twd',
  HOTEL: 'template_aqr5q66',
  PACKAGE: 'template_4gmq6q5',
  OTHER: 'template_4gmq6q5'
}

const nonEmpty = (value) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const withFallback = (value, fallback) => nonEmpty(value) || fallback

const SERVICE_ID = withFallback(import.meta.env.VITE_EMAILJS_SERVICE_ID, FALLBACK_EMAILJS_CONFIG.serviceId)
const PUBLIC_KEY = withFallback(import.meta.env.VITE_EMAILJS_PUBLIC_KEY, FALLBACK_EMAILJS_CONFIG.publicKey)

export const EMAIL_TEMPLATES = {
  AUTOREPLY: withFallback(import.meta.env.VITE_TEMPLATE_AUTOREPLY, FALLBACK_TEMPLATES.AUTOREPLY),
  CONTACT: withFallback(import.meta.env.VITE_TEMPLATE_CONTACT, FALLBACK_TEMPLATES.CONTACT),
  CRUISE: withFallback(import.meta.env.VITE_TEMPLATE_CRUISE, FALLBACK_TEMPLATES.CRUISE),
  CORPORATE: withFallback(import.meta.env.VITE_TEMPLATE_CORPORATE, FALLBACK_TEMPLATES.CORPORATE),
  DMC: withFallback(import.meta.env.VITE_TEMPLATE_DMC, FALLBACK_TEMPLATES.DMC),
  HOTEL: withFallback(import.meta.env.VITE_TEMPLATE_HOTEL, FALLBACK_TEMPLATES.HOTEL),
  PACKAGE: withFallback(import.meta.env.VITE_TEMPLATE_PACKAGE, FALLBACK_TEMPLATES.PACKAGE),
  OTHER: withFallback(import.meta.env.VITE_TEMPLATE_OTHER, FALLBACK_TEMPLATES.OTHER)
}

export const sendEmail = async (templateId, templateParams) => {
  try {
    const resolvedTemplateId = nonEmpty(templateId) || EMAIL_TEMPLATES.OTHER

    if (!SERVICE_ID || !PUBLIC_KEY || !resolvedTemplateId) {
      console.error('EmailJS configuration problem:', {
        SERVICE_ID,
        PUBLIC_KEY,
        templateId: resolvedTemplateId
      })
      throw new Error('EmailJS is not configured correctly. Check .env values and reload dev server.')
    }

    const response = await emailjs.send(
      SERVICE_ID,
      resolvedTemplateId,
      templateParams,
      PUBLIC_KEY
    )

    return response
  } catch (error) {
    console.error('EmailJS Error:', error)
    throw error
  }
}

