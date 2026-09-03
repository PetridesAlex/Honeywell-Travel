import { useEffect, useMemo, useState, useTransition } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import EventCard from '../components/sports/EventCard'
import EventCardSkeleton from '../components/sports/EventCardSkeleton'
import { SportRailSkeleton } from '../components/sports/EventCardSkeleton'
import SportSelector from '../components/sports/SportSelector'
import SportsHero from '../components/sports/SportsHero'
import SportsTrustSection from '../components/sports/SportsTrustSection'
import SportArt from '../components/sports/SportArt'
import { getEvents, getEventsTotal, getSports } from '../services/xs2event'
import {
  FEATURED_BROWSE,
  buildSportsSearchCategories,
} from '../utils/xs2eventFeatured'
import { expandSportTypes } from '../utils/xs2eventUi'
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

/** Fast featured count: one lightweight pagination call (no multi-page scrapes). */
async function countFeaturedItem(item) {
  if (item.kind === 'sport') {
    return countEventsForSport(item.sport_type)
  }
  const names = Array.isArray(item.tournament_names) ? item.tournament_names : []
  if (!names.length) {
    return getEventsTotal({
      sport_type: item.sport_type,
      tickets_available: 'gt:0',
    }).catch(() => 0)
  }
  const totals = await Promise.all(
    names.slice(0, 2).map((tournament_name) =>
      getEventsTotal({
        sport_type: item.sport_type,
        tournament_name,
        tickets_available: 'gt:0',
      }).catch(() => 0),
    ),
  )
  return Math.max(0, ...totals)
}

function SportsTickets() {
  const [sports, setSports] = useState([])
  const [counts, setCounts] = useState({})
  const [featuredCounts, setFeaturedCounts] = useState({})
  const [popular, setPopular] = useState([])
  const [loading, setLoading] = useState(true)
  const [countsLoading, setCountsLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showEmpty, setShowEmpty] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [, startTransition] = useTransition()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setCounts({})
    setFeaturedCounts({})

    ;(async () => {
      try {
        // First paint: sports rail + popular events only (2 requests).
        const [sportsData, popularData] = await Promise.all([
          getSports({ page_size: 100 }),
          getEvents({ popular_events: true, page_size: 12 }).catch(() => ({ events: [] })),
        ])
        if (cancelled) return

        const list = Array.isArray(sportsData?.sports) ? sportsData.sports : []
        setSports(list)
        setPopular(Array.isArray(popularData?.events) ? popularData.events : [])
        setLoading(false)
        setCountsLoading(true)

        // Background: featured + sport totals in parallel (cached page_size=1 calls).
        const [featuredEntries, sportEntries] = await Promise.all([
          Promise.all(
            FEATURED_BROWSE.map(async (item) => [item.slug, await countFeaturedItem(item)]),
          ),
          Promise.all(
            list.map(async (sport) => {
              const id = sport.sport_id || sport.id
              if (!id) return [null, 0]
              return [id, await countEventsForSport(id)]
            }),
          ),
        ])
        if (cancelled) return

        const featuredNext = {}
        for (const [slug, total] of featuredEntries) {
          featuredNext[slug] = total
        }
        setFeaturedCounts(featuredNext)

        const next = {}
        for (const [id, total] of sportEntries) {
          if (id) next[id] = total
        }
        setCounts(next)
      } catch (err) {
        if (cancelled) return
        setError(err?.message || 'Unable to load sports.')
        setSports([])
        setLoading(false)
      } finally {
        if (!cancelled) setCountsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const visibleSports = useMemo(() => {
    const q = search.trim().toLowerCase()
    const countsReady = Object.keys(counts).length > 0
    return sports
      .filter((sport) => {
        const id = sport.sport_id || sport.id
        if (!id) return false
        if (!showEmpty && countsReady && (counts[id] || 0) <= 0) return false
        if (!q) return true
        return String(id).toLowerCase().includes(q)
      })
      .sort((a, b) => {
        const idA = a.sport_id || a.id
        const idB = b.sport_id || b.id
        const diff = (counts[idB] || 0) - (counts[idA] || 0)
        if (diff !== 0) return diff
        return String(idA).localeCompare(String(idB))
      })
  }, [sports, counts, showEmpty, search])

  const filteredPopular = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return popular
    return popular.filter((event) => {
      const hay = [
        event.event_name,
        event.tournament_name,
        event.city,
        event.hometeam_name,
        event.visiting_name,
        event.venue_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [popular, search])

  const searchCategories = useMemo(
    () => buildSportsSearchCategories(visibleSports.length ? visibleSports : sports, counts),
    [visibleSports, sports, counts],
  )

  const onSearchChange = (value) => {
    startTransition(() => setSearch(value))
  }

  return (
    <div className="sports-tickets-page">
      <SportsHero
        title="Sports & Events"
        lead="Be there for the moments that matter. Discover unforgettable sporting experiences around the world with Honeywell Travel."
        searchValue={search}
        onSearchChange={onSearchChange}
        searchCategories={searchCategories}
      />

      <section className="sports-tickets-section">
        <div className="sports-tickets-container">
          {loading ? <SportRailSkeleton /> : null}
          {!loading && !error ? (
            <SportSelector sports={visibleSports.length ? visibleSports : sports} />
          ) : null}

          {error ? (
            <div className="st-error-panel">
              <h3>We couldn&apos;t load sporting events right now</h3>
              <p>Please try again in a moment.</p>
              <button type="button" className="st-btn st-btn--primary" onClick={() => setReloadKey((n) => n + 1)}>
                <RefreshCw size={16} aria-hidden />
                Try again
              </button>
            </div>
          ) : null}

          {!loading && !error ? (
            <>
              <h2 className="sports-tickets-subheading">Popular competitions</h2>
              <p className="sports-tickets-section-lead">
                Browse featured leagues and series available in the current ticket catalogue.
              </p>
              <div className="st-featured-strip">
                {FEATURED_BROWSE.map((item) => {
                  const total = featuredCounts[item.slug]
                  const hasTickets = typeof total === 'number' ? total > 0 : true
                  return (
                    <Link
                      key={item.slug}
                      to={`/sports-tickets/featured/${encodeURIComponent(item.slug)}`}
                      className={`st-featured-tile${hasTickets ? '' : ' is-muted'}`}
                    >
                      <div className="st-featured-tile__art">
                        <SportArt sportType={item.sport_type} iconSize={28} />
                      </div>
                      <div className="st-featured-tile__body">
                        <span className="st-featured-tile__label">{item.label}</span>
                        <p className="st-featured-tile__blurb">{item.blurb}</p>
                        <p className="st-featured-tile__meta">
                          {typeof total === 'number'
                            ? total > 0
                              ? `${total} events with tickets`
                              : 'No tickets available yet'
                            : countsLoading
                              ? 'Checking availability…'
                              : '…'}
                        </p>
                        <span className="st-featured-tile__cta">View events →</span>
                      </div>
                    </Link>
                  )
                })}
              </div>

              <h2 className="sports-tickets-subheading" style={{ marginTop: '2.5rem' }}>
                Popular events
              </h2>
              {filteredPopular.length === 0 ? (
                <p className="sports-tickets-status">No popular events to show right now.</p>
              ) : (
                <ul className="st-event-grid">
                  {filteredPopular.map((event) => (
                    <EventCard key={event.event_id || event.slug} event={event} />
                  ))}
                </ul>
              )}

              <div className="sports-tickets-toolbar">
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
                {!showEmpty && Object.keys(counts).length > 0 ? ' with available tickets' : ''}.
                {countsLoading ? ' Updating counts…' : ''}
              </p>

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
                      <span className="sports-tickets-card__label">
                        {id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
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

              <SportsTrustSection />
            </>
          ) : null}

          {loading && !error ? (
            <div style={{ marginTop: '1.5rem' }}>
              <EventCardSkeleton count={6} />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export default SportsTickets
