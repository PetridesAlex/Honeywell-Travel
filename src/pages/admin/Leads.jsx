import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from './components/AdminLayout'
import LeadsTable from './components/LeadsTable'
import LeadFormModal from './components/LeadFormModal'
import ClientFormModal from './components/ClientFormModal'
import { createClient, findOrCreateClientFromLead, updateClient } from './api/clientsApi'
import ConfirmDialog from './components/ConfirmDialog'
import LeadDetailsDrawer from './components/LeadDetailsDrawer'
import ToastHost from './components/ToastHost'
import EmailTemplatePicker from './components/EmailTemplatePicker'
import { buildLeadPayload, leadDisplayName, parseLeadName } from './utils/leadName'
import { exportLeadsToCsv } from './utils/exportLeads'
import { EMPTY_LEAD, SOURCE_OPTIONS, STATUS_OPTIONS } from './constants'
import { addLeadActivity, fetchLeadActivities } from './api/activitiesApi'
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
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sourceFilter, setSourceFilter] = useState('All')
  const [agentFilter, setAgentFilter] = useState('All')
  const [myLeadsOnly, setMyLeadsOnly] = useState(false)
  const [quickFilter, setQuickFilter] = useState('all')
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
  const [clientModalOpen, setClientModalOpen] = useState(false)
  const [clientModalTarget, setClientModalTarget] = useState(null)
  const [clientSaving, setClientSaving] = useState(false)
  const [clientSaveError, setClientSaveError] = useState('')

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
    loadLeads()

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
  }, [])

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
    const today = new Date()
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const tomorrow = new Date(todayMidnight)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return leads.filter(lead => {
      const { first_name, last_name, full_name } = parseLeadName(lead)
      const matchesSearch = !normalizedSearch || [
        first_name,
        last_name,
        full_name,
        lead.phone,
        lead.email,
        lead.destination
      ].some(value => (value || '').toLowerCase().includes(normalizedSearch))

      const matchesStatus = statusFilter === 'All' || (lead.status || 'New') === statusFilter
      const matchesSource = sourceFilter === 'All' || (lead.source || 'Website') === sourceFilter
      const matchesAgent = agentFilter === 'All' || (lead.assigned_agent || '') === agentFilter
      const matchesMine = !myLeadsOnly || (lead.assigned_agent || '') === (currentUser?.email || currentUser?.id || '')

      let matchesQuick = true
      if (quickFilter === 'followups_today') {
        matchesQuick = Boolean(
          lead.follow_up_date &&
          new Date(lead.follow_up_date) >= todayMidnight &&
          new Date(lead.follow_up_date) < tomorrow
        )
      } else if (quickFilter === 'overdue') {
        matchesQuick = Boolean(lead.follow_up_date && new Date(lead.follow_up_date) < todayMidnight)
      } else if (quickFilter === 'followups_due') {
        matchesQuick = Boolean(
          lead.follow_up_date &&
          new Date(lead.follow_up_date) <= todayMidnight
        )
      }

      return matchesSearch && matchesStatus && matchesSource && matchesAgent && matchesMine && matchesQuick
    })
  }, [leads, searchTerm, statusFilter, sourceFilter, agentFilter, myLeadsOnly, quickFilter, currentUser])

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    statusFilter !== 'All' ||
    sourceFilter !== 'All' ||
    agentFilter !== 'All' ||
    myLeadsOnly ||
    quickFilter !== 'all'

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('All')
    setSourceFilter('All')
    setAgentFilter('All')
    setMyLeadsOnly(false)
    setQuickFilter('all')
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    setQuickFilter('all')
  }

  const handleQuickFilter = (filter) => {
    setQuickFilter((prev) => (prev === filter ? 'all' : filter))
    if (filter !== 'all') setStatusFilter('All')
  }

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

    const payload = buildLeadPayload({
      ...EMPTY_LEAD,
      ...form,
      follow_up_date: form.follow_up_date || null
    })

    if (!payload.first_name || !payload.last_name) {
      setModalSaveError('Please enter both name and surname.')
      setSaving(false)
      return
    }

    if (!payload.email) {
      setModalSaveError('Please enter an email address.')
      setSaving(false)
      return
    }

    const { data: client, error: clientError } = await findOrCreateClientFromLead({
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      phone: payload.phone,
      client_id: selectedLead?.client_id || payload.client_id
    })

    if (clientError) {
      console.warn('Client profile link skipped:', clientError.message)
    } else if (client?.id) {
      payload.client_id = client.id
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

    const enriched = client ? { ...data, client } : data

    if (selectedLead?.id) {
      setLeads(prev => prev.map(item => (item.id === selectedLead.id ? enriched : item)))
      await addLeadActivity({
        leadId: selectedLead.id,
        type: 'updated',
        description: 'Lead updated',
        metadata: { status: payload.status }
      })
    } else {
      setLeads(prev => [enriched, ...prev])
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
    const merged = { ...current, ...payload }
    const { data: client, error: clientError } = await findOrCreateClientFromLead({
      first_name: merged.first_name,
      last_name: merged.last_name,
      email: merged.email,
      phone: merged.phone,
      client_id: merged.client_id
    })
    if (clientError) {
      console.warn('Client profile link skipped:', clientError.message)
    } else if (client?.id) {
      merged.client_id = client.id
    }

    const { data, error: saveError } = await updateLead(id, merged)
    if (saveError) {
      setError(saveError.message)
      pushToast('Failed to save lead changes', 'error')
      return
    }
    const enriched = client ? { ...data, client } : data
    setLeads(prev => prev.map(item => (item.id === id ? enriched : item)))
    if (drawerLead?.id === id) setDrawerLead(enriched)
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

  const emailPicker = drawerLead ? (
    <EmailTemplatePicker
      lead={drawerLead}
      onLog={(template) => logAction(drawerLead.id, 'email_sent', `Email template used: ${template}`, { template })}
    />
  ) : null

  const handleLogCall = (lead) => logAction(lead.id, 'called', 'Call action opened', {})
  const handleLogWhatsapp = (lead) => logAction(lead.id, 'whatsapp_opened', 'WhatsApp action opened', {})
  const handleLogEmailTemplate = (lead, template) => logAction(lead.id, 'email_sent', `Email template used: ${template}`, { template })

  const openClientModal = (lead) => {
    const names = parseLeadName(lead)
    const client = lead?.client || {
      ...names,
      email: lead?.email,
      phone: lead?.phone
    }
    setClientSaveError('')
    setClientModalTarget({ leadId: lead.id, client })
    setClientModalOpen(true)
  }

  const handleSaveClient = async (form) => {
    if (!clientModalTarget) return
    setClientSaving(true)
    setClientSaveError('')

    const lead = leads.find((item) => item.id === clientModalTarget.leadId)
    const existingClient = clientModalTarget.client

    let clientRecord = existingClient
    if (existingClient?.id) {
      const { data, error: updateError } = await updateClient(existingClient.id, form)
      if (updateError) {
        setClientSaveError(updateError.message)
        setClientSaving(false)
        return
      }
      clientRecord = data
    } else {
      const { data: created, error: createError } = await createClient(form)
      if (createError) {
        setClientSaveError(createError.message)
        setClientSaving(false)
        return
      }
      clientRecord = created
      if (lead?.id && clientRecord?.id) {
        const { data: linked } = await updateLead(lead.id, { client_id: clientRecord.id })
        if (linked) clientRecord = { ...clientRecord }
      }
    }

    if (lead?.id) {
      setLeads((prev) =>
        prev.map((item) =>
          item.id === lead.id ? { ...item, client_id: clientRecord.id, client: clientRecord } : item
        )
      )
      if (drawerLead?.id === lead.id) {
        setDrawerLead((prev) => ({ ...prev, client_id: clientRecord.id, client: clientRecord }))
      }
    }

    setClientSaving(false)
    setClientModalOpen(false)
    setClientModalTarget(null)
    pushToast('Client profile saved', 'success')
  }

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

  return (
    <AdminLayout
      title="Leads"
      subtitle="Manage all enquiries — name, surname, and email are saved for every lead."
      actions={
        <>
          <button
            type="button"
            className="crm-btn crm-btn-ghost crm-btn--dark"
            onClick={() => exportLeadsToCsv(filteredLeads)}
            disabled={!filteredLeads.length}
          >
            Export CSV
          </button>
          <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={loadLeads}>
            Refresh
          </button>
          <button type="button" className="crm-btn crm-btn-primary" onClick={openCreateModal}>
            + Add Lead
          </button>
        </>
      }
    >
      <section className="crm-workspace">
        <div className="crm-workspace__head">
          <div>
            <h2 className="crm-workspace__title">Lead inbox</h2>
            <p className="crm-workspace__subtitle">
              {filteredLeads.length} of {leads.length} leads shown
              {hasActiveFilters ? ' · filters active' : ''}
            </p>
          </div>
          {hasActiveFilters ? (
            <button type="button" className="crm-btn crm-btn-ghost" onClick={clearFilters}>
              Clear filters
            </button>
          ) : null}
        </div>

        <section className="crm-filters-panel">
          <div className="crm-filter-chips" role="toolbar" aria-label="Quick filters">
            <button
              type="button"
              className={`crm-chip${quickFilter === 'all' && statusFilter === 'All' ? ' crm-chip--active' : ''}`}
              onClick={() => {
                setQuickFilter('all')
                setStatusFilter('All')
              }}
            >
              All leads
            </button>
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                type="button"
                className={`crm-chip crm-chip--${status.toLowerCase()}${statusFilter === status ? ' crm-chip--active' : ''}`}
                onClick={() => handleStatusFilter(statusFilter === status ? 'All' : status)}
              >
                {status}
              </button>
            ))}
            <button
              type="button"
              className={`crm-chip crm-chip--alert${quickFilter === 'followups_today' ? ' crm-chip--active' : ''}`}
              onClick={() => handleQuickFilter('followups_today')}
            >
              Follow-up today
            </button>
            <button
              type="button"
              className={`crm-chip crm-chip--danger${quickFilter === 'overdue' ? ' crm-chip--active' : ''}`}
              onClick={() => handleQuickFilter('overdue')}
            >
              Overdue
            </button>
            <button
              type="button"
              className={`crm-chip${myLeadsOnly ? ' crm-chip--active' : ''}`}
              onClick={() => setMyLeadsOnly((prev) => !prev)}
              disabled={!myAgentKey}
            >
              My leads
            </button>
          </div>

          <div className="crm-filters-grid">
            <label className="crm-filter-field crm-filter-field--search">
              <span>Search</span>
              <input
                type="search"
                placeholder="Name, phone, email, destination…"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>
            <label className="crm-filter-field">
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value)
                  setQuickFilter('all')
                }}
              >
                <option value="All">All statuses</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="crm-filter-field">
              <span>Source</span>
              <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
                <option value="All">All sources</option>
                {SOURCE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="crm-filter-field">
              <span>Assigned agent</span>
              <select value={agentFilter} onChange={(event) => setAgentFilter(event.target.value)}>
                <option value="All">All agents</option>
                {agentOptions.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {loading ? <div className="crm-state">Loading leads...</div> : null}
        {!loading && error ? <div className="crm-state crm-state-error">Error: {error}</div> : null}
        {!loading && !error && leads.length === 0 ? (
          <div className="crm-state">No leads found yet. Add your first lead.</div>
        ) : null}
        {!loading && !error && leads.length > 0 && filteredLeads.length === 0 ? (
          <div className="crm-state">No leads match your filters. Try clearing filters or broadening your search.</div>
        ) : null}
        {!loading && !error && filteredLeads.length > 0 ? (
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
      </section>

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
        description={deleteTarget ? `This will permanently delete ${leadDisplayName(deleteTarget)}.` : ''}
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
        onEditClient={() => drawerLead && openClientModal(drawerLead)}
        emailTemplatePicker={emailPicker}
      />

      <ClientFormModal
        open={clientModalOpen}
        initialClient={clientModalTarget?.client}
        onClose={() => {
          setClientModalOpen(false)
          setClientModalTarget(null)
        }}
        onSave={handleSaveClient}
        saving={clientSaving}
        saveError={clientSaveError}
      />

      <ToastHost toasts={toasts} onDismiss={dismissToast} />
    </AdminLayout>
  )
}

export default Leads
