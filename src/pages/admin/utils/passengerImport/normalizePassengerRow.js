function parseDateParts(text) {
  const value = String(text || '').trim()
  if (!value) return null

  const iso = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
  if (iso) {
    const y = Number(iso[1])
    const m = Number(iso[2])
    const d = Number(iso[3])
    if (y > 1900 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }
  }

  const dmy = value.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/)
  if (dmy) {
    let d = Number(dmy[1])
    let m = Number(dmy[2])
    let y = Number(dmy[3])
    if (y < 100) y += 2000
    if (m > 12 && d <= 12) [d, m] = [m, d]
    if (y > 1900 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }
  }

  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime()) && parsed.getFullYear() > 1900) {
    return parsed.toISOString().slice(0, 10)
  }
  return null
}

export function splitFullName(fullName) {
  const text = String(fullName || '').trim().replace(/\s+/g, ' ')
  if (!text) return { first_name: '', last_name: '' }
  const parts = text.split(' ')
  if (parts.length === 1) return { first_name: parts[0], last_name: '' }
  return {
    first_name: parts.slice(0, -1).join(' '),
    last_name: parts[parts.length - 1]
  }
}

function titleCaseName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\b[\p{L}]/gu, (char) => char.toUpperCase())
}

export function normalizePassengerRow(raw = {}) {
  const row = { ...raw }
  row.first_name = titleCaseName(row.first_name)
  row.last_name = titleCaseName(row.last_name)

  if ((!row.first_name && !row.last_name) && row.full_name) {
    const split = splitFullName(row.full_name)
    row.first_name = split.first_name
    row.last_name = split.last_name
  }

  if (row.first_name && row.last_name && !row.full_name) {
    row.full_name = `${row.first_name} ${row.last_name}`.trim()
  }

  row.date_of_issue = parseDateParts(row.date_of_issue) || ''
  row.passport_expiry = parseDateParts(row.passport_expiry) || ''
  row.date_of_birth = parseDateParts(row.date_of_birth) || ''
  row.email = String(row.email || '').trim().toLowerCase()
  row.phone = String(row.phone || '').trim().replace(/\s+/g, ' ')
  row.passport_number = String(row.passport_number || '').trim().toUpperCase().replace(/\s/g, '')
  row.national_id = String(row.national_id || '').trim()
  row.category = String(row.category || '').trim()
  row.gender = String(row.gender || '').trim()
  row.nationality = titleCaseName(row.nationality)
  row.room_number = String(row.room_number || '').trim()
  row.cabin_number = String(row.cabin_number || '').trim()
  row.emergency_contact = String(row.emergency_contact || '').trim()
  row.notes = String(row.notes || '').trim()

  return row
}

export function normalizePassengerRows(rows) {
  return rows.map((row) => normalizePassengerRow(row))
}
