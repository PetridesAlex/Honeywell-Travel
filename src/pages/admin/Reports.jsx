import { useMemo } from 'react'
import AdminLayout from './components/AdminLayout'
import SourceBreakdown from './components/SourceBreakdown'
import PipelineFunnel from './components/PipelineFunnel'
import LeadsPerDayChart from './components/LeadsPerDayChart'
import { buildAnalytics } from './api/analyticsApi'
import { useAdminLeads } from './hooks/useAdminLeads'
import { exportLeadsToCsv } from './utils/exportLeads'
import './Leads.css'

function Reports() {
  const { leads, loading, error, reload } = useAdminLeads()

  const stats = useMemo(() => buildAnalytics(leads), [leads])

  return (
    <AdminLayout
      title="Reports"
      subtitle="Channel performance, booking funnel, and revenue for Honeywell Travel."
      actions={
        <>
          <button
            type="button"
            className="crm-btn crm-btn-ghost crm-btn--dark"
            onClick={() => exportLeadsToCsv(leads)}
            disabled={!leads.length}
          >
            Export CSV
          </button>
          <button type="button" className="crm-btn crm-btn-primary" onClick={reload}>
            Refresh
          </button>
        </>
      }
    >
      <div className="crm-reports-grid">
        <section className="crm-chart-card">
          <h3>Booking funnel</h3>
          <PipelineFunnel funnel={stats.pipelineFunnel || []} />
          <p className="crm-report-note">
            Quote-to-book rate: <strong>{stats.quoteToBookRate}%</strong> · Overall conversion:{' '}
            <strong>{stats.conversionRate}%</strong>
          </p>
        </section>

        <section className="crm-chart-card">
          <h3>Leads by source</h3>
          <SourceBreakdown items={stats.sourceBreakdown || []} />
        </section>

        <section className="crm-chart-card">
          <h3>Leads per day (7 days)</h3>
          <LeadsPerDayChart data={stats.leadsPerDay || []} />
        </section>

        <section className="crm-chart-card">
          <h3>Trip types</h3>
          {(stats.tripTypeBreakdown || []).length === 0 ? (
            <p className="crm-muted-inline">Add trip type on leads to see breakdown.</p>
          ) : (
            <div className="crm-destination-list">
              {stats.tripTypeBreakdown.map((item) => (
                <div key={item.tripType} className="crm-destination-item">
                  <span>{item.tripType}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="crm-chart-card crm-reports-revenue">
          <h3>Revenue snapshot</h3>
          <div className="crm-revenue-grid">
            <div className="crm-revenue-card">
              <span>Pipeline value</span>
              <strong>€{Math.round(stats.totalPipelineValue || 0).toLocaleString()}</strong>
            </div>
            <div className="crm-revenue-card">
              <span>Confirmed revenue</span>
              <strong>€{Math.round(stats.confirmedRevenue || 0).toLocaleString()}</strong>
            </div>
            <div className="crm-revenue-card">
              <span>Lost deals</span>
              <strong>€{Math.round(stats.lostRevenue || 0).toLocaleString()}</strong>
            </div>
            <div className="crm-revenue-card">
              <span>Leads this week</span>
              <strong>{stats.leadsThisWeek || 0}</strong>
            </div>
          </div>
        </section>

        <section className="crm-chart-card">
          <h3>Top destinations</h3>
          <div className="crm-destination-list">
            {(stats.topDestinations || []).map((item) => (
              <div key={item.destination} className="crm-destination-item">
                <span>{item.destination}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      {loading ? <div className="crm-state">Loading reports...</div> : null}
      {!loading && error ? <div className="crm-state crm-state-error">Error: {error}</div> : null}
    </AdminLayout>
  )
}

export default Reports
