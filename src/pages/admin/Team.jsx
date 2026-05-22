import { useCallback, useEffect, useMemo, useState } from 'react'
import { Megaphone, Pin, Plus } from 'lucide-react'
import TeamUpdateCard from './components/TeamUpdateCard'
import AdminLayout from './components/AdminLayout'
import TaskFormModal from './components/TaskFormModal'
import UpdateFormModal from './components/UpdateFormModal'
import TeamTaskCard from './components/TeamTaskCard'
import {
  createTeamTask,
  createTeamUpdate,
  deleteTeamTask,
  deleteTeamUpdate,
  fetchTeamAgentOptions,
  fetchTeamTasks,
  fetchTeamUpdates,
  updateTeamTask,
  updateTeamUpdate
} from './api/teamApi'
import { fetchClients } from './api/clientsApi'
import { fetchLeads } from './api/leadsApi'
import { supabase } from '../../lib/supabase'
import { getAdminDisplayName } from './utils/adminUser'
import {
  countTasksByFilter,
  sortTasksByDeadline,
  taskMatchesFilter
} from './utils/team'
import './Leads.css'

const TASK_FILTERS = [
  { id: 'open', label: 'Open' },
  { id: 'upcoming', label: 'Due soon' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'mine', label: 'Assigned to me' },
  { id: 'all', label: 'All tasks' },
  { id: 'done', label: 'Done' }
]

function Team() {
  const [tab, setTab] = useState('tasks')
  const [tasks, setTasks] = useState([])
  const [updates, setUpdates] = useState([])
  const [clients, setClients] = useState([])
  const [leads, setLeads] = useState([])
  const [agents, setAgents] = useState([])
  const [currentAgent, setCurrentAgent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [taskFilter, setTaskFilter] = useState('open')
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedUpdate, setSelectedUpdate] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const { data: userData } = await supabase.auth.getUser()
      const me = getAdminDisplayName(userData?.user) || userData?.user?.email || ''
      setCurrentAgent(me)

      const [tasksRes, updatesRes, agentsRes] = await Promise.all([
        fetchTeamTasks(),
        fetchTeamUpdates(),
        fetchTeamAgentOptions()
      ])

      if (tasksRes.error?.message?.includes('team_tasks')) {
        setError('Team tables not found. Run supabase/fix_team_hub.sql in Supabase SQL editor.')
      } else if (tasksRes.error) {
        setError(tasksRes.error.message)
      } else {
        setTasks(tasksRes.data)
      }

      if (!updatesRes.error) setUpdates(updatesRes.data)
      setAgents(agentsRes)
    } catch (err) {
      setError(err?.message || 'Failed to load team hub. Check your connection and try Refresh.')
    } finally {
      setLoading(false)
    }

    fetchClients().then(({ data, error: clientsError }) => {
      if (!clientsError) setClients(data || [])
    })
    fetchLeads().then(({ data, error: leadsError }) => {
      if (!leadsError) setLeads(data || [])
    })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const tasksWithClients = useMemo(() => {
    if (!clients.length) return tasks
    return tasks.map((task) => {
      if (task.client) return task
      if (!task.client_id) return task
      const client = clients.find((c) => Number(c.id) === Number(task.client_id))
      return client ? { ...task, client } : task
    })
  }, [tasks, clients])

  const taskFilterCounts = useMemo(() => {
    const counts = {}
    TASK_FILTERS.forEach((f) => {
      counts[f.id] = countTasksByFilter(tasksWithClients, f.id, currentAgent)
    })
    return counts
  }, [tasksWithClients, currentAgent])

  const filteredTasks = useMemo(() => {
    const list = tasksWithClients.filter((task) => taskMatchesFilter(task, taskFilter, currentAgent))
    return sortTasksByDeadline(list)
  }, [tasksWithClients, taskFilter, currentAgent])

  const pinnedUpdates = useMemo(() => updates.filter((u) => u.pinned), [updates])
  const feedUpdates = useMemo(() => updates.filter((u) => !u.pinned), [updates])

  const openTaskCreate = () => {
    setSaveError('')
    setSelectedTask(null)
    setTaskModalOpen(true)
  }

  const openTaskEdit = (task) => {
    setSaveError('')
    setSelectedTask(task)
    setTaskModalOpen(true)
  }

  const handleSaveTask = async (form) => {
    if (!form.title?.trim()) {
      setSaveError('Task title is required.')
      return
    }
    if (!form.due_date) {
      setSaveError('Deadline date is required.')
      return
    }
    setSaving(true)
    setSaveError('')
    const { data, error: saveErr } = selectedTask?.id
      ? await updateTeamTask(selectedTask.id, form)
      : await createTeamTask(form)
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
    setTaskModalOpen(false)
    setSelectedTask(null)
    load()
  }

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return
    const { error: delErr } = await deleteTeamTask(task.id)
    if (delErr) {
      setError(delErr.message)
      return
    }
    setTasks((prev) => prev.filter((t) => t.id !== task.id))
  }

  const handleStatusChange = async (task, status) => {
    const { data, error: err } = await updateTeamTask(task.id, { ...task, status })
    if (!err && data) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? data : t)))
    }
  }

  const openUpdateCreate = () => {
    setSaveError('')
    setSelectedUpdate(null)
    setUpdateModalOpen(true)
  }

  const openUpdateEdit = (update) => {
    setSaveError('')
    setSelectedUpdate(update)
    setUpdateModalOpen(true)
  }

  const handleSaveUpdate = async (form) => {
    if (!form.title?.trim() || !form.body?.trim()) {
      setSaveError('Headline and message are required.')
      return
    }
    setSaving(true)
    setSaveError('')
    const { data, error: saveErr } = selectedUpdate?.id
      ? await updateTeamUpdate(selectedUpdate.id, form)
      : await createTeamUpdate(form)
    if (saveErr) {
      setSaveError(saveErr.message)
      setSaving(false)
      return
    }
    if (selectedUpdate?.id) {
      setUpdates((prev) => prev.map((u) => (u.id === selectedUpdate.id ? data : u)))
    } else {
      setUpdates((prev) => [data, ...prev])
    }
    setSaving(false)
    setUpdateModalOpen(false)
    setSelectedUpdate(null)
    load()
  }

  const handleDeleteUpdate = async (update) => {
    if (!window.confirm(`Delete "${update.title}"?`)) return
    const { error: delErr } = await deleteTeamUpdate(update.id)
    if (delErr) {
      setError(delErr.message)
      return
    }
    setUpdates((prev) => prev.filter((u) => u.id !== update.id))
  }

  return (
    <AdminLayout
      title="Team hub"
      subtitle="Shared deadlines (check-in, payments), tasks, and company news for all agents."
      actions={
        tab === 'tasks' ? (
          <button type="button" className="crm-btn crm-btn-primary crm-btn--team-add" onClick={openTaskCreate}>
            <Plus size={16} aria-hidden />
            Set deadline
          </button>
        ) : (
          <button type="button" className="crm-btn crm-btn-primary crm-btn--team-add" onClick={openUpdateCreate}>
            <Megaphone size={16} aria-hidden />
            Share update
          </button>
        )
      }
    >
      <section className="crm-workspace crm-workspace--team">
        <div className="crm-team-tabs" role="tablist" aria-label="Team hub views">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'tasks'}
            className={`crm-team-tabs__btn crm-team-tabs__btn--tasks${tab === 'tasks' ? ' crm-team-tabs__btn--active' : ''}`}
            onClick={() => setTab('tasks')}
          >
            Tasks &amp; to-do
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'updates'}
            className={`crm-team-tabs__btn crm-team-tabs__btn--updates${tab === 'updates' ? ' crm-team-tabs__btn--active' : ''}`}
            onClick={() => setTab('updates')}
          >
            News &amp; updates
          </button>
        </div>

        {loading ? <div className="crm-state">Loading team hub…</div> : null}
        {!loading && error ? <div className="crm-state crm-state-error">{error}</div> : null}

        {!loading && !error && tab === 'tasks' ? (
          <>
            <div className="crm-filter-chips crm-filter-chips--team" role="toolbar" aria-label="Task filters">
              {TASK_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`crm-chip crm-chip--counted crm-chip--filter-${f.id}${taskFilter === f.id ? ' crm-chip--active' : ''}${f.id === 'overdue' && taskFilterCounts.overdue > 0 ? ' crm-chip--alert' : ''}`}
                  onClick={() => setTaskFilter(f.id)}
                  aria-pressed={taskFilter === f.id}
                  aria-label={`${f.label}, ${taskFilterCounts[f.id]} tasks`}
                >
                  <span className="crm-chip__label">{f.label}</span>
                  <span className="crm-chip__count" aria-hidden="true">
                    {taskFilterCounts[f.id]}
                  </span>
                </button>
              ))}
            </div>
            {filteredTasks.length === 0 ? (
              <div className="crm-state">
                No tasks in this view. Create a task so agents know what to do.
              </div>
            ) : (
              <div className="crm-team-task-list">
                {filteredTasks.map((task) => (
                  <TeamTaskCard
                    key={task.id}
                    task={task}
                    currentAgent={currentAgent}
                    onEdit={openTaskEdit}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </>
        ) : null}

        {!loading && !error && tab === 'updates' ? (
          updates.length === 0 ? (
            <div className="crm-state">
              No news yet. Share office updates, reminders, or policy changes with the team.
            </div>
          ) : (
            <div className="crm-announce-feed">
              {pinnedUpdates.length > 0 ? (
                <section className="crm-announce-section">
                  <h3 className="crm-announce-section__title">
                    <Pin size={16} aria-hidden />
                    Pinned announcements
                  </h3>
                  <div className="crm-announce-list">
                    {pinnedUpdates.map((update) => (
                      <TeamUpdateCard
                        key={update.id}
                        update={update}
                        onEdit={openUpdateEdit}
                        onDelete={handleDeleteUpdate}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
              {feedUpdates.length > 0 ? (
                <section className="crm-announce-section">
                  {pinnedUpdates.length > 0 ? (
                    <h3 className="crm-announce-section__title">Recent updates</h3>
                  ) : null}
                  <div className="crm-announce-list">
                    {feedUpdates.map((update) => (
                      <TeamUpdateCard
                        key={update.id}
                        update={update}
                        onEdit={openUpdateEdit}
                        onDelete={handleDeleteUpdate}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )
        ) : null}
      </section>

      <TaskFormModal
        open={taskModalOpen}
        initialTask={selectedTask}
        agents={agents}
        clients={clients}
        leads={leads}
        defaultAssignedTo={currentAgent}
        onClose={() => {
          setTaskModalOpen(false)
          setSelectedTask(null)
        }}
        onSave={handleSaveTask}
        saving={saving}
        saveError={saveError}
      />
      <UpdateFormModal
        open={updateModalOpen}
        initialUpdate={selectedUpdate}
        onClose={() => {
          setUpdateModalOpen(false)
          setSelectedUpdate(null)
        }}
        onSave={handleSaveUpdate}
        saving={saving}
        saveError={saveError}
      />
    </AdminLayout>
  )
}

export default Team
