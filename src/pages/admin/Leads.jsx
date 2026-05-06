import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import SummaryCards from './components/SummaryCards'
import LeadsTable from './components/LeadsTable'
import LeadFormModal from './components/LeadFormModal'
import ConfirmDialog from './components/ConfirmDialog'
import LeadDetailsDrawer from './components/LeadDetailsDrawer'
import ToastHost from './components/ToastHost'
import LeadsPerDayChart from './components/LeadsPerDayChart'
import EmailTemplatePicker from './components/EmailTemplatePicker'
import { EMPTY_LEAD, SOURCE_OPTIONS, STATUS_OPTIONS } from './constants'
import { addLeadActivity, fetchLeadActivities } from './api/activitiesApi'
import { buildAnalytics } from './api/analyticsApi'
import {
  createLead,
  deleteLead,
  fetchAssignableAgents,
  fetchCurrentUser,
  fetchLeads,
  markFollowUpDone,
  updateLead
} from './api/leadsApi'
import './Leads.css'

function Leads() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sourceFilter, setSourceFilter] = useState('All')
  const [agentFilter, setAgentFilter] = useState('All')
  const [myLeadsOnly, setMyLeadsOnly] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [modalSaveError, setModalSaveError] = useState('')
  const [drawerLead, setDrawerLead] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [toasts, setToasts] = useState([])
  const [agents, setAgents] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const pushToast = (message, type = 'info') => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, type }])
    window.setTimeout(() => {
      setToasts(prev => prev.filter(item => item.id !== id))
    }, 3500)
  }

  const dismissToast = (id) => setToasts(prev => prev.filter(item => item.id !== id))

  const loadLeads = async () => {
    setLoading(true)
    setError('')

    const { data, error: queryError } = await fetchLeads()

    if (queryError) {
      setError(queryError.message)
      setLeads([])
      setLoading(false)
      return
    }

    setLeads(data || [])
    setLoading(false)
  }

  useEffect(() => {
    const checkAndLoad = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !data?.session) {
        navigate('/admin/login', { replace: true })
        return
      }
      setCheckingAuth(false)
      loadLeads()
    }

    checkAndLoad()

    const channel = supabase
      .channel('admin-leads-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, payload => {
        const newLead = { ...payload.new, __isNew: true }
        setLeads(prev => [newLead, ...prev])
        pushToast('New lead received', 'success')
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [navigate])

  useEffect(() => {
    const bootstrap = async () => {
      const { data: user } = await fetchCurrentUser()
      setCurrentUser(user)
      const agentItems = await fetchAssignableAgents()
      setAgents(agentItems)
    }
    bootstrap()
  }, [])

  const filteredLeads = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return leads.filter(lead => {
      const matchesSearch = !normalizedSearch || [
        lead.full_name,
        lead.phone,
        lead.email,
        lead.destination
      ].some(value => (value || '').toLowerCase().includes(normalizedSearch))

      const matchesStatus = statusFilter === 'All' || (lead.status || 'New') === statusFilter
      const matchesSource = sourceFilter === 'All' || (lead.source || 'Website') === sourceFilter
      const matchesAgent = agentFilter === 'All' || (lead.assigned_agent || '') === agentFilter
      const matchesMine = !myLeadsOnly || (lead.assigned_agent || '') === (currentUser?.email || currentUser?.id || '')

      return matchesSearch && matchesStatus && matchesSource && matchesAgent && matchesMine
    })
  }, [leads, searchTerm, statusFilter, sourceFilter, agentFilter, myLeadsOnly, currentUser])

  const stats = useMemo(() => {
    const countByStatus = (value) => leads.filter(lead => (lead.status || 'New') === value).length
    const today = new Date()
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const tomorrow = new Date(todayMidnight)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const followUpsDue = leads.filter(lead => {
      if (!lead.follow_up_date) return false
      const followDate = new Date(lead.follow_up_date)
      const followMidnight = new Date(followDate.getFullYear(), followDate.getMonth(), followDate.getDate())
      return followMidnight <= todayMidnight
    }).length

    const followUpsToday = leads.filter(lead => lead.follow_up_date && new Date(lead.follow_up_date) >= todayMidnight && new Date(lead.follow_up_date) < tomorrow).length
    const overdueFollowUps = leads.filter(lead => lead.follow_up_date && new Date(lead.follow_up_date) < todayMidnight).length
    const analytics = buildAnalytics(leads)

    return {
      total: leads.length,
      newCount: countByStatus('New'),
      contacted: countByStatus('Contacted'),
      quoted: countByStatus('Quoted'),
      confirmed: countByStatus('Confirmed'),
      lost: countByStatus('Lost'),
      followUpsDue,
      followUpsToday,
      overdueFollowUps,
      ...analytics
    }
  }, [leads])

  const openCreateModal = () => {
    setModalSaveError('')
    setSelectedLead(null)
    setModalOpen(true)
  }

  const openEditModal = (lead) => {
    setModalSaveError('')
    setSelectedLead(lead)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalSaveError('')
    setSelectedLead(null)
    setModalOpen(false)
  }

  const handleSaveLead = async (form) => {
    setSaving(true)
    setModalSaveError('')

    const payload = {
      ...EMPTY_LEAD,
      ...form,
      follow_up_date: form.follow_up_date || null
    }

    const { data, error: saveError } = selectedLead?.id
      ? await updateLead(selectedLead.id, payload)
      : await createLead(payload)

    if (saveError) {
      setError(saveError.message)
      setModalSaveError(saveError.message || 'Failed to save lead.')
      pushToast('Failed to save lead', 'error')
      setSaving(false)
      return
    }

    if (selectedLead?.id) {
      setLeads(prev => prev.map(item => item.id === selectedLead.id ? data : item))
      await addLeadActivity({
        leadId: selectedLead.id,
        type: 'updated',
        description: 'Lead updated',
        metadata: { status: payload.status }
      })
    } else {
      setLeads(prev => [data, ...prev])
      await addLeadActivity({
        leadId: data.id,
        type: 'created',
        description: 'Lead created',
        metadata: {}
      })
    }

    pushToast('Lead saved', 'success')
    setSaving(false)
    closeModal()
  }

  const handleDeleteLead = async () => {
    if (!deleteTarget) return

    setDeleting(true)
    const { error: deleteError } = await deleteLead(deleteTarget.id)

    if (deleteError) {
      setError(deleteError.message)
      setDeleting(false)
      return
    }

    setLeads(prev => prev.filter(item => item.id !== deleteTarget.id))
    setDeleteTarget(null)
    setDeleting(false)
    pushToast('Lead deleted', 'success')
  }

  const openDrawer = async (lead) => {
    setDrawerLead(lead)
    const { data } = await fetchLeadActivities(lead.id)
    setTimeline(data || [])
  }

  const closeDrawer = () => {
    setDrawerLead(null)
    setTimeline([])
  }

  const saveDrawerLead = async (id, payload) => {
    const current = leads.find(item => item.id === id)
    const { data, error: saveError } = await updateLead(id, payload)
    if (saveError) {
      setError(saveError.message)
      pushToast('Failed to save lead changes', 'error')
      return
    }
    setLeads(prev => prev.map(item => (item.id === id ? { ...item, ...data } : item)))
    if (drawerLead?.id === id) setDrawerLead(prev => ({ ...prev, ...data }))
    if (current?.status !== payload.status) {
      await addLeadActivity({ leadId: id, type: 'status_updated', description: `Status changed to ${payload.status}`, metadata: { from: current?.status, to: payload.status } })
    } else {
      await addLeadActivity({ leadId: id, type: 'updated', description: 'Lead details updated', metadata: payload })
    }
    const { data: activities } = await fetchLeadActivities(id)
    setTimeline(activities || [])
    pushToast('Lead updated', 'success')
  }

  const handleMarkFollowUpDone = async (id) => {
    const { data, error: markError } = await markFollowUpDone(id)
    if (markError) {
      setError(markError.message)
      pushToast('Failed to mark follow-up done', 'error')
      return
    }
    setLeads(prev => prev.map(item => (item.id === id ? data : item)))
    if (drawerLead?.id === id) setDrawerLead(data)
    await addLeadActivity({ leadId: id, type: 'follow_up_done', description: 'Follow-up marked done', metadata: {} })
    const { data: activities } = await fetchLeadActivities(id)
    setTimeline(activities || [])
    pushToast('Follow-up marked done', 'success')
  }

  const logAction = async (leadId, type, description, metadata = {}) => {
    await addLeadActivity({ leadId, type, description, metadata })
    if (drawerLead?.id === leadId) {
      const { data } = await fetchLeadActivities(leadId)
      setTimeline(data || [])
    }
  }

  const renderTopDestinations = () => (
    <section className="crm-top-destinations">
      <h3>Top Destinations</h3>
      <div className="crm-destination-list">
        {stats.topDestinations?.length
          ? stats.topDestinations.map(item => (
            <div key={item.destination} className="crm-destination-item">
              <span>{item.destination}</span>
              <strong>{item.count}</strong>
            </div>
          ))
          : <p className="crm-muted">No destination data yet.</p>}
      </div>
    </section>
  )

  const emailPicker = drawerLead ? (
    <EmailTemplatePicker
      lead={drawerLead}
      onLog={(template) => logAction(drawerLead.id, 'email_sent', `Email template used: ${template}`, { template })}
    />
  ) : null

  const handleLogCall = (lead) => logAction(lead.id, 'called', 'Call action opened', {})
  const handleLogWhatsapp = (lead) => logAction(lead.id, 'whatsapp_opened', 'WhatsApp action opened', {})
  const handleLogEmailTemplate = (lead, template) => logAction(lead.id, 'email_sent', `Email template used: ${template}`, { template })

  const leadsForTable = filteredLeads.map(item => ({
    ...item,
    __isNew: Boolean(item.__isNew)
  }))

  useEffect(() => {
    if (!leads.some(item => item.__isNew)) return
    const timer = window.setTimeout(() => {
      setLeads(prev => prev.map(item => ({ ...item, __isNew: false })))
    }, 8000)
    return () => window.clearTimeout(timer)
  }, [leads])

  const agentOptions = useMemo(() => {
    const set = new Map()
    agents.forEach(agent => set.set(agent.id, agent))
    leads.forEach(lead => {
      if (lead.assigned_agent && !set.has(lead.assigned_agent)) {
        set.set(lead.assigned_agent, { id: lead.assigned_agent, label: lead.assigned_agent })
      }
    })
    return Array.from(set.values())
  }, [agents, leads])

  const myAgentKey = currentUser?.email || currentUser?.id || ''

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login', { replace: true })
  }

  if (checkingAuth) {
    return (
      <div className="crm-page">
        <div className="crm-state">Checking session...</div>
      </div>
    )
  }

  return (
    <div className="crm-page">
      <header className="crm-header">
        <div>
          <p className="crm-eyebrow">Honeywell Travel Admin</p>
          <h1>Leads CRM</h1>
          <p className="crm-muted">Track enquiries, follow-ups, and conversions in one place.</p>
        </div>
        <div className="crm-header-actions">
          <button className="crm-btn crm-btn-primary" onClick={openCreateModal}>+ Add Lead</button>
          <button className="crm-btn crm-btn-ghost" onClick={handleSignOut}>Sign out</button>
        </div>
      </header>

      <SummaryCards stats={stats} />
      <div className="crm-insight-grid">
        <LeadsPerDayChart data={stats.leadsPerDay || []} />
        {renderTopDestinations()}
      </div>

      <section className="crm-toolbar">
        <input
          placeholder="Search by name, phone, email, destination"
          value={searchTerm}
          onChange={event => setSearchTerm(event.target.value)}
        />
        <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
        <select value={sourceFilter} onChange={event => setSourceFilter(event.target.value)}>
          <option value="All">All Sources</option>
          {SOURCE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
        <select value={agentFilter} onChange={event => setAgentFilter(event.target.value)}>
          <option value="All">All Agents</option>
          {agentOptions.map(agent => <option key={agent.id} value={agent.id}>{agent.label}</option>)}
        </select>
        <label className="crm-toggle">
          <input
            type="checkbox"
            checked={myLeadsOnly}
            onChange={event => setMyLeadsOnly(event.target.checked)}
            disabled={!myAgentKey}
          />
          <span>My Leads</span>
        </label>
        <button className="crm-btn crm-btn-ghost" onClick={loadLeads}>Refresh</button>
      </section>

      {loading ? <div className="crm-state">Loading leads...</div> : null}
      {!loading && error ? <div className="crm-state crm-state-error">Error: {error}</div> : null}
      {!loading && !error && leads.length === 0 ? <div className="crm-state">No leads found yet. Add your first lead.</div> : null}
      {!loading && !error && leads.length > 0 ? (
        <LeadsTable
          leads={leadsForTable}
          onEdit={openEditModal}
          onDelete={setDeleteTarget}
          onRowOpen={openDrawer}
          onLogCall={handleLogCall}
          onLogWhatsapp={handleLogWhatsapp}
          onLogEmailTemplate={handleLogEmailTemplate}
        />
      ) : null}

      <LeadFormModal
        open={modalOpen}
        initialLead={selectedLead}
        onClose={closeModal}
        onSave={handleSaveLead}
        saving={saving}
        saveError={modalSaveError}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete lead?"
        description={deleteTarget ? `This will permanently delete ${deleteTarget.full_name}.` : ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteLead}
        confirming={deleting}
      />

      <LeadDetailsDrawer
        open={Boolean(drawerLead)}
        lead={drawerLead}
        timeline={timeline}
        agents={agentOptions}
        onClose={closeDrawer}
        onSave={saveDrawerLead}
        onMarkDone={handleMarkFollowUpDone}
        onLogCall={handleLogCall}
        onLogWhatsapp={handleLogWhatsapp}
        emailTemplatePicker={emailPicker}
      />

      <ToastHost toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default Leads
