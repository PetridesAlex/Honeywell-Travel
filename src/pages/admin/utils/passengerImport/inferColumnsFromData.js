import { COLUMN_SYNONYMS, PASSENGER_FIELD_KEYS } from './passengerFields'
import { fieldFromHeaderLabel } from './headerFieldRules'
import { normalizeHeader } from './mapPassengerColumns'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DATE_RE = /^(\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})$/
const PASSPORT_RE = /^[A-Z0-9]{6,12}$/i

function scoreHeaderRow(cells) {
  const labels = cells.map((c) => normalizeHeader(String(c || '')))
  let score = 0
  for (const label of labels) {
    if (!label || /^column \d+$/i.test(label)) continue
    if (fieldFromHeaderLabel(label)) score += 2
    for (const field of PASSENGER_FIELD_KEYS) {
      const synonyms = COLUMN_SYNONYMS[field] || []
      for (const synonym of synonyms) {
        if (label === synonym || label.includes(synonym)) {
          score += 1.2
          break
        }
      }
    }
  }
  return score
}

export function detectHeaderRowIndex(matrix, maxScan = 25) {
  let bestIndex = 0
  let bestScore = -1
  const limit = Math.min(matrix.length, maxScan)
  for (let i = 0; i < limit; i += 1) {
    const nonEmpty = matrix[i].filter((cell) => String(cell || '').trim()).length
    if (nonEmpty < 2) continue
    const score = scoreHeaderRow(matrix[i])
    if (score > bestScore) {
      bestScore = score
      bestIndex = i
    }
  }
  return bestIndex
}

function sampleColumnValues(rows, header) {
  return rows
    .slice(0, 15)
    .map((row) => String(row[header] ?? '').trim())
    .filter(Boolean)
}

function parseYear(value) {
  const iso = String(value).match(/(\d{4})/)
  return iso ? Number(iso[1]) : null
}

function classifyDateColumn(values) {
  const years = values.map(parseYear).filter((y) => y && y > 1900)
  if (!years.length) return null
  const avg = years.reduce((a, b) => a + b, 0) / years.length
  const now = new Date().getFullYear()
  if (avg >= now - 2) return 'passport_expiry'
  if (avg <= now - 70) return 'date_of_birth'
  if (avg <= now - 5 && avg >= now - 25) return 'date_of_birth'
  if (avg >= now - 15) return 'date_of_issue'
  return 'passport_expiry'
}

function scoreColumnByContent(values, header) {
  if (!values.length) return {}
  const scores = {}
  const label = normalizeHeader(header)
  const fromHeader = fieldFromHeaderLabel(header)
  if (fromHeader) scores[fromHeader] = 1

  const emailHits = values.filter((v) => EMAIL_RE.test(v)).length
  if (emailHits >= values.length * 0.35) scores.email = emailHits / values.length

  const dateHits = values.filter((v) => DATE_RE.test(v)).length
  if (dateHits >= values.length * 0.35) {
    const dateField = classifyDateColumn(values) || 'passport_expiry'
    scores[dateField] = dateHits / values.length
  }

  const passportHits = values.filter((v) => PASSPORT_RE.test(v.replace(/\s/g, ''))).length
  if (passportHits >= values.length * 0.3) scores.passport_number = passportHits / values.length

  const idHits = values.filter((v) => /^[0-9]{6,15}$/.test(v.replace(/\s/g, ''))).length
  if (idHits >= values.length * 0.3 && !scores.passport_number) scores.national_id = idHits / values.length

  const roomHits = values.filter((v) => /^\d{1,3}[A-Za-z]?$/.test(v)).length
  if (roomHits >= values.length * 0.45) scores.room_number = roomHits / values.length

  const phoneHits = values.filter((v) => /^[\d\s+()-]{8,}$/.test(v) && !DATE_RE.test(v)).length
  if (phoneHits >= values.length * 0.35) scores.phone = phoneHits / values.length

  const nationalityHits = values.filter((v) => {
    const t = v.trim()
    return t.length >= 3 && t.length <= 32 && /^[\p{L}\s]+$/u.test(t) && !t.includes('@') && !DATE_RE.test(t)
  }).length
  if (nationalityHits >= values.length * 0.5 && /national|country|citizen/i.test(label)) {
    scores.nationality = nationalityHits / values.length
  }

  const nameLike = values.filter((v) => {
    if (EMAIL_RE.test(v) || DATE_RE.test(v) || PASSPORT_RE.test(v)) return false
    if (/^\d+$/.test(v)) return false
    return /^[\p{L}\s'.-]{2,}$/u.test(v) && v.includes(' ')
  })
  if (nameLike.length >= values.length * 0.3) scores.full_name = nameLike.length / values.length

  const singleWord = values.filter((v) => {
    if (EMAIL_RE.test(v) || DATE_RE.test(v) || /^\d+$/.test(v)) return false
    return /^[\p{L}'.-]{2,}$/u.test(v) && !v.includes(' ')
  })
  if (singleWord.length >= values.length * 0.35) {
    if (/surname|last|eponymo/i.test(label)) scores.last_name = 0.9
    else if (/name|first|onoma/i.test(label)) scores.first_name = 0.9
    else {
      scores.first_name = singleWord.length / values.length * 0.7
      scores.last_name = singleWord.length / values.length * 0.65
    }
  }

  return scores
}

export function inferMappingFromSampleData(headers, rows) {
  const inferred = {}
  const used = new Set()

  const ranked = headers
    .map((header) => {
      const values = sampleColumnValues(rows, header)
      const contentScores = scoreColumnByContent(values, header)
      const headerField = fieldFromHeaderLabel(header)
      const combined = {}
      for (const field of PASSENGER_FIELD_KEYS) {
        combined[field] = contentScores[field] || 0
      }
      if (headerField) combined[headerField] = Math.max(combined[headerField] || 0, 1)
      const top = Object.entries(combined).sort((a, b) => b[1] - a[1])[0]
      return { header, topField: top?.[0], topScore: top?.[1] || 0 }
    })
    .filter((item) => item.topScore >= 0.4)
    .sort((a, b) => b.topScore - a.topScore)

  for (const item of ranked) {
    if (used.has(item.topField)) continue
    inferred[item.header] = item.topField
    used.add(item.topField)
  }

  return inferred
}

export function mappingHasIdentityFields(mapping) {
  return Object.values(mapping).some((field) =>
    ['first_name', 'last_name', 'full_name'].includes(field)
  )
}

export function previewRowsMissingNames(previewRows) {
  if (!previewRows.length) return true
  const empty = previewRows.filter(
    (row) => !row.first_name?.trim() && !row.last_name?.trim() && !row.full_name?.trim()
  ).length
  return empty / previewRows.length > 0.35
}
