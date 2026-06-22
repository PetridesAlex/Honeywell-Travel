import { useMemo, useState } from 'react'
import SEO from '../components/SEO'
import HoneypotField from '../components/HoneypotField'
import { FORM_TYPES } from '../lib/formConstants'
import { submitWebsiteForm } from '../lib/submitWebsiteForm'
import './BuildYourTrip.css'

const FORM_STEPS = [
  { id: 'trip', label: 'Where & when', hint: 'Destination and dates' },
  { id: 'stay', label: 'Accommodation', hint: 'Where you want to stay' },
  { id: 'transport', label: 'Transport', hint: 'Car, transfers & cover' },
  { id: 'contact', label: 'Your details', hint: 'How we reach you' },
]

function ChoiceToggle({ name, value, checked, onChange, children }) {
  return (
    <label className={`bytp-choice${checked ? ' bytp-choice--active' : ''}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
      <span>{children}</span>
    </label>
  )
}

function BuildYourTrip() {
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState(null)
  const [honeypot, setHoneypot] = useState('')
  const [form, setForm] = useState({
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setStatus(null)
  }

  const stepCompletion = useMemo(
    () => ({
      trip: Boolean(form.destination.trim() && form.travelers),
      stay: Boolean(form.hotelPreference.trim()),
      transport: Boolean(form.rentCar && form.transferServices && form.travelInsurance),
      contact: Boolean(form.name.trim() && form.email.trim() && form.phone.trim()),
    }),
    [form],
  )

  const completedSteps = useMemo(
    () => FORM_STEPS.filter((step) => stepCompletion[step.id]).length,
    [stepCompletion],
  )

  const progressPercent = Math.round((completedSteps / FORM_STEPS.length) * 100)

  const activeStepIndex = useMemo(() => {
    const firstIncomplete = FORM_STEPS.findIndex((step) => !stepCompletion[step.id])
    return firstIncomplete === -1 ? FORM_STEPS.length - 1 : firstIncomplete
  }, [stepCompletion])

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
      form.message ? 'Additional message: ' + form.message : '',
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
        description="Plan your trip your way: choose your destination, accommodation, car hire, transfers and more. Tell us what you want and we'll put together a tailor-made offer."
        keywords="Build your trip, custom holiday, tailor-made travel, Honeywell Travel, plan your trip"
      />
      <div className="build-your-trip-page">
        <div className="bytp-hero">
          <div className="bytp-hero-content">
            <p className="bytp-hero-eyebrow">Tailor-made travel</p>
            <h1>Build Your Trip</h1>
            <p>
              Share your vision — destination, stay, and how you travel. Our specialists craft a bespoke
              itinerary and send you a personalised proposal.
            </p>
          </div>
        </div>

        <div className="bytp-container">
          <div className="bytp-form-layout">
            <aside className="bytp-aside" aria-label="How it works">
              <div className="bytp-aside-card">
                <p className="bytp-aside-eyebrow">Honeywell Travel</p>
                <h2>Your journey, designed by experts</h2>
                <p className="bytp-aside-lead">
                  Complete the brief below and our team will respond with options matched to your dates,
                  style, and budget.
                </p>
                <ol className="bytp-aside-steps">
                  <li>
                    <strong>Tell us your plans</strong>
                    <span>Destination, dates, and who is travelling.</span>
                  </li>
                  <li>
                    <strong>Shape the experience</strong>
                    <span>Hotels, car hire, transfers, and insurance preferences.</span>
                  </li>
                  <li>
                    <strong>Receive your proposal</strong>
                    <span>A dedicated advisor follows up with a tailored offer.</span>
                  </li>
                </ol>
                <div className="bytp-aside-trust">
                  <span>✓ Personal travel advisors</span>
                  <span>✓ Competitive hotel rates</span>
                  <span>✓ Limassol &amp; Nicosia offices</span>
                </div>
              </div>
            </aside>

            <form className="bytp-form" onSubmit={handleSubmit}>
              <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
              <div className="bytp-form-accent" aria-hidden="true" />

              <header className="bytp-form-header">
                <div>
                  <p className="bytp-form-eyebrow">Trip brief</p>
                  <h2 className="bytp-form-title">Create your request</h2>
                </div>
                <div className="bytp-progress-meta">
                  <span className="bytp-progress-label">{progressPercent}% complete</span>
                  <div className="bytp-progress-bar" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
                    <span className="bytp-progress-fill" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              </header>

              <nav className="bytp-stepper" aria-label="Form steps">
                {FORM_STEPS.map((step, index) => {
                  const isComplete = stepCompletion[step.id]
                  const isActive = index === activeStepIndex
                  return (
                    <div
                      key={step.id}
                      className={`bytp-step${isComplete ? ' bytp-step--complete' : ''}${isActive ? ' bytp-step--active' : ''}`}
                    >
                      <span className="bytp-step-index">{isComplete ? '✓' : index + 1}</span>
                      <span className="bytp-step-copy">
                        <strong>{step.label}</strong>
                        <small>{step.hint}</small>
                      </span>
                    </div>
                  )
                })}
              </nav>

              <section className="bytp-section-card" id="bytp-step-trip">
                <div className="bytp-section-head">
                  <span className="bytp-section-badge">01</span>
                  <h3 className="bytp-section-title">Where &amp; when</h3>
                </div>
                <div className="bytp-fields">
                  <div className="bytp-field">
                    <label htmlFor="bytp-destination">
                      Destination <span className="bytp-required">*</span>
                    </label>
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
                    <label htmlFor="bytp-travelers">
                      Number of travelers <span className="bytp-required">*</span>
                    </label>
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

              <section className="bytp-section-card" id="bytp-step-stay">
                <div className="bytp-section-head">
                  <span className="bytp-section-badge">02</span>
                  <h3 className="bytp-section-title">Accommodation</h3>
                </div>
                <div className="bytp-field">
                  <label htmlFor="bytp-hotel">Hotel or accommodation preference</label>
                  <input
                    id="bytp-hotel"
                    type="text"
                    name="hotelPreference"
                    value={form.hotelPreference}
                    onChange={handleChange}
                    placeholder='e.g. Hilton Athens, or "4-star near the beach"'
                  />
                  <p className="bytp-field-hint">Share a hotel name, star rating, or the kind of stay you prefer.</p>
                </div>
              </section>

              <section className="bytp-section-card" id="bytp-step-transport">
                <div className="bytp-section-head">
                  <span className="bytp-section-badge">03</span>
                  <h3 className="bytp-section-title">Transport &amp; extras</h3>
                </div>
                <div className="bytp-options">
                  <div className="bytp-option-block">
                    <p className="bytp-option-label">Rent a car?</p>
                    <div className="bytp-choice-row">
                      <ChoiceToggle name="rentCar" value="yes" checked={form.rentCar === 'yes'} onChange={handleChange}>
                        Yes
                      </ChoiceToggle>
                      <ChoiceToggle name="rentCar" value="no" checked={form.rentCar === 'no'} onChange={handleChange}>
                        No
                      </ChoiceToggle>
                    </div>
                  </div>
                  <div className="bytp-option-block">
                    <p className="bytp-option-label">Taxi services from/to the airport?</p>
                    <div className="bytp-choice-row">
                      <ChoiceToggle
                        name="transferServices"
                        value="yes"
                        checked={form.transferServices === 'yes'}
                        onChange={handleChange}
                      >
                        Yes
                      </ChoiceToggle>
                      <ChoiceToggle
                        name="transferServices"
                        value="no"
                        checked={form.transferServices === 'no'}
                        onChange={handleChange}
                      >
                        No
                      </ChoiceToggle>
                    </div>
                  </div>
                  <div className="bytp-option-block">
                    <p className="bytp-option-label">Travel insurance</p>
                    <div className="bytp-choice-row">
                      <ChoiceToggle
                        name="travelInsurance"
                        value="yes"
                        checked={form.travelInsurance === 'yes'}
                        onChange={handleChange}
                      >
                        Yes
                      </ChoiceToggle>
                      <ChoiceToggle
                        name="travelInsurance"
                        value="no"
                        checked={form.travelInsurance === 'no'}
                        onChange={handleChange}
                      >
                        No
                      </ChoiceToggle>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bytp-section-card" id="bytp-step-contact">
                <div className="bytp-section-head">
                  <span className="bytp-section-badge">04</span>
                  <h3 className="bytp-section-title">Your details</h3>
                </div>
                <div className="bytp-fields bytp-details">
                  <div className="bytp-field">
                    <label htmlFor="bytp-name">
                      Name <span className="bytp-required">*</span>
                    </label>
                    <input id="bytp-name" type="text" name="name" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="bytp-field">
                    <label htmlFor="bytp-email">
                      Email <span className="bytp-required">*</span>
                    </label>
                    <input id="bytp-email" type="email" name="email" value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="bytp-field">
                    <label htmlFor="bytp-phone">
                      Phone <span className="bytp-required">*</span>
                    </label>
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
                      rows={4}
                      placeholder="Special requests, budget range, celebrations, or other preferences..."
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
                  <span>{sending ? 'Sending your request…' : 'Send my trip request'}</span>
                  {!sending ? <span className="bytp-submit-arrow" aria-hidden="true">→</span> : null}
                </button>
                <p className="bytp-submit-note">A Honeywell Travel advisor will contact you shortly.</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default BuildYourTrip
