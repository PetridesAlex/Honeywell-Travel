import { Link } from 'react-router-dom'
import { getPackageById } from '../data/packages'
import './FeaturedJapanPromo.css'

const FEATURED_PACKAGE_ID = 357

function FeaturedJapanPromo() {
  const pkg = getPackageById(FEATURED_PACKAGE_ID)
  if (!pkg) return null

  const cover =
    pkg.details?.coverImage || pkg.image || '/images/mary-special-trip/japan-2026/japan-6.webp'
  const destination =
    pkg.details?.destinationFull || 'Osaka – Kyoto – Kanazawa – Matsumoto – Tokyo'
  const dates = '31 Οκτωβρίου – 12 Νοεμβρίου 2026'
  const price = pkg.price

  return (
    <section className="featured-japan-promo" aria-labelledby="featured-japan-promo-title">
      <div
        className="featured-japan-promo__media"
        style={{ backgroundImage: `url(${cover})` }}
        role="img"
        aria-label={pkg.title}
      />
      <div className="featured-japan-promo__veil" aria-hidden="true" />
      <div className="featured-japan-promo__inner">
        <div className="featured-japan-promo__copy">
          <p className="featured-japan-promo__eyebrow">
            <span className="featured-japan-promo__badge">Featured</span>
            <span>Mary Special Trips</span>
          </p>
          <h2 id="featured-japan-promo-title" className="featured-japan-promo__title">
            {pkg.title}
          </h2>
          <p className="featured-japan-promo__lead">
            Οι μαγευτικές αποχρώσεις του φθινοπώρου — Momiji, ιστορικές πρωτεύουσες, Ιαπωνικές Άλπεις
            και Τόκιο, σε συνοδεία της Μαίρης Σπύρου.
          </p>
          <ul className="featured-japan-promo__meta">
            <li>
              <span className="featured-japan-promo__meta-label">Dates</span>
              <span className="featured-japan-promo__meta-value">{dates}</span>
            </li>
            <li>
              <span className="featured-japan-promo__meta-label">Duration</span>
              <span className="featured-japan-promo__meta-value">{pkg.duration}</span>
            </li>
            <li>
              <span className="featured-japan-promo__meta-label">Route</span>
              <span className="featured-japan-promo__meta-value">{destination}</span>
            </li>
            <li>
              <span className="featured-japan-promo__meta-label">From</span>
              <span className="featured-japan-promo__meta-value featured-japan-promo__meta-value--price">
                €{Number(price).toLocaleString('de-DE')}
              </span>
            </li>
          </ul>
          <div className="featured-japan-promo__actions">
            <Link to={`/packages/${FEATURED_PACKAGE_ID}/details`} className="featured-japan-promo__cta">
              Explore the journey
            </Link>
            <Link to="/packages?category=Mary%20Special%20Trips" className="featured-japan-promo__link">
              All Mary Special Trips
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturedJapanPromo
