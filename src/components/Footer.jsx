import { useState } from 'react'
import { Link } from 'react-router-dom'
import HoneypotField from './HoneypotField'
import { FORM_TYPES } from '../lib/formConstants'
import { FORM_ERROR_MESSAGE, FORM_SUCCESS_MESSAGE, submitWebsiteForm } from '../lib/submitWebsiteForm'
import './Footer.css'

function Footer() {
  const [phoneRevealed, setPhoneRevealed] = useState(false)
  const [newsletterStatus, setNewsletterStatus] = useState(null)
  const [newsletterSending, setNewsletterSending] = useState(false)
  const [newsletterHoneypot, setNewsletterHoneypot] = useState('')

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section contact-section">
          <h3>Contact Info</h3>
          <div className="contact-items-wrapper">
            <a 
              href="tel:+35725828848" 
              className="contact-item contact-link phone-link"
              title={phoneRevealed ? 'Call +357 2582 8848' : 'Tap to show phone number'}
              aria-label={phoneRevealed ? 'Call +357 2582 8848' : 'Tap to show phone number'}
              onClick={(e) => {
                if (!phoneRevealed) {
                  e.preventDefault()
                  setPhoneRevealed(true)
                }
              }}
            >
              <div className="contact-icon phone-icon">📞</div>
              <span className="contact-label">Phone</span>
              <span className={`contact-value ${phoneRevealed ? '' : 'contact-value--hint'}`}>
                {phoneRevealed ? '+357 2582 8848' : 'Tap to show'}
              </span>
            </a>
            <a 
              href="mailto:info@honeywelltravel.com.cy?subject=Honeywell%20Travel%20Inquiry" 
              className="contact-item contact-link email-link"
              title="Email info@honeywelltravel.com.cy"
              aria-label="Send email to info@honeywelltravel.com.cy"
            >
              <div className="contact-icon email-icon">✉️</div>
              <span className="contact-label">Email</span>
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
              <span className="location-text">Where to find us</span>
            </a>
            <p className="address-text">9 Anastasi Sioukri street, Limassol 3035, Cyprus</p>
            <a 
              href="https://maps.google.com/?q=Honeywell+Travel+9+Anastasi+Sioukri+street+Limassol+3035+Cyprus"
              target="_blank"
              rel="noopener noreferrer"
              className="google-map-container map-link"
              title="Click to open Honeywell Travel location in Google Maps"
            >
              <iframe
                src="https://www.google.com/maps?q=Honeywell+Travel+9+Anastasi+Sioukri+street+Limassol+3035+Cyprus&output=embed&zoom=16"
                width="100%"
                height="180"
                style={{ border: 0, borderRadius: '10px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Honeywell Travel Location"
              ></iframe>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Opening Hours</h3>
          <p>Monday - Friday: 09:00 - 17:00</p>
          <p>Saturday: Closed</p>
          <p>Sunday: Closed</p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <Link to="/ourworld/">Our World</Link>
          <Link to="/holiday-types">Holiday Types</Link>
          <Link to="/honeymoon-trips">Honeymoon</Link>
          <Link to="/our-services/">Corporate</Link>
          <Link to="/honeywell-travel-gallery/">Gallery</Link>
          <Link to="/our-blog/">Blog</Link>
          <Link to="/contact/">Contact</Link>
        </div>

        <div className="footer-section">
          <h3>Newsletter</h3>
          <p>Subscribe to get updates on special offers</p>
          <Link to="/" className="footer-newsletter-logo-link" aria-label="Honeywell Travel home">
            <img
              src="/images/icons/honeywell-travel-logo.webp"
              alt="Honeywell Travel"
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
              const agreed = formData.get('terms') ? 'Yes' : 'No'
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
            <input type="text" name="firstName" placeholder="First Name" className="newsletter-input" />
            <input type="email" name="email" placeholder="Email address" className="newsletter-input" required />
            <label className="newsletter-checkbox">
              <input type="checkbox" name="terms" />
              I have read and agree to the terms & conditions
            </label>
            {newsletterStatus && (
              <p role="alert" style={{ fontSize: '0.85rem', color: newsletterStatus.type === 'error' ? '#ffb4b4' : '#b8f5c3' }}>
                {newsletterStatus.message}
              </p>
            )}
            <button type="submit" className="newsletter-button" disabled={newsletterSending}>
              {newsletterSending ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Honeywell Travel | Copyright 2026 All Rights Reserved</p>
        <div className="footer-bottom-content">
          <div className="footer-social-icons">
            <a 
              href="https://www.facebook.com/honeywelltravel" 
              className="footer-social-icon" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Facebook"
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
              aria-label="Instagram"
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
              aria-label="TikTok"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          </div>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer






