import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import HoneypotField from './HoneypotField'
import { FORM_TYPES } from '../lib/formConstants'
import { FORM_ERROR_MESSAGE, submitWebsiteForm } from '../lib/submitWebsiteForm'
import './Footer.css'

function Footer() {
  const { t } = useTranslation()
  const [phoneRevealed, setPhoneRevealed] = useState(false)
  const [newsletterStatus, setNewsletterStatus] = useState(null)
  const [newsletterSending, setNewsletterSending] = useState(false)
  const [newsletterHoneypot, setNewsletterHoneypot] = useState('')

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section contact-section">
          <h3>{t('footer.contactInfo')}</h3>
          <div className="contact-items-wrapper">
            <a 
              href="tel:+35725828848" 
              className="contact-item contact-link phone-link"
              title={phoneRevealed ? t('footer.callPhone') : t('footer.tapToShowPhone')}
              aria-label={phoneRevealed ? t('footer.callPhone') : t('footer.tapToShowPhone')}
              onClick={(e) => {
                if (!phoneRevealed) {
                  e.preventDefault()
                  setPhoneRevealed(true)
                }
              }}
            >
              <div className="contact-icon phone-icon">📞</div>
              <span className="contact-label">{t('footer.phone')}</span>
              <span className={`contact-value ${phoneRevealed ? '' : 'contact-value--hint'}`}>
                {phoneRevealed ? '+357 2582 8848' : t('footer.tapToShow')}
              </span>
            </a>
            <a 
              href="mailto:info@honeywelltravel.com.cy?subject=Honeywell%20Travel%20Inquiry" 
              className="contact-item contact-link email-link"
              title="Email info@honeywelltravel.com.cy"
              aria-label={t('footer.sendEmailAria')}
            >
              <div className="contact-icon email-icon">✉️</div>
              <span className="contact-label">{t('footer.email')}</span>
              <span className="contact-value">info@honeywelltravel.com.cy</span>
            </a>
          </div>
          <div className="address-section">
            <a 
              href="https://maps.google.com/?q=9+Anastasi+Sioukri+street,+Limassol+3035,+Cyprus" 
              target="_blank" 
              rel="noopener noreferrer"
              className="address-link"
            >
              <span className="location-text">{t('footer.whereToFindUs')}</span>
            </a>
            <p className="address-text">9 Anastasi Sioukri street, Limassol 3035, Cyprus</p>
            <div className="footer-map-card">
              <div className="footer-map-frame">
                <iframe
                  src="https://www.google.com/maps?q=34.6826,33.0469&hl=en&z=17&output=embed"
                  title={t('footer.mapTitle')}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
                <div className="footer-map-vignette" aria-hidden="true" />
                <div className="footer-map-pin" aria-hidden="true">
                  <span className="footer-map-pin__pulse" />
                  <span className="footer-map-pin__dot" />
                </div>
                <div className="footer-map-overlay">
                  <div className="footer-map-brand">
                    <span className="footer-map-brand__eyebrow">{t('footer.ourOffice')}</span>
                    <span className="footer-map-brand__name">{t('common.brandName')}</span>
                    <span className="footer-map-brand__place">{t('footer.mapPlace')}</span>
                  </div>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=9+Anastasi+Sioukri+street,+Limassol+3035,+Cyprus"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-map-directions"
                    title={t('footer.getDirectionsTitle')}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                    {t('footer.getDirections')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-section">
          <h3>{t('footer.hours')}</h3>
          <p>{t('footer.hoursWeekdays')}</p>
          <p>{t('footer.hoursSaturday')}</p>
          <p>{t('footer.hoursSunday')}</p>
        </div>

        <div className="footer-section">
          <h3>{t('footer.quickLinks')}</h3>
          <Link to="/ourworld/">{t('footer.links.ourWorld')}</Link>
          <Link to="/holiday-types">{t('footer.links.holidayTypes')}</Link>
          <Link to="/honeymoon-trips">{t('footer.links.honeymoon')}</Link>
          <Link to="/our-services/">{t('footer.links.corporate')}</Link>
          <Link to="/honeywell-travel-gallery/">{t('footer.links.gallery')}</Link>
          <Link to="/our-blog/">{t('footer.links.blog')}</Link>
          <Link to="/contact/">{t('footer.links.contact')}</Link>
        </div>

        <div className="footer-section">
          <h3>{t('footer.newsletter')}</h3>
          <p>{t('footer.newsletterDescription')}</p>
          <Link to="/" className="footer-newsletter-logo-link" aria-label={t('footer.homeAria')}>
            <img
              src="/images/icons/honeywell-travel-logo.webp"
              alt={t('common.brandName')}
              className="footer-newsletter-logo"
            />
          </Link>
          <form 
            className="newsletter-form"
            onSubmit={async (e) => {
              e.preventDefault()
              setNewsletterSending(true)
              setNewsletterStatus(null)
              const formData = new FormData(e.target)
              const firstName = formData.get('firstName') || 'Subscriber'
              const email = formData.get('email')
              const agreed = formData.get('terms') ? t('common.yes') : t('common.no')
              const message = `Newsletter subscription request.\nAgreed to terms: ${agreed}`

              const result = await submitWebsiteForm({
                formType: FORM_TYPES.NEWSLETTER,
                name: firstName,
                email,
                message,
                honeypot: newsletterHoneypot,
                extraFields: {
                  'Agreed to terms': agreed,
                },
              })

              if (result.ok) {
                setNewsletterStatus({ type: 'success', message: result.message })
                e.target.reset()
                setNewsletterHoneypot('')
              } else {
                setNewsletterStatus({ type: 'error', message: result.error || FORM_ERROR_MESSAGE })
              }
              setNewsletterSending(false)
            }}
          >
            <HoneypotField value={newsletterHoneypot} onChange={(e) => setNewsletterHoneypot(e.target.value)} />
            <input type="text" name="firstName" placeholder={t('footer.firstNamePlaceholder')} className="newsletter-input" />
            <input type="email" name="email" placeholder={t('footer.emailPlaceholder')} className="newsletter-input" required />
            <label className="newsletter-checkbox">
              <input type="checkbox" name="terms" />
              {t('footer.termsCheckbox')}
            </label>
            {newsletterStatus && (
              <p role="alert" style={{ fontSize: '0.85rem', color: newsletterStatus.type === 'error' ? '#ffb4b4' : '#b8f5c3' }}>
                {newsletterStatus.message}
              </p>
            )}
            <button type="submit" className="newsletter-button" disabled={newsletterSending}>
              {newsletterSending ? t('footer.subscribing') : t('footer.subscribe')}
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{t('common.copyright')}</p>
        <div className="footer-bottom-content">
          <div className="footer-social-icons">
            <a 
              href="https://www.facebook.com/honeywelltravel" 
              className="footer-social-icon" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label={t('footer.facebook')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a 
              href="https://www.instagram.com/honeywell_travel/" 
              className="footer-social-icon" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label={t('footer.instagram')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a 
              href="https://www.tiktok.com/@honeywell.travel" 
              className="footer-social-icon" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label={t('footer.tiktok')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          </div>
          <div className="footer-links">
            <Link to="/privacy">{t('common.privacyPolicy')}</Link>
            <Link to="/cookies">{t('common.cookiePolicy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
