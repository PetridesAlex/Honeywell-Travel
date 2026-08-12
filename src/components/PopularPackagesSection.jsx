import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getPackagesByCategory } from '../data/packages'
import { getPackageLeadPrice } from '../utils/packageLeadPrice'
import { mapPackagesToModalCards } from '../utils/modalCardFromPackage'
import ModalCards from './ModalCards'
import { useMobileLite } from '../hooks/useMobileLite'
import './PopularPackagesSection.css'

const popularCategories = [
  { value: 'Summer Packages', label: 'Summer Packages' },
  { value: 'Summer Packages to Greece', label: 'Summer Packages to Greece' },
  { value: 'Music & Sports', label: 'Music & Sports' },
  { value: 'Exotic Packages', label: 'Exotic Packages' }
]

const VISIBLE_PACKAGES_COUNT = 6

const categoryToSlug = (category) =>
  category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and').replace(/[^a-z0-9-]/g, '')

function getLeadPrice(pkg) {
  const price = getPackageLeadPrice(pkg)
  return price > 0 ? price : Number.MAX_SAFE_INTEGER
}

function PopularPackagesSection() {
  const { i18n } = useTranslation()
  const isMobileLite = useMobileLite()
  const [selectedCategory, setSelectedCategory] = useState(popularCategories[0].value)
  const [pageIndex, setPageIndex] = useState(0)

  const allPackagesForCategory = useMemo(() => {
    return getPackagesByCategory(selectedCategory)
      .slice()
      .sort((a, b) => getLeadPrice(a) - getLeadPrice(b))
  }, [selectedCategory])

  const totalPages = Math.max(1, Math.ceil(allPackagesForCategory.length / VISIBLE_PACKAGES_COUNT))
  const safePageIndex = Math.min(pageIndex, totalPages - 1)
  const canGoPrev = totalPages > 1
  const canGoNext = totalPages > 1

  const packagesForCategory = useMemo(() => {
    const start = safePageIndex * VISIBLE_PACKAGES_COUNT
    return allPackagesForCategory.slice(start, start + VISIBLE_PACKAGES_COUNT)
  }, [allPackagesForCategory, safePageIndex])

  const modalCards = useMemo(
    () => mapPackagesToModalCards(packagesForCategory, i18n),
    [packagesForCategory, i18n]
  )

  const selectCategory = (category) => {
    setSelectedCategory(category)
    setPageIndex(0)
  }

  const goPrev = () => {
    setPageIndex((prev) => (prev - 1 + totalPages) % totalPages)
  }

  const goNext = () => {
    setPageIndex((prev) => (prev + 1) % totalPages)
  }

  return (
    <section className="popular-packages-section" aria-label="Popular packages">
      <div className="popular-packages-container">
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

        {totalPages > 1 ? (
          <div className="popular-packages-nav" aria-label="Browse popular packages">
            <button
              type="button"
              className="popular-packages-nav__btn"
              onClick={goPrev}
              disabled={!canGoPrev}
              aria-label="Previous packages"
            >
              ←
            </button>
            <span className="popular-packages-nav__status">
              {safePageIndex + 1} / {totalPages}
            </span>
            <button
              type="button"
              className="popular-packages-nav__btn"
              onClick={goNext}
              disabled={!canGoNext}
              aria-label="Next packages"
            >
              →
            </button>
          </div>
        ) : null}

        <ModalCards
          cards={modalCards}
          className="popular-packages-modal-cards"
          animationSpeed={isMobileLite ? 'none' : 'normal'}
          showCloseButton={false}
        />

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
