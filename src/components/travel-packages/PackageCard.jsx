import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { packageCardImageUrl } from '../../utils/packageCardImage'
import { localizePackage } from '../../utils/packageTranslations'
import { translatePackageDuration } from '../../utils/packageTitleI18n'
import { getCategoryLabel, getDestinationLabel } from '../../utils/categoryI18n'
import { getPackageLeadPrice } from '../../utils/packageLeadPrice'
import { getPackageDepartureDatesFromPkg } from '../../utils/packageDepartureDates'
import { getPackageDepartureCity } from '../../pages/travel-packages/travelPackageFilters'

const MAX_VISIBLE_DATES = 3

function PackageCard({ pkg, view = 'grid' }) {
  const { t, i18n } = useTranslation()
  const localized = localizePackage(pkg, i18n)
  const imageUrl = packageCardImageUrl(pkg)
  const price = getPackageLeadPrice(pkg)
  const duration = translatePackageDuration(pkg.duration, i18n.language)
  const departureCity = getPackageDepartureCity(pkg)
  const dates = getPackageDepartureDatesFromPkg(pkg) || []
  const dateCount = dates.length
  const visibleDates = dates.slice(0, MAX_VISIBLE_DATES)
  const hiddenDateCount = Math.max(0, dateCount - MAX_VISIBLE_DATES)
  const isGroup = (pkg.packageType || 'individual') === 'group' || pkg.category === 'Group Travel'
  const cityLabel = departureCity
    ? t(`travelPackages.cities.${departureCity.toLowerCase()}`, { defaultValue: departureCity })
    : ''
  const datesLabel =
    dateCount === 1
      ? t('travelPackages.departuresCountOne', { count: dateCount })
      : t('travelPackages.departuresCountMany', { count: dateCount })

  return (
    <Link
      to={`/packages/${pkg.id}/details`}
      className={`tp-card tp-card--${view}`}
      aria-label={localized.title}
    >
      <div className="tp-card__media">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="tp-card__image" loading="lazy" />
        ) : (
          <div className="tp-card__image tp-card__image--placeholder" aria-hidden="true" />
        )}
        <div className="tp-card__badges">
          {pkg.featured ? (
            <span className="tp-card__badge tp-card__badge--popular">{t('travelPackages.badgePopular')}</span>
          ) : null}
          {isGroup ? (
            <span className="tp-card__badge tp-card__badge--group">{t('travelPackages.badgeGroup')}</span>
          ) : null}
          {pkg.details?.packageStatus === 'completed' ? (
            <span className="tp-card__badge tp-card__badge--limited">{t('travelPackages.badgeCompleted')}</span>
          ) : null}
        </div>
      </div>

      <div className="tp-card__body">
        <div className="tp-card__top">
          <p className="tp-card__meta">
            <span className="tp-card__category">{getCategoryLabel(pkg.category, t)}</span>
            {pkg.destination ? (
              <>
                <span className="tp-card__meta-sep" aria-hidden="true" />
                <span className="tp-card__destination">{getDestinationLabel(pkg.destination, t)}</span>
              </>
            ) : null}
          </p>
          <h3 className="tp-card__title">{localized.title}</h3>
        </div>

        {(duration || cityLabel || dateCount > 0) ? (
          <dl className="tp-card__facts">
            {duration ? (
              <div className="tp-card__fact">
                <dt>{t('travelPackages.factDuration')}</dt>
                <dd>{duration}</dd>
              </div>
            ) : null}
            {cityLabel ? (
              <div className="tp-card__fact">
                <dt>{t('travelPackages.factDeparture')}</dt>
                <dd>{cityLabel}</dd>
              </div>
            ) : null}
            {dateCount > 0 ? (
              <div className="tp-card__fact tp-card__fact--dates">
                <dt>
                  <span className="tp-card__dates-label">{datesLabel}</span>
                </dt>
                <dd>
                  <ul className="tp-card__date-list">
                    {visibleDates.map((date) => (
                      <li key={date} className="tp-card__date-chip">
                        {date}
                      </li>
                    ))}
                    {hiddenDateCount > 0 ? (
                      <li className="tp-card__date-chip tp-card__date-chip--more">
                        {t('travelPackages.moreDepartures', { count: hiddenDateCount })}
                      </li>
                    ) : null}
                  </ul>
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        <div className="tp-card__footer">
          <div className="tp-card__price">
            {price > 0 ? (
              <>
                <span className="tp-card__price-label">{t('travelPackages.from')}</span>
                <span className="tp-card__price-value">€{Math.round(price).toLocaleString(i18n.language)}</span>
                <span className="tp-card__price-suffix">{t('travelPackages.perPerson')}</span>
              </>
            ) : (
              <span className="tp-card__price-value tp-card__price-value--request">
                {t('travelPackages.onRequest')}
              </span>
            )}
          </div>
          <span className="tp-card__cta">
            <span className="tp-card__cta-label">{t('travelPackages.viewDetails')}</span>
            <span className="tp-card__cta-icon" aria-hidden="true">
              <ArrowRight size={14} strokeWidth={2.5} />
            </span>
          </span>
        </div>
      </div>
    </Link>
  )
}

export default PackageCard
