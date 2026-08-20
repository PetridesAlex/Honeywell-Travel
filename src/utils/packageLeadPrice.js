/**
 * Website “from” price for cards/modals.
 * Prefer cheapest hotel double /pp; fall back to the package listing `price`.
 */
export function getPackageLeadPrice(pkg) {
  const hotels = pkg?.details?.hotels
  if (Array.isArray(hotels) && hotels.length > 0) {
    let lowestDouble = Infinity
    for (const hotel of hotels) {
      const price = Number(hotel?.prices?.double)
      if (Number.isFinite(price) && price > 0 && price < lowestDouble) {
        lowestDouble = price
      }
    }
    if (lowestDouble !== Infinity) return lowestDouble
  }

  const listing = Number(pkg?.price)
  return Number.isFinite(listing) && listing > 0 ? listing : 0
}

/** Missing / on-request prices sort after priced packages. */
function sortableLeadPrice(pkg) {
  const price = getPackageLeadPrice(pkg)
  return price > 0 ? price : Number.POSITIVE_INFINITY
}

export function comparePackagesByLeadPriceAsc(a, b) {
  const priceDiff = sortableLeadPrice(a) - sortableLeadPrice(b)
  if (priceDiff !== 0) return priceDiff
  return String(a?.title || '').localeCompare(String(b?.title || ''), 'el')
}

/** Cheapest → most expensive (copy; does not mutate input). */
export function sortPackagesByLeadPriceAsc(packages) {
  return [...(packages || [])].sort(comparePackagesByLeadPriceAsc)
}
