import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import HoneypotField from './HoneypotField'
import { FORM_TYPES } from '../lib/formConstants'
import { submitWebsiteForm } from '../lib/submitWebsiteForm'
import './CruisesSection.css'

const FEATURED_CHAINS = [
  { name: 'Marriott', noteKey: 'marriott' },
  { name: 'Hilton', noteKey: 'hilton' },
  { name: 'Sheraton', noteKey: 'sheraton' },
  { name: 'Hyatt', noteKey: 'hyatt' },
  { name: 'InterContinental', noteKey: 'intercontinental' },
  { name: 'Four Seasons', noteKey: 'four-seasons' },
  { name: 'The Ritz-Carlton', noteKey: 'ritz-carlton' },
  { name: 'Accor', noteKey: 'accor' },
  { name: 'Fairmont', noteKey: 'fairmont' },
  { name: 'Mandarin Oriental', noteKey: 'mandarin-oriental' },
  { name: 'St. Regis', noteKey: 'st-regis' },
  { name: 'Kempinski', noteKey: 'kempinski' },
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
  'Pullman',
]

const HOTEL_VALUE_ITEMS = [
  {
    index: '01',
    labelKey: 'negotiatedRates',
    copyKey: 'negotiatedRatesCopy',
  },
  {
    index: '02',
    labelKey: 'expertMatching',
    copyKey: 'expertMatchingCopy',
  },
  {
    index: '03',
    labelKey: 'humanSupport',
    copyKey: 'humanSupportCopy',
  },
]

function CruisesSection() {
  const { t } = useTranslation()
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
    email: '',
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
    <section className="hotel-partners-section" aria-labelledby="hotel-partners-title">
      <div className="hotel-partners-atmosphere" aria-hidden="true" />

      <div className="cruises-container hotel-partners-container">
        <header className="hotel-partners-header">
          <p className="hotel-partners-eyebrow">{t('home.hotelPartnersEyebrow')}</p>
          <h2 id="hotel-partners-title" className="hotel-partners-title">
            {t('home.hotelPartnersTitle')}
          </h2>
          <p className="hotel-partners-subtitle">
            {t('home.hotelPartnersSubtitle')}
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
              <span className="hotel-partners-brand-note">
                {t(`home.hotelPartnerNotes.${chain.noteKey}`)}
              </span>
            </li>
          ))}
        </ul>

        <div className="hotel-partners-value">
          {HOTEL_VALUE_ITEMS.map((item) => (
            <p key={item.index} className="hotel-partners-value-item">
              <span className="hotel-partners-value-index" aria-hidden="true">
                {item.index}
              </span>
              <span className="hotel-partners-value-copy">
                <span className="hotel-partners-value-label">
                  {t(`home.hotelPartnersValue.${item.labelKey}`)}
                </span>
                {t(`home.hotelPartnersValue.${item.copyKey}`)}
              </span>
            </p>
          ))}
        </div>

        <div className="hotel-partners-cta">
          <p className="hotel-partners-cta-text">
            {t('home.hotelPartnersCtaText')}
          </p>
          <button type="button" className="hotel-cta-btn" onClick={openModal}>
            <span className="hotel-cta-btn__sheen" aria-hidden="true" />
            <span>{t('home.hotelQuoteCta')}</span>
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
                  {t('home.hotelQuoteModalTitle')}
                </h2>
                <button type="button" className="hotel-quote-close" onClick={closeModal} aria-label={t('common.close')}>
                  ×
                </button>
              </div>
              {sent ? (
                <div className="hotel-quote-success">
                  <p>{t('forms.success')}</p>
                  <button type="button" className="hotel-cta-btn" onClick={closeModal}>
                    {t('common.close')}
                  </button>
                </div>
              ) : (
                <form className="hotel-quote-form" onSubmit={handleSubmit}>
                  <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                  <p className="hotel-quote-intro">
                    {t('home.hotelQuoteIntro')}
                  </p>
                  <label className="hotel-quote-label">
                    {t('home.hotelName')}
                    <input
                      type="text"
                      name="hotelName"
                      value={form.hotelName}
                      onChange={handleChange}
                      placeholder={t('home.hotelNamePlaceholder')}
                      className="hotel-quote-input"
                    />
                  </label>
                  <label className="hotel-quote-label">
                    {t('home.city')}
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder={t('home.cityPlaceholder')}
                      className="hotel-quote-input"
                      required
                    />
                  </label>
                  <div className="hotel-quote-row">
                    <label className="hotel-quote-label">
                      {t('home.checkInDate')}
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
                      {t('home.checkOutDate')}
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
                    {t('home.yourName')}
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder={t('home.fullNamePlaceholder')}
                      className="hotel-quote-input"
                      required
                    />
                  </label>
                  <label className="hotel-quote-label">
                    {t('home.yourEmail')}
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder={t('home.emailPlaceholder')}
                      className="hotel-quote-input"
                      required
                    />
                  </label>
                  {error && <p className="hotel-quote-error">{error}</p>}
                  <div className="hotel-quote-actions">
                    <button type="button" className="hotel-quote-btn secondary" onClick={closeModal}>
                      {t('common.cancel')}
                    </button>
                    <button type="submit" className="hotel-quote-btn primary" disabled={sending}>
                      {sending ? t('common.sending') : t('home.sendRequest')}
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
