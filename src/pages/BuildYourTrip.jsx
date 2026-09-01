import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import SEO from '../components/SEO'
import HoneypotField from '../components/HoneypotField'
import { FORM_TYPES } from '../lib/formConstants'
import { submitWebsiteForm } from '../lib/submitWebsiteForm'
import './BuildYourTrip.css'

function ChoiceToggle({ name, value, checked, onChange, children }) {
  return (
    <label className={`bytp-choice${checked ? ' bytp-choice--active' : ''}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
      <span>{children}</span>
    </label>
  )
}

function BuildYourTrip() {
  const { t } = useTranslation()
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

  const FORM_STEPS = useMemo(
    () => [
      { id: 'trip', label: t('buildYourTrip.stepWhere'), hint: t('buildYourTrip.stepWhereHint') },
      { id: 'stay', label: t('buildYourTrip.stepAccommodation'), hint: t('buildYourTrip.stepAccommodationHint') },
      { id: 'transport', label: t('buildYourTrip.stepTransport'), hint: t('buildYourTrip.stepTransportHint') },
      { id: 'contact', label: t('buildYourTrip.stepDetails'), hint: t('buildYourTrip.stepDetailsHint') },
    ],
    [t],
  )

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
    [FORM_STEPS, stepCompletion],
  )

  const progressPercent = Math.round((completedSteps / FORM_STEPS.length) * 100)

  const activeStepIndex = useMemo(() => {
    const firstIncomplete = FORM_STEPS.findIndex((step) => !stepCompletion[step.id])
    return firstIncomplete === -1 ? FORM_STEPS.length - 1 : firstIncomplete
  }, [FORM_STEPS, stepCompletion])

  const buildMessage = () => {
    const dash = '—'
    const lines = [
      t('buildYourTrip.messageHeader'),
      '',
      `${t('buildYourTrip.messageDestination')}: ${form.destination || dash}`,
      `${t('buildYourTrip.messageHotel')}: ${form.hotelPreference || dash}`,
      `${t('buildYourTrip.messageRentCar')}: ${form.rentCar || dash}`,
      `${t('buildYourTrip.messageTransfers')}: ${form.transferServices || dash}`,
      `${t('buildYourTrip.messageInsurance')}: ${form.travelInsurance || dash}`,
      `${t('buildYourTrip.messageTravelers')}: ${form.travelers || dash}`,
      `${t('buildYourTrip.messageDateFrom')}: ${form.dateFrom || dash}`,
      `${t('buildYourTrip.messageDateTo')}: ${form.dateTo || dash}`,
      '',
      form.message ? `${t('buildYourTrip.messageAdditional')}: ${form.message}` : '',
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
        [t('buildYourTrip.messageHotel')]: form.hotelPreference || '—',
        [t('buildYourTrip.messageRentCar')]: form.rentCar || '—',
        [t('buildYourTrip.messageTransfers')]: form.transferServices || '—',
        [t('buildYourTrip.messageInsurance')]: form.travelInsurance || '—',
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
      setStatus({ type: 'success', message: result.message || t('forms.success') })
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
      setStatus({ type: 'error', message: result.error || t('forms.error') })
    }
    setSending(false)
  }

  return (
    <>
      <SEO
        title={t('buildYourTrip.seoTitle')}
        description={t('buildYourTrip.seoDescription')}
        keywords={t('buildYourTrip.seoKeywords')}
      />
      <div className="build-your-trip-page">
        <div className="bytp-hero">
          <div className="bytp-hero-content">
            <p className="bytp-hero-eyebrow">{t('buildYourTrip.eyebrow')}</p>
            <h1>{t('buildYourTrip.title')}</h1>
            <p>{t('buildYourTrip.heroIntro')}</p>
          </div>
        </div>

        <div className="bytp-container">
          <div className="bytp-form-layout">
            <aside className="bytp-aside" aria-label={t('buildYourTrip.asideHowItWorks')}>
              <div className="bytp-aside-card">
                <p className="bytp-aside-eyebrow">{t('common.brandName')}</p>
                <h2>{t('buildYourTrip.asideTitle')}</h2>
                <p className="bytp-aside-lead">{t('buildYourTrip.asideLead')}</p>
                <ol className="bytp-aside-steps">
                  <li>
                    <strong>{t('buildYourTrip.asideStep1Title')}</strong>
                    <span>{t('buildYourTrip.asideStep1Text')}</span>
                  </li>
                  <li>
                    <strong>{t('buildYourTrip.asideStep2Title')}</strong>
                    <span>{t('buildYourTrip.asideStep2Text')}</span>
                  </li>
                  <li>
                    <strong>{t('buildYourTrip.asideStep3Title')}</strong>
                    <span>{t('buildYourTrip.asideStep3Text')}</span>
                  </li>
                </ol>
                <div className="bytp-aside-trust">
                  <span>✓ {t('buildYourTrip.trustAdvisors')}</span>
                  <span>✓ {t('buildYourTrip.trustRates')}</span>
                  <span>✓ {t('buildYourTrip.trustOffices')}</span>
                </div>
              </div>
            </aside>

            <form className="bytp-form" onSubmit={handleSubmit}>
              <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
              <div className="bytp-form-accent" aria-hidden="true" />

              <header className="bytp-form-header">
                <div>
                  <p className="bytp-form-eyebrow">{t('buildYourTrip.tripBrief')}</p>
                  <h2 className="bytp-form-title">{t('buildYourTrip.createRequest')}</h2>
                </div>
                <div className="bytp-progress-meta">
                  <span className="bytp-progress-label">
                    {t('buildYourTrip.progressComplete', { percent: progressPercent })}
                  </span>
                  <div className="bytp-progress-bar" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
                    <span className="bytp-progress-fill" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              </header>

              <nav className="bytp-stepper" aria-label={t('buildYourTrip.asideHowItWorks')}>
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
                  <h3 className="bytp-section-title">{t('buildYourTrip.stepWhere')}</h3>
                </div>
                <div className="bytp-fields">
                  <div className="bytp-field">
                    <label htmlFor="bytp-destination">
                      {t('buildYourTrip.destination')} <span className="bytp-required">*</span>
                    </label>
                    <input
                      id="bytp-destination"
                      type="text"
                      name="destination"
                      value={form.destination}
                      onChange={handleChange}
                      placeholder={t('buildYourTrip.destinationPlaceholder')}
                      required
                    />
                  </div>
                  <div className="bytp-field bytp-field-half">
                    <label htmlFor="bytp-dateFrom">{t('buildYourTrip.dateFrom')}</label>
                    <input
                      id="bytp-dateFrom"
                      type="date"
                      name="dateFrom"
                      value={form.dateFrom}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="bytp-field bytp-field-half">
                    <label htmlFor="bytp-dateTo">{t('buildYourTrip.dateTo')}</label>
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
                      {t('buildYourTrip.travelers')} <span className="bytp-required">*</span>
                    </label>
                    <input
                      id="bytp-travelers"
                      type="number"
                      name="travelers"
                      min="1"
                      max="99"
                      value={form.travelers}
                      onChange={handleChange}
                      placeholder={t('buildYourTrip.travelersPlaceholder')}
                      required
                    />
                  </div>
                </div>
              </section>

              <section className="bytp-section-card" id="bytp-step-stay">
                <div className="bytp-section-head">
                  <span className="bytp-section-badge">02</span>
                  <h3 className="bytp-section-title">{t('buildYourTrip.stepAccommodation')}</h3>
                </div>
                <div className="bytp-field">
                  <label htmlFor="bytp-hotel">{t('buildYourTrip.hotelLabel')}</label>
                  <input
                    id="bytp-hotel"
                    type="text"
                    name="hotelPreference"
                    value={form.hotelPreference}
                    onChange={handleChange}
                    placeholder={t('buildYourTrip.hotelPlaceholder')}
                  />
                  <p className="bytp-field-hint">{t('buildYourTrip.hotelHint')}</p>
                </div>
              </section>

              <section className="bytp-section-card" id="bytp-step-transport">
                <div className="bytp-section-head">
                  <span className="bytp-section-badge">03</span>
                  <h3 className="bytp-section-title">{t('buildYourTrip.transportExtras')}</h3>
                </div>
                <div className="bytp-options">
                  <div className="bytp-option-block">
                    <p className="bytp-option-label">{t('buildYourTrip.rentCar')}</p>
                    <div className="bytp-choice-row">
                      <ChoiceToggle name="rentCar" value="yes" checked={form.rentCar === 'yes'} onChange={handleChange}>
                        {t('common.yes')}
                      </ChoiceToggle>
                      <ChoiceToggle name="rentCar" value="no" checked={form.rentCar === 'no'} onChange={handleChange}>
                        {t('common.no')}
                      </ChoiceToggle>
                    </div>
                  </div>
                  <div className="bytp-option-block">
                    <p className="bytp-option-label">{t('buildYourTrip.taxiAirport')}</p>
                    <div className="bytp-choice-row">
                      <ChoiceToggle
                        name="transferServices"
                        value="yes"
                        checked={form.transferServices === 'yes'}
                        onChange={handleChange}
                      >
                        {t('common.yes')}
                      </ChoiceToggle>
                      <ChoiceToggle
                        name="transferServices"
                        value="no"
                        checked={form.transferServices === 'no'}
                        onChange={handleChange}
                      >
                        {t('common.no')}
                      </ChoiceToggle>
                    </div>
                  </div>
                  <div className="bytp-option-block">
                    <p className="bytp-option-label">{t('buildYourTrip.travelInsurance')}</p>
                    <div className="bytp-choice-row">
                      <ChoiceToggle
                        name="travelInsurance"
                        value="yes"
                        checked={form.travelInsurance === 'yes'}
                        onChange={handleChange}
                      >
                        {t('common.yes')}
                      </ChoiceToggle>
                      <ChoiceToggle
                        name="travelInsurance"
                        value="no"
                        checked={form.travelInsurance === 'no'}
                        onChange={handleChange}
                      >
                        {t('common.no')}
                      </ChoiceToggle>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bytp-section-card" id="bytp-step-contact">
                <div className="bytp-section-head">
                  <span className="bytp-section-badge">04</span>
                  <h3 className="bytp-section-title">{t('buildYourTrip.stepDetails')}</h3>
                </div>
                <div className="bytp-fields bytp-details">
                  <div className="bytp-field">
                    <label htmlFor="bytp-name">
                      {t('forms.name')} <span className="bytp-required">*</span>
                    </label>
                    <input id="bytp-name" type="text" name="name" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="bytp-field">
                    <label htmlFor="bytp-email">
                      {t('forms.email')} <span className="bytp-required">*</span>
                    </label>
                    <input id="bytp-email" type="email" name="email" value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="bytp-field">
                    <label htmlFor="bytp-phone">
                      {t('forms.phone')} <span className="bytp-required">*</span>
                    </label>
                    <input
                      id="bytp-phone"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder={t('forms.phonePlaceholder')}
                      required
                    />
                  </div>
                  <div className="bytp-field bytp-field-full">
                    <label htmlFor="bytp-message">{t('buildYourTrip.anythingElse')}</label>
                    <textarea
                      id="bytp-message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder={t('buildYourTrip.messagePlaceholder')}
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
                  <span>
                    {sending ? t('buildYourTrip.sendingRequest') : t('buildYourTrip.sendTripRequest')}
                  </span>
                  {!sending ? <span className="bytp-submit-arrow" aria-hidden="true">→</span> : null}
                </button>
                <p className="bytp-submit-note">{t('buildYourTrip.advisorNoteShort')}</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default BuildYourTrip
