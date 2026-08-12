import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router-dom'
import './ModalCards.css'
import { FALLBACK_PACKAGE_CARD_IMAGE } from '../utils/packageCardImage'
import DepartureCountdownBadge from './DepartureCountdownBadge'
import PackageCompletedBadge from './PackageCompletedBadge'
import FavoriteToggleButton from './FavoriteToggleButton'
import './FavoritesTrigger.css'

const ANIMATION_SPEEDS = {
  slow: { duration: 0.62, springStiffness: 205, springDamping: 25 },
  normal: { duration: 0.42, springStiffness: 310, springDamping: 30 },
  fast: { duration: 0.24, springStiffness: 400, springDamping: 35 },
  none: { duration: 0, springStiffness: 500, springDamping: 50 }
}

const getCardGradient = (card, defaultGradient) => {
  const baseColor = card.gradientColor || defaultGradient
  const normalized = String(baseColor).trim().toLowerCase()
  // Keep a premium consistent palette for the price band; avoid green tones.
  const preferredColor = normalized === '#0d5c2e' ? '#c41230' : baseColor
  return `linear-gradient(140deg, ${preferredColor} 0%, #7f1d1d 45%, #111827 100%)`
}

function ModalCardDepartureDates({ dates, className = '' }) {
  if (!Array.isArray(dates) || dates.length === 0) return null

  const label = dates.length > 1 ? 'Departures' : 'Departure'

  return (
    <div className={`modal-card-departures ${className}`.trim()} aria-label={label}>
      <span className="modal-card-departures__label">{label}</span>
      <div className="modal-card-departures__list">
        {dates.map((date) => (
          <span key={date} className="modal-card-departures__item">
            {date}
          </span>
        ))}
      </div>
    </div>
  )
}

function ModalCards({
  cards = [],
  className = '',
  gradientColor = '#c41230',
  animationSpeed = 'normal',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  ariaLabel = 'Package details modal',
  backdropGradientPosition = '50% 10%'
}) {
  const [preferLiteMotion, setPreferLiteMotion] = useState(() => {
    if (typeof window === 'undefined') return false
    return (
      window.matchMedia('(max-width: 768px)').matches
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  })

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 768px)')
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      setPreferLiteMotion(mobileQuery.matches || motionQuery.matches)
    }
    sync()
    mobileQuery.addEventListener('change', sync)
    motionQuery.addEventListener('change', sync)
    return () => {
      mobileQuery.removeEventListener('change', sync)
      motionQuery.removeEventListener('change', sync)
    }
  }, [])

  const effectiveSpeed = preferLiteMotion ? 'none' : animationSpeed
  const speedConfig = ANIMATION_SPEEDS[effectiveSpeed] || ANIMATION_SPEEDS.normal
  const isAnimationDisabled = effectiveSpeed === 'none'

  const [selectedCard, setSelectedCard] = useState(null)
  const [mounted, setMounted] = useState(() => preferLiteMotion || animationSpeed === 'none')

  const springTransition = useMemo(
    () => ({
      type: 'spring',
      stiffness: speedConfig.springStiffness,
      damping: speedConfig.springDamping
    }),
    [speedConfig.springDamping, speedConfig.springStiffness]
  )

  useEffect(() => {
    if (isAnimationDisabled) return undefined

    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [isAnimationDisabled])

  useEffect(() => {
    if (selectedCard) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedCard])

  useEffect(() => {
    if (!closeOnEscape || !selectedCard) return undefined

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedCard(null)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeOnEscape, selectedCard])

  const closeModal = () => {
    setSelectedCard(null)
  }

  const resetScrollTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    if (document.documentElement) document.documentElement.scrollTop = 0
    if (document.body) document.body.scrollTop = 0
  }

  const renderCardOverlay = (card) => (
    <div className="modal-card-overlay">
      {card.supplier ? (
        <div className="modal-card-top-row">
          <span className="modal-card-supplier">{card.supplier}</span>
        </div>
      ) : null}

      <span className="modal-card-destination">{card.destination}</span>
      <h3 className="modal-card-title">{card.title}</h3>
      {card.secondaryTitle ? <p className="modal-card-secondary-title">{card.secondaryTitle}</p> : null}

      <div className="modal-card-meta">
        <span>{card.duration}</span>
        <span>{card.category}</span>
      </div>

      <ModalCardDepartureDates dates={card.departureDates} />

      <div className="modal-card-footer">
        <span className="modal-card-price">From EUR {Number(card.price || 0).toLocaleString()}</span>
        <span className="modal-card-cta">Open</span>
      </div>
    </div>
  )

  const handleImageError = (event) => {
    const el = event.currentTarget
    if (!el.src.includes('patra1.webp')) el.src = FALLBACK_PACKAGE_CARD_IMAGE
  }

  return (
    <div className={`modal-cards ${className}${isAnimationDisabled ? ' modal-cards--static' : ''}`}>
      <div className="modal-cards-grid">
        {cards.map((card) =>
          isAnimationDisabled ? (
            <button
              key={card.id}
              type="button"
              className="modal-card"
              onClick={() => setSelectedCard(card)}
            >
              <img
                src={card.imageUrl || FALLBACK_PACKAGE_CARD_IMAGE}
                alt={card.title}
                className="modal-card-image"
                loading="lazy"
                decoding="async"
                onError={handleImageError}
              />
              <div className="modal-card-shade" />
              <div className="modal-card-favorite">
                <FavoriteToggleButton packageId={card.id} />
              </div>
              {card.statusBadge === 'completed' ? (
                <PackageCompletedBadge variant="card" />
              ) : card.departureCountdown ? (
                <DepartureCountdownBadge countdown={card.departureCountdown} variant="card" />
              ) : null}
              <span className={`modal-card-type modal-card-type--${card.packageType || 'individual'}`}>
                {card.packageType === 'group' ? 'Group' : 'Individual'}
              </span>
              {renderCardOverlay(card)}
            </button>
          ) : (
            <motion.button
              key={card.id}
              type="button"
              layoutId={`card-${card.id}`}
              className="modal-card"
              onClick={() => setSelectedCard(card)}
              whileTap={{ scale: 0.985 }}
              transition={springTransition}
            >
              <motion.img
                layoutId={`image-${card.id}`}
                src={card.imageUrl || FALLBACK_PACKAGE_CARD_IMAGE}
                alt={card.title}
                className="modal-card-image"
                onError={handleImageError}
              />
              <div className="modal-card-shade" />
              <div className="modal-card-favorite">
                <FavoriteToggleButton packageId={card.id} />
              </div>
              {card.statusBadge === 'completed' ? (
                <PackageCompletedBadge variant="card" />
              ) : card.departureCountdown ? (
                <DepartureCountdownBadge countdown={card.departureCountdown} variant="card" />
              ) : null}
              <span className={`modal-card-type modal-card-type--${card.packageType || 'individual'}`}>
                {card.packageType === 'group' ? 'Group' : 'Individual'}
              </span>
              <motion.div layoutId={`overlay-${card.id}`} className="modal-card-overlay">
                {card.supplier ? (
                  <div className="modal-card-top-row">
                    <span className="modal-card-supplier">{card.supplier}</span>
                  </div>
                ) : null}

                <span className="modal-card-destination">{card.destination}</span>
                <motion.h3 layoutId={`title-${card.id}`} className="modal-card-title">
                  {card.title}
                </motion.h3>
                {card.secondaryTitle ? <p className="modal-card-secondary-title">{card.secondaryTitle}</p> : null}

                <div className="modal-card-meta">
                  <span>{card.duration}</span>
                  <span>{card.category}</span>
                </div>

                <ModalCardDepartureDates dates={card.departureDates} />

                <div className="modal-card-footer">
                  <span className="modal-card-price">From EUR {Number(card.price || 0).toLocaleString()}</span>
                  <span className="modal-card-cta">Open</span>
                </div>
              </motion.div>
            </motion.button>
          ),
        )}
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence mode="wait">
            {selectedCard ? (
              isAnimationDisabled ? (
                <>
                  <div
                    className={`modal-cards-backdrop${closeOnBackdropClick ? ' is-clickable' : ''}`}
                    onClick={closeOnBackdropClick ? closeModal : undefined}
                    style={{
                      background: `radial-gradient(125% 125% at ${backdropGradientPosition}, rgba(255, 255, 255, 0.88) 0%, rgba(17, 24, 39, 0.92) 38%, ${selectedCard.gradientColor || gradientColor} 100%)`,
                    }}
                    role="button"
                    tabIndex={closeOnBackdropClick ? 0 : -1}
                    aria-label={closeOnBackdropClick ? 'Close package modal' : undefined}
                  />

                  <div className="modal-cards-dialog-wrap" role="dialog" aria-modal="true" aria-label={ariaLabel}>
                    <article className="modal-cards-dialog" onClick={(event) => event.stopPropagation()}>
                      <div className="modal-cards-hero">
                        <img
                          src={selectedCard.imageUrl || FALLBACK_PACKAGE_CARD_IMAGE}
                          alt={selectedCard.title}
                          className="modal-cards-hero-image"
                          decoding="async"
                          onError={handleImageError}
                        />
                        <div className="modal-cards-hero-shade" />
                        <div className="modal-card-favorite">
                          <FavoriteToggleButton packageId={selectedCard.id} />
                        </div>
                        {selectedCard.statusBadge === 'completed' ? (
                          <PackageCompletedBadge variant="hero" />
                        ) : selectedCard.departureCountdown ? (
                          <DepartureCountdownBadge countdown={selectedCard.departureCountdown} variant="hero" />
                        ) : null}
                        <span className={`modal-card-type modal-card-type--${selectedCard.packageType || 'individual'}`}>
                          {selectedCard.packageType === 'group' ? 'Group' : 'Individual'}
                        </span>
                        <div className="modal-cards-hero-overlay">
                          {selectedCard.supplier ? (
                            <div className="modal-cards-hero-top-row">
                              <span className="modal-card-supplier">{selectedCard.supplier}</span>
                            </div>
                          ) : null}
                          <span className="modal-card-destination">{selectedCard.destination}</span>
                          <h3 className="modal-cards-hero-title">{selectedCard.title}</h3>
                          {selectedCard.secondaryTitle ? (
                            <p className="modal-cards-hero-subtitle">{selectedCard.secondaryTitle}</p>
                          ) : null}
                          <div className="modal-card-meta">
                            <span>{selectedCard.duration}</span>
                            <span>{selectedCard.category}</span>
                          </div>
                          <ModalCardDepartureDates
                            dates={selectedCard.departureDates}
                            className="modal-card-departures--hero"
                          />
                        </div>
                      </div>

                      <div className="modal-cards-content">
                        <div
                          className="modal-cards-highlight"
                          style={{ background: getCardGradient(selectedCard, gradientColor) }}
                        >
                          <span className="modal-cards-highlight-label">From</span>
                          <strong>EUR {Number(selectedCard.price || 0).toLocaleString()}</strong>
                        </div>

                        <div className="modal-cards-actions">
                          <Link
                            to={selectedCard.link}
                            className="modal-cards-action primary"
                            onClick={() => {
                              resetScrollTop()
                              closeModal()
                            }}
                          >
                            View full package details
                          </Link>
                          <button type="button" className="modal-cards-action secondary" onClick={closeModal}>
                            Close
                          </button>
                        </div>
                      </div>

                      {showCloseButton ? (
                        <button type="button" className="modal-cards-close-btn" onClick={closeModal} aria-label="Close modal">
                          <span />
                          <span />
                        </button>
                      ) : null}
                    </article>
                  </div>
                </>
              ) : (
              <>
                <motion.div
                  className={`modal-cards-backdrop${closeOnBackdropClick ? ' is-clickable' : ''}`}
                  initial={isAnimationDisabled ? { opacity: 1 } : { opacity: 0, backdropFilter: 'blur(0px)' }}
                  animate={isAnimationDisabled ? { opacity: 1 } : { opacity: 1, backdropFilter: 'blur(7px)' }}
                  exit={isAnimationDisabled ? { opacity: 1 } : { opacity: 0, backdropFilter: 'blur(0px)' }}
                  transition={
                    isAnimationDisabled
                      ? { duration: 0 }
                      : { duration: speedConfig.duration, ease: [0.32, 0.72, 0, 1] }
                  }
                  onClick={closeOnBackdropClick ? closeModal : undefined}
                  style={{
                    background: `radial-gradient(125% 125% at ${backdropGradientPosition}, rgba(255, 255, 255, 0.88) 0%, rgba(17, 24, 39, 0.92) 38%, ${selectedCard.gradientColor || gradientColor} 100%)`
                  }}
                  role="button"
                  tabIndex={closeOnBackdropClick ? 0 : -1}
                  aria-label={closeOnBackdropClick ? 'Close package modal' : undefined}
                />

                <div className="modal-cards-dialog-wrap" role="dialog" aria-modal="true" aria-label={ariaLabel}>
                  <motion.article
                    layoutId={`card-${selectedCard.id}`}
                    className="modal-cards-dialog"
                    initial={isAnimationDisabled ? { opacity: 1 } : { opacity: 0, scale: 0.94 }}
                    animate={isAnimationDisabled ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                    exit={isAnimationDisabled ? { opacity: 1 } : { opacity: 0, scale: 0.94 }}
                    transition={isAnimationDisabled ? { duration: 0 } : springTransition}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="modal-cards-hero">
                      <motion.img
                        layoutId={`image-${selectedCard.id}`}
                        src={selectedCard.imageUrl || FALLBACK_PACKAGE_CARD_IMAGE}
                        alt={selectedCard.title}
                        className="modal-cards-hero-image"
                        onError={(e) => {
                          const el = e.currentTarget
                          if (!el.src.includes('patra1.webp')) el.src = FALLBACK_PACKAGE_CARD_IMAGE
                        }}
                      />
                      <div className="modal-cards-hero-shade" />
                      <div className="modal-card-favorite">
                        <FavoriteToggleButton packageId={selectedCard.id} />
                      </div>
                      {selectedCard.statusBadge === 'completed' ? (
                        <PackageCompletedBadge variant="hero" />
                      ) : selectedCard.departureCountdown ? (
                        <DepartureCountdownBadge countdown={selectedCard.departureCountdown} variant="hero" />
                      ) : null}
                      <span className={`modal-card-type modal-card-type--${selectedCard.packageType || 'individual'}`}>
                        {selectedCard.packageType === 'group' ? 'Group' : 'Individual'}
                      </span>
                      <motion.div layoutId={`overlay-${selectedCard.id}`} className="modal-cards-hero-overlay">
                        {selectedCard.supplier ? (
                          <div className="modal-cards-hero-top-row">
                            <span className="modal-card-supplier">{selectedCard.supplier}</span>
                          </div>
                        ) : null}
                        <span className="modal-card-destination">{selectedCard.destination}</span>
                        <motion.h3 layoutId={`title-${selectedCard.id}`} className="modal-cards-hero-title">
                          {selectedCard.title}
                        </motion.h3>
                        {selectedCard.secondaryTitle ? (
                          <p className="modal-cards-hero-subtitle">{selectedCard.secondaryTitle}</p>
                        ) : null}
                        <div className="modal-card-meta">
                          <span>{selectedCard.duration}</span>
                          <span>{selectedCard.category}</span>
                        </div>
                        <ModalCardDepartureDates
                          dates={selectedCard.departureDates}
                          className="modal-card-departures--hero"
                        />
                      </motion.div>
                    </div>

                    <div className="modal-cards-content">
                      <div
                        className="modal-cards-highlight"
                        style={{ background: getCardGradient(selectedCard, gradientColor) }}
                      >
                        <span className="modal-cards-highlight-label">From</span>
                        <strong>EUR {Number(selectedCard.price || 0).toLocaleString()}</strong>
                      </div>

                      <div className="modal-cards-actions">
                        <Link
                          to={selectedCard.link}
                          className="modal-cards-action primary"
                          onClick={() => {
                            resetScrollTop()
                            requestAnimationFrame(resetScrollTop)
                            setTimeout(resetScrollTop, 60)
                            closeModal()
                          }}
                        >
                          View full package details
                        </Link>
                        <button type="button" className="modal-cards-action secondary" onClick={closeModal}>
                          Close
                        </button>
                      </div>
                    </div>

                    {showCloseButton ? (
                      <button type="button" className="modal-cards-close-btn" onClick={closeModal} aria-label="Close modal">
                        <span />
                        <span />
                      </button>
                    ) : null}
                  </motion.article>
                </div>
              </>
              )
            ) : null}
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}

export default ModalCards
