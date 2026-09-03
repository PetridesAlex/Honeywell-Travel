import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import SportsSearch from './SportsSearch'

function SportsHero({
  title = 'Sports & Events',
  lead = 'Discover unforgettable sporting experiences around the world with Honeywell Travel.',
  eyebrow = 'Honeywell Travel',
  searchValue = '',
  onSearchChange,
  searchCategories = [],
  compact = false,
  backHref,
  backLabel,
  children,
}) {
  return (
    <section className={`st-hero${compact ? ' st-hero--compact' : ''}`}>
      <div className="st-hero__backdrop" aria-hidden>
        <div className="st-hero__glow" />
        <div className="st-hero__mesh" />
        <div className="st-hero__overlay" />
      </div>
      <div className="sports-tickets-container st-hero__inner">
        {backHref ? (
          <div className="st-hero__topline">
            <Link to={backHref} className="st-hero__back">
              <span className="st-hero__back-icon" aria-hidden>
                <ArrowLeft size={15} strokeWidth={2.4} />
              </span>
              <span className="st-hero__back-text">{backLabel || 'All sports'}</span>
            </Link>
          </div>
        ) : null}

        <div className="st-hero__copy">
          {eyebrow ? (
            <p className="st-hero__eyebrow">
              <span className="st-hero__eyebrow-mark" aria-hidden />
              <span className="st-hero__eyebrow-text">{eyebrow}</span>
            </p>
          ) : null}
          <h1 className="st-hero__title">{title}</h1>
          {lead ? <p className="st-hero__lead">{lead}</p> : null}
        </div>

        {typeof onSearchChange === 'function' ? (
          <SportsSearch
            value={searchValue}
            onChange={onSearchChange}
            categories={searchCategories}
          />
        ) : null}
        {children}
      </div>
    </section>
  )
}

export default SportsHero
