import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ParallaxCards from './ParallaxCards'
import { useMobileLite } from '../hooks/useMobileLite'
import './CircularGallery.css'

function CircularGallery() {
  const { t } = useTranslation()
  const headerRef = useRef(null)
  const [headerVisible, setHeaderVisible] = useState(false)
  const isMobileLite = useMobileLite()

  useEffect(() => {
    const node = headerRef.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const images = [
    { id: 1, src: '/images/destinations/iceland.webp', title: 'Iceland' },
    { id: 2, src: '/images/destinations/thailand.webp', title: 'Thailand' },
    { id: 3, src: '/images/destinations/australia.webp', title: 'Australia' },
    { id: 4, src: '/images/destinations/capetown.webp', title: 'South Africa' },
    { id: 5, src: '/images/destinations/dubai.webp', title: 'Dubai' },
    { id: 6, src: '/images/destinations/brazil.webp', title: 'Brazil' },
    { id: 7, src: '/images/destinations/canada.webp', title: 'Canada' },
    { id: 8, src: '/images/destinations/maldives.webp', title: 'Maldives' },
    { id: 9, src: '/images/destinations/japan.webp', title: 'Japan' },
    { id: 10, src: '/images/destinations/netherlands.webp', title: 'Netherlands' }
  ]

  return (
    <div className="circular-gallery">
      <div
        ref={headerRef}
        className={`circular-gallery-header${headerVisible ? ' circular-gallery-header--visible' : ''}`}
      >
        <div className="circular-gallery-topline">
          <span className="circular-gallery-topline__text">{t('home.circularGallery.topline')}</span>
        </div>
        <h2 className="circular-gallery-title">{t('home.circularGallery.title')}</h2>
        <p className="circular-gallery-subtitle">
          {isMobileLite
            ? t('home.circularGallery.subtitleMobile')
            : t('home.circularGallery.subtitleDesktop')}
        </p>
      </div>

      <ParallaxCards
        images={images}
        cardCount={10}
        perspective={2200}
        mouseSensitivity={3.8}
        animationDuration={1}
        enableDepthFog={false}
        enableMagneticAttraction
        magneticStrength={54}
      />
    </div>
  )
}

export default CircularGallery
