import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import SportsHero from '../components/sports/SportsHero'
import { readBookingSession } from '../services/xs2event'
import { formatEventWhen, formatXs2Money } from '../utils/xs2eventUi'
import './SportsTickets.css'

function SportsTicketsBooking() {
  const { bookingId } = useParams()
  const decodedId = decodeURIComponent(bookingId || '')
  const stored = useMemo(() => readBookingSession(), [])
  const booking =
    stored?.booking?.booking_id === decodedId ? stored.booking : stored?.booking || null
  const matches = booking?.booking_id === decodedId
  const items = matches && Array.isArray(booking?.items) ? booking.items : []

  return (
    <div className="sports-tickets-page">
      <SportsHero
        compact
        title="Booking confirmed"
        lead="Your sports tickets booking was created. A confirmation email is on the way. Payment is by invoice — Honeywell Travel will send payment instructions separately."
        eyebrow="Sports & Events"
        backHref="/sports-tickets"
        backLabel="Sports & Events"
      />

      <section className="sports-tickets-section">
        <div className="sports-tickets-container sports-tickets-container--narrow">
          <div className="sports-tickets-notice">
            {matches && booking?.booking_code ? (
              <>
                Booking code: <strong>{booking.booking_code}</strong>
              </>
            ) : (
              <>Your booking is confirmed.</>
            )}
            {matches && booking?.payment_method ? (
              <>
                <br />
                Payment method: <strong>{booking.payment_method}</strong>
              </>
            ) : null}
            {matches && booking?.payment_reference ? (
              <>
                <br />
                Invoice reference: <strong>{booking.payment_reference}</strong>
              </>
            ) : null}
            {matches && booking?.created ? (
              <>
                <br />
                Created: <strong>{formatEventWhen(booking.created)}</strong>
              </>
            ) : null}
          </div>

          {items.length > 0 ? (
            <ul className="sports-tickets-ticket-list">
              {items.map((item, index) => (
                <li key={`${item.ticket_id || index}-${index}`} className="sports-tickets-ticket-card">
                  <div>
                    <h2>{item.ticket_name || item.event_name || 'Ticket'}</h2>
                    <p>
                      {[item.event_name, item.tournament_name, item.quantity ? `Qty ${item.quantity}` : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <div className="sports-tickets-ticket-card__aside">
                    <span className="sports-tickets-ticket-card__price">
                      {formatXs2Money(item.salesprice ?? item.sales_price, item.currency || 'EUR') ||
                        '—'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="sports-tickets-status">
              Booking created. Line items are shown when available in this browser session.
            </p>
          )}

          <p className="sports-tickets-status" style={{ marginTop: '1.5rem' }}>
            Need help? Email limassol@honeywelltravel.com.cy or call +357 25828848.
          </p>

          <Link to="/sports-tickets" className="st-btn st-btn--primary" style={{ marginTop: '1rem' }}>
            Browse more events
          </Link>
        </div>
      </section>
    </div>
  )
}

export default SportsTicketsBooking
