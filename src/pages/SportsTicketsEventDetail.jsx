import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import SportArt from '../components/sports/SportArt'
import EventPrice from '../components/sports/EventPrice'
import TicketOption from '../components/sports/TicketOption'
import { TicketListSkeleton } from '../components/sports/EventCardSkeleton'
import {
  createReservation,
  getEvents,
  getTicketsAllPages,
  storeReservationSession,
} from '../services/xs2event'
import {
  formatEventWhen,
  formatSportLabel,
  groupTicketsForDisplay,
  ticketDisplayPrice,
} from '../utils/xs2eventUi'
import './SportsTickets.css'

function SportsTicketsEventDetail() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const decodedEventId = decodeURIComponent(eventId || '')

  const [event, setEvent] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [activeTicketId, setActiveTicketId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [email, setEmail] = useState('')
  const [reserving, setReserving] = useState(false)
  const [reserveError, setReserveError] = useState('')

  useEffect(() => {
    let cancelled = false
    if (!decodedEventId) return undefined

    setLoading(true)
    setError('')

    Promise.all([
      getEvents({ event_id: decodedEventId, page_size: 1 }),
      getTicketsAllPages(
        { event_id: decodedEventId, ticket_status: 'available' },
        { pageSize: 100, maxPages: 10 },
      ),
    ])
      .then(([eventsData, ticketsList]) => {
        if (cancelled) return
        const list = Array.isArray(eventsData?.events) ? eventsData.events : []
        setEvent(list[0] || null)
        setTickets(Array.isArray(ticketsList) ? ticketsList : [])
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.message || 'Unable to load event tickets.')
        setEvent(null)
        setTickets([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [decodedEventId, reloadKey])

  const grouped = useMemo(() => groupTicketsForDisplay(tickets), [tickets])

  const sportHref = event?.sport_type
    ? `/sports-tickets/${encodeURIComponent(event.sport_type)}`
    : '/sports-tickets'

  const fromPrice = useMemo(() => {
    if (!grouped.length) return null
    return ticketDisplayPrice(grouped[0].ticket)
  }, [grouped])

  const openReserve = (ticket) => {
    setActiveTicketId(ticket.ticket_id)
    const minOrder = Number(ticket.min_order)
    setQuantity(Number.isFinite(minOrder) && minOrder > 0 ? minOrder : 1)
    setReserveError('')
  }

  const submitReserve = async (ticket) => {
    setReserving(true)
    setReserveError('')
    try {
      const result = await createReservation({
        ticket_id: ticket.ticket_id,
        quantity,
        booking_email: email,
        notes: `Honeywell Travel hold — ${event?.event_name || 'sports event'}`,
      })
      storeReservationSession({ ...result, booking_email: email })
      const id = result?.reservation?.reservation_id
      if (!id) throw new Error('Reservation created but no reservation_id was returned.')
      navigate(`/sports-tickets/reservation/${encodeURIComponent(id)}`)
    } catch (err) {
      setReserveError(err?.message || 'Unable to create reservation.')
    } finally {
      setReserving(false)
    }
  }

  const home = event?.hometeam_name
  const away = event?.visiting_name
  const hasTeams = Boolean(home && away)

  return (
    <div className="sports-tickets-page">
      <section className="st-detail-hero">
        <div className="st-detail-hero__art">
          <SportArt sportType={event?.sport_type || 'default'} iconSize={64} />
        </div>
        <div className="st-detail-hero__shade" aria-hidden />
        <div className="sports-tickets-container st-detail-hero__inner">
          <Link to={sportHref} className="sports-tickets-back">
            ← {event?.sport_type ? formatSportLabel(event.sport_type) : 'Back'} events
          </Link>
          {event?.tournament_name ? (
            <p className="st-detail-hero__competition">{event.tournament_name}</p>
          ) : null}
          <h1 className="st-detail-hero__teams">
            {loading
              ? 'Loading…'
              : hasTeams
                ? (
                  <>
                    {home}
                    <span className="st-detail-hero__vs">vs</span>
                    {away}
                  </>
                  )
                : (event?.event_name || 'Event')}
          </h1>
          {event ? (
            <p className="st-detail-hero__meta">
              {[formatEventWhen(event.date_start), event.venue_name, event.city]
                .filter(Boolean)
                .join(' · ')}
            </p>
          ) : null}
        </div>
      </section>

      <section className="sports-tickets-section">
        <div className="sports-tickets-container">
          {error ? (
            <div className="st-error-panel">
              <h3>We couldn&apos;t load this event right now</h3>
              <p>Please try again in a moment.</p>
              <button type="button" className="st-btn st-btn--primary" onClick={() => setReloadKey((n) => n + 1)}>
                <RefreshCw size={16} aria-hidden />
                Try again
              </button>
            </div>
          ) : null}

          {!loading && !error && !event ? (
            <div className="st-empty">
              <h3>Event not found</h3>
              <p>This event may no longer be available.</p>
              <Link to="/sports-tickets" className="st-btn st-btn--primary">
                Browse sports
              </Link>
            </div>
          ) : null}

          {!error && (loading || event) ? (
            <div className="st-detail-layout">
              <div>
                <h2 className="sports-tickets-subheading">Choose your tickets</h2>
                <div className="sports-tickets-notice">
                  Place a temporary hold, then complete guest details. Payment is by invoice —
                  Honeywell Travel will bill you separately. Holds expire after about 10 minutes.
                </div>

                {loading ? <TicketListSkeleton /> : null}

                {!loading && grouped.length === 0 ? (
                  <div className="st-empty">
                    <h3>No tickets available</h3>
                    <p>There are no available ticket categories for this event right now.</p>
                  </div>
                ) : null}

                {!loading && grouped.length > 0 ? (
                  <ul className="st-ticket-list">
                    {grouped.map(({ key, ticket, options }) => {
                      const maxQty =
                        Number.isFinite(Number(ticket.stock)) && Number(ticket.stock) > 0
                          ? Math.min(20, Number(ticket.stock))
                          : 10
                      return (
                        <TicketOption
                          key={key}
                          ticket={ticket}
                          optionsCount={options}
                          isOpen={activeTicketId === ticket.ticket_id}
                          quantity={quantity}
                          email={email}
                          maxQty={maxQty}
                          reserving={reserving}
                          reserveError={reserveError}
                          onOpen={openReserve}
                          onCancel={() => {
                            setActiveTicketId('')
                            setReserveError('')
                          }}
                          onQuantityChange={setQuantity}
                          onEmailChange={setEmail}
                          onSubmit={submitReserve}
                        />
                      )
                    })}
                  </ul>
                ) : null}
              </div>

              <aside className="st-detail-aside">
                <h3>Event information</h3>
                <dl>
                  <div>
                    <dt>Competition</dt>
                    <dd>{event?.tournament_name || '—'}</dd>
                  </div>
                  <div>
                    <dt>Date</dt>
                    <dd>{event ? formatEventWhen(event.date_start) || '—' : '—'}</dd>
                  </div>
                  <div>
                    <dt>Venue</dt>
                    <dd>{event?.venue_name || '—'}</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>{[event?.city, event?.iso_country].filter(Boolean).join(', ') || '—'}</dd>
                  </div>
                </dl>
                {fromPrice ? (
                  <div style={{ marginTop: '1.15rem' }}>
                    <EventPrice alreadyFormatted={fromPrice} label="Tickets from" size="lg" />
                  </div>
                ) : null}
              </aside>
            </div>
          ) : null}
        </div>
      </section>

      {!loading && grouped.length > 0 && fromPrice ? (
        <div className="st-sticky-bar">
          <EventPrice alreadyFormatted={fromPrice} label="Tickets from" />
          <a href="#choose-tickets" className="st-btn st-btn--primary" onClick={(e) => {
            e.preventDefault()
            document.querySelector('.st-ticket-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}>
            View tickets
          </a>
        </div>
      ) : null}
    </div>
  )
}

export default SportsTicketsEventDetail
