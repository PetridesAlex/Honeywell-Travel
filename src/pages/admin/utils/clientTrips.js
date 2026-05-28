const CONFIRMED_STATUS = 'Confirmed'

export function isConfirmedTrip(lead) {
  return (lead?.status || '').trim() === CONFIRMED_STATUS
}

export function parseYearFromTravelDates(value) {
  const text = String(value || '').trim()
  if (!text) return null

  const years = [...text.matchAll(/\b(19|20)\d{2}\b/g)].map((match) => Number(match[0]))
  if (years.length === 0) return null

  return years[years.length - 1]
}

export function getTripYear(lead) {
  if (!isConfirmedTrip(lead)) return null

  if (lead.trip_completed_date) {
    const year = new Date(`${lead.trip_completed_date}T12:00:00`).getFullYear()
    if (!Number.isNaN(year)) return year
  }

  const fromTravelDates = parseYearFromTravelDates(lead.travel_dates)
  if (fromTravelDates) return fromTravelDates

  if (lead.created_at) {
    const year = new Date(lead.created_at).getFullYear()
    if (!Number.isNaN(year)) return year
  }

  return null
}

export function getConfirmedTrips(leads = []) {
  return (leads || []).filter(isConfirmedTrip)
}

export function getTripsByYear(leads = []) {
  const byYear = {}

  getConfirmedTrips(leads).forEach((lead) => {
    const year = getTripYear(lead)
    if (!year) return
    byYear[year] = (byYear[year] || 0) + 1
  })

  return byYear
}

export function getClientTravelStats(leads = []) {
  const confirmed = getConfirmedTrips(leads)
  const byYear = getTripsByYear(leads)
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a)
  const currentYear = new Date().getFullYear()
  const lifetimeTrips = confirmed.length
  const tripsThisYear = byYear[currentYear] || 0
  const activeYears = years.length
  const averagePerYear =
    activeYears > 0 ? Math.round((lifetimeTrips / activeYears) * 10) / 10 : 0

  const lastTrip = [...confirmed].sort((a, b) => {
    const aDate = a.trip_completed_date || a.created_at || ''
    const bDate = b.trip_completed_date || b.created_at || ''
    return bDate.localeCompare(aDate)
  })[0]

  return {
    lifetimeTrips,
    tripsThisYear,
    currentYear,
    byYear,
    years,
    activeYears,
    averagePerYear,
    lastTrip,
    confirmed
  }
}
