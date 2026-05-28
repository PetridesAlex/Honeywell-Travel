import { Plane, TrendingUp } from 'lucide-react'
import { formatTeamDate } from '../utils/team'
import { getClientTravelStats, getTripYear } from '../utils/clientTrips'

function ClientTravelHistory({ leads = [] }) {
  const stats = getClientTravelStats(leads)

  return (
    <section className="crm-workspace crm-workspace--travel-history">
      <div className="crm-workspace__head">
        <div>
          <h2 className="crm-workspace__title">
            <Plane size={20} aria-hidden className="crm-workspace__title-icon" />
            Travel with Honeywell
          </h2>
          <p className="crm-workspace__subtitle">
            Trips counted when a linked lead is marked <strong>Confirmed</strong>.
          </p>
        </div>
      </div>

      <div className="crm-travel-stats">
        <article className="crm-travel-stat">
          <span className="crm-travel-stat__label">Lifetime trips</span>
          <strong className="crm-travel-stat__value">{stats.lifetimeTrips}</strong>
        </article>
        <article className="crm-travel-stat crm-travel-stat--accent">
          <span className="crm-travel-stat__label">{stats.currentYear} trips</span>
          <strong className="crm-travel-stat__value">{stats.tripsThisYear}</strong>
        </article>
        <article className="crm-travel-stat">
          <span className="crm-travel-stat__label">Avg per active year</span>
          <strong className="crm-travel-stat__value">{stats.averagePerYear || '—'}</strong>
        </article>
        <article className="crm-travel-stat">
          <span className="crm-travel-stat__label">Active years</span>
          <strong className="crm-travel-stat__value">{stats.activeYears}</strong>
        </article>
      </div>

      {stats.years.length > 0 ? (
        <div className="crm-travel-years">
          <div className="crm-travel-years__head">
            <TrendingUp size={16} aria-hidden />
            <span>Trips per year</span>
          </div>
          <ul className="crm-travel-years__list">
            {stats.years.map((year) => {
              const count = stats.byYear[year] || 0
              const max = Math.max(...stats.years.map((y) => stats.byYear[y] || 0), 1)
              const width = `${Math.max(12, Math.round((count / max) * 100))}%`

              return (
                <li key={year} className="crm-travel-years__row">
                  <span className="crm-travel-years__year">{year}</span>
                  <span className="crm-travel-years__bar-wrap">
                    <span className="crm-travel-years__bar" style={{ width }} />
                  </span>
                  <span className="crm-travel-years__count">
                    {count} {count === 1 ? 'trip' : 'trips'}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <div className="crm-state crm-travel-empty">
          No confirmed trips yet. Mark a linked lead as <strong>Confirmed</strong> to start tracking.
        </div>
      )}

      {stats.confirmed.length > 0 ? (
        <div className="crm-table-wrap crm-travel-table-wrap">
          <table className="crm-table crm-travel-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Destination</th>
                <th>Trip type</th>
                <th>Travel dates</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {stats.confirmed
                .slice()
                .sort((a, b) => (getTripYear(b) || 0) - (getTripYear(a) || 0))
                .map((lead) => (
                  <tr key={lead.id}>
                    <td>{getTripYear(lead) || '—'}</td>
                    <td>{lead.destination || '—'}</td>
                    <td>{lead.trip_type || '—'}</td>
                    <td>{lead.travel_dates || '—'}</td>
                    <td>{lead.trip_completed_date ? formatTeamDate(lead.trip_completed_date) : '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}

export default ClientTravelHistory
