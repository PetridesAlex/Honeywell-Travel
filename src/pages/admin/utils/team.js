export const TEAM_TASK_STATUS_OPTIONS = [
  { id: 'todo', label: 'To do' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'done', label: 'Done' },
  { id: 'cancelled', label: 'Cancelled' }
]

export const TEAM_TASK_PRIORITY_OPTIONS = [
  { id: 'low', label: 'Low' },
  { id: 'normal', label: 'Normal' },
  { id: 'high', label: 'High' },
  { id: 'urgent', label: 'Urgent' }
]

export const TEAM_TASK_TYPE_OPTIONS = [
  { id: 'check_in', label: 'Check-in / travel date' },
  { id: 'payment', label: 'Payment deadline' },
  { id: 'documents', label: 'Documents / visa' },
  { id: 'passport', label: 'Passport / ID' },
  { id: 'booking', label: 'Booking confirmation' },
  { id: 'follow_up', label: 'Client follow-up' },
  { id: 'general', label: 'General task' }
]

export const TEAM_UPDATE_CATEGORIES = [
  { id: 'news', label: 'News' },
  { id: 'update', label: 'Update' },
  { id: 'reminder', label: 'Reminder' },
  { id: 'policy', label: 'Policy / process' }
]

export function getTaskTypeLabel(taskType) {
  return TEAM_TASK_TYPE_OPTIONS.find((t) => t.id === taskType)?.label || 'Task'
}

export function getTaskStatusLabel(status) {
  return TEAM_TASK_STATUS_OPTIONS.find((s) => s.id === status)?.label || 'To do'
}

export function getTaskPriorityLabel(priority) {
  return TEAM_TASK_PRIORITY_OPTIONS.find((p) => p.id === priority)?.label || 'Normal'
}

export function taskStatusClass(status) {
  return `crm-team-status crm-team-status--${(status || 'todo').replace(/\s+/g, '_')}`
}

export function taskPriorityClass(priority) {
  return `crm-team-priority crm-team-priority--${(priority || 'normal').replace(/\s+/g, '_')}`
}

export function taskTypeClass(taskType) {
  return `crm-deadline-type crm-deadline-type--${(taskType || 'general').replace(/\s+/g, '_')}`
}

export function updateCategoryClass(category) {
  return `crm-announce-cat crm-announce-cat--${(category || 'update').replace(/\s+/g, '_')}`
}

export function getUpdateCategoryLabel(category) {
  return TEAM_UPDATE_CATEGORIES.find((c) => c.id === category)?.label || 'Update'
}

export function authorInitials(name) {
  const parts = String(name || 'A').trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
  return (parts[0]?.charAt(0) || 'A').toUpperCase()
}

export function formatTeamDate(value) {
  if (!value) return null
  try {
    return new Date(value).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return null
  }
}

export function formatTeamDateTime(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '—'
  }
}

export function isTaskOpen(status) {
  return status === 'todo' || status === 'in_progress'
}

/** @returns {'overdue'|'today'|'soon'|'upcoming'|null} */
export function dueDateStatus(dueDate) {
  if (!dueDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(String(dueDate).slice(0, 10))
  if (Number.isNaN(due.getTime())) return null
  due.setHours(0, 0, 0, 0)
  const diffDays = Math.round((due - today) / 86400000)
  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'today'
  if (diffDays <= 7) return 'soon'
  return 'upcoming'
}

export function dueDateLabel(status) {
  if (status === 'overdue') return 'Overdue'
  if (status === 'today') return 'Due today'
  if (status === 'soon') return 'Due soon'
  if (status === 'upcoming') return 'Upcoming'
  return null
}

export function dueDateClass(status) {
  if (!status) return 'crm-deadline-due'
  return `crm-deadline-due crm-deadline-due--${status}`
}

export function sortTasksByDeadline(tasks = []) {
  return [...tasks].sort((a, b) => {
    const aOpen = isTaskOpen(a.status)
    const bOpen = isTaskOpen(b.status)
    if (aOpen !== bOpen) return aOpen ? -1 : 1

    if (!a.due_date && !b.due_date) {
      return String(b.updated_at || '').localeCompare(String(a.updated_at || ''))
    }
    if (!a.due_date) return 1
    if (!b.due_date) return -1
    const cmp = String(a.due_date).localeCompare(String(b.due_date))
    if (cmp !== 0) return cmp
    return String(b.updated_at || '').localeCompare(String(a.updated_at || ''))
  })
}

export function clientDisplayName(client) {
  if (!client) return null
  const name = [client.first_name, client.last_name].filter(Boolean).join(' ').trim()
  return name || client.email || `Client #${client.id}`
}

export function isTaskOverdue(task) {
  return isTaskOpen(task?.status) && dueDateStatus(task?.due_date) === 'overdue'
}

export function isTaskDueSoon(task) {
  const s = dueDateStatus(task?.due_date)
  return isTaskOpen(task?.status) && (s === 'today' || s === 'soon' || s === 'overdue')
}

export function taskMatchesFilter(task, filterId, currentAgent = '') {
  if (filterId === 'open') return isTaskOpen(task.status)
  if (filterId === 'done') return task.status === 'done'
  if (filterId === 'mine') {
    return isTaskOpen(task.status) && task.assigned_to && task.assigned_to === currentAgent
  }
  if (filterId === 'overdue') {
    return isTaskOpen(task.status) && dueDateStatus(task.due_date) === 'overdue'
  }
  if (filterId === 'upcoming') {
    const s = dueDateStatus(task.due_date)
    return isTaskOpen(task.status) && Boolean(s && s !== 'overdue' && task.due_date)
  }
  return true
}

export function countTasksByFilter(tasks = [], filterId, currentAgent = '') {
  return tasks.filter((task) => taskMatchesFilter(task, filterId, currentAgent)).length
}
