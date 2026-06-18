import { useState } from 'react'
import RevealOnScroll from '../components/RevealOnScroll'
import HoneypotField from '../components/HoneypotField'
import { FORM_TYPES } from '../lib/formConstants'
import { FORM_ERROR_MESSAGE, FORM_SUCCESS_MESSAGE, submitWebsiteForm } from '../lib/submitWebsiteForm'
import SEO from '../components/SEO'
import './Corporate.css'

function Corporate() {
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

  const services = [
    'Air tickets',
    'Accommodation',
    'Transfers and Transport',
    'Corporate account management',
    'Tours and Excursions',
    'Car Rental worldwide',
    'Group Travel',
    'Air tickets on low cost carriers',
    'Cruises',
    'Summer packages',
    'Conference and Incentive packages abroad',
    'Travel Insurance',
    'Special packages and/or entrance tickets (football match, concerts, theaters, Athens by night etc)'
  ]

  return (
    <div className="corporate-page">
      <SEO
        title="Corporate Travel Services | Honeywell Travel"
        description="Professional business travel management solutions, corporate accounts, and incentive trips by Honeywell Travel."
        keywords="corporate travel cyprus, business travel management, incentive trips"
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
          <h1>CORPORATE TRIPS</h1>
          <p>Professional Business Travel Management Solutions</p>
          <button 
            className="hero-cta-button"
            onClick={() => setShowQuoteModal(true)}
          >
            Get Quote
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
            <h2>Request a Corporate Travel Quote</h2>
            <p className="quote-modal-subtitle">Fill out the form below and we'll get back to you with a customized quote</p>
            
            <form onSubmit={handleSubmitQuote} className="quote-form">
              <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
              <div className="form-group">
                <label htmlFor="name">Your Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="companyName">Company Name *</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your company name"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your@email.com"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactNumber">Contact Number *</label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="+357 XX XXX XXX"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Tell us about your travel needs *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  placeholder="Please provide details about your corporate travel requirements, number of travelers, destinations, dates, and any specific needs..."
                  disabled={isSubmitting}
                />
              </div>

              {submitStatus === 'success' && (
                <div className="form-success">
                  ✓ {FORM_SUCCESS_MESSAGE}
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="form-error">
                  ✗ {FORM_ERROR_MESSAGE}
                </div>
              )}

              <div className="form-actions">
                <button 
                  type="button" 
                  className="form-cancel"
                  onClick={() => setShowQuoteModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="form-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Request Quote'}
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
                <h2>CWT</h2>
                <p className="cwt-subtitle">(Independently owned and operated by Honeywell Travel Asg - Ltd)</p>
              </div>
              <div className="cwt-description">
                <p>
                  Honeywell Travel is a leading travel agency in Cyprus, specializing in world-class business travel management. 
                  We are proud to be the official partner of <strong>CWT</strong>, a global leader in managing business travel and events 
                  across nearly 150 countries.
                </p>
                <p>
                  CWT focuses on four key pillars: <strong>Savings, Service, Security, and Sustainability</strong>. Through our partnership, 
                  we provide comprehensive travel management solutions that help businesses optimize their travel programs while ensuring 
                  the best possible experience for their employees.
                </p>
                <p>
                  Visit <a href="https://www.mycwt.com" target="_blank" rel="noopener noreferrer">www.myCWT.com</a> to learn more about 
                  CWT's global capabilities and services.
                </p>
                <p>
                  <strong>Honeywell Travel is the international partner representative of CWT Global Partner Network in Cyprus.</strong>
                </p>
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
            <h2>World-Class Destinations</h2>
            <p>From exotic paradises to business hubs, we manage corporate travel to destinations worldwide</p>
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
              <div className="what-we-do-image-cover" role="img" aria-label="Incentive trips – professionals celebrating on a rooftop terrace overlooking the city"></div>
            </div>
            <div className="what-we-do-text">
              <h2>WHAT WE DO</h2>
              <div className="what-we-do-description">
                <p>
                  Honeywell Travel is a professional, well-established and licensed IATA Travel Agency, offering top-level travel 
                  consulting and services through its partnerships and a network of travel experts and professionals around the world.
                </p>
                <p>
                  Since 1987, our company has been the official Partner of CWT, the biggest network of travel management companies worldwide. 
                  Our offices in Limassol and Nicosia are part of the A.S.G. (Andy Spyrou Group), providing comprehensive travel solutions 
                  to businesses across Cyprus.
                </p>
                <p>
                  Our corporate clientele comprises multinational and local companies from all industries: the marine, pharmaceutical, 
                  banking, educational and telecommunications sectors, as well as public organizations.
                </p>
                <p>
                  Our business travel management services go far beyond merely handling travel arrangements and taking care of transportation 
                  needs for our corporate clients. Our passionate, highly trained, dedicated team of travel consultants will ensure flawless 
                  conduction of all travel processes and requirements.
                </p>
              </div>
              <div className="services-list">
                <h3>Amongst others, our services include:</h3>
                <ul>
                  {services.map((service, index) => (
                    <li key={index}>{service}</li>
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
          <h2 className="section-title">EXTRA SERVICES</h2>
          <div className="extra-services-grid">
            <div className="extra-service-card">
              <div className="service-icon">🛡️</div>
              <h3>Travel Insurance</h3>
              <p>
                We know that you'd rather not think about all the things that may go wrong on your trip, but these things can and do happen. 
                This is why here at Honeywell Travel we offer travel insurance, so that you can relax and enjoy your holiday knowing that 
                we've got you covered!
              </p>
              <p>
                We don't just keep you and your family protected, with us, you'll travel smarter and safer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Incentive Trips Section */}
      <section className="incentive-section">
        <div className="container">
          <div className="incentive-content">
            <div className="incentive-text">
              <h2>INCENTIVE TRIPS</h2>
              <div className="incentive-description">
                <p>
                  Incentive travel is business-related travel designed to reward employees, integrate new team members, and motivate existing ones. 
                  These trips are carefully crafted to provide unique experiences that strengthen community, foster new ideas, and promote teamwork.
                </p>
                <p>
                  From the magical reindeer sleigh rides in Lapland to sailing adventures in the Mediterranean, or stargazing under the desert sky, 
                  we offer diverse locations and atmospheres for any event. Each incentive trip is customized to meet your company's specific goals 
                  and budget.
                </p>
                <p>
                  These experiences not only reward your team but also increase employee loyalty and success. At Honeywell Travel, we offer suitable 
                  locations and atmospheres for any event, ensuring your incentive trip creates lasting memories and drives performance.
                </p>
              </div>
            </div>
            <div className="incentive-image">
              <div className="incentive-image-cover" role="img" aria-label="Incentive trips – professionals celebrating on a rooftop terrace overlooking the city"></div>
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
              <h2>WORLD TRAVEL AWARDS</h2>
            </div>
            <div className="awards-text">
              <h3>CYPRUS LEADING TRAVEL MANAGEMENT COMPANY 2025</h3>
              <div className="awards-description">
                <p>
                  We are thrilled to announce that Honeywell Travel has been voted by the 27th World Travel Awards as 
                  <strong> Cyprus' Leading Travel Management Company for 2020</strong>.
                </p>
                <p className="quote">
                  "This prestigious award came at an excellent time for us, inspiring us to never give up, regardless of the 
                  difficulties and the adversities." - <strong>Mary Spyrou, Executive Director of Honeywell Travel</strong>
                </p>
                <p>
                  World Travel Awards serves to acknowledge, reward, and celebrate excellence across all sectors of the global travel 
                  and tourism industry. On the 2nd November, the European winners were announced on a virtual ceremony.
                </p>
                <p>
                  <strong>Graham Cooke, Founder, World Travel Awards</strong>, says: "Our winners represent the very best of Europe's 
                  travel and tourism sector and my congratulations to each of them. They have all demonstrated remarkable resilience in 
                  a year of unprecedented challenges. The World Travel Awards 2020 programme received a record number of votes cast by the 
                  public. This shows that the appetite for travel and tourism has never been stronger and bodes well for the Industry's 
                  future as the global recovery begins."
                </p>
                <p className="signature">
                  <strong>Honeywell Travel - A signature of Travel Management Excellence!</strong>
                </p>
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
          <h2>Ready to Transform Your Business Travel?</h2>
          <p>Contact our corporate travel experts today and discover how we can optimize your travel program.</p>
          <a href="/contact/" className="cta-button">Get in Touch</a>
        </div>
      </section>
      </RevealOnScroll>
    </div>
  )
}

export default Corporate
