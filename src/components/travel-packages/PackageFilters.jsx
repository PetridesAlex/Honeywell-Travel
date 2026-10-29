import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getCategoryLabel, getDestinationLabel } from '../../utils/categoryI18n'
import {
  DEPARTURE_CITIES,
  DESTINATION_REGIONS,
  DURATION_BUCKETS,
  SEASONS,
  TRAVEL_PACKAGE_CATEGORIES,
} from '../../pages/travel-packages/filterOptions'
import FilterAccordion from './FilterAccordion'

function toggleValue(list, value) {
  const current = list || []
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
}

function PackageFilters({
  filters,
  onChange,
  onReset,
  priceBounds,
  availableCategories = TRAVEL_PACKAGE_CATEGORIES,
  idPrefix = 'tp',
}) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState({
    search: true,
    price: true,
    category: true,
    departure: false,
    destination: true,
    duration: false,
    season: false,
  })

  const toggleSection = (key) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const setField = (patch) => onChange({ ...filters, ...patch })

  const priceMin = filters.priceMin ?? priceBounds.min
  const priceMax = filters.priceMax ?? priceBounds.max

  return (
    <div className="tp-filters">
      <div className="tp-filters__header">
        <div className="tp-filters__heading-wrap">
          <span className="tp-filters__mark" aria-hidden="true" />
          <h2 className="tp-filters__heading">{t('travelPackages.filtersTitle')}</h2>
        </div>
        <button type="button" className="tp-filters__reset" onClick={onReset}>
          {t('travelPackages.reset')}
        </button>
      </div>

      <FilterAccordion
        id={`${idPrefix}-search`}
        title={t('travelPackages.filterSearch')}
        open={open.search}
        onToggle={() => toggleSection('search')}
      >
        <label className="tp-sr-only" htmlFor={`${idPrefix}-q`}>
          {t('travelPackages.filterSearch')}
        </label>
        <input
          id={`${idPrefix}-q`}
          type="search"
          className="tp-filters__search"
          placeholder={t('travelPackages.searchPlaceholder')}
          value={filters.search || ''}
          onChange={(e) => setField({ search: e.target.value })}
        />
      </FilterAccordion>

      <FilterAccordion
        id={`${idPrefix}-price`}
        title={t('travelPackages.filterPrice')}
        open={open.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="tp-price">
          <div className="tp-price__values" aria-live="polite">
            <span>€{Math.round(priceMin).toLocaleString(i18n.language)}</span>
            <span>–</span>
            <span>€{Math.round(priceMax).toLocaleString(i18n.language)}</span>
          </div>
          <div className="tp-price__sliders">
            <label className="tp-sr-only" htmlFor={`${idPrefix}-price-min`}>
              {t('travelPackages.priceMin')}
            </label>
            <input
              id={`${idPrefix}-price-min`}
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step={50}
              value={priceMin}
              onChange={(e) => {
                const next = Math.min(Number(e.target.value), priceMax)
                setField({ priceMin: next })
              }}
            />
            <label className="tp-sr-only" htmlFor={`${idPrefix}-price-max`}>
              {t('travelPackages.priceMax')}
            </label>
            <input
              id={`${idPrefix}-price-max`}
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step={50}
              value={priceMax}
              onChange={(e) => {
                const next = Math.max(Number(e.target.value), priceMin)
                setField({ priceMax: next })
              }}
            />
          </div>
        </div>
      </FilterAccordion>

      <FilterAccordion
        id={`${idPrefix}-category`}
        title={t('travelPackages.filterCategory')}
        open={open.category}
        onToggle={() => toggleSection('category')}
        count={filters.categories?.length || 0}
      >
        <ul className="tp-check-list">
          <li>
            <label className="tp-check">
              <input
                type="checkbox"
                checked={!filters.categories?.length}
                onChange={() => setField({ categories: [] })}
              />
              <span>{t('travelPackages.all')}</span>
            </label>
          </li>
          {availableCategories.map((cat) => (
            <li key={cat}>
              <label className="tp-check">
                <input
                  type="checkbox"
                  checked={filters.categories?.includes(cat) || false}
                  onChange={() => setField({ categories: toggleValue(filters.categories, cat) })}
                />
                <span>{getCategoryLabel(cat, t)}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterAccordion>

      <FilterAccordion
        id={`${idPrefix}-departure`}
        title={t('travelPackages.filterDeparture')}
        open={open.departure}
        onToggle={() => toggleSection('departure')}
        count={filters.departureFrom?.length || 0}
      >
        <ul className="tp-check-list">
          <li>
            <label className="tp-check">
              <input
                type="checkbox"
                checked={!filters.departureFrom?.length}
                onChange={() => setField({ departureFrom: [] })}
              />
              <span>{t('travelPackages.all')}</span>
            </label>
          </li>
          {DEPARTURE_CITIES.map((city) => (
            <li key={city}>
              <label className="tp-check">
                <input
                  type="checkbox"
                  checked={filters.departureFrom?.includes(city) || false}
                  onChange={() =>
                    setField({ departureFrom: toggleValue(filters.departureFrom, city) })
                  }
                />
                <span>
                  {t(`travelPackages.cities.${city.toLowerCase()}`, { defaultValue: city })}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </FilterAccordion>

      <FilterAccordion
        id={`${idPrefix}-destination`}
        title={t('travelPackages.filterDestination')}
        open={open.destination}
        onToggle={() => toggleSection('destination')}
        count={filters.destinations?.length || 0}
      >
        <ul className="tp-check-list">
          <li>
            <label className="tp-check">
              <input
                type="checkbox"
                checked={!filters.destinations?.length}
                onChange={() => setField({ destinations: [] })}
              />
              <span>{t('travelPackages.all')}</span>
            </label>
          </li>
          {DESTINATION_REGIONS.map((region) => (
            <li key={region}>
              <label className="tp-check">
                <input
                  type="checkbox"
                  checked={filters.destinations?.includes(region) || false}
                  onChange={() =>
                    setField({ destinations: toggleValue(filters.destinations, region) })
                  }
                />
                <span>{getDestinationLabel(region, t)}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterAccordion>

      <FilterAccordion
        id={`${idPrefix}-duration`}
        title={t('travelPackages.filterDuration')}
        open={open.duration}
        onToggle={() => toggleSection('duration')}
        count={filters.durations?.length || 0}
      >
        <ul className="tp-check-list">
          {DURATION_BUCKETS.map((bucket) => (
            <li key={bucket.id}>
              <label className="tp-check">
                <input
                  type="checkbox"
                  checked={filters.durations?.includes(bucket.id) || false}
                  onChange={() =>
                    setField({ durations: toggleValue(filters.durations, bucket.id) })
                  }
                />
                <span>{t(`travelPackages.duration.${bucket.id}`)}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterAccordion>

      <FilterAccordion
        id={`${idPrefix}-season`}
        title={t('travelPackages.filterSeason')}
        open={open.season}
        onToggle={() => toggleSection('season')}
        count={filters.seasons?.length || 0}
      >
        <ul className="tp-check-list">
          {SEASONS.map((season) => (
            <li key={season}>
              <label className="tp-check">
                <input
                  type="checkbox"
                  checked={filters.seasons?.includes(season) || false}
                  onChange={() => setField({ seasons: toggleValue(filters.seasons, season) })}
                />
                <span>{t(`travelPackages.seasons.${season}`)}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterAccordion>
    </div>
  )
}

export default PackageFilters
