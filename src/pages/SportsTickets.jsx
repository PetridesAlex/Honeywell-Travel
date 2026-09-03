import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getEventsTotal, getSports } from '../services/xs2event'
import { expandSportTypes, formatSportLabel } from '../utils/xs2eventUi'
import './SportsTickets.css'

async function countEventsForSport(sportId) {
  const types = expandSportTypes(sportId)
  const totals = await Promise.all(
    types.map((sport_type) =>
      getEventsTotal({ sport_type, tickets_available: 'gt:0' }).catch(() => 0),
    ),
  )
  // Related queries can overlap (soccer/football); treat as upper bound for badge only.
  return totals.reduce((sum, n) => sum + Number(n || 0), 0)
}

function SportsTickets() {
  const [sports, setSports] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEmpty, setShowEmpty] = useState(false)

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset UI before fetch
    setLoading(true)
    setError('')

    getSports({ page_size: 100 })
      .then(async (data) => {
        if (cancelled) return
        const list = Array.isArray(data?.sports) ? data.sports : []
        setSports(list)

        const entries = await Promise.all(
          list.map(async (sport) => {
            const id = sport.sport_id || sport.id
            if (!id) return [null, 0]
            const total = await countEventsForSport(id)
            return [id, total]
          }),
        )
        if (cancelled) return
        const next = {}
        for (const [id, total] of entries) {
          if (id) next[id] = total
        }
        setCounts(next)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.message || 'Unable to load sports.')
        setSports([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const visibleSports = sports
    .filter((sport) => {
      const id = sport.sport_id || sport.id
      if (!id) return false
      if (showEmpty) return true
      return (counts[id] || 0) > 0
    })
    .sort((a, b) => {
      const idA = a.sport_id || a.id
      const idB = b.sport_id || b.id
      const diff = (counts[idB] || 0) - (counts[idA] || 0)
      if (diff !== 0) return diff
      return String(idA).localeCompare(String(idB))
    })

  return (
    <div className="sports-tickets-page">
      <section className="sports-tickets-hero">
        <div className="sports-tickets-container">
          <p className="sports-tickets-eyebrow">Honeywell Travel</p>
          <h1>Sports Tickets</h1>
          <p className="sports-tickets-lead">
            Browse official sports events and ticket options. Booking uses XS2Event TEST invoice
            settlement (no card charge in this phase).
          </p>
        </div>
      </section>

      <section className="sports-tickets-section">
        <div className="sports-tickets-container">
          {loading ? <p className="sports-tickets-status">Loading sports…</p> : null}
          {error ? <p className="sports-tickets-error">{error}</p> : null}

          {!loading && !error ? (
            <div className="sports-tickets-toolbar">
              <p className="sports-tickets-status">
                {visibleSports.length} sport{visibleSports.length === 1 ? '' : 's'}
                {!showEmpty ? ' with available tickets' : ''}.
              </p>
              <label className="sports-tickets-toggle">
                <input
                  type="checkbox"
                  checked={showEmpty}
                  onChange={(e) => setShowEmpty(e.target.checked)}
                />
                Show sports with no tickets
              </label>
            </div>
          ) : null}

          {!loading && !error && visibleSports.length === 0 ? (
            <p className="sports-tickets-status">No sports available right now.</p>
          ) : null}

          <div className="sports-tickets-grid">
            {visibleSports.map((sport) => {
              const id = sport.sport_id || sport.id
              if (!id) return null
              const total = counts[id]
              return (
                <Link
                  key={id}
                  to={`/sports-tickets/${encodeURIComponent(id)}`}
                  className="sports-tickets-card"
                >
                  <span className="sports-tickets-card__label">{formatSportLabel(id)}</span>
                  <span className="sports-tickets-card__meta">
                    {typeof total === 'number'
                      ? total > 0
                        ? `${total} events`
                        : 'No tickets yet'
                      : '…'}
                  </span>
                  <span className="sports-tickets-card__cta">View events →</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

export default SportsTickets
