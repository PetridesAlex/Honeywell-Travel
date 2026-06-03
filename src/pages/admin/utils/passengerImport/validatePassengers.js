import { getPassportExpiryWarning } from '../passport'
import { getImportProfile } from './importProfiles'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validatePassengerRow(row, profileId = 'full_documentation') {
  const warnings = []
  const profile = getImportProfile(profileId)
  const hasName = Boolean(row.first_name?.trim() || row.last_name?.trim() || row.full_name?.trim())
  if (!hasName) warnings.push('Missing passenger name')

  if (row.email && !EMAIL_RE.test(row.email)) warnings.push('Invalid email address')

  if (profile.id === 'full_documentation') {
    if (!row.passport_number?.trim() && !row.national_id?.trim()) {
      warnings.push('Missing passport or ID number')
    }
    if (row.passport_number?.trim() && !row.passport_expiry?.trim()) {
      warnings.push('Missing date of expiry')
    }
    if ((row.passport_number?.trim() || row.national_id?.trim()) && !row.date_of_issue?.trim()) {
      warnings.push('Missing date of issue')
    }
    if (!row.phone?.trim()) warnings.push('Missing contact number')
    const passportWarning = getPassportExpiryWarning(row.passport_expiry)
    if (passportWarning) warnings.push(passportWarning.message)
  } else if (profile.id === 'insurance_list') {
    if (!row.date_of_birth?.trim()) warnings.push('Missing date of birth')
    if (!row.passport_number?.trim()) warnings.push('Missing passport number')
    if (!row.phone?.trim() && !row.email?.trim()) warnings.push('Missing contact (phone or email)')
  } else if (profile.id === 'rooming_list') {
    if (!row.room_number?.trim() && !row.cabin_number?.trim()) {
      warnings.push('Missing room or cabin number')
    }
  } else if (profile.id === 'name_list') {
    if (!row.nationality?.trim()) warnings.push('Missing nationality')
    if (!row.gender?.trim()) warnings.push('Missing gender')
  }

  return warnings
}

export function validatePassengerRows(rows, profileId) {
  return rows.map((row) => ({
    ...row,
    _warnings: validatePassengerRow(row, profileId)
  }))
}

export function dedupePassengerRows(rows) {
  const seen = new Map()
  const result = []

  rows.forEach((row) => {
    const key = [
      (row.first_name || '').toLowerCase(),
      (row.last_name || '').toLowerCase(),
      (row.passport_number || '').toLowerCase(),
      (row.email || '').toLowerCase()
    ].join('|')
    if (!key.replace(/\|/g, '')) {
      result.push(row)
      return
    }
    if (seen.has(key)) {
      result.push({
        ...row,
        _warnings: [...(row._warnings || []), 'Possible duplicate passenger']
      })
    } else {
      seen.set(key, true)
      result.push(row)
    }
  })

  return result
}
