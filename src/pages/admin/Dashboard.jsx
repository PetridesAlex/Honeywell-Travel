import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import SummaryCards from './components/SummaryCards'
import LeadsPerDayChart from './components/LeadsPerDayChart'
import PipelineFunnel from './components/PipelineFunnel'
import SourceBreakdown from './components/SourceBreakdown'
import FollowUpList from './components/FollowUpList'
import UpcomingDeadlines from './components/UpcomingDeadlines'
import { buildAnalytics } from './api/analyticsApi'
import { markFollowUpDone } from './api/leadsApi'
import { addLeadActivity } from './api/activitiesApi'
import { fetchClientsWithExpiringPassports } from './api/clientsApi'
import { fetchOverdueTasksCount } from './api/teamApi'
import { useAdminLeads } from './hooks/useAdminLeads'
import { parseLeadName } from './utils/leadName'
import { countFollowUps, filterFollowUps } from './utils/followUp'
import './Leads.css'

function Dashboard() {
  const { leads, setLeads, loading, error, reload } = useAdminLeads()
  const [passportCounts, setPassportCounts] = useState({ expiring: 0, expired: 0 })
  const [overdueDeadlines, setOverdueDeadlines] = useState(0)

  useEffect(() => {
    const loadPassportCounts = async () => {
      const { data } = await fetchClientsWithExpiringPassports(90)
      if (data) {
        setPassportCounts({
          expiring: data.expiring.length,
          expired: data.expired.length
        })
      }
    }
    loadPassportCounts()
    fetchOverdueTasksCount().then(({ count }) => setOverdueDeadlines(count))
  }, [loading])

  const stats = useMemo(() => {
    const countByStatus = (value) => leads.filter((lead) => (lead.status || 'New') === value).length
    const today = new Date()
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const tomorrow = new Date(todayMidnight)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const followUpsDue = leads.filter((lead) => {
      if (!lead.follow_up_date) return false
      const followDate = new Date(lead.follow_up_date)
      const followMidnight = new Date(followDate.getFullYear(), followDate.getMonth(), followDate.getDate())
      return followMidnight <= todayMidnight
    }).length

    const followUpsToday = leads.filter(
      (lead) =>
        lead.follow_up_date &&
        new Date(lead.follow_up_date) >= todayMidnight &&
        new Date(lead.follow_up_date) < tomorrow
    ).length

    const overdueFollowUps = leads.filter(
      (lead) => lead.follow_up_date && new Date(lead.follow_up_date) < todayMidnight
    ).length

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
      ...buildAnalytics(leads)
    }
  }, [leads])

  const recentLeads = useMemo(() => leads.slice(0, 12), [leads])
  const followUpCounts = useMemo(() => countFollowUps(leads), [leads])
  const todayFollowUps = useMemo(() => filterFollowUps(leads, 'today').slice(0, 5), [leads])
  const handleMarkDone = async (id) => {
    const { data } = await markFollowUpDone(id)
    if (data) {
      setLeads((prev) => prev.map((item) => (item.id === id ? data : item)))
      await addLeadActivity({
        leadId: id,
        type: 'follow_up_done',
        description: 'Follow-up marked done from dashboard',
        metadata: {}
      })
    }
  }

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Your travel agency command centre — pipeline, follow-ups, and new enquiries."
      actions={
        <>
          <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={reload}>
            Refresh
          </button>
          <Link to="/admin/leads" className="crm-btn crm-btn-primary">
            + Add Lead
          </Link>
        </>
      }
    >
      <div className="crm-quick-actions">
        <Link to="/admin/follow-ups" className="crm-quick-card">
          <span>Follow-ups due</span>
          <strong>{followUpCounts.today + followUpCounts.overdue}</strong>
          <small>{followUpCounts.overdue} overdue</small>
        </Link>
        <Link to="/admin/pipeline" className="crm-quick-card">
          <span>Open pipeline</span>
          <strong>{stats.quoted + stats.confirmed}</strong>
          <small>Quoted + confirmed</small>
        </Link>
        <Link to="/admin/reports" className="crm-quick-card">
          <span>Confirmed revenue</span>
          <strong>€{Math.round(stats.confirmedRevenue || 0).toLocaleString()}</strong>
          <small>View full reports</small>
        </Link>
        <Link to="/admin/clients?filter=expiring_soon" className="crm-quick-card">
          <span>Passports expiring</span>
          <strong>{passportCounts.expiring}</strong>
          <small>Within 90 days</small>
        </Link>
        <Link to="/admin/clients?filter=expired" className="crm-quick-card crm-quick-card--alert">
          <span>Expired passports</span>
          <strong>{passportCounts.expired}</strong>
          <small>Needs renewal</small>
        </Link>
        <Link to="/admin/team" className={`crm-quick-card${overdueDeadlines > 0 ? ' crm-quick-card--alert' : ''}`}>
          <span>Overdue deadlines</span>
          <strong>{overdueDeadlines}</strong>
          <small>Check-ins &amp; tasks</small>
        </Link>
      </div>

      <UpcomingDeadlines />

      <div className="crm-dashboard">
        <SummaryCards stats={stats} />

        <div className="crm-insight-grid crm-insight-grid--3">
          <section className="crm-chart-card">
            <h3>Sales funnel</h3>
            <PipelineFunnel funnel={stats.pipelineFunnel || []} />
          </section>
          <LeadsPerDayChart data={stats.leadsPerDay || []} />
          <section className="crm-chart-card">
            <h3>Leads by channel</h3>
            <SourceBreakdown items={stats.sourceBreakdown || []} />
          </section>
        </div>
      </div>

      {todayFollowUps.length > 0 ? (
        <section className="crm-workspace">
          <div className="crm-workspace__head">
            <div>
              <h2 className="crm-workspace__title">Today&apos;s follow-ups</h2>
              <p className="crm-workspace__subtitle">Call or message these clients before end of day.</p>
            </div>
            <Link to="/admin/follow-ups" className="crm-btn crm-btn-ghost crm-btn--dark">
              View all
            </Link>
          </div>
          <FollowUpList leads={todayFollowUps} onMarkDone={handleMarkDone} />
        </section>
      ) : null}

      <section className="crm-workspace">
        <div className="crm-workspace__head">
          <div>
            <h2 className="crm-workspace__title">Recent leads</h2>
            <p className="crm-workspace__subtitle">
              Latest enquiries with name, surname, and email saved to your database.
            </p>
          </div>
          <Link to="/admin/leads" className="crm-btn crm-btn-ghost crm-btn--dark">
            View all leads
          </Link>
        </div>

        {loading ? <div className="crm-state">Loading dashboard...</div> : null}
        {!loading && error ? <div className="crm-state crm-state-error">Error: {error}</div> : null}
        {!loading && !error && recentLeads.length === 0 ? (
          <div className="crm-state">
            No leads yet.{' '}
            <Link to="/admin/leads">Add your first lead</Link>.
          </div>
        ) : null}
        {!loading && !error && recentLeads.length > 0 ? (
          <div className="crm-table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Surname</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => {
                  const { first_name, last_name } = parseLeadName(lead)
                  return (
                    <tr key={lead.id}>
                      <td>{first_name || '—'}</td>
                      <td>{last_name || '—'}</td>
                      <td>{lead.email || '—'}</td>
                      <td>
                        <span className={`crm-status crm-status-${(lead.status || 'new').toLowerCase()}`}>
                          {lead.status || 'New'}
                        </span>
                      </td>
                      <td>{lead.source || '—'}</td>
                      <td>{lead.created_at ? new Date(lead.created_at).toLocaleString() : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </AdminLayout>
  )
}

export default Dashboard
