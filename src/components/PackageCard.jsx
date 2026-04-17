import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getEnglishPackageTitle } from '../utils/packageTranslations'
import './PackageCard.css'

function PackageCard({ package: pkg }) {
  const { i18n } = useTranslation()
  const [showEnglishTitle, setShowEnglishTitle] = useState(false)
  const primaryTitle = pkg.title
  const englishTitle = getEnglishPackageTitle(pkg.id, pkg.title, pkg.destination, i18n)
  const canToggleLanguage = Boolean(englishTitle && englishTitle.trim() !== primaryTitle.trim())
  const displayTitle = showEnglishTitle && canToggleLanguage ? englishTitle : primaryTitle
  
  // From price = lowest double room price per person across all hotels
  const getCheapestPrice = () => {
    if (pkg.details && pkg.details.hotels && pkg.details.hotels.length > 0) {
      let lowestDouble = Infinity
      pkg.details.hotels.forEach(hotel => {
        if (hotel.prices && hotel.prices.double != null && hotel.prices.double > 0 && hotel.prices.double < lowestDouble) {
          lowestDouble = hotel.prices.double
        }
      })
      return lowestDouble !== Infinity ? lowestDouble : pkg.price
    }
    return pkg.price
  }

  const displayPrice = getCheapestPrice()
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
        // Ensure destination page always opens at hero/top.
        resetScrollTop()
        requestAnimationFrame(resetScrollTop)
        setTimeout(resetScrollTop, 60)
      }}
    >
      <span className={`package-type-badge package-type-badge--${isGroup ? 'group' : 'individual'}`} aria-hidden="true">
        {isGroup ? 'Group' : 'Individual'}
      </span>
      <div
        className={`package-image${imageUrl ? ' package-image-bg' : ''}`}
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      >
        {!imageUrl && pkg.image}
      </div>
      <div className="package-content">
        <div className="package-header-row">
          <div className="package-badge">{pkg.destination}</div>
          {pkg.supplier ? (
            <span className="package-supplier-badge" aria-label={`Supplier ${pkg.supplier}`}>
              {pkg.supplier}
            </span>
          ) : null}
          {canToggleLanguage ? (
            <button
              type="button"
              className="package-language-toggle"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                setShowEnglishTitle((prev) => !prev)
              }}
              aria-label={showEnglishTitle ? 'Show Greek title' : 'Show English title'}
              title={showEnglishTitle ? 'Show Greek title' : 'Show English title'}
            >
              {showEnglishTitle ? 'GR' : 'EN'}
            </button>
          ) : null}
        </div>
        <h3 className="package-title">{displayTitle}</h3>
        <p className="package-description">{pkg.description}</p>
        <div className="package-details">
          <span className="package-duration">{pkg.duration}</span>
          <span className="package-category">{pkg.category}</span>
        </div>
        <div className="package-footer">
          <span className="package-price">From €{displayPrice.toLocaleString()}</span>
          <span className="package-button">View Details →</span>
        </div>
      </div>
    </Link>
  )
}

export default PackageCard






