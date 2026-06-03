import { useCallback, useMemo, useState } from 'react'
import AdminLayout from './components/AdminLayout'
import PipelineBoard from './components/PipelineBoard'
import { updateLead } from './api/leadsApi'
import { addLeadActivity } from './api/activitiesApi'
import { useAdminLeads } from './hooks/useAdminLeads'
import { leadIdsMatch, normalizeLeadStatus } from './constants'
import './Leads.css'

function Pipeline() {
  const { leads, setLeads, loading, error, reload } = useAdminLeads()
  const [statusError, setStatusError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const pipelineValue = useMemo(
    () => leads.reduce((sum, lead) => sum + Number(lead.deal_value || 0), 0),
    [leads]
  )

  const patchLeadInList = useCallback((leadId, patch) => {
    setLeads((prev) =>
      prev.map((item) => (leadIdsMatch(item.id, leadId) ? { ...item, ...patch } : item))
    )
  }, [setLeads])

  const handleStatusChange = useCallback(
    async (lead, nextStatusRaw) => {
      const leadId = lead.id
      const nextStatus = normalizeLeadStatus(nextStatusRaw)
      const currentStatus = normalizeLeadStatus(lead.status)

      if (!leadId || nextStatus === currentStatus) return

      setStatusError('')
      setUpdatingId(leadId)

      const optimisticPatch =
        nextStatus === 'Confirmed'
          ? { status: nextStatus, trip_completed_date: new Date().toISOString().slice(0, 10) }
          : { status: nextStatus }

      patchLeadInList(leadId, optimisticPatch)

      const { data, error: saveError } = await updateLead(leadId, { status: nextStatus })
      setUpdatingId(null)

      if (saveError) {
        patchLeadInList(leadId, { status: currentStatus })
        setStatusError(saveError.message || 'Could not update lead status.')
        return
      }

      patchLeadInList(leadId, { ...data, status: nextStatus })

      const { error: activityError } = await addLeadActivity({
        leadId,
        type: 'status_updated',
        description: `Pipeline: ${currentStatus} → ${nextStatus}`,
        metadata: { from: currentStatus, to: nextStatus }
      })

      if (activityError) {
        console.warn('Lead activity log failed:', activityError.message)
      }
    },
    [patchLeadInList]
  )

  return (
    <AdminLayout
      title="Sales pipeline"
      subtitle="Live kanban board — move enquiries through each stage with smooth status updates."
      actions={
        <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={reload}>
          Refresh
        </button>
      }
    >
      <div className="crm-pipeline-summary">
        <div className="crm-stat-pill">
          <span>Active leads</span>
          <strong>{leads.filter((l) => normalizeLeadStatus(l.status) !== 'Lost').length}</strong>
        </div>
        <div className="crm-stat-pill">
          <span>Pipeline value</span>
          <strong>€{Math.round(pipelineValue).toLocaleString()}</strong>
        </div>
        <div className="crm-stat-pill">
          <span>Confirmed</span>
          <strong>{leads.filter((l) => normalizeLeadStatus(l.status) === 'Confirmed').length}</strong>
        </div>
      </div>

      {statusError ? (
        <div className="crm-state crm-state-error" role="alert">
          {statusError}
        </div>
      ) : null}

      {loading ? <div className="crm-state">Loading pipeline...</div> : null}
      {!loading && error ? <div className="crm-state crm-state-error">Error: {error}</div> : null}
      {!loading && !error ? (
        <PipelineBoard leads={leads} onStatusChange={handleStatusChange} updatingId={updatingId} />
      ) : null}
    </AdminLayout>
  )
}

export default Pipeline
