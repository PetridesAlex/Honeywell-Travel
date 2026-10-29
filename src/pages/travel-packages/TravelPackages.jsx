import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SlidersHorizontal } from 'lucide-react'
import { getVisiblePackages } from '../../data/packages'
import { loadMergedPackages, subscribePackagesCatalogRefresh } from '../../lib/packagesCatalog'
import SEO from '../../components/SEO'
import PackageFilters from '../../components/travel-packages/PackageFilters'
import PackageToolbar from '../../components/travel-packages/PackageToolbar'
import PackageGrid from '../../components/travel-packages/PackageGrid'
import MobileFilterDrawer from '../../components/travel-packages/MobileFilterDrawer'
import { DEFAULT_FILTERS, TRAVEL_PACKAGE_CATEGORIES } from './filterOptions'
import {
  countActiveFilters,
  filterTravelPackages,
  filtersFromSearchParams,
  getCataloguePriceBounds,
  searchParamsFromFilters,
  sortTravelPackages,
} from './travelPackageFilters'
import './TravelPackages.css'

function TravelPackages() {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [catalog, setCatalog] = useState(() => getVisiblePackages())
  const [filters, setFilters] = useState(() => ({ ...DEFAULT_FILTERS }))
  const [view, setView] = useState('grid')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  const priceBounds = useMemo(() => getCataloguePriceBounds(catalog), [catalog])

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
    const next = filtersFromSearchParams(searchParams, priceBounds)
    setFilters(next)
    setHydrated(true)
    // Only re-sync when URL or price bounds change (not on every filters edit).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, priceBounds.min, priceBounds.max])

  const syncUrl = useCallback(
    (nextFilters) => {
      const params = searchParamsFromFilters(nextFilters, priceBounds)
      setSearchParams(params, { replace: true })
    },
    [priceBounds, setSearchParams],
  )

  const handleFiltersChange = useCallback(
    (next) => {
      setFilters(next)
      syncUrl(next)
    },
    [syncUrl],
  )

  const handleReset = useCallback(() => {
    const next = {
      ...DEFAULT_FILTERS,
      priceMin: priceBounds.min,
      priceMax: priceBounds.max,
    }
    setFilters(next)
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [priceBounds.max, priceBounds.min, setSearchParams])

  const handleSortChange = useCallback(
    (sort) => {
      const next = { ...filters, sort }
      setFilters(next)
      syncUrl(next)
    },
    [filters, syncUrl],
  )

  const availableCategories = useMemo(() => {
    const present = new Set((catalog || []).map((pkg) => pkg.category).filter(Boolean))
    const preferred = TRAVEL_PACKAGE_CATEGORIES.filter((c) => present.has(c))
    const extras = [...present].filter((c) => !TRAVEL_PACKAGE_CATEGORIES.includes(c)).sort()
    return preferred.length || extras.length ? [...preferred, ...extras] : TRAVEL_PACKAGE_CATEGORIES
  }, [catalog])

  const filtered = useMemo(() => {
    if (!hydrated) return []
    const list = filterTravelPackages(catalog, filters, i18n)
    return sortTravelPackages(list, filters.sort || 'popular')
  }, [catalog, filters, hydrated, i18n])

  const activeCount = useMemo(
    () => countActiveFilters(filters, priceBounds),
    [filters, priceBounds],
  )

  return (
    <div className="tp-page">
      <SEO
        title={t('travelPackages.seoTitle')}
        description={t('travelPackages.seoDescription')}
      />

      <header className="tp-intro">
        <div className="tp-intro__glow" aria-hidden="true" />
        <div className="tp-intro__inner">
          <p className="tp-intro__eyebrow">{t('travelPackages.eyebrow')}</p>
          <h1 className="tp-intro__title">{t('travelPackages.title')}</h1>
          <div className="tp-intro__rule" aria-hidden="true" />
          <p className="tp-intro__support">{t('travelPackages.support')}</p>
          <p className="tp-intro__count" aria-live="polite">
            <span className="tp-intro__count-dot" aria-hidden="true" />
            {filtered.length === 1
              ? t('travelPackages.resultsOne', { count: filtered.length })
              : t('travelPackages.resultsMany', { count: filtered.length })}
          </p>
        </div>
      </header>

      <div className="tp-layout">
        <aside className="tp-sidebar" aria-label={t('travelPackages.filtersTitle')}>
          <PackageFilters
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleReset}
            priceBounds={priceBounds}
            availableCategories={availableCategories}
          />
        </aside>

        <div className="tp-main">
          <div className="tp-mobile-bar">
            <button
              type="button"
              className="tp-mobile-bar__filters"
              onClick={() => setDrawerOpen(true)}
            >
              <SlidersHorizontal size={18} strokeWidth={2.25} aria-hidden="true" />
              {t('travelPackages.filtersTitle')}
              {activeCount > 0 ? <span className="tp-mobile-bar__badge">{activeCount}</span> : null}
            </button>
          </div>

          <PackageToolbar
            count={filtered.length}
            sort={filters.sort || 'popular'}
            onSortChange={handleSortChange}
            view={view}
            onViewChange={setView}
          />

          {filtered.length > 0 ? (
            <PackageGrid packages={filtered} view={view} />
          ) : (
            <div className="tp-empty">
              <h2 className="tp-empty__title">{t('travelPackages.emptyTitle')}</h2>
              <p className="tp-empty__text">{t('travelPackages.emptyText')}</p>
              <button type="button" className="tp-empty__reset" onClick={handleReset}>
                {t('travelPackages.reset')}
              </button>
            </div>
          )}
        </div>
      </div>

      <MobileFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={handleFiltersChange}
        onReset={handleReset}
        priceBounds={priceBounds}
        availableCategories={availableCategories}
        activeCount={activeCount}
      />
    </div>
  )
}

export default TravelPackages
