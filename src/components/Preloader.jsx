import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { hasCompletedPreloaderThisSession } from '../lib/preloaderSession'
import './Preloader.css'

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

const STAIR_COUNT = 10
/** Duration of each column’s upward exit (after its stagger starts). */
const STAIR_RISE_S = 0.72
/** Exit order: left → right, one stair after another. */
const STAIR_EXIT_STAGGER = 0.078
const STAIR_FULL_EXIT_S = (STAIR_COUNT - 1) * STAIR_EXIT_STAGGER + STAIR_RISE_S
const STAIR_RISE_MS = Math.ceil(STAIR_FULL_EXIT_S * 1000) + 80
const STAIR_EASE = [0.65, 0, 0.35, 1]

function Preloader({
  loading,
  variant = 'stairs',
  position = 'fixed',
  duration = 2500,
  loadingLines = ['Honeywell Travel', '#Live the Experience'],
  onComplete,
  children,
  className = '',
  zIndex = 9999,
}) {
  const skipSession = hasCompletedPreloaderThisSession()
  const [progress, setProgress] = useState(loading && !skipSession ? 0 : 100)
  const [showPreloader, setShowPreloader] = useState(Boolean(loading) && !skipSession)
  const [hideText, setHideText] = useState(!loading || skipSession)
  /** Stairs variant: columns exit one-by-one when loading completes. */
  const [stairsRaised, setStairsRaised] = useState(false)

  const rafRef = useRef(null)
  const hideTimerRef = useRef(null)
  const doneTimerRef = useRef(null)
  const onCompleteRef = useRef(onComplete)
  const showPreloaderRef = useRef(showPreloader)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    showPreloaderRef.current = showPreloader
  }, [showPreloader])

  const clearFrame = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  // Lock page scroll while the preloader covers the app.
  useEffect(() => {
    if (!showPreloader) return undefined
    const root = document.documentElement
    root.classList.add('preloader-active')
    return () => {
      root.classList.remove('preloader-active')
    }
  }, [showPreloader])

  // Progress tick while loading (first visit only).
  useEffect(() => {
    if (!loading || hasCompletedPreloaderThisSession()) return undefined

    let active = true
    const startTime = performance.now()

    const begin = () => {
      if (!active) return
      setShowPreloader(true)
      setHideText(false)
      setStairsRaised(false)
      setProgress(0)

      const tick = (now) => {
        if (!active) return
        const elapsed = now - startTime
        let next = (elapsed / duration) * 100

        // Ease near the end so we hold just under 100 until the app signals ready.
        if (next > 90) {
          const extra = next - 90
          next = 90 + extra * 0.12
        }

        next = Math.min(next, 99)
        setProgress(next)
        rafRef.current = requestAnimationFrame(tick)
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    const beginRaf = requestAnimationFrame(begin)

    return () => {
      active = false
      cancelAnimationFrame(beginRaf)
      clearFrame()
    }
  }, [loading, duration])

  // Exit sequence when loading finishes (Strict Mode safe).
  useEffect(() => {
    if (loading) return undefined
    if (!showPreloaderRef.current) return undefined

    let cancelled = false
    clearFrame()

    // Defer so we don't sync-set during effect setup (avoids cascade / Strict Mode jank).
    const startExit = () => {
      if (cancelled) return
      setProgress(100)
      setHideText(true)

      const finish = () => {
        if (cancelled) return
        setShowPreloader(false)
        doneTimerRef.current = setTimeout(() => {
          doneTimerRef.current = null
          if (!cancelled) onCompleteRef.current?.()
        }, 120)
      }

      if (variant === 'stairs') {
        setStairsRaised(true)
        hideTimerRef.current = setTimeout(() => {
          hideTimerRef.current = null
          finish()
        }, STAIR_RISE_MS)
      } else {
        const exitMs = variant === 'percentage' ? 900 : 450
        hideTimerRef.current = setTimeout(() => {
          hideTimerRef.current = null
          finish()
        }, exitMs)
      }
    }

    const startRaf = requestAnimationFrame(startExit)

    return () => {
      cancelled = true
      cancelAnimationFrame(startRaf)
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
      if (doneTimerRef.current) {
        clearTimeout(doneTimerRef.current)
        doneTimerRef.current = null
      }
    }
  }, [loading, variant])

  useEffect(
    () => () => {
      clearFrame()
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      if (doneTimerRef.current) clearTimeout(doneTimerRef.current)
    },
    [],
  )

  const line1 = loadingLines[0] ?? ''
  const line2 = loadingLines[1] ?? ''
  const textExitDuration = variant === 'stairs' ? Math.min(STAIR_FULL_EXIT_S * 0.55, 0.55) : 0.28
  const contentCovered = showPreloader

  const renderText = () => (
    <div className="preloader__text-wrap" aria-hidden="true">
      <motion.div
        className="preloader__brand"
        initial={{ opacity: 0, y: -12, scale: 0.94 }}
        animate={hideText ? { opacity: 0, y: -8, scale: 0.96 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: hideText ? textExitDuration : 0.7, ease: STAIR_EASE }}
      >
        <span className="preloader__brand-aura" aria-hidden="true" />
        <span className="preloader__brand-aura preloader__brand-aura--glow" aria-hidden="true" />
        <span className="preloader__brand-logo-wrap">
          <img
            src="/images/icons/honeywell-travel-logo.webp"
            alt=""
            className="preloader__brand-logo"
            width={188}
            height={188}
            decoding="async"
            fetchPriority="high"
            draggable={false}
          />
        </span>
      </motion.div>
      <div className="preloader__text-columns">
        {line1 ? (
          <motion.p
            className="preloader__text-line preloader__text-line--primary"
            initial={{ opacity: 0, y: 10 }}
            animate={hideText ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 }}
            transition={{
              duration: hideText ? textExitDuration : 0.58,
              delay: hideText ? 0 : 0.12,
              ease: STAIR_EASE,
            }}
          >
            {line1}
          </motion.p>
        ) : null}
        {line2 ? (
          <motion.p
            className="preloader__text-line preloader__text-line--tagline"
            initial={{ opacity: 0, y: 12 }}
            animate={hideText ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
            transition={{
              duration: hideText ? textExitDuration : 0.58,
              delay: hideText ? 0 : 0.28,
              ease: STAIR_EASE,
            }}
          >
            {line2}
          </motion.p>
        ) : null}
      </div>
    </div>
  )

  const renderStairs = () => {
    const stairs = Array.from({ length: STAIR_COUNT })
    return (
      <div
        className={cx(
          'preloader__panel',
          position === 'fixed' ? 'preloader__panel--fixed' : 'preloader__panel--absolute',
          stairsRaised && 'preloader__panel--exiting',
        )}
        style={{ zIndex }}
      >
        {stairs.map((_, index) => (
          <motion.div
            key={`stair-${index}`}
            className={cx('preloader__stair', index % 2 === 0 ? 'preloader__stair--odd' : 'preloader__stair--even')}
            initial={false}
            animate={stairsRaised ? { y: '-105%' } : { y: '0%' }}
            transition={{
              duration: stairsRaised ? STAIR_RISE_S : 0,
              delay: stairsRaised ? index * STAIR_EXIT_STAGGER : 0,
              ease: STAIR_EASE,
            }}
          />
        ))}
        <motion.div
          className="preloader__overlay-grad"
          initial={false}
          animate={{ opacity: hideText ? 0 : 1 }}
          transition={{ duration: textExitDuration, ease: STAIR_EASE }}
        />
        {renderText()}
      </div>
    )
  }

  const renderPercentage = () => (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: hideText ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className={cx(
        'preloader__panel',
        'preloader__percentage',
        position === 'fixed' ? 'preloader__panel--fixed' : 'preloader__panel--absolute',
      )}
      style={{ zIndex }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.floor(progress)}
    >
      <div className="preloader__percent-text">
        {Math.floor(progress)}
        <span>%</span>
      </div>
      {renderText()}
      <div className="preloader__bar">
        <motion.span
          className="preloader__bar-fill"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.08, ease: 'linear' }}
        />
      </div>
    </motion.div>
  )

  const renderCircle = () => (
    <div
      className={cx(
        'preloader__panel',
        position === 'fixed' ? 'preloader__panel--fixed' : 'preloader__panel--absolute',
      )}
      style={{ zIndex }}
    >
      <motion.div
        className="preloader__circle"
        initial={false}
        animate={hideText ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: STAIR_EASE }}
      />
      {renderText()}
    </div>
  )

  return (
    <div className={cx('preloader', className, showPreloader && 'preloader--active')}>
      <AnimatePresence mode="sync">
        {showPreloader ? (
          <motion.div
            key="preloader-layer"
            className="preloader__layer"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {variant === 'percentage' && renderPercentage()}
            {variant === 'circle' && renderCircle()}
            {variant !== 'percentage' && variant !== 'circle' && renderStairs()}
          </motion.div>
        ) : null}
      </AnimatePresence>
      {/* Keep content painted under the stairs so reveal has no visibility flash. */}
      <div
        className={cx('preloader__content', contentCovered && 'preloader__content--covered')}
        aria-hidden={contentCovered ? true : undefined}
        inert={contentCovered || undefined}
      >
        {children}
      </div>
    </div>
  )
}

export default Preloader
