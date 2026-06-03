import { enhanceColumnMappingWithAi } from './mapPassengerColumns'
import { normalizePassengerRows } from './normalizePassengerRow'
import { dedupePassengerRows, validatePassengerRows } from './validatePassengers'
import { emptyPassengerRow } from './passengerFields'

export async function runAiColumnMapping(headers, heuristicMapping, sampleRow = null, allowedFields = null) {
  return enhanceColumnMappingWithAi(headers, heuristicMapping, sampleRow, allowedFields)
}

export function cleanAndValidatePassengers(rows, profileId) {
  const normalized = normalizePassengerRows(
    rows.map((row) => {
      const base = emptyPassengerRow()
      Object.keys(base).forEach((key) => {
        if (key.startsWith('_')) return
        if (row[key] !== undefined) base[key] = row[key]
      })
      return { ...base, ...row, _id: row._id || base._id, _selected: row._selected !== false }
    })
  )
  const deduped = dedupePassengerRows(normalized)
  return validatePassengerRows(deduped, profileId)
}
