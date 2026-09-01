import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { localizePackage } from '../utils/packageTranslations'
import { getCategoryLabel } from '../utils/categoryI18n'
import { translatePackageDuration } from '../utils/packageTitleI18n'
import { getPackageLeadPrice } from '../utils/packageLeadPrice'
import './PackageCard.css'

function PackageCard({ package: pkg }) {
  const { t, i18n } = useTranslation()
  const localized = localizePackage(pkg, i18n)

  const displayPrice = getPackageLeadPrice(pkg)
  const priceOnRequest = pkg.priceOnRequest || pkg.details?.priceOnRequest
  const imageUrl = pkg.details?.coverImage || pkg.details?.thumbnailImage || pkg.details?.gallery?.[0]
  const isGroup = (pkg.packageType || 'individual') === 'group'
  const resetScrollTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    if (document.documentElement) document.documentElement.scrollTop = 0
    if (document.body) document.body.scrollTop = 0
  }

  return (
    <Link
      to={`/packages/${pkg.id}/details`}
      className="package-card"
      onClick={() => {
        resetScrollTop()
        requestAnimationFrame(resetScrollTop)
        setTimeout(resetScrollTop, 60)
      }}
    >
      <span className={`package-type-badge package-type-badge--${isGroup ? 'group' : 'individual'}`} aria-hidden="true">
        {isGroup ? t('packageCard.group') : t('packageCard.individual')}
      </span>
      <div className={`package-image${imageUrl ? ' package-image-bg' : ''}`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="package-image-photo"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        ) : (
          pkg.image
        )}
      </div>
      <div className="package-content">
        <div className="package-header-row">
          <div className="package-badge">{pkg.destination}</div>
          {pkg.supplier ? (
            <span className="package-supplier-badge" aria-label={t('search.supplierAria', { name: pkg.supplier })}>
              {pkg.supplier}
            </span>
          ) : null}
        </div>
        <h3 className="package-title">{localized.title}</h3>
        <p className="package-description">{localized.description}</p>
        <div className="package-details">
          <span className="package-duration">{translatePackageDuration(pkg.duration, i18n.language)}</span>
          <span className="package-category">{getCategoryLabel(pkg.category, t)}</span>
        </div>
        <div className="package-footer">
          <span className="package-price">
            {priceOnRequest || !(displayPrice > 0)
              ? t('packageCard.priceOnRequest')
              : t('packageCard.fromPrice', { price: displayPrice.toLocaleString() })}
          </span>
          <span className="package-button">{t('packageCard.viewDetails')}</span>
        </div>
      </div>
    </Link>
  )
}

export default PackageCard
