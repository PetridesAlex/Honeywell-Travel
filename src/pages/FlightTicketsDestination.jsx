import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOffersByDestination } from '../data/flightTickets'
import HoneypotField from '../components/HoneypotField'
import { FORM_TYPES } from '../lib/formConstants'
import { FORM_ERROR_MESSAGE, FORM_SUCCESS_MESSAGE, submitWebsiteForm } from '../lib/submitWebsiteForm'
import './FlightTickets.css'

function FlightTicketsDestination() {
  const { destination } = useParams()
  const offers = getOffersByDestination(destination)
  const destinationName = offers[0]?.destination || 'Destination'
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
    <div className="flight-tickets-page">
      <section className="flight-tickets-hero">
        <div className="flight-tickets-container">
          <div className="flight-detail-header">
            <Link to="/flight-tickets/" className="flight-back-link">← All destinations</Link>
            <h1>{destinationName}</h1>
          </div>

          {offers.length === 0 ? (
            <p>Δεν βρέθηκαν προσφορές για αυτό τον προορισμό.</p>
          ) : (
            <div className="flight-offers-stack">
              {offers.map((offer) => (
                <article key={offer.id} className="flight-offer-card">
                  <h2>{offer.title}</h2>
                  <p className="flight-offer-meta">
                    {offer.airline} | {offer.luggage}
                  </p>
                  {offer.note ? <p className="flight-offer-note">{offer.note}</p> : null}

                  <div className="flight-leg">
                    <strong>Αναχώρηση Πτήσης:</strong> {offer.departureFlight.route} | {offer.departureFlight.time}
                  </div>
                  <div className="flight-leg">
                    <strong>Επιστροφή Πτήσης:</strong> {offer.returnFlight.route} | {offer.returnFlight.time}
                  </div>

                  <div className="flight-pricing-table">
                    <div className="flight-pricing-head">
                      <span>Αναχωρήσεις</span>
                      <span>Τιμές</span>
                    </div>
                    {offer.pricing.map((row, idx) => (
                      <div key={`${offer.id}-${idx}`} className="flight-pricing-row">
                        <span>{row.dates}</span>
                        <strong>EUR {row.price}</strong>
                      </div>
                    ))}
                  </div>

                  {offer.departures?.length ? (
                    <div className="flight-departure-list">
                      <h3>Αναλυτικές αναχωρήσεις</h3>
                      {offer.departures.map((departure, idx) => (
                        <div key={`${offer.id}-dep-${idx}`} className="flight-departure-item">
                          <div className="flight-departure-row">
                            <strong>Αναχώρηση:</strong> {departure.departureDate} | {offer.departureFlight.route} | {offer.departureFlight.time}
                          </div>
                          <div className="flight-departure-row">
                            <strong>Επιστροφή:</strong> {departure.returnDate} | {offer.returnFlight.route} | {offer.returnFlight.time}
                          </div>
                          <div className="flight-departure-meta">
                            <div className="flight-departure-tags">
                              <span>{departure.availability || 'Μόνο 6 καθίσματα!'}</span>
                              <span>Charter Flight Ναυλωμένες Πτήσεις</span>
                            </div>
                            <div className="flight-departure-actions">
                              <strong>EUR {departure.price}</strong>
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
              ))}
            </div>
          )}

          {selectedDeparture ? (
            <div className="flight-booking-modal-backdrop" role="dialog" aria-modal="true">
              <div className="flight-booking-modal">
                <h2>Book Flight Ticket</h2>
                <p className="flight-booking-modal-summary">
                  {selectedDeparture.offer.title} | {selectedDeparture.departure.departureDate} - {selectedDeparture.departure.returnDate} | EUR {selectedDeparture.departure.price}
                </p>

                <form onSubmit={handleBookingSubmit} className="flight-booking-form">
                  <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
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

                  {formError ? <p className="flight-booking-form-error">{formError}</p> : null}

                  <div className="flight-booking-form-actions">
                    <button type="button" className="flight-booking-cancel-btn" onClick={closeBookingForm}>
                      Cancel
                    </button>
                    <button type="submit" className="flight-booking-submit-btn" disabled={isSubmitting}>
                      {isSubmitting ? 'Sending...' : 'Submit'}
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
