import { useState } from 'react'
import SEO from '../components/SEO'
import RevealOnScroll from '../components/RevealOnScroll'
import HoneypotField from '../components/HoneypotField'
import { FORM_TYPES } from '../lib/formConstants'
import { submitWebsiteForm } from '../lib/submitWebsiteForm'
import './Contact.css'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [status, setStatus] = useState(null) // { type: 'success' | 'error', message }
  const [sending, setSending] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setStatus(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setStatus(null)

    const result = await submitWebsiteForm({
      formType: FORM_TYPES.CONTACT,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '',
      message: formData.message,
      honeypot,
      leadData: {
        full_name: formData.name,
        phone: formData.phone || '',
        email: formData.email,
        destination: '',
        travel_dates: '',
        number_of_travelers: '',
        budget: '',
        message: formData.message,
        source: 'Contact Form',
      },
    })

    if (result.ok) {
      setStatus({ type: 'success', message: result.message })
      setFormData({ name: '', email: '', phone: '', message: '' })
      setHoneypot('')
    } else {
      setStatus({ type: 'error', message: result.error })
    }
    setSending(false)
  }

  return (
    <>
      <SEO 
        title="Contact Us - Honeywell Travel | Limassol & Nicosia, Cyprus"
        description="Get in touch with Honeywell Travel. Visit our offices in Limassol or Nicosia, call +357 25828848, or email info@honeywelltravel.com.cy. We're here to help plan your perfect getaway."
        keywords="Contact Honeywell Travel, Travel Agency Limassol, Travel Agency Nicosia, Cyprus Travel Contact"
      />
      <div className="contact-page">
      <div className="contact-hero">
        <div className="contact-hero-content">
          <h1>Contact Us</h1>
          <p>We're here to help you plan your perfect getaway</p>
        </div>
      </div>

      <RevealOnScroll direction="up">
      <div className="contact-container">
        <div className="contact-info-grid">
          <div className="contact-info-card">
            <div className="contact-icon-wrapper">
              <div className="contact-icon">📍</div>
            </div>
            <h3>Address</h3>
            <p>9 Anastasi Shioukri street</p>
            <p>Limassol, 3035</p>
            <a 
              href="https://maps.google.com/?q=9+Anastasi+Shioukri+street,+Limassol+3035,+Cyprus" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-link-btn"
            >
              View on Map →
            </a>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon-wrapper">
              <div className="contact-icon">📞</div>
            </div>
            <h3>Phone</h3>
            <p>+357 25828848</p>
            <a href="tel:+35725828848" className="contact-link-btn">
              Call Now →
            </a>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon-wrapper">
              <div className="contact-icon">✉️</div>
            </div>
            <h3>Email</h3>
            <p>info@honeywelltravel.com.cy</p>
            <a href="mailto:info@honeywelltravel.com.cy" className="contact-link-btn">
              Send Email →
            </a>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon-wrapper">
              <div className="contact-icon">🕒</div>
            </div>
            <h3>Opening Hours</h3>
            <p><strong>Monday - Friday:</strong> 09:00 - 17:00</p>
            <p><strong>Saturday - Sunday:</strong> Closed</p>
          </div>
        </div>

        <div className="contact-form-section">
          <div className="form-header">
            <h2>Send us a Message</h2>
            <p>Fill out the form below and we'll get back to you as soon as possible</p>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  <span className="label-icon">👤</span>
                  Name <span className="required">*</span>
                </label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">
                  <span className="label-icon">✉️</span>
                  Email <span className="required">*</span>
                </label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="phone">
                <span className="label-icon">📱</span>
                Phone
              </label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                placeholder="+357 1234 5678"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">
                <span className="label-icon">💬</span>
                Message <span className="required">*</span>
              </label>
              <textarea 
                id="message" 
                name="message" 
                rows="6" 
                placeholder="Tell us how we can help you..."
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            {status && (
              <div className={`contact-form-toast contact-form-toast-${status.type}`} role="alert">
                {status.message}
              </div>
            )}
            <button type="submit" className="submit-button" disabled={sending}>
              <span>{sending ? 'Sending…' : 'Send Request'}</span>
              <span className="button-icon">→</span>
            </button>
          </form>
        </div>
      </div>
      </RevealOnScroll>
    </div>
    </>
  )
}

export default Contact
