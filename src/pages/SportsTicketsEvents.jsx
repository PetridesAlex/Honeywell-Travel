import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { Link, useParams } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import EventFilters from '../components/sports/EventFilters'
import EventGrid from '../components/sports/EventGrid'
import SportSelector from '../components/sports/SportSelector'
import SportsHero from '../components/sports/SportsHero'
import { getEvents, getSports } from '../services/xs2event'
import {
  buildSportsSearchCategories,
  eventMatchesTournamentNames,
  getFeaturedBySlug,
} from '../utils/xs2eventFeatured'
import { expandSportTypes, formatSportLabel } from '../utils/xs2eventUi'
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

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)))
}

const EMPTY_FILTERS = {
  competitions: [],
  country: '',
  city: '',
  month: '',
  team: '',
}

async function fetchEventsPage(params, page, pageSize) {
  const data = await getEvents({ ...params, page_size: pageSize, page })
  const batch = Array.isArray(data?.events) ? data.events : []
  const pagination = data?.pagination || null
  const total = Number(pagination?.total_size)
  const hasNext =
    Boolean(pagination?.next_page) || (Number.isFinite(total) && page * pageSize < total)
  return { batch, hasNext, total: Number.isFinite(total) ? total : null }
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
  const [sports, setSports] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('date')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [, startTransition] = useTransition()

  useEffect(() => {
    getSports({ page_size: 100 })
      .then((data) => setSports(Array.isArray(data?.sports) ? data.sports : []))
      .catch(() => setSports([]))
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!browseSport && !featured) return undefined

    setLoading(true)
    setLoadingMore(false)
    setError('')
    setEvents([])
    setFilters(EMPTY_FILTERS)

    ;(async () => {
      try {
        const pageSize = 50
        const maxPages = 12
        const queries = []

        if (featured?.kind === 'tournament' && featured.tournament_names?.length) {
          // Prefer API tournament filters for speed (aliases in parallel).
          const names = featured.tournament_names.slice(0, 3)
          for (const tournament_name of names) {
            queries.push({
              sport_type: featured.sport_type,
              tournament_name,
              tickets_available: 'gt:0',
            })
          }
        } else {
          const types = expandSportTypes(browseSport || 'soccer')
          for (const sport_type of types) {
            queries.push({ sport_type, tickets_available: 'gt:0' })
          }
        }

        // First page of each query → paint quickly
        const firstPages = await Promise.all(
          queries.map((params) => fetchEventsPage(params, 1, pageSize).catch(() => ({ batch: [], hasNext: false }))),
        )
        if (cancelled) return

        let merged = dedupeEvents(firstPages.flatMap((r) => r.batch))
        if (featured?.kind === 'tournament' && featured.tournament_names?.length) {
          merged = merged.filter((event) =>
            eventMatchesTournamentNames(event, featured.tournament_names),
          )
        }
        setEvents(merged)
        setLoading(false)

        const needsMore = firstPages.some((r) => r.hasNext)
        if (!needsMore) return

        setLoadingMore(true)
        const collected = [...merged]

        for (let page = 2; page <= maxPages; page += 1) {
          const pages = await Promise.all(
            queries.map((params) =>
              fetchEventsPage(params, page, pageSize).catch(() => ({
                batch: [],
                hasNext: false,
              })),
            ),
          )
          if (cancelled) return

          let anyNext = false
          let anyBatch = false
          for (const pageResult of pages) {
            if (pageResult.batch.length) {
              anyBatch = true
              collected.push(...pageResult.batch)
            }
            if (pageResult.hasNext) anyNext = true
          }
          if (!anyBatch) break

          let next = dedupeEvents(collected)
          if (featured?.kind === 'tournament' && featured.tournament_names?.length) {
            next = next.filter((event) =>
              eventMatchesTournamentNames(event, featured.tournament_names),
            )
          }
          setEvents(next)
          if (!anyNext) break
        }
      } catch (err) {
        if (cancelled) return
        setError(err?.message || 'Unable to load events.')
        setEvents([])
        setLoading(false)
      } finally {
        if (!cancelled) setLoadingMore(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [browseSport, featured, reloadKey])

  const competitions = useMemo(
    () => uniqueSorted(events.map((e) => e.tournament_name)),
    [events],
  )
  const countries = useMemo(
    () => uniqueSorted(events.map((e) => e.iso_country || e.country)),
    [events],
  )
  const cities = useMemo(() => uniqueSorted(events.map((e) => e.city)), [events])

  const onFilterChange = useCallback((key, value) => {
    startTransition(() => {
      setFilters((prev) => {
        if (key === 'competitions') {
          const next = prev.competitions.includes(value)
            ? prev.competitions.filter((item) => item !== value)
            : [...prev.competitions, value]
          return { ...prev, competitions: next }
        }
        return { ...prev, [key]: value }
      })
    })
  }, [startTransition])

  const clearFilters = useCallback(() => {
    startTransition(() => {
      setFilters(EMPTY_FILTERS)
      setSearch('')
    })
  }, [startTransition])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = events.filter((event) => {
      if (filters.competitions.length && !filters.competitions.includes(event.tournament_name)) {
        return false
      }
      if (filters.country) {
        const country = event.iso_country || event.country
        if (country !== filters.country) return false
      }
      if (filters.city && event.city !== filters.city) return false
      if (filters.month) {
        const start = String(event.date_start || '')
        if (!start.startsWith(filters.month)) return false
      }
      if (filters.team) {
        const teamQ = filters.team.trim().toLowerCase()
        const teams = `${event.hometeam_name || ''} ${event.visiting_name || ''} ${event.event_name || ''}`.toLowerCase()
        if (!teams.includes(teamQ)) return false
      }
      if (q) {
        const hay = [
          event.event_name,
          event.tournament_name,
          event.city,
          event.venue_name,
          event.hometeam_name,
          event.visiting_name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })

    list = [...list]
    if (sort === 'price') {
      list.sort(
        (a, b) =>
          Number(a.honeywell_min_ticket_price ?? a.min_ticket_price_eur ?? Infinity) -
          Number(b.honeywell_min_ticket_price ?? b.min_ticket_price_eur ?? Infinity),
      )
    } else {
      list.sort((a, b) => String(a.date_start || '').localeCompare(String(b.date_start || '')))
    }
    return list
  }, [events, filters, search, sort])

  const title = featured?.label || formatSportLabel(decodedSport)
  const activeSport = featured ? featured.sport_type : decodedSport
  const searchCategories = useMemo(() => buildSportsSearchCategories(sports), [sports])
  const activeFilterCount =
    filters.competitions.length +
    (filters.country ? 1 : 0) +
    (filters.city ? 1 : 0) +
    (filters.month ? 1 : 0) +
    (filters.team.trim() ? 1 : 0)

  return (
    <div className="sports-tickets-page">
      <SportsHero
        compact
        title={`${title} events`}
        lead={
          featured?.blurb ||
          'Upcoming events with available tickets. Filter by competition, destination or team.'
        }
        eyebrow="Honeywell Travel"
        backHref="/sports-tickets"
        backLabel="All sports"
        searchValue={search}
        onSearchChange={(v) => startTransition(() => setSearch(v))}
        searchCategories={searchCategories}
      />

      <section className="sports-tickets-section">
        <div className="sports-tickets-container">
          <SportSelector sports={sports} activeSport={activeSport} />

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

          {!error ? (
            <div className="st-marketplace">
              <EventFilters
                competitions={competitions}
                countries={countries}
                cities={cities}
                filters={filters}
                onChange={onFilterChange}
                onClear={clearFilters}
                activeCount={activeFilterCount}
                mobileOpen={mobileFiltersOpen}
                onMobileOpen={() => setMobileFiltersOpen(true)}
                onMobileClose={() => setMobileFiltersOpen(false)}
              />

              <div>
                <div className="st-results-header">
                  <p className="st-results-header__count">
                    <strong>{loading ? '…' : filtered.length}</strong> events
                    {loadingMore ? <span className="st-results-header__loading"> · loading more…</span> : null}
                  </p>
                  <label className="st-sort">
                    Sort
                    <select value={sort} onChange={(e) => setSort(e.target.value)}>
                      <option value="date">Date</option>
                      <option value="price">Price</option>
                    </select>
                  </label>
                </div>

                {!loading && featured?.slug === 'champions-league' && filtered.length === 0 ? (
                  <div className="sports-tickets-notice">
                    Champions League fixtures are not available in the current ticket feed. Try{' '}
                    <Link to="/sports-tickets/featured/premier-league">Premier League</Link>,{' '}
                    <Link to="/sports-tickets/featured/la-liga">La Liga</Link>, or{' '}
                    <Link to="/sports-tickets/soccer">all Football</Link>.
                  </div>
                ) : null}

                <EventGrid
                  events={filtered}
                  loading={loading}
                  emptyAction={
                    <button type="button" className="st-btn st-btn--primary" onClick={clearFilters}>
                      Clear filters
                    </button>
                  }
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export default SportsTicketsEvents
