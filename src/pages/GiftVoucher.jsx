import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import HoneypotField from '../components/HoneypotField'
import { submitGiftVoucherForm } from '../lib/submitWebsiteForm'
import RevealOnScroll from '../components/RevealOnScroll'
import SEO from '../components/SEO'
import './GiftVoucher.css'

function GiftVoucher() {
  const { t } = useTranslation()
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
      category: t('giftVoucher.faq.haveVoucher'),
      questions: [
        {
          question: t('giftVoucher.faq.q1'),
          answer: (
            <>
              <p>{t('giftVoucher.faq.q1Intro')}</p>
              <ul className="faq-service-list">
                <li>{t('giftVoucher.faq.services.hotel')}</li>
                <li>{t('giftVoucher.faq.services.spa')}</li>
                <li>{t('giftVoucher.faq.services.flight')}</li>
                <li>{t('giftVoucher.faq.services.transfer')}</li>
                <li>{t('giftVoucher.faq.services.carRental')}</li>
                <li>{t('giftVoucher.faq.services.insurance')}</li>
                <li>{t('giftVoucher.faq.services.packages')}</li>
                <li>{t('giftVoucher.faq.services.custom')}</li>
              </ul>
            </>
          )
        },
        { question: t('giftVoucher.faq.q2'), answer: <p>{t('giftVoucher.faq.q2Answer')}</p> },
        { question: t('giftVoucher.faq.q3'), answer: <p>{t('giftVoucher.faq.q3Answer')}</p> },
        { question: t('giftVoucher.faq.q4'), answer: <p>{t('giftVoucher.faq.q4Answer')}</p> },
      ]
    },
    {
      category: t('giftVoucher.faq.wantVoucher'),
      questions: [
        { question: t('giftVoucher.faq.q5'), answer: <p>{t('giftVoucher.faq.q5Answer')}</p> },
        { question: t('giftVoucher.faq.q6'), answer: <p>{t('giftVoucher.faq.q6Answer')}</p> },
        { question: t('giftVoucher.faq.q7'), answer: <p>{t('giftVoucher.faq.q7Answer')}</p> },
        { question: t('giftVoucher.faq.q8'), answer: <p>{t('giftVoucher.faq.q8Answer')}</p> },
        { question: t('giftVoucher.faq.q9'), answer: <p>{t('giftVoucher.faq.q9Answer')}</p> },
      ]
    }
  ]

  const services = {
    flights: {
      name: t('giftVoucher.flights'),
      icon: '✈️',
      image: '/images/vouchers/flight.webp',
      description: t('giftVoucher.services.flightsDesc')
    },
    hotels: {
      name: t('giftVoucher.hotels'),
      icon: '🏨',
      image: '/images/vouchers/hotel.webp',
      description: t('giftVoucher.services.hotelsDesc')
    },
    packages: {
      name: t('giftVoucher.travelPackages'),
      icon: '🌴',
      image: '/images/vouchers/travel-search.webp',
      description: t('giftVoucher.services.packagesDesc')
    },
    cruises: {
      name: t('giftVoucher.cruises'),
      icon: '🚢',
      image: '/images/vouchers/cruise.webp',
      description: t('giftVoucher.services.cruisesDesc')
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
      alert(t('giftVoucher.fillRequired'))
      return
    }

    if (parseFloat(formData.amount) < 30) {
      alert(t('giftVoucher.minAmountError'))
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
        title={t('giftVoucher.seoTitle')}
        description={t('giftVoucher.seoDescription')}
        keywords={t('giftVoucher.seoKeywords')}
        url="https://www.honeywelltravel.com.cy/gift-vouchers"
      />
      {/* Hero Section */}
      <section className="voucher-hero">
        <div className="voucher-hero-content">
          <h1 className="voucher-hero-title animated-title">{t('giftVoucher.heroTitle')}</h1>
          <button 
            className="scroll-down-btn" 
            onClick={scrollToForm}
            aria-label={t('giftVoucher.scrollToForm')}
          >
            <span className="scroll-down-text">{t('giftVoucher.getStarted')}</span>
            <span className="scroll-down-arrow">↓</span>
          </button>
        </div>
      </section>

      <RevealOnScroll direction="up">
      <div className="voucher-container">
        <div className="voucher-content">
          {/* Form Section */}
          <section ref={formSectionRef} className="voucher-form-section">
            <h2 className="section-title">{t('giftVoucher.createTitle')}</h2>
            <form className="voucher-form" onSubmit={handleSubmit}>
              <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="recipientName">
                    {t('giftVoucher.recipientName')} <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="recipientName"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleChange}
                    placeholder={t('giftVoucher.recipientPlaceholder')}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="amount">
                    {t('giftVoucher.voucherAmount')} <span className="required">*</span>
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
                  <small className="input-hint">{t('giftVoucher.minimumAmount')}</small>
                </div>

                <div className="form-group">
                  <label htmlFor="fromName">
                    {t('giftVoucher.yourName')} <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="fromName"
                    name="fromName"
                    value={formData.fromName}
                    onChange={handleChange}
                    placeholder={t('forms.namePlaceholder')}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fromEmail">
                    {t('giftVoucher.yourEmail')} <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="fromEmail"
                    name="fromEmail"
                    value={formData.fromEmail}
                    onChange={handleChange}
                    placeholder={t('forms.emailPlaceholder')}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="message">{t('giftVoucher.personalMessage')}</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    placeholder={t('giftVoucher.personalMessagePlaceholder')}
                    className="form-input form-textarea"
                  />
                </div>
              </div>

              {submitStatus === 'success' && (
                <div className="alert alert-success">
                  {t('forms.success')}
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="alert alert-error">
                  {t('forms.error')}
                </div>
              )}

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('common.processing') : t('giftVoucher.createButton')}
              </button>
            </form>
          </section>

          {/* What You Can Use It For Section */}
          <section className="what-you-can-use-section">
            <h2 className="section-title">{t('giftVoucher.whatYouCanUse')}</h2>
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
                    aria-label={t('giftVoucher.switchService', { name: services[serviceKey].name })}
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
            <h2 className="section-title">{t('giftVoucher.howItWorks')}</h2>
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
