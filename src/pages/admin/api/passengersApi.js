import { supabase } from '../../../lib/supabase'

const PASSENGER_COLUMNS = [
  'group_id',
  'first_name',
  'last_name',
  'full_name',
  'category',
  'passport_number',
  'national_id',
  'date_of_issue',
  'passport_expiry',
  'date_of_birth',
  'nationality',
  'gender',
  'phone',
  'email',
  'room_number',
  'cabin_number',
  'emergency_contact',
  'notes',
  'updated_at'
]

const unsupportedColumns = new Set()

function stripNullish(payload) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined))
}

function getMissingColumn(error) {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`
  const patterns = [
    /Could not find the ['"]([a-zA-Z0-9_]+)['"] column/i,
    /column ['"]([a-zA-Z0-9_]+)['"] of relation/i,
    /column ['"]([a-zA-Z0-9_]+)['"] does not exist/i
  ]
  for (const pattern of patterns) {
    const match = message.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

function removeUnsupported(payload) {
  const cloned = { ...payload }
  unsupportedColumns.forEach((column) => {
    if (column in cloned) delete cloned[column]
  })
  return cloned
}

function buildPassengerPayload(raw = {}) {
  const emptyDate = (value) => (value && String(value).trim() ? value : null)

  return stripNullish({
    group_id: raw.group_id,
    first_name: (raw.first_name || '').trim(),
    last_name: (raw.last_name || '').trim(),
    full_name: (raw.full_name || '').trim() || null,
    category: (raw.category || '').trim() || null,
    passport_number: (raw.passport_number || '').trim() || null,
    national_id: (raw.national_id || '').trim() || null,
    date_of_issue: emptyDate(raw.date_of_issue),
    passport_expiry: emptyDate(raw.passport_expiry),
    date_of_birth: emptyDate(raw.date_of_birth),
    nationality: (raw.nationality || '').trim() || null,
    gender: (raw.gender || '').trim() || null,
    phone: (raw.phone || '').trim() || null,
    email: (raw.email || '').trim() || null,
    room_number: (raw.room_number || '').trim() || null,
    cabin_number: (raw.cabin_number || '').trim() || null,
    emergency_contact: (raw.emergency_contact || '').trim() || null,
    notes: (raw.notes || '').trim() || null,
    updated_at: new Date().toISOString()
  })
}

async function insertPassengersBatch(payloads) {
  let cleaned = payloads.map(removeUnsupported)
  let { data, error } = await supabase.from('passengers').insert(cleaned).select('*')

  while (error) {
    const missing = getMissingColumn(error)
    if (!missing || unsupportedColumns.has(missing)) return { data: null, error }
    unsupportedColumns.add(missing)
    cleaned = cleaned.map((row) => {
      const next = { ...row }
      delete next[missing]
      return next
    })
    ;({ data, error } = await supabase.from('passengers').insert(cleaned).select('*'))
  }

  return { data, error }
}

export async function fetchPassengersByGroup(groupId) {
  const { data, error } = await supabase
    .from('passengers')
    .select('*')
    .eq('group_id', groupId)
    .order('last_name', { ascending: true })
  return { data: data || [], error }
}

export async function bulkInsertPassengers(groupId, rows) {
  const payloads = rows
    .filter((row) => row._selected !== false)
    .map((row) => buildPassengerPayload({ ...row, group_id: groupId }))

  if (!payloads.length) return { data: [], error: null }

  return insertPassengersBatch(payloads)
}

export async function updatePassenger(id, payload) {
  const { group_id, ...rest } = payload
  const { data, error } = await supabase
    .from('passengers')
    .update(removeUnsupported(buildPassengerPayload(rest)))
    .eq('id', id)
    .select('*')
    .single()
  return { data, error }
}

export async function deletePassenger(id) {
  const { error } = await supabase.from('passengers').delete().eq('id', id)
  return { error }
}

export async function logPassengerImport({
  groupId,
  fileName,
  fileType,
  rowCount,
  importedCount,
  columnMapping,
  warnings
}) {
  const { data: userData } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('passenger_import_logs')
    .insert({
      group_id: groupId,
      file_name: fileName,
      file_type: fileType,
      row_count: rowCount,
      imported_count: importedCount,
      column_mapping: columnMapping || {},
      warnings: warnings || [],
      created_by: userData?.user?.id || null
    })
    .select('*')
    .single()
  return { data, error }
}

export async function fetchPassengersWithPassportWarnings() {
  const { data, error } = await supabase
    .from('passengers')
    .select('id, group_id, first_name, last_name, passport_expiry')
    .not('passport_expiry', 'is', null)
  return { data: data || [], error }
}
