import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import RevealOnScroll from '../components/RevealOnScroll'
import HoneypotField from '../components/HoneypotField'
import { FORM_TYPES } from '../lib/formConstants'
import { submitWebsiteForm } from '../lib/submitWebsiteForm'
import SEO from '../components/SEO'
import './Corporate.css'

const SERVICE_KEYS = [
  'airTickets', 'accommodation', 'transfers', 'accountManagement', 'tours', 'carRental',
  'groupTravel', 'lowCostAir', 'cruises', 'summerPackages', 'conferenceIncentive',
  'travelInsurance', 'specialPackages',
]

function Corporate() {
  const { t } = useTranslation()
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    contactNumber: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error' | null
  const [honeypot, setHoneypot] = useState('')
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmitQuote = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    const message = `Name: ${formData.name}\nCompany: ${formData.companyName}\nEmail: ${formData.email}\nContact: ${formData.contactNumber}\n\nMessage:\n${formData.message}`

    const result = await submitWebsiteForm({
      formType: FORM_TYPES.CORPORATE,
      name: formData.name,
      email: formData.email,
      phone: formData.contactNumber,
      destination: formData.companyName,
      message,
      honeypot,
      extraFields: {
        Company: formData.companyName,
      },
      leadData: {
        full_name: formData.name,
        phone: formData.contactNumber,
        email: formData.email,
        destination: formData.companyName,
        travel_dates: '',
        number_of_travelers: '',
        budget: '',
        message,
        source: 'Website',
      },
    })

    if (result.ok) {
      setSubmitStatus('success')
      setFormData({ name: '', companyName: '', email: '', contactNumber: '', message: '' })
      setHoneypot('')
      setTimeout(() => {
        setShowQuoteModal(false)
        setSubmitStatus(null)
      }, 2000)
    } else {
      setSubmitStatus('error')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="corporate-page">
      <SEO
        title={t('corporate.seoTitle')}
        description={t('corporate.seoDescription')}
        keywords={t('corporate.seoKeywords')}
        url="https://www.honeywelltravel.com.cy/our-services"
      />
      {/* Hero Section */}
      <section className="corporate-hero">
        <video 
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          poster="/images/corporate/background.webp"
        >
          <source src="/videos/corporate.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>{t('corporate.heroTitle')}</h1>
          <p>{t('corporate.heroSubtitle')}</p>
          <button 
            className="hero-cta-button"
            onClick={() => setShowQuoteModal(true)}
          >
            {t('corporate.getQuote')}
          </button>
        </div>
      </section>

      {/* Quote Modal */}
      {showQuoteModal && (
        <div className="quote-modal-overlay" onClick={() => !isSubmitting && setShowQuoteModal(false)}>
          <div className="quote-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="quote-modal-close"
              onClick={() => !isSubmitting && setShowQuoteModal(false)}
              disabled={isSubmitting}
            >
              ×
            </button>
            <h2>{t('corporate.quoteModalTitle')}</h2>
            <p className="quote-modal-subtitle">{t('corporate.quoteModalSubtitle')}</p>
            
            <form onSubmit={handleSubmitQuote} className="quote-form">
              <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
              <div className="form-group">
                <label htmlFor="name">{t('corporate.yourName')} *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder={t('forms.namePlaceholder')}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="companyName">{t('corporate.companyName')} *</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  placeholder={t('forms.companyName')}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">{t('corporate.emailAddress')} *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder={t('forms.emailPlaceholder')}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactNumber">{t('corporate.contactNumber')} *</label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  required
                  placeholder={t('forms.phonePlaceholder')}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">{t('corporate.travelNeeds')} *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  placeholder={t('corporate.travelNeedsPlaceholder')}
                  disabled={isSubmitting}
                />
              </div>

              {submitStatus === 'success' && (
                <div className="form-success">
                  ✓ {t('forms.success')}
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="form-error">
                  ✗ {t('forms.error')}
                </div>
              )}

              <div className="form-actions">
                <button 
                  type="button" 
                  className="form-cancel"
                  onClick={() => setShowQuoteModal(false)}
                  disabled={isSubmitting}
                >
                  {t('common.cancel')}
                </button>
                <button 
                  type="submit" 
                  className="form-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('contact.sending') : t('corporate.requestQuote')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <RevealOnScroll direction="up">
      {/* CWT Information Section */}
      <section className="cwt-section">
        <div className="container">
          <div className="cwt-content">
            <div className="cwt-text">
              <div className="cwt-logo">
                <h2>{t('corporate.cwtTitle')}</h2>
                <p className="cwt-subtitle">{t('corporate.cwtSubtitle')}</p>
              </div>
              <div className="cwt-description">
                <p>{t('corporate.cwtP1')}</p>
                <p>{t('corporate.cwtP2')}</p>
                <p>
                  {t('corporate.cwtP3Prefix')}{' '}
                  <a href="https://www.mycwt.com" target="_blank" rel="noopener noreferrer">www.myCWT.com</a>{' '}
                  {t('corporate.cwtP3Suffix')}
                </p>
                <p><strong>{t('corporate.cwtP4')}</strong></p>
              </div>
            </div>
            <div className="cwt-image">
              <div className="cwt-image-cover"></div>
            </div>
          </div>
        </div>
      </section>
      </RevealOnScroll>

      {/* Exotic Destinations Showcase */}
      <RevealOnScroll direction="up">
      <section className="exotic-destinations-section">
        <div className="container">
          <div className="section-header">
            <h2>{t('corporate.destinationsTitle')}</h2>
            <p>{t('corporate.destinationsSubtitle')}</p>
          </div>
          <div className="destinations-grid">
            <div className="destination-card">
              <div className="destination-image" style={{ backgroundImage: 'url(/images/destinations/maldives.webp)' }}>
                <div className="destination-overlay"></div>
                <div className="destination-label">Maldives</div>
              </div>
            </div>
            <div className="destination-card">
              <div className="destination-image" style={{ backgroundImage: 'url(/images/destinations/seychelles.webp)' }}>
                <div className="destination-overlay"></div>
                <div className="destination-label">Seychelles</div>
              </div>
            </div>
            <div className="destination-card">
              <div className="destination-image" style={{ backgroundImage: 'url(/images/destinations/dubai-hero.webp)' }}>
                <div className="destination-overlay"></div>
                <div className="destination-label">Dubai</div>
              </div>
            </div>
            <div className="destination-card">
              <div className="destination-image" style={{ backgroundImage: 'url(/images/destinations/japan.webp)' }}>
                <div className="destination-overlay"></div>
                <div className="destination-label">Japan</div>
              </div>
            </div>
            <div className="destination-card">
              <div className="destination-image" style={{ backgroundImage: 'url(/images/destinations/iceland.webp)' }}>
                <div className="destination-overlay"></div>
                <div className="destination-label">Iceland</div>
              </div>
            </div>
            <div className="destination-card">
              <div className="destination-image" style={{ backgroundImage: 'url(/images/destinations/brazil.webp)' }}>
                <div className="destination-overlay"></div>
                <div className="destination-label">Brazil</div>
              </div>
            </div>
            <div className="destination-card">
              <div className="destination-image" style={{ backgroundImage: 'url(/images/dubai/south-africa-safari.webp)' }}>
                <div className="destination-overlay"></div>
                <div className="destination-label">South Africa</div>
              </div>
            </div>
            <div className="destination-card">
              <div className="destination-image" style={{ backgroundImage: 'url(/images/destinations/thailand.webp)' }}>
                <div className="destination-overlay"></div>
                <div className="destination-label">Thailand</div>
              </div>
            </div>
            <div className="destination-card">
              <div className="destination-image" style={{ backgroundImage: 'url(/images/dubai/canada.webp)' }}>
                <div className="destination-overlay"></div>
                <div className="destination-label">Canada</div>
              </div>
            </div>
            <div className="destination-card">
              <div className="destination-image" style={{ backgroundImage: 'url(/images/dubai/sri-lanka.webp)' }}>
                <div className="destination-overlay"></div>
                <div className="destination-label">Sri Lanka</div>
              </div>
            </div>
            <div className="destination-card">
              <div className="destination-image" style={{ backgroundImage: 'url(/images/destinations/China.webp)' }}>
                <div className="destination-overlay"></div>
                <div className="destination-label">China</div>
              </div>
            </div>
            <div className="destination-card">
              <div className="destination-image" style={{ backgroundImage: 'url(/images/destinations/norwegian-fjords.png)' }}>
                <div className="destination-overlay"></div>
                <div className="destination-label">Norway</div>
              </div>
            </div>
            <div className="destination-card">
              <div className="destination-image" style={{ backgroundImage: 'url(/images/dubai/new-york.webp)' }}>
                <div className="destination-overlay"></div>
                <div className="destination-label">New York</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </RevealOnScroll>

      <RevealOnScroll direction="up">
      {/* What We Do Section */}
      <section className="what-we-do-section">
        <div className="container">
          <div className="what-we-do-content">
            <div className="what-we-do-image">
              <div className="what-we-do-image-cover" role="img" aria-label={t('corporate.incentiveTripsAria')}></div>
            </div>
            <div className="what-we-do-text">
              <h2>{t('corporate.whatWeDo')}</h2>
              <div className="what-we-do-description">
                <p>{t('corporate.whatWeDoP1')}</p>
                <p>{t('corporate.whatWeDoP2')}</p>
                <p>{t('corporate.whatWeDoP3')}</p>
                <p>{t('corporate.whatWeDoP4')}</p>
              </div>
              <div className="services-list">
                <h3>{t('corporate.servicesInclude')}</h3>
                <ul>
                  {SERVICE_KEYS.map((key) => (
                    <li key={key}>{t(`corporate.services.${key}`)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Extra Services Section */}
      <section className="extra-services-section">
        <div className="container">
          <h2 className="section-title">{t('corporate.extraServices')}</h2>
          <div className="extra-services-grid">
            <div className="extra-service-card">
              <div className="service-icon">🛡️</div>
              <h3>{t('corporate.travelInsurance')}</h3>
              <p>{t('corporate.travelInsuranceP1')}</p>
              <p>{t('corporate.travelInsuranceP2')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Incentive Trips Section */}
      <section className="incentive-section">
        <div className="container">
          <div className="incentive-content">
            <div className="incentive-text">
              <h2>{t('corporate.incentiveTrips')}</h2>
              <div className="incentive-description">
                <p>{t('corporate.incentiveTripsP1')}</p>
                <p>{t('corporate.incentiveTripsP2')}</p>
                <p>{t('corporate.incentiveTripsP3')}</p>
              </div>
            </div>
            <div className="incentive-image">
              <div className="incentive-image-cover" role="img" aria-label={t('corporate.incentiveTripsAria')}></div>
            </div>
          </div>
        </div>
      </section>

      {/* World Travel Awards Section */}
      <section className="awards-section">
        <div className="container">
          <div className="awards-content">
            <div className="awards-logo">
              <div className="awards-icon">🏆</div>
              <h2>{t('corporate.awardsTitle')}</h2>
            </div>
            <div className="awards-text">
              <h3>{t('corporate.awardsHeading')}</h3>
              <div className="awards-description">
                <p>{t('corporate.awardsP1')}</p>
                <p className="quote">{t('corporate.awardsQuote')}</p>
                <p>{t('corporate.awardsP2')}</p>
                <p>{t('corporate.awardsP3')}</p>
                <p className="signature"><strong>{t('corporate.awardsSignature')}</strong></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      </RevealOnScroll>

      <RevealOnScroll direction="up">
      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>{t('corporate.ctaTitle')}</h2>
          <p>{t('corporate.ctaText')}</p>
          <a href="/contact/" className="cta-button">{t('common.getInTouch')}</a>
        </div>
      </section>
      </RevealOnScroll>
    </div>
  )
}

export default Corporate
