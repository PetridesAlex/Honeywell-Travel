import { useEffect, useId, useMemo, useRef } from 'react'
import { RotateCcw, SlidersHorizontal, X } from 'lucide-react'

const COUNTRY_LABELS = {
  GBR: 'United Kingdom',
  ENG: 'England',
  SCO: 'Scotland',
  WAL: 'Wales',
  IRL: 'Ireland',
  ESP: 'Spain',
  ITA: 'Italy',
  DEU: 'Germany',
  GER: 'Germany',
  FRA: 'France',
  NLD: 'Netherlands',
  BEL: 'Belgium',
  AUT: 'Austria',
  PRT: 'Portugal',
  USA: 'United States',
  ARE: 'UAE',
  JPN: 'Japan',
  AZE: 'Azerbaijan',
  CYP: 'Cyprus',
}

function countryLabel(code) {
  const key = String(code || '').toUpperCase()
  return COUNTRY_LABELS[key] || key
}

function FilterFields({
  competitions,
  countries,
  cities,
  filters,
  onChange,
  onClear,
  activeCount = 0,
}) {
  const activeChips = useMemo(() => {
    const chips = []
    for (const name of filters.competitions) {
      chips.push({ key: `comp:${name}`, label: name, clear: () => onChange('competitions', name) })
    }
    if (filters.country) {
      chips.push({
        key: `country:${filters.country}`,
        label: countryLabel(filters.country),
        clear: () => onChange('country', ''),
      })
    }
    if (filters.city) {
      chips.push({
        key: `city:${filters.city}`,
        label: filters.city,
        clear: () => onChange('city', ''),
      })
    }
    if (filters.month) {
      chips.push({
        key: `month:${filters.month}`,
        label: filters.month,
        clear: () => onChange('month', ''),
      })
    }
    if (filters.team.trim()) {
      chips.push({
        key: `team:${filters.team}`,
        label: filters.team,
        clear: () => onChange('team', ''),
      })
    }
    return chips
  }, [filters, onChange])

  return (
    <>
      {activeCount > 0 ? (
        <div className="st-filters__active">
          <div className="st-filters__active-head">
            <span>{activeCount} active</span>
            <button type="button" className="st-filters__active-clear" onClick={onClear}>
              <RotateCcw size={13} strokeWidth={2.2} aria-hidden />
              Reset
            </button>
          </div>
          <div className="st-filters__chips">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                className="st-filters__chip"
                onClick={chip.clear}
                title={`Remove ${chip.label}`}
              >
                <span>{chip.label}</span>
                <X size={12} strokeWidth={2.4} aria-hidden />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="st-filters__group">
        <div className="st-filters__label-row">
          <span className="st-filters__label">Competition</span>
          <span className="st-filters__count">{competitions.length}</span>
        </div>
        <div className="st-filters__options" role="group" aria-label="Competitions">
          {competitions.length === 0 ? (
            <p className="st-filters__empty">Competitions appear as events load</p>
          ) : (
            competitions.map((name) => {
              const selected = filters.competitions.includes(name)
              return (
                <button
                  key={name}
                  type="button"
                  className={`st-filters__pill${selected ? ' is-selected' : ''}`}
                  aria-pressed={selected}
                  onClick={() => onChange('competitions', name)}
                >
                  {name}
                </button>
              )
            })
          )}
        </div>
      </div>

      <div className="st-filters__group">
        <label className="st-filters__label" htmlFor="st-filter-country">
          Country
        </label>
        <div className="st-filters__field">
          <select
            id="st-filter-country"
            value={filters.country}
            onChange={(e) => onChange('country', e.target.value)}
          >
            <option value="">All countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {countryLabel(country)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="st-filters__group">
        <label className="st-filters__label" htmlFor="st-filter-city">
          City
        </label>
        <div className="st-filters__field">
          <select
            id="st-filter-city"
            value={filters.city}
            onChange={(e) => onChange('city', e.target.value)}
          >
            <option value="">All cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="st-filters__group">
        <label className="st-filters__label" htmlFor="st-filter-month">
          Month
        </label>
        <div className="st-filters__field">
          <input
            id="st-filter-month"
            type="month"
            value={filters.month}
            onChange={(e) => onChange('month', e.target.value)}
          />
        </div>
      </div>

      <div className="st-filters__group">
        <label className="st-filters__label" htmlFor="st-filter-team">
          Team
        </label>
        <div className="st-filters__field">
          <input
            id="st-filter-team"
            type="search"
            placeholder="Search team…"
            value={filters.team}
            onChange={(e) => onChange('team', e.target.value)}
          />
        </div>
      </div>

      <button type="button" className="st-filters__clear" onClick={onClear} disabled={activeCount === 0}>
        Clear filters
      </button>
    </>
  )
}

function EventFilters({
  competitions = [],
  countries = [],
  cities = [],
  filters,
  onChange,
  onClear,
  activeCount = 0,
  mobileOpen,
  onMobileOpen,
  onMobileClose,
}) {
  const titleId = useId()
  const drawerRef = useRef(null)

  useEffect(() => {
    if (!mobileOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onMobileClose?.()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    drawerRef.current?.querySelector('button, input, select')?.focus?.()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [mobileOpen, onMobileClose])

  const fields = (
    <FilterFields
      competitions={competitions}
      countries={countries}
      cities={cities}
      filters={filters}
      onChange={onChange}
      onClear={onClear}
      activeCount={activeCount}
    />
  )

  return (
    <>
      <button
        type="button"
        className="st-filters-mobile-toggle"
        onClick={onMobileOpen}
        aria-expanded={mobileOpen}
        aria-controls="st-filters-drawer"
      >
        <SlidersHorizontal size={16} strokeWidth={2.2} aria-hidden />
        Filters
        {activeCount > 0 ? <span className="st-filters-mobile-toggle__badge">{activeCount}</span> : null}
      </button>

      <aside className="st-filters st-filters-desktop" aria-labelledby={titleId}>
        <div className="st-filters__header">
          <h2 className="st-filters__title" id={titleId}>
            Filters
          </h2>
          {activeCount > 0 ? <span className="st-filters__badge">{activeCount}</span> : null}
        </div>
        {fields}
      </aside>

      <div
        className={`st-filters-drawer-backdrop${mobileOpen ? ' is-open' : ''}`}
        onClick={onMobileClose}
        aria-hidden={!mobileOpen}
      />
      <div
        id="st-filters-drawer"
        ref={drawerRef}
        className={`st-filters-drawer${mobileOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${titleId}-mobile`}
        hidden={!mobileOpen}
      >
        <div className="st-filters__drawer-head">
          <div className="st-filters__header" style={{ marginBottom: 0, border: 0, padding: 0 }}>
            <h2 className="st-filters__title" id={`${titleId}-mobile`}>
              Filters
            </h2>
            {activeCount > 0 ? <span className="st-filters__badge">{activeCount}</span> : null}
          </div>
          <button type="button" className="st-btn st-btn--ghost" onClick={onMobileClose} aria-label="Close filters">
            <X size={16} aria-hidden />
            Close
          </button>
        </div>
        {fields}
      </div>
    </>
  )
}

export default EventFilters
