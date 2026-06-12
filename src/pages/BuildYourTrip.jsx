import { useState } from 'react'
import SEO from '../components/SEO'
import HoneypotField from '../components/HoneypotField'
import { FORM_TYPES } from '../lib/formConstants'
import { submitWebsiteForm } from '../lib/submitWebsiteForm'
import './BuildYourTrip.css'

function BuildYourTrip() {
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState(null) // { type: 'success' | 'error', message }
  const [honeypot, setHoneypot] = useState('')
  const [form, setForm] = useState({
    destination: '',
    hotelPreference: '',
    rentCar: '',           // 'yes' | 'no'
    transferServices: '',  // 'yes' | 'no'
    travelInsurance: '',   // 'yes' | 'no'
    travelers: '',
    dateFrom: '',
    dateTo: '',
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setStatus(null)
  }

  const buildMessage = () => {
    const lines = [
      '--- Build Your Trip Request ---',
      '',
      'Destination: ' + (form.destination || '—'),
      'Hotel preference: ' + (form.hotelPreference || '—'),
      'Rent a car: ' + (form.rentCar || '—'),
      'Taxi services from/to the Airport: ' + (form.transferServices || '—'),
      'Travel Insurance: ' + (form.travelInsurance || '—'),
      'Number of travelers: ' + (form.travelers || '—'),
      'Date from: ' + (form.dateFrom || '—'),
      'Date to: ' + (form.dateTo || '—'),
      '',
      form.message ? 'Additional message: ' + form.message : ''
    ]
    return lines.filter(Boolean).join('\n')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setStatus(null)

    const travelDates = [form.dateFrom, form.dateTo].filter(Boolean).join(' – ') || '—'
    const messageBody = buildMessage()

    const result = await submitWebsiteForm({
      formType: FORM_TYPES.BUILD_YOUR_TRIP,
      name: form.name,
      email: form.email,
      phone: form.phone || '',
      destination: form.destination || '',
      travelDates,
      passengers: form.travelers || '',
      message: messageBody,
      honeypot,
      extraFields: {
        'Hotel preference': form.hotelPreference || '—',
        'Rent a car': form.rentCar || '—',
        'Airport transfers': form.transferServices || '—',
        'Travel insurance': form.travelInsurance || '—',
      },
      leadData: {
        full_name: form.name || 'Not provided',
        phone: form.phone || '',
        email: form.email || '',
        destination: form.destination || '',
        travel_dates: travelDates,
        number_of_travelers: form.travelers || '',
        budget: '',
        message: messageBody,
        source: 'Website',
      },
    })

    if (result.ok) {
      setStatus({ type: 'success', message: result.message })
      setForm({
        destination: '',
        hotelPreference: '',
        rentCar: '',
        transferServices: '',
        travelInsurance: '',
        travelers: '',
        dateFrom: '',
        dateTo: '',
        name: '',
        email: '',
        phone: '',
        message: '',
      })
      setHoneypot('')
    } else {
      setStatus({ type: 'error', message: result.error })
    }
    setSending(false)
  }

  return (
    <>
      <SEO
        title="Build Your Trip - Honeywell Travel | Plan Your Perfect Getaway"
        description="Plan your trip your way: choose your destination, accommodation, car hire, transfers and more. Tell us what you want and we’ll put together a tailor-made offer."
        keywords="Build your trip, custom holiday, tailor-made travel, Honeywell Travel, plan your trip"
      />
      <div className="build-your-trip-page">
        <div className="bytp-hero">
          <div className="bytp-hero-content">
            <h1>Build Your Trip</h1>
            <p>Tell us where you want to go, where to stay, and how you’d like to get around. We’ll put together a tailor-made plan for you.</p>
          </div>
        </div>

        <div className="bytp-container">
          <div className="bytp-form-layout">
            <form className="bytp-form" onSubmit={handleSubmit}>
            <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            <div className="bytp-form-accent" aria-hidden="true" />
            <section className="bytp-section">
              <h2 className="bytp-section-title">Where & when</h2>
              <div className="bytp-fields">
                <div className="bytp-field">
                  <label htmlFor="bytp-destination">Destination <span className="bytp-required">*</span></label>
                  <input
                    id="bytp-destination"
                    type="text"
                    name="destination"
                    value={form.destination}
                    onChange={handleChange}
                    placeholder="e.g. Paris, Santorini, Bali"
                    required
                  />
                </div>
                <div className="bytp-field bytp-field-half">
                  <label htmlFor="bytp-dateFrom">Date from</label>
                  <input
                    id="bytp-dateFrom"
                    type="date"
                    name="dateFrom"
                    value={form.dateFrom}
                    onChange={handleChange}
                  />
                </div>
                <div className="bytp-field bytp-field-half">
                  <label htmlFor="bytp-dateTo">Date to</label>
                  <input
                    id="bytp-dateTo"
                    type="date"
                    name="dateTo"
                    value={form.dateTo}
                    onChange={handleChange}
                  />
                </div>
                <div className="bytp-field">
                  <label htmlFor="bytp-travelers">Number of travelers <span className="bytp-required">*</span></label>
                  <input
                    id="bytp-travelers"
                    type="number"
                    name="travelers"
                    min="1"
                    max="99"
                    value={form.travelers}
                    onChange={handleChange}
                    placeholder="e.g. 2"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="bytp-section">
              <h2 className="bytp-section-title">Accommodation</h2>
              <div className="bytp-field">
                <label htmlFor="bytp-hotel">Hotel or accommodation preference</label>
                <input
                  id="bytp-hotel"
                  type="text"
                  name="hotelPreference"
                  value={form.hotelPreference}
                  onChange={handleChange}
                  placeholder="e.g. Hilton Athens, or “4-star near the beach”"
                />
              </div>
            </section>

            <section className="bytp-section">
              <h2 className="bytp-section-title">Transport</h2>
              <div className="bytp-fields bytp-options">
                <div className="bytp-field">
                  <label>Rent a car?</label>
                  <div className="bytp-radio-group">
                    <label className="bytp-radio">
                      <input
                        type="radio"
                        name="rentCar"
                        value="yes"
                        checked={form.rentCar === 'yes'}
                        onChange={handleChange}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="bytp-radio">
                      <input
                        type="radio"
                        name="rentCar"
                        value="no"
                        checked={form.rentCar === 'no'}
                        onChange={handleChange}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
                <div className="bytp-field">
                  <label>Taxi services from/to the Airport?</label>
                  <div className="bytp-radio-group">
                    <label className="bytp-radio">
                      <input
                        type="radio"
                        name="transferServices"
                        value="yes"
                        checked={form.transferServices === 'yes'}
                        onChange={handleChange}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="bytp-radio">
                      <input
                        type="radio"
                        name="transferServices"
                        value="no"
                        checked={form.transferServices === 'no'}
                        onChange={handleChange}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
                <div className="bytp-field">
                  <label>Travel Insurance</label>
                  <div className="bytp-radio-group">
                    <label className="bytp-radio">
                      <input
                        type="radio"
                        name="travelInsurance"
                        value="yes"
                        checked={form.travelInsurance === 'yes'}
                        onChange={handleChange}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="bytp-radio">
                      <input
                        type="radio"
                        name="travelInsurance"
                        value="no"
                        checked={form.travelInsurance === 'no'}
                        onChange={handleChange}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            <section className="bytp-section">
              <h2 className="bytp-section-title">Your details</h2>
              <div className="bytp-fields bytp-details">
                <div className="bytp-field">
                  <label htmlFor="bytp-name">Name <span className="bytp-required">*</span></label>
                  <input
                    id="bytp-name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="bytp-field">
                  <label htmlFor="bytp-email">Email <span className="bytp-required">*</span></label>
                  <input
                    id="bytp-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="bytp-field">
                  <label htmlFor="bytp-phone">Phone <span className="bytp-required">*</span></label>
                  <input
                    id="bytp-phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. +357 99 123456"
                    required
                  />
                </div>
                <div className="bytp-field bytp-field-full">
                  <label htmlFor="bytp-message">Anything else?</label>
                  <textarea
                    id="bytp-message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Special requests, budget, or other preferences..."
                  />
                </div>
              </div>
            </section>

            {status && (
              <div className={`bytp-status bytp-status-${status.type}`} role="alert">
                {status.message}
              </div>
            )}

            <div className="bytp-submit-wrap">
              <button type="submit" className="bytp-submit" disabled={sending}>
                {sending ? 'Sending…' : 'Send my trip request'}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default BuildYourTrip
