import { useMemo } from 'react'
import AdminLayout from './components/AdminLayout'
import PipelineBoard from './components/PipelineBoard'
import { updateLead } from './api/leadsApi'
import { addLeadActivity } from './api/activitiesApi'
import { useAdminLeads } from './hooks/useAdminLeads'
import './Leads.css'

function Pipeline() {
  const { leads, setLeads, loading, error, reload } = useAdminLeads()

  const pipelineValue = useMemo(
    () => leads.reduce((sum, lead) => sum + Number(lead.deal_value || 0), 0),
    [leads]
  )

  const handleStatusChange = async (lead, nextStatus) => {
    if (nextStatus === lead.status) return
    const { data, error: saveError } = await updateLead(lead.id, { status: nextStatus })
    if (saveError) return
    setLeads((prev) => prev.map((item) => (item.id === lead.id ? { ...item, ...data } : item)))
    await addLeadActivity({
      leadId: lead.id,
      type: 'status_updated',
      description: `Pipeline: ${lead.status} → ${nextStatus}`,
      metadata: { from: lead.status, to: nextStatus }
    })
  }

  return (
    <AdminLayout
      title="Sales pipeline"
      subtitle="Drag enquiries through New → Contacted → Quoted → Confirmed. Update status on each card."
      actions={
        <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={reload}>
          Refresh
        </button>
      }
    >
      <div className="crm-pipeline-summary">
        <div className="crm-stat-pill">
          <span>Active leads</span>
          <strong>{leads.filter((l) => l.status !== 'Lost').length}</strong>
        </div>
        <div className="crm-stat-pill">
          <span>Pipeline value</span>
          <strong>€{Math.round(pipelineValue).toLocaleString()}</strong>
        </div>
        <div className="crm-stat-pill">
          <span>Confirmed</span>
          <strong>{leads.filter((l) => l.status === 'Confirmed').length}</strong>
        </div>
      </div>

      {loading ? <div className="crm-state">Loading pipeline...</div> : null}
      {!loading && error ? <div className="crm-state crm-state-error">Error: {error}</div> : null}
      {!loading && !error ? (
        <PipelineBoard leads={leads} onStatusChange={handleStatusChange} />
      ) : null}
    </AdminLayout>
  )
}

export default Pipeline
