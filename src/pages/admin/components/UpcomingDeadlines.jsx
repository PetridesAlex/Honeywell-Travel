import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  FileText,
  MessageCircle,
  Plane,
  Ticket,
  User,
  UserCircle,
  Wallet
} from 'lucide-react'
import { fetchOverdueTasksCount, fetchUpcomingTasks } from '../api/teamApi'
import {
  clientDisplayName,
  dueDateClass,
  dueDateLabel,
  dueDateStatus,
  formatTeamDate,
  authorInitials,
  getTaskTypeLabel,
  taskTypeClass
} from '../utils/team'

const TASK_TYPE_ICONS = {
  check_in: Plane,
  payment: Wallet,
  documents: FileText,
  passport: UserCircle,
  booking: Ticket,
  follow_up: MessageCircle,
  general: ClipboardList
}

function formatDueParts(value) {
  if (!value) return { day: '—', month: '—' }
  const date = new Date(value)
  return {
    day: date.getDate(),
    month: date.toLocaleDateString(undefined, { month: 'short' })
  }
}

function AssigneeChip({ name }) {
  const hasAssignee = Boolean(name?.trim())

  return (
    <span className={`crm-deadline-card__agent${hasAssignee ? '' : ' crm-deadline-card__agent--open'}`}>
      <span
        className={`crm-deadline-card__avatar${hasAssignee ? '' : ' crm-deadline-card__avatar--empty'}`}
        aria-hidden={hasAssignee ? 'true' : undefined}
      >
        {hasAssignee ? authorInitials(name) : <User size={16} strokeWidth={2.25} />}
      </span>
      <span className="crm-deadline-card__agent-copy">
        <span className="crm-deadline-card__agent-label">Assigned</span>
        <span className="crm-deadline-card__agent-name">{hasAssignee ? name : 'Unassigned'}</span>
      </span>
    </span>
  )
}

function UpcomingDeadlines({ currentAgent = '' }) {
  const [tasks, setTasks] = useState([])
  const [overdueCount, setOverdueCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [upcomingRes, overdueRes] = await Promise.all([
        fetchUpcomingTasks({ days: 21, limit: 8 }),
        fetchOverdueTasksCount()
      ])
      if (!upcomingRes.error) setTasks(upcomingRes.data)
      if (!overdueRes.error) setOverdueCount(overdueRes.count)
      setLoading(false)
    }
    load()
  }, [currentAgent])

  const dueTodayCount = useMemo(
    () => tasks.filter((task) => dueDateStatus(task.due_date) === 'today').length,
    [tasks]
  )

  if (!loading && tasks.length === 0 && overdueCount === 0) return null

  return (
    <section className="crm-workspace crm-workspace--deadlines-dashboard crm-deadlines-panel">
      <div className="crm-deadlines-panel__hero">
        <div className="crm-deadlines-panel__mesh" aria-hidden="true" />
        <div className="crm-deadlines-panel__glow" aria-hidden="true" />

        <div className="crm-deadlines-panel__hero-inner">
          <div className="crm-deadlines-panel__intro">
            <span className="crm-deadlines-panel__icon" aria-hidden="true">
              <CalendarClock size={24} strokeWidth={1.85} />
            </span>
            <div>
              <p className="crm-deadlines-panel__eyebrow">Team hub · Action required</p>
              <h2 className="crm-deadlines-panel__title">Upcoming deadlines</h2>
              <p className="crm-deadlines-panel__subtitle">
                Check-ins, payments, and client tasks due in the next 3 weeks.
              </p>
            </div>
          </div>

          <div className="crm-deadlines-panel__stats">
            <article className={`crm-deadlines-panel__stat${overdueCount > 0 ? ' crm-deadlines-panel__stat--alert' : ''}`}>
              <span>Overdue</span>
              <strong>{loading ? '…' : overdueCount}</strong>
            </article>
            <article className="crm-deadlines-panel__stat crm-deadlines-panel__stat--today">
              <span>Due today</span>
              <strong>{loading ? '…' : dueTodayCount}</strong>
            </article>
            <article className="crm-deadlines-panel__stat">
              <span>Next 3 weeks</span>
              <strong>{loading ? '…' : tasks.length}</strong>
            </article>
          </div>

          <Link to="/admin/team" className="crm-deadlines-panel__cta">
            Open team hub
            <ChevronRight size={16} aria-hidden />
          </Link>
        </div>

        {overdueCount > 0 && !loading ? (
          <div className="crm-deadlines-panel__banner" role="status">
            <AlertTriangle size={18} aria-hidden />
            <span>
              <strong>{overdueCount}</strong> overdue task{overdueCount === 1 ? '' : 's'} need immediate attention
            </span>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="crm-deadlines-panel__loading">Loading deadlines…</div>
      ) : (
        <ul className="crm-deadlines-panel__list">
          {tasks.map((task) => {
            const status = dueDateStatus(task.due_date)
            const label = dueDateLabel(status)
            const customer = clientDisplayName(task.client)
            const isOverdue = status === 'overdue'
            const TypeIcon = TASK_TYPE_ICONS[task.task_type] || ClipboardList
            const dueParts = formatDueParts(task.due_date)

            return (
              <li
                key={task.id}
                className={`crm-deadline-card crm-deadline-card--${status || 'upcoming'}`}
              >
                <div className={`crm-deadline-card__date crm-deadline-card__date--${status || 'upcoming'}`}>
                  <span className="crm-deadline-card__date-day">{dueParts.day}</span>
                  <span className="crm-deadline-card__date-month">{dueParts.month}</span>
                </div>

                <div className="crm-deadline-card__main">
                  <div className="crm-deadline-card__top">
                    <span className={`crm-deadline-card__type ${taskTypeClass(task.task_type)}`}>
                      <TypeIcon size={12} aria-hidden />
                      {getTaskTypeLabel(task.task_type)}
                    </span>
                    <span className={`crm-deadline-card__due ${dueDateClass(status)}`}>
                      {label || 'Scheduled'}
                    </span>
                  </div>
                  <strong className="crm-deadline-card__title">{task.title}</strong>
                  <div className="crm-deadline-card__meta">
                    {customer && task.client_id ? (
                      <Link to={`/admin/clients/${task.client_id}`} className="crm-deadline-card__client">
                        {customer}
                      </Link>
                    ) : (
                      <span className="crm-deadline-card__client crm-deadline-card__client--muted">
                        No customer linked
                      </span>
                    )}
                    <span className="crm-deadline-card__full-date">{formatTeamDate(task.due_date)}</span>
                  </div>
                </div>

                <AssigneeChip name={task.assigned_to} />
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default UpcomingDeadlines
