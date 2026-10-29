import { useState, useEffect, useLayoutEffect, useMemo } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getVisiblePackages } from '../data/packages'
import { loadMergedPackages, subscribePackagesCatalogRefresh } from '../lib/packagesCatalog'
import ModalCards from '../components/ModalCards'
import { mapPackagesToModalCards } from '../utils/modalCardFromPackage'
import { sortPackagesByLeadPriceAsc } from '../utils/packageLeadPrice'
import SEO from '../components/SEO'
import { getCategoryLabel } from '../utils/categoryI18n'
import './Packages.css'

// Helper function to convert slug back to category name
const slugToCategory = (slug) => {
  const slugCategoryMap = {
    'destinations': 'Destinations',
    'summer-packages': 'Summer Packages',
    'summer-packages-to-greece': 'Summer Packages to Greece',
    'autumn-packages': 'Autumn Packages',
    'winter-packages': 'Winter Packages',
    'spring-packages': 'Spring Packages',
    'christmas-packages': 'Christmas Packages',
    'christmas-markets': 'Christmas Markets',
    'easter-packages': 'Easter Packages',
    'green-monday-packages': 'Green Monday Packages',
    'cruises': 'Cruises',
    'city-breaks': 'City Breaks',
    'exotic-packages': 'Exotic Packages',
    'mary-specials-trips': 'Mary Special Trips',
    'build-your-trip': 'Build Your Trip',
    'green-monday': 'Green Monday',
    'group-travel': 'Group Travel',
    'mary-special-trips': 'Mary Special Trips',
    'music-sports': 'Music & Sports',
    'music-and-sports': 'Music & Sports',
    'sports-events-concerts': 'Sports Events & Concerts',
    'sports-events-and-concerts': 'Sports Events & Concerts',
    'ski-packages': 'Ski Packages',
    'exotic-destinations': 'Exotic Destinations'
  }
  return slugCategoryMap[slug] || null
}

function Packages() {
  const { t, i18n } = useTranslation()
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const [catalog, setCatalog] = useState(() => getVisiblePackages())

  const getInitialCategory = () => {
    if (slug) {
      const categoryFromSlug = slugToCategory(slug.replace(/\/$/, ''))
      if (categoryFromSlug) return categoryFromSlug
    }
    return searchParams.get('category') || 'Any'
  }

  const [category, setCategory] = useState(getInitialCategory())

  useLayoutEffect(() => {
    if (!slug) return undefined

    const resetTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      if (document.scrollingElement) document.scrollingElement.scrollTop = 0
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    resetTop()
    const rafId = requestAnimationFrame(resetTop)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [slug])

  useEffect(() => {
    let cancelled = false

    const refresh = (force = true) => {
      loadMergedPackages({ force }).then((packages) => {
        if (!cancelled) setCatalog(packages)
      })
    }

    refresh(true)
    const unsubscribe = subscribePackagesCatalogRefresh(() => refresh(true))

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (slug) {
      const categoryFromSlug = slugToCategory(slug.replace(/\/$/, ''))
      if (categoryFromSlug) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCategory(categoryFromSlug)
      }
    } else {
      setCategory(searchParams.get('category') || 'Any')
    }
  }, [slug, searchParams])

  const filteredPackages = useMemo(() => {
    let filtered = catalog
    if (category !== 'Any') {
      filtered = filtered.filter((pkg) => pkg.category === category)
    }
    return sortPackagesByLeadPriceAsc(filtered)
  }, [catalog, category])

  const modalCards = useMemo(
    () => mapPackagesToModalCards(filteredPackages, i18n),
    [filteredPackages, i18n.language]
  )

  return (
    <div className="packages-page">
      <SEO
        title={t('packagesPage.seoTitle')}
        description={t('packagesPage.seoDescription')}
        keywords={t('packagesPage.seoKeywords')}
        url={slug ? `https://www.honeywelltravel.com.cy/tour-category/${slug.replace(/\/$/, '')}` : 'https://www.honeywelltravel.com.cy/packages'}
      />
      <div className="packages-hero">
        <div className="packages-hero-content">
          <p className="packages-hero-label">{t('packagesPage.title')}</p>
          <h1 className="packages-hero-title">{t('packagesPage.subtitle')}</h1>
          <p className="packages-hero-subtitle">{t('packagesPage.description')}</p>
        </div>
      </div>

      <div className="packages-container">
        <div className="packages-results" id="packages-results">
          <div className="results-header">
            <div className="results-title-block">
              <h2 className="results-title">
                <span className="results-title-category">
                  {category !== 'Any' ? getCategoryLabel(category, t) : t('packagesPage.allPackages')}
                </span>
                <span
                  className="results-title-count"
                  aria-label={
                    filteredPackages.length === 1
                      ? t('packagesPage.packageFound', { count: filteredPackages.length })
                      : t('packagesPage.packagesFound', { count: filteredPackages.length })
                  }
                >
                  {filteredPackages.length === 1
                    ? t('packagesPage.packageFound', { count: filteredPackages.length })
                    : t('packagesPage.packagesFound', { count: filteredPackages.length })}
                </span>
              </h2>
            </div>
          </div>

          {filteredPackages.length > 0 ? (
            <ModalCards cards={modalCards} className="packages-modal-cards" />
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>{t('packagesPage.noPackages')}</h3>
              <p>{t('packagesPage.adjustFilters')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Packages
