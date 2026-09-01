import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, Plane, Search, Users } from 'lucide-react'
import { getPackagesByFilter } from '../data/packages'
import ModalCards from './ModalCards'
import { mapPackagesToModalCards } from '../utils/modalCardFromPackage'
import { useMobileLite } from '../hooks/useMobileLite'
import {
  categoryToSlug,
  getCategoryLabel,
  getDestinationLabel,
  SEARCH_CATEGORIES,
  SEARCH_DESTINATIONS,
} from '../utils/categoryI18n'
import './SearchSection.css'

function SearchSection() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isMobileLite = useMobileLite()
  const [category, setCategory] = useState('Any')
  const [destination, setDestination] = useState('Any')
  const [travelers, setTravelers] = useState('2')

  const categories = SEARCH_CATEGORIES
  const destinations = SEARCH_DESTINATIONS

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

  const getCategorySlug = (cat) => categoryToSlug(cat)

  const packagesForSelection = useMemo(() => {
    if (category === 'Any') return []
    return getPackagesByFilter(category, destination)
  }, [category, destination])

  const categoryLabel = getCategoryLabel(category, t)
  const destinationSuffix = destination !== 'Any'
    ? t('search.inDestination', { destination: getDestinationLabel(destination, t) })
    : ''

  const visiblePackages = useMemo(
    () => packagesForSelection.slice(0, 6),
    [packagesForSelection]
  )

  const modalCards = useMemo(
    () => mapPackagesToModalCards(visiblePackages, i18n),
    [visiblePackages, i18n.language]
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
          <p className="search-eyebrow">{t('search.eyebrow')}</p>
          <h2 className="search-title">{t('search.title')}</h2>
          <p className="search-subtitle">{t('search.subtitle')}</p>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-form__grid">
            <div className="form-card form-card--destination">
              <div className="form-field-header">
                <span className="form-icon form-icon--svg" aria-hidden="true">
                  <MapPin size={18} strokeWidth={2.25} />
                </span>
                <label htmlFor="destination" className="form-label">{t('search.whereTo')}</label>
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
                      {dest.icon} {getDestinationLabel(dest.value, t)}
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
                <label htmlFor="category" className="form-label">{t('search.whatType')}</label>
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
                      {cat.icon} {getCategoryLabel(cat.value, t)}
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
                <label htmlFor="travelers" className="form-label">{t('search.travelers')}</label>
              </div>
              <div className="form-field-wrapper">
                <select
                  id="travelers"
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  className="form-select"
                >
                  <option value="1">{t('search.travelerCount', { count: 1 })}</option>
                  <option value="2">{t('search.travelersCount', { count: 2 })}</option>
                  <option value="3">{t('search.travelersCount', { count: 3 })}</option>
                  <option value="4">{t('search.travelersCount', { count: 4 })}</option>
                  <option value="5+">{t('search.travelersPlus')}</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className="search-button">
            <Search size={20} strokeWidth={2.35} aria-hidden />
            <span>{t('search.searchButton')}</span>
          </button>
        </form>
      </div>

      {/* Full-width package results — outside narrow search container */}
      <div className={packagesSectionClass}>
          {category === 'Any' ? (
            <>
              <p className="packages-by-category-eyebrow">{t('search.discoverEyebrow')}</p>
              <h3 className="packages-by-category-title">{t('search.byCategoryTitle')}</h3>
              <p className="packages-by-category-subtitle">{t('search.byCategorySubtitle')}</p>
            </>
          ) : (
            <>
              <p className="packages-by-category-eyebrow">
                {hasPackageResults ? t('search.tapExplore') : t('search.noMatches')}
              </p>
              <h3 className="packages-by-category-title">
                {categories.find(c => c.value === category)?.icon} {categoryLabel}
              </h3>
              <p className="packages-by-category-subtitle">
                {packagesForSelection.length === 0
                  ? t('search.noPackagesFor', { category: categoryLabel, destination: destinationSuffix })
                  : t('search.showingPackages', {
                      count: packagesForSelection.length,
                      category: categoryLabel,
                      destination: destinationSuffix,
                    })}
              </p>
              {packagesForSelection.length > 0 && (
                <>
                  <ModalCards
                    cards={modalCards}
                    className="search-packages-modal-cards"
                    animationSpeed={isMobileLite ? 'none' : 'normal'}
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
                        {t('search.viewAllCount', { count: packagesForSelection.length })}
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
