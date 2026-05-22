import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock } from 'lucide-react'
import { fetchOverdueTasksCount, fetchUpcomingTasks } from '../api/teamApi'
import {
  clientDisplayName,
  dueDateClass,
  dueDateLabel,
  dueDateStatus,
  formatTeamDate,
  getTaskTypeLabel,
  taskTypeClass
} from '../utils/team'

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
      <div className="crm-workspace__head">
        <div>
          <h2 className="crm-workspace__title">
            <CalendarClock size={20} aria-hidden className="crm-workspace__title-icon" />
            Upcoming deadlines
          </h2>
          <p className="crm-workspace__subtitle">
            Check-ins, payments, and client tasks due in the next 3 weeks.
            {overdueCount > 0 ? (
              <span className="crm-deadline-overdue-banner"> {overdueCount} overdue — action needed.</span>
            ) : null}
          </p>
        </div>
        <Link to="/admin/team" className="crm-btn crm-btn-ghost crm-btn--dark">
          Team hub
        </Link>
      </div>

      <ul className="crm-deadline-list">
        {tasks.map((task) => {
          const status = dueDateStatus(task.due_date)
          const label = dueDateLabel(status)
          const customer = clientDisplayName(task.client)
          return (
            <li key={task.id} className={`crm-deadline-row${status === 'overdue' ? ' crm-deadline-row--overdue' : ''}`}>
              <div className="crm-deadline-row__main">
                <span className={taskTypeClass(task.task_type)}>{getTaskTypeLabel(task.task_type)}</span>
                <strong className="crm-deadline-row__title">{task.title}</strong>
                {customer && task.client_id ? (
                  <Link to={`/admin/clients/${task.client_id}`} className="crm-deadline-row__client">
                    {customer}
                  </Link>
                ) : (
                  <span className="crm-deadline-row__client crm-deadline-row__client--muted">No customer</span>
                )}
              </div>
              <div className="crm-deadline-row__end">
                <span className={dueDateClass(status)}>
                  {label ? `${label} · ` : ''}
                  {formatTeamDate(task.due_date)}
                </span>
                {task.assigned_to ? (
                  <span className="crm-deadline-row__agent">{task.assigned_to}</span>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default UpcomingDeadlines
