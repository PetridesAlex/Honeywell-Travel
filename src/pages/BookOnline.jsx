import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SEO from '../components/SEO'
import { loadMergedPackages, subscribePackagesCatalogRefresh } from '../lib/packagesCatalog'
import { getCategoryLabel } from '../utils/categoryI18n'
import { localizePackage } from '../utils/packageTranslations'
import { translatePackageDuration } from '../utils/packageTitleI18n'
import './BookOnline.css'

const PACKAGE_TYPE_KEYS = {
  'Any Type': 'anyType',
  'Group Tour': 'groupTour',
  'Private Tour': 'privateTour',
  'Self-Guided': 'selfGuided',
  'Adventure': 'adventure',
  'Relaxation': 'relaxation',
  'Family Friendly': 'familyFriendly',
  'Luxury': 'luxury',
}

function BookOnline() {
  const { t, i18n } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedType, setSelectedType] = useState('Any Type')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [catalog, setCatalog] = useState([])
  const resultsRef = useRef(null)

  const getPackageTypeLabel = (type) => {
    const key = PACKAGE_TYPE_KEYS[type]
    return key ? t(`bookOnline.types.${key}`) : type
  }

  // Check if any filters are active
  const hasActiveFilters = selectedCategory || selectedType !== 'Any Type' || startDate || endDate

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

  const categories = [
    'Destinations',
    'Summer Packages',
    'Summer Packages to Greece',
    'Autumn Packages',
    'Winter Packages',
    'Christmas Packages',
    'Easter Packages',
    'Green Monday',
    'Cruises',
    'City Breaks',
    'Exotic Packages',
    'Music & Sports',
    'Mary Special Trips'
  ]

  const packageTypes = Object.keys(PACKAGE_TYPE_KEYS)

  // Filter packages based on selections (exclude hidden via CMS merge)
  const filteredPackages = useMemo(() => {
    return catalog.filter((pkg) => {
      let matches = true

      if (selectedCategory && selectedCategory !== '') {
        if (pkg.category !== selectedCategory) {
          matches = false
        }
      }

      if (selectedType && selectedType !== 'Any Type' && selectedType !== '') {
        if (pkg.type && pkg.type !== selectedType) {
          matches = false
        }
      }

      if ((startDate && startDate !== '') || (endDate && endDate !== '')) {
        if (pkg.details?.departureDate) {
          const pkgDates = pkg.details.departureDate
          const dateStrings = pkgDates.split(',').map((d) => d.trim())
          const currentYear = new Date().getFullYear()

          const departureDates = dateStrings
            .map((dateStr) => {
              const [day, month] = dateStr.split('/').map((num) => parseInt(num, 10))
              return new Date(currentYear, month - 1, day)
            })
            .filter((date) => !isNaN(date.getTime()))

          if (departureDates.length === 0) {
            matches = false
          } else {
            const hasMatchingDate = departureDates.some((packageDate) => {
              let dateMatches = true

              if (startDate) {
                const selectedStartDate = new Date(startDate)
                if (packageDate < selectedStartDate) {
                  dateMatches = false
                }
              }

              if (endDate) {
                const selectedEndDate = new Date(endDate)
                if (packageDate > selectedEndDate) {
                  dateMatches = false
                }
              }

              return dateMatches
            })

            if (!hasMatchingDate) {
              matches = false
            }
          }
        } else {
          matches = false
        }
      }

      return matches
    })
  }, [catalog, selectedCategory, selectedType, startDate, endDate])

  // Auto-scroll to results when filters change and there are active filters
  useEffect(() => {
    if (hasActiveFilters && resultsRef.current) {
      // Small delay to allow render
      const timer = setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [selectedCategory, selectedType, startDate, endDate, hasActiveFilters])

  const handleSearch = (e) => {
    e.preventDefault()
    // Scroll to results
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleClearFilters = () => {
    setSelectedCategory('')
    setSelectedType('Any Type')
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="book-online-page">
      <SEO
        title={t('bookOnline.seoTitle')}
        description={t('bookOnline.seoDescription')}
        keywords={t('bookOnline.seoKeywords')}
        url="https://www.honeywelltravel.com.cy/book-online"
      />
      <video
        className="book-online-bg-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/videos/0_Paris_Eiffel_Tower_3840x2160.webm" type="video/webm" />
      </video>
      <div className="book-online-overlay" />

      <div className="book-online-content">
        <section className="booking-hero-filters">
          <div className="container">
            <div className="hero-content">
              <h1>{t('bookOnline.title')}</h1>
              <p>{t('bookOnline.subtitle')}</p>
            </div>
            <form className="booking-form" onSubmit={handleSearch}>
              <div className="filter-row">
                <div className="filter-group">
                  <label htmlFor="category">{t('bookOnline.travelCategory')}</label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">{t('bookOnline.allCategories')}</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {getCategoryLabel(cat, t)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="type">{t('bookOnline.packageType')}</label>
                  <select
                    id="type"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    {packageTypes.map((type) => (
                      <option key={type} value={type}>
                        {getPackageTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="start-date">{t('bookOnline.travelFrom')}</label>
                  <input
                    type="date"
                    id="start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="end-date">{t('bookOnline.travelTo')}</label>
                  <input
                    type="date"
                    id="end-date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="form-actions">
                  <button type="submit" className="search-btn">
                    {t('bookOnline.viewResults')}
                  </button>
                  <button 
                    type="button" 
                    className="clear-btn"
                    onClick={handleClearFilters}
                  >
                    {t('common.clearFilters')}
                  </button>
                </div>
              )}
            </form>
          </div>
        </section>

        {hasActiveFilters && (
          <section className="packages-results" ref={resultsRef}>
            <div className="container">
              <div className="results-header">
                <h2 className="results-title">
                  {filteredPackages.length === 1
                    ? t('bookOnline.packageFound', { count: filteredPackages.length })
                    : t('bookOnline.packagesFound', { count: filteredPackages.length })}
                </h2>
                <div className="active-filters">
                  {selectedCategory && (
                    <span className="filter-tag">
                      {t('bookOnline.categoryLabel')} {getCategoryLabel(selectedCategory, t)}
                    </span>
                  )}
                  {selectedType && selectedType !== 'Any Type' && (
                    <span className="filter-tag">
                      {t('bookOnline.typeLabel')} {getPackageTypeLabel(selectedType)}
                    </span>
                  )}
                  {startDate && (
                    <span className="filter-tag">
                      {t('bookOnline.fromLabel')} {new Date(startDate).toLocaleDateString()}
                    </span>
                  )}
                  {endDate && (
                    <span className="filter-tag">
                      {t('bookOnline.toLabel')} {new Date(endDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {filteredPackages.length === 0 ? (
                <div className="no-results">
                  <p>{t('bookOnline.noMatch')}</p>
                  <p>{t('bookOnline.tryAdjust')}</p>
                </div>
              ) : (
                <div className="packages-grid">
                  {filteredPackages.map((pkg) => {
                    const localized = localizePackage(pkg, i18n)
                    const imageUrl = pkg.details?.thumbnailImage || pkg.details?.coverImage || pkg.details?.gallery?.[0]
                    return (
                    <Link
                      key={pkg.id}
                    to={`/packages/${pkg.id}/details`}
                      className="package-card-link"
                      onClick={() => {
                        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
                        if (document.documentElement) document.documentElement.scrollTop = 0
                        if (document.body) document.body.scrollTop = 0
                        setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }), 0)
                      }}
                    >
                      <div className="package-card">
                        {imageUrl ? (
                          <div
                            className="package-image-thumb"
                            style={{ backgroundImage: `url(${imageUrl})` }}
                          />
                        ) : (
                          <div className="package-emoji">{pkg.image}</div>
                        )}
                        <div className="package-content">
                          <p className="package-category">{getCategoryLabel(pkg.category, t)}</p>
                          <h3 className="package-title">{localized.title}</h3>
                          <p className="package-destination">{pkg.destination}</p>
                          <div className="package-footer">
                            <span className="package-duration">
                              {translatePackageDuration(pkg.duration, i18n.language)}
                            </span>
                            <span className="package-price">€{pkg.price}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )})}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default BookOnline
