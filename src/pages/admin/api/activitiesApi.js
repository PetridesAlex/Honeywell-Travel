import { supabase } from '../../../lib/supabase'

export async function fetchLeadActivities(leadId) {
  if (!leadId) return { data: [], error: null }
  const { data, error } = await supabase
    .from('lead_activities')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })

  return { data: data || [], error }
}

export async function addLeadActivity({ leadId, type, description, metadata = {} }) {
  if (!leadId) return { error: new Error('Missing lead id') }
  const { data: userData } = await supabase.auth.getUser()
  const createdBy = userData?.user?.id || null

  const { data, error } = await supabase
    .from('lead_activities')
    .insert({
      lead_id: leadId,
      type,
      description,
      metadata,
      created_by: createdBy
    })
    .select()
    .single()

  return { data, error }
}
