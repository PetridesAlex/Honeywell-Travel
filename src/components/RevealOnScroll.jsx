import { useEffect, useRef, useState } from 'react'
import './RevealOnScroll.css'

function RevealOnScroll({ children, className = '', delay = 0, direction = 'up', immediate = false }) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(immediate)

  useEffect(() => {
    if (immediate) return

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [immediate])

  return (
    <div
      ref={ref}
      className={`reveal-on-scroll ${isVisible ? 'reveal-visible' : ''}${immediate ? ' reveal-no-motion' : ''} reveal-${direction} ${className}`.trim()}
      style={{ transitionDelay: immediate ? '0ms' : isVisible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}

export default RevealOnScroll
