import { useCallback, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getPackagesByCategory } from '../data/packages'
import { getPackageLeadPrice, mapPackagesToModalCards } from '../utils/modalCardFromPackage'
import ModalCards from './ModalCards'

function TourCategoryPackageRow({ slug, category, title, description }) {
  const { i18n } = useTranslation()
  const trackRef = useRef(null)

  const packages = useMemo(() => {
    return getPackagesByCategory(category)
      .slice()
      .sort((a, b) => getPackageLeadPrice(a) - getPackageLeadPrice(b))
  }, [category])

  const cards = useMemo(() => mapPackagesToModalCards(packages, i18n), [packages, i18n])

  const scrollByCard = useCallback((direction = 1) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('.modal-card')
    if (!card) return

    const gap = Number.parseFloat(getComputedStyle(track).gap) || 20
    const step = card.offsetWidth + gap
    const maxScroll = track.scrollWidth - track.clientWidth

    if (direction > 0 && track.scrollLeft >= maxScroll - 4) {
      track.scrollTo({ left: 0, behavior: 'smooth' })
      return
    }

    if (direction < 0 && track.scrollLeft <= 4) {
      track.scrollTo({ left: maxScroll, behavior: 'smooth' })
      return
    }

    track.scrollBy({ left: direction * step, behavior: 'smooth' })
  }, [])

  if (packages.length === 0) return null

  return (
    <article className="tour-category-row" aria-label={title}>
      <div className="tour-category-row__header">
        <div className="tour-category-row__heading">
          <p className="tour-category-row__eyebrow">Honeywell Travel</p>
          <h3 className="tour-category-row__title">{title}</h3>
          {description ? <p className="tour-category-row__description">{description}</p> : null}
        </div>
        <div className="tour-category-row__actions">
          <div className="tour-category-row__nav" aria-hidden={packages.length <= 1}>
            <button
              type="button"
              className="tour-category-row__nav-btn"
              aria-label={`Scroll ${title} packages left`}
              onClick={() => scrollByCard(-1)}
            >
              ←
            </button>
            <button
              type="button"
              className="tour-category-row__nav-btn"
              aria-label={`Scroll ${title} packages right`}
              onClick={() => scrollByCard(1)}
            >
              →
            </button>
          </div>
          <Link to={`/tour-category/${slug}/`} className="tour-category-row__view-all">
            View all
          </Link>
        </div>
      </div>

      <div className="tour-category-row__scroll-shell">
        <div className="tour-category-row__fade tour-category-row__fade--left" aria-hidden="true" />
        <div className="tour-category-row__fade tour-category-row__fade--right" aria-hidden="true" />
        <div ref={trackRef} className="tour-category-row__track">
          <ModalCards
            cards={cards}
            className="tour-category-modal-cards"
            animationSpeed="fast"
            showCloseButton
          />
        </div>
      </div>
    </article>
  )
}

export default TourCategoryPackageRow
