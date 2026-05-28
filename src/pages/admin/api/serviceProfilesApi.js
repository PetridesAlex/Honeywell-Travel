import { supabase } from '../../../lib/supabase'

function buildProfilePayload(raw = {}) {
  return {
    category: (raw.category || '').trim(),
    company_name: (raw.company_name || '').trim() || null,
    contact_name: (raw.contact_name || '').trim() || null,
    email: raw.email ? String(raw.email).trim().toLowerCase() : null,
    phone: (raw.phone || '').trim() || null,
    country: (raw.country || '').trim() || null,
    updated_at: new Date().toISOString()
  }
}

function formatError(error) {
  const msg = error?.message || 'Request failed'
  if (msg.includes('corporate_service_profiles')) {
    return `${msg} — run supabase/fix_corporate_service_profiles.sql in Supabase SQL editor.`
  }
  return msg
}

export async function fetchServiceProfiles() {
  const { data, error } = await supabase
    .from('corporate_service_profiles')
    .select('*')
    .order('category', { ascending: true })

  return { data: data || [], error: error ? { message: formatError(error) } : null }
}

export async function upsertServiceProfile(category, payload) {
  const clean = buildProfilePayload({ ...payload, category })
  const { data, error } = await supabase
    .from('corporate_service_profiles')
    .upsert(clean, { onConflict: 'category' })
    .select()
    .single()

  return { data, error: error ? { message: formatError(error) } : null }
}
