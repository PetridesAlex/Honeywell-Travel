import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import HoneypotField from '../components/HoneypotField'
import { PARIS_LAST_MINUTE_OFFER } from '../data/parisLastMinuteFlights'
import { FORM_TYPES } from '../lib/formConstants'
import { submitWebsiteForm } from '../lib/submitWebsiteForm'
import './ParisLastMinuteFlights.css'

const offer = PARIS_LAST_MINUTE_OFFER

function ParisLastMinuteFlights() {
  const { t } = useTranslation()
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
          ? t('parisFlights.formErrorDetails')
          : t('parisFlights.formErrorDate'),
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
      window.alert(t('forms.success'))
    } else {
      setFormError(result.error || t('forms.error'))
    }
    setIsSubmitting(false)
  }

  return (
    <div className="paris-lm-page">
      <SEO
        title={t('parisFlights.seoTitle')}
        description={t('parisFlights.seoDescription')}
        keywords={t('parisFlights.seoKeywords')}
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
          <p className="paris-lm-eyebrow">{t('parisFlights.eyebrow', { year: offer.year })}</p>
          <h1>{t('parisFlights.heroTitle')}</h1>
          <p className="paris-lm-hero-lead">{t('parisFlights.heroLead')}</p>
          <div className="paris-lm-hero-price">
            <span className="paris-lm-hero-price-value">{offer.priceLabel}</span>
            <span className="paris-lm-hero-price-note">{offer.priceNote}</span>
          </div>
          <button type="button" className="paris-lm-hero-cta" onClick={scrollToDates}>
            {t('parisFlights.viewDates')}
            <span aria-hidden="true">↓</span>
          </button>
        </div>

        <div className="paris-lm-strip" aria-label={t('parisFlights.offerHighlights')}>
          <div className="paris-lm-container">
            <div className="paris-lm-strip-panel">
              <div className="paris-lm-strip-inner">
                <article className="paris-lm-strip-item">
                  <span className="paris-lm-strip-icon-wrap" aria-hidden="true">✈</span>
                  <div className="paris-lm-strip-item-copy">
                    <span className="paris-lm-strip-item-label">{t('flights.route')}</span>
                    <strong>{offer.route}</strong>
                    <span className="paris-lm-strip-item-detail">{t('parisFlights.limitedAvailability')}</span>
                  </div>
                </article>
                <article className="paris-lm-strip-item paris-lm-strip-item--accent">
                  <span className="paris-lm-strip-icon-wrap" aria-hidden="true">🧳</span>
                  <div className="paris-lm-strip-item-copy">
                    <span className="paris-lm-strip-item-label">{t('flights.included')}</span>
                    <strong>{t('parisFlights.baggageIncluded')}</strong>
                    <span className="paris-lm-strip-item-detail">{t('parisFlights.baggageDetail')}</span>
                  </div>
                </article>
                <article className="paris-lm-strip-item">
                  <span className="paris-lm-strip-icon-wrap" aria-hidden="true">⏱</span>
                  <div className="paris-lm-strip-item-copy">
                    <span className="paris-lm-strip-item-label">{t('flights.availability')}</span>
                    <strong>{t('parisFlights.lastMinuteSeats')}</strong>
                    <span className="paris-lm-strip-item-detail">{t('parisFlights.bookBeforeGone')}</span>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="paris-lm-gallery paris-lm-section-full" aria-label={t('parisFlights.discoverParis')}>
        <div className="paris-lm-container paris-lm-container--full">
          <header className="paris-lm-gallery-head">
            <p className="paris-lm-section-eyebrow">{t('parisFlights.discoverParis')}</p>
            <h2>{t('parisFlights.cityAwaits')}</h2>
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
            <p className="paris-lm-section-eyebrow">{t('parisFlights.availableDepartures')}</p>
            <h2>{t('parisFlights.selectDate')}</h2>
            <p>
              {t('parisFlights.datesIntro', { price: offer.priceLabel })}
            </p>
          </header>

          <div className="paris-lm-dates-panel">
            <div className="paris-lm-dates-summary">
              <div className="paris-lm-dates-summary-route">
                <span className="paris-lm-dates-summary-label">{t('flights.route')}</span>
                <strong>{offer.route}</strong>
              </div>
              <div className="paris-lm-dates-summary-price">
                <span className="paris-lm-dates-summary-label">{t('flights.from')}</span>
                <strong>{offer.priceLabel}</strong>
                <span>{t('parisFlights.perPerson')}</span>
              </div>
              <div className="paris-lm-dates-summary-count">
                <span className="paris-lm-dates-summary-label">{t('flights.departures')}</span>
                <strong>{offer.departures.length}</strong>
                <span>{t('parisFlights.datesAvailable')}</span>
              </div>
            </div>

            {departureMonths.map((month) => (
              <div key={month} className="paris-lm-dates-month-group">
                <div className="paris-lm-dates-month-head">
                  <h3>{month} {offer.year}</h3>
                  <span>{t('parisFlights.departuresCount', { count: offer.departures.filter((d) => d.month === month).length })}</span>
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
                          {selectedDate?.id === departure.id ? t('flights.selected') : t('flights.selectDeparture')}
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
            <p className="paris-lm-section-eyebrow">{t('parisFlights.whatsIncluded')}</p>
            <h2>{t('parisFlights.everythingForTakeoff')}</h2>
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
                  <p className="paris-lm-section-eyebrow">{t('parisFlights.reserveSeat')}</p>
                  <h2>{t('parisFlights.requestBooking')}</h2>
                  <p>{t('parisFlights.bookingIntro')}</p>
                </header>

                <div className="paris-lm-booking-offer">
                  <div className="paris-lm-booking-offer-head">
                    <span className="paris-lm-booking-offer-eyebrow">{t('parisFlights.offerSummary')}</span>
                    <strong>{t('parisFlights.offerName')}</strong>
                  </div>

                  <div className="paris-lm-booking-offer-rows">
                    <div className="paris-lm-booking-offer-row">
                      <span className="paris-lm-booking-offer-label">{t('parisFlights.destination')}</span>
                      <strong>{t('parisFlights.destinationValue')}</strong>
                    </div>
                    <div className="paris-lm-booking-offer-row">
                      <span className="paris-lm-booking-offer-label">{t('flights.route')}</span>
                      <strong>{offer.route}</strong>
                    </div>
                    <div className="paris-lm-booking-offer-row">
                      <span className="paris-lm-booking-offer-label">{t('parisFlights.airline')}</span>
                      <strong>{offer.airline}</strong>
                    </div>
                    <div className="paris-lm-booking-offer-row paris-lm-booking-offer-row--price">
                      <span className="paris-lm-booking-offer-label">{t('flights.price')}</span>
                      <div className="paris-lm-booking-offer-price">
                        <strong>{offer.priceLabel}</strong>
                        <span>{t('parisFlights.perPerson')}</span>
                      </div>
                    </div>
                    <div className="paris-lm-booking-offer-row">
                      <span className="paris-lm-booking-offer-label">{t('parisFlights.baggage')}</span>
                      <strong>{t('parisFlights.baggageValue')}</strong>
                    </div>
                  </div>
                </div>

                {selectedDate ? (
                  <div className="paris-lm-booking-selection">
                    <span>{t('parisFlights.selectedDeparture')}</span>
                    <strong>
                      {selectedDate.label} {offer.year}
                    </strong>
                    <em>{offer.priceLabel} {t('parisFlights.perPerson')}</em>
                  </div>
                ) : (
                  <p className="paris-lm-booking-hint">{t('parisFlights.selectDateHint')}</p>
                )}
              </aside>

              <div className="paris-lm-booking-main">
                {formSuccess ? (
                  <div className="paris-lm-form-success" role="status">
                    <strong>{t('parisFlights.requestReceived')}</strong>
                    <p>{t('forms.success')}</p>
                  </div>
                ) : null}

                <form className="paris-lm-booking-form" onSubmit={handleBookingSubmit} noValidate>
                  <HoneypotField value={honeypot} onChange={setHoneypot} />

                  <div className="paris-lm-form-section-label">{t('flights.yourDetails')}</div>

                  <div className="paris-lm-form-row paris-lm-form-row--split">
                    <label>
                      {t('flights.firstName')}
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
                      {t('flights.lastName')}
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
                      {t('forms.email')}
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
                      {t('forms.phone')}
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
                      {t('flights.travellers')}
                      <select
                        name="travelers"
                        value={bookingForm.travelers}
                        onChange={handleInputChange}
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={String(n)}>
                            {n} {n === 1 ? t('flights.traveller') : t('flights.travellersPlural')}
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
                    {isSubmitting ? t('common.sending') : t('parisFlights.sendBookingWithPrice', { price: offer.priceLabel })}
                  </button>
                </form>

                <div className="paris-lm-booking-footnote">
                  <div className="paris-lm-booking-footnote-copy">
                    <span className="paris-lm-booking-footnote-label">{t('parisFlights.footnoteLabel')}</span>
                    <p>{t('parisFlights.footnoteText')}</p>
                  </div>
                  <div className="paris-lm-booking-footnote-actions">
                    <a href="tel:+35725828848" className="paris-lm-booking-footnote-action">
                      <span aria-hidden="true">📞</span>
                      +357 25 828848
                    </a>
                    <Link to="/contact" className="paris-lm-booking-footnote-action paris-lm-booking-footnote-action--secondary">
                      {t('flights.contactTeam')}
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
              <p className="paris-lm-footer-cta-eyebrow">{t('parisFlights.limitedOffer', { year: offer.year })}</p>
              <h2>{t('parisFlights.parisCalling')}</h2>
              <p>{t('parisFlights.footerLead')}</p>
              <div className="paris-lm-footer-cta-tags">
                <span>{t('flights.from')} {offer.priceLabel}</span>
                <span>{offer.airline}</span>
                <span>{t('parisFlights.departuresCount', { count: offer.departures.length })}</span>
              </div>
            </div>

            <button type="button" className="paris-lm-footer-cta-btn" onClick={scrollToDates}>
              {t('parisFlights.seeAllDates')}
              <span aria-hidden="true">↓</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ParisLastMinuteFlights
