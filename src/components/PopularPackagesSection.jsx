import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getPackagesByCategory } from '../data/packages'
import { packageCardImageUrl } from '../utils/packageCardImage'
import { getEnglishPackageTitle } from '../utils/packageTranslations'
import ModalCards from './ModalCards'
import './PopularPackagesSection.css'

const popularCategories = [
  { value: 'Summer Packages', label: 'Summer Packages' },
  { value: 'Easter Packages', label: 'Easter Packages' },
  { value: 'Music & Sports', label: 'Music & Sports' },
  { value: 'Exotic Packages', label: 'Exotic Packages' }
]

const PACKAGE_ROTATION_MS = 8000
const CATEGORY_ROTATION_MS = 14000
const VISIBLE_PACKAGES_COUNT = 6

const categoryToSlug = (category) =>
  category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and').replace(/[^a-z0-9-]/g, '')

function getLeadPrice(pkg) {
  if (pkg.details?.hotels?.length) {
    let lowestDouble = Infinity
    for (const hotel of pkg.details.hotels) {
      const price = hotel?.prices?.double
      if (typeof price === 'number' && price > 0 && price < lowestDouble) {
        lowestDouble = price
      }
    }
    if (lowestDouble !== Infinity) return lowestDouble
  }
  return typeof pkg.price === 'number' ? pkg.price : Number.MAX_SAFE_INTEGER
}

function PopularPackagesSection() {
  const { i18n } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState(popularCategories[0].value)
  const [rotationIndex, setRotationIndex] = useState(0)

  const allPackagesForCategory = useMemo(() => {
    return getPackagesByCategory(selectedCategory)
      .slice()
      .sort((a, b) => getLeadPrice(a) - getLeadPrice(b))
  }, [selectedCategory])

  useEffect(() => {
    setRotationIndex(0)
  }, [selectedCategory])

  useEffect(() => {
    if (allPackagesForCategory.length <= VISIBLE_PACKAGES_COUNT) return
    const interval = setInterval(() => {
      setRotationIndex((prev) => (prev + 1) % allPackagesForCategory.length)
    }, PACKAGE_ROTATION_MS)
    return () => clearInterval(interval)
  }, [allPackagesForCategory])

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedCategory((prev) => {
        const currentIndex = popularCategories.findIndex((cat) => cat.value === prev)
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % popularCategories.length
        return popularCategories[nextIndex].value
      })
    }, CATEGORY_ROTATION_MS)
    return () => clearInterval(interval)
  }, [])

  const packagesForCategory = useMemo(() => {
    if (allPackagesForCategory.length <= VISIBLE_PACKAGES_COUNT) return allPackagesForCategory
    const visible = []
    for (let i = 0; i < VISIBLE_PACKAGES_COUNT; i += 1) {
      visible.push(allPackagesForCategory[(rotationIndex + i) % allPackagesForCategory.length])
    }
    return visible
  }, [allPackagesForCategory, rotationIndex])

  const modalCards = useMemo(
    () =>
      packagesForCategory.map((pkg) => {
        const englishTitle = getEnglishPackageTitle(pkg.id, pkg.title, pkg.destination, i18n)
        const hasAlternateTitle = Boolean(englishTitle && englishTitle.trim() !== pkg.title.trim())
        const imageUrl = packageCardImageUrl(pkg)
        const isGroup = (pkg.packageType || 'individual') === 'group'

        return {
          id: String(pkg.id),
          imageUrl,
          title: pkg.title,
          secondaryTitle: hasAlternateTitle ? englishTitle : '',
          description: pkg.description,
          gradientColor: isGroup ? '#0d5c2e' : '#c41230',
          destination: pkg.destination,
          category: pkg.category,
          duration: pkg.duration,
          supplier: pkg.supplier || '',
          packageType: isGroup ? 'group' : 'individual',
          price: getLeadPrice(pkg),
          link: `/packages/${pkg.id}/details`
        }
      }),
    [packagesForCategory, i18n]
  )

  return (
    <section className="popular-packages-section" aria-label="Popular packages">
      <div className="popular-packages-container">
        <div className="popular-category-chips" role="tablist" aria-label="Popular package categories">
          {popularCategories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              className={`popular-category-chip${selectedCategory === cat.value ? ' active' : ''}`}
              onClick={() => {
                setSelectedCategory(cat.value)
                setRotationIndex(0)
              }}
              role="tab"
              aria-selected={selectedCategory === cat.value}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <ModalCards
          cards={modalCards}
          className="popular-packages-modal-cards"
          animationSpeed="normal"
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
