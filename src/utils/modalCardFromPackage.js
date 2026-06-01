import { packageCardImageUrl } from './packageCardImage'
import { getEnglishPackageTitle } from './packageTranslations'

export function getPackageLeadPrice(pkg) {
  if (pkg?.details?.hotels?.length) {
    let lowestDouble = Infinity
    for (const hotel of pkg.details.hotels) {
      const price = hotel?.prices?.double
      if (typeof price === 'number' && price > 0 && price < lowestDouble) {
        lowestDouble = price
      }
    }
    if (lowestDouble !== Infinity) return lowestDouble
  }
  return typeof pkg?.price === 'number' ? pkg.price : 0
}

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
    link: `/packages/${pkg.id}/details`
  }
}

export function mapPackagesToModalCards(packages, i18n) {
  return (packages || []).map((pkg) => mapPackageToModalCard(pkg, i18n))
}
