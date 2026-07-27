import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getDestinationSummaries, getOffersByDestination } from '../data/flightTickets'
import HoneypotField from '../components/HoneypotField'
import { FORM_TYPES } from '../lib/formConstants'
import { FORM_ERROR_MESSAGE, FORM_SUCCESS_MESSAGE, submitWebsiteForm } from '../lib/submitWebsiteForm'
import './FlightTickets.css'

function splitRoute(route) {
  const parts = String(route || '').split(/\s*-\s*/)
  return {
    from: parts[0]?.trim() || '',
    to: parts.slice(1).join(' - ').trim() || String(route || ''),
  }
}

function splitTime(time) {
  const parts = String(time || '').split(/\s*-\s*/)
  return {
    dep: parts[0]?.trim() || '',
    arr: parts.slice(1).join(' - ').trim() || String(time || ''),
  }
}

function FlightLeg({ label, flight }) {
  const route = splitRoute(flight.route)
  const time = splitTime(flight.time)

  return (
    <div className="flight-leg-premium">
      <span className="flight-leg-premium__label">{label}</span>
      <div className="flight-leg-premium__route">
        <div className="flight-leg-premium__point">
          <span className="flight-leg-premium__city">{route.from}</span>
          <span className="flight-leg-premium__time">{time.dep}</span>
        </div>
        <div className="flight-leg-premium__connector" aria-hidden="true">
          <span className="flight-leg-premium__line" />
          <span className="flight-leg-premium__plane">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </span>
          <span className="flight-leg-premium__line" />
        </div>
        <div className="flight-leg-premium__point flight-leg-premium__point--arrive">
          <span className="flight-leg-premium__city">{route.to}</span>
          <span className="flight-leg-premium__time">{time.arr}</span>
        </div>
      </div>
    </div>
  )
}

function FlightTicketsDestination() {
  const { destination } = useParams()
  const offers = getOffersByDestination(destination)
  const destinationName = offers[0]?.destination || 'Destination'
  const destinationMeta = getDestinationSummaries().find((item) => item.destinationSlug === destination)
  const fromPrice = destinationMeta?.fromPrice
  const heroImage = destinationMeta?.image || ''
  const [selectedDeparture, setSelectedDeparture] = useState(null)
  const [bookingForm, setBookingForm] = useState({
    name: '',
    surname: '',
    email: '',
    contactNumber: ''
  })
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  const openBookingForm = (offer, departure) => {
    setSelectedDeparture({ offer, departure })
    setBookingForm({
      name: '',
      surname: '',
      email: '',
      contactNumber: ''
    })
    setFormError('')
  }

  const closeBookingForm = () => {
    setSelectedDeparture(null)
    setFormError('')
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setBookingForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBookingSubmit = async (event) => {
    event.preventDefault()
    const emailValue = bookingForm.email.trim()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValid =
      bookingForm.name.trim() &&
      bookingForm.surname.trim() &&
      emailValue &&
      emailPattern.test(emailValue) &&
      bookingForm.contactNumber.trim()

    if (!isValid) {
      setFormError('Παρακαλώ συμπληρώστε όνομα, επίθετο, έγκυρο email και αριθμό επικοινωνίας.')
      return
    }

    const fullName = `${bookingForm.name.trim()} ${bookingForm.surname.trim()}`.trim()
    const offer = selectedDeparture?.offer
    const departure = selectedDeparture?.departure

    if (!offer || !departure) {
      setFormError('Παρουσιάστηκε πρόβλημα με την επιλογή πτήσης. Παρακαλώ δοκιμάστε ξανά.')
      return
    }

    setIsSubmitting(true)
    setFormError('')

    const message = [
      `Booking request for flight ticket.`,
      `Destination: ${offer.destination}`,
      `Offer: ${offer.title}`,
      `Airline: ${offer.airline}`,
      `Departure: ${departure.departureDate} | ${offer.departureFlight.route} | ${offer.departureFlight.time}`,
      `Return: ${departure.returnDate} | ${offer.returnFlight.route} | ${offer.returnFlight.time}`,
      `Price: EUR ${departure.price}`,
      `Availability: ${departure.availability || 'Μόνο 6 καθίσματα!'}`,
      `Contact Number: ${bookingForm.contactNumber.trim()}`,
    ].join('\n')

    const travelDates = `${departure.departureDate} - ${departure.returnDate}`

    const result = await submitWebsiteForm({
      formType: FORM_TYPES.FLIGHT_BOOKING,
      name: fullName,
      email: emailValue,
      phone: bookingForm.contactNumber.trim(),
      destination: offer.destination,
      travelDates,
      message,
      honeypot,
      extraFields: {
        Offer: offer.title,
        Airline: offer.airline,
        Price: `EUR ${departure.price}`,
      },
      leadData: {
        full_name: fullName,
        phone: bookingForm.contactNumber.trim(),
        email: emailValue,
        destination: offer.destination,
        travel_dates: travelDates,
        number_of_travelers: '',
        budget: departure.price ? String(departure.price) : '',
        message,
        source: 'Book Online',
      },
    })

    if (result.ok) {
      closeBookingForm()
      setHoneypot('')
      window.alert(FORM_SUCCESS_MESSAGE)
    } else {
      setFormError(result.error || FORM_ERROR_MESSAGE)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="flight-tickets-page flight-tickets-page--detail">
      <section className="flight-tickets-hero flight-tickets-hero--detail">
        <div className="flight-tickets-container flight-tickets-container--detail">
          <header className="flight-detail-hero">
            {heroImage ? (
              <div
                className="flight-detail-hero__media"
                style={{ backgroundImage: `url("${heroImage}")` }}
                aria-hidden="true"
              />
            ) : null}
            <div className="flight-detail-hero__shade" aria-hidden="true" />
            <div className="flight-detail-hero__content">
              <Link to="/flight-tickets/" className="flight-back-link flight-back-link--on-dark">
                ← All destinations
              </Link>
              <p className="flight-detail-hero__eyebrow">Flight deals</p>
              <h1>{destinationName}</h1>
              <p className="flight-detail-hero__summary">
                {offers.length} {offers.length === 1 ? 'επιλογή πτήσης' : 'επιλογές πτήσεων'}
                {fromPrice != null ? ` · από €${fromPrice}` : ''}
              </p>
            </div>
          </header>

          {offers.length === 0 ? (
            <p className="flight-detail-empty">Δεν βρέθηκαν προσφορές για αυτό τον προορισμό.</p>
          ) : (
            <div className="flight-offers-stack">
              {offers.map((offer) => {
                const offerFrom = Math.min(...offer.pricing.map((row) => row.price))
                return (
                  <article key={offer.id} className="flight-offer-card flight-offer-card--premium">
                    <div className="flight-offer-card__accent" aria-hidden="true" />
                    <div className="flight-offer-card__header">
                      <div className="flight-offer-card__intro">
                        <div className="flight-offer-card__badges">
                          <span className="flight-offer-badge">{offer.duration}</span>
                          <span className="flight-offer-badge flight-offer-badge--muted">{offer.airline}</span>
                        </div>
                        <h2>{offer.title}</h2>
                        {offer.note ? <p className="flight-offer-note">{offer.note}</p> : null}
                      </div>
                      <div className="flight-offer-card__from">
                        <span>Από</span>
                        <strong>€{offerFrom}</strong>
                      </div>
                    </div>

                    <p className="flight-offer-luggage">{offer.luggage}</p>

                    <div className="flight-itinerary">
                      <FlightLeg label="Αναχώρηση" flight={offer.departureFlight} />
                      <FlightLeg label="Επιστροφή" flight={offer.returnFlight} />
                    </div>

                    <div className="flight-pricing-table flight-pricing-table--premium">
                      <div className="flight-pricing-head">
                        <span>Αναχωρήσεις</span>
                        <span>Τιμές</span>
                      </div>
                      {offer.pricing.map((row, idx) => (
                        <div key={`${offer.id}-${idx}`} className="flight-pricing-row">
                          <span>{row.dates}</span>
                          <strong>€{row.price}</strong>
                        </div>
                      ))}
                    </div>

                    {offer.departures?.length ? (
                      <div className="flight-departure-list">
                        <div className="flight-departure-list__head">
                          <h3>Επιλέξτε αναχώρηση</h3>
                          <span>{offer.departures.length} διαθέσιμες</span>
                        </div>
                        {offer.departures.map((departure, idx) => (
                          <div key={`${offer.id}-dep-${idx}`} className="flight-departure-item flight-departure-item--premium">
                            <div className="flight-departure-dates">
                              <div className="flight-departure-date-block">
                                <span className="flight-departure-date-label">Αναχώρηση</span>
                                <strong>{departure.departureDate}</strong>
                              </div>
                              <span className="flight-departure-date-arrow" aria-hidden="true">→</span>
                              <div className="flight-departure-date-block">
                                <span className="flight-departure-date-label">Επιστροφή</span>
                                <strong>{departure.returnDate}</strong>
                              </div>
                            </div>
                            <div className="flight-departure-meta">
                              <div className="flight-departure-tags">
                                <span className="flight-tag flight-tag--alert">
                                  {departure.availability || 'Μόνο 6 καθίσματα!'}
                                </span>
                                <span className="flight-tag">Charter</span>
                              </div>
                              <div className="flight-departure-actions">
                                <div className="flight-departure-price">
                                  <span>Τιμή</span>
                                  <strong>€{departure.price}</strong>
                                </div>
                                <button
                                  type="button"
                                  className="flight-book-now-btn"
                                  onClick={() => openBookingForm(offer, departure)}
                                >
                                  Book Now
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
          )}

          {selectedDeparture ? (
            <div className="flight-booking-modal-backdrop" role="dialog" aria-modal="true">
              <div className="flight-booking-modal flight-booking-modal--premium">
                <div className="flight-booking-modal__header">
                  <p className="flight-booking-modal__eyebrow">Booking request</p>
                  <h2>Book Flight Ticket</h2>
                  <p className="flight-booking-modal-summary">
                    {selectedDeparture.offer.title}
                    <span>
                      {selectedDeparture.departure.departureDate} – {selectedDeparture.departure.returnDate}
                    </span>
                    <strong>€{selectedDeparture.departure.price}</strong>
                  </p>
                </div>

                <form onSubmit={handleBookingSubmit} className="flight-booking-form">
                  <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                  <div className="flight-booking-form__grid">
                    <label>
                      Name
                      <input
                        type="text"
                        name="name"
                        value={bookingForm.name}
                        onChange={handleInputChange}
                        required
                      />
                    </label>

                    <label>
                      Surname
                      <input
                        type="text"
                        name="surname"
                        value={bookingForm.surname}
                        onChange={handleInputChange}
                        required
                      />
                    </label>

                    <label>
                      Email
                      <input
                        type="email"
                        name="email"
                        value={bookingForm.email}
                        onChange={handleInputChange}
                        required
                      />
                    </label>

                    <label>
                      Contact Number
                      <input
                        type="tel"
                        name="contactNumber"
                        value={bookingForm.contactNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </label>
                  </div>

                  {formError ? <p className="flight-booking-form-error">{formError}</p> : null}

                  <div className="flight-booking-form-actions">
                    <button type="button" className="flight-booking-cancel-btn" onClick={closeBookingForm}>
                      Cancel
                    </button>
                    <button type="submit" className="flight-booking-submit-btn" disabled={isSubmitting}>
                      {isSubmitting ? 'Sending...' : 'Submit request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export default FlightTicketsDestination
