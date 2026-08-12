import { useEffect, useRef, useState } from 'react'
import './RevealOnScroll.css'

function shouldSkipRevealMotion(immediate) {
  if (immediate) return true
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || window.matchMedia('(max-width: 768px)').matches
  )
}

function RevealOnScroll({ children, className = '', delay = 0, direction = 'up', immediate = false }) {
  const ref = useRef(null)
  const [skipMotion] = useState(() => shouldSkipRevealMotion(immediate))
  const [isVisible, setIsVisible] = useState(() => shouldSkipRevealMotion(immediate))

  useEffect(() => {
    if (skipMotion) return undefined

    const el = ref.current
    if (!el) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -24px 0px',
      },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [skipMotion])

  return (
    <div
      ref={ref}
      className={`reveal-on-scroll ${isVisible ? 'reveal-visible' : ''}${skipMotion ? ' reveal-no-motion' : ''} reveal-${direction} ${className}`.trim()}
      style={{ transitionDelay: skipMotion || !isVisible ? '0ms' : `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export default RevealOnScroll
