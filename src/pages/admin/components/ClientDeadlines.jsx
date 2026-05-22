import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Plus } from 'lucide-react'
import TaskFormModal from './TaskFormModal'
import TeamTaskCard from './TeamTaskCard'
import { fetchClients } from '../api/clientsApi'
import {
  createTeamTask,
  deleteTeamTask,
  fetchTasksForClient,
  fetchTeamAgentOptions,
  updateTeamTask
} from '../api/teamApi'
import { supabase } from '../../../lib/supabase'
import { getAdminDisplayName } from '../utils/adminUser'
import { isTaskOpen } from '../utils/team'

function ClientDeadlines({ clientId, clientName, leads = [] }) {
  const [tasks, setTasks] = useState([])
  const [agents, setAgents] = useState([])
  const [currentAgent, setCurrentAgent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [clients, setClients] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data: userData } = await supabase.auth.getUser()
    const me = getAdminDisplayName(userData?.user) || userData?.user?.email || ''
    setCurrentAgent(me)

    const [tasksRes, agentsRes] = await Promise.all([
      fetchTasksForClient(clientId),
      fetchTeamAgentOptions()
    ])

    if (tasksRes.error?.message?.includes('team_tasks')) {
      setError('Run supabase/fix_team_hub.sql and fix_team_task_types.sql in Supabase.')
    } else if (tasksRes.error) {
      setError(tasksRes.error.message)
    } else {
      setTasks(tasksRes.data)
    }
    setAgents(agentsRes)
    setLoading(false)
  }, [clientId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    fetchClients().then(({ data }) => setClients(data || []))
  }, [])

  const [pendingType, setPendingType] = useState('check_in')

  const openCreate = (taskType = 'check_in') => {
    setSaveError('')
    setSelectedTask(null)
    setPendingType(taskType)
    setModalOpen(true)
  }

  const openEdit = (task) => {
    setSaveError('')
    setSelectedTask(task)
    setModalOpen(true)
  }

  const handleSave = async (form) => {
    if (!form.title?.trim()) {
      setSaveError('Title is required.')
      return
    }
    if (!form.due_date) {
      setSaveError('Deadline date is required.')
      return
    }
    setSaving(true)
    setSaveError('')
    const payload = {
      ...form,
      client_id: clientId,
      assigned_to: form.assigned_to || currentAgent
    }
    const { data, error: saveErr } = selectedTask?.id
      ? await updateTeamTask(selectedTask.id, payload)
      : await createTeamTask(payload)
    if (saveErr) {
      setSaveError(saveErr.message)
      setSaving(false)
      return
    }
    if (selectedTask?.id) {
      setTasks((prev) => prev.map((t) => (t.id === selectedTask.id ? data : t)))
    } else {
      setTasks((prev) => [data, ...prev])
    }
    setSaving(false)
    setModalOpen(false)
    setSelectedTask(null)
    load()
  }

  const handleDelete = async (task) => {
    if (!window.confirm(`Remove deadline "${task.title}"?`)) return
    const { error: delErr } = await deleteTeamTask(task.id)
    if (!delErr) setTasks((prev) => prev.filter((t) => t.id !== task.id))
  }

  const handleStatusChange = async (task, status) => {
    const { data, error: err } = await updateTeamTask(task.id, { ...task, status })
    if (!err && data) setTasks((prev) => prev.map((t) => (t.id === task.id ? data : t)))
  }

  const openCount = tasks.filter((t) => isTaskOpen(t.status)).length

  return (
    <section className="crm-workspace crm-workspace--deadlines">
      <div className="crm-workspace__head">
        <div>
          <h2 className="crm-workspace__title">
            <CalendarClock size={20} aria-hidden className="crm-workspace__title-icon" />
            Deadlines &amp; check-ins
          </h2>
          <p className="crm-workspace__subtitle">
            Set dates for check-in, payments, and documents for {clientName || 'this client'} — all agents can see them on Team hub.
          </p>
        </div>
        <div className="crm-deadline-actions">
          <button
            type="button"
            className="crm-btn crm-btn-primary crm-btn--small"
            onClick={() => openCreate('check_in')}
          >
            <Plus size={15} aria-hidden />
            Check-in deadline
          </button>
          <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark crm-btn--small" onClick={() => openCreate('general')}>
            Other task
          </button>
        </div>
      </div>

      {loading ? <div className="crm-state">Loading deadlines…</div> : null}
      {!loading && error ? <div className="crm-state crm-state-error">{error}</div> : null}

      {!loading && !error && tasks.length === 0 ? (
        <div className="crm-state crm-deadline-empty">
          No deadlines yet. Add a check-in date so the team remembers when to finalize travel.
        </div>
      ) : null}

      {!loading && !error && tasks.length > 0 ? (
        <>
          <p className="crm-deadline-summary">
            {openCount} open · {tasks.length} total — also on{' '}
            <Link to="/admin/team">Team hub</Link>
          </p>
          <div className="crm-team-task-list crm-team-task-list--compact">
            {tasks.map((task) => (
              <TeamTaskCard
                key={task.id}
                task={task}
                currentAgent={currentAgent}
                onEdit={openEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                compact
              />
            ))}
          </div>
        </>
      ) : null}

      <TaskFormModal
        open={modalOpen}
        initialTask={selectedTask}
        agents={agents}
        clients={clients}
        leads={leads}
        defaultClientId={clientId}
        defaultTaskType={selectedTask ? '' : pendingType}
        defaultAssignedTo={currentAgent}
        onClose={() => {
          setModalOpen(false)
          setSelectedTask(null)
        }}
        onSave={handleSave}
        saving={saving}
        saveError={saveError}
      />
    </section>
  )
}

export default ClientDeadlines
