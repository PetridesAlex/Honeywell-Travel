import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getPackagesByCategory } from '../data/packages'
import { getPackageLeadPrice } from '../utils/packageLeadPrice'
import { mapPackagesToModalCards } from '../utils/modalCardFromPackage'
import { packageCardImageUrl } from '../utils/packageCardImage'
import ModalCards from './ModalCards'
import './PopularPackagesSection.css'

const popularCategories = [
  { value: 'Summer Packages', label: 'Summer Packages' },
  { value: 'Summer Packages to Greece', label: 'Summer Packages to Greece' },
  { value: 'Music & Sports', label: 'Music & Sports' },
  { value: 'Exotic Packages', label: 'Exotic Packages' }
]

const PRIORITY_IMAGE_COUNT = 6
const preloadedImageUrls = new Set()

const categoryToSlug = (category) =>
  category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and').replace(/[^a-z0-9-]/g, '')

function getLeadPrice(pkg) {
  const price = getPackageLeadPrice(pkg)
  return price > 0 ? price : Number.MAX_SAFE_INTEGER
}

function getSortedCategoryPackages(category) {
  return getPackagesByCategory(category)
    .slice()
    .sort((a, b) => getLeadPrice(a) - getLeadPrice(b))
}

function preloadPackageImages(packages, limit = PRIORITY_IMAGE_COUNT) {
  if (typeof window === 'undefined' || !Array.isArray(packages)) return

  packages.slice(0, limit).forEach((pkg) => {
    const url = packageCardImageUrl(pkg)
    if (!url || preloadedImageUrls.has(url)) return
    preloadedImageUrls.add(url)

    const img = new Image()
    img.decoding = 'async'
    img.src = url
  })
}

// Start downloading default Summer card images during module load (while preloader runs).
preloadPackageImages(getSortedCategoryPackages(popularCategories[0].value))

function PopularPackagesSection() {
  const { i18n } = useTranslation()
  const trackRef = useRef(null)
  const [selectedCategory, setSelectedCategory] = useState(popularCategories[0].value)

  const packagesForCategory = useMemo(
    () => getSortedCategoryPackages(selectedCategory),
    [selectedCategory]
  )

  const modalCards = useMemo(
    () => mapPackagesToModalCards(packagesForCategory, i18n),
    [packagesForCategory, i18n]
  )

  useEffect(() => {
    preloadPackageImages(packagesForCategory)
  }, [packagesForCategory])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: 0, behavior: 'auto' })
  }, [selectedCategory])

  const selectCategory = (category) => {
    setSelectedCategory(category)
  }

  const scrollByCard = useCallback((direction = 1) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('.modal-card')
    if (!card) return

    const styles = getComputedStyle(track)
    const gap =
      Number.parseFloat(styles.columnGap || styles.gap) ||
      Number.parseFloat(getComputedStyle(track.querySelector('.modal-cards-grid') || track).gap) ||
      24
    const step = card.offsetWidth + gap
    const maxScroll = track.scrollWidth - track.clientWidth

    if (direction > 0 && track.scrollLeft >= maxScroll - 4) {
      track.scrollTo({ left: 0, behavior: 'smooth' })
      return
    }

    if (direction < 0 && track.scrollLeft <= 4) {
      track.scrollTo({ left: maxScroll, behavior: 'smooth' })
      return
    }

    track.scrollBy({ left: direction * step, behavior: 'smooth' })
  }, [])

  return (
    <section className="popular-packages-section" aria-label="Popular packages">
      <div className="popular-packages-container">
        <div className="popular-packages-toolbar">
          <div className="popular-category-chips" role="tablist" aria-label="Popular package categories">
            {popularCategories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                className={`popular-category-chip${selectedCategory === cat.value ? ' active' : ''}`}
                onClick={() => selectCategory(cat.value)}
                role="tab"
                aria-selected={selectedCategory === cat.value}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {packagesForCategory.length > 1 ? (
            <div className="popular-packages-nav" aria-label="Browse popular packages">
              <button
                type="button"
                className="popular-packages-nav__btn"
                onClick={() => scrollByCard(-1)}
                aria-label="Previous packages"
              >
                ←
              </button>
              <button
                type="button"
                className="popular-packages-nav__btn"
                onClick={() => scrollByCard(1)}
                aria-label="Next packages"
              >
                →
              </button>
            </div>
          ) : null}
        </div>

        {packagesForCategory.length === 0 ? (
          <p className="popular-packages-empty">No packages available in this category right now.</p>
        ) : (
          <div className="popular-packages-scroll-shell">
            <div className="popular-packages-fade popular-packages-fade--left" aria-hidden="true" />
            <div className="popular-packages-fade popular-packages-fade--right" aria-hidden="true" />
            <div ref={trackRef} className="popular-packages-track">
              <ModalCards
                cards={modalCards}
                className="popular-packages-modal-cards"
                animationSpeed="none"
                showCloseButton={false}
                priorityImageCount={PRIORITY_IMAGE_COUNT}
              />
            </div>
          </div>
        )}

        <div className="popular-packages-actions">
          <Link to={`/tour-category/${categoryToSlug(selectedCategory)}/`} className="popular-packages-link">
            View all {selectedCategory}
          </Link>
          <Link to="/packages" className="popular-packages-link secondary">
            Browse all packages
          </Link>
        </div>
      </div>
    </section>
  )
}

export default PopularPackagesSection
