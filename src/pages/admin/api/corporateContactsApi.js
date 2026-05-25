import { supabase } from '../../../lib/supabase'

function buildContactPayload(raw = {}) {
  return {
    organization: (raw.organization || '').trim(),
    contact_name: (raw.contact_name || '').trim() || null,
    job_title: (raw.job_title || '').trim() || null,
    category: raw.category || 'Other',
    status: raw.status || 'Active',
    email: raw.email ? String(raw.email).trim().toLowerCase() : null,
    phone: (raw.phone || '').trim() || null,
    mobile: (raw.mobile || '').trim() || null,
    city: (raw.city || '').trim() || null,
    country: (raw.country || '').trim() || 'Cyprus',
    website: (raw.website || '').trim() || null,
    notes: (raw.notes || '').trim() || null,
    updated_at: new Date().toISOString()
  }
}

function formatError(error) {
  const msg = error?.message || 'Request failed'
  if (msg.includes('corporate_service_contacts')) {
    return `${msg} — run supabase/fix_corporate_service_contacts.sql in Supabase SQL editor.`
  }
  return msg
}

export async function fetchCorporateServiceContacts() {
  const { data, error } = await supabase
    .from('corporate_service_contacts')
    .select('*')
    .order('organization', { ascending: true })

  return { data: data || [], error: error ? { message: formatError(error) } : null }
}

export async function createCorporateServiceContact(payload) {
  const clean = buildContactPayload(payload)
  const { data, error } = await supabase
    .from('corporate_service_contacts')
    .insert(clean)
    .select()
    .single()
  return { data, error: error ? { message: formatError(error) } : null }
}

export async function updateCorporateServiceContact(id, payload) {
  const clean = buildContactPayload(payload)
  const { data, error } = await supabase
    .from('corporate_service_contacts')
    .update(clean)
    .eq('id', id)
    .select()
    .single()
  return { data, error: error ? { message: formatError(error) } : null }
}

export async function deleteCorporateServiceContact(id) {
  const { error } = await supabase.from('corporate_service_contacts').delete().eq('id', id)
  return { error: error ? { message: formatError(error) } : null }
}
