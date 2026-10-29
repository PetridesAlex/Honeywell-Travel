/** Canonical filter option IDs for /travel-packages (English values; labels via i18n). */

export const TRAVEL_PACKAGE_CATEGORIES = [
  'Summer Packages',
  'Summer Packages to Greece',
  'Winter Packages',
  'Spring Packages',
  'Autumn Packages',
  'City Breaks',
  'Cruises',
  'Exotic Packages',
  'Christmas Packages',
  'Christmas Markets',
  'Easter Packages',
  'Green Monday',
  'Group Travel',
  'Mary Special Trips',
  'SPORTS EVENTS & CONCERTS',
  'Ski Packages',
]

export const DEPARTURE_CITIES = [
  'Larnaca',
  'Paphos',
  'Nicosia',
  'Limassol',
]

export const DESTINATION_REGIONS = [
  'Greece',
  'Europe',
  'Asia',
  'America',
  'Africa',
  'Middle East',
]

export const DURATION_BUCKETS = [
  { id: '2-4', min: 2, max: 4 },
  { id: '5-7', min: 5, max: 7 },
  { id: '8-12', min: 8, max: 12 },
  { id: '13+', min: 13, max: Infinity },
]

export const SEASONS = ['spring', 'summer', 'autumn', 'winter']

export const SORT_OPTIONS = [
  'popular',
  'newest',
  'priceAsc',
  'priceDesc',
  'durationAsc',
]

export const DEFAULT_FILTERS = {
  search: '',
  priceMin: null,
  priceMax: null,
  categories: [],
  departureFrom: [],
  destinations: [],
  durations: [],
  seasons: [],
  travelers: '',
  sort: 'popular',
}

/** Normalize departure city strings from package data. */
export function normalizeDepartureCity(value) {
  const raw = String(value || '').trim().toLowerCase()
  if (!raw) return ''
  if (raw.includes('larnaca') || raw.includes('larnaka')) return 'Larnaca'
  if (raw.includes('paphos') || raw.includes('pafos')) return 'Paphos'
  if (raw.includes('nicosia') || raw.includes('lefkosia') || raw.includes('lefkosa')) return 'Nicosia'
  if (raw.includes('limassol') || raw.includes('lemesos')) return 'Limassol'
  return ''
}
