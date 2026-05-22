function leadSource(lead) {
  return lead && typeof lead === 'object' ? lead : {}
}

export function parseLeadName(lead) {
  const source = leadSource(lead)
  const first = (source.first_name || '').trim()
  const last = (source.last_name || '').trim()

  if (first || last) {
    const fullName = [first, last].filter(Boolean).join(' ').trim()
    return {
      first_name: first,
      last_name: last,
      full_name: fullName || (source.full_name || '').trim()
    }
  }

  const full = (source.full_name || '').trim()
  if (!full) {
    return { first_name: '', last_name: '', full_name: '' }
  }

  const parts = full.split(/\s+/)
  if (parts.length === 1) {
    return { first_name: parts[0], last_name: '', full_name: full }
  }

  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(' '),
    full_name: full
  }
}

export function buildLeadPayload(form) {
  const source = leadSource(form)
  const first_name = (source.first_name || '').trim()
  const last_name = (source.last_name || '').trim()
  const email = (source.email || '').trim()
  const full_name = [first_name, last_name].filter(Boolean).join(' ').trim()

  return {
    ...source,
    first_name,
    last_name,
    full_name,
    email
  }
}

export function leadDisplayName(lead) {
  const { first_name, last_name, full_name } = parseLeadName(lead)
  return [first_name, last_name].filter(Boolean).join(' ').trim() || full_name || '—'
}
