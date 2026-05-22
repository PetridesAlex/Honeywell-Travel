import { supabase } from '../../../lib/supabase'

const unsupportedColumns = new Set()
const optionalColumns = [
  'deal_value',
  'first_name',
  'last_name',
  'trip_type',
  'priority',
  'package_interest',
  'client_id',
  'follow_up_date'
]
let clientsJoinSupported = true

const LEAD_DATE_FIELDS = new Set(['follow_up_date'])

const LEAD_PAYLOAD_KEYS = [
  'first_name',
  'last_name',
  'full_name',
  'phone',
  'email',
  'destination',
  'travel_dates',
  'number_of_travelers',
  'trip_type',
  'priority',
  'package_interest',
  'budget',
  'deal_value',
  'message',
  'source',
  'status',
  'notes',
  'follow_up_date',
  'assigned_agent',
  'client_id'
]

function stripNullish(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  )
}

function normalizeDateField(value) {
  const trimmed = String(value ?? '').trim()
  if (!trimmed) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null
  return trimmed
}

export function sanitizeLeadPayload(raw = {}) {
  const payload = {}

  LEAD_PAYLOAD_KEYS.forEach((key) => {
    if (!(key in raw)) return

    let value = raw[key]

    if (LEAD_DATE_FIELDS.has(key)) {
      value = normalizeDateField(value)
    } else if (value === '') {
      value = key === 'deal_value' ? 0 : key === 'message' || key === 'notes' ? '' : null
    }

    if (value !== undefined) payload[key] = value
  })

  return stripNullish(payload)
}

function getMissingColumn(error) {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`
  const patterns = [
    /column ["']?([a-zA-Z0-9_]+)["']?/i,
    /Could not find the ['"]([a-zA-Z0-9_]+)['"] column/i,
    /['"]([a-zA-Z0-9_]+)['"] column/i
  ]

  for (const pattern of patterns) {
    const match = message.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

function removeUnsupported(payload) {
  const cloned = { ...payload }
  unsupportedColumns.forEach(column => {
    if (column in cloned) delete cloned[column]
  })
  return cloned
}

async function insertWithFallback(payload) {
  const cleanPayload = removeUnsupported(sanitizeLeadPayload(payload))
  const { data, error } = await supabase
    .from('leads')
    .insert(cleanPayload)
    .select()
    .single()

  const missingColumn = getMissingColumn(error)
  if (missingColumn && missingColumn in cleanPayload) {
    unsupportedColumns.add(missingColumn)
    const fallbackPayload = { ...cleanPayload }
    delete fallbackPayload[missingColumn]
    return insertWithFallback(fallbackPayload)
  }

  if (error?.code === 'PGRST204') {
    const fallbackPayload = { ...cleanPayload }
    let removedAny = false
    optionalColumns.forEach(column => {
      if (column in fallbackPayload) {
        delete fallbackPayload[column]
        unsupportedColumns.add(column)
        removedAny = true
      }
    })
    if (removedAny) return insertWithFallback(fallbackPayload)
  }

  return { data, error }
}

async function updateWithFallback(id, payload) {
  const cleanPayload = removeUnsupported(sanitizeLeadPayload(payload))
  const { data, error } = await supabase
    .from('leads')
    .update(cleanPayload)
    .eq('id', id)
    .select()
    .single()

  const missingColumn = getMissingColumn(error)
  if (missingColumn && missingColumn in cleanPayload) {
    unsupportedColumns.add(missingColumn)
    const fallbackPayload = { ...cleanPayload }
    delete fallbackPayload[missingColumn]
    return updateWithFallback(id, fallbackPayload)
  }

  if (error?.code === 'PGRST204') {
    const fallbackPayload = { ...cleanPayload }
    let removedAny = false
    optionalColumns.forEach(column => {
      if (column in fallbackPayload) {
        delete fallbackPayload[column]
        unsupportedColumns.add(column)
        removedAny = true
      }
    })
    if (removedAny) return updateWithFallback(id, fallbackPayload)
  }

  return { data, error }
}

export async function fetchLeads() {
  if (clientsJoinSupported) {
    const { data, error } = await supabase
      .from('leads')
      .select('*, client:clients(*)')
      .order('created_at', { ascending: false })

    if (!error) return { data: data || [], error: null }

    const message = `${error?.message || ''} ${error?.details || ''}`
    if (message.includes('client') || error?.code === 'PGRST200' || error?.code === '42703') {
      clientsJoinSupported = false
    } else {
      return { data: [], error }
    }
  }

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

export async function createLead(payload) {
  return insertWithFallback(payload)
}

export async function updateLead(id, payload) {
  return updateWithFallback(id, payload)
}

export async function deleteLead(id) {
  const { error } = await supabase.from('leads').delete().eq('id', id)
  return { error }
}

export async function markFollowUpDone(id) {
  return updateLead(id, { follow_up_date: null })
}

export async function fetchCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  return { data: data?.user || null, error }
}

export async function fetchAssignableAgents() {
  const { data: userData } = await supabase.auth.getUser()
  const currentEmail = userData?.user?.email || ''
  const currentId = userData?.user?.id || ''

  const { data: leads } = await supabase
    .from('leads')
    .select('assigned_agent')
    .not('assigned_agent', 'is', null)

  const unique = new Set()
  if (currentEmail) unique.add(currentEmail)
  if (currentId) unique.add(currentId)
  ;(leads || []).forEach(row => {
    if (row.assigned_agent) unique.add(row.assigned_agent)
  })

  return Array.from(unique).map(value => ({ id: value, label: value }))
}
