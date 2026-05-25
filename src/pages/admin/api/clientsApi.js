import { supabase } from '../../../lib/supabase'
import { parseLeadName } from '../utils/leadName'
import { normalizeClientType } from '../utils/clients'

const CLIENT_COLUMNS = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'nationality',
  'date_of_birth',
  'passport_number',
  'date_of_issue',
  'date_of_expiry',
  'notes',
  'client_type',
  'corporate_group_id'
]

const unsupportedColumns = new Set()

function stripNullish(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  )
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

export function clientSaveNeedsCategoryMigration() {
  return unsupportedColumns.has('client_type') || unsupportedColumns.has('corporate_group_id')
}

export function friendlyClientSaveError(message) {
  const text = String(message || '')
  if (/client_type|corporate_group_id|schema cache/i.test(text)) {
    return (
      'Database update required: run supabase/fix_client_categories.sql in the Supabase SQL Editor, ' +
      'then refresh this page and save again.'
    )
  }
  return text
}

function removeUnsupported(payload) {
  const cloned = { ...payload }
  unsupportedColumns.forEach((column) => {
    if (column in cloned) delete cloned[column]
  })
  return cloned
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function normalizePhone(phone) {
  return String(phone || '').replace(/[^\d+]/g, '').trim()
}

function buildClientPayload(raw = {}) {
  const clientType = normalizeClientType(raw.client_type)
  const groupIdRaw = raw.corporate_group_id
  const corporateGroupId =
    clientType === 'group' && groupIdRaw !== '' && groupIdRaw != null
      ? Number(groupIdRaw)
      : null

  return stripNullish({
    first_name: (raw.first_name || '').trim(),
    last_name: (raw.last_name || '').trim(),
    email: raw.email ? normalizeEmail(raw.email) : null,
    phone: (raw.phone || '').trim() || null,
    nationality: (raw.nationality || '').trim() || null,
    date_of_birth: raw.date_of_birth || null,
    passport_number: (raw.passport_number || '').trim() || null,
    date_of_issue: raw.date_of_issue || null,
    date_of_expiry: raw.date_of_expiry || null,
    notes: (raw.notes || '').trim() || null,
    client_type: clientType,
    corporate_group_id: Number.isFinite(corporateGroupId) ? corporateGroupId : null
  })
}

async function insertWithFallback(payload) {
  const cleanPayload = removeUnsupported(stripNullish(payload))
  const { data, error } = await supabase.from('clients').insert(cleanPayload).select().single()

  const missingColumn = getMissingColumn(error)
  if (missingColumn && missingColumn in cleanPayload) {
    unsupportedColumns.add(missingColumn)
    const fallbackPayload = { ...cleanPayload }
    delete fallbackPayload[missingColumn]
    return insertWithFallback(fallbackPayload)
  }

  return { data, error }
}

async function updateWithFallback(id, payload) {
  const cleanPayload = removeUnsupported(stripNullish(payload))
  const { data, error } = await supabase
    .from('clients')
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

  return { data, error }
}

export async function fetchClients() {
  let { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('id', { ascending: false })

  if (error?.message?.includes('id') || error?.code === '42703') {
    const fallback = await supabase.from('clients').select('*').order('email', { ascending: true })
    data = fallback.data
    error = fallback.error
  }

  return { data: data || [], error }
}

export async function fetchClientById(id) {
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).single()
  return { data, error }
}

export async function fetchLeadsForClient(clientId) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error?.code === '42703') {
    const { data: allLeads, error: allError } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    const filtered = (allLeads || []).filter((lead) => String(lead.client_id) === String(clientId))
    return { data: filtered, error: allError }
  }

  return { data: data || [], error }
}

export async function createClient(payload) {
  return insertWithFallback(buildClientPayload(payload))
}

export async function updateClient(id, payload) {
  return updateWithFallback(id, buildClientPayload(payload))
}

export async function deleteClient(id) {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  return { error }
}

function isOperatorMismatchError(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`
  return message.includes('operator does not exist') || error?.code === '42883'
}

export async function findClientByEmail(email) {
  const normalized = normalizeEmail(email)
  if (!normalized) return { data: null, error: null }

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('email', normalized)
    .limit(1)
    .maybeSingle()

  if (!error && data) return { data, error: null }

  if (error && !isOperatorMismatchError(error)) {
    return { data: null, error }
  }

  const { data: all, error: listError } = await supabase.from('clients').select('*')
  if (listError) return { data: null, error: listError }

  const match = (all || []).find(
    (client) => normalizeEmail(String(client.email ?? '')) === normalized
  )
  return { data: match || null, error: null }
}

export async function findClientByPhone(phone) {
  const normalized = normalizePhone(phone)
  if (!normalized) return { data: null, error: null }

  const { data, error } = await supabase.from('clients').select('*').eq('phone', phone.trim()).limit(1).maybeSingle()
  if (data) return { data, error }

  const { data: all, error: listError } = await supabase.from('clients').select('*').not('phone', 'is', null)
  if (listError) return { data: null, error: listError }

  const match = (all || []).find((client) => normalizePhone(client.phone) === normalized)
  return { data: match || null, error: null }
}

export async function findOrCreateClientFromLead(leadPayload = {}) {
  const names = parseLeadName(leadPayload)
  const email = normalizeEmail(leadPayload.email)
  const phone = (leadPayload.phone || '').trim()

  if (leadPayload.client_id) {
    const { data: existing } = await fetchClientById(leadPayload.client_id)
    if (existing) {
      const patch = {}
      if (!existing.first_name && names.first_name) patch.first_name = names.first_name
      if (!existing.last_name && names.last_name) patch.last_name = names.last_name
      if (!existing.email && email) patch.email = email
      if (!existing.phone && phone) patch.phone = phone
      if (Object.keys(patch).length) {
        const { data: updated } = await updateClient(existing.id, { ...existing, ...patch })
        return { data: updated || existing, error: null, created: false }
      }
      return { data: existing, error: null, created: false }
    }
  }

  if (email) {
    const { data: byEmail, error } = await findClientByEmail(email)
    if (error) return { data: null, error, created: false }
    if (byEmail) {
      const patch = {}
      if (!byEmail.first_name && names.first_name) patch.first_name = names.first_name
      if (!byEmail.last_name && names.last_name) patch.last_name = names.last_name
      if (!byEmail.phone && phone) patch.phone = phone
      if (Object.keys(patch).length) {
        const { data: updated, error: updateError } = await updateClient(byEmail.id, { ...byEmail, ...patch })
        return { data: updated || byEmail, error: updateError, created: false }
      }
      return { data: byEmail, error: null, created: false }
    }
  }

  if (phone) {
    const { data: byPhone, error } = await findClientByPhone(phone)
    if (error) return { data: null, error, created: false }
    if (byPhone) {
      const patch = {}
      if (!byPhone.email && email) patch.email = email
      if (!byPhone.first_name && names.first_name) patch.first_name = names.first_name
      if (!byPhone.last_name && names.last_name) patch.last_name = names.last_name
      if (Object.keys(patch).length) {
        const { data: updated, error: updateError } = await updateClient(byPhone.id, { ...byPhone, ...patch })
        return { data: updated || byPhone, error: updateError, created: false }
      }
      return { data: byPhone, error: null, created: false }
    }
  }

  const { data: created, error: createError } = await createClient({
    first_name: names.first_name || 'Unknown',
    last_name: names.last_name || '',
    email: email || null,
    phone: phone || null
  })

  return { data: created, error: createError, created: true }
}

export async function fetchClientsWithExpiringPassports(withinDays = 90) {
  const { data, error } = await fetchClients()
  if (error) return { data: [], error }

  const today = new Date()
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const limit = new Date(todayMidnight)
  limit.setDate(limit.getDate() + withinDays)

  const expiring = (data || []).filter((client) => {
    if (!client.date_of_expiry) return false
    const expiry = new Date(client.date_of_expiry)
    const expiryMidnight = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate())
    return expiryMidnight >= todayMidnight && expiryMidnight <= limit
  })

  const expired = (data || []).filter((client) => {
    if (!client.date_of_expiry) return false
    const expiry = new Date(client.date_of_expiry)
    const expiryMidnight = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate())
    return expiryMidnight < todayMidnight
  })

  const missing = (data || []).filter((client) => !client.date_of_expiry || !client.passport_number)

  return { data: { expiring, expired, missing, all: data }, error: null }
}

export { CLIENT_COLUMNS }
