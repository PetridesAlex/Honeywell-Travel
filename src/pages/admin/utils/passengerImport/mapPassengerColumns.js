import { COLUMN_SYNONYMS, PASSENGER_FIELD_KEYS } from './passengerFields'
import { fieldFromHeaderLabel } from './headerFieldRules'
import { inferMappingFromSampleData } from './inferColumnsFromData'

export function normalizeHeader(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\-./#:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function scoreHeader(header, synonyms) {
  const normalized = normalizeHeader(header)
  if (!normalized) return 0
  let best = 0
  for (const synonym of synonyms) {
    if (normalized === synonym) best = Math.max(best, 1)
    else if (normalized.includes(synonym) || synonym.includes(normalized)) best = Math.max(best, 0.88)
    else {
      const words = synonym.split(' ')
      const hits = words.filter((word) => normalized.includes(word)).length
      if (hits >= words.length) best = Math.max(best, 0.78)
      else if (hits > 0) best = Math.max(best, 0.42 + hits * 0.1)
    }
  }
  return best
}

function fieldKeysForMapping(allowedFields) {
  if (!allowedFields?.length) return PASSENGER_FIELD_KEYS
  return PASSENGER_FIELD_KEYS.filter((field) => allowedFields.includes(field))
}

export function mapPassengerColumns(headers = [], sampleRows = [], allowedFields = null) {
  const mapping = {}
  const usedFields = new Set()
  const fieldKeys = fieldKeysForMapping(allowedFields)

  headers.forEach((header) => {
    const fromRule = fieldFromHeaderLabel(header)
    if (fromRule && fieldKeys.includes(fromRule) && !usedFields.has(fromRule)) {
      mapping[header] = fromRule
      usedFields.add(fromRule)
    }
  })

  const scored = headers
    .filter((header) => !mapping[header])
    .map((header) => {
      const fieldScores = fieldKeys.map((field) => ({
        field,
        score: scoreHeader(header, COLUMN_SYNONYMS[field] || [])
      }))
      fieldScores.sort((a, b) => b.score - a.score)
      return { header, best: fieldScores[0] }
    })

  scored
    .filter((item) => item.best.score >= 0.5)
    .sort((a, b) => b.best.score - a.best.score)
    .forEach(({ header, best }) => {
      if (usedFields.has(best.field)) return
      mapping[header] = best.field
      usedFields.add(best.field)
    })

  if (sampleRows?.length) {
    const inferred = inferMappingFromSampleData(headers, sampleRows)
    Object.entries(inferred).forEach(([header, field]) => {
      if (!fieldKeys.includes(field)) return
      if (!mapping[header] && !usedFields.has(field)) {
        mapping[header] = field
        usedFields.add(field)
      }
    })
  }

  return mapping
}

/** Map every column we can recognise from headers + sample data. */
export function buildColumnMapping(headers, sampleRows = [], allowedFields = null) {
  const fieldKeys = fieldKeysForMapping(allowedFields)
  const fromHeaders = mapPassengerColumns(headers, sampleRows, allowedFields)
  const fromData = inferMappingFromSampleData(headers, sampleRows)
  const merged = { ...fromHeaders }

  Object.entries(fromData).forEach(([header, field]) => {
    if (!fieldKeys.includes(field)) return
    if (!merged[header] && !Object.values(merged).includes(field)) {
      merged[header] = field
    }
  })

  headers.forEach((header) => {
    if (merged[header]) return
    const rule = fieldFromHeaderLabel(header)
    if (rule && fieldKeys.includes(rule) && !Object.values(merged).includes(rule)) {
      merged[header] = rule
    }
  })

  return merged
}

export function applyColumnMapping(rows, mapping) {
  return rows.map((row) => {
    const mapped = {}
    Object.entries(row).forEach(([header, value]) => {
      const field = mapping[header]
      if (!field) return
      const text = String(value ?? '').trim()
      if (!text) return
      if (mapped[field]) {
        mapped[field] = `${mapped[field]} ${text}`.trim()
      } else {
        mapped[field] = text
      }
    })
    return mapped
  })
}

export async function enhanceColumnMappingWithAi(headers, existingMapping, sampleRow = null, allowedFields = null) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey || !headers?.length) return existingMapping

  const fieldList = fieldKeysForMapping(allowedFields).join(', ')

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Map spreadsheet columns to passenger fields. Return JSON { "mapping": { "Exact Header": "field_key" } }. field_key: ${fieldList}. Map ALL columns that contain passenger data.`
          },
          {
            role: 'user',
            content: JSON.stringify({ headers, existingMapping, sampleRow })
          }
        ]
      })
    })
    if (!response.ok) return existingMapping
    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content) return existingMapping
    const parsed = JSON.parse(content)
    return { ...existingMapping, ...(parsed.mapping || {}) }
  } catch {
    return existingMapping
  }
}
