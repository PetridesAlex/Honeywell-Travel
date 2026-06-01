import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, Plane, Search, Users } from 'lucide-react'
import { getPackagesByFilter } from '../data/packages'
import ModalCards from './ModalCards'
import { mapPackagesToModalCards } from '../utils/modalCardFromPackage'
import './SearchSection.css'

// Helper function to convert category name to URL-friendly slug
const categoryToSlug = (category) => {
  if (category === 'Any') return null
  return category
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9-]/g, '')
}

function SearchSection() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const [category, setCategory] = useState('Any')
  const [destination, setDestination] = useState('Any')
  const [travelers, setTravelers] = useState('2')

  const categories = [
    { value: 'Any', label: 'Any Category', icon: '🌍' },
    { value: 'Summer Packages', label: 'Summer Packages', icon: '☀️' },
    { value: 'Summer Packages to Greece', label: 'Summer Packages to Greece', icon: '🇬🇷' },
    { value: 'Winter Packages', label: 'Winter Packages', icon: '❄️' },
    { value: 'Spring Packages', label: 'Spring Packages', icon: '🌸' },
    { value: 'City Breaks', label: 'City Breaks', icon: '🏙️' },
    { value: 'Cruises', label: 'Cruises', icon: '🚢' },
    { value: 'Exotic Packages', label: 'Exotic Packages', icon: '🌴' },
    { value: 'Christmas Packages', label: 'Christmas Packages', icon: '🎄' },
    { value: 'Easter Packages', label: 'Easter Packages', icon: '🐰' },
    { value: 'Autumn Packages', label: 'Autumn Packages', icon: '🍂' },
    { value: 'Green Monday', label: 'Green Monday', icon: '🌿' },
    { value: 'Group Travel', label: 'Group Travel', icon: '👥' },
    { value: 'Mary Special Trips', label: 'Mary Special Trips', icon: '✨' },
    { value: 'SPORTS EVENTS & CONCERTS', label: 'Sports & Events', icon: '🎫' }
  ]

  const destinations = [
    { value: 'Any', label: 'Any Destination', icon: '🌐' },
    { value: 'Greece', label: 'Greece', icon: '🇬🇷' },
    { value: 'Europe', label: 'Europe', icon: '🇪🇺' },
    { value: 'Asia', label: 'Asia', icon: '🌏' },
    { value: 'America', label: 'America', icon: '🇺🇸' },
    { value: 'Africa', label: 'Africa', icon: '🦁' },
    { value: 'Middle East', label: 'Middle East', icon: '🏜️' }
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    const categorySlug = categoryToSlug(category)
    const params = new URLSearchParams()
    if (destination !== 'Any') params.set('destination', destination)
    const queryString = params.toString()

    if (categorySlug) {
      navigate(`/tour-category/${categorySlug}/${queryString ? `?${queryString}` : ''}`)
    } else {
      navigate(queryString ? `/packages?${queryString}` : '/packages')
    }
  }

  // Helper to convert category to slug for navigation
  const getCategorySlug = (cat) => {
    if (cat === 'Any') return null
    return cat.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and').replace(/[^a-z0-9-]/g, '')
  }

  // Packages for the selected category (and destination)
  const packagesForSelection = useMemo(() => {
    if (category === 'Any') return []
    return getPackagesByFilter(category, destination)
  }, [category, destination])

  const categoryLabel = categories.find(c => c.value === category)?.label ?? category

  const visiblePackages = useMemo(
    () => packagesForSelection.slice(0, 6),
    [packagesForSelection]
  )

  const modalCards = useMemo(
    () => mapPackagesToModalCards(visiblePackages, i18n),
    [visiblePackages, i18n]
  )

  const hasCategorySelected = category !== 'Any'
  const hasPackageResults = packagesForSelection.length > 0

  const packagesSectionClass = [
    'packages-by-category-section',
    hasCategorySelected
      ? hasPackageResults
        ? 'packages-by-category-section--results'
        : 'packages-by-category-section--empty'
      : 'packages-by-category-section--prompt'
  ].join(' ')

  return (
    <section className={`search-section${hasCategorySelected ? ' search-section--category-selected' : ''}`}>
      <div className="search-container">
        <div className="search-header">
          <p className="search-eyebrow">Plan your journey</p>
          <h2 className="search-title">Find Your Perfect Trip</h2>
          <p className="search-subtitle">
            Search through our travel packages and discover your next adventure with Honeywell Travel.
          </p>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-form__grid">
            <div className="form-card form-card--destination">
              <div className="form-field-header">
                <span className="form-icon form-icon--svg" aria-hidden="true">
                  <MapPin size={18} strokeWidth={2.25} />
                </span>
                <label htmlFor="destination" className="form-label">Where to?</label>
              </div>
              <div className="form-field-wrapper">
                <select
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="form-select"
                >
                  {destinations.map((dest) => (
                    <option key={dest.value} value={dest.value}>
                      {dest.icon} {dest.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-card form-card--category">
              <div className="form-field-header">
                <span className="form-icon form-icon--svg" aria-hidden="true">
                  <Plane size={18} strokeWidth={2.25} />
                </span>
                <label htmlFor="category" className="form-label">What type?</label>
              </div>
              <div className="form-field-wrapper">
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-select"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-card form-card--travelers">
              <div className="form-field-header">
                <span className="form-icon form-icon--svg" aria-hidden="true">
                  <Users size={18} strokeWidth={2.25} />
                </span>
                <label htmlFor="travelers" className="form-label">Travelers</label>
              </div>
              <div className="form-field-wrapper">
                <select
                  id="travelers"
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  className="form-select"
                >
                  <option value="1">1 Traveler</option>
                  <option value="2">2 Travelers</option>
                  <option value="3">3 Travelers</option>
                  <option value="4">4 Travelers</option>
                  <option value="5+">5+ Travelers</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className="search-button">
            <Search size={20} strokeWidth={2.35} aria-hidden />
            <span>Search packages</span>
          </button>
        </form>
      </div>

      {/* Full-width package results — outside narrow search container */}
      <div className={packagesSectionClass}>
          {category === 'Any' ? (
            <>
              <p className="packages-by-category-eyebrow">Discover packages</p>
              <h3 className="packages-by-category-title">See packages by category</h3>
              <p className="packages-by-category-subtitle">Select a category above to view available packages for Summer, Winter, City Breaks, and more.</p>
            </>
          ) : (
            <>
              <p className="packages-by-category-eyebrow">
                {hasPackageResults ? 'Tap a card to explore' : 'No matches yet'}
              </p>
              <h3 className="packages-by-category-title">
                {categories.find(c => c.value === category)?.icon} {categoryLabel}
              </h3>
              <p className="packages-by-category-subtitle">
                {packagesForSelection.length === 0
                  ? `No packages found for ${categoryLabel}${destination !== 'Any' ? ` in ${destination}` : ''}. Try another category or destination.`
                  : `Showing ${packagesForSelection.length} package${packagesForSelection.length === 1 ? '' : 's'} for ${categoryLabel}${destination !== 'Any' ? ` in ${destination}` : ''}.`
                }
              </p>
              {packagesForSelection.length > 0 && (
                <>
                  <ModalCards
                    cards={modalCards}
                    className="search-packages-modal-cards"
                    animationSpeed="normal"
                    showCloseButton={false}
                    ariaLabel={`${categoryLabel} packages`}
                  />
                  {packagesForSelection.length > 6 && (
                    <div className="packages-by-category-view-all">
                      <Link
                        to={`/tour-category/${getCategorySlug(category)}/`}
                        className="packages-by-category-view-all-link"
                        onClick={() => {
                          window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
                          if (document.documentElement) document.documentElement.scrollTop = 0
                          if (document.body) document.body.scrollTop = 0
                        }}
                      >
                        View all {packagesForSelection.length} packages →
                      </Link>
                    </div>
                  )}
                </>
              )}
            </>
          )}
      </div>
    </section>
  )
}

export default SearchSection
