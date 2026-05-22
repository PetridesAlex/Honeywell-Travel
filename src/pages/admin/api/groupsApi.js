import { supabase } from '../../../lib/supabase'

function stripNullish(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== '')
  )
}

function buildGroupPayload(raw = {}) {
  return {
    company_name: (raw.company_name || '').trim(),
    industry: (raw.industry || '').trim() || null,
    status: raw.status || 'Active',
    contact_person: (raw.contact_person || '').trim() || null,
    contact_email: raw.contact_email ? String(raw.contact_email).trim().toLowerCase() : null,
    contact_phone: (raw.contact_phone || '').trim() || null,
    vat_number: (raw.vat_number || '').trim() || null,
    website: (raw.website || '').trim() || null,
    address: (raw.address || '').trim() || null,
    city: (raw.city || '').trim() || null,
    country: (raw.country || '').trim() || 'Cyprus',
    typical_group_size: (raw.typical_group_size || '').trim() || null,
    payment_terms: (raw.payment_terms || '').trim() || null,
    notes: (raw.notes || '').trim() || null,
    updated_at: new Date().toISOString()
  }
}

export async function fetchCorporateGroups() {
  const { data, error } = await supabase
    .from('corporate_groups')
    .select('*')
    .order('company_name', { ascending: true })

  return { data: data || [], error }
}

export async function fetchCorporateGroupById(id) {
  const { data, error } = await supabase.from('corporate_groups').select('*').eq('id', id).single()
  return { data, error }
}

export async function createCorporateGroup(payload) {
  const clean = buildGroupPayload(payload)
  const { data, error } = await supabase.from('corporate_groups').insert(clean).select().single()
  return { data, error }
}

export async function updateCorporateGroup(id, payload) {
  const clean = buildGroupPayload(payload)
  const { data, error } = await supabase
    .from('corporate_groups')
    .update(clean)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function deleteCorporateGroup(id) {
  const { error } = await supabase.from('corporate_groups').delete().eq('id', id)
  return { error }
}
