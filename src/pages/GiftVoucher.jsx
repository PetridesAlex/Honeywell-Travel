import { useState, useRef } from 'react'
import HoneypotField from '../components/HoneypotField'
import { FORM_ERROR_MESSAGE, FORM_SUCCESS_MESSAGE, submitGiftVoucherForm } from '../lib/submitWebsiteForm'
import RevealOnScroll from '../components/RevealOnScroll'
import SEO from '../components/SEO'
import './GiftVoucher.css'

function GiftVoucher() {
  const [formData, setFormData] = useState({
    recipientName: '',
    amount: '',
    fromName: '',
    fromEmail: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [honeypot, setHoneypot] = useState('')
  const [selectedService, setSelectedService] = useState('flights')
  const [openFaq, setOpenFaq] = useState(null)
  const formSectionRef = useRef(null)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const faqs = [
    {
      category: 'I HAVE A GIFT VOUCHER',
      questions: [
        {
          question: 'What can I do with my gift voucher?',
          answer: (
            <>
              <p>Contact us by phone, email, or visit our office directly and present your gift voucher (physical or e-gift format) to choose from all of Honeywell Travel's services:</p>
              <ul className="faq-service-list">
                <li>Hotel</li>
                <li>Spa</li>
                <li>Flight ticket</li>
                <li>Transfer</li>
                <li>Car rental</li>
                <li>Insurances</li>
                <li>Travel Packages</li>
                <li>Customized trip (anniversary, honeymoon, etc.)</li>
              </ul>
            </>
          )
        },
        {
          question: 'How long can I keep my gift voucher?',
          answer: <p>Your voucher is valid for 1 year from the date of purchase.</p>
        },
        {
          question: 'Can I use my gift voucher multiple times?',
          answer: <p>Of course, you can use your voucher all at once or in multiple transactions if the amount of your gift voucher is higher than the service you have chosen. The remaining balance will then be available for a future booking.</p>
        },
        {
          question: 'Is my voucher refundable or exchangeable?',
          answer: <p>Your gift voucher is neither refundable nor exchangeable.</p>
        }
      ]
    },
    {
      category: 'I WANT TO OFFER A GIFT VOUCHER',
      questions: [
        {
          question: 'How do I order my gift voucher?',
          answer: <p>You can fill out the form below with the necessary information or contact us directly, and we will be happy to do it for you.</p>
        },
        {
          question: 'How and when will I receive my gift voucher?',
          answer: <p>You will receive your voucher immediately via email after purchase if you have chosen the e-gift voucher version or a printable voucher. If you have chosen a physical voucher, it will be sent to you as soon as possible by postal mail, or you can pick it up at the office.</p>
        },
        {
          question: 'Can I choose the amount of the gift voucher?',
          answer: <p>Of course, we do not impose any limit on the amount you wish to put on your gift voucher. The choice is yours.</p>
        },
        {
          question: 'I would like to offer a gift voucher for my company, is it possible?',
          answer: <p>It is entirely possible to offer a gift voucher for a company committee. You can choose the quantity of gift vouchers you wish to offer in the questionnaire below.</p>
        },
        {
          question: 'What payment methods can I use to purchase my gift voucher?',
          answer: <p>We accept all modes of payment, of course.</p>
        }
      ]
    }
  ]

  const services = {
    flights: {
      name: 'Flights',
      icon: '✈️',
      image: '/images/vouchers/flight.webp',
      description: 'Book domestic and international flights to any destination worldwide. Use your voucher for economy, business, or first-class tickets.'
    },
    hotels: {
      name: 'Hotels',
      icon: '🏨',
      image: '/images/vouchers/hotel.webp',
      description: 'Reserve accommodation at luxury resorts, boutique hotels, or budget-friendly options. Perfect for any type of stay.'
    },
    packages: {
      name: 'Travel Packages',
      icon: '🌴',
      image: '/images/vouchers/travel-search.webp',
      description: 'Purchase complete holiday packages including flights, hotels, and activities. All-inclusive deals available.'
    },
    cruises: {
      name: 'Cruises',
      icon: '🚢',
      image: '/images/vouchers/cruise.webp',
      description: 'Set sail on luxury cruises to exotic destinations. Your voucher can be used for cruise bookings and onboard experiences.'
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.recipientName || !formData.amount || !formData.fromName || !formData.fromEmail) {
      alert('Please fill in all required fields')
      return
    }

    if (parseFloat(formData.amount) < 30) {
      alert('Minimum amount is €30.00')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const result = await submitGiftVoucherForm({
        toName: formData.recipientName,
        fromName: formData.fromName,
        fromEmail: formData.fromEmail,
        amount: formData.amount,
        message: formData.message,
        honeypot,
      })

      if (result.success) {
        setSubmitStatus('success')
        setTimeout(() => {
          setFormData({
            recipientName: '',
            amount: '',
            fromName: '',
            fromEmail: '',
            message: ''
          })
          setSubmitStatus(null)
        }, 5000)
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting voucher:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="gift-voucher-page">
      <SEO
        title="Gift Vouchers | Honeywell Travel"
        description="Buy and redeem Honeywell Travel gift vouchers for flights, hotels, packages, and tailor-made trips."
        keywords="travel gift voucher cyprus, honeywell gift voucher"
        url="https://www.honeywelltravel.com.cy/gift-vouchers"
      />
      {/* Hero Section */}
      <section className="voucher-hero">
        <div className="voucher-hero-content">
          <h1 className="voucher-hero-title animated-title">GIFT VOUCHER</h1>
          <button 
            className="scroll-down-btn" 
            onClick={scrollToForm}
            aria-label="Scroll to form"
          >
            <span className="scroll-down-text">Get Started</span>
            <span className="scroll-down-arrow">↓</span>
          </button>
        </div>
      </section>

      <RevealOnScroll direction="up">
      <div className="voucher-container">
        <div className="voucher-content">
          {/* Form Section */}
          <section ref={formSectionRef} className="voucher-form-section">
            <h2 className="section-title">Create Your Gift Voucher</h2>
            <form className="voucher-form" onSubmit={handleSubmit}>
              <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="recipientName">
                    Recipient Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="recipientName"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleChange}
                    placeholder="Enter the recipient's full name"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="amount">
                    Voucher Amount (€) <span className="required">*</span>
                  </label>
                  <div className="amount-input-wrapper">
                    <span className="currency-symbol">€</span>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                    placeholder="0.00"
                    min="30"
                      step="0.01"
                      required
                      className="form-input amount-input"
                    />
                  </div>
                  <small className="input-hint">Minimum amount: €30.00</small>
                </div>

                <div className="form-group">
                  <label htmlFor="fromName">
                    Your Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="fromName"
                    name="fromName"
                    value={formData.fromName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fromEmail">
                    Your Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="fromEmail"
                    name="fromEmail"
                    value={formData.fromEmail}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="message">Personal Message (Optional)</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Add a heartfelt message to make it extra special..."
                    className="form-input form-textarea"
                  />
                </div>
              </div>

              {submitStatus === 'success' && (
                <div className="alert alert-success">
                  {FORM_SUCCESS_MESSAGE}
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="alert alert-error">
                  {FORM_ERROR_MESSAGE}
                </div>
              )}

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Create Gift Voucher'}
              </button>
            </form>
          </section>

          {/* What You Can Use It For Section */}
          <section className="what-you-can-use-section">
            <h2 className="section-title">What You Can Use It For</h2>
            <div className="service-display-container">
              <div className="main-service-image">
                <img 
                  src={services[selectedService].image} 
                  alt={services[selectedService].name}
                  className="service-image"
                />
                <div className="service-overlay">
                  <div className="service-info">
                    <h3>{services[selectedService].name}</h3>
                    <p>{services[selectedService].description}</p>
                  </div>
                </div>
              </div>
              <div className="service-switch">
                {Object.keys(services).map((serviceKey) => (
                  <button
                    key={serviceKey}
                    className={`service-switch-btn ${selectedService === serviceKey ? 'active' : ''}`}
                    onClick={() => setSelectedService(serviceKey)}
                    aria-label={`Switch to ${services[serviceKey].name}`}
                  >
                    <img 
                      src={services[serviceKey].image} 
                      alt={services[serviceKey].name}
                      className="switch-thumbnail"
                    />
                    <span className="switch-label">{services[serviceKey].icon} {services[serviceKey].name}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* How Does It Work Section */}
          <section className="how-to-use-section">
            <h2 className="section-title">HOW DOES IT WORK?</h2>
            <div className="faq-accordion-container">
              {faqs.map((category, categoryIndex) => (
                <div key={categoryIndex} className="faq-category">
                  <h3 className="faq-category-title">{category.category}</h3>
                  <div className="faq-accordion">
                    {category.questions.map((faq, index) => {
                      const faqIndex = categoryIndex * 100 + index
                      const isOpen = openFaq === faqIndex
                      return (
                        <div key={index} className={`faq-accordion-item ${isOpen ? 'open' : ''}`}>
                          <button
                            className="faq-accordion-header"
                            onClick={() => toggleFaq(faqIndex)}
                            aria-expanded={isOpen}
                          >
                            <span className="faq-accordion-question">{faq.question}</span>
                            <span className={`faq-accordion-icon ${isOpen ? 'open' : ''}`}>
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path
                                  d={isOpen ? "M5 10L10 5L15 10" : "M5 10L10 15L15 10"}
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          </button>
                          <div className={`faq-accordion-content ${isOpen ? 'open' : ''}`}>
                            <div className="faq-accordion-answer">
                              {faq.answer}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      </RevealOnScroll>
    </div>
  )
}

export default GiftVoucher
