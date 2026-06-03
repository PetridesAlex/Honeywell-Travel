import { supabase } from '../../../lib/supabase'

function buildTravelGroupPayload(raw = {}) {
  return {
    group_name: (raw.group_name || '').trim(),
    group_type: (raw.group_type || 'group_booking').trim(),
    departure_date: raw.departure_date || null,
    return_date: raw.return_date || null,
    destination: (raw.destination || '').trim() || null,
    supplier: (raw.supplier || '').trim() || null,
    status: (raw.status || 'Planning').trim(),
    notes: (raw.notes || '').trim() || null,
    updated_at: new Date().toISOString()
  }
}

export async function fetchTravelGroups(filters = {}) {
  let query = supabase.from('travel_groups').select('*').order('departure_date', { ascending: true, nullsFirst: false })

  if (filters.group_type && filters.group_type !== 'all') {
    query = query.eq('group_type', filters.group_type)
  }
  if (filters.status) query = query.eq('status', filters.status)

  const { data, error } = await query
  return { data: data || [], error }
}

/** Groups with passenger counts for the folder list view. */
export async function fetchTravelGroupsWithCounts(filters = {}) {
  const { data: groups, error: groupsError } = await fetchTravelGroups(filters)
  if (groupsError) return { data: [], error: groupsError }

  const { data: passengers, error: paxError } = await supabase.from('passengers').select('group_id')
  if (paxError) return { data: groups, error: paxError }

  const counts = {}
  ;(passengers || []).forEach((row) => {
    counts[row.group_id] = (counts[row.group_id] || 0) + 1
  })

  return {
    data: (groups || []).map((group) => ({
      ...group,
      passenger_count: counts[group.id] || 0
    })),
    error: null
  }
}

export async function fetchTravelGroupById(id) {
  const { data, error } = await supabase.from('travel_groups').select('*').eq('id', id).maybeSingle()
  return { data, error }
}

export async function createTravelGroup(payload) {
  const { data, error } = await supabase
    .from('travel_groups')
    .insert(buildTravelGroupPayload(payload))
    .select('*')
    .single()
  return { data, error }
}

export async function updateTravelGroup(id, payload) {
  const { data, error } = await supabase
    .from('travel_groups')
    .update(buildTravelGroupPayload(payload))
    .eq('id', id)
    .select('*')
    .single()
  return { data, error }
}

export async function deleteTravelGroup(id) {
  const { error } = await supabase.from('travel_groups').delete().eq('id', id)
  return { error }
}

export async function fetchTravelGroupStats() {
  const { data: groups, error: groupsError } = await supabase.from('travel_groups').select('id, departure_date, status')
  if (groupsError) return { data: null, error: groupsError }

  const { count, error: paxError } = await supabase
    .from('passengers')
    .select('*', { count: 'exact', head: true })
  if (paxError) return { data: null, error: paxError }

  const today = new Date()
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const in30 = new Date(todayMidnight)
  in30.setDate(in30.getDate() + 30)

  const upcomingDepartures = (groups || []).filter((group) => {
    if (!group.departure_date) return false
    const dep = new Date(group.departure_date)
    return dep >= todayMidnight && dep <= in30
  }).length

  return {
    data: {
      totalGroups: groups?.length || 0,
      totalPassengers: count || 0,
      upcomingDepartures
    },
    error: null
  }
}
