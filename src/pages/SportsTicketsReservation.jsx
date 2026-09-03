import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createBooking,
  getReservationGuestData,
  readReservationSession,
  saveReservationGuestData,
  storeBookingSession,
} from '../services/xs2event'
import {
  buildGuestDataPayload,
  fieldLabel,
  guestFormNeedsInput,
  normalizeGuestDataResponse,
} from '../utils/xs2eventGuestData'
import { formatEventWhen, formatXs2Money } from '../utils/xs2eventUi'
import './SportsTickets.css'

function SportsTicketsReservation() {
  const { reservationId } = useParams()
  const navigate = useNavigate()
  const decodedId = decodeURIComponent(reservationId || '')
  const stored = useMemo(() => readReservationSession(), [])

  const reservation =
    stored?.reservation?.reservation_id === decodedId ? stored.reservation : null
  const matches = Boolean(reservation)
  const items = matches && Array.isArray(reservation?.items) ? reservation.items : []
  const validUntil = matches ? reservation?.valid_until : null
  const bookingEmailDefault = stored?.booking_email || ''

  const [guestItems, setGuestItems] = useState([])
  const [guestLoading, setGuestLoading] = useState(true)
  const [guestError, setGuestError] = useState('')
  const [bookingEmail, setBookingEmail] = useState(bookingEmailDefault)
  const [savingGuests, setSavingGuests] = useState(false)
  const [booking, setBooking] = useState(false)
  const [actionError, setActionError] = useState('')
  const [guestsSaved, setGuestsSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!decodedId) return undefined

    setGuestLoading(true)
    setGuestError('')

    getReservationGuestData(decodedId, { include_conditions: true, country_hint: 'CYP' })
      .then((data) => {
        if (cancelled) return
        setGuestItems(normalizeGuestDataResponse(data))
      })
      .catch((err) => {
        if (cancelled) return
        setGuestError(err?.message || 'Unable to load guest requirements.')
        setGuestItems([])
      })
      .finally(() => {
        if (!cancelled) setGuestLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [decodedId])

  const needsGuestInput = useMemo(() => guestFormNeedsInput(guestItems), [guestItems])

  const updateGuestValue = (itemIndex, guestIndex, field, value) => {
    setGuestItems((prev) =>
      prev.map((item, i) => {
        if (i !== itemIndex) return item
        return {
          ...item,
          guests: item.guests.map((guest, g) => {
            if (g !== guestIndex) return guest
            return {
              ...guest,
              values: { ...guest.values, [field]: value },
            }
          }),
        }
      }),
    )
  }

  const submitGuests = async () => {
    setSavingGuests(true)
    setActionError('')
    try {
      await saveReservationGuestData(decodedId, buildGuestDataPayload(guestItems))
      setGuestsSaved(true)
      const refreshed = await getReservationGuestData(decodedId, {
        include_conditions: true,
        country_hint: 'CYP',
      })
      setGuestItems(normalizeGuestDataResponse(refreshed))
    } catch (err) {
      setActionError(err?.message || 'Unable to save guest data.')
      setGuestsSaved(false)
    } finally {
      setSavingGuests(false)
    }
  }

  const finalizeBooking = async () => {
    setBooking(true)
    setActionError('')
    try {
      if (needsGuestInput && !guestsSaved) {
        await saveReservationGuestData(decodedId, buildGuestDataPayload(guestItems))
        setGuestsSaved(true)
      }

      const result = await createBooking({
        reservation_id: decodedId,
        booking_email: bookingEmail,
      })
      storeBookingSession(result)
      const id = result?.booking?.booking_id
      if (!id) throw new Error('Booking created but no booking_id was returned.')
      navigate(`/sports-tickets/booking/${encodeURIComponent(id)}`)
    } catch (err) {
      setActionError(err?.message || 'Unable to finalize booking.')
    } finally {
      setBooking(false)
    }
  }

  return (
    <div className="sports-tickets-page">
      <section className="sports-tickets-hero sports-tickets-hero--compact">
        <div className="sports-tickets-container">
          <Link to="/sports-tickets" className="sports-tickets-back">
            ← Sports tickets
          </Link>
          <h1>Complete booking</h1>
          <p className="sports-tickets-lead">
            Provide any required guest details, then finalize your booking. Payment method is
            invoice — Honeywell Travel will send payment instructions (no card charge on this site).
          </p>
        </div>
      </section>

      <section className="sports-tickets-section">
        <div className="sports-tickets-container">
          <div className="sports-tickets-notice">
            Reservation ID: <strong>{decodedId}</strong>
            {validUntil ? (
              <>
                <br />
                Hold valid until: <strong>{formatEventWhen(validUntil)}</strong>
              </>
            ) : null}
            {matches && reservation?.status ? (
              <>
                <br />
                Status: <strong>{reservation.status}</strong>
              </>
            ) : null}
          </div>

          {items.length > 0 ? (
            <ul className="sports-tickets-ticket-list" style={{ marginBottom: '1.5rem' }}>
              {items.map((item, index) => (
                <li key={`${item.ticket_id}-${index}`} className="sports-tickets-ticket-card">
                  <div>
                    <h2>{item.ticket_name || item.ticket_id}</h2>
                    <p>{[item.event_name, `Qty ${item.quantity}`].filter(Boolean).join(' · ')}</p>
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
          ) : null}

          <h2 className="sports-tickets-subheading">Guest details</h2>
          {guestLoading ? <p className="sports-tickets-status">Loading guest requirements…</p> : null}
          {guestError ? <p className="sports-tickets-error">{guestError}</p> : null}

          {!guestLoading && !guestError && guestItems.length === 0 ? (
            <p className="sports-tickets-status">No guest fields required for this reservation.</p>
          ) : null}

          {!guestLoading && guestItems.map((item, itemIndex) => (
            <div key={`${item.ticket_id}-${itemIndex}`} className="sports-tickets-guest-block">
              <p className="sports-tickets-guest-block__title">
                Ticket {item.ticket_id} · {item.guests.length} guest(s)
              </p>
              {item.guests.map((guest, guestIndex) => (
                <div key={`${guest.guest_id || guestIndex}`} className="sports-tickets-guest-card">
                  <h3>
                    {guest.lead_guest ? 'Lead guest' : `Guest ${guestIndex + 1}`}
                  </h3>
                  <div className="sports-tickets-guest-grid">
                    {guest.fields.map((field) => (
                      <label key={field}>
                        {fieldLabel(field)}
                        {guest.conditions?.[field] === 'pre_checkout' ? ' *' : ''}
                        {field === 'gender' ? (
                          <select
                            value={guest.values?.[field] || ''}
                            onChange={(e) =>
                              updateGuestValue(itemIndex, guestIndex, field, e.target.value)
                            }
                          >
                            <option value="">Select…</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="unknown">Unknown</option>
                          </select>
                        ) : (
                          <input
                            type={field === 'date_of_birth' ? 'date' : field.includes('email') ? 'email' : 'text'}
                            value={guest.values?.[field] || ''}
                            onChange={(e) =>
                              updateGuestValue(itemIndex, guestIndex, field, e.target.value)
                            }
                          />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {needsGuestInput ? (
            <button
              type="button"
              className="sports-tickets-reserve-btn"
              disabled={savingGuests || guestLoading}
              onClick={submitGuests}
              style={{ marginTop: '0.75rem' }}
            >
              {savingGuests ? 'Saving guests…' : guestsSaved ? 'Guest data saved — update again' : 'Save guest data'}
            </button>
          ) : null}

          <h2 className="sports-tickets-subheading" style={{ marginTop: '2rem' }}>
            Finalize booking
          </h2>
          <div className="sports-tickets-reserve-form" style={{ maxWidth: '28rem' }}>
            <label>
              Booking email
              <input
                type="email"
                value={bookingEmail}
                onChange={(e) => setBookingEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <p className="sports-tickets-status">
              Payment method: <strong>invoice</strong>. You will receive a confirmation email; Honeywell
              Travel will follow up with payment instructions. No card payment is taken on this website.
            </p>
            {actionError ? <p className="sports-tickets-error">{actionError}</p> : null}
            <button
              type="button"
              className="sports-tickets-reserve-btn"
              disabled={booking || guestLoading}
              onClick={finalizeBooking}
            >
              {booking ? 'Creating booking…' : 'Confirm booking'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SportsTicketsReservation
