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
  loadingText = '#LIVE THE EXPERIENCE WITH HONEYWELL TRAVEL',
  onComplete,
  children,
  className = '',
  zIndex = 9999,
}) {
  const [progress, setProgress] = useState(loading ? 0 : 100)
  const [showPreloader, setShowPreloader] = useState(loading)
  const [hideText, setHideText] = useState(!loading)
  const rafRef = useRef(null)
  const textHiddenRef = useRef(false)

  useEffect(() => {
    let hideTimer
    let doneTimer

    if (loading) {
      const startTime = Date.now()
      let active = true
      textHiddenRef.current = false
      setShowPreloader(true)
      setHideText(false)
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

        if (next >= 96 && !textHiddenRef.current) {
          textHiddenRef.current = true
          setHideText(true)
        }

        rafRef.current = requestAnimationFrame(tick)
      }

      rafRef.current = requestAnimationFrame(tick)

      return () => {
        active = false
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      }
    }

    if (showPreloader) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      setProgress(100)
      setHideText(true)

      hideTimer = setTimeout(() => {
        setShowPreloader(false)
        doneTimer = setTimeout(() => {
          if (onComplete) onComplete()
        }, 700)
      }, variant === 'percentage' ? 1300 : 450)
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (hideTimer) clearTimeout(hideTimer)
      if (doneTimer) clearTimeout(doneTimer)
    }
  }, [loading, duration, onComplete, showPreloader, variant])

  const words = loadingText.split(' ')

  const renderText = () => (
    <div className="preloader__text-wrap" aria-hidden="true">
      <motion.div
        className="preloader__brand"
        initial={{ opacity: 0, y: -10, scale: 0.92 }}
        animate={hideText ? { opacity: 0, y: -8, scale: 0.92 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: hideText ? 0.25 : 0.65, ease: [0.65, 0, 0.35, 1] }}
      >
        <img
          src="/images/icons/honeywell-travel-logo.webp"
          alt="Honeywell Travel"
          className="preloader__brand-logo"
        />
      </motion.div>
      <div className="preloader__text-row">
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={{ opacity: 0, filter: 'blur(8px)', y: 8 }}
          animate={hideText ? { opacity: 0, filter: 'blur(8px)', y: 8 } : { opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{
            duration: hideText ? 0.25 : 0.6,
            delay: hideText ? 0 : index * 0.045,
            ease: [0.65, 0, 0.35, 1],
          }}
          className="preloader__text-word"
        >
          {word}
        </motion.span>
      ))}
      </div>
    </div>
  )

  const renderStairs = () => {
    const stairs = Array.from({ length: 10 })
    return (
      <div className={cx('preloader__panel', position === 'fixed' ? 'preloader__panel--fixed' : 'preloader__panel--absolute')} style={{ zIndex }}>
        {stairs.map((_, index) => (
          <motion.div
            key={`stair-${index}`}
            className="preloader__stair"
            initial={{ y: '0%' }}
            animate={{ y: '0%' }}
            exit={{ y: '-100%' }}
            transition={{
              duration: 0.52,
              delay: index * 0.055,
              ease: [0.65, 0, 0.35, 1],
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
      <div className={cx('preloader__content', showPreloader && 'preloader__content--hidden')}>
        {children}
      </div>
    </div>
  )
}

export default Preloader
