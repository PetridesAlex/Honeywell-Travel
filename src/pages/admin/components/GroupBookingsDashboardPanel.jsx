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
      <header className="crm-dash-panel__head">
        <div>
          <h3>
            <Ship size={18} aria-hidden style={{ verticalAlign: '-3px', marginRight: 6 }} />
            Group bookings &amp; passengers
          </h3>
          <p>Import rosters from Excel — no fixed template required</p>
        </div>
        <Link to="/admin/group-bookings" className="crm-btn crm-btn-ghost crm-btn--dark crm-btn--small">
          <ArrowUpRight size={14} aria-hidden />
          Open
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
