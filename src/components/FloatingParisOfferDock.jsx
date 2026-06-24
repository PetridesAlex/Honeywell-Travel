import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  getParisOfferCountdownRemaining,
  getParisOfferCountdownTarget,
  PARIS_LAST_MINUTE_OFFER,
  PARIS_LAST_MINUTE_PATH,
} from '../data/parisLastMinuteFlights'
import './FloatingParisOfferDock.css'

const offer = PARIS_LAST_MINUTE_OFFER

function padTime(value) {
  return String(value).padStart(2, '0')
}

function FloatingParisOfferDock() {
  const location = useLocation()
  const countdownTarget = useMemo(() => getParisOfferCountdownTarget(offer), [])
  const [remaining, setRemaining] = useState(() =>
    getParisOfferCountdownRemaining(countdownTarget),
  )

  const isHidden =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith(PARIS_LAST_MINUTE_PATH)

  useEffect(() => {
    if (!countdownTarget) return undefined

    const tick = () => {
      setRemaining(getParisOfferCountdownRemaining(countdownTarget))
    }

    tick()
    const intervalMs = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 60000
      : 1000
    const intervalId = window.setInterval(tick, intervalMs)

    return () => window.clearInterval(intervalId)
  }, [countdownTarget])

  if (isHidden) return null

  const timerLabel = remaining
    ? `${remaining.days}d ${padTime(remaining.hours)}h ${padTime(remaining.minutes)}m`
    : 'Limited seats'
  const ariaLabel = remaining
    ? `Last-minute flights to Paris from €460. Offer ends in ${remaining.days} days, ${remaining.hours} hours, and ${remaining.minutes} minutes`
    : 'Last-minute flights to Paris from €460. Limited seats available'

  return (
    <Link
      to={PARIS_LAST_MINUTE_PATH}
      className={`floating-paris-offer-dock${remaining && remaining.days <= 7 ? ' floating-paris-offer-dock--urgent' : ''}`}
      aria-label={ariaLabel}
      title={`Last-minute flights to Paris — €460 · ${timerLabel}`}
    >
      <span className="floating-paris-offer-dock__pulse" aria-hidden="true" />
      <span className="floating-paris-offer-dock__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z" />
        </svg>
      </span>
      <span className="floating-paris-offer-dock__label">
        <span className="floating-paris-offer-dock__destination">Paris</span>
        <span className="floating-paris-offer-dock__price">from €460</span>
        <span className="floating-paris-offer-dock__timer" aria-hidden="true">
          <span className="floating-paris-offer-dock__timer-label">Limited</span>
          <span className="floating-paris-offer-dock__timer-value">
            {remaining ? (
              <>
                {remaining.days}d {padTime(remaining.hours)}:{padTime(remaining.minutes)}:
                {padTime(remaining.seconds)}
              </>
            ) : (
              'Book now'
            )}
          </span>
        </span>
      </span>
    </Link>
  )
}

export default FloatingParisOfferDock
