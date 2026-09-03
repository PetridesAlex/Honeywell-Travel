import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getEventsAllPages } from '../services/xs2event'
import {
  eventMatchesTournamentNames,
  getFeaturedBySlug,
} from '../utils/xs2eventFeatured'
import { expandSportTypes, formatEventWhen, formatSportLabel } from '../utils/xs2eventUi'
import './SportsTickets.css'

function dedupeEvents(events) {
  const seen = new Set()
  const out = []
  for (const event of events) {
    const id = event?.event_id
    if (!id || seen.has(id)) continue
    seen.add(id)
    out.push(event)
  }
  return out
}

function SportsTicketsEvents() {
  const { sportType, featuredSlug } = useParams()
  const decodedSport = decodeURIComponent(sportType || '')
  const decodedFeatured = decodeURIComponent(featuredSlug || '')
  const featured = useMemo(
    () => (decodedFeatured ? getFeaturedBySlug(decodedFeatured) : null),
    [decodedFeatured],
  )

  const browseSport = featured?.sport_type || decodedSport
  const relatedTypes = useMemo(() => expandSportTypes(browseSport), [browseSport])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [truncated, setTruncated] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!browseSport && !featured) return undefined

    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset UI before fetch
    setLoading(true)
    setError('')
    setTruncated(false)

    const types = expandSportTypes(browseSport || 'soccer')

    Promise.all(
      types.map((sport_type) =>
        getEventsAllPages(
          {
            sport_type,
            tickets_available: 'gt:0',
          },
          { pageSize: 100, maxPages: 20 },
        ),
      ),
    )
      .then((results) => {
        if (cancelled) return
        let merged = dedupeEvents(results.flatMap((r) => r.events))
        if (featured?.kind === 'tournament' && featured.tournament_names?.length) {
          merged = merged.filter((event) =>
            eventMatchesTournamentNames(event, featured.tournament_names),
          )
        }
        merged.sort((a, b) => String(a.date_start || '').localeCompare(String(b.date_start || '')))
        setEvents(merged)
        const mayTruncate = results.some((r) => {
          const total = Number(r.pagination?.total_size)
          return Number.isFinite(total) && r.events.length < total
        })
        setTruncated(mayTruncate && featured?.kind !== 'tournament')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.message || 'Unable to load events.')
        setEvents([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [browseSport, featured])

  const title = featured?.label || formatSportLabel(decodedSport)
  const showRelatedNote =
    !featured &&
    relatedTypes.length > 1 &&
    relatedTypes.some((t) => t !== String(decodedSport).toLowerCase())

  return (
    <div className="sports-tickets-page">
      <section className="sports-tickets-hero sports-tickets-hero--compact">
        <div className="sports-tickets-container">
          <Link to="/sports-tickets" className="sports-tickets-back">
            ← All sports
          </Link>
          <h1>{title} events</h1>
          <p className="sports-tickets-lead">
            Upcoming events with available tickets
            {!loading && !error ? ` · ${events.length} found` : ''}.
          </p>
          {featured?.blurb ? <p className="sports-tickets-status">{featured.blurb}</p> : null}
          {showRelatedNote ? (
            <p className="sports-tickets-status">
              Also including related catalogs:{' '}
              {relatedTypes.map((t) => formatSportLabel(t)).join(', ')}.
            </p>
          ) : null}
        </div>
      </section>

      <section className="sports-tickets-section">
        <div className="sports-tickets-container">
          {loading ? <p className="sports-tickets-status">Loading events…</p> : null}
          {error ? <p className="sports-tickets-error">{error}</p> : null}

          {!loading && !error && events.length === 0 ? (
            <div className="sports-tickets-notice">
              {featured?.slug === 'champions-league' ? (
                <>
                  <strong>Champions League is not in the current XS2Event TEST feed.</strong>
                  <br />
                  The partner portal can show marketing tiles for competitions that are not (yet)
                  present on <code>testapi.xs2event.com</code>. When XS2Event adds Champions League
                  events to this API environment — or when you switch to the live XS2Event host —
                  they will appear here automatically.
                  <br />
                  <br />
                  Meanwhile, try{' '}
                  <Link to="/sports-tickets/featured/premier-league">Premier League</Link>,{' '}
                  <Link to="/sports-tickets/featured/la-liga">La Liga</Link>, or{' '}
                  <Link to="/sports-tickets/soccer">all Soccer</Link>.
                </>
              ) : (
                <>
                  No upcoming ticketed events found for {title}.
                  {featured?.kind === 'tournament' ? (
                    <>
                      {' '}
                      This competition may exist on the XS2Event portal but have no ticketed events
                      in the current API feed.
                    </>
                  ) : null}
                </>
              )}
            </div>
          ) : null}

          {truncated ? (
            <p className="sports-tickets-status">
              Showing the first {events.length} events. Narrow by sport if you need a smaller list.
            </p>
          ) : null}

          <ul className="sports-tickets-event-list">
            {events.map((event) => (
              <li key={event.event_id || event.slug}>
                <Link
                  to={`/sports-tickets/event/${encodeURIComponent(event.event_id)}`}
                  className="sports-tickets-event-row"
                >
                  <div className="sports-tickets-event-row__main">
                    <h2>{event.event_name || event.event_id}</h2>
                    <p>
                      {[
                        event.tournament_name,
                        event.venue_name,
                        event.city,
                        event.sport_type && event.sport_type !== browseSport
                          ? formatSportLabel(event.sport_type)
                          : null,
                      ]
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
        </div>
      </section>
    </div>
  )
}

export default SportsTicketsEvents
