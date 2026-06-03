import { splitFullName } from './normalizePassengerRow'
import { fieldFromHeaderLabel } from './headerFieldRules'

const DATE_RE = /^(\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})$/

function assignIfEmpty(row, field, value) {
  if (row[field]?.trim()) return
  const text = String(value || '').trim()
  if (text) row[field] = text
}

export function fillUnmappedColumns(mappedRows, rawRows, mapping) {
  return mappedRows.map((mapped, index) => {
    const raw = rawRows[index] || {}
    const row = { ...mapped }

    Object.entries(raw).forEach(([header, value]) => {
      const text = String(value ?? '').trim()
      if (!text) return

      const mappedField = mapping[header]
      if (mappedField) return

      const guessed = fieldFromHeaderLabel(header)
      if (guessed) {
        assignIfEmpty(row, guessed, text)
        return
      }

      if (!row.first_name && !row.last_name && !row.full_name) {
        if (text.includes(' ')) {
          const split = splitFullName(text)
          row.first_name = split.first_name
          row.last_name = split.last_name
        } else if (/^[\p{L}'.-]{2,}$/u.test(text) && !/^\d+$/.test(text)) {
          if (!row.first_name) row.first_name = text
          else if (!row.last_name) row.last_name = text
        }
      }

      if (!row.passport_number && /^[A-Z0-9]{6,12}$/i.test(text.replace(/\s/g, ''))) {
        row.passport_number = text.replace(/\s/g, '').toUpperCase()
      }

      if (!row.national_id && /^[0-9]{6,15}$/.test(text.replace(/\s/g, ''))) {
        row.national_id = text.replace(/\s/g, '')
      }

      if (!row.email && text.includes('@')) row.email = text.toLowerCase()

      if (!row.phone && /^[\d\s+()-]{8,}$/.test(text) && !DATE_RE.test(text)) {
        row.phone = text
      }

      if (DATE_RE.test(text)) {
        if (!row.passport_expiry) row.passport_expiry = text
        else if (!row.date_of_birth) row.date_of_birth = text
        else if (!row.date_of_issue) row.date_of_issue = text
      }
    })

    return row
  })
}
