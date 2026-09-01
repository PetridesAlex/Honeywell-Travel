import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import RevealOnScroll from '../components/RevealOnScroll'
import SEO from '../components/SEO'
import { travelPackages } from '../data/packages'
import './Gallery.css'

/** Original destination images shown in the gallery from the start. */
const ORIGINAL_DESTINATIONS = [
  { id: 'orig-iceland', src: '/images/destinations/iceland.webp', title: 'Iceland' },
  { id: 'orig-thailand', src: '/images/destinations/thailand.webp', title: 'Thailand' },
  { id: 'orig-australia', src: '/images/destinations/australia.webp', title: 'Australia' },
  { id: 'orig-south-africa', src: '/images/destinations/capetown.webp', title: 'South Africa' },
  { id: 'orig-dubai', src: '/images/destinations/dubai.webp', title: 'Dubai' },
  { id: 'orig-brazil', src: '/images/destinations/brazil.webp', title: 'Brazil' },
  { id: 'orig-canada', src: '/images/destinations/canada.webp', title: 'Canada' },
  { id: 'orig-japan', src: '/images/destinations/japan.webp', title: 'Japan' },
  { id: 'orig-maldives', src: '/images/destinations/maldives.webp', title: 'Maldives' },
  { id: 'orig-netherlands', src: '/images/destinations/netherlands.webp', title: 'Netherlands' },
  { id: 'orig-usa', src: '/images/destinations/usa.webp', title: 'United States' }
]

/** True if the image path looks like a place/destination, not a hotel or room. */
function isPlaceImage(src) {
  if (!src || typeof src !== 'string') return false
  const path = src.toLowerCase()
  if (path.includes('/hotels/') || path.includes('/hotel/')) return false
  if (path.includes('-hotel') || path.includes('hotel-') || path.includes('_hotel')) return false
  if (path.includes('aparthotel') || path.includes('apart-hotel')) return false
  return true
}

const MAX_PACKAGE_ITEMS = 12

/** Regions already covered by ORIGINAL_DESTINATIONS (avoid duplicate tiles). */
const ORIGINAL_TITLES = new Set(
  ORIGINAL_DESTINATIONS.map((d) => d.title.trim().toLowerCase())
)

/** One tile per region/country from packages, then merge with original destinations. */
function useGalleryFromPackages() {
  return useMemo(() => {
    const fromPackages = []
    const seenRegions = new Set(ORIGINAL_TITLES)
    for (const pkg of travelPackages) {
      if (fromPackages.length >= MAX_PACKAGE_ITEMS) break
      const details = pkg.details
      if (!details) continue
      const region = (pkg.destination || '').trim()
      const regionKey = region.toLowerCase()
      if (!regionKey || seenRegions.has(regionKey)) continue
      const candidates = [
        details.coverImage,
        details.thumbnailImage,
        ...(Array.isArray(details.gallery) ? details.gallery : [])
      ].filter(Boolean).filter(isPlaceImage)
      const src = candidates[0]
      if (!src) continue
      seenRegions.add(regionKey)
      const normalizedSrc = src.startsWith('/') ? src : `/${src}`
      fromPackages.push({ id: regionKey, src: normalizedSrc, title: region })
    }
    return [...ORIGINAL_DESTINATIONS, ...fromPackages]
  }, [])
}

function Gallery() {
  const { t } = useTranslation()
  const galleryItems = useGalleryFromPackages()

  return (
    <div className="gallery-page">
      <SEO
        title="Travel Gallery | Honeywell Travel"
        description="Explore stunning destination photos from Honeywell Travel holidays and experiences."
        keywords="travel gallery, holiday photos, destinations honeywell travel"
        url="https://www.honeywelltravel.com.cy/honeywell-travel-gallery"
      />
      <RevealOnScroll direction="up">
      <div className="gallery-container">
        <h1>{t('gallery.title')}</h1>
        <p className="gallery-subtitle">{t('gallery.subtitle')}</p>
        <div className="gallery-grid">
          {galleryItems.map((item) => (
            <div key={item.id} className="gallery-item">
              <img 
                src={item.src} 
                alt={item.title}
                className="gallery-image"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none'
                  const placeholder = e.target.nextElementSibling
                  if (placeholder) {
                    placeholder.style.display = 'flex'
                  }
                }}
              />
              <div className="gallery-placeholder" style={{ display: 'none' }}>
                <span>📸</span>
                <p>{item.title}</p>
              </div>
              <div className="gallery-overlay">
                <h3>{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
      </RevealOnScroll>
    </div>
  )
}

export default Gallery






