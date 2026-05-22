import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import FollowUpList from './components/FollowUpList'
import { markFollowUpDone } from './api/leadsApi'
import { addLeadActivity } from './api/activitiesApi'
import { useAdminLeads } from './hooks/useAdminLeads'
import { countFollowUps, filterFollowUps } from './utils/followUp'
import './Leads.css'

const TABS = [
  { id: 'today', label: 'Due today' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'upcoming', label: 'Next 7 days' }
]

function FollowUps() {
  const { leads, setLeads, loading, error, reload } = useAdminLeads()
  const [tab, setTab] = useState('today')

  const counts = useMemo(() => countFollowUps(leads), [leads])
  const filtered = useMemo(() => filterFollowUps(leads, tab), [leads, tab])

  const handleMarkDone = async (id) => {
    const { data, error: markError } = await markFollowUpDone(id)
    if (markError) return
    setLeads((prev) => prev.map((item) => (item.id === id ? data : item)))
    await addLeadActivity({
      leadId: id,
      type: 'follow_up_done',
      description: 'Follow-up marked done from Follow-ups page',
      metadata: {}
    })
  }

  return (
    <AdminLayout
      title="Follow-ups"
      subtitle="Daily call list for your travel consultants — never miss a quote follow-up."
      actions={
        <>
          <Link to="/admin/leads" className="crm-btn crm-btn-ghost crm-btn--dark">
            All leads
          </Link>
          <button type="button" className="crm-btn crm-btn-primary" onClick={reload}>
            Refresh
          </button>
        </>
      }
    >
      <div className="crm-followup-tabs">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`crm-chip${tab === item.id ? ' crm-chip--active' : ''}${item.id === 'overdue' ? ' crm-chip--danger' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label} ({counts[item.id] || 0})
          </button>
        ))}
      </div>

      <section className="crm-workspace">
        {loading ? <div className="crm-state">Loading follow-ups...</div> : null}
        {!loading && error ? <div className="crm-state crm-state-error">Error: {error}</div> : null}
        {!loading && !error ? <FollowUpList leads={filtered} onMarkDone={handleMarkDone} /> : null}
      </section>
    </AdminLayout>
  )
}

export default FollowUps
