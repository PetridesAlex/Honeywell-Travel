/**
 * Shared departure-date helpers for package cards and detail pages.
 * Dates in package data are typically DD/MM or DD/MM/YYYY.
 */

const parseDepartureSortKey = (s) => {
  const m = String(s)
    .trim()
    .match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/)
  if (!m) return null
  const day = parseInt(m[1], 10)
  const month = parseInt(m[2], 10)
  let year = m[3] ? parseInt(m[3], 10) : new Date().getFullYear()
  if (year < 100) year += 2000
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return new Date(year, month - 1, day).getTime()
}

export function sortDepartureDateStrings(dates) {
  const copy = [...dates]
  copy.sort((a, b) => {
    const ta = parseDepartureSortKey(a)
    const tb = parseDepartureSortKey(b)
    if (ta != null && tb != null) return ta - tb
    if (ta != null) return -1
    if (tb != null) return 1
    return String(a).localeCompare(String(b), 'el')
  })
  return copy
}

export function parseDateTokenList(value) {
  if (!value || typeof value !== 'string') return []
  return String(value)
    .split(/[,\n;]+/)
    .map((part) => part.trim())
    .filter((part) => part && part !== '—' && part !== '-')
}

export function dedupeSortDates(dates) {
  const normalized = new Map()
  dates.forEach((date) => {
    const key = String(date).toLowerCase()
    if (!normalized.has(key)) normalized.set(key, date)
  })
  return sortDepartureDateStrings([...normalized.values()])
}

/**
 * Calendar date for a DD/MM or DD/MM/YYYY token.
 * Yearless dates use yearOverride, else the current year — no roll-forward to next year.
 */
export function parseDepartureCalendarDate(dateStr, now = new Date(), yearOverride) {
  const m = String(dateStr)
    .trim()
    .match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/)
  if (!m) return null

  const day = parseInt(m[1], 10)
  const month = parseInt(m[2], 10)
  if (month < 1 || month > 12 || day < 1 || day > 31) return null

  let year = m[3]
    ? parseInt(m[3], 10)
    : yearOverride != null
      ? Number(yearOverride)
      : now.getFullYear()
  if (year < 100) year += 2000

  return new Date(year, month - 1, day)
}

/**
 * Drop departure tokens that are before today (local midnight).
 * Yearless DD/MM uses departureYear when set, otherwise the current calendar year.
 * Unparseable tokens are kept so odd labels are not silently lost.
 */
export function filterUpcomingDepartureDates(dates, now = new Date(), yearOverride) {
  if (!Array.isArray(dates) || dates.length === 0) return []

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return dates.filter((token) => {
    const parsed = parseDepartureCalendarDate(token, now, yearOverride)
    if (!parsed) return true
    return parsed >= startOfToday
  })
}

/** Multi-city group trips: each hotel row is a stay leg (check-in), not a bookable departure option. */
export function isItineraryStyleHotels(details) {
  if (details?.hotelDatesAreStaySegments) return true
  const hotels = details?.hotels
  if (!Array.isArray(hotels) || hotels.length < 2) return false
  const names = new Set(hotels.map((h) => h?.name).filter(Boolean))
  if (names.size < 2) return false
  const stayDates = hotels.map((h) => h?.checkInDate || h?.departureDate).filter(Boolean)
  return names.size === hotels.length && new Set(stayDates).size === stayDates.length
}

export function getHotelStayDate(hotel) {
  return hotel?.checkInDate || hotel?.departureDate
}

const collectRawPackageDepartureDates = (details) => {
  if (Array.isArray(details.departureDates) && details.departureDates.length > 0) {
    return dedupeSortDates(details.departureDates.filter(Boolean))
  }

  const fromSingular = parseDateTokenList(details.departureDate)
  if (fromSingular.length > 0) return dedupeSortDates(fromSingular)

  const fromOutboundFlights = (details.flights || [])
    .filter((f) => f?.direction === 'Departure')
    .flatMap((f) => parseDateTokenList(f.date))
  if (fromOutboundFlights.length > 0) return dedupeSortDates(fromOutboundFlights)

  if (!isItineraryStyleHotels(details)) {
    const fromHotels = (details.hotels || []).flatMap((h) => parseDateTokenList(h?.departureDate))
    if (fromHotels.length > 0) return dedupeSortDates(fromHotels)
  }

  return []
}

/**
 * Outbound package departure options — not hotel stay segments or return/internal flight legs.
 * Same source of truth as the package detail Flights section.
 * Past / expired dates are excluded.
 */
export function getPackageDepartureDates(details, now = new Date()) {
  if (!details) return []
  return filterUpcomingDepartureDates(
    collectRawPackageDepartureDates(details),
    now,
    details.departureYear
  )
}

export function getPackageDepartureDatesFromPkg(pkg, now = new Date()) {
  return getPackageDepartureDates(pkg?.details, now)
}

/**
 * Departure date tokens for filters / hotel alignment.
 * Itinerary-style packages use package-level dates only.
 * Past / expired dates are excluded.
 * Return / domestic flight legs are never treated as package departures.
 */
export function getDepartureDates(details, now = new Date()) {
  if (!details) return []
  if (isItineraryStyleHotels(details)) return getPackageDepartureDates(details, now)

  const rawDates = [
    ...(Array.isArray(details.departureDates) ? details.departureDates : []),
    ...(details.departureDate && typeof details.departureDate === 'string' ? [details.departureDate] : []),
    ...(Array.isArray(details.hotels)
      ? details.hotels.map((hotel) => hotel?.departureDate).filter(Boolean)
      : []),
    ...(Array.isArray(details.flights)
      ? details.flights
          .filter((flight) => {
            const direction = String(flight?.direction || 'Departure').trim().toLowerCase()
            return direction === 'departure' || direction === ''
          })
          .map((flight) => flight?.date)
          .filter(Boolean)
      : []),
  ]

  return filterUpcomingDepartureDates(
    dedupeSortDates(rawDates.flatMap((value) => parseDateTokenList(value))),
    now,
    details.departureYear
  )
}
