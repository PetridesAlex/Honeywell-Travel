import { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getVisiblePackages, REGION_DESTINATIONS } from '../data/packages'
import { loadMergedPackages, subscribePackagesCatalogRefresh } from '../lib/packagesCatalog'
import ModalCards from '../components/ModalCards'
import { mapPackagesToModalCards } from '../utils/modalCardFromPackage'
import SEO from '../components/SEO'
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

const CATEGORY_TILES = {
  Destinations: {
    image: '/images/destinations/dubai-hero.webp',
    blurb: 'Worldwide escapes'
  },
  'Summer Packages': {
    image: '/images/bali/bali-hero.webp',
    blurb: 'Sun-filled getaways'
  },
  'Summer Packages to Greece': {
    image: '/images/kerkyra-greece/corfu-cover-hero.webp',
    blurb: 'Islands & mainland'
  },
  'Autumn Packages': {
    image: '/images/Georgia/Georgia-hero.webp',
    blurb: 'Golden-season journeys'
  },
  'Winter Packages': {
    image: '/images/lapland/lapland-cover-1.webp',
    blurb: 'Cozy winter escapes'
  },
  'Spring Packages': {
    image: '/images/Hraklio-crete/crete-cover-spring.webp',
    blurb: 'Fresh spring breaks'
  },
  'Christmas Packages': {
    image: '/images/christmas-packages/vienna/cover-vienna-christmas.webp',
    blurb: 'Festive holidays'
  },
  'City Breaks': {
    image: '/images/barcelona-package/barcelona-cover-one.webp',
    blurb: 'Urban weekends'
  },
  Cruises: {
    image: '/images/cruises/msc-world-europa/msc-world-europa-5.webp',
    blurb: 'Voyages at sea'
  },
  'Easter Packages': {
    image: '/images/easter-packages/kerkyra-easter-packages/kerkyra-easter-package-cover-hero.webp',
    blurb: 'Spring celebrations'
  },
  'Exotic Packages': {
    image: '/images/south-africa/south-africa-hero.webp',
    blurb: 'Faraway paradises'
  },
  'Green Monday': {
    image: '/images/Arachova/Arachova-cover.webp',
    blurb: 'Seasonal escapes'
  },
  'Group Travel': {
    image: '/images/Balcans-countries/balcans-hero.webp',
    blurb: 'Shared adventures'
  },
  'Mary Special Trips': {
    image: '/images/mary-special-trip/japan-2026/japan-6.webp',
    blurb: 'Exclusive curated trips'
  },
  'Music & Sports': {
    image: '/images/music-events/iron-maiden/iron-maiden-hero.webp',
    blurb: 'Live events abroad'
  },
  'Sports Events & Concerts': {
    image: '/images/athens-marathon/athens-marathon-hero.webp',
    blurb: 'Matches & concerts'
  },
  'Ski Packages': {
    image: '/images/Arachova/arachova-town-.webp',
    blurb: 'Alpine slopes'
  }
}

const GALLERY_CATEGORIES = [
  'Destinations',
  'Summer Packages',
  'Summer Packages to Greece',
  'Autumn Packages',
  'Winter Packages',
  'Spring Packages',
  'Christmas Packages',
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
  const { i18n } = useTranslation()
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
    setFilteredPackages(filtered)
  }, [catalog, category, destination, minPrice, maxPrice, departureMonth, travelType])

  const modalCards = useMemo(
    () => mapPackagesToModalCards(filteredPackages, i18n),
    [filteredPackages, i18n]
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
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
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

  return (
    <div className="packages-page">
      <SEO
        title="Tour Packages | Honeywell Travel"
        description="Browse all Honeywell Travel holiday packages by destination, season, and category."
        keywords="tour packages cyprus, holiday packages, travel deals"
        url={slug ? `https://www.honeywelltravel.com.cy/tour-category/${slug.replace(/\/$/, '')}` : 'https://www.honeywelltravel.com.cy/packages'}
      />
      {/* Hero Section */}
      <div className="packages-hero">
        <div className="packages-hero-content">
          <p className="packages-hero-label">Tour Packages</p>
          <h1 className="packages-hero-title">Find Your Perfect Trip</h1>
          <p className="packages-hero-subtitle">Browse by destination and season</p>
        </div>
      </div>

      {/* Browse by Category – premium image gallery */}
      <div className="category-gallery-wrapper">
        <div className="category-gallery-header">
          <h2 className="category-gallery-title">Browse by Category</h2>
          <p className="category-gallery-lead">
            Select a collection to explore carefully curated journeys.
          </p>
        </div>
        <div className="category-gallery" role="list">
          {GALLERY_CATEGORIES.map((cat) => {
            const tile = CATEGORY_TILES[cat] || {
              image: '/images/destinations/paris-hero.webp',
              blurb: 'Travel collection'
            }
            const count = categoryCounts[cat] || 0
            const isActive = category === cat
            return (
              <button
                key={cat}
                type="button"
                role="listitem"
                className={`category-tile${isActive ? ' is-active' : ''}`}
                aria-pressed={isActive}
                onClick={() => selectCategory(cat)}
              >
                <span
                  className="category-tile__media"
                  style={{ backgroundImage: `url(${tile.image})` }}
                  aria-hidden="true"
                />
                <span className="category-tile__veil" aria-hidden="true" />
                <span className="category-tile__content">
                  {isActive ? <span className="category-tile__badge">Selected</span> : null}
                  <span className="category-tile__name">{cat}</span>
                  <span className="category-tile__meta">
                    <span className="category-tile__blurb">{tile.blurb}</span>
                    <span className="category-tile__count">
                      {count} {count === 1 ? 'package' : 'packages'}
                    </span>
                  </span>
                </span>
              </button>
            )
          })}
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
                  {category !== 'Any' ? category : 'All Packages'}
                </span>
                <span className="results-title-count" aria-label={`${filteredPackages.length} packages found`}>
                  {filteredPackages.length} {filteredPackages.length === 1 ? 'package' : 'packages'} found
                </span>
              </h2>
            </div>
            {(category !== 'Any' || destination !== 'Any' || minPrice || maxPrice || departureMonth !== 'Any' || travelType !== 'Any') && (
              <div className="active-filters">
                {category !== 'Any' && (
                  <span className="active-filter-tag">
                    {category}
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
                    {travelType}
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
                    Price: {minPrice || '0'} - {maxPrice || '∞'}
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
                <button onClick={clearAllFilters} className="clear-all-filters">
                  Clear All
                </button>
              </div>
            )}
          </div>

          {filteredPackages.length > 0 ? (
            <ModalCards cards={modalCards} className="packages-modal-cards" />
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No packages found</h3>
              <p>Try adjusting your filters to see more results</p>
              <button onClick={clearAllFilters} className="reset-filters-btn">
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Packages
