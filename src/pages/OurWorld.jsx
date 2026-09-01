import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import SEO from '../components/SEO'
import HoneypotField from '../components/HoneypotField'
import { FORM_TYPES } from '../lib/formConstants'
import { submitWebsiteForm } from '../lib/submitWebsiteForm'
import './OurWorld.css'

function OurWorld() {
  const { t } = useTranslation()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [formStatus, setFormStatus] = useState(null)
  const [sending, setSending] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  const teamMembers = [
    { 
      id: 1, 
      name: 'Mary Spyrou', 
      role: 'Executive Director',
      quote: '"Wherever you go, you go with all your heart"',
      image: '/images/team/mary-spyrou.png'
    },
    { 
      id: 2, 
      name: 'Vaso Photiou', 
      role: 'Office Supervisor',
      quote: '"Traveling means exchanging and discovering experiences"',
      image: '/images/team/vaso-photiou.png'
    },
    { 
      id: 3, 
      name: 'Anna Roupina', 
      role: 'Travel Consultant',
      quote: '"Travel is the only thing you buy that makes you richer"',
      image: '/images/team/anna-roupina.png'
    },
    { 
      id: 4, 
      name: 'Evi Panayiotou', 
      role: 'Office Supervisor (Nicosia)',
      quote: '"Travelling means to me continuous learning and experience."',
      image: '/images/team/evi-panayiotou.png'
    },
    { 
      id: 5, 
      name: 'Charis Kapnisi', 
      role: 'Account Officer',
      quote: '"Traveling is about escaping, having fun and enjoy life."',
      image: '/images/team/charis-kapnisi.png'
    },
    { 
      id: 6, 
      name: 'Valentina Avraam', 
      role: 'Travel Consultant',
      quote: '"Don\'t spend your money on things. Spend it on experiences!"',
      image: '/images/team/valentina-avraam.png'
    }
  ]

  const blogPosts = [
    { id: 1, title: 'Blog Post 1', date: '2024-01-15', image: '/images/blog/post1.webp' },
    { id: 2, title: 'Blog Post 2', date: '2024-01-10', image: '/images/blog/post2.webp' },
    { id: 3, title: 'Blog Post 3', date: '2024-01-05', image: '/images/blog/post3.webp' }
  ]

  const travelImages = [
    '/images/destinations/iceland.webp',
    '/images/destinations/japan.webp',
    '/images/destinations/dubai-hero.webp',
    '/images/destinations/australia.webp',
    '/images/destinations/brazil.webp',
    '/images/destinations/thailand.webp',
    '/images/destinations/capetown.webp',
    '/images/destinations/maldives.webp',
    '/images/destinations/seychelles.webp',
    '/images/destinations/northern-lights.webp'
  ]

  return (
    <div className="our-world-page">
      <SEO
        title={t('ourWorld.seoTitle')}
        description={t('ourWorld.seoDescription')}
        keywords={t('ourWorld.seoKeywords')}
        url="https://www.honeywelltravel.com.cy/ourworld"
      />
      {/* Hero Section */}
      <section className="section-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">{t('ourWorld.heroTitle')}</h1>
          <p className="hero-subtitle">{t('ourWorld.heroSubtitle')}</p>
        </div>
        <button
          type="button"
          className="hero-scroll-btn"
          onClick={() => {
            document.getElementById('our-world-content')?.scrollIntoView({ behavior: 'smooth' })
          }}
          aria-label={t('ourWorld.scrollDownAria')}
        >
          <span className="hero-scroll-btn-text">{t('ourWorld.scrollToExplore')}</span>
          <span className="hero-scroll-btn-arrow" aria-hidden>↓</span>
        </button>
      </section>

      {/* Introduction Section */}
      <section id="our-world-content" className="section-introduction">
        <div className="container">
          <div className="introduction-content">
            <h2 className="section-heading">
              {t('ourWorld.discoverTitle').split(' ').map((word, index, arr) => (
                <span key={index} className="heading-word" style={{ animationDelay: `${index * 0.2}s` }}>
                  {word}
                  {index < arr.length - 1 && <span> </span>}
                </span>
              ))}
            </h2>
            <div className="introduction-image">
              <img
                src="/images/our-world-people.png"
                alt={t('ourWorld.teamPhotoAlt')}
                className="introduction-photo"
              />
            </div>
            <div className="content-placeholder">
              <p>{t('ourWorld.introP1')}</p>
              <p>{t('ourWorld.introP2')}</p>
              <p>{t('ourWorld.introP3')}</p>
              <p>{t('ourWorld.introP4')}</p>
              <p>{t('ourWorld.introP5')}</p>
              <p>{t('ourWorld.introP6')}</p>
              <p>{t('ourWorld.introP7')}</p>
              <p>{t('ourWorld.introP8')}</p>
              <p>{t('ourWorld.introP9')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="section-awards">
        <div className="container">
          <h2 className="section-heading">{t('ourWorld.awardsTitle')}</h2>
          <div className="awards-intro">
            <p className="awards-intro-text">{t('ourWorld.awardsIntroP1')}</p>
            <p className="awards-intro-text">{t('ourWorld.awardsIntroP2')}</p>
            <p className="awards-intro-text">{t('ourWorld.awardsIntroP3')}</p>
            <p className="awards-intro-text">{t('ourWorld.awardsIntroP4')}</p>
            <p className="awards-intro-text">{t('ourWorld.awardsIntroP5')}</p>
            <p className="awards-intro-text awards-intro-final">{t('ourWorld.awardsIntroP6')}</p>
          </div>
          <div className="awards-grid">
            <div className="award-card">
              <div className="award-icon">🏅</div>
              <h3>{t('ourWorld.bestTravelManagement')}</h3>
              <div className="award-times">{t('ourWorld.awardWinner')}</div>
              <p>{t('ourWorld.awardRecognised')}</p>
              <p className="award-years-inline">
                {['2025', '2024', '2022', '2021', '2020'].map((year) => (
                  <span key={year} className="award-year-pill">
                    {year}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="section-video">
        <div className="container">
          <div className="video-wrapper">
            <video
              className="video-player"
              src="/videos/Honeywell-Travel-travel-awards-video-2024.mp4"
              controls
              playsInline
              preload="metadata"
              poster="/images/destinations/honeywell-travel.webp"
              aria-label={t('ourWorld.videoAria')}
            >
              {t('ourWorld.videoUnsupported')}
            </video>
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className="section-team">
        <div className="container">
          <h2 className="section-heading">{t('ourWorld.meetTeam')}</h2>
          <p className="section-subtitle">{t('ourWorld.teamSubtitle')}</p>
          <div className="team-grid">
            {teamMembers.map((member) => (
              <div key={member.id} className="team-card">
                <div className="team-image">
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="team-member-photo" />
                  ) : (
                    <div className="team-image-placeholder">{t('ourWorld.photoPlaceholder')}</div>
                  )}
                </div>
                <div className="team-info">
                  <h3 className="team-name">{member.name}</h3>
                  <p className="team-role">{member.role}</p>
                  {member.quote && (
                    <p className="team-quote">{member.quote}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* We Love Traveling Section - Image Slider */}
      <section className="section-gallery-traveling">
        <div className="container">
          <h2 className="section-heading">{t('ourWorld.weLoveTraveling')}</h2>
          <p className="section-subtitle">{t('ourWorld.gallerySubtitle')}</p>
          <div className="travel-slider">
            <div className="slider-container">
              <div 
                className="slider-track"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {travelImages.map((image, index) => (
                  <div key={index} className="slider-slide">
                    <img 
                      src={image} 
                      alt={t('ourWorld.travelDestinationAlt', { n: index + 1 })}
                      className="slide-image"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="slider-controls">
              <button 
                className="slider-btn prev"
                onClick={() => setCurrentSlide((prev) => (prev === 0 ? travelImages.length - 1 : prev - 1))}
                aria-label={t('ourWorld.prevSlide')}
              >
                ←
              </button>
              <div className="slider-dots">
                {travelImages.map((_, index) => (
                  <button
                    key={index}
                    className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={t('ourWorld.goToSlide', { n: index + 1 })}
                  />
                ))}
              </div>
              <button 
                className="slider-btn next"
                onClick={() => setCurrentSlide((prev) => (prev === travelImages.length - 1 ? 0 : prev + 1))}
                aria-label={t('ourWorld.nextSlide')}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="section-contact-form">
        <div className="container">
          <h2 className="section-heading">{t('contact.getInTouch')}</h2>
          <p className="section-subtitle">{t('contact.loveToHear')}</p>
          <form 
            className="contact-form"
            onSubmit={async (e) => {
              e.preventDefault()
              setSending(true)
              setFormStatus(null)
              const formData = new FormData(e.target)
              const name = formData.get('name')
              const email = formData.get('email')
              const subject = formData.get('subject') || 'No subject'
              const messageText = formData.get('message')
              const message = `Subject: ${subject}\n\n${messageText}`

              const result = await submitWebsiteForm({
                formType: FORM_TYPES.OUR_WORLD,
                name,
                email,
                message,
                honeypot,
                extraFields: { Subject: subject },
                leadData: {
                  full_name: String(name || '').trim(),
                  phone: '',
                  email: String(email || '').trim(),
                  destination: '',
                  travel_dates: '',
                  number_of_travelers: '',
                  budget: '',
                  message,
                  source: 'Contact Form',
                },
              })

              if (result.ok) {
                setFormStatus({ type: 'success', message: t('forms.success') })
                e.target.reset()
                setHoneypot('')
              } else {
                setFormStatus({ type: 'error', message: t('forms.error') })
              }
              setSending(false)
            }}
          >
            <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact-name">{t('contact.name')} <span className="required">*</span></label>
                <input 
                  type="text" 
                  id="contact-name" 
                  name="name" 
                  required 
                  className="form-input"
                  placeholder={t('forms.namePlaceholder')}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-email">{t('contact.email')} <span className="required">*</span></label>
                <input 
                  type="email" 
                  id="contact-email" 
                  name="email" 
                  required 
                  className="form-input"
                  placeholder={t('forms.emailPlaceholder')}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="contact-subject">{t('forms.subject')}</label>
              <input 
                type="text" 
                id="contact-subject" 
                name="subject" 
                className="form-input"
                placeholder={t('ourWorld.subjectPlaceholder')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-message">{t('contact.message')} <span className="required">*</span></label>
              <textarea 
                id="contact-message" 
                name="message" 
                rows="6" 
                required 
                className="form-input form-textarea"
                placeholder={t('ourWorld.messagePlaceholder')}
              ></textarea>
            </div>
            {formStatus && (
              <p role="alert" style={{ marginBottom: '1rem', color: formStatus.type === 'error' ? '#c41230' : '#1a7f37' }}>
                {formStatus.message}
              </p>
            )}
            <button type="submit" className="submit-button" disabled={sending}>
              {sending ? t('common.sending') : t('common.sendMessage')}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

export default OurWorld
