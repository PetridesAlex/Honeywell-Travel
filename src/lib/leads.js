import { supabase } from './supabase'

const DEFAULT_LEAD = {
  first_name: '',
  last_name: '',
  full_name: '',
  phone: '',
  email: '',
  destination: '',
  travel_dates: '',
  number_of_travelers: '',
  budget: '',
  message: '',
  source: 'Website',
  status: 'New',
  notes: '',
  follow_up_date: null,
  assigned_agent: ''
}

function parseNames(leadData) {
  const first = (leadData.first_name || '').trim()
  const last = (leadData.last_name || '').trim()
  if (first || last) {
    return { first_name: first, last_name: last, full_name: [first, last].filter(Boolean).join(' ') }
  }
  const full = (leadData.full_name || '').trim()
  const parts = full.split(/\s+/).filter(Boolean)
  if (!parts.length) return { first_name: 'Unknown', last_name: '', full_name: '' }
  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(' '),
    full_name: full
  }
}

async function linkLeadToClient(leadId, leadData) {
  const email = String(leadData.email || '').trim().toLowerCase()
  const phone = String(leadData.phone || '').trim()
  if (!email && !phone) return

  try {
    let clientId = null

    if (email) {
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('email', email)
        .limit(1)
        .maybeSingle()
      clientId = existing?.id || null

      if (!clientId) {
        const { data: clients } = await supabase.from('clients').select('id, email')
        const row = (clients || []).find(
          (c) => String(c.email || '').trim().toLowerCase() === email
        )
        clientId = row?.id || null
      }
    }

    if (!clientId && phone) {
      const { data: byPhone } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', phone)
        .limit(1)
        .maybeSingle()
      clientId = byPhone?.id || null
    }

    if (!clientId) {
      const names = parseNames(leadData)
      const { data: created, error: createError } = await supabase
        .from('clients')
        .insert({
          first_name: names.first_name,
          last_name: names.last_name,
          email: email || null
        })
        .select('id')
        .single()

      if (createError) return
      clientId = created?.id
    }

    if (clientId) {
      await supabase.from('leads').update({ client_id: clientId }).eq('id', leadId)
    }
  } catch {
    // Table or client_id column may not exist until migration is applied
  }
}

export async function createLead(leadData = {}) {
  const names = parseNames(leadData)
  const payload = {
    ...DEFAULT_LEAD,
    ...leadData,
    ...names,
    full_name: names.full_name || leadData.full_name || '',
    status: 'New'
  }

  const { data, error } = await supabase.from('leads').insert(payload).select().single()

  if (error) return { error }

  if (data?.id) {
    await linkLeadToClient(data.id, payload)
  }

  return { error: null, data }
}
