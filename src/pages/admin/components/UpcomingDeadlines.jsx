import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarClock, ChevronRight, User } from 'lucide-react'
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

function AssigneeChip({ name }) {
  const hasAssignee = Boolean(name?.trim())

  return (
    <span
      className={`crm-deadline-row__agent${hasAssignee ? '' : ' crm-deadline-row__agent--open'}`}
    >
      <span
        className={`crm-deadline-row__avatar${hasAssignee ? '' : ' crm-deadline-row__avatar--empty'}`}
        aria-hidden={hasAssignee ? 'true' : undefined}
      >
        {hasAssignee ? (
          authorInitials(name)
        ) : (
          <User size={18} strokeWidth={2.25} />
        )}
      </span>
      <span className="crm-deadline-row__agent-text">
        <span className="crm-deadline-row__agent-label">Assigned</span>
        <span className="crm-deadline-row__agent-name">{hasAssignee ? name : 'Unassigned'}</span>
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

  if (loading) return null
  if (tasks.length === 0 && overdueCount === 0) return null

  return (
    <section className="crm-workspace crm-workspace--deadlines-dashboard">
      <div className="crm-deadlines-dashboard__head">
        <div className="crm-deadlines-dashboard__intro">
          <div className="crm-deadlines-dashboard__title-row">
            <span className="crm-deadlines-dashboard__icon" aria-hidden="true">
              <CalendarClock size={22} strokeWidth={2.25} />
            </span>
            <div>
              <h2 className="crm-workspace__title crm-deadlines-dashboard__title">Upcoming deadlines</h2>
              <p className="crm-workspace__subtitle crm-deadlines-dashboard__subtitle">
                Check-ins, payments, and client tasks due in the next 3 weeks.
              </p>
            </div>
          </div>
          {overdueCount > 0 ? (
            <p className="crm-deadlines-dashboard__alert" role="status">
              <AlertTriangle size={16} aria-hidden />
              <span>
                <strong>{overdueCount}</strong> overdue — requires immediate attention
              </span>
            </p>
          ) : null}
        </div>
        <Link to="/admin/team" className="crm-btn crm-btn-ghost crm-btn--dark crm-deadlines-dashboard__cta">
          Open team hub
          <ChevronRight size={16} aria-hidden />
        </Link>
      </div>

      <ul className="crm-deadline-list crm-deadline-list--dashboard">
        {tasks.map((task) => {
          const status = dueDateStatus(task.due_date)
          const label = dueDateLabel(status)
          const customer = clientDisplayName(task.client)
          const isOverdue = status === 'overdue'

          return (
            <li
              key={task.id}
              className={`crm-deadline-row crm-deadline-row--dashboard${isOverdue ? ' crm-deadline-row--overdue' : ''}${status ? ` crm-deadline-row--${status}` : ''}`}
            >
              <span className="crm-deadline-row__stripe" aria-hidden="true" />
              <div className="crm-deadline-row__body">
                <div className="crm-deadline-row__primary">
                  <div className="crm-deadline-row__tags">
                    <span className={taskTypeClass(task.task_type)}>{getTaskTypeLabel(task.task_type)}</span>
                    <span className={`crm-deadline-due crm-deadline-due--pill ${dueDateClass(status)}`}>
                      {label ? `${label} · ` : ''}
                      {formatTeamDate(task.due_date)}
                    </span>
                  </div>
                  <strong className="crm-deadline-row__title">{task.title}</strong>
                  <div className="crm-deadline-row__meta">
                    {customer && task.client_id ? (
                      <Link to={`/admin/clients/${task.client_id}`} className="crm-deadline-row__client">
                        {customer}
                      </Link>
                    ) : (
                      <span className="crm-deadline-row__client crm-deadline-row__client--muted">No customer linked</span>
                    )}
                  </div>
                </div>
                <div className="crm-deadline-row__aside">
                  <AssigneeChip name={task.assigned_to} />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default UpcomingDeadlines
