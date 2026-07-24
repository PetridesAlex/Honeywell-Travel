import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { loadMergedPackages, subscribePackagesCatalogRefresh } from '../lib/packagesCatalog'
import './BookOnline.css'

function BookOnline() {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedType, setSelectedType] = useState('Any Type')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [catalog, setCatalog] = useState([])
  const resultsRef = useRef(null)

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

  const packageTypes = [
    'Any Type',
    'Group Tour',
    'Private Tour',
    'Self-Guided',
    'Adventure',
    'Relaxation',
    'Family Friendly',
    'Luxury'
  ]

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
        title="Book Online Travel Packages | Honeywell Travel"
        description="Search and book travel packages online by category, type, and departure date with Honeywell Travel."
        keywords="book online travel, holiday packages cyprus, honeywell travel booking"
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
              <h1>Book Your Perfect Trip</h1>
              <p>Choose your preferences and find the ideal travel package for you</p>
            </div>
            <form className="booking-form" onSubmit={handleSearch}>
              <div className="filter-row">
                <div className="filter-group">
                  <label htmlFor="category">Travel Category</label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="type">Package Type</label>
                  <select
                    id="type"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    {packageTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="start-date">Travel From</label>
                  <input
                    type="date"
                    id="start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="end-date">Travel To</label>
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
                    View Results ↓
                  </button>
                  <button 
                    type="button" 
                    className="clear-btn"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
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
                  {filteredPackages.length} travel package{filteredPackages.length !== 1 ? 's' : ''} found
                </h2>
                <div className="active-filters">
                  {selectedCategory && <span className="filter-tag">Category: {selectedCategory}</span>}
                  {selectedType && selectedType !== 'Any Type' && <span className="filter-tag">Type: {selectedType}</span>}
                  {startDate && <span className="filter-tag">From: {new Date(startDate).toLocaleDateString()}</span>}
                  {endDate && <span className="filter-tag">To: {new Date(endDate).toLocaleDateString()}</span>}
                </div>
              </div>

              {filteredPackages.length === 0 ? (
                <div className="no-results">
                  <p>😔 No packages found matching your criteria.</p>
                  <p>Try adjusting your filters to see more options.</p>
                </div>
              ) : (
                <div className="packages-grid">
                  {filteredPackages.map((pkg) => {
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
                          <p className="package-category">{pkg.category}</p>
                          <h3 className="package-title">{pkg.title}</h3>
                          <p className="package-destination">{pkg.destination}</p>
                          <div className="package-footer">
                            <span className="package-duration">{pkg.duration}</span>
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
