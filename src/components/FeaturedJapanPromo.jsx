import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getPackageById } from '../data/packages'
import { localizePackage } from '../utils/packageTranslations'
import { getCategoryLabel } from '../utils/categoryI18n'
import { translatePackageDuration } from '../utils/packageTitleI18n'
import './FeaturedJapanPromo.css'

const FEATURED_PACKAGE_ID = 357

function FeaturedJapanPromo() {
  const { t, i18n } = useTranslation()
  const pkg = getPackageById(FEATURED_PACKAGE_ID)
  if (!pkg) return null

  const localized = localizePackage(pkg, i18n)
  const cover =
    pkg.details?.coverImage || pkg.image || '/images/mary-special-trip/japan-2026/japan-6.webp'
  const destination =
    pkg.details?.destinationFull || 'Osaka – Kyoto – Kanazawa – Matsumoto – Tokyo'
  const price = pkg.price

  return (
    <section className="featured-japan-promo" aria-labelledby="featured-japan-promo-title">
      <div
        className="featured-japan-promo__media"
        style={{ backgroundImage: `url(${cover})` }}
        role="img"
        aria-label={localized.title}
      />
      <div className="featured-japan-promo__veil" aria-hidden="true" />
      <div className="featured-japan-promo__shine" aria-hidden="true" />
      <div className="featured-japan-promo__inner">
        <div className="featured-japan-promo__copy">
          <div
            className="featured-japan-promo__urgency"
            role="status"
            aria-live="polite"
          >
            <span className="featured-japan-promo__urgency-pulse" aria-hidden="true" />
            <span className="featured-japan-promo__urgency-label">{t('home.featuredJapan.limitedSeats')}</span>
            <span className="featured-japan-promo__urgency-divider" aria-hidden="true" />
            <span className="featured-japan-promo__urgency-copy">
              {t('home.featuredJapan.reserveQuickly')}
            </span>
          </div>

          <p className="featured-japan-promo__eyebrow">
            <span className="featured-japan-promo__badge">{t('home.featuredJapan.featured')}</span>
            <span>{getCategoryLabel('Mary Special Trips', t)}</span>
          </p>
          <h2 id="featured-japan-promo-title" className="featured-japan-promo__title">
            {localized.title}
          </h2>
          <p className="featured-japan-promo__lead">
            {t('home.featuredJapan.lead')}
          </p>
          <ul className="featured-japan-promo__meta">
            <li>
              <span className="featured-japan-promo__meta-label">{t('home.featuredJapan.datesLabel')}</span>
              <span className="featured-japan-promo__meta-value">{t('home.featuredJapan.datesValue')}</span>
            </li>
            <li>
              <span className="featured-japan-promo__meta-label">{t('home.featuredJapan.durationLabel')}</span>
              <span className="featured-japan-promo__meta-value">
                {translatePackageDuration(pkg.duration, i18n.language)}
              </span>
            </li>
            <li>
              <span className="featured-japan-promo__meta-label">{t('home.featuredJapan.routeLabel')}</span>
              <span className="featured-japan-promo__meta-value">{destination}</span>
            </li>
            <li>
              <span className="featured-japan-promo__meta-label">{t('home.featuredJapan.fromLabel')}</span>
              <span className="featured-japan-promo__meta-value featured-japan-promo__meta-value--price">
                €{Number(price).toLocaleString('de-DE')}
              </span>
            </li>
          </ul>
          <div className="featured-japan-promo__actions">
            <Link to={`/packages/${FEATURED_PACKAGE_ID}/details`} className="featured-japan-promo__cta">
              {t('home.featuredJapan.bookNow')}
            </Link>
            <Link to="/packages?category=Mary%20Special%20Trips" className="featured-japan-promo__link">
              {t('home.featuredJapan.allTrips')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturedJapanPromo
