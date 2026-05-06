import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import RevealOnScroll from '../components/RevealOnScroll'
import { EMAIL_TEMPLATES, sendEmail } from '../lib/emailService'
import { createLead } from '../lib/leads'
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
    const templateParams = {
      name: formData.contactPerson,
      email: formData.email,
      phone: '',
      message,
      company: formData.companyName,
      country: formData.country,
      travel_dates: formData.travelDates,
      group_size: formData.groupSize
    }

    try {
      const { error: leadError } = await createLead({
        full_name: formData.contactPerson,
        phone: '',
        email: formData.email,
        destination: 'Cyprus DMC',
        travel_dates: formData.travelDates,
        number_of_travelers: formData.groupSize,
        budget: '',
        message,
        source: 'Website'
      })
      if (leadError) {
        console.error('DMC lead insert failed:', leadError)
      }

      await sendEmail(EMAIL_TEMPLATES.DMC, templateParams)
      setStatus({ type: 'success', text: 'Request sent successfully. Our DMC team will be in touch.' })
      setFormData({
        companyName: '',
        contactPerson: '',
        email: '',
        country: '',
        businessType: 'Agency',
        groupSize: '',
        travelDates: '',
        message: ''
      })
    } catch (err) {
      console.error('DMC request email failed:', err)
      setStatus({
        type: 'error',
        text: 'Failed to send. Please try again or email limassol@honeywelltravel.com.cy'
      })
    } finally {
      setSending(false)
    }
  }

  const scrollToForm = () => {
    document.getElementById('dmc-contact-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="dmc-page">
      <SEO
        title="DMC Cyprus | Destination Management Company – Honeywell Travel"
        description="Professional DMC services in Cyprus covering Limassol, Nicosia, Larnaca & Paphos. Hotels, transfers, flights, excursions, MICE & luxury travel management."
        keywords="DMC Cyprus, destination management company Cyprus, Limassol Nicosia Larnaca Paphos DMC, MICE Cyprus, group travel Cyprus"
        url="https://www.honeywelltravel.com.cy/dmc-cyprus"
      />

      {/* SECTION 1 – HERO */}
      <section className="dmc-hero">
        <div className="dmc-hero-bg" style={{ backgroundImage: 'url(/images/dmc-cyprus/cyprus-cover-dmc.webp)' }} />
        <div className="dmc-hero-overlay" />
        <div className="dmc-hero-content">
          <h1 className="dmc-hero-title">Destination Management Cyprus</h1>
          <p className="dmc-hero-tagline">Your Trusted Destination Management Partner in Cyprus</p>
          <p className="dmc-hero-subtitle">Professional ground handling services across Limassol, Nicosia, Larnaca & Paphos.</p>
          <div className="dmc-hero-buttons">
            <button type="button" className="dmc-btn dmc-btn-primary" onClick={scrollToForm}>Request Partnership</button>
            <a href="mailto:limassol@honeywelltravel.com.cy" className="dmc-btn dmc-btn-outline">Contact Our DMC Team</a>
          </div>
        </div>
      </section>

      {/* SECTION 2 – ABOUT */}
      <RevealOnScroll direction="up">
        <section className="dmc-section dmc-about">
          <div className="dmc-container">
            <h2 className="dmc-section-title">Why Choose Honeywell Travel as Your Cyprus DMC?</h2>
            <p className="dmc-about-lead">Honeywell Travel provides full destination management services across Cyprus. With strong local partnerships, operational expertise, and premium supplier networks, we deliver seamless travel experiences for leisure, corporate, educational, and luxury groups.</p>
            <p className="dmc-about-cities">We operate in:</p>
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
          <h2 className="dmc-section-title">Our DMC Services</h2>
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
          <h2 className="dmc-section-title">Destinations We Cover</h2>
          <div className="dmc-cards-grid">
            {CITIES.map((city, i) => (
              <RevealOnScroll key={city.name} direction="up" delay={i * 80}>
                <div className="dmc-city-card">
                  {city.image && <div className="dmc-city-card-image" style={{ backgroundImage: `url(${city.image})` }} aria-hidden />}
                  <h3 className="dmc-city-name">{city.name}</h3>
                  <p className="dmc-city-desc">{city.desc}</p>
                  <button type="button" className="dmc-btn dmc-btn-small" onClick={scrollToForm}>Explore Services in {city.name}</button>
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
            <h2 className="dmc-section-title">Why Partner With Us</h2>
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
          <h2 className="dmc-section-title">Partner With Our Cyprus DMC Team</h2>
          <form className="dmc-form" onSubmit={handleSubmit}>
            <div className="dmc-form-row">
              <label htmlFor="dmc-company">Company Name</label>
              <input id="dmc-company" name="companyName" type="text" value={formData.companyName} onChange={handleChange} required placeholder="Your company name" />
            </div>
            <div className="dmc-form-row">
              <label htmlFor="dmc-person">Contact Person</label>
              <input id="dmc-person" name="contactPerson" type="text" value={formData.contactPerson} onChange={handleChange} required placeholder="Full name" />
            </div>
            <div className="dmc-form-row">
              <label htmlFor="dmc-email">Email</label>
              <input id="dmc-email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="email@company.com" />
            </div>
            <div className="dmc-form-row">
              <label htmlFor="dmc-country">Country</label>
              <input id="dmc-country" name="country" type="text" value={formData.country} onChange={handleChange} placeholder="Country" />
            </div>
            <div className="dmc-form-row">
              <label htmlFor="dmc-type">Type of Business</label>
              <select id="dmc-type" name="businessType" value={formData.businessType} onChange={handleChange}>
                <option value="Agency">Agency</option>
                <option value="School">School</option>
                <option value="Corporate">Corporate</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="dmc-form-row">
              <label htmlFor="dmc-size">Expected Group Size</label>
              <input id="dmc-size" name="groupSize" type="text" value={formData.groupSize} onChange={handleChange} placeholder="e.g. 20–50 pax" />
            </div>
            <div className="dmc-form-row">
              <label htmlFor="dmc-dates">Travel Dates</label>
              <input id="dmc-dates" name="travelDates" type="text" value={formData.travelDates} onChange={handleChange} placeholder="Preferred dates or season" />
            </div>
            <div className="dmc-form-row dmc-form-full">
              <label htmlFor="dmc-message">Message</label>
              <textarea id="dmc-message" name="message" rows={5} value={formData.message} onChange={handleChange} placeholder="Tell us about your requirements..." />
            </div>
            {status && (
              <p className={`dmc-form-status ${status.type}`}>{status.text}</p>
            )}
            <button type="submit" className="dmc-btn dmc-btn-primary dmc-btn-submit" disabled={sending}>
              {sending ? 'Sending...' : 'Submit DMC Request'}
            </button>
          </form>
          <p className="dmc-form-note">Or email us directly: <a href="mailto:limassol@honeywelltravel.com.cy">limassol@honeywelltravel.com.cy</a></p>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="dmc-cta">
        <div className="dmc-cta-inner">
          <p className="dmc-cta-text">Looking for a reliable Cyprus DMC partner?</p>
          <Link to="/contact" className="dmc-btn dmc-btn-white">Contact Our DMC Department</Link>
        </div>
      </section>
    </div>
  )
}

export default DmcCyprus
