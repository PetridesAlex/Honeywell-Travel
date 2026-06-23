import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { AVAILABILITY_STATUS, SUMMER_AVAILABILITY_SECTIONS } from '../data/summerPackageAvailability'
import { getAvailabilitySummary, getSummerAvailabilitySections } from '../utils/summerAvailability'
import './SummerAvailability.css'

const SECTION_FILTERS = [
  { id: 'all', label: 'All programmes' },
  ...SUMMER_AVAILABILITY_SECTIONS.map((section) => ({
    id: section.id,
    label: section.label,
  })),
]

function formatPrice(entry) {
  if (!entry.price || entry.priceOnRequest) return 'Price on request'
  return `From €${entry.price.toLocaleString()}`
}

function useCountUp(value, duration = 1100) {
  const [display, setDisplay] = useState(0)
  const displayRef = useRef(0)

  useEffect(() => {
    const target = Math.max(0, Math.round(Number(value) || 0))

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      displayRef.current = target
      setDisplay(target)
      return undefined
    }

    const from = displayRef.current
    let startTime = null
    let frameId = null

    const step = (timestamp) => {
      if (startTime === null) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      const next = Math.round(from + (target - from) * eased)
      setDisplay(next)
      displayRef.current = next
      if (progress < 1) {
        frameId = requestAnimationFrame(step)
      } else {
        setDisplay(target)
        displayRef.current = target
      }
    }

    frameId = requestAnimationFrame(step)
    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId)
    }
  }, [value, duration])

  return display
}

function SummerAvailabilityStatCount({ value }) {
  const count = useCountUp(value)
  return count
}

function SummerAvailability() {
  const [sectionFilter, setSectionFilter] = useState('all')
  const [destinationQuery, setDestinationQuery] = useState('')

  useLayoutEffect(() => {
    const resetTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      if (document.documentElement) document.documentElement.scrollTop = 0
      if (document.body) document.body.scrollTop = 0
    }
    resetTop()
    requestAnimationFrame(resetTop)
  }, [])

  const summary = useMemo(
    () => getAvailabilitySummary(sectionFilter, destinationQuery),
    [sectionFilter, destinationQuery],
  )

  const sections = useMemo(
    () => getSummerAvailabilitySections(sectionFilter, destinationQuery),
    [sectionFilter, destinationQuery],
  )

  return (
    <div className="summer-availability-page">
      <SEO
        title="Summer Package Availability 2026 | Honeywell Travel"
        description="Check remaining seat availability for Honeywell Travel summer and autumn 2026 packages — Greek islands, organised tours, Europe, long-haul, and fly & cruise."
        keywords="summer package availability 2026, διαθεσιμότητα θέσεων, summer holidays Cyprus, Honeywell Travel availability"
        url="https://www.honeywelltravel.com.cy/summer-availability"
      />

      <section className="summer-availability-hero">
        <div className="summer-availability-hero-bg" aria-hidden="true">
          <img
            src="/images/last-minute/last-minute-cover.webp"
            alt=""
            className="summer-availability-hero-bg-image"
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <div className="summer-availability-hero-content">
          <p className="summer-availability-eyebrow">Summer – Autumn 2026</p>
          <h1>Seat Availability</h1>
          <p className="summer-availability-hero-subtitle">
            Διαθεσιμότητα Θέσεων – Καλοκαίρι – Φθινόπωρο 2026
          </p>
        </div>
      </section>

      <div className="summer-availability-container">
        <div className="summer-availability-controls">
          <section className="summer-availability-summary" aria-label="Availability summary">
          <article className="summer-availability-stat summer-availability-stat--programmes">
            <p className="summer-availability-stat-label">Programmes</p>
            <strong>
              <SummerAvailabilityStatCount value={summary.packageCount} />
            </strong>
            <span>With space available</span>
          </article>
          <article className="summer-availability-stat summer-availability-stat--departures">
            <p className="summer-availability-stat-label">Departures</p>
            <strong>
              <SummerAvailabilityStatCount value={summary.departureCount} />
            </strong>
            <span>Open dates remaining</span>
          </article>
          <article className="summer-availability-stat summer-availability-stat--limited">
            <p className="summer-availability-stat-label">Limited</p>
            <strong>
              <SummerAvailabilityStatCount value={summary.limitedCount} />
            </strong>
            <span>Few seats left</span>
          </article>
          <article className="summer-availability-stat summer-availability-stat--categories">
            <p className="summer-availability-stat-label">Categories</p>
            <strong>
              <SummerAvailabilityStatCount value={summary.sectionCount} />
            </strong>
            <span>Travel programmes</span>
          </article>
        </section>

        <section className="summer-availability-toolbar">
          <div className="summer-availability-filters" role="tablist" aria-label="Category filters">
            {SECTION_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`summer-availability-filter${sectionFilter === filter.id ? ' active' : ''}`}
                onClick={() => setSectionFilter(filter.id)}
                role="tab"
                aria-selected={sectionFilter === filter.id}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <label className="summer-availability-search">
            <span className="sr-only">Search programmes</span>
            <input
              type="search"
              value={destinationQuery}
              onChange={(event) => setDestinationQuery(event.target.value)}
              placeholder="Search destination or programme..."
            />
          </label>
        </section>

        <section className="summer-availability-legend" aria-label="Availability legend">
          {Object.values(AVAILABILITY_STATUS).map((status) => (
            <span key={status.id} className={`summer-availability-legend-item tone-${status.tone}`}>
              {status.label}
            </span>
          ))}
          <span className="summer-availability-legend-note">(n) = seats remaining</span>
        </section>
        </div>

        {sections.length === 0 ? (
          <div className="summer-availability-empty-wrap">
            <div className="summer-availability-empty">
            <h2>No programmes match your search</h2>
            <p>Try another category or clear your search to see all available departures.</p>
            </div>
          </div>
        ) : (
          <div className="summer-availability-catalog">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="summer-availability-section">
                <header className="summer-availability-section-head">
                  <div>
                    <p className="summer-availability-section-eyebrow">{section.label}</p>
                    <h2>{section.labelEl}</h2>
                  </div>
                  <div className="summer-availability-section-meta">
                    <span className="summer-availability-section-meta-item">
                      <strong>{section.packageCount}</strong>
                      <span>Programmes</span>
                    </span>
                    <span className="summer-availability-section-meta-item">
                      <strong>{section.departureCount}</strong>
                      <span>Dates</span>
                    </span>
                  </div>
                </header>

                <div className="summer-availability-section-grid">
                  {section.packages.map((entry) => (
                    <article key={entry.id} className="summer-availability-card">
                      {entry.imageUrl ? (
                        <Link
                          to={entry.link}
                          className="summer-availability-card-media"
                          aria-hidden="true"
                          tabIndex={-1}
                        >
                          <img src={entry.imageUrl} alt="" loading="lazy" decoding="async" />
                        </Link>
                      ) : (
                        <div className="summer-availability-card-media summer-availability-card-media--placeholder" aria-hidden="true">
                          <span>{entry.displayTitle.slice(0, 1)}</span>
                        </div>
                      )}

                      <div className="summer-availability-card-body">
                        <div className="summer-availability-card-top">
                          <span className={`summer-availability-type summer-availability-type--${entry.packageType}`}>
                            {entry.packageType === 'individual' ? 'Individual' : 'Group'}
                          </span>
                          <span className="summer-availability-card-duration">{entry.duration}</span>
                        </div>

                        <h3>
                          {entry.link ? (
                            <Link to={entry.link}>{entry.displayTitle}</Link>
                          ) : (
                            entry.displayTitle
                          )}
                        </h3>

                        {entry.carrier ? (
                          <p className="summer-availability-card-carrier">{entry.carrier}</p>
                        ) : null}

                        <div className="summer-availability-dates" aria-label="Available departures">
                          {entry.departures.map((departure) => (
                            <span
                              key={`${entry.id}-${departure.date}`}
                              className={`summer-availability-date tone-${departure.statusMeta.tone}`}
                              title={departure.dateLabel}
                            >
                              <span className="summer-availability-date-value">{departure.date}</span>
                              {departure.placesLeft != null ? (
                                <span className="summer-availability-date-places">({departure.placesLeft})</span>
                              ) : null}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="summer-availability-card-side">
                        {entry.link ? (
                          <>
                            <p className="summer-availability-price">{formatPrice(entry)}</p>
                            <Link to={entry.link} className="summer-availability-cta">
                              View package
                            </Link>
                          </>
                        ) : (
                          <Link to="/contact/" className="summer-availability-cta summer-availability-cta--outline">
                            Enquire
                          </Link>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="summer-availability-footer-wrap">
          <footer className="summer-availability-footer">
            <div className="summer-availability-footer-inner">
              <p className="summer-availability-footer-eyebrow">Before you book</p>
              <p className="summer-availability-footer-note">
                This list reflects remaining availability as of our latest update.
                <span>
                  Seats are subject to change — please contact our team to confirm before booking.
                </span>
              </p>
              <div className="summer-availability-footer-divider" aria-hidden="true" />
              <div className="summer-availability-footer-links">
                <Link to="/contact/">Contact us</Link>
                <Link to="/build-your-trip/">Build your trip</Link>
                <Link to="/tour-category/summer-packages/">Browse summer packages</Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default SummerAvailability
