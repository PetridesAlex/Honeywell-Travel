/** Used by Packages grid & PopularPackagesSection when cover/thumbnail/gallery are missing. */
export const FALLBACK_PACKAGE_CARD_IMAGE = '/images/destinations/patra1.webp'

export function packageCardImageUrl(pkg) {
  if (!pkg || typeof pkg !== 'object') return FALLBACK_PACKAGE_CARD_IMAGE
  const cover = pkg.details?.coverImage
  const thumb = pkg.details?.thumbnailImage
  const gallery0 = pkg.details?.gallery?.[0]
  const firstHotel =
    Array.isArray(pkg.details?.hotels) ? pkg.details.hotels.map((h) => h?.image).find(Boolean) : ''
  const root =
    typeof pkg.image === 'string' && (pkg.image.startsWith('/') || pkg.image.startsWith('http'))
      ? pkg.image
      : ''
  return cover || thumb || gallery0 || firstHotel || root || FALLBACK_PACKAGE_CARD_IMAGE
}
