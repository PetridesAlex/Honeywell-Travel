import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './ImageCarousel.css'

const SLIDE_META = [
  { id: 0, image: '/images/destinations/tour-packages-travel-view.webp', key: 'slide1' },
  { id: 1, image: '/images/destinations/northern-lights.webp', key: 'slide2' },
  { id: 2, image: '/images/destinations/mountain.webp', key: 'slide3' },
  { id: 3, image: '/images/destinations/cliftonbay.webp', key: 'slide4' },
  { id: 4, image: '/images/destinations/amsterdam-hero.webp', key: 'slide5' },
]

function ImageCarousel() {
  const { t, i18n } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(null)
  const navigate = useNavigate()

  const slides = useMemo(
    () =>
      SLIDE_META.map((slide) => ({
        id: slide.id,
        image: slide.image,
        title: t(`home.heroCarousel.${slide.key}.title`),
        subtitle: t(`home.heroCarousel.${slide.key}.subtitle`),
        location: t(`home.heroCarousel.${slide.key}.location`),
      })),
    [t, i18n.language],
  )

  const getSlideDuration = (index) => (index === 0 ? 9000 : 7000)

  useEffect(() => {
    if (slides.length <= 1 || nextIndex !== null) return
    const timeout = setTimeout(() => {
      setNextIndex((currentIndex + 1) % slides.length)
    }, getSlideDuration(currentIndex))
    return () => clearTimeout(timeout)
  }, [currentIndex, nextIndex, slides.length])

  useEffect(() => {
    if (nextIndex === null) return
    const transitionTimeout = setTimeout(() => {
      setCurrentIndex(nextIndex)
      setNextIndex(null)
    }, 900)
    return () => clearTimeout(transitionTimeout)
  }, [nextIndex])

  const current = slides[currentIndex]
  const currentImage = current?.image ? `url(${current.image})` : null
  const incoming = nextIndex !== null ? slides[nextIndex] : current
  const incomingImage = incoming?.image ? `url(${incoming.image})` : null

  return (
    <section className="hero-section" aria-label={t('home.heroCarousel.ariaLabel')}>
      <div className="hero-section__media" aria-hidden="true">
        <div
          className="hero-bg-single hero-bg-base"
          style={{ backgroundImage: currentImage || undefined }}
        />
        <div
          className={`hero-bg-single hero-bg-fade${nextIndex !== null ? ' is-visible' : ''}`}
          style={{ backgroundImage: incomingImage || undefined }}
        />
        <div className="hero-overlay" />
      </div>
      <div className={`hero-content${currentIndex === 0 ? ' hero-content--welcome' : ''}`}>
        <div className="hero-text-wrap">
          <h2 className="hero-title">{current?.title}</h2>
          <p className="hero-subtitle">{current?.subtitle}</p>
        </div>
        <button
          type="button"
          className="hero-btn"
          onClick={() => navigate('/book-online')}
        >
          {t('header.bookOnline')}
        </button>
      </div>
    </section>
  )
}

export default ImageCarousel
