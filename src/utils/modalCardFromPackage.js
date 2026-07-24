import { packageCardImageUrl } from './packageCardImage'
import { getEnglishPackageTitle } from './packageTranslations'
import { getPackageDepartureCountdown } from './packageDepartureCountdown'
import { getPackageDepartureDatesFromPkg } from './packageDepartureDates'
import { getPackageLeadPrice } from './packageLeadPrice'

export { getPackageLeadPrice }

export function mapPackageToModalCard(pkg, i18n) {
  const englishTitle = getEnglishPackageTitle(pkg.id, pkg.title, pkg.destination, i18n)
  const hasAlternateTitle = Boolean(englishTitle && englishTitle.trim() !== pkg.title.trim())
  const imageUrl = packageCardImageUrl(pkg)
  const isGroup = (pkg.packageType || 'individual') === 'group'

  return {
    id: String(pkg.id),
    imageUrl,
    title: pkg.title,
    secondaryTitle: hasAlternateTitle ? englishTitle : '',
    description: pkg.description,
    gradientColor: isGroup ? '#0d5c2e' : '#c41230',
    destination: pkg.destination,
    category: pkg.category,
    duration: pkg.duration,
    supplier: pkg.supplier || '',
    packageType: isGroup ? 'group' : 'individual',
    price: getPackageLeadPrice(pkg),
    departureDates: getPackageDepartureDatesFromPkg(pkg),
    link: `/packages/${pkg.id}/details`,
    departureCountdown:
      pkg.details?.packageStatus === 'completed' ? null : getPackageDepartureCountdown(pkg),
    statusBadge: pkg.details?.packageStatus === 'completed' ? 'completed' : null
  }
}

export function mapPackagesToModalCards(packages, i18n) {
  return (packages || []).map((pkg) => mapPackageToModalCard(pkg, i18n))
}
