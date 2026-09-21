import { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getVisiblePackages, REGION_DESTINATIONS } from '../data/packages'
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

const CATEGORY_TILE_KEYS = {
  'Summer Packages': 'tileSummer',
  'Summer Packages to Greece': 'tileSummerGreece',
  'Autumn Packages': 'tileAutumn',
  'Winter Packages': 'tileWinter',
  'Spring Packages': 'tileSpring',
  'Christmas Packages': 'tileChristmas',
  'City Breaks': 'tileCity',
  Cruises: 'tileCruises',
  'Easter Packages': 'tileEaster',
  'Exotic Packages': 'tileExotic',
  'Green Monday': 'tileGreenMonday',
  'Group Travel': 'tileGroup',
  'Mary Special Trips': 'tileMary',
  'Music & Sports': 'tileMusic',
  'Sports Events & Concerts': 'tileSports',
  'Ski Packages': 'tileSki',
}

const CATEGORY_TILES = {
  'Summer Packages': {
    image: '/images/bali/bali-hero.webp',
  },
  'Summer Packages to Greece': {
    image: '/images/kerkyra-greece/corfu-cover-hero.webp',
  },
  'Autumn Packages': {
    image: '/images/Georgia/Georgia-hero.webp',
  },
  'Winter Packages': {
    image: '/images/lapland/lapland-cover-1.webp',
  },
  'Spring Packages': {
    image: '/images/Hraklio-crete/crete-cover-spring.webp',
  },
  'Christmas Packages': {
    image: '/images/christmas-packages/vienna/cover-vienna-christmas.webp',
  },
  'City Breaks': {
    image: '/images/barcelona-package/barcelona-cover-one.webp',
  },
  Cruises: {
    image: '/images/cruises/msc-world-europa/msc-world-europa-5.webp',
  },
  'Easter Packages': {
    image: '/images/easter-packages/kerkyra-easter-packages/kerkyra-easter-package-cover-hero.webp',
  },
  'Exotic Packages': {
    image: '/images/south-africa/south-africa-hero.webp',
  },
  'Green Monday': {
    image: '/images/Arachova/Arachova-cover.webp',
  },
  'Group Travel': {
    image: '/images/Balcans-countries/balcans-hero.webp',
  },
  'Mary Special Trips': {
    image: '/images/mary-special-trip/japan-2026/japan-6.webp',
  },
  'Music & Sports': {
    image: '/images/categories/music-events-travel-package-cover.webp',
  },
  'Sports Events & Concerts': {
    image: '/images/athens-marathon/athens-marathon-hero.webp',
  },
  'Ski Packages': {
    image: '/images/Arachova/arachova-town-.webp',
  },
}

const GALLERY_CATEGORIES = [
  'Summer Packages',
  'Summer Packages to Greece',
  'Autumn Packages',
  'Winter Packages',
  'Spring Packages',
  'Christmas Packages',
  'Christmas Markets',
  'City Breaks',
  'Cruises',
  'Easter Packages',
  'Exotic Packages',
  'Green Monday',
  'Group Travel',
  'Mary Special Trips',
  'Music & Sports',
  'Sports Events & Concerts',
  'Ski Packages'
]

function Packages() {
  const { t, i18n } = useTranslation()
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [catalog, setCatalog] = useState(() => getVisiblePackages())
  const [filteredPackages, setFilteredPackages] = useState(getVisiblePackages)

  // Determine category from slug or query param
  const getInitialCategory = () => {
    if (slug) {
      const categoryFromSlug = slugToCategory(slug.replace(/\/$/, '')) // Remove trailing slash
      if (categoryFromSlug) return categoryFromSlug
    }
    return searchParams.get('category') || 'Any'
  }

  const [category, setCategory] = useState(getInitialCategory())
  const [destination, setDestination] = useState(searchParams.get('destination') || 'Any')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [departureMonth, setDepartureMonth] = useState('Any')
  const [travelType, setTravelType] = useState('Any')
  const resultsRef = useRef(null)

  useLayoutEffect(() => {
    // Only snap to top when landing on a tour-category slug route.
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

  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(GALLERY_CATEGORIES.map((cat) => [cat, 0]))
    for (const pkg of catalog) {
      if (pkg.category && counts[pkg.category] != null) {
        counts[pkg.category] += 1
      }
    }
    return counts
  }, [catalog])

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

  // Update category when slug changes
  useEffect(() => {
    if (slug) {
      const categoryFromSlug = slugToCategory(slug.replace(/\/$/, ''))
      if (categoryFromSlug) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCategory(categoryFromSlug)
      }
    }
  }, [slug])

  useEffect(() => {
    let filtered = catalog

    if (category !== 'Any') {
      filtered = filtered.filter((pkg) => pkg.category === category)
    }

    if (destination !== 'Any') {
      const destinations = REGION_DESTINATIONS[destination] || [destination]
      filtered = filtered.filter((pkg) => destinations.includes(pkg.destination))
    }

    // Apply price filter
    if (minPrice || maxPrice) {
      filtered = filtered.filter(pkg => {
        const pkgPrice = pkg.details?.hotels?.[0]?.packagePrice || pkg.price || 0
        const min = minPrice ? parseFloat(minPrice) : 0
        const max = maxPrice ? parseFloat(maxPrice) : Infinity
        return pkgPrice >= min && pkgPrice <= max
      })
    }

    // Apply departure month filter
    if (departureMonth !== 'Any') {
      filtered = filtered.filter(pkg => {
        const month = pkg.details?.monthAvailability
        return month && month.toLowerCase() === departureMonth.toLowerCase()
      })
    }

    // Apply travel type filter
    if (travelType !== 'Any') {
      filtered = filtered.filter(pkg => {
        if (travelType === 'Group Travel') {
          return pkg.category === 'Group Travel'
        } else if (travelType === 'Individual Travel') {
          return pkg.category !== 'Group Travel'
        }
        return true
      })
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredPackages(sortPackagesByLeadPriceAsc(filtered))
  }, [catalog, category, destination, minPrice, maxPrice, departureMonth, travelType])

  const modalCards = useMemo(
    () => mapPackagesToModalCards(filteredPackages, i18n),
    [filteredPackages, i18n.language]
  )

  const applyFilters = (nextCategory, nextDestination) => {
    setCategory(nextCategory)
    setDestination(nextDestination)
    const params = {}
    if (nextCategory && nextCategory !== 'Any') params.category = nextCategory
    if (nextDestination && nextDestination !== 'Any') params.destination = nextDestination
    setSearchParams(params)
  }

  const scrollToResults = () => {
    const el = resultsRef.current
    if (!el) return

    const headerEl = document.querySelector('.header')
    const headerOffset = headerEl instanceof HTMLElement
      ? headerEl.getBoundingClientRect().height
      : Number.parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--header-height').trim(),
          10,
        ) || 100
    const top = el.getBoundingClientRect().top + window.pageYOffset - headerOffset - 16
    const preferSmooth = window.matchMedia('(min-width: 769px)').matches
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: Math.max(0, top), behavior: preferSmooth ? 'smooth' : 'auto' })
  }

  const selectCategory = (cat) => {
    applyFilters(cat, destination)
    // After filters paint, scroll to results (retry once for layout settle).
    requestAnimationFrame(() => {
      scrollToResults()
      window.setTimeout(scrollToResults, 120)
    })
  }

  const clearAllFilters = () => {
    setCategory('Any')
    setDestination('Any')
    setMinPrice('')
    setMaxPrice('')
    setDepartureMonth('Any')
    setTravelType('Any')
    applyFilters('Any', 'Any')
  }

  const hasActiveFilters = Boolean(
    category !== 'Any' ||
      destination !== 'Any' ||
      minPrice ||
      maxPrice ||
      departureMonth !== 'Any' ||
      travelType !== 'Any'
  )

  return (
    <div className="packages-page">
      <SEO
        title={t('packagesPage.seoTitle')}
        description={t('packagesPage.seoDescription')}
        keywords={t('packagesPage.seoKeywords')}
        url={slug ? `https://www.honeywelltravel.com.cy/tour-category/${slug.replace(/\/$/, '')}` : 'https://www.honeywelltravel.com.cy/packages'}
      />
      {/* Hero Section */}
      <div className="packages-hero">
        <div className="packages-hero-content">
          <p className="packages-hero-label">{t('packagesPage.title')}</p>
          <h1 className="packages-hero-title">{t('packagesPage.subtitle')}</h1>
          <p className="packages-hero-subtitle">{t('packagesPage.description')}</p>
        </div>
      </div>

      {/* Premium Filter Section */}
      <div className="filter-section">
        <div className="filter-container">
          <div className="filter-header">
            <h2 className="filter-title">{t('packagesPage.findYourPerfectTrip')}</h2>
            <p className="filter-subtitle">{t('packagesPage.filterDescription')}</p>
          </div>
          
          <div className="filters-panel">
            <section className="filters-row" aria-labelledby="filters-trip-heading">
              <div className="filters-row__heading">
                <h3 id="filters-trip-heading" className="filters-row__title">
                  {t('packagesPage.filterTripDetails')}
                </h3>
                <span className="filters-row__rule" aria-hidden="true" />
              </div>
              <div className="filters-grid filters-grid--trip">
                <div className="filter-group">
                  <label className="filter-label" htmlFor="filter-category">
                    <span className="filter-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M4 7.5h16M7 12h10M9.5 16.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </span>
                    {t('packagesPage.category')}
                  </label>
                  <select
                    id="filter-category"
                    className="filter-select"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value)
                      applyFilters(e.target.value, destination)
                      scrollToResults()
                    }}
                    spellCheck="false"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    data-gramm="false"
                    data-gramm_editor="false"
                    data-enable-grammarly="false"
                  >
                    <option value="Any">{t('packagesPage.allCategories')}</option>
                    {[...GALLERY_CATEGORIES]
                      .sort((a, b) => {
                        const countA = categoryCounts[a] || 0
                        const countB = categoryCounts[b] || 0
                        return countB - countA
                      })
                      .map((cat) => {
                        const count = categoryCounts[cat] || 0
                        return (
                          <option key={cat} value={cat}>
                            {getCategoryLabel(cat, t)} ({count})
                          </option>
                        )
                      })}
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label" htmlFor="filter-destination">
                    <span className="filter-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" stroke="currentColor" strokeWidth="1.8" />
                        <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                    </span>
                    {t('packagesPage.destination')}
                  </label>
                  <select
                    id="filter-destination"
                    className="filter-select"
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value)
                      applyFilters(category, e.target.value)
                      scrollToResults()
                    }}
                    spellCheck="false"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    data-gramm="false"
                    data-gramm_editor="false"
                    data-enable-grammarly="false"
                  >
                    <option value="Any">{t('packagesPage.allDestinations')}</option>
                    {Object.keys(REGION_DESTINATIONS).map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label" htmlFor="filter-month">
                    <span className="filter-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M8 3.5v3M16 3.5v3M3.5 10h17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </span>
                    {t('packagesPage.month')}
                  </label>
                  <select
                    id="filter-month"
                    className="filter-select"
                    value={departureMonth}
                    onChange={(e) => setDepartureMonth(e.target.value)}
                    spellCheck="false"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    data-gramm="false"
                    data-gramm_editor="false"
                    data-enable-grammarly="false"
                  >
                    <option value="Any">{t('packagesPage.anyMonth')}</option>
                    <option value="January">{t('months.january')}</option>
                    <option value="February">{t('months.february')}</option>
                    <option value="March">{t('months.march')}</option>
                    <option value="April">{t('months.april')}</option>
                    <option value="May">{t('months.may')}</option>
                    <option value="June">{t('months.june')}</option>
                    <option value="July">{t('months.july')}</option>
                    <option value="August">{t('months.august')}</option>
                    <option value="September">{t('months.september')}</option>
                    <option value="October">{t('months.october')}</option>
                    <option value="November">{t('months.november')}</option>
                    <option value="December">{t('months.december')}</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="filters-row" aria-labelledby="filters-budget-heading">
              <div className="filters-row__heading">
                <h3 id="filters-budget-heading" className="filters-row__title">
                  {t('packagesPage.filterBudgetStyle')}
                </h3>
                <span className="filters-row__rule" aria-hidden="true" />
              </div>
              <div className="filters-grid filters-grid--budget">
                <div className="filter-group filter-group-double">
                  <label className="filter-label" htmlFor="filter-min-price">
                    <span className="filter-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M7 7.5h7.5a3.25 3.25 0 0 1 0 6.5H9.5M9.5 14H15a3 3 0 0 1 0 6H7M12 4v16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {t('packagesPage.priceRange')}
                  </label>
                  <div className="filter-range-inputs">
                    <input
                      id="filter-min-price"
                      type="number"
                      className="filter-input"
                      placeholder={t('packagesPage.minPrice')}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      min="0"
                      spellCheck="false"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      data-gramm="false"
                      data-gramm_editor="false"
                      data-enable-grammarly="false"
                    />
                    <span className="filter-range-separator" aria-hidden="true">—</span>
                    <input
                      id="filter-max-price"
                      type="number"
                      className="filter-input"
                      placeholder={t('packagesPage.maxPrice')}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      min="0"
                      spellCheck="false"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      data-gramm="false"
                      data-gramm_editor="false"
                      data-enable-grammarly="false"
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label className="filter-label" htmlFor="filter-travel-type">
                    <span className="filter-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="9" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                        <circle cx="16" cy="9" r="2" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M4.5 18.5c.6-3 2.6-4.5 4.5-4.5s3.9 1.5 4.5 4.5M13 14.2c1.1-.5 2.4-.6 3.6.1 1.5.9 2.4 2.5 2.7 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </span>
                    {t('packagesPage.travelType')}
                  </label>
                  <select
                    id="filter-travel-type"
                    className="filter-select"
                    value={travelType}
                    onChange={(e) => setTravelType(e.target.value)}
                    spellCheck="false"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    data-gramm="false"
                    data-gramm_editor="false"
                    data-enable-grammarly="false"
                  >
                    <option value="Any">{t('packagesPage.anyType')}</option>
                    <option value="Group Travel">{t('packagesPage.groupTravel')}</option>
                    <option value="Individual Travel">{t('packagesPage.individualTravel')}</option>
                  </select>
                </div>
              </div>
            </section>
          </div>

          <div className="filter-toolbar">
            {hasActiveFilters ? (
              <div className="filter-toolbar__meta" aria-live="polite">
                <span className="filter-toolbar__status">
                  {filteredPackages.length === 1
                    ? t('packagesPage.packageFound', { count: filteredPackages.length })
                    : t('packagesPage.packagesFound', { count: filteredPackages.length })}
                </span>
              </div>
            ) : null}
            <button
              type="button"
              onClick={clearAllFilters}
              className={`filter-clear-all ${hasActiveFilters ? 'is-active' : ''}`}
              disabled={!hasActiveFilters}
              aria-disabled={!hasActiveFilters}
            >
              <span className="filter-clear-all__icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4.5 7.5h15M9.5 7.5V6.25A1.75 1.75 0 0 1 11.25 4.5h1.5A1.75 1.75 0 0 1 14.5 6.25V7.5m1.5 0V18.25A1.75 1.75 0 0 1 14.25 20H9.75A1.75 1.75 0 0 1 8 18.25V7.5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="filter-clear-all__label">{t('common.clearAll')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Separator */}
      <div className="packages-separator">
        <div className="separator-line"></div>
        <div className="separator-icon">✈️</div>
        <div className="separator-line"></div>
      </div>

      <div className="packages-container">
        {/* Results Section */}
        <div className="packages-results" id="packages-results" ref={resultsRef}>
          <div className="results-header">
            <div className="results-title-block">
              <h2 className="results-title">
                <span className="results-title-category">
                  {category !== 'Any' ? getCategoryLabel(category, t) : t('packagesPage.allPackages')}
                </span>
                <span className="results-title-count" aria-label={filteredPackages.length === 1 ? t('packagesPage.packageFound', { count: filteredPackages.length }) : t('packagesPage.packagesFound', { count: filteredPackages.length })}>
                  {filteredPackages.length === 1
                    ? t('packagesPage.packageFound', { count: filteredPackages.length })
                    : t('packagesPage.packagesFound', { count: filteredPackages.length })}
                </span>
              </h2>
            </div>
            {(category !== 'Any' || destination !== 'Any' || minPrice || maxPrice || departureMonth !== 'Any' || travelType !== 'Any') && (
              <div className="active-filters">
                {category !== 'Any' && (
                  <span className="active-filter-tag">
                    {getCategoryLabel(category, t)}
                    <button
                      onClick={() => {
                        setCategory('Any')
                        applyFilters('Any', destination)
                      }}
                      className="remove-filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                {destination !== 'Any' && (
                  <span className="active-filter-tag">
                    {destination}
                    <button
                      onClick={() => {
                        setDestination('Any')
                        applyFilters(category, 'Any')
                      }}
                      className="remove-filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                {travelType !== 'Any' && (
                  <span className="active-filter-tag">
                    {travelType === 'Group Travel'
                      ? t('packagesPage.groupTravel')
                      : t('packagesPage.individualTravel')}
                    <button
                      onClick={() => setTravelType('Any')}
                      className="remove-filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="active-filter-tag">
                    {t('packagesPage.priceFilter', { min: minPrice || '0', max: maxPrice || '∞' })}
                    <button
                      onClick={() => {
                        setMinPrice('')
                        setMaxPrice('')
                      }}
                      className="remove-filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                {departureMonth !== 'Any' && (
                  <span className="active-filter-tag">
                    {departureMonth}
                    <button
                      onClick={() => setDepartureMonth('Any')}
                      className="remove-filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="clear-all-filters"
                  aria-label={t('common.clearAll')}
                  title={t('common.clearAll')}
                >
                  <svg
                    className="clear-all-filters__icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M4.5 7.5h15M9.5 7.5V6.25A1.75 1.75 0 0 1 11.25 4.5h1.5A1.75 1.75 0 0 1 14.5 6.25V7.5m1.5 0V18.25A1.75 1.75 0 0 1 14.25 20H9.75A1.75 1.75 0 0 1 8 18.25V7.5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {filteredPackages.length > 0 ? (
            <ModalCards cards={modalCards} className="packages-modal-cards" />
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>{t('packagesPage.noPackages')}</h3>
              <p>{t('packagesPage.adjustFilters')}</p>
              <button onClick={clearAllFilters} className="reset-filters-btn">
                {t('common.resetFilters')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Packages
