import { REGION_DESTINATIONS } from '../../data/packages'
import { getPackageLeadPrice } from '../../utils/packageLeadPrice'
import { localizePackage } from '../../utils/packageTranslations'
import { getPackageDepartureDatesFromPkg } from '../../utils/packageDepartureDates'
import {
  DEFAULT_FILTERS,
  DURATION_BUCKETS,
  normalizeDepartureCity,
} from './filterOptions'

const MONTH_TO_SEASON = {
  january: 'winter',
  february: 'winter',
  march: 'spring',
  april: 'spring',
  may: 'spring',
  june: 'summer',
  july: 'summer',
  august: 'summer',
  september: 'autumn',
  october: 'autumn',
  november: 'autumn',
  december: 'winter',
}

export function parseDurationDays(duration) {
  const match = String(duration || '').match(/(\d+)/)
  if (!match) return null
  const days = Number(match[1])
  return Number.isFinite(days) && days > 0 ? days : null
}

export function getPackageSeasons(pkg) {
  const seasons = new Set()
  const monthAvail = String(pkg?.details?.monthAvailability || '').toLowerCase()
  for (const [month, season] of Object.entries(MONTH_TO_SEASON)) {
    if (monthAvail.includes(month)) seasons.add(season)
  }

  const dates = getPackageDepartureDatesFromPkg(pkg) || []
  for (const token of dates) {
    const m = String(token).match(/\/(\d{1,2})(?:\/|$)/)
    if (!m) continue
    const monthIndex = Number(m[1]) - 1
    const names = Object.keys(MONTH_TO_SEASON)
    if (monthIndex >= 0 && monthIndex < 12) {
      seasons.add(MONTH_TO_SEASON[names[monthIndex]])
    }
  }

  return [...seasons]
}

export function getPackageDepartureCity(pkg) {
  return normalizeDepartureCity(
    pkg?.details?.departureFrom || pkg?.departureFrom || pkg?.details?.departureAirport || '',
  )
}

export function getCataloguePriceBounds(packages) {
  let min = Infinity
  let max = 0
  for (const pkg of packages || []) {
    const price = getPackageLeadPrice(pkg)
    if (!price || price <= 0) continue
    if (price < min) min = price
    if (price > max) max = price
  }
  if (!Number.isFinite(min) || min === Infinity) min = 0
  if (!Number.isFinite(max) || max <= 0) max = 7000
  return {
    min: Math.max(0, Math.floor(min / 50) * 50),
    max: Math.max(500, Math.ceil(max / 50) * 50),
  }
}

function matchesDestinationRegion(pkgDestination, selectedRegions) {
  if (!selectedRegions?.length) return true
  return selectedRegions.some((region) => {
    const list = REGION_DESTINATIONS[region] || [region]
    return list.includes(pkgDestination) || pkgDestination === region
  })
}

function matchesDuration(days, selectedBuckets) {
  if (!selectedBuckets?.length) return true
  if (days == null) return false
  return selectedBuckets.some((id) => {
    const bucket = DURATION_BUCKETS.find((b) => b.id === id)
    if (!bucket) return false
    return days >= bucket.min && days <= bucket.max
  })
}

export function filterTravelPackages(packages, filters, i18n) {
  const f = { ...DEFAULT_FILTERS, ...filters }
  const query = String(f.search || '').trim().toLowerCase()

  return (packages || []).filter((pkg) => {
    if (f.categories?.length && !f.categories.includes(pkg.category)) return false

    if (f.destinations?.length && !matchesDestinationRegion(pkg.destination, f.destinations)) {
      return false
    }

    if (f.departureFrom?.length) {
      const city = getPackageDepartureCity(pkg)
      if (!city || !f.departureFrom.includes(city)) return false
    }

    const price = getPackageLeadPrice(pkg)
    if (f.priceMin != null && price > 0 && price < f.priceMin) return false
    if (f.priceMax != null && price > 0 && price > f.priceMax) return false

    const days = parseDurationDays(pkg.duration)
    if (!matchesDuration(days, f.durations)) return false

    if (f.seasons?.length) {
      const seasons = getPackageSeasons(pkg)
      if (!seasons.some((s) => f.seasons.includes(s))) return false
    }

    if (query) {
      const localized = localizePackage(pkg, i18n)
      const haystack = [
        localized.title,
        localized.description,
        pkg.destination,
        pkg.category,
        pkg.duration,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(query)) return false
    }

    return true
  })
}

export function sortTravelPackages(packages, sort) {
  const list = [...(packages || [])]
  switch (sort) {
    case 'newest':
      return list.reverse()
    case 'priceAsc':
      return list.sort((a, b) => {
        const pa = getPackageLeadPrice(a) || Number.POSITIVE_INFINITY
        const pb = getPackageLeadPrice(b) || Number.POSITIVE_INFINITY
        return pa - pb
      })
    case 'priceDesc':
      return list.sort((a, b) => {
        const pa = getPackageLeadPrice(a) || 0
        const pb = getPackageLeadPrice(b) || 0
        return pb - pa
      })
    case 'durationAsc':
      return list.sort((a, b) => {
        const da = parseDurationDays(a.duration) ?? Number.POSITIVE_INFINITY
        const db = parseDurationDays(b.duration) ?? Number.POSITIVE_INFINITY
        return da - db
      })
    case 'popular':
    default:
      return list.sort((a, b) => {
        const fa = a.featured ? 1 : 0
        const fb = b.featured ? 1 : 0
        if (fb !== fa) return fb - fa
        const pa = getPackageLeadPrice(a) || Number.POSITIVE_INFINITY
        const pb = getPackageLeadPrice(b) || Number.POSITIVE_INFINITY
        return pa - pb
      })
  }
}

export function countActiveFilters(filters, priceBounds) {
  const f = { ...DEFAULT_FILTERS, ...filters }
  let count = 0
  if (String(f.search || '').trim()) count += 1
  if (f.categories?.length) count += 1
  if (f.departureFrom?.length) count += 1
  if (f.destinations?.length) count += 1
  if (f.durations?.length) count += 1
  if (f.seasons?.length) count += 1
  if (
    priceBounds &&
    ((f.priceMin != null && f.priceMin > priceBounds.min) ||
      (f.priceMax != null && f.priceMax < priceBounds.max))
  ) {
    count += 1
  }
  return count
}

export function filtersFromSearchParams(searchParams, priceBounds) {
  const next = { ...DEFAULT_FILTERS }
  const search = searchParams.get('q') || searchParams.get('search') || ''
  next.search = search

  const category = searchParams.get('category')
  if (category && category !== 'Any') next.categories = [category]

  const destination = searchParams.get('destination')
  if (destination && destination !== 'Any') next.destinations = [destination]

  const travelers = searchParams.get('travelers') || ''
  next.travelers = travelers

  const categories = searchParams.get('categories')
  if (categories) next.categories = categories.split(',').filter(Boolean)

  const destinations = searchParams.get('destinations')
  if (destinations) next.destinations = destinations.split(',').filter(Boolean)

  const departureFrom = searchParams.get('from')
  if (departureFrom) next.departureFrom = departureFrom.split(',').filter(Boolean)

  const durations = searchParams.get('duration')
  if (durations) next.durations = durations.split(',').filter(Boolean)

  const seasons = searchParams.get('season')
  if (seasons) next.seasons = seasons.split(',').filter(Boolean)

  const sort = searchParams.get('sort')
  if (sort) next.sort = sort

  const min = searchParams.get('min')
  const max = searchParams.get('max')
  if (min != null && min !== '') next.priceMin = Number(min)
  if (max != null && max !== '') next.priceMax = Number(max)

  if (priceBounds) {
    if (next.priceMin == null) next.priceMin = priceBounds.min
    if (next.priceMax == null) next.priceMax = priceBounds.max
  }

  return next
}

export function searchParamsFromFilters(filters, priceBounds) {
  const params = new URLSearchParams()
  const f = { ...DEFAULT_FILTERS, ...filters }

  if (String(f.search || '').trim()) params.set('q', String(f.search).trim())
  if (f.categories?.length === 1) params.set('category', f.categories[0])
  else if (f.categories?.length > 1) params.set('categories', f.categories.join(','))
  if (f.destinations?.length === 1) params.set('destination', f.destinations[0])
  else if (f.destinations?.length > 1) params.set('destinations', f.destinations.join(','))
  if (f.departureFrom?.length) params.set('from', f.departureFrom.join(','))
  if (f.durations?.length) params.set('duration', f.durations.join(','))
  if (f.seasons?.length) params.set('season', f.seasons.join(','))
  if (f.travelers) params.set('travelers', f.travelers)
  if (f.sort && f.sort !== 'popular') params.set('sort', f.sort)

  if (priceBounds) {
    if (f.priceMin != null && f.priceMin > priceBounds.min) params.set('min', String(Math.round(f.priceMin)))
    if (f.priceMax != null && f.priceMax < priceBounds.max) params.set('max', String(Math.round(f.priceMax)))
  }

  return params
}
