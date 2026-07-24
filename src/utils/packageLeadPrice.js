/**
 * Website “from” price for cards/modals.
 * Prefer the CMS/listing `price` field so Basics → From price updates the live site.
 * Fall back to cheapest hotel double /pp when listing price is missing.
 */
export function getPackageLeadPrice(pkg) {
  const listing = Number(pkg?.price)
  if (Number.isFinite(listing) && listing > 0) {
    return listing
  }

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

  return 0
}
