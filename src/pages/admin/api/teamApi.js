import { supabase } from '../../../lib/supabase'
import { getAdminDisplayName } from '../utils/adminUser'
import { isTaskOpen, sortTasksByDeadline } from '../utils/team'

const TASK_SELECT = '*, clients(id, first_name, last_name, email)'

async function currentAuthor() {
  const { data } = await supabase.auth.getUser()
  const user = data?.user
  return {
    created_by_id: user?.id || null,
    created_by_name: getAdminDisplayName(user) || user?.email || 'Agent'
  }
}

function normalizeTask(row) {
  if (!row) return row
  const client = row.clients || row.client || null
  const { clients, ...rest } = row
  return { ...rest, client }
}

function normalizeTasks(rows = []) {
  return sortTasksByDeadline((rows || []).map(normalizeTask))
}

function buildTaskPayload(raw = {}) {
  return {
    title: (raw.title || '').trim(),
    description: (raw.description || '').trim() || null,
    status: raw.status || 'todo',
    priority: raw.priority || 'normal',
    task_type: raw.task_type || 'general',
    assigned_to: (raw.assigned_to || '').trim() || null,
    due_date: raw.due_date || null,
    client_id: raw.client_id ? Number(raw.client_id) : null,
    lead_id: raw.lead_id ? Number(raw.lead_id) : null,
    updated_at: new Date().toISOString()
  }
}

function isMissingTaskTypeColumn(error) {
  const msg = error?.message || ''
  return msg.includes('task_type') && (msg.includes('schema cache') || msg.includes('column'))
}

function formatTeamTaskError(error) {
  if (isMissingTaskTypeColumn(error)) {
    return {
      message:
        'Database is missing the task_type column. Open Supabase → SQL Editor, run supabase/fix_team_task_types.sql, then try again.'
    }
  }
  return error
}

function buildUpdatePayload(raw = {}) {
  const imageUrl = (raw.image_url || '').trim()
  const linkUrl = (raw.link_url || '').trim()
  return {
    title: (raw.title || '').trim(),
    body: (raw.body || '').trim(),
    category: raw.category || 'update',
    pinned: Boolean(raw.pinned),
    image_url: imageUrl || null,
    link_url: linkUrl || null,
    updated_at: new Date().toISOString()
  }
}

const TEAM_MEDIA_BUCKET = 'team-media'

function formatTeamUpdateError(error) {
  const msg = error?.message || ''
  if (
    msg.includes('image_url') ||
    msg.includes('link_url') ||
    (msg.includes('column') && msg.includes('team_updates'))
  ) {
    return {
      message:
        'Database is missing image_url/link_url on team_updates. Run supabase/fix_team_update_media.sql in the SQL Editor, then try again.'
    }
  }
  return error
}

export async function uploadTeamUpdateImage(file) {
  if (!file) return { url: null, error: { message: 'No file selected.' } }
  if (!file.type?.startsWith('image/')) {
    return { url: null, error: { message: 'Please choose an image file (JPEG, PNG, WebP, or GIF).' } }
  }
  if (file.size > 5 * 1024 * 1024) {
    return { url: null, error: { message: 'Image must be 5 MB or smaller.' } }
  }

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `updates/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(TEAM_MEDIA_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (uploadError) {
    const msg = uploadError.message || ''
    const bucketMissing = /bucket not found/i.test(msg)
    return {
      url: null,
      error: {
        message: bucketMissing
          ? 'Storage bucket "team-media" is not set up yet. In Supabase → SQL Editor, run the full script supabase/fix_team_update_media.sql (or create a public bucket named team-media under Storage). You can also paste an image URL in the Image field without uploading.'
          : msg || 'Upload failed. Paste an image URL instead, or run supabase/fix_team_update_media.sql.'
      }
    }
  }

  const { data } = supabase.storage.from(TEAM_MEDIA_BUCKET).getPublicUrl(path)
  return { url: data?.publicUrl || null, error: null }
}

function joinSelectError(error) {
  if (!error) return false
  const msg = `${error.message || ''} ${error.details || ''}`
  return (
    msg.includes('clients') ||
    msg.includes('task_type') ||
    error.code === 'PGRST200' ||
    error.code === '42703'
  )
}

async function runTaskSelect(build) {
  let { data, error } = await build(TASK_SELECT)
  if (joinSelectError(error)) {
    ;({ data, error } = await build('*'))
  }
  return { data: normalizeTasks(data || []), error }
}

export async function fetchTeamTasks() {
  return runTaskSelect((fields) =>
    supabase.from('team_tasks').select(fields).order('due_date', { ascending: true })
  )
}

export async function fetchTasksForClient(clientId) {
  const cid = Number(clientId)
  return runTaskSelect((fields) =>
    supabase
      .from('team_tasks')
      .select(fields)
      .eq('client_id', cid)
      .order('due_date', { ascending: true })
  )
}

export async function fetchUpcomingTasks({ days = 14, assignedTo = null, limit = 12 } = {}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(today)
  end.setDate(end.getDate() + days)
  const endIso = end.toISOString().slice(0, 10)

  return runTaskSelect((fields) => {
    let query = supabase
      .from('team_tasks')
      .select(fields)
      .in('status', ['todo', 'in_progress'])
      .not('due_date', 'is', null)
      .lte('due_date', endIso)
      .order('due_date', { ascending: true })
      .limit(limit)

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }
    return query
  })
}

export async function fetchOverdueTasksCount(assignedTo = null) {
  const todayIso = new Date().toISOString().slice(0, 10)
  let query = supabase
    .from('team_tasks')
    .select('*', { count: 'exact', head: true })
    .in('status', ['todo', 'in_progress'])
    .not('due_date', 'is', null)
    .lt('due_date', todayIso)

  if (assignedTo) {
    query = query.eq('assigned_to', assignedTo)
  }

  const { count, error } = await query
  return { count: count || 0, error }
}

export async function fetchTeamUpdates() {
  const { data, error } = await supabase
    .from('team_updates')
    .select('*')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

export async function fetchTaskComments(taskId) {
  const { data, error } = await supabase
    .from('team_task_comments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })
  return { data: data || [], error }
}

export async function fetchTaskCommentCount(taskId) {
  const { count, error } = await supabase
    .from('team_task_comments')
    .select('*', { count: 'exact', head: true })
    .eq('task_id', taskId)
  return { count: count || 0, error }
}

export async function fetchLatestTaskComment(taskId) {
  const { data, error } = await supabase
    .from('team_task_comments')
    .select('id, body, created_by_name, created_at')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return { data, error }
}

export async function fetchOpenTasksCount() {
  const { count, error } = await supabase
    .from('team_tasks')
    .select('*', { count: 'exact', head: true })
    .in('status', ['todo', 'in_progress'])
  return { count: count || 0, error }
}

export async function fetchTeamAgentOptions() {
  const agents = new Set()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user
  const me = getAdminDisplayName(user) || user?.email
  if (me) agents.add(me)
  if (user?.email) agents.add(user.email)

  const { data: tasks } = await supabase.from('team_tasks').select('assigned_to, created_by_name')
  ;(tasks || []).forEach((row) => {
    if (row.assigned_to) agents.add(row.assigned_to)
    if (row.created_by_name) agents.add(row.created_by_name)
  })

  return Array.from(agents)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .map((label) => ({ id: label, label }))
}

export async function createTeamTask(payload) {
  const author = await currentAuthor()
  const clean = buildTaskPayload(payload)
  const { data, error } = await supabase
    .from('team_tasks')
    .insert({ ...clean, ...author })
    .select(TASK_SELECT)
    .single()
  return { data: normalizeTask(data), error: formatTeamTaskError(error) }
}

export async function updateTeamTask(id, payload) {
  const clean = buildTaskPayload(payload)
  const { data, error } = await supabase
    .from('team_tasks')
    .update(clean)
    .eq('id', id)
    .select(TASK_SELECT)
    .single()
  return { data: normalizeTask(data), error: formatTeamTaskError(error) }
}

export async function deleteTeamTask(id) {
  const { error } = await supabase.from('team_tasks').delete().eq('id', id)
  return { error }
}

export async function createTeamUpdate(payload) {
  const author = await currentAuthor()
  const clean = buildUpdatePayload(payload)
  const { data, error } = await supabase
    .from('team_updates')
    .insert({ ...clean, ...author })
    .select()
    .single()
  return { data, error: formatTeamUpdateError(error) }
}

export async function updateTeamUpdate(id, payload) {
  const clean = buildUpdatePayload(payload)
  const { data, error } = await supabase
    .from('team_updates')
    .update(clean)
    .eq('id', id)
    .select()
    .single()
  return { data, error: formatTeamUpdateError(error) }
}

export async function deleteTeamUpdate(id) {
  const { error } = await supabase.from('team_updates').delete().eq('id', id)
  return { error }
}

export async function addTaskComment(taskId, body) {
  const author = await currentAuthor()
  const text = (body || '').trim()
  if (!text) return { data: null, error: { message: 'Message cannot be empty.' } }

  const { data, error } = await supabase
    .from('team_task_comments')
    .insert({ task_id: taskId, body: text, ...author })
    .select()
    .single()
  return { data, error }
}

export async function deleteTaskComment(id) {
  const { error } = await supabase.from('team_task_comments').delete().eq('id', id)
  return { error }
}

export { isTaskOpen }
