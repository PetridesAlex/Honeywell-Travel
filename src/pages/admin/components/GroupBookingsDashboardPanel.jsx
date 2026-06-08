import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Ship, Upload } from 'lucide-react'
import { fetchTravelGroupStats } from '../api/travelGroupsApi'
import { fetchPassengersWithPassportWarnings } from '../api/passengersApi'
import { getPassportExpiryWarning } from '../utils/passport'

function GroupBookingsDashboardPanel() {
  const [stats, setStats] = useState({ totalGroups: 0, totalPassengers: 0, upcomingDepartures: 0 })
  const [passportAlerts, setPassportAlerts] = useState(0)

  useEffect(() => {
    const load = async () => {
      const [statsRes, paxRes] = await Promise.all([fetchTravelGroupStats(), fetchPassengersWithPassportWarnings()])
      if (statsRes.data) setStats(statsRes.data)
      if (!paxRes.error) {
        setPassportAlerts((paxRes.data || []).filter((p) => getPassportExpiryWarning(p.passport_expiry)).length)
      }
    }
    load()
  }, [])

  return (
    <section className="crm-dash-panel crm-dash-panel--groups">
      <header className="crm-dash-panel__head crm-dash-panel__head--groups-premium">
        <div className="crm-dash-panel__head-copy">
          <p className="crm-dash-panel__eyebrow crm-dash-panel__eyebrow--groups">Group travel operations</p>
          <div className="crm-dash-panel__title-row">
            <span className="crm-dash-panel__title-icon crm-dash-panel__title-icon--groups" aria-hidden="true">
              <Ship size={17} strokeWidth={2.25} />
            </span>
            <h3>Group bookings &amp; passenger rosters</h3>
          </div>
          <p className="crm-dash-panel__subtitle">
            Manage tour folders, import traveller lists, and monitor departure readiness from one
            workspace.
          </p>
        </div>
        <Link to="/admin/group-bookings" className="crm-dash-panel__link crm-dash-panel__link--groups">
          View module
          <ArrowUpRight size={14} aria-hidden />
        </Link>
      </header>
      <div className="crm-dash-group-metrics">
        <article className="crm-dash-metric crm-dash-metric--clickable">
          <span className="crm-dash-metric__label">Total passengers</span>
          <strong className="crm-dash-metric__value">{stats.totalPassengers}</strong>
        </article>
        <article className="crm-dash-metric">
          <span className="crm-dash-metric__label">Active groups</span>
          <strong className="crm-dash-metric__value">{stats.totalGroups}</strong>
        </article>
        <article className="crm-dash-metric">
          <span className="crm-dash-metric__label">Departures (30 days)</span>
          <strong className="crm-dash-metric__value">{stats.upcomingDepartures}</strong>
        </article>
      </div>
      {passportAlerts > 0 ? (
        <p className="crm-dash-panel__note crm-dash-panel__note--warn">
          {passportAlerts} passenger passport{passportAlerts === 1 ? '' : 's'} need attention (6–12 month window)
        </p>
      ) : null}
      <Link to="/admin/group-bookings" className="crm-btn crm-btn-primary crm-btn--small" style={{ marginTop: '0.75rem' }}>
        <Upload size={14} aria-hidden />
        Import passengers
      </Link>
    </section>
  )
}

export default GroupBookingsDashboardPanel
