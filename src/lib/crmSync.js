const SOURCE_TRAVEL_TYPE = {
  'Package Form': 'package',
  'Cruise Form': 'cruise',
  'Contact Form': 'other',
  'Book Online': 'flight',
  Website: 'other',
}

function parseTravelerCount(value) {
  if (value == null || value === '') return null
  const match = String(value).match(/\d+/)
  if (!match) return null
  const num = Number(match[0])
  return Number.isFinite(num) && num > 0 ? num : null
}

function parseBudget(value) {
  if (value == null || value === '') return null
  const normalized = String(value).replace(/[^\d.,]/g, '').replace(/,/g, '')
  const num = Number(normalized)
  return Number.isFinite(num) && num > 0 ? String(num) : null
}

export function buildCrmLeadPayload(leadData = {}) {
  const source = leadData.source || 'Website'
  const destination = (leadData.destination || '').trim()
  const message = (leadData.message || '').trim()
  const fullName = (leadData.full_name || '').trim()

  return {
    full_name: fullName || 'Website Inquiry',
    email: (leadData.email || '').trim(),
    phone: (leadData.phone || '').trim(),
    destination,
    package: destination,
    travel_dates: (leadData.travel_dates || '').trim(),
    budget: parseBudget(leadData.budget),
    number_of_adults: parseTravelerCount(leadData.number_of_travelers) ?? undefined,
    message,
    travel_type: SOURCE_TRAVEL_TYPE[source] || undefined,
    source: `honeywelltravel.com — ${source}`,
  }
}

/**
 * Fire-and-forget sync to Travel Hub CRM via /api/crm-lead (Vercel serverless).
 * Does not block or fail the public form if CRM is unavailable.
 */
export function syncLeadToTravelHubCrm(leadData = {}) {
  const payload = buildCrmLeadPayload(leadData)

  if (!payload.email && !payload.full_name) {
    return
  }

  fetch('/api/crm-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch((err) => {
    console.warn('Travel Hub CRM sync failed (non-blocking):', err)
  })
}
