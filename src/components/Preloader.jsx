import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { hasCompletedPreloaderThisSession } from '../lib/preloaderSession'
import './Preloader.css'

const EXIT_FADE_MS = 480
const LINE_ROTATE_MS = 2100

const PRELOADER_LINES = [
  {
    id: 'expertise',
    text: '30 years of expertise in the travel industry',
    tone: 'serif',
  },
  {
    id: 'live',
    text: '#LIVETHEEXPERIENCE',
    tone: 'accent',
  },
  {
    id: 'welcome',
    text: 'Welcome to Honeywell Travel',
    tone: 'serif',
  },
]

function Preloader({
  loading,
  duration = 7000,
  onComplete,
  children,
  className = '',
  zIndex = 9999,
}) {
  const skipSession = hasCompletedPreloaderThisSession()
  const [showPreloader, setShowPreloader] = useState(Boolean(loading) && !skipSession)
  const [exiting, setExiting] = useState(false)
  const [lineIndex, setLineIndex] = useState(0)

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

  useEffect(() => {
    if (!showPreloader) return undefined
    const root = document.documentElement
    root.classList.add('preloader-active')
    return () => {
      root.classList.remove('preloader-active')
    }
  }, [showPreloader])

  useEffect(() => {
    if (!showPreloader || exiting) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return undefined

    const timer = window.setInterval(() => {
      setLineIndex((prev) => (prev + 1) % PRELOADER_LINES.length)
    }, LINE_ROTATE_MS)

    return () => window.clearInterval(timer)
  }, [showPreloader, exiting])

  useEffect(() => {
    if (!loading || hasCompletedPreloaderThisSession()) return undefined
    setShowPreloader(true)
    setExiting(false)
    setLineIndex(0)
    return undefined
  }, [loading, duration])

  useEffect(() => {
    if (loading) return undefined
    if (!showPreloaderRef.current) return undefined

    let cancelled = false

    const startExit = () => {
      if (cancelled) return
      setExiting(true)
      hideTimerRef.current = setTimeout(() => {
        hideTimerRef.current = null
        if (cancelled) return
        setShowPreloader(false)
        doneTimerRef.current = setTimeout(() => {
          doneTimerRef.current = null
          if (!cancelled) onCompleteRef.current?.()
        }, 80)
      }, EXIT_FADE_MS)
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
  }, [loading])

  useEffect(
    () => () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      if (doneTimerRef.current) clearTimeout(doneTimerRef.current)
    },
    [],
  )

  const contentCovered = showPreloader
  const activeLine = PRELOADER_LINES[lineIndex]

  return (
    <div className={['preloader', className, showPreloader ? 'preloader--active' : ''].filter(Boolean).join(' ')}>
      <AnimatePresence>
        {showPreloader ? (
          <motion.div
            key="preloader-simple"
            className="preloader__simple"
            style={{ zIndex }}
            initial={{ opacity: 1 }}
            animate={{ opacity: exiting ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: EXIT_FADE_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
            aria-busy="true"
            aria-live="polite"
          >
            <div className="preloader__simple-lockup">
              <div className="preloader__simple-brand">
                <img
                  src="/images/icons/honeywell-travel-logo.webp"
                  alt="Honeywell Travel"
                  className="preloader__simple-logo"
                  width={280}
                  height={280}
                  decoding="async"
                  fetchPriority="high"
                  draggable={false}
                />
              </div>

              <div className="preloader__simple-lines">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={activeLine.id}
                    className={`preloader__simple-line preloader__simple-line--${activeLine.tone}`}
                    initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {activeLine.text}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div
        className={['preloader__content', contentCovered ? 'preloader__content--covered' : '']
          .filter(Boolean)
          .join(' ')}
        aria-hidden={contentCovered ? true : undefined}
        inert={contentCovered || undefined}
      >
        {children}
      </div>
    </div>
  )
}

export default Preloader
