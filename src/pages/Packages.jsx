import { useState, useEffect, useLayoutEffect, useMemo } from 'react'
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

  useLayoutEffect(() => {
    const resetTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      if (document.documentElement) document.documentElement.scrollTop = 0
      if (document.body) document.body.scrollTop = 0
      if (document.scrollingElement) document.scrollingElement.scrollTop = 0

      const mainContent = document.querySelector('.main-content')
      if (mainContent) {
        mainContent.scrollTop = 0
      }
    }

    resetTop()
    const rafId = requestAnimationFrame(resetTop)
    const t1 = setTimeout(resetTop, 80)
    const t2 = setTimeout(resetTop, 220)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [slug])

  const categories = [
    'Any',
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

  // Get price range from packages
  const getPriceRange = () => {
    const prices = catalog
      .map(pkg => {
        if (pkg.details && pkg.details.hotels && pkg.details.hotels.length > 0) {
          return pkg.details.hotels[0].packagePrice || pkg.price
        }
        return pkg.price
      })
      .filter(price => price != null && price > 0)
    if (prices.length === 0) return { min: 0, max: 10000 }
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    }
  }

  const priceRange = getPriceRange()

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

      {/* Browse by Category – directly below hero, no empty space */}
      <div className="category-chips-wrapper">
        <h2 className="section-subtitle">Browse by Category</h2>
        <div className="category-chips">
          {categories.filter((cat) => cat !== 'Any').map((cat) => (
            <button
              key={cat}
              className={`category-chip ${category === cat ? 'active' : ''}`}
              onClick={() => {
                setCategory(cat)
                applyFilters(cat, destination)
              }}
            >
              {cat}
            </button>
          ))}
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
        <div className="packages-results">
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
                    €{minPrice || priceRange.min} - €{maxPrice || priceRange.max}
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
              </div>
            )}
          </div>

          {filteredPackages.length > 0 ? (
            <ModalCards
              cards={modalCards}
              className="packages-modal-cards"
              animationSpeed="normal"
              showCloseButton={false}
            />
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No packages found</h3>
              <p>No packages match your current filters. Try adjusting your search criteria.</p>
              <button 
                className="clear-filters-btn"
                onClick={clearAllFilters}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Packages






