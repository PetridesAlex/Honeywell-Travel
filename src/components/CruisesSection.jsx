import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import HoneypotField from './HoneypotField'
import { FORM_TYPES } from '../lib/formConstants'
import { FORM_SUCCESS_MESSAGE, submitWebsiteForm } from '../lib/submitWebsiteForm'
import './CruisesSection.css'

const FEATURED_CHAINS = [
  { name: 'Marriott', note: 'Global collection' },
  { name: 'Hilton', note: 'Worldwide stays' },
  { name: 'Sheraton', note: 'Signature comfort' },
  { name: 'Hyatt', note: 'Refined hospitality' },
  { name: 'InterContinental', note: 'Landmark hotels' },
  { name: 'Four Seasons', note: 'Ultra luxury' },
  { name: 'The Ritz-Carlton', note: 'Iconic service' },
  { name: 'Accor', note: 'Sofitel · Pullman' },
  { name: 'Fairmont', note: 'Grand addresses' },
  { name: 'Mandarin Oriental', note: 'Boutique luxury' },
  { name: 'St. Regis', note: 'Timeless elegance' },
  { name: 'Kempinski', note: 'European heritage' }
]

const MARQUEE_CHAINS = [
  'Marriott',
  'Hilton',
  'Sheraton',
  'Hyatt',
  'InterContinental',
  'Four Seasons',
  'The Ritz-Carlton',
  'JW Marriott',
  'Westin',
  'Sofitel',
  'Fairmont',
  'Mandarin Oriental',
  'St. Regis',
  'Radisson',
  'Crowne Plaza',
  'Kempinski',
  'Mövenpick',
  'Pullman'
]

function CruisesSection() {
  const [modalOpen, setModalOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [form, setForm] = useState({
    hotelName: '',
    city: '',
    checkIn: '',
    checkOut: '',
    name: '',
    email: ''
  })

  const openModal = () => setModalOpen(true)
  const closeModal = () => {
    if (!sending) {
      setModalOpen(false)
      setError('')
      if (sent) {
        setSent(false)
        setForm({ hotelName: '', city: '', checkIn: '', checkOut: '', name: '', email: '' })
      }
    }
  }

  useEffect(() => {
    if (!modalOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [modalOpen, sending, sent])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSending(true)
    const travelDates = [form.checkIn, form.checkOut].filter(Boolean).join(' - ')
    const message = [
      'Hotel Quote Request',
      '',
      `Hotel name: ${form.hotelName || '—'}`,
      `City: ${form.city || '—'}`,
      `Check-in: ${form.checkIn || '—'}`,
      `Check-out: ${form.checkOut || '—'}`
    ].join('\n')

    const result = await submitWebsiteForm({
      formType: FORM_TYPES.HOTEL_QUOTE,
      name: form.name,
      email: form.email,
      destination: form.city || form.hotelName || '',
      travelDates,
      message,
      honeypot,
      extraFields: {
        'Hotel name': form.hotelName || '—'
      },
      leadData: {
        full_name: form.name || 'Not provided',
        phone: '',
        email: form.email || '',
        destination: form.city || '',
        travel_dates: travelDates,
        number_of_travelers: '',
        budget: '',
        message,
        source: 'Website'
      }
    })

    if (result.ok) {
      setSent(true)
      setHoneypot('')
    } else {
      setError(result.error)
    }
    setSending(false)
  }

  return (
    <section className="hotel-partners-section" aria-labelledby="hotel-partners-title">
      <div className="hotel-partners-atmosphere" aria-hidden="true" />

      <div className="cruises-container hotel-partners-container">
        <header className="hotel-partners-header">
          <p className="hotel-partners-eyebrow">Preferred worldwide partners</p>
          <h2 id="hotel-partners-title" className="hotel-partners-title">
            Stay with the world&apos;s great hotel houses
          </h2>
          <p className="hotel-partners-subtitle">
            From Marriott and Hilton to Four Seasons and The Ritz-Carlton — we secure
            preferential rates across leading chains, with specialist support before and
            during your stay.
          </p>
        </header>

        <div className="hotel-partners-marquee" aria-hidden="true">
          <div className="hotel-partners-marquee-track">
            {[...MARQUEE_CHAINS, ...MARQUEE_CHAINS].map((name, index) => (
              <span key={`${name}-${index}`} className="hotel-partners-marquee-item">
                {name}
              </span>
            ))}
          </div>
        </div>

        <ul className="hotel-partners-grid">
          {FEATURED_CHAINS.map((chain) => (
            <li key={chain.name} className="hotel-partners-brand">
              <span className="hotel-partners-brand-name">{chain.name}</span>
              <span className="hotel-partners-brand-note">{chain.note}</span>
            </li>
          ))}
        </ul>

        <div className="hotel-partners-value">
          <p className="hotel-partners-value-item">
            <span className="hotel-partners-value-index" aria-hidden="true">
              01
            </span>
            <span className="hotel-partners-value-copy">
              <span className="hotel-partners-value-label">Negotiated rates</span>
              Often stronger than public booking platforms
            </span>
          </p>
          <p className="hotel-partners-value-item">
            <span className="hotel-partners-value-index" aria-hidden="true">
              02
            </span>
            <span className="hotel-partners-value-copy">
              <span className="hotel-partners-value-label">Expert matching</span>
              The right property for your trip, city, and style
            </span>
          </p>
          <p className="hotel-partners-value-item">
            <span className="hotel-partners-value-index" aria-hidden="true">
              03
            </span>
            <span className="hotel-partners-value-copy">
              <span className="hotel-partners-value-label">Human support</span>
              Room preferences, changes, and on-trip assistance
            </span>
          </p>
        </div>

        <div className="hotel-partners-cta">
          <p className="hotel-partners-cta-text">
            Tell us the hotel or city — we&apos;ll quote the best available rate.
          </p>
          <button type="button" className="hotel-cta-btn" onClick={openModal}>
            <span className="hotel-cta-btn__sheen" aria-hidden="true" />
            <span>Request a hotel quote</span>
            <span className="btn-icon" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </div>

      {modalOpen &&
        createPortal(
          <div
            className="hotel-quote-overlay"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="hotel-quote-title"
          >
            <div className="hotel-quote-modal" onClick={(e) => e.stopPropagation()}>
              <div className="hotel-quote-modal-header">
                <h2 id="hotel-quote-title" className="hotel-quote-modal-title">
                  Request a hotel quote
                </h2>
                <button type="button" className="hotel-quote-close" onClick={closeModal} aria-label="Close">
                  ×
                </button>
              </div>
              {sent ? (
                <div className="hotel-quote-success">
                  <p>{FORM_SUCCESS_MESSAGE}</p>
                  <button type="button" className="hotel-cta-btn" onClick={closeModal}>
                    Close
                  </button>
                </div>
              ) : (
                <form className="hotel-quote-form" onSubmit={handleSubmit}>
                  <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                  <p className="hotel-quote-intro">
                    Share the details below and we&apos;ll email you a quote for Marriott, Hilton,
                    Sheraton, and other leading hotels.
                  </p>
                  <label className="hotel-quote-label">
                    Hotel name
                    <input
                      type="text"
                      name="hotelName"
                      value={form.hotelName}
                      onChange={handleChange}
                      placeholder="e.g. Hilton Paris Opéra"
                      className="hotel-quote-input"
                    />
                  </label>
                  <label className="hotel-quote-label">
                    City
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="e.g. Paris"
                      className="hotel-quote-input"
                      required
                    />
                  </label>
                  <div className="hotel-quote-row">
                    <label className="hotel-quote-label">
                      Check-in date
                      <input
                        type="date"
                        name="checkIn"
                        value={form.checkIn}
                        onChange={handleChange}
                        className="hotel-quote-input"
                        required
                      />
                    </label>
                    <label className="hotel-quote-label">
                      Check-out date
                      <input
                        type="date"
                        name="checkOut"
                        value={form.checkOut}
                        onChange={handleChange}
                        className="hotel-quote-input"
                        required
                      />
                    </label>
                  </div>
                  <label className="hotel-quote-label">
                    Your name
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Full name"
                      className="hotel-quote-input"
                      required
                    />
                  </label>
                  <label className="hotel-quote-label">
                    Your email
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="hotel-quote-input"
                      required
                    />
                  </label>
                  {error && <p className="hotel-quote-error">{error}</p>}
                  <div className="hotel-quote-actions">
                    <button type="button" className="hotel-quote-btn secondary" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className="hotel-quote-btn primary" disabled={sending}>
                      {sending ? 'Sending…' : 'Send request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body,
        )}
    </section>
  )
}

export default CruisesSection
