import { supabase } from './supabase'

const DEFAULT_LEAD = {
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

export async function createLead(leadData = {}) {
  const payload = {
    ...DEFAULT_LEAD,
    ...leadData,
    status: 'New'
  }

  const { error } = await supabase.from('leads').insert(payload)
  return { error }
}
