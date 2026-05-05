import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import './Preloader.css'

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

function Preloader({
  loading,
  variant = 'stairs',
  position = 'fixed',
  duration = 2500,
  loadingLines = ['LIVE THE EXPERIENCE', 'HONEYWELL TRAVEL'],
  onComplete,
  children,
  className = '',
  zIndex = 9999,
}) {
  const [progress, setProgress] = useState(loading ? 0 : 100)
  const [showPreloader, setShowPreloader] = useState(loading)
  const [hideText, setHideText] = useState(!loading)
  /** Stairs variant: columns exit one-by-one when loading completes. */
  const [stairsRaised, setStairsRaised] = useState(false)
  const rafRef = useRef(null)
  const exitStartedRef = useRef(false)

  const STAIR_COUNT = 10
  /** Duration of each column’s upward exit (after its stagger starts). */
  const STAIR_RISE_S = 0.72
  /** Exit order: left → right, one stair after another. */
  const STAIR_EXIT_STAGGER = 0.078
  const STAIR_FULL_EXIT_S = (STAIR_COUNT - 1) * STAIR_EXIT_STAGGER + STAIR_RISE_S
  const STAIR_RISE_MS = Math.ceil(STAIR_FULL_EXIT_S * 1000) + 100
  /** Entrance: wave up from below. */
  const STAIR_ENTER_S = 0.62
  const STAIR_ENTER_STAGGER = 0.065

  useEffect(() => {
    let hideTimer
    let doneTimer

    if (loading) {
      exitStartedRef.current = false
      const startTime = Date.now()
      let active = true
      setShowPreloader(true)
      setHideText(false)
      setStairsRaised(false)
      setProgress(0)

      const tick = () => {
        if (!active) return
        const elapsed = Date.now() - startTime
        let next = (elapsed / duration) * 100

        if (next > 90) {
          const extra = next - 90
          next = 90 + extra * 0.1
        }

        next = Math.min(next, 99)
        setProgress(next)

        rafRef.current = requestAnimationFrame(tick)
      }

      rafRef.current = requestAnimationFrame(tick)

      return () => {
        active = false
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      }
    }

    if (!loading && showPreloader && !exitStartedRef.current) {
      exitStartedRef.current = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      setProgress(100)
      setHideText(true)

      if (variant === 'stairs') {
        setStairsRaised(true)
        hideTimer = setTimeout(() => {
          setShowPreloader(false)
          doneTimer = setTimeout(() => {
            if (onComplete) onComplete()
          }, 700)
        }, STAIR_RISE_MS)
      } else {
        hideTimer = setTimeout(() => {
          setShowPreloader(false)
          doneTimer = setTimeout(() => {
            if (onComplete) onComplete()
          }, 700)
        }, variant === 'percentage' ? 1300 : 450)
      }
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (hideTimer) clearTimeout(hideTimer)
      if (doneTimer) clearTimeout(doneTimer)
    }
  }, [loading, duration, onComplete, showPreloader, variant])

  const line1Words = loadingLines[0]?.split(/\s+/).filter(Boolean) ?? []
  const line2Words = loadingLines[1]?.split(/\s+/).filter(Boolean) ?? []

  const textExitDuration = variant === 'stairs' ? STAIR_FULL_EXIT_S : 0.28

  const renderText = () => (
    <div className="preloader__text-wrap" aria-hidden="true">
      <motion.div
        className="preloader__brand"
        initial={{ opacity: 0, y: -16, scale: 0.88 }}
        animate={hideText ? { opacity: 0, y: -10, scale: 0.92 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: hideText ? textExitDuration : 0.75, ease: [0.65, 0, 0.35, 1] }}
      >
        <span className="preloader__brand-aura" aria-hidden="true" />
        <span className="preloader__brand-aura preloader__brand-aura--glow" aria-hidden="true" />
        <span className="preloader__brand-logo-wrap">
          <img
            src="/images/icons/honeywell-travel-logo.webp"
            alt="Honeywell Travel"
            className="preloader__brand-logo"
          />
        </span>
      </motion.div>
      <div className="preloader__text-columns">
        <div className="preloader__text-line preloader__text-line--tagline">
          {line1Words.map((word, i) => {
            const index = i
            return (
              <motion.span
                key={`l1-${word}-${i}`}
                initial={{ opacity: 0, filter: 'blur(10px)', y: 12 }}
                animate={
                  hideText ? { opacity: 0, filter: 'blur(10px)', y: 12 } : { opacity: 1, filter: 'blur(0px)', y: 0 }
                }
                transition={{
                  duration: hideText ? textExitDuration : 0.62,
                  delay: hideText ? 0 : index * 0.05,
                  ease: [0.65, 0, 0.35, 1],
                }}
                className="preloader__text-word"
              >
                {word}
              </motion.span>
            )
          })}
        </div>
        <div className="preloader__text-line preloader__text-line--brand">
          {line2Words.map((word, i) => {
            const index = line1Words.length + i
            return (
              <motion.span
                key={`l2-${word}-${i}`}
                initial={{ opacity: 0, filter: 'blur(10px)', y: 14 }}
                animate={
                  hideText ? { opacity: 0, filter: 'blur(10px)', y: 14 } : { opacity: 1, filter: 'blur(0px)', y: 0 }
                }
                transition={{
                  duration: hideText ? textExitDuration : 0.62,
                  delay: hideText ? 0 : index * 0.05,
                  ease: [0.65, 0, 0.35, 1],
                }}
                className="preloader__text-word preloader__text-word--brand"
              >
                {word}
              </motion.span>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderStairs = () => {
    const stairs = Array.from({ length: STAIR_COUNT })
    const stairEase = [0.65, 0, 0.35, 1]
    return (
      <div className={cx('preloader__panel', position === 'fixed' ? 'preloader__panel--fixed' : 'preloader__panel--absolute')} style={{ zIndex }}>
        {stairs.map((_, index) => (
          <motion.div
            key={`stair-${index}`}
            className="preloader__stair"
            initial={{ y: '100%' }}
            animate={stairsRaised ? { y: '-100%' } : { y: '0%' }}
            transition={{
              duration: stairsRaised ? STAIR_RISE_S : STAIR_ENTER_S,
              delay: stairsRaised ? index * STAIR_EXIT_STAGGER : index * STAIR_ENTER_STAGGER,
              ease: stairEase,
            }}
          />
        ))}
        <div className="preloader__overlay-grad" />
        {renderText()}
      </div>
    )
  }

  const renderPercentage = () => (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
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
        <motion.span className="preloader__bar-fill" initial={{ width: '0%' }} animate={{ width: `${progress}%` }} transition={{ duration: 0.05, ease: 'linear' }} />
      </div>
    </motion.div>
  )

  const renderCircle = () => (
    <div className={cx('preloader__panel', position === 'fixed' ? 'preloader__panel--fixed' : 'preloader__panel--absolute')} style={{ zIndex }}>
      <motion.div
        className="preloader__circle"
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
      />
      {renderText()}
    </div>
  )

  return (
    <div className={cx('preloader', className)}>
      <AnimatePresence>
        {showPreloader && (
          <div key="preloader-layer">
            {variant === 'percentage' && renderPercentage()}
            {variant === 'circle' && renderCircle()}
            {variant !== 'percentage' && variant !== 'circle' && renderStairs()}
          </div>
        )}
      </AnimatePresence>
      {/* Unhide as soon as loading finishes so stairs reveal the live site underneath (same moment). */}
      <div className={cx('preloader__content', loading && 'preloader__content--hidden')}>
        {children}
      </div>
    </div>
  )
}

export default Preloader
