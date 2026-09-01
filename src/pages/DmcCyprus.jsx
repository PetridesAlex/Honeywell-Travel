import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import RevealOnScroll from '../components/RevealOnScroll'
import HoneypotField from '../components/HoneypotField'
import { FORM_TYPES } from '../lib/formConstants'
import { submitWebsiteForm } from '../lib/submitWebsiteForm'
import './DmcCyprus.css'

const BRAND_RED = '#c41230'

const SERVICES = [
  {
    title: 'Hotel Contracting & Accommodation',
    icon: '🏨',
    items: ['3* – 5* Hotels', 'Luxury Resorts', 'Boutique Hotels', 'Group Allocations']
  },
  {
    title: 'Airport Transfers & Transportation',
    icon: '🚐',
    items: ['Private Transfers', 'VIP Chauffeur Services', 'Group Coaches', 'Mini Buses', 'Event Transportation Logistics']
  },
  {
    title: 'Flight Arrangements',
    icon: '✈️',
    items: ['Group Flight Bookings', 'Scheduled & Charter Flights', 'Corporate Travel Management']
  },
  {
    title: 'Excursions & Tours',
    icon: '🗺️',
    items: ['Private Guided Tours', 'Cultural Experiences', 'Historical Site Visits', 'Jeep Safaris', 'Wine Tours', 'Boat Cruises']
  },
  {
    title: 'MICE & Corporate Events',
    icon: '🎯',
    items: ['Team Building Activities', 'Incentive Travel Programs']
  },
  {
    title: 'Educational & Sports Groups',
    icon: '🎓',
    items: ['School Programs', 'University Trips', 'Academic Collaborations']
  },
  {
    title: 'Luxury Travel & VIP Handling',
    icon: '⭐',
    items: ['Yacht Charters', 'Helicopter Transfers', 'Private Villas', 'Concierge Services', 'Security Arrangements']
  }
]

const CITIES = [
  { name: 'Limassol', desc: 'Coastal luxury, resorts, marina, nightlife', slug: 'limassol', image: '/images/dmc-cyprus/limassol-dmc.webp' },
  { name: 'Nicosia', desc: 'Business hub & cultural capital', slug: 'nicosia', image: '/images/dmc-cyprus/nicosia-dmc.webp' },
  { name: 'Larnaca', desc: 'Beachfront stays & airport proximity', slug: 'larnaca', image: '/images/dmc-cyprus/larnaka.webp' },
  { name: 'Paphos', desc: 'History, UNESCO sites & premium resorts', slug: 'paphos', image: '/images/dmc-cyprus/paphos.webp' }
]

const WHY_PARTNER = [
  'Local Expertise & Strong Market Knowledge',
  'Strong Supplier Network',
  'Fast Response Times',
  'Dedicated Account Manager',
  'Competitive Net Rates',
  'Transparent Pricing',
  '24/7 Emergency Support'
]

function DmcCyprus() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    country: '',
    businessType: 'Agency',
    groupSize: '',
    travelDates: '',
    message: ''
  })
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState(null)
  const [honeypot, setHoneypot] = useState('')
  const [openServiceIndex, setOpenServiceIndex] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setStatus(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setStatus(null)
    const message = [
      `Company: ${formData.companyName}`,
      `Contact: ${formData.contactPerson}`,
      `Email: ${formData.email}`,
      `Country: ${formData.country}`,
      `Type: ${formData.businessType}`,
      `Group Size: ${formData.groupSize}`,
      `Travel Dates: ${formData.travelDates}`,
      '',
      formData.message
    ].join('\n')

    const result = await submitWebsiteForm({
      formType: FORM_TYPES.DMC,
      name: formData.contactPerson,
      email: formData.email,
      destination: 'Cyprus DMC',
      travelDates: formData.travelDates,
      passengers: formData.groupSize,
      message,
      honeypot,
      extraFields: {
        Company: formData.companyName,
        Country: formData.country,
        'Business type': formData.businessType,
      },
      leadData: {
        full_name: formData.contactPerson,
        phone: '',
        email: formData.email,
        destination: 'Cyprus DMC',
        travel_dates: formData.travelDates,
        number_of_travelers: formData.groupSize,
        budget: '',
        message,
        source: 'Website',
      },
    })

    if (result.ok) {
      setStatus({ type: 'success', text: t('forms.success') })
      setFormData({
        companyName: '',
        contactPerson: '',
        email: '',
        country: '',
        businessType: 'Agency',
        groupSize: '',
        travelDates: '',
        message: '',
      })
      setHoneypot('')
    } else {
      setStatus({ type: 'error', text: result.error || t('forms.error') })
    }
    setSending(false)
  }

  const scrollToForm = () => {
    document.getElementById('dmc-contact-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="dmc-page">
      <SEO
        title={t('dmc.seoTitle')}
        description={t('dmc.seoDescription')}
        keywords={t('dmc.seoKeywords')}
        url="https://www.honeywelltravel.com.cy/dmc-cyprus"
      />

      {/* SECTION 1 – HERO */}
      <section className="dmc-hero">
        <div className="dmc-hero-bg" style={{ backgroundImage: 'url(/images/dmc-cyprus/cyprus-cover-dmc.webp)' }} />
        <div className="dmc-hero-overlay" />
        <div className="dmc-hero-content">
          <h1 className="dmc-hero-title">{t('dmc.heroTitle')}</h1>
          <p className="dmc-hero-tagline">{t('dmc.heroTagline')}</p>
          <p className="dmc-hero-subtitle">{t('dmc.heroSubtitle')}</p>
          <div className="dmc-hero-buttons">
            <button type="button" className="dmc-btn dmc-btn-primary" onClick={scrollToForm}>{t('dmc.requestPartnership')}</button>
            <a href="mailto:limassol@honeywelltravel.com.cy" className="dmc-btn dmc-btn-outline">{t('dmc.contactTeam')}</a>
          </div>
        </div>
      </section>

      {/* SECTION 2 – ABOUT */}
      <RevealOnScroll direction="up">
        <section className="dmc-section dmc-about">
          <div className="dmc-container">
            <h2 className="dmc-section-title">{t('dmc.aboutTitle')}</h2>
            <p className="dmc-about-lead">{t('dmc.aboutLead')}</p>
            <p className="dmc-about-cities">{t('dmc.aboutCities')}</p>
            <ul className="dmc-cities-list">
              <li>Limassol</li>
              <li>Nicosia</li>
              <li>Larnaca</li>
              <li>Paphos</li>
            </ul>
          </div>
        </section>
      </RevealOnScroll>

      {/* SECTION 3 – SERVICES GRID */}
      <section className="dmc-section dmc-services">
        <div className="dmc-container">
          <h2 className="dmc-section-title">{t('dmc.servicesTitle')}</h2>
          <div className="dmc-services-grid">
            {SERVICES.map((service, i) => (
              <RevealOnScroll key={service.title} direction="up" delay={i * 50}>
                <button
                  type="button"
                  className={`dmc-service-card ${openServiceIndex === i ? 'is-open' : ''}`}
                  onClick={() =>
                    setOpenServiceIndex(prev => (prev === i ? null : i))
                  }
                  aria-expanded={openServiceIndex === i}
                >
                  <div className="dmc-service-icon">{service.icon}</div>
                  <h3 className="dmc-service-title">{service.title}</h3>
                  {openServiceIndex === i && (
                    <ul className="dmc-service-list">
                      {service.items.map(item => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </button>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 – DESTINATIONS */}
      <section className="dmc-section dmc-destinations">
        <div className="dmc-container">
          <h2 className="dmc-section-title">{t('dmc.destinationsCover')}</h2>
          <div className="dmc-cards-grid">
            {CITIES.map((city, i) => (
              <RevealOnScroll key={city.name} direction="up" delay={i * 80}>
                <div className="dmc-city-card">
                  {city.image && <div className="dmc-city-card-image" style={{ backgroundImage: `url(${city.image})` }} aria-hidden />}
                  <h3 className="dmc-city-name">{city.name}</h3>
                  <p className="dmc-city-desc">{city.desc}</p>
                  <button type="button" className="dmc-btn dmc-btn-small" onClick={scrollToForm}>{t('dmc.exploreServices', { city: city.name })}</button>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 – WHY PARTNER */}
      <RevealOnScroll direction="up">
        <section className="dmc-section dmc-why">
          <div className="dmc-container">
            <h2 className="dmc-section-title">{t('dmc.whyPartner')}</h2>
            <div className="dmc-why-grid">
              {WHY_PARTNER.map((item, i) => (
                <div key={item} className="dmc-why-card">
                  <span className="dmc-why-card-icon" aria-hidden>✓</span>
                  <p className="dmc-why-card-text">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealOnScroll>

      {/* SECTION 6 – B2B FORM */}
      <section id="dmc-contact-form" className="dmc-section dmc-form-section">
        <div className="dmc-container dmc-form-container">
          <h2 className="dmc-section-title">{t('dmc.formTitle')}</h2>
          <form className="dmc-form" onSubmit={handleSubmit}>
            <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            <div className="dmc-form-row">
              <label htmlFor="dmc-company">{t('dmc.companyName')}</label>
              <input id="dmc-company" name="companyName" type="text" value={formData.companyName} onChange={handleChange} required placeholder={t('dmc.companyPlaceholder')} />
            </div>
            <div className="dmc-form-row">
              <label htmlFor="dmc-person">{t('dmc.contactPerson')}</label>
              <input id="dmc-person" name="contactPerson" type="text" value={formData.contactPerson} onChange={handleChange} required placeholder={t('dmc.personPlaceholder')} />
            </div>
            <div className="dmc-form-row">
              <label htmlFor="dmc-email">{t('forms.email')}</label>
              <input id="dmc-email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder={t('dmc.emailPlaceholder')} />
            </div>
            <div className="dmc-form-row">
              <label htmlFor="dmc-country">{t('dmc.country')}</label>
              <input id="dmc-country" name="country" type="text" value={formData.country} onChange={handleChange} placeholder={t('dmc.countryPlaceholder')} />
            </div>
            <div className="dmc-form-row">
              <label htmlFor="dmc-type">{t('dmc.businessType')}</label>
              <select id="dmc-type" name="businessType" value={formData.businessType} onChange={handleChange}>
                <option value="Agency">{t('dmc.agency')}</option>
                <option value="School">{t('dmc.school')}</option>
                <option value="Corporate">{t('dmc.corporate')}</option>
                <option value="Other">{t('dmc.other')}</option>
              </select>
            </div>
            <div className="dmc-form-row">
              <label htmlFor="dmc-size">{t('dmc.groupSize')}</label>
              <input id="dmc-size" name="groupSize" type="text" value={formData.groupSize} onChange={handleChange} placeholder={t('dmc.groupSizePlaceholder')} />
            </div>
            <div className="dmc-form-row">
              <label htmlFor="dmc-dates">{t('dmc.travelDates')}</label>
              <input id="dmc-dates" name="travelDates" type="text" value={formData.travelDates} onChange={handleChange} placeholder={t('dmc.datesPlaceholder')} />
            </div>
            <div className="dmc-form-row dmc-form-full">
              <label htmlFor="dmc-message">{t('forms.message')}</label>
              <textarea id="dmc-message" name="message" rows={5} value={formData.message} onChange={handleChange} placeholder={t('dmc.messagePlaceholder')} />
            </div>
            {status && (
              <p className={`dmc-form-status ${status.type}`}>{status.text}</p>
            )}
            <button type="submit" className="dmc-btn dmc-btn-primary dmc-btn-submit" disabled={sending}>
              {sending ? t('contact.sending') : t('dmc.submitRequest')}
            </button>
          </form>
          <p className="dmc-form-note">{t('dmc.emailDirect')} <a href="mailto:limassol@honeywelltravel.com.cy">limassol@honeywelltravel.com.cy</a></p>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="dmc-cta">
        <div className="dmc-cta-inner">
          <p className="dmc-cta-text">{t('dmc.footerCta')}</p>
          <Link to="/contact" className="dmc-btn dmc-btn-white">{t('dmc.contactDepartment')}</Link>
        </div>
      </section>
    </div>
  )
}

export default DmcCyprus
