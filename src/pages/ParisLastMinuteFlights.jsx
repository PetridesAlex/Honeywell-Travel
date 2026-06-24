import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import HoneypotField from '../components/HoneypotField'
import { PARIS_LAST_MINUTE_OFFER } from '../data/parisLastMinuteFlights'
import { FORM_TYPES } from '../lib/formConstants'
import { FORM_ERROR_MESSAGE, FORM_SUCCESS_MESSAGE, submitWebsiteForm } from '../lib/submitWebsiteForm'
import './ParisLastMinuteFlights.css'

const offer = PARIS_LAST_MINUTE_OFFER

function ParisLastMinuteFlights() {
  const datesRef = useRef(null)
  const bookingRef = useRef(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [bookingForm, setBookingForm] = useState({
    name: '',
    surname: '',
    email: '',
    contactNumber: '',
    travelers: '1',
  })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  useLayoutEffect(() => {
    const resetTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      if (document.documentElement) document.documentElement.scrollTop = 0
      if (document.body) document.body.scrollTop = 0
    }
    resetTop()
    requestAnimationFrame(resetTop)
  }, [])

  const scrollToDates = () => {
    datesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const selectDate = (departure) => {
    setSelectedDate(departure)
    setFormError('')
    setFormSuccess(false)
    bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setBookingForm((prev) => ({ ...prev, [name]: value }))
    setFormError('')
    setFormSuccess(false)
  }

  const departureMonths = [...new Set(offer.departures.map((departure) => departure.month))]

  const handleBookingSubmit = async (event) => {
    event.preventDefault()
    const emailValue = bookingForm.email.trim()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValid =
      bookingForm.name.trim() &&
      bookingForm.surname.trim() &&
      emailValue &&
      emailPattern.test(emailValue) &&
      bookingForm.contactNumber.trim() &&
      selectedDate

    if (!isValid) {
      setFormError(
        selectedDate
          ? 'Please complete your name, valid email, and contact number.'
          : 'Please select a departure date and complete your contact details.',
      )
      return
    }

    setIsSubmitting(true)
    setFormError('')
    setFormSuccess(false)

    const fullName = `${bookingForm.name.trim()} ${bookingForm.surname.trim()}`.trim()
    const travelers = bookingForm.travelers || '1'
    const message = [
      'Booking request for flight ticket.',
      '',
      `Destination: ${offer.destinationFull}`,
      `Offer: Paris Last-Minute Flights`,
      `Airline: ${offer.airline}`,
      `Route: ${offer.route}`,
      `Departure date: ${selectedDate.label} (${selectedDate.shortLabel}/${offer.year})`,
      `Price: ${offer.currency} ${offer.price} per person`,
      `Travelers: ${travelers}`,
      `Checked baggage: up to 23 kg`,
      `Cabin baggage: up to 10 kg`,
      `Contact number: ${bookingForm.contactNumber.trim()}`,
    ].join('\n')

    const result = await submitWebsiteForm({
      formType: FORM_TYPES.FLIGHT_BOOKING,
      name: fullName,
      email: emailValue,
      phone: bookingForm.contactNumber.trim(),
      destination: offer.destination,
      travelDates: `${selectedDate.shortLabel}/${offer.year}`,
      passengers: travelers,
      message,
      honeypot,
      extraFields: {
        Offer: 'Paris Last-Minute Flights',
        Airline: offer.airline,
        Route: offer.route,
        Price: `${offer.currency} ${offer.price}`,
        Departure: selectedDate.shortLabel,
        Travelers: travelers,
      },
      leadData: {
        full_name: fullName,
        phone: bookingForm.contactNumber.trim(),
        email: emailValue,
        destination: offer.destination,
        travel_dates: `${selectedDate.shortLabel}/${offer.year}`,
        number_of_travelers: travelers,
        budget: String(offer.price),
        message,
        source: 'Paris Last-Minute Landing',
      },
    })

    if (result.ok) {
      setSelectedDate(null)
      setBookingForm({ name: '', surname: '', email: '', contactNumber: '', travelers: '1' })
      setHoneypot('')
      setFormSuccess(true)
      window.alert(FORM_SUCCESS_MESSAGE)
    } else {
      setFormError(result.error || FORM_ERROR_MESSAGE)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="paris-lm-page">
      <SEO
        title="Last-Minute Flights to Paris — €460 | Honeywell Travel"
        description="Limited seats to Paris from €460 per person. Selected July & August 2026 departures with checked and cabin baggage included. Book your Paris city break with Honeywell Travel."
        keywords="last minute flights Paris, Paris flights Cyprus, Larnaca Paris flights, cheap flights Paris, Honeywell Travel"
        url="https://www.honeywelltravel.com.cy/last-minute-flights/paris"
      />

      <section className="paris-lm-hero">
        <div className="paris-lm-hero-bg" aria-hidden="true">
          <img
            src={offer.images.hero}
            alt=""
            className="paris-lm-hero-image"
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <div className="paris-lm-hero-content">
          <p className="paris-lm-eyebrow">Last-minute offer · Summer {offer.year}</p>
          <h1>Fly to Paris</h1>
          <p className="paris-lm-hero-lead">
            Exclusive seats on selected departures — the City of Light awaits.
          </p>
          <div className="paris-lm-hero-price">
            <span className="paris-lm-hero-price-value">{offer.priceLabel}</span>
            <span className="paris-lm-hero-price-note">{offer.priceNote}</span>
          </div>
          <button type="button" className="paris-lm-hero-cta" onClick={scrollToDates}>
            View departure dates
            <span aria-hidden="true">↓</span>
          </button>
        </div>

        <div className="paris-lm-strip" aria-label="Offer highlights">
          <div className="paris-lm-container">
            <div className="paris-lm-strip-panel">
              <div className="paris-lm-strip-inner">
                <article className="paris-lm-strip-item">
                  <span className="paris-lm-strip-icon-wrap" aria-hidden="true">✈</span>
                  <div className="paris-lm-strip-item-copy">
                    <span className="paris-lm-strip-item-label">Route</span>
                    <strong>{offer.route}</strong>
                    <span className="paris-lm-strip-item-detail">Limited availability</span>
                  </div>
                </article>
                <article className="paris-lm-strip-item paris-lm-strip-item--accent">
                  <span className="paris-lm-strip-icon-wrap" aria-hidden="true">🧳</span>
                  <div className="paris-lm-strip-item-copy">
                    <span className="paris-lm-strip-item-label">Included</span>
                    <strong>Baggage included</strong>
                    <span className="paris-lm-strip-item-detail">23 kg checked + 10 kg cabin</span>
                  </div>
                </article>
                <article className="paris-lm-strip-item">
                  <span className="paris-lm-strip-icon-wrap" aria-hidden="true">⏱</span>
                  <div className="paris-lm-strip-item-copy">
                    <span className="paris-lm-strip-item-label">Availability</span>
                    <strong>Last-minute seats</strong>
                    <span className="paris-lm-strip-item-detail">Book before they&apos;re gone</span>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="paris-lm-gallery paris-lm-section-full" aria-label="Paris imagery">
        <div className="paris-lm-container paris-lm-container--full">
          <header className="paris-lm-gallery-head">
            <p className="paris-lm-section-eyebrow">Discover Paris</p>
            <h2>The City of Light awaits</h2>
          </header>
          <div className="paris-lm-gallery-track">
            {offer.images.gallery.map((image) => (
              <figure
                key={image.src}
                className={`paris-lm-gallery-item paris-lm-gallery-item--${image.layout || 'standard'}`}
              >
                <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
                <figcaption className="paris-lm-gallery-caption">{image.alt}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="paris-lm-dates paris-lm-section-full" ref={datesRef} id="departure-dates">
        <div className="paris-lm-container paris-lm-container--full">
          <header className="paris-lm-section-head paris-lm-section-head--dates">
            <p className="paris-lm-section-eyebrow">Available departures</p>
            <h2>Select your departure date</h2>
            <p>
              Flight seats to Paris at <strong>{offer.priceLabel} per person</strong> on the
              following dates. Price includes one checked bag (23 kg) and one cabin bag (10 kg).
            </p>
          </header>

          <div className="paris-lm-dates-panel">
            <div className="paris-lm-dates-summary">
              <div className="paris-lm-dates-summary-route">
                <span className="paris-lm-dates-summary-label">Route</span>
                <strong>{offer.route}</strong>
              </div>
              <div className="paris-lm-dates-summary-price">
                <span className="paris-lm-dates-summary-label">From</span>
                <strong>{offer.priceLabel}</strong>
                <span>per person</span>
              </div>
              <div className="paris-lm-dates-summary-count">
                <span className="paris-lm-dates-summary-label">Departures</span>
                <strong>{offer.departures.length}</strong>
                <span>dates available</span>
              </div>
            </div>

            {departureMonths.map((month) => (
              <div key={month} className="paris-lm-dates-month-group">
                <div className="paris-lm-dates-month-head">
                  <h3>{month} {offer.year}</h3>
                  <span>{offer.departures.filter((d) => d.month === month).length} departures</span>
                </div>
                <div className="paris-lm-dates-grid">
                  {offer.departures
                    .filter((departure) => departure.month === month)
                    .map((departure) => (
                      <button
                        key={departure.id}
                        type="button"
                        className={`paris-lm-date-card${selectedDate?.id === departure.id ? ' paris-lm-date-card--selected' : ''}`}
                        onClick={() => selectDate(departure)}
                        aria-pressed={selectedDate?.id === departure.id}
                      >
                        <span className="paris-lm-date-check" aria-hidden="true">✓</span>
                        <span className="paris-lm-date-day">{departure.label}</span>
                        <span className="paris-lm-date-weekday">{departure.shortLabel}</span>
                        <span className="paris-lm-date-price">{offer.priceLabel}</span>
                        <span className="paris-lm-date-action">
                          {selectedDate?.id === departure.id ? 'Selected' : 'Select'}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="paris-lm-inclusions paris-lm-section-full">
        <div className="paris-lm-container paris-lm-container--full paris-lm-inclusions-grid">
          <div className="paris-lm-inclusions-copy">
            <p className="paris-lm-section-eyebrow">What&apos;s included</p>
            <h2>Everything you need for take-off</h2>
            <ul className="paris-lm-highlights">
              {offer.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="paris-lm-inclusion-cards">
            {offer.inclusions.map((item) => (
              <article key={item.id} className="paris-lm-inclusion-card">
                <span className="paris-lm-inclusion-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="paris-lm-booking" ref={bookingRef} id="book-now">
        <div className="paris-lm-container">
          <div className="paris-lm-booking-card">
            <div className="paris-lm-booking-card-accent" aria-hidden="true" />

            <div className="paris-lm-booking-layout">
              <aside className="paris-lm-booking-aside">
                <header className="paris-lm-booking-head">
                  <p className="paris-lm-section-eyebrow">Reserve your seat</p>
                  <h2>Request a booking</h2>
                  <p>
                    Choose a date above, then send your details. Our team will confirm availability
                    and complete your reservation.
                  </p>
                </header>

                <div className="paris-lm-booking-offer">
                  <div className="paris-lm-booking-offer-head">
                    <span className="paris-lm-booking-offer-eyebrow">Offer summary</span>
                    <strong>Paris last-minute flights</strong>
                  </div>

                  <div className="paris-lm-booking-offer-rows">
                    <div className="paris-lm-booking-offer-row">
                      <span className="paris-lm-booking-offer-label">Destination</span>
                      <strong>Paris, France</strong>
                    </div>
                    <div className="paris-lm-booking-offer-row">
                      <span className="paris-lm-booking-offer-label">Route</span>
                      <strong>{offer.route}</strong>
                    </div>
                    <div className="paris-lm-booking-offer-row">
                      <span className="paris-lm-booking-offer-label">Airline</span>
                      <strong>{offer.airline}</strong>
                    </div>
                    <div className="paris-lm-booking-offer-row paris-lm-booking-offer-row--price">
                      <span className="paris-lm-booking-offer-label">Price</span>
                      <div className="paris-lm-booking-offer-price">
                        <strong>{offer.priceLabel}</strong>
                        <span>per person</span>
                      </div>
                    </div>
                    <div className="paris-lm-booking-offer-row">
                      <span className="paris-lm-booking-offer-label">Baggage</span>
                      <strong>23 kg checked · 10 kg cabin</strong>
                    </div>
                  </div>
                </div>

                {selectedDate ? (
                  <div className="paris-lm-booking-selection">
                    <span>Selected departure</span>
                    <strong>
                      {selectedDate.label} {offer.year}
                    </strong>
                    <em>{offer.priceLabel} per person</em>
                  </div>
                ) : (
                  <p className="paris-lm-booking-hint">Please select a departure date to continue.</p>
                )}
              </aside>

              <div className="paris-lm-booking-main">
                {formSuccess ? (
                  <div className="paris-lm-form-success" role="status">
                    <strong>Request received</strong>
                    <p>{FORM_SUCCESS_MESSAGE}</p>
                  </div>
                ) : null}

                <form className="paris-lm-booking-form" onSubmit={handleBookingSubmit} noValidate>
                  <HoneypotField value={honeypot} onChange={setHoneypot} />

                  <div className="paris-lm-form-section-label">Your details</div>

                  <div className="paris-lm-form-row paris-lm-form-row--split">
                    <label>
                      First name
                      <input
                        type="text"
                        name="name"
                        value={bookingForm.name}
                        onChange={handleInputChange}
                        autoComplete="given-name"
                        required
                      />
                    </label>
                    <label>
                      Last name
                      <input
                        type="text"
                        name="surname"
                        value={bookingForm.surname}
                        onChange={handleInputChange}
                        autoComplete="family-name"
                        required
                      />
                    </label>
                  </div>
                  <div className="paris-lm-form-row paris-lm-form-row--split">
                    <label>
                      Email
                      <input
                        type="email"
                        name="email"
                        value={bookingForm.email}
                        onChange={handleInputChange}
                        autoComplete="email"
                        required
                      />
                    </label>
                    <label>
                      Phone
                      <input
                        type="tel"
                        name="contactNumber"
                        value={bookingForm.contactNumber}
                        onChange={handleInputChange}
                        autoComplete="tel"
                        required
                      />
                    </label>
                  </div>
                  <div className="paris-lm-form-row">
                    <label>
                      Number of travellers
                      <select
                        name="travelers"
                        value={bookingForm.travelers}
                        onChange={handleInputChange}
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={String(n)}>
                            {n} {n === 1 ? 'traveller' : 'travellers'}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {formError ? <p className="paris-lm-form-error" role="alert">{formError}</p> : null}

                  <button
                    type="submit"
                    className="paris-lm-submit"
                    disabled={isSubmitting || !selectedDate}
                  >
                    {isSubmitting ? 'Sending request…' : `Send booking request — ${offer.priceLabel}`}
                  </button>
                </form>

                <div className="paris-lm-booking-footnote">
                  <div className="paris-lm-booking-footnote-copy">
                    <span className="paris-lm-booking-footnote-label">Need assistance?</span>
                    <p>Our travel consultants are ready to confirm your Paris booking.</p>
                  </div>
                  <div className="paris-lm-booking-footnote-actions">
                    <a href="tel:+35725828848" className="paris-lm-booking-footnote-action">
                      <span aria-hidden="true">📞</span>
                      +357 25 828848
                    </a>
                    <Link to="/contact" className="paris-lm-booking-footnote-action paris-lm-booking-footnote-action--secondary">
                      Contact our team
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="paris-lm-footer-cta">
        <div className="paris-lm-container">
          <div className="paris-lm-footer-cta-inner">
            <div className="paris-lm-footer-cta-bg" aria-hidden="true">
              <img
                src="/images/last-minute/paris-rooftop-view-skyline-eiffel-tower-france.jpg"
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="paris-lm-footer-cta-content">
              <p className="paris-lm-footer-cta-eyebrow">Limited summer offer · {offer.year}</p>
              <h2>Paris is calling</h2>
              <p>
                Iconic landmarks, world-class cuisine, and unforgettable moments — all from Cyprus.
              </p>
              <div className="paris-lm-footer-cta-tags">
                <span>From {offer.priceLabel}</span>
                <span>{offer.airline}</span>
                <span>{offer.departures.length} departures</span>
              </div>
            </div>

            <button type="button" className="paris-lm-footer-cta-btn" onClick={scrollToDates}>
              See all dates
              <span aria-hidden="true">↓</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ParisLastMinuteFlights
