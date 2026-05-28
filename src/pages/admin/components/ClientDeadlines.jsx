import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { formatTeamDate, isTaskOpen } from '../utils/team'

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
  const [showCheckInPicker, setShowCheckInPicker] = useState(false)
  const [checkInDate, setCheckInDate] = useState('')
  const [quickSaving, setQuickSaving] = useState(false)
  const [quickError, setQuickError] = useState('')
  const [newlyAddedId, setNewlyAddedId] = useState(null)

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

  const feedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
      if (aTime !== bTime) return bTime - aTime
      return (b.due_date || '').localeCompare(a.due_date || '')
    })
  }, [tasks])

  const openCheckInPicker = () => {
    setQuickError('')
    setShowCheckInPicker(true)
  }

  const handleQuickCheckIn = async (event) => {
    event.preventDefault()
    if (!checkInDate) {
      setQuickError('Please choose a check-in date.')
      return
    }

    setQuickSaving(true)
    setQuickError('')
    const label = clientName || 'this client'
    const formattedDate = formatTeamDate(checkInDate)
    const payload = {
      title: `Check-in reminder — ${formattedDate}`,
      description: `Check-in for ${label} on ${formattedDate}.`,
      status: 'todo',
      priority: 'high',
      task_type: 'check_in',
      due_date: checkInDate,
      client_id: clientId,
      assigned_to: currentAgent
    }

    const { data, error: saveErr } = await createTeamTask(payload)
    if (saveErr) {
      setQuickError(saveErr.message)
      setQuickSaving(false)
      return
    }

    setTasks((prev) => [data, ...prev])
    setNewlyAddedId(data.id)
    setCheckInDate('')
    setShowCheckInPicker(false)
    setQuickSaving(false)
  }

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
            Pick a check-in date to add a reminder for {clientName || 'this client'}. Team messages appear below like a chat feed.
          </p>
        </div>
        <div className="crm-deadline-actions">
          <button
            type="button"
            className="crm-btn crm-btn-primary crm-btn--small"
            onClick={openCheckInPicker}
          >
            <Plus size={15} aria-hidden />
            Check-in deadline
          </button>
          <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark crm-btn--small" onClick={() => openCreate('general')}>
            Other task
          </button>
        </div>
      </div>

      {showCheckInPicker ? (
        <form className="crm-checkin-quick" onSubmit={handleQuickCheckIn}>
          <div className="crm-checkin-quick__copy">
            <strong>Add check-in reminder</strong>
            <span>Choose a date — it will appear in the feed below for the whole team.</span>
          </div>
          <label className="crm-checkin-quick__field">
            <span className="crm-checkin-quick__label">Check-in date</span>
            <input
              type="date"
              value={checkInDate}
              onChange={(event) => setCheckInDate(event.target.value)}
              required
            />
          </label>
          <div className="crm-checkin-quick__actions">
            <button type="submit" className="crm-btn crm-btn-primary crm-btn--small" disabled={quickSaving}>
              {quickSaving ? 'Saving…' : 'Add reminder'}
            </button>
            <button
              type="button"
              className="crm-btn crm-btn-ghost crm-btn--dark crm-btn--small"
              onClick={() => {
                setShowCheckInPicker(false)
                setQuickError('')
              }}
            >
              Cancel
            </button>
          </div>
          {quickError ? <p className="crm-checkin-quick__error">{quickError}</p> : null}
        </form>
      ) : null}

      {loading ? <div className="crm-state">Loading deadlines…</div> : null}
      {!loading && error ? <div className="crm-state crm-state-error">{error}</div> : null}

      {!loading && !error && tasks.length === 0 ? (
        <div className="crm-state crm-deadline-empty">
          No reminders yet. Click <strong>Check-in deadline</strong>, pick a date, and add it to the feed.
        </div>
      ) : null}

      {!loading && !error && tasks.length > 0 ? (
        <>
          <p className="crm-deadline-summary">
            {openCount} open · {tasks.length} total — also on{' '}
            <Link to="/admin/team">Team hub</Link>
          </p>
          <div className="crm-team-task-list crm-team-task-list--client-feed">
            {feedTasks.map((task) => (
              <TeamTaskCard
                key={task.id}
                task={task}
                currentAgent={currentAgent}
                onEdit={openEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                defaultOpen={task.id === newlyAddedId}
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
