import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, CalendarDays, Percent, Ship, SunMedium, Timer, Wallet } from 'lucide-react'
import SEO from '../components/SEO'
import HoneypotField from '../components/HoneypotField'
import TurnstileWidget from '../components/TurnstileWidget'
import { FORM_TYPES } from '../lib/formConstants'
import { formSubmitErrorMessage, isValidEmail, submitWebsiteForm } from '../lib/submitWebsiteForm'
import { normalizeLang } from '../utils/localizedContent'
import './BlackFridayCruises.css'

const MOTION_EASE = [0.22, 1, 0.36, 1]
const OFFER_ENDS_AT = new Date('2026-11-30T23:59:59+02:00').getTime()

function getOfferCountdown(now = Date.now()) {
  const diff = Math.max(0, OFFER_ENDS_AT - now)
  return {
    ended: diff <= 0,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function padTime(value) {
  return String(value).padStart(2, '0')
}

const HERO_PILLS = [
  { key: 'badge', tone: 'crimson', Icon: Percent },
  { key: 'deposit', tone: 'navy', Icon: Wallet },
  { key: 'validUntil', tone: 'gold', Icon: CalendarDays },
  { key: 'season', tone: 'ocean', Icon: SunMedium },
]

const GALLERY = [
  {
    src: '/images/black-friday-cruises/hero-en.jpg',
    altKey: 'galleryShipNight',
  },
  {
    src: '/images/black-friday-cruises/gallery-ships.jpg',
    altKey: 'galleryTwinShips',
  },
  {
    src: '/images/black-friday-cruises/gallery-tropical.jpg',
    altKey: 'galleryTropical',
  },
  {
    src: '/images/black-friday-cruises/hero-el.jpg',
    altKey: 'gallerySunsetDeck',
  },
]

const MSC_GALLERY = [
  {
    src: '/images/black-friday-cruises/msc-boat-deck.jpg',
    captionKey: 'mscCapSunset',
    size: 'feature',
  },
  {
    src: '/images/black-friday-cruises/msc-turquoise-ship.jpg',
    captionKey: 'mscCapTurquoise',
    size: 'tall',
  },
  {
    src: '/images/black-friday-cruises/msc-night-harbor.jpg',
    captionKey: 'mscCapNight',
    size: 'wide',
  },
  {
    src: '/images/black-friday-cruises/msc-seascape-miami.jpg',
    captionKey: 'mscCapMiami',
    size: 'standard',
  },
  {
    src: '/images/black-friday-cruises/msc-tropical-bay.jpg',
    captionKey: 'mscCapBay',
    size: 'standard',
  },
  {
    src: '/images/black-friday-cruises/msc-pool-deck.jpg',
    captionKey: 'mscCapPool',
    size: 'standard',
  },
  {
    src: '/images/black-friday-cruises/msc-seaside-dusk.jpg',
    captionKey: 'mscCapDusk',
    size: 'wide',
  },
  {
    src: '/images/black-friday-cruises/msc-city-port.jpg',
    captionKey: 'mscCapPort',
    size: 'standard',
  },
  {
    src: '/images/black-friday-cruises/msc-marseille-rooftops.jpg',
    captionKey: 'mscCapMarseille',
    size: 'wide',
  },
  {
    src: '/images/black-friday-cruises/msc-family-cabin.jpg',
    captionKey: 'mscCapFamily',
    size: 'standard',
  },
  {
    src: '/images/black-friday-cruises/msc-monaco-pier.jpg',
    captionKey: 'mscCapMonacoPier',
    size: 'standard',
  },
  {
    src: '/images/black-friday-cruises/msc-barcelona-port.jpg',
    captionKey: 'mscCapBarcelona',
    size: 'wide',
  },
  {
    src: '/images/black-friday-cruises/msc-marina-bay.jpg',
    captionKey: 'mscCapMarina',
    size: 'standard',
  },
  {
    src: '/images/black-friday-cruises/msc-fontvieille.jpg',
    captionKey: 'mscCapFontvieille',
    size: 'standard',
  },
]

function BlackFridayCruises() {
  const { t, i18n } = useTranslation()
  const lang = normalizeLang(i18n.resolvedLanguage || i18n.language)
  const reduceMotion = useReducedMotion()
  const formRef = useRef(null)
  const turnstileRef = useRef(null)
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    email: '',
    phone: '',
  })
  const [status, setStatus] = useState(null)
  const [sending, setSending] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [countdown, setCountdown] = useState(() => getOfferCountdown())

  useEffect(() => {
    setCountdown(getOfferCountdown())
    const timer = window.setInterval(() => {
      setCountdown(getOfferCountdown())
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const [isMobileHero, setIsMobileHero] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 720px)').matches : false,
  )

  useEffect(() => {
    const media = window.matchMedia('(max-width: 720px)')
    const onChange = () => setIsMobileHero(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const heroCards = useMemo(() => {
    const center =
      lang === 'el'
        ? '/images/black-friday-cruises/hero-el.jpg'
        : '/images/black-friday-cruises/hero-en.jpg'
    const sideLift = isMobileHero ? 28 : 40
    const sideTilt = isMobileHero ? -9 : -12

    return [
      {
        rotate: sideTilt,
        translateY: sideLift,
        src: '/images/black-friday-cruises/gallery-ships.jpg',
        alt: t('blackFridayCruises.title'),
      },
      {
        rotate: 0,
        translateY: 0,
        src: center,
        alt: t('blackFridayCruises.title'),
      },
      {
        rotate: Math.abs(sideTilt),
        translateY: sideLift,
        src: '/images/black-friday-cruises/gallery-tropical.jpg',
        alt: t('blackFridayCruises.title'),
      },
    ]
  }, [lang, t, isMobileHero])

  const titleWords = useMemo(
    () => t('blackFridayCruises.title').trim().split(/\s+/),
    [t, lang],
  )
  const leadWords = useMemo(
    () => t('blackFridayCruises.subtitleLead').trim().split(/\s+/),
    [t, lang],
  )
  const wordReveal = (delay, distance = 28) => ({
    initial: {
      opacity: 0,
      y: reduceMotion ? 0 : distance,
      filter: reduceMotion ? 'none' : 'blur(8px)',
    },
    animate: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
    },
    transition: {
      duration: 0.7,
      ease: MOTION_EASE,
      delay,
    },
  })

  useLayoutEffect(() => {
    const resetTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      if (document.documentElement) document.documentElement.scrollTop = 0
      if (document.body) document.body.scrollTop = 0
    }
    resetTop()
    requestAnimationFrame(resetTop)
  }, [])

  const rise = (delay) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: MOTION_EASE, delay },
  })

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setStatus(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const firstName = formData.firstName.trim()
    const surname = formData.surname.trim()
    const email = formData.email.trim()
    const phone = formData.phone.trim()

    if (!firstName || !surname || !email || !isValidEmail(email) || !phone) {
      setStatus({ type: 'error', message: t('blackFridayCruises.formError') })
      return
    }

    setSending(true)
    setStatus(null)

    const fullName = `${firstName} ${surname}`
    const message = t('blackFridayCruises.messageFallback')

    const result = await submitWebsiteForm({
      formType: FORM_TYPES.BLACK_FRIDAY_CRUISE,
      name: fullName,
      email,
      phone,
      destination: 'MSC Cruises',
      message,
      honeypot,
      turnstileToken,
      extraFields: {
        Campaign: 'Black Friday Cruises',
        Partner: 'MSC Cruises',
        Offer: 'Save up to 30% · €50 deposit per person · Valid until 30 November',
      },
      leadData: {
        first_name: firstName,
        last_name: surname,
        full_name: fullName,
        phone,
        email,
        destination: 'MSC Cruises',
        travel_dates: 'Summer 2027',
        number_of_travelers: '',
        budget: '',
        message,
        source: 'Black Friday Cruises',
      },
    })

    if (result.ok) {
      setStatus({ type: 'success', message: t('forms.success') })
      setFormData({ firstName: '', surname: '', email: '', phone: '' })
      setHoneypot('')
      setTurnstileToken('')
      turnstileRef.current?.reset()
    } else {
      setStatus({ type: 'error', message: formSubmitErrorMessage(result, t) })
    }

    setSending(false)
  }

  return (
    <>
      <SEO
        title={t('blackFridayCruises.seoTitle')}
        description={t('blackFridayCruises.seoDescription')}
        keywords="Black Friday Cruises, MSC Cruises Cyprus, Honeywell Travel Black Friday, cruise deposit €50"
        url="https://www.honeywelltravel.com.cy/black-friday-cruises"
        image="https://www.honeywelltravel.com.cy/images/black-friday-cruises/hero-en.jpg"
      />

      <div className="bf-cruises">
        <section className="bf-cruises__hero" aria-labelledby="bf-cruises-title">
          <div className="bf-cruises__hero-shell">
            <div className="bf-cruises__hero-copy">
              <motion.p
                className="bf-cruises__eyebrow"
                initial={{
                  opacity: 0,
                  y: reduceMotion ? 0 : 10,
                  letterSpacing: reduceMotion ? '0.2em' : '0.42em',
                }}
                animate={{ opacity: 1, y: 0, letterSpacing: '0.2em' }}
                transition={{ duration: 0.8, ease: MOTION_EASE, delay: 0.04 }}
              >
                {t('blackFridayCruises.eyebrow')}
              </motion.p>

              <h1
                id="bf-cruises-title"
                className="bf-cruises__title"
                aria-label={t('blackFridayCruises.title')}
              >
                {titleWords.map((word, index) => (
                  <span key={`${word}-${index}`} className="bf-cruises__title-word-wrap" aria-hidden="true">
                    <motion.span
                      className={`bf-cruises__title-word${index < 2 ? ' bf-cruises__title-word--accent' : ''}`}
                      {...wordReveal(0.1 + index * 0.12, 36)}
                    >
                      {word}
                    </motion.span>
                  </span>
                ))}
              </h1>

              <div
                className="bf-cruises__subtitle"
                aria-label={t('blackFridayCruises.subtitle')}
              >
                <p className="bf-cruises__subtitle-lead" aria-hidden="true">
                  {leadWords.map((word, index) => (
                    <span key={`${word}-${index}`} className="bf-cruises__lead-word-wrap">
                      <motion.span
                        className="bf-cruises__lead-word"
                        {...wordReveal(0.42 + index * 0.07, 22)}
                      >
                        {word}
                      </motion.span>
                    </span>
                  ))}
                </p>
                <p className="bf-cruises__subtitle-ad">
                  <motion.span
                    className="bf-cruises__subtitle-plain"
                    {...wordReveal(0.72, 14)}
                  >
                    {t('blackFridayCruises.subtitleBefore')}
                  </motion.span>{' '}
                  <motion.span
                    className="bf-cruises__subtitle-mark bf-cruises__subtitle-mark--discount"
                    initial={{
                      opacity: 0,
                      scale: reduceMotion ? 1 : 0.7,
                      y: reduceMotion ? 0 : 12,
                    }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.65, ease: MOTION_EASE, delay: 0.84 }}
                  >
                    {t('blackFridayCruises.subtitleDiscount')}
                  </motion.span>{' '}
                  <motion.span
                    className="bf-cruises__subtitle-plain"
                    {...wordReveal(0.94, 14)}
                  >
                    {t('blackFridayCruises.subtitleMid')}
                  </motion.span>{' '}
                  <motion.span
                    className="bf-cruises__subtitle-mark bf-cruises__subtitle-mark--deposit"
                    initial={{
                      opacity: 0,
                      scale: reduceMotion ? 1 : 0.7,
                      y: reduceMotion ? 0 : 12,
                    }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.65, ease: MOTION_EASE, delay: 1.06 }}
                  >
                    {t('blackFridayCruises.subtitleDeposit')}
                  </motion.span>{' '}
                  <motion.span
                    className="bf-cruises__subtitle-plain"
                    {...wordReveal(1.16, 14)}
                  >
                    {t('blackFridayCruises.subtitleAfter')}
                  </motion.span>
                </p>
              </div>

              <div className="bf-cruises__pills" aria-label="Offer highlights">
                <span className="bf-cruises__pills-rail" aria-hidden="true" />
                {HERO_PILLS.map(({ key, tone, Icon }, index) => (
                  <motion.span
                    key={key}
                    className={`bf-cruises__pill bf-cruises__pill--${tone}`}
                    style={{ '--bf-pill-i': index }}
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 18, scale: reduceMotion ? 1 : 0.88 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.55,
                      delay: reduceMotion ? 0 : 0.22 + index * 0.14,
                      ease: MOTION_EASE,
                    }}
                    whileHover={
                      reduceMotion
                        ? undefined
                        : {
                            y: -3,
                            scale: 1.04,
                            transition: { type: 'spring', stiffness: 420, damping: 20 },
                          }
                    }
                  >
                    <span className="bf-cruises__pill-glow" aria-hidden="true" />
                    <span className="bf-cruises__pill-icon" aria-hidden="true">
                      <Icon strokeWidth={2} />
                    </span>
                    <span className="bf-cruises__pill-text">{t(`blackFridayCruises.${key}`)}</span>
                  </motion.span>
                ))}
              </div>

              <motion.div
                className={`bf-cruises__countdown${countdown.ended ? ' bf-cruises__countdown--ended' : ''}`}
                role="timer"
                aria-live="polite"
                aria-atomic="true"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: MOTION_EASE, delay: 0.28 }}
              >
                <div className="bf-cruises__countdown-copy">
                  {!isMobileHero && (
                    <span className="bf-cruises__countdown-live" aria-hidden="true">
                      <Timer className="bf-cruises__countdown-live-icon" strokeWidth={2} />
                      <span className="bf-cruises__countdown-live-dot" />
                    </span>
                  )}
                  <div className="bf-cruises__countdown-text">
                    <p className="bf-cruises__countdown-eyebrow">
                      {countdown.ended
                        ? t('blackFridayCruises.countdownEnded')
                        : t('blackFridayCruises.countdownEyebrow')}
                    </p>
                    {!isMobileHero && (
                      <p className="bf-cruises__countdown-headline">
                        {t('blackFridayCruises.countdownHeadline')}
                      </p>
                    )}
                  </div>
                </div>

                {!countdown.ended && (
                  <div className="bf-cruises__countdown-units" aria-label={t('blackFridayCruises.countdownEyebrow')}>
                    {[
                      { value: countdown.days, label: t('blackFridayCruises.countdownDays') },
                      { value: countdown.hours, label: t('blackFridayCruises.countdownHours') },
                      { value: countdown.minutes, label: t('blackFridayCruises.countdownMins') },
                      { value: countdown.seconds, label: t('blackFridayCruises.countdownSecs') },
                    ].map((unit, index) => (
                      <div key={unit.label} className="bf-cruises__countdown-unit">
                        <span className="bf-cruises__countdown-value">{padTime(unit.value)}</span>
                        <span className="bf-cruises__countdown-label">{unit.label}</span>
                        {index < 3 && (
                          <span className="bf-cruises__countdown-sep" aria-hidden="true">
                            :
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              <motion.div className="bf-cruises__hero-actions" {...rise(0.18)}>
                <motion.button
                  type="button"
                  className="bf-cruises__cta bf-cruises__cta--hero"
                  onClick={scrollToForm}
                  whileHover={reduceMotion ? undefined : { y: -3, scale: 1.02 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                >
                  <span className="bf-cruises__cta-shine" aria-hidden="true" />
                  <span className="bf-cruises__cta-label">{t('blackFridayCruises.cta')}</span>
                  <span className="bf-cruises__cta-arrow" aria-hidden="true">
                    <ArrowRight className="bf-cruises__cta-icon" strokeWidth={2} />
                  </span>
                </motion.button>

                <motion.button
                  type="button"
                  className="bf-cruises__cta bf-cruises__cta--ghost"
                  onClick={() => {
                    document
                      .getElementById('bf-msc-gallery-title')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                >
                  {t('blackFridayCruises.mscGalleryTitle')}
                </motion.button>

                <div className="bf-cruises__partner-chip">
                  <span className="bf-cruises__partner-dot" aria-hidden="true" />
                  <Ship className="bf-cruises__partner-icon" strokeWidth={1.75} aria-hidden="true" />
                  <p className="bf-cruises__partner">{t('blackFridayCruises.partner')}</p>
                </div>
              </motion.div>
            </div>

            <div className="bf-cruises__hero-stage">
              <div className="bf-cruises__hero-orbit" aria-hidden="true" />
              <div className="bf-cruises__hero-cards">
                {heroCards.map((card, index) => (
                  <motion.div
                    key={`${card.src}-${index}`}
                    className="bf-cruises__hero-card"
                    style={{ zIndex: index === 1 ? 3 : 2 }}
                    initial={{
                      opacity: 0,
                      y: reduceMotion ? card.translateY : 80,
                      rotate: reduceMotion ? card.rotate : 0,
                    }}
                    animate={{
                      opacity: 1,
                      y: card.translateY,
                      rotate: card.rotate,
                    }}
                    whileHover={
                      reduceMotion
                        ? undefined
                        : {
                            y: card.translateY - 12,
                            transition: {
                              type: 'spring',
                              stiffness: 400,
                              damping: 25,
                            },
                          }
                    }
                    transition={{
                      duration: 0.7,
                      delay: 0.3 + index * 0.1,
                      ease: MOTION_EASE,
                    }}
                  >
                    <img
                      src={card.src}
                      alt={card.alt}
                      width={640}
                      height={640}
                      loading="eager"
                      decoding="async"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bf-cruises__highlights" aria-labelledby="bf-highlights-title">
          <div className="bf-cruises__highlights-glow" aria-hidden="true" />
          <div className="bf-cruises__container">
            <div className="bf-cruises__highlights-head">
              <p className="bf-cruises__eyebrow bf-cruises__eyebrow--section">
                {t('blackFridayCruises.partner')}
              </p>
              <h2 id="bf-highlights-title" className="bf-cruises__section-title">
                {t('blackFridayCruises.highlightsTitle')}
              </h2>
            </div>
            <div className="bf-cruises__highlight-grid">
              <article className="bf-cruises__highlight-card" style={{ '--bf-card-i': 0 }}>
                <span className="bf-cruises__highlight-index" aria-hidden="true">01</span>
                <h3>{t('blackFridayCruises.highlight1Title')}</h3>
                <p>{t('blackFridayCruises.highlight1Text')}</p>
              </article>
              <article className="bf-cruises__highlight-card" style={{ '--bf-card-i': 1 }}>
                <span className="bf-cruises__highlight-index" aria-hidden="true">02</span>
                <h3>{t('blackFridayCruises.highlight2Title')}</h3>
                <p>{t('blackFridayCruises.highlight2Text')}</p>
              </article>
              <article className="bf-cruises__highlight-card" style={{ '--bf-card-i': 2 }}>
                <span className="bf-cruises__highlight-index" aria-hidden="true">03</span>
                <h3>{t('blackFridayCruises.highlight3Title')}</h3>
                <p>{t('blackFridayCruises.highlight3Text')}</p>
              </article>
            </div>
          </div>
        </section>

        <section className="bf-cruises__gallery" aria-labelledby="bf-gallery-title">
          <div className="bf-cruises__container">
            <div className="bf-cruises__gallery-head">
              <p className="bf-cruises__eyebrow bf-cruises__eyebrow--gallery">
                {t('blackFridayCruises.partner')}
              </p>
              <h2 id="bf-gallery-title" className="bf-cruises__section-title">
                {t('blackFridayCruises.galleryTitle')}
              </h2>
              <p className="bf-cruises__gallery-subtitle">
                {t('blackFridayCruises.gallerySubtitle')}
              </p>
            </div>
            <div className="bf-cruises__gallery-grid">
              {GALLERY.map((item, index) => (
                <figure
                  key={item.src}
                  className={`bf-cruises__gallery-item bf-cruises__gallery-item--${index + 1}`}
                  style={{ '--bf-gallery-i': index }}
                >
                  <img src={item.src} alt={t('blackFridayCruises.title')} loading="lazy" />
                  <span className="bf-cruises__gallery-frame" aria-hidden="true" />
                  <figcaption className="bf-cruises__gallery-caption">
                    <span className="bf-cruises__gallery-index">0{index + 1}</span>
                    <span className="bf-cruises__gallery-caption-text">
                      {t('blackFridayCruises.partner')}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section
          className="bf-cruises__form-section"
          aria-labelledby="bf-form-title"
          ref={formRef}
          id="enquiry"
        >
          <div className="bf-cruises__container bf-cruises__form-layout">
            <div className="bf-cruises__form-orb bf-cruises__form-orb--a" aria-hidden="true" />
            <div className="bf-cruises__form-orb bf-cruises__form-orb--b" aria-hidden="true" />

            <motion.div
              className="bf-cruises__form-intro"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.65, ease: MOTION_EASE }}
            >
              <p className="bf-cruises__eyebrow bf-cruises__form-eyebrow">
                <Ship className="bf-cruises__form-eyebrow-icon" aria-hidden="true" />
                {t('blackFridayCruises.formEyebrow')}
              </p>
              <h2 id="bf-form-title" className="bf-cruises__section-title bf-cruises__form-title">
                {t('blackFridayCruises.formTitle')}
              </h2>
              <p className="bf-cruises__form-copy">{t('blackFridayCruises.formSubtitle')}</p>

              <div
                className={`bf-cruises__form-urgency${countdown.ended ? ' bf-cruises__form-urgency--ended' : ''}`}
                aria-live="polite"
              >
                <span className="bf-cruises__form-urgency-pulse" aria-hidden="true" />
                <Timer className="bf-cruises__form-urgency-icon" aria-hidden="true" />
                <span className="bf-cruises__form-urgency-label">
                  {countdown.ended
                    ? t('blackFridayCruises.formUrgencyEnded')
                    : t('blackFridayCruises.formUrgencyLive')}
                </span>
                {!countdown.ended && (
                  <span className="bf-cruises__form-urgency-clock">
                    {padTime(countdown.days)}d {padTime(countdown.hours)}h {padTime(countdown.minutes)}m{' '}
                    {padTime(countdown.seconds)}s
                  </span>
                )}
              </div>

              <ul className="bf-cruises__form-points">
                {[
                  { key: 'badge', Icon: Percent, tone: 'crimson' },
                  { key: 'deposit', Icon: Wallet, tone: 'gold' },
                  { key: 'validUntil', Icon: CalendarDays, tone: 'ocean' },
                ].map(({ key, Icon, tone }) => (
                  <li key={key} className={`bf-cruises__form-point bf-cruises__form-point--${tone}`}>
                    <span className="bf-cruises__form-point-icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <span>{t(`blackFridayCruises.${key}`)}</span>
                  </li>
                ))}
              </ul>

              <p className="bf-cruises__form-assurance">{t('blackFridayCruises.formAssurance')}</p>
            </motion.div>

            <motion.form
              className="bf-cruises__form"
              onSubmit={handleSubmit}
              noValidate
              initial={{ opacity: 0, y: reduceMotion ? 0 : 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7, ease: MOTION_EASE, delay: reduceMotion ? 0 : 0.08 }}
            >
              <div className="bf-cruises__form-card-head">
                <p className="bf-cruises__form-card-kicker">{t('blackFridayCruises.partner')}</p>
                <p className="bf-cruises__form-card-trust">{t('blackFridayCruises.formTrust')}</p>
              </div>

              <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />

              <div className="bf-cruises__form-row">
                <label className="bf-cruises__field">
                  <span>
                    {t('blackFridayCruises.firstName')} <span className="bf-cruises__required">*</span>
                  </span>
                  <input
                    type="text"
                    name="firstName"
                    autoComplete="given-name"
                    placeholder={t('blackFridayCruises.firstNamePlaceholder')}
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label className="bf-cruises__field">
                  <span>
                    {t('blackFridayCruises.surname')} <span className="bf-cruises__required">*</span>
                  </span>
                  <input
                    type="text"
                    name="surname"
                    autoComplete="family-name"
                    placeholder={t('blackFridayCruises.surnamePlaceholder')}
                    value={formData.surname}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <label className="bf-cruises__field">
                <span>
                  {t('blackFridayCruises.email')} <span className="bf-cruises__required">*</span>
                </span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder={t('blackFridayCruises.emailPlaceholder')}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="bf-cruises__field">
                <span>
                  {t('blackFridayCruises.phone')} <span className="bf-cruises__required">*</span>
                </span>
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  placeholder={t('blackFridayCruises.phonePlaceholder')}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </label>

              {status && (
                <div
                  className={`bf-cruises__toast bf-cruises__toast--${status.type}`}
                  role="alert"
                >
                  {status.message}
                </div>
              )}

              <TurnstileWidget
                ref={turnstileRef}
                theme="light"
                onTokenChange={setTurnstileToken}
              />

              <motion.button
                type="submit"
                className="bf-cruises__cta bf-cruises__cta--submit"
                disabled={sending}
                whileHover={
                  sending || reduceMotion
                    ? undefined
                    : { y: -2, scale: 1.015 }
                }
                whileTap={
                  sending || reduceMotion
                    ? undefined
                    : { scale: 0.985, y: 0 }
                }
                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              >
                <span className="bf-cruises__cta-submit-glow" aria-hidden="true" />
                <span className="bf-cruises__cta-submit-sheen" aria-hidden="true" />
                <span className="bf-cruises__cta-shine bf-cruises__cta-shine--submit" aria-hidden="true" />
                <span className="bf-cruises__cta-label">
                  {sending ? (
                    <span className="bf-cruises__cta-sending">
                      <span className="bf-cruises__cta-spinner" aria-hidden="true" />
                      {t('blackFridayCruises.sending')}
                    </span>
                  ) : (
                    t('blackFridayCruises.submit')
                  )}
                </span>
                {!sending && (
                  <span className="bf-cruises__cta-arrow bf-cruises__cta-arrow--submit" aria-hidden="true">
                    <ArrowRight className="bf-cruises__cta-icon" />
                  </span>
                )}
              </motion.button>
            </motion.form>
          </div>
        </section>

        <section className="bf-cruises__msc-gallery" aria-labelledby="bf-msc-gallery-title">
          <div className="bf-cruises__msc-gallery-glow" aria-hidden="true" />
          <div className="bf-cruises__container">
            <motion.div
              className="bf-cruises__msc-gallery-head"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, ease: MOTION_EASE }}
            >
              <p className="bf-cruises__eyebrow bf-cruises__eyebrow--msc">
                {t('blackFridayCruises.partner')}
              </p>
              <h2 id="bf-msc-gallery-title" className="bf-cruises__section-title bf-cruises__msc-gallery-title">
                {t('blackFridayCruises.mscGalleryTitle')}
              </h2>
              <p className="bf-cruises__msc-gallery-subtitle">
                {t('blackFridayCruises.mscGallerySubtitle')}
              </p>
            </motion.div>

            <div className="bf-cruises__msc-mosaic">
              {MSC_GALLERY.map((item, index) => (
                <motion.figure
                  key={item.src}
                  className={`bf-cruises__msc-tile bf-cruises__msc-tile--${item.size} bf-cruises__msc-tile--${index + 1}`}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 28, scale: reduceMotion ? 1 : 0.985 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.7,
                    delay: reduceMotion ? 0 : Math.min(index * 0.05, 0.4),
                    ease: MOTION_EASE,
                  }}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          y: -4,
                          transition: { type: 'spring', stiffness: 380, damping: 24 },
                        }
                  }
                >
                  <img
                    src={item.src}
                    alt={t(`blackFridayCruises.${item.captionKey}`)}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="bf-cruises__msc-tile-frame" aria-hidden="true" />
                  <figcaption className="bf-cruises__msc-tile-caption">
                    <span className="bf-cruises__msc-tile-index">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="bf-cruises__msc-tile-label">
                      {t(`blackFridayCruises.${item.captionKey}`)}
                    </span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default BlackFridayCruises
