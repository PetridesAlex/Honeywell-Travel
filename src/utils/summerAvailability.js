import { getPackageById } from '../data/packages'
import {
  SUMMER_AVAILABILITY_SECTIONS,
  SUMMER_AVAILABILITY_YEAR,
  getAvailabilityStatusMeta,
  resolveDepartureStatus,
  summerAvailabilityCatalog,
} from '../data/summerPackageAvailability'
import { getPackageLeadPrice } from './modalCardFromPackage'
import { packageCardImageUrl } from './packageCardImage'

const DATE_PATTERN = /^(\d{1,2})\/(\d{1,2})$/

function parseDepartureDate(departureDate, year = SUMMER_AVAILABILITY_YEAR) {
  const match = String(departureDate).trim().match(DATE_PATTERN)
  if (!match) return null
  const day = Number.parseInt(match[1], 10)
  const month = Number.parseInt(match[2], 10)
  if (!day || !month || month < 1 || month > 12 || day < 1 || day > 31) return null
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }
  return date
}

function formatDateLabel(date, departureDate) {
  if (!date) return departureDate
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function enrichCatalogEntry(entry) {
  const pkg = entry.packageId ? getPackageById(entry.packageId) : null
  const departures = entry.departures.map((departure) => {
    const parsedDate = parseDepartureDate(departure.date)
    const status = resolveDepartureStatus(departure.placesLeft)
    return {
      ...departure,
      status,
      statusMeta: getAvailabilityStatusMeta(status),
      dateLabel: formatDateLabel(parsedDate, departure.date),
      sortTime: parsedDate ? parsedDate.getTime() : Number.MAX_SAFE_INTEGER,
    }
  })

  departures.sort((a, b) => a.sortTime - b.sortTime)

  const limitedCount = departures.filter(
    (departure) => departure.status === 'limited' || departure.status === 'few_places',
  ).length

  return {
    ...entry,
    title: pkg?.title || entry.title,
    displayTitle: entry.title,
    destination: pkg?.destination || '',
    category: pkg?.category || '',
    packageType: entry.packageType || pkg?.packageType || 'group',
    price: pkg ? getPackageLeadPrice(pkg) : null,
    priceOnRequest: Boolean(pkg?.priceOnRequest || pkg?.details?.priceOnRequest),
    imageUrl: pkg ? packageCardImageUrl(pkg) : null,
    link: pkg ? `/packages/${pkg.id}/details` : null,
    departures,
    departureCount: departures.length,
    limitedCount,
  }
}

function matchesQuery(entry, query) {
  if (!query) return true
  const haystack = [
    entry.displayTitle,
    entry.title,
    entry.duration,
    entry.carrier,
    entry.destination,
    entry.category,
    ...entry.departures.map((departure) => departure.date),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(query)
}

export function getSummerAvailabilitySections(sectionFilter = 'all', destinationQuery = '') {
  const query = destinationQuery.trim().toLowerCase()
  const sections = SUMMER_AVAILABILITY_SECTIONS.map((section) => {
    const packages = summerAvailabilityCatalog
      .filter((entry) => entry.sectionId === section.id)
      .map(enrichCatalogEntry)
      .filter((entry) => matchesQuery(entry, query))

    const departureCount = packages.reduce((count, entry) => count + entry.departureCount, 0)
    const limitedCount = packages.reduce((count, entry) => count + entry.limitedCount, 0)

    return {
      ...section,
      packages,
      packageCount: packages.length,
      departureCount,
      limitedCount,
    }
  }).filter((section) => section.packages.length > 0)

  if (sectionFilter === 'all') return sections
  return sections.filter((section) => section.id === sectionFilter)
}

export function getAvailabilitySummary(sectionFilter = 'all', destinationQuery = '') {
  const sections = getSummerAvailabilitySections(sectionFilter, destinationQuery)
  const packageCount = sections.reduce((count, section) => count + section.packageCount, 0)
  const departureCount = sections.reduce((count, section) => count + section.departureCount, 0)
  const limitedCount = sections.reduce((count, section) => count + section.limitedCount, 0)

  return {
    packageCount,
    departureCount,
    limitedCount,
    sectionCount: sections.length,
  }
}
