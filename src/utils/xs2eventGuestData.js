/** Normalize XS2Event reservation guestdata for forms. */

const KNOWN_FIELDS = [
  'first_name',
  'last_name',
  'contact_email',
  'contact_phone',
  'date_of_birth',
  'gender',
  'country_of_residence',
  'passport_number',
  'street_name',
  'additional_street_name',
  'city',
  'zip',
  'province',
  'supported_team',
]

export function fieldLabel(name) {
  return String(name || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Convert include_conditions=true guest objects into editable form models.
 */
export function normalizeGuestDataResponse(data) {
  const items = Array.isArray(data?.items) ? data.items : []

  return items.map((item) => {
    const guestsRaw = Array.isArray(item?.guests) ? item.guests : []
    // No guest slots = no guest capture required for this ticket/quantity.
    if (guestsRaw.length === 0) {
      return {
        ticket_id: item.ticket_id,
        quantity: item.quantity,
        guests: [],
      }
    }
    const guests = guestsRaw.map((guest, index) => {
      const values = {}
      const conditions = {}
      const errors = {}

      if (guest && typeof guest === 'object' && guest.conditions && typeof guest.first_name !== 'object') {
        // Flat format with separate conditions map
        for (const key of KNOWN_FIELDS) {
          if (guest[key] != null) values[key] = guest[key]
        }
        Object.assign(conditions, guest.conditions || {})
      } else if (guest && typeof guest === 'object') {
        // Nested { field: { value, condition, error } } format
        for (const [key, meta] of Object.entries(guest)) {
          if (key === 'lead_guest' || key === 'guest_id') continue
          if (!KNOWN_FIELDS.includes(key)) continue
          if (meta && typeof meta === 'object' && 'value' in meta) {
            values[key] = meta.value
            if (meta.condition) conditions[key] = meta.condition
            if (meta.error) errors[key] = meta.error
          } else if (meta != null && typeof meta !== 'object') {
            values[key] = meta
          }
        }
      }

      const requiredFields = Object.entries(conditions)
        .filter(([, condition]) => condition === 'pre_checkout')
        .map(([key]) => key)

      // Always ensure at least name fields exist for lead guest forms if empty requirements
      const fields = [...new Set([...requiredFields, ...Object.keys(values)])]

      return {
        index,
        guest_id: guest?.guest_id || null,
        lead_guest: Boolean(guest?.lead_guest) || index === 0,
        values,
        conditions,
        errors,
        fields: fields.length > 0 ? fields : ['first_name', 'last_name'],
      }
    })

    return {
      ticket_id: item.ticket_id,
      quantity: item.quantity,
      guests,
    }
  })
}

export function buildGuestDataPayload(normalizedItems) {
  return {
    items: normalizedItems.map((item) => ({
      ticket_id: item.ticket_id,
      quantity: item.quantity || item.guests.length,
      guests: item.guests.map((guest) => {
        const out = {
          lead_guest: Boolean(guest.lead_guest),
        }
        if (guest.guest_id) out.guest_id = guest.guest_id
        for (const field of guest.fields) {
          const value = guest.values?.[field]
          if (value != null && String(value).trim() !== '') {
            out[field] = typeof value === 'string' ? value.trim() : value
          }
        }
        return out
      }),
    })),
  }
}

export function guestFormNeedsInput(normalizedItems) {
  return normalizedItems.some((item) =>
    item.guests.some((guest) =>
      guest.fields.some((field) => guest.conditions?.[field] === 'pre_checkout'),
    ),
  )
}
