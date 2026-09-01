import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import SEO from '../components/SEO'
import RevealOnScroll from '../components/RevealOnScroll'
import HoneypotField from '../components/HoneypotField'
import { FORM_TYPES } from '../lib/formConstants'
import { submitWebsiteForm } from '../lib/submitWebsiteForm'
import './HoneymoonTrips.css'

const HONEYMOON_DESTINATIONS = [
  'Maldives',
  'Seychelles',
  'Mauritius',
  'Bora Bora (French Polynesia)',
  'Fiji',
  'Bali (Indonesia)',
  'Japan',
  'Singapore',
  'Thailand',
  'Vietnam',
  'Cambodia',
  'South Korea',
  'India',
  'Sri Lanka',
  'United Arab Emirates (Dubai, Abu Dhabi)',
  'Qatar',
  'Jordan',
  'Saudi Arabia (AlUla)',
  'Greece',
  'Italy',
  'France',
  'Spain',
  'Portugal',
  'Switzerland',
  'Austria',
  'Czech Republic',
  'United Kingdom',
  'Netherlands',
  'Germany',
  'Turkey',
  'Croatia',
  'Cyprus',
  'USA',
  'Mexico',
  'Cuba',
  'Brazil',
  'Argentina',
  'Canada',
  'Australia',
  'New Zealand',
  'Iceland',
  'Norway',
  'Finland',
  'Sweden',
  'South Africa',
  'Morocco',
  'Kenya',
  'Tanzania (Zanzibar)',
  'Egypt',
  'Malta'
]

const COUNTRY_CODES = [
  { code: '+357', country: 'Cyprus', flag: '🇨🇾' },
  { code: '+30', country: 'Greece', flag: '🇬🇷' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' }
]

function HoneymoonTrips() {
  const { t } = useTranslation()
  const [showHeroForm, setShowHeroForm] = useState(false)
  const [heroRequest, setHeroRequest] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    startDate: '',
    endDate: '',
    destination: ''
  })
  const [heroCountryCode, setHeroCountryCode] = useState('+357')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [destinationSearch, setDestinationSearch] = useState('')
  const [selectedDestination, setSelectedDestination] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [countryCode, setCountryCode] = useState('+357')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')
  const [heroHoneypot, setHeroHoneypot] = useState('')
  const [mainHoneypot, setMainHoneypot] = useState('')
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  const filteredDestinations = HONEYMOON_DESTINATIONS.filter(dest =>
    dest.toLowerCase().includes(destinationSearch.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!showHeroForm) return undefined
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [showHeroForm])

  const handleDestinationSelect = (dest) => {
    setSelectedDestination(dest)
    setDestinationSearch(dest)
    setShowDropdown(false)
  }

  const handleDestinationChange = (e) => {
    const value = e.target.value
    setDestinationSearch(value)
    setSelectedDestination(value)
    setShowDropdown(true)
  }

  const handleHeroRequestChange = (e) => {
    const { name, value } = e.target
    setHeroRequest((prev) => ({ ...prev, [name]: value }))
  }

  const handleHeroRequestSubmit = async (e) => {
    e.preventDefault()
    const { name, surname, email, phone, startDate, endDate, destination } = heroRequest

    if (!name.trim() || !surname.trim() || !email.trim() || !phone.trim() || !startDate || !endDate || !destination) {
      alert(t('honeymoon.validationComplete'))
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      alert(t('honeymoon.validationEmail'))
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert(t('honeymoon.validationDates'))
      return
    }

    const fullName = `${name.trim()} ${surname.trim()}`.trim()
    const fullPhoneNumber = `${heroCountryCode}${phone.trim()}`
    const travelDates = `${startDate} - ${endDate}`
    const messageBody = `Honeymoon hero request for ${destination}. Travel dates: ${travelDates}. Phone: ${fullPhoneNumber}.`

    const result = await submitWebsiteForm({
      formType: FORM_TYPES.HONEYMOON,
      name: fullName,
      email: email.trim(),
      phone: fullPhoneNumber,
      destination,
      travelDates,
      message: messageBody,
      honeypot: heroHoneypot,
      leadData: {
        full_name: fullName,
        phone: fullPhoneNumber,
        email: email.trim(),
        destination,
        travel_dates: travelDates,
        number_of_travelers: '',
        budget: '',
        message: messageBody,
        source: 'Website',
      },
    })

    if (result.ok) {
      alert(t('forms.success'))
      setHeroRequest({
        name: '',
        surname: '',
        email: '',
        phone: '',
        startDate: '',
        endDate: '',
        destination: '',
      })
      setHeroCountryCode('+357')
      setHeroHoneypot('')
      setShowHeroForm(false)
    } else {
      alert(result.error || t('forms.error'))
    }
  }

  const handleMainRequestSubmit = async (e) => {
    e.preventDefault()
    if (!fullName.trim()) {
      alert(t('honeymoon.validationName'))
      return
    }
    if (!email.trim()) {
      alert(t('honeymoon.validationEmailRequired'))
      return
    }
    if (!selectedDestination || !HONEYMOON_DESTINATIONS.includes(selectedDestination)) {
      alert(t('honeymoon.validationDestination'))
      return
    }
    if (!phoneNumber.trim()) {
      alert(t('honeymoon.validationPhone'))
      return
    }
    if (!message.trim()) {
      alert(t('honeymoon.validationMessage'))
      return
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber.trim()}`
    const result = await submitWebsiteForm({
      formType: FORM_TYPES.HONEYMOON,
      name: fullName.trim(),
      email: email.trim(),
      phone: fullPhoneNumber,
      destination: selectedDestination,
      message: message.trim(),
      honeypot: mainHoneypot,
      leadData: {
        full_name: fullName.trim(),
        phone: fullPhoneNumber,
        email: email.trim(),
        destination: selectedDestination,
        travel_dates: '',
        number_of_travelers: '',
        budget: '',
        message: message.trim(),
        source: 'Website',
      },
    })

    if (result.ok) {
      alert(t('forms.success'))
      setFullName('')
      setEmail('')
      setDestinationSearch('')
      setSelectedDestination('')
      setPhoneNumber('')
      setMessage('')
      setCountryCode('+357')
      setMainHoneypot('')
    } else {
      alert(result.error || t('forms.error'))
    }
  }

  return (
    <>
      <SEO 
        title={t('honeymoon.seoTitle')}
        description={t('honeymoon.seoDescription')}
        keywords={t('honeymoon.seoKeywords')}
      />
      <div className="honeymoon-trips-page">
      {/* Hero */}
      <section className="honeymoon-trips-hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>{t('honeymoon.heroTitle')}</h1>
          <p>{t('honeymoon.heroSubtitle')}</p>
          <button className="hero-cta" onClick={() => setShowHeroForm(true)}>
            {t('honeymoon.startPlanning')}
          </button>
        </div>
      </section>

      {showHeroForm && (
        <div
          className="hero-request-modal-backdrop"
          onClick={() => setShowHeroForm(false)}
          role="presentation"
        >
          <div
            className="hero-request-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t('honeymoon.planModalTitle')}
          >
            <button
              type="button"
              className="hero-request-close"
              onClick={() => setShowHeroForm(false)}
              aria-label={t('honeymoon.closeForm')}
            >
              ×
            </button>
            <h3>{t('honeymoon.planModalTitle')}</h3>
            <form className="hero-request-form" onSubmit={handleHeroRequestSubmit}>
              <HoneypotField value={heroHoneypot} onChange={(e) => setHeroHoneypot(e.target.value)} />
              <div className="hero-request-row">
                <label>
                  {t('forms.firstName')}
                  <input
                    type="text"
                    name="name"
                    value={heroRequest.name}
                    onChange={handleHeroRequestChange}
                    placeholder={t('forms.namePlaceholder')}
                    required
                  />
                </label>
                <label>
                  {t('honeymoon.surname')}
                  <input
                    type="text"
                    name="surname"
                    value={heroRequest.surname}
                    onChange={handleHeroRequestChange}
                    placeholder={t('forms.lastName')}
                    required
                  />
                </label>
              </div>
              <div className="hero-request-row">
                <label>
                  {t('forms.email')}
                  <input
                    type="email"
                    name="email"
                    value={heroRequest.email}
                    onChange={handleHeroRequestChange}
                    placeholder={t('forms.emailPlaceholder')}
                    required
                  />
                </label>
                <label className="phone-input-wrapper">
                  {t('forms.contactNumber')}
                  <div className="phone-input-container">
                    <select
                      className="country-code-select"
                      value={heroCountryCode}
                      onChange={(e) => setHeroCountryCode(e.target.value)}
                      name="heroCountryCode"
                      aria-label="Country code"
                    >
                      {COUNTRY_CODES.map((item, idx) => (
                        <option key={idx} value={item.code}>
                          {item.flag} {item.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      name="phone"
                      value={heroRequest.phone}
                      onChange={handleHeroRequestChange}
                      placeholder={t('forms.phonePlaceholder')}
                      required
                      className="phone-number-input"
                    />
                  </div>
                </label>
              </div>
              <div className="hero-request-row">
                <label>
                  {t('honeymoon.travelFrom')}
                  <input
                    type="date"
                    name="startDate"
                    value={heroRequest.startDate}
                    onChange={handleHeroRequestChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </label>
                <label>
                  {t('honeymoon.travelTo')}
                  <input
                    type="date"
                    name="endDate"
                    value={heroRequest.endDate}
                    onChange={handleHeroRequestChange}
                    min={heroRequest.startDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </label>
              </div>
              <label className="hero-request-full">
                {t('honeymoon.destination')}
                <select
                  name="destination"
                  value={heroRequest.destination}
                  onChange={handleHeroRequestChange}
                  required
                >
                  <option value="">{t('honeymoon.selectDestination')}</option>
                  {HONEYMOON_DESTINATIONS.map((dest) => (
                    <option key={dest} value={dest}>
                      {dest}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="hero-request-submit">
                {t('common.sendRequest')}
              </button>
            </form>
          </div>
        </div>
      )}

      <RevealOnScroll direction="up">
      <div className="honeymoon-trips-container">
        {/* What we do */}
        <section className="what-we-do">
          <div className="what-text">
            <h2>{t('honeymoon.whatWeDo')}</h2>
            <p>{t('honeymoon.whatWeDoP1')}</p>
            <p>{t('honeymoon.whatWeDoP2')}</p>
            <p>{t('honeymoon.whatWeDoP3')}</p>
          </div>
          <div className="what-image">
            <img 
              src="/images/honeymoon/honeymoon-lady.webp" 
              alt="What we do - Honeymoon planning"
              className="what-image-img"
            />
          </div>
        </section>

        {/* Why Honeywell */}
        <section className="why-section">
          <div className="why-image">
            <img 
              src="/images/honeymoon/honeymoon-honeywell-travel.webp" 
              alt="Why Honeywell Travel"
              className="why-image-img"
            />
          </div>
          <div className="why-text">
            <h2>{t('honeymoon.whyHoneywell')}</h2>
            <p className="intro">{t('honeymoon.whyIntro')}</p>
            <ul className="why-list">
              <li><span className="icon">✨</span><span>{t('honeymoon.whyTailored')}</span></li>
              <li><span className="icon">🌍</span><span>{t('honeymoon.whyKnowledge')}</span></li>
              <li><span className="icon">💌</span><span>{t('honeymoon.whyService')}</span></li>
              <li><span className="icon">🏝️</span><span>{t('honeymoon.whyRange')}</span></li>
              <li><span className="icon">💰</span><span>{t('honeymoon.whyValue')}</span></li>
            </ul>
          </div>
        </section>

        {/* Send us your request */}
        <section className="honeymoon-request">
          <div className="honeymoon-request-header">
            <h2>{t('honeymoon.sendRequest')}</h2>
            <p>{t('honeymoon.sendRequestIntro')}</p>
          </div>
          <div className="honeymoon-request-content">
            <div className="honeymoon-request-image">
              <img 
                src="/images/honeymoon/honeymoon-send-request.webp" 
                alt="Honeymoon planning" 
              />
            </div>
            <form
            className="honeymoon-request-form"
            onSubmit={handleMainRequestSubmit}
          >
            <HoneypotField value={mainHoneypot} onChange={(e) => setMainHoneypot(e.target.value)} />
            <div className="form-row">
              <label>
                {t('forms.fullName')}
                <input
                  type="text"
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('forms.namePlaceholder')}
                  required
                />
              </label>
              <label>
                {t('forms.email')}
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('forms.emailPlaceholder')}
                  required
                />
              </label>
            </div>
            <div className="form-row">
              <label className="phone-input-wrapper">
                {t('forms.contactNumber')}
                <div className="phone-input-container">
                  <select
                    className="country-code-select"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    name="countryCode"
                  >
                    {COUNTRY_CODES.map((item, idx) => (
                      <option key={idx} value={item.code}>
                        {item.flag} {item.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    required
                    className="phone-number-input"
                  />
                </div>
              </label>
            </div>
            <label className="destination-select-wrapper">
              {t('honeymoon.chooseDestination')}
              <div className="destination-input-container">
                <input
                  ref={inputRef}
                  type="text"
                  name="destination"
                  value={destinationSearch}
                  onChange={handleDestinationChange}
                  onFocus={() => setShowDropdown(true)}
                  placeholder={t('honeymoon.selectDestinationPlaceholder')}
                  required
                  autoComplete="off"
                />
                {showDropdown && filteredDestinations.length > 0 && (
                  <div ref={dropdownRef} className="destination-dropdown">
                    {filteredDestinations.slice(0, 8).map((dest, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="destination-option"
                        onClick={() => handleDestinationSelect(dest)}
                      >
                        {dest}
                      </button>
                    ))}
                    {filteredDestinations.length > 8 && (
                      <div className="destination-more">
                        {t('honeymoon.moreDestinations', { count: filteredDestinations.length - 8 })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </label>
            <label className="full-width">
              {t('honeymoon.whatToPlan')}
              <textarea
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="5"
                placeholder={t('honeymoon.whatToPlanPlaceholder')}
                required
              />
            </label>
            <button type="submit" className="honeymoon-request-button">
              {t('common.sendRequest')}
            </button>
          </form>
          </div>
        </section>
      </div>
      </RevealOnScroll>
      </div>
    </>
  )
}

export default HoneymoonTrips

