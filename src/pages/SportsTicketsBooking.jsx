import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
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
  const payment = stored?.payment
  const isTest = Boolean(payment?.is_test)

  return (
    <div className="sports-tickets-page">
      <section className="sports-tickets-hero sports-tickets-hero--compact">
        <div className="sports-tickets-container">
          <Link to="/sports-tickets" className="sports-tickets-back">
            ← Sports tickets
          </Link>
          <h1>Booking confirmed</h1>
          <p className="sports-tickets-lead">
            {isTest
              ? 'Your TEST sports tickets booking was created. A confirmation email is on the way.'
              : 'Your sports tickets booking was created. A confirmation email is on the way.'}{' '}
            Payment is by invoice — Honeywell Travel will send payment instructions separately. E-ticket
            delivery follows once settlement and supplier logistics are complete.
          </p>
        </div>
      </section>

      <section className="sports-tickets-section">
        <div className="sports-tickets-container">
          <div className="sports-tickets-notice">
            Booking ID: <strong>{decodedId}</strong>
            {matches && booking?.booking_code ? (
              <>
                <br />
                Booking code: <strong>{booking.booking_code}</strong>
              </>
            ) : null}
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
            {matches && booking?.booking_reference ? (
              <>
                <br />
                Booking reference: <strong>{booking.booking_reference}</strong>
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
                <li key={`${item.ticket_id}-${index}`} className="sports-tickets-ticket-card">
                  <div>
                    <h2>{item.ticket_name || item.ticket_id}</h2>
                    <p>
                      {[item.event_name, item.tournament_name, `Qty ${item.quantity}`]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <div className="sports-tickets-ticket-card__aside">
                    <span className="sports-tickets-ticket-card__price">
                      {formatXs2Money(
                        item.salesprice ?? item.sales_price ?? item.net_rate,
                        item.currency || 'EUR',
                      ) || '—'}
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
        </div>
      </section>
    </div>
  )
}

export default SportsTicketsBooking
