import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, MapPin } from 'lucide-react'
import AdminLayout from './components/AdminLayout'
import DashboardHero from './components/DashboardHero'
import SummaryCards from './components/SummaryCards'
import LeadsPerDayChart from './components/LeadsPerDayChart'
import PipelineFunnel from './components/PipelineFunnel'
import SourceBreakdown from './components/SourceBreakdown'
import FollowUpList from './components/FollowUpList'
import UpcomingDeadlines from './components/UpcomingDeadlines'
import GroupBookingsDashboardPanel from './components/GroupBookingsDashboardPanel'
import './passenger-import.css'
import { buildAnalytics } from './api/analyticsApi'
import { markFollowUpDone } from './api/leadsApi'
import { addLeadActivity } from './api/activitiesApi'
import { fetchClients, fetchClientsWithExpiringPassports } from './api/clientsApi'
import { fetchOverdueTasksCount } from './api/teamApi'
import { useAdminLeads } from './hooks/useAdminLeads'
import { parseLeadName } from './utils/leadName'
import { countFollowUps, filterFollowUps } from './utils/followUp'
import './Leads.css'

function Dashboard() {
  const { leads, setLeads, loading, error, reload } = useAdminLeads()
  const [passportCounts, setPassportCounts] = useState({ expiring: 0, expired: 0 })
  const [overdueDeadlines, setOverdueDeadlines] = useState(0)
  const [clientCount, setClientCount] = useState(0)

  useEffect(() => {
    const loadExtras = async () => {
      const [passportRes, clientsRes, overdueRes] = await Promise.all([
        fetchClientsWithExpiringPassports(90),
        fetchClients(),
        fetchOverdueTasksCount()
      ])
      if (passportRes.data) {
        setPassportCounts({
          expiring: passportRes.data.expiring.length,
          expired: passportRes.data.expired.length
        })
      }
      if (!clientsRes.error) setClientCount(clientsRes.data?.length || 0)
      if (!overdueRes.error) setOverdueDeadlines(overdueRes.count)
    }
    loadExtras()
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

  const recentLeads = useMemo(() => leads.slice(0, 10), [leads])
  const followUpCounts = useMemo(() => countFollowUps(leads), [leads])
  const todayFollowUps = useMemo(() => filterFollowUps(leads, 'today').slice(0, 5), [leads])
  const topDestinations = stats.topDestinations || []

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
      subtitle="Your travel agency command centre — leads, pipeline, clients, revenue, and team in one view."
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
      <DashboardHero
        stats={stats}
        followUpCounts={followUpCounts}
        passportCounts={passportCounts}
        overdueDeadlines={overdueDeadlines}
        clientCount={clientCount}
      />

      <UpcomingDeadlines />

      <GroupBookingsDashboardPanel />

      <div className="crm-dashboard crm-dashboard--premium">
        <div className="crm-dash-bento">
          <section className="crm-dash-panel crm-dash-panel--funnel">
            <header className="crm-dash-panel__head">
              <div>
                <h3>Sales funnel</h3>
                <p>Where enquiries sit in your booking journey</p>
              </div>
              <Link to="/admin/pipeline" className="crm-dash-panel__link">
                Open pipeline <ArrowUpRight size={14} aria-hidden />
              </Link>
            </header>
            <PipelineFunnel funnel={stats.pipelineFunnel || []} />
          </section>

          <LeadsPerDayChart data={stats.leadsPerDay || []} />

          <section className="crm-dash-panel crm-dash-panel--sources">
            <header className="crm-dash-panel__head">
              <div>
                <h3>Lead channels</h3>
                <p>Where new business is coming from</p>
              </div>
            </header>
            <SourceBreakdown items={stats.sourceBreakdown || []} />
          </section>

          <section className="crm-dash-panel crm-dash-panel--destinations">
            <header className="crm-dash-panel__head">
              <div>
                <h3>Top destinations</h3>
                <p>Most requested travel destinations</p>
              </div>
            </header>
            {topDestinations.length === 0 ? (
              <p className="crm-muted-inline">Destination data will appear as leads come in.</p>
            ) : (
              <ul className="crm-dash-destinations">
                {topDestinations.map((item, index) => (
                  <li key={item.destination} className="crm-dash-destinations__item">
                    <span className="crm-dash-destinations__rank">{index + 1}</span>
                    <MapPin size={14} aria-hidden />
                    <span className="crm-dash-destinations__name">{item.destination}</span>
                    <strong>{item.count}</strong>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <SummaryCards stats={stats} />
      </div>

      {todayFollowUps.length > 0 ? (
        <section className="crm-workspace crm-workspace--premium">
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

      <section className="crm-workspace crm-workspace--premium">
        <div className="crm-workspace__head">
          <div>
            <h2 className="crm-workspace__title">Recent leads</h2>
            <p className="crm-workspace__subtitle">Latest enquiries landing in your CRM.</p>
          </div>
          <Link to="/admin/leads" className="crm-btn crm-btn-ghost crm-btn--dark">
            View all leads
          </Link>
        </div>

        {loading ? <div className="crm-state">Loading dashboard…</div> : null}
        {!loading && error ? <div className="crm-state crm-state-error">Error: {error}</div> : null}
        {!loading && !error && recentLeads.length === 0 ? (
          <div className="crm-state">
            No leads yet. <Link to="/admin/leads">Add your first lead</Link>.
          </div>
        ) : null}
        {!loading && !error && recentLeads.length > 0 ? (
          <div className="crm-table-wrap crm-table-wrap--premium">
            <table className="crm-table crm-table--premium">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => {
                  const { first_name, last_name } = parseLeadName(lead)
                  const fullName = [first_name, last_name].filter(Boolean).join(' ') || '—'
                  return (
                    <tr key={lead.id}>
                      <td>
                        <strong>{fullName}</strong>
                      </td>
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
