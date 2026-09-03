import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getEvents, getEventsAllPages, getEventsTotal, getSports } from '../services/xs2event'
import {
  FEATURED_BROWSE,
  eventMatchesTournamentNames,
} from '../utils/xs2eventFeatured'
import { expandSportTypes, formatEventWhen, formatSportLabel } from '../utils/xs2eventUi'
import './SportsTickets.css'

async function countEventsForSport(sportId) {
  const types = expandSportTypes(sportId)
  const totals = await Promise.all(
    types.map((sport_type) =>
      getEventsTotal({ sport_type, tickets_available: 'gt:0' }).catch(() => 0),
    ),
  )
  return totals.reduce((sum, n) => sum + Number(n || 0), 0)
}

function SportsTickets() {
  const [sports, setSports] = useState([])
  const [counts, setCounts] = useState({})
  const [featuredCounts, setFeaturedCounts] = useState({})
  const [popular, setPopular] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEmpty, setShowEmpty] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    ;(async () => {
      try {
        const [sportsData, popularData, soccerTicketed] = await Promise.all([
          getSports({ page_size: 100 }),
          getEvents({ popular_events: true, page_size: 12 }).catch(() => ({ events: [] })),
          getEventsAllPages(
            { sport_type: 'soccer', tickets_available: 'gt:0' },
            { pageSize: 100, maxPages: 20 },
          ).catch(() => ({ events: [] })),
        ])
        if (cancelled) return

        const list = Array.isArray(sportsData?.sports) ? sportsData.sports : []
        setSports(list)
        setPopular(Array.isArray(popularData?.events) ? popularData.events : [])

        const soccerEvents = Array.isArray(soccerTicketed.events) ? soccerTicketed.events : []

        const featuredNext = {}
        for (const item of FEATURED_BROWSE) {
          if (item.kind === 'sport') {
            featuredNext[item.slug] = await countEventsForSport(item.sport_type)
          } else {
            featuredNext[item.slug] = soccerEvents.filter((event) =>
              eventMatchesTournamentNames(event, item.tournament_names),
            ).length
            // MotoGP / non-soccer tournament featured: recount from sport catalog
            if (item.sport_type && item.sport_type !== 'soccer') {
              const pack = await getEventsAllPages(
                { sport_type: item.sport_type, tickets_available: 'gt:0' },
                { pageSize: 100, maxPages: 5 },
              ).catch(() => ({ events: [] }))
              const events = Array.isArray(pack.events) ? pack.events : []
              featuredNext[item.slug] = item.tournament_names?.length
                ? events.filter((event) =>
                    eventMatchesTournamentNames(event, item.tournament_names),
                  ).length
                : events.length
            }
          }
        }
        if (cancelled) return
        setFeaturedCounts(featuredNext)

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
      } catch (err) {
        if (cancelled) return
        setError(err?.message || 'Unable to load sports.')
        setSports([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

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
            Browse official sports events and ticket options. Prices include Honeywell Travel
            service markup. Payment is by invoice (no card charge online).
          </p>
        </div>
      </section>

      <section className="sports-tickets-section">
        <div className="sports-tickets-container">
          {loading ? <p className="sports-tickets-status">Loading sports…</p> : null}
          {error ? <p className="sports-tickets-error">{error}</p> : null}

          {!loading && !error ? (
            <>
              <h2 className="sports-tickets-subheading">Featured</h2>
              <p className="sports-tickets-status">
                Popular categories from the XS2Event catalog (same style as the partner portal).
              </p>
              <div className="sports-tickets-featured-grid">
                {FEATURED_BROWSE.map((item) => {
                  const total = featuredCounts[item.slug]
                  const hasTickets = typeof total === 'number' ? total > 0 : true
                  return (
                    <Link
                      key={item.slug}
                      to={`/sports-tickets/featured/${encodeURIComponent(item.slug)}`}
                      className={`sports-tickets-featured-card${hasTickets ? '' : ' is-muted'}`}
                    >
                      <span className="sports-tickets-featured-card__label">{item.label}</span>
                      <span className="sports-tickets-featured-card__blurb">{item.blurb}</span>
                      <span className="sports-tickets-featured-card__meta">
                        {typeof total === 'number'
                          ? total > 0
                            ? `${total} events with tickets`
                            : 'No tickets in current XS2Event feed'
                          : '…'}
                      </span>
                      <span className="sports-tickets-card__cta">View events →</span>
                    </Link>
                  )
                })}
              </div>

              {popular.length > 0 ? (
                <>
                  <h2 className="sports-tickets-subheading" style={{ marginTop: '2.5rem' }}>
                    Popular events
                  </h2>
                  <ul className="sports-tickets-event-list">
                    {popular.map((event) => (
                      <li key={event.event_id || event.slug}>
                        <Link
                          to={`/sports-tickets/event/${encodeURIComponent(event.event_id)}`}
                          className="sports-tickets-event-row"
                        >
                          <div className="sports-tickets-event-row__main">
                            <h2>{event.event_name || event.event_id}</h2>
                            <p>
                              {[event.tournament_name, event.venue_name, event.city]
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                          </div>
                          <div className="sports-tickets-event-row__meta">
                            <span>{formatEventWhen(event.date_start)}</span>
                            <span className="sports-tickets-event-row__cta">Tickets →</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              <div className="sports-tickets-toolbar" style={{ marginTop: '2.5rem' }}>
                <h2 className="sports-tickets-subheading" style={{ margin: 0 }}>
                  All sports
                </h2>
                <label className="sports-tickets-toggle">
                  <input
                    type="checkbox"
                    checked={showEmpty}
                    onChange={(e) => setShowEmpty(e.target.checked)}
                  />
                  Show sports with no tickets
                </label>
              </div>
              <p className="sports-tickets-status">
                {visibleSports.length} sport{visibleSports.length === 1 ? '' : 's'}
                {!showEmpty ? ' with available tickets' : ''}.
              </p>
            </>
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
