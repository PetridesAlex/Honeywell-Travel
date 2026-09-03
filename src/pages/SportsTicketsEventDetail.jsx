import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createReservation, getEvents, getTicketsAllPages, storeReservationSession } from '../services/xs2event'
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
  }, [decodedEventId])

  const grouped = useMemo(() => groupTicketsForDisplay(tickets), [tickets])

  const sportHref = event?.sport_type
    ? `/sports-tickets/${encodeURIComponent(event.sport_type)}`
    : '/sports-tickets'

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
        notes: `Honeywell Travel TEST hold — ${event?.event_name || decodedEventId}`,
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

  return (
    <div className="sports-tickets-page">
      <section className="sports-tickets-hero sports-tickets-hero--compact">
        <div className="sports-tickets-container">
          <Link to={sportHref} className="sports-tickets-back">
            ← {event?.sport_type ? formatSportLabel(event.sport_type) : 'Back'} events
          </Link>
          <h1>{event?.event_name || (loading ? 'Loading…' : 'Event')}</h1>
          {event ? (
            <p className="sports-tickets-lead">
              {[event.tournament_name, event.venue_name, event.city, formatEventWhen(event.date_start)]
                .filter(Boolean)
                .join(' · ')}
            </p>
          ) : null}
        </div>
      </section>

      <section className="sports-tickets-section">
        <div className="sports-tickets-container">
          {loading ? <p className="sports-tickets-status">Loading tickets…</p> : null}
          {error ? <p className="sports-tickets-error">{error}</p> : null}

          {!loading && !error && !event ? (
            <p className="sports-tickets-status">Event not found.</p>
          ) : null}

          {!loading && event ? (
            <>
              <div className="sports-tickets-notice">
                You can place a temporary TEST reservation (ticket hold). Guest checkout and payment are
                not enabled yet. Holds expire after about 10 minutes.
              </div>

              {grouped.length === 0 ? (
                <p className="sports-tickets-status">No available tickets for this event right now.</p>
              ) : (
                <ul className="sports-tickets-ticket-list">
                  {grouped.map(({ key, ticket, options }) => {
                    const isOpen = activeTicketId === ticket.ticket_id
                    const maxQty = Number.isFinite(Number(ticket.stock)) && Number(ticket.stock) > 0
                      ? Math.min(20, Number(ticket.stock))
                      : 10
                    return (
                      <li key={key} className="sports-tickets-ticket-card">
                        <div>
                          <h2>{ticket.category_name || ticket.ticket_title || 'Ticket category'}</h2>
                          <p>
                            {[
                              ticket.sub_category,
                              ticket.type_ticket || ticket.ticket_type,
                              ticket.ticket_validity,
                              options > 1 ? `${options} supplier options` : null,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                          {ticket.stock != null ? (
                            <p className="sports-tickets-ticket-card__stock">Stock: {ticket.stock}</p>
                          ) : null}

                          {isOpen ? (
                            <div className="sports-tickets-reserve-form">
                              <label>
                                Quantity
                                <input
                                  type="number"
                                  min={1}
                                  max={maxQty}
                                  value={quantity}
                                  onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                                />
                              </label>
                              <label>
                                Booking email
                                <input
                                  type="email"
                                  required
                                  placeholder="you@example.com"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                />
                              </label>
                              {reserveError ? (
                                <p className="sports-tickets-error">{reserveError}</p>
                              ) : null}
                              <div className="sports-tickets-reserve-actions">
                                <button
                                  type="button"
                                  className="sports-tickets-reserve-btn"
                                  disabled={reserving}
                                  onClick={() => submitReserve(ticket)}
                                >
                                  {reserving ? 'Reserving…' : 'Hold tickets'}
                                </button>
                                <button
                                  type="button"
                                  className="sports-tickets-reserve-cancel"
                                  disabled={reserving}
                                  onClick={() => {
                                    setActiveTicketId('')
                                    setReserveError('')
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                        <div className="sports-tickets-ticket-card__aside">
                          <span className="sports-tickets-ticket-card__price">
                            {ticketDisplayPrice(ticket) || 'Price on request'}
                          </span>
                          {!isOpen ? (
                            <button
                              type="button"
                              className="sports-tickets-reserve-btn"
                              onClick={() => openReserve(ticket)}
                            >
                              Reserve
                            </button>
                          ) : null}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export default SportsTicketsEventDetail
