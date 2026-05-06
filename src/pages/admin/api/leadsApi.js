import { supabase } from '../../../lib/supabase'

const unsupportedColumns = new Set()
const optionalColumns = ['deal_value']

function stripNullish(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  )
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
  const cleanPayload = removeUnsupported(stripNullish(payload))
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
  const cleanPayload = removeUnsupported(stripNullish(payload))
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
