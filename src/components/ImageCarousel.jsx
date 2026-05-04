import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './ImageCarousel.css'

function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(null)
  const navigate = useNavigate()

  const slides = [
    {
      id: 0,
      image: '/images/destinations/tour-packages-travel-view.webp',
      title: 'Welcome to Honeywell Travel',
      subtitle: '#Live the Experience',
      location: 'Worldwide'
    },
    {
      id: 1,
      image: '/images/destinations/northern-lights.webp',
      title: 'Northern Lights Adventure',
      subtitle: 'Experience the magical Aurora Borealis in pristine wilderness',
      location: 'Iceland & Norway'
    },
    {
      id: 2,
      image: '/images/destinations/mountain.webp',
      title: 'Mountain Escapes',
      subtitle: 'Discover breathtaking landscapes and natural wonders',
      location: 'Mountain Destinations'
    },
    {
      id: 3,
      image: '/images/destinations/cliftonbay.webp',
      title: 'Coastal Paradise',
      subtitle: 'Relax on pristine beaches with crystal-clear turquoise waters',
      location: 'Tropical Destinations'
    },
    {
      id: 4,
      image: '/images/destinations/amsterdam-hero.webp',
      title: 'Amsterdam & Beyond',
      subtitle: 'Canals, culture and city breaks in the heart of Europe',
      location: 'Netherlands & Europe'
    }
  ]

  // Keep the welcome slide longer as the primary first impression
  const getSlideDuration = (index) => (index === 0 ? 9000 : 7000)

  // Smoothly rotate slides with a crossfade transition
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
    <section className="hero-section" aria-label="Hero">
      {/* Media clipped here so the section never acts as a nested scroll/overscroll boundary */}
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
          Book Online
        </button>
      </div>
    </section>
  )
}

export default ImageCarousel
