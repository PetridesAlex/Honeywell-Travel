import { packageCardImageUrl } from './packageCardImage'
import { localizePackage } from './packageTranslations'
import { translatePackageDuration } from './packageTitleI18n'
import { getCategoryLabel } from './categoryI18n'
import { getPackageDepartureCountdown } from './packageDepartureCountdown'
import { getPackageDepartureDatesFromPkg } from './packageDepartureDates'
import { getPackageLeadPrice } from './packageLeadPrice'

export { getPackageLeadPrice }

export function mapPackageToModalCard(pkg, i18n) {
  const localized = localizePackage(pkg, i18n)
  const imageUrl = packageCardImageUrl(pkg)
  const isGroup = (pkg.packageType || 'individual') === 'group'
  const t = i18n?.t?.bind(i18n)

  return {
    id: String(pkg.id),
    imageUrl,
    title: localized.title,
    secondaryTitle: '',
    description: localized.description,
    gradientColor: isGroup ? '#0d5c2e' : '#c41230',
    destination: pkg.destination,
    category: t ? getCategoryLabel(pkg.category, t) : pkg.category,
    duration: translatePackageDuration(pkg.duration, i18n?.language),
    supplier: pkg.supplier || '',
    packageType: isGroup ? 'group' : 'individual',
    price: getPackageLeadPrice(pkg),
    departureDates: getPackageDepartureDatesFromPkg(pkg),
    link: `/packages/${pkg.id}/details`,
    departureCountdown:
      pkg.details?.packageStatus === 'completed' ? null : getPackageDepartureCountdown(pkg),
    statusBadge: pkg.details?.packageStatus === 'completed' ? 'completed' : null,
    translationPending: Boolean(localized._i18nMissing),
  }
}

export function mapPackagesToModalCards(packages, i18n) {
  return (packages || []).map((pkg) => mapPackageToModalCard(pkg, i18n))
}
