import { useState } from 'react'
import HoneypotField from './HoneypotField'
import { FORM_TYPES } from '../lib/formConstants'
import { FORM_SUCCESS_MESSAGE, submitWebsiteForm } from '../lib/submitWebsiteForm'
import './CruisesSection.css'

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
      `Check-out: ${form.checkOut || '—'}`,
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
        'Hotel name': form.hotelName || '—',
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
        source: 'Website',
      },
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
    <section className="cruises-section">
      <div className="cruises-container">
        <div className="cruises-header">
          <h2 className="cruises-title">Hotel Prices That Beat Booking Platforms</h2>
          <p className="cruises-subtitle">
            We often secure more competitive accommodation rates than major booking sites, with expert support before and during your stay.
          </p>
        </div>

        <div className="hotel-value-grid">
          <article className="hotel-value-card">
            <h3 className="hotel-card-title">Better Hotel Deals</h3>
            <p className="hotel-card-copy">
              Through trusted partners and negotiated allocations, our team can often provide rates that are more competitive than public OTA prices.
            </p>
            <div className="hotel-card-highlight">Save more on selected stays</div>
          </article>

          <article className="hotel-value-card">
            <h3 className="hotel-card-title">Real Travel Support</h3>
            <p className="hotel-card-copy">
              You are not just booking a room. You also get expert guidance, help with room preferences, and assistance if anything changes.
            </p>
            <div className="hotel-card-highlight">Local team, fast response</div>
          </article>

          <article className="hotel-value-card">
            <h3 className="hotel-card-title">Tailored Recommendations</h3>
            <p className="hotel-card-copy">
              We match each property to your trip style, location priorities, and budget so you get the right value, not just the lowest headline price.
            </p>
            <div className="hotel-card-highlight">Smart value, not guesswork</div>
          </article>
        </div>

        <div className="hotel-cta-block">
          <p className="hotel-cta-text">
            Compare your next hotel stay with us first and see the difference in value.
          </p>
          <button type="button" className="hotel-cta-btn" onClick={openModal}>
            <span>Request A Hotel Quote</span>
            <span className="btn-icon">→</span>
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className="hotel-quote-overlay" onClick={closeModal} role="dialog" aria-modal="true" aria-labelledby="hotel-quote-title">
          <div className="hotel-quote-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hotel-quote-modal-header">
              <h2 id="hotel-quote-title" className="hotel-quote-modal-title">Request a hotel quote</h2>
              <button type="button" className="hotel-quote-close" onClick={closeModal} aria-label="Close">×</button>
            </div>
            {sent ? (
              <div className="hotel-quote-success">
                <p>{FORM_SUCCESS_MESSAGE}</p>
                <button type="button" className="hotel-cta-btn" onClick={closeModal}>Close</button>
              </div>
            ) : (
              <form className="hotel-quote-form" onSubmit={handleSubmit}>
                <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                <p className="hotel-quote-intro">Provide the details below and we’ll email you a quote.</p>
                <label className="hotel-quote-label">
                  Hotel name
                  <input type="text" name="hotelName" value={form.hotelName} onChange={handleChange} placeholder="e.g. Hilton Hotel" className="hotel-quote-input" />
                </label>
                <label className="hotel-quote-label">
                  City
                  <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Paris" className="hotel-quote-input" required />
                </label>
                <div className="hotel-quote-row">
                  <label className="hotel-quote-label">
                    Check-in date
                    <input type="date" name="checkIn" value={form.checkIn} onChange={handleChange} className="hotel-quote-input" required />
                  </label>
                  <label className="hotel-quote-label">
                    Check-out date
                    <input type="date" name="checkOut" value={form.checkOut} onChange={handleChange} className="hotel-quote-input" required />
                  </label>
                </div>
                <label className="hotel-quote-label">
                  Your name
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Full name" className="hotel-quote-input" required />
                </label>
                <label className="hotel-quote-label">
                  Your email
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="hotel-quote-input" required />
                </label>
                {error && <p className="hotel-quote-error">{error}</p>}
                <div className="hotel-quote-actions">
                  <button type="button" className="hotel-quote-btn secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="hotel-quote-btn primary" disabled={sending}>
                    {sending ? 'Sending…' : 'Send request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default CruisesSection
