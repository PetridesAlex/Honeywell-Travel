import { useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Reset window scroll on route changes.
 * Keep this lightweight — aggressive timers/intervals fight the user on mobile
 * and make scrolling feel stuck or glitchy.
 */
function ScrollToTop() {
  const location = useLocation()
  const previousLocationRef = useRef(location)

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    const previousLocation = previousLocationRef.current
    const isHashOnlyNavigation =
      previousLocation.pathname === location.pathname &&
      previousLocation.search === location.search &&
      previousLocation.hash !== location.hash

    previousLocationRef.current = location

    // Preserve native in-page anchor behavior.
    if (isHashOnlyNavigation || location.hash) return undefined

    const resetWindowScroll = () => {
      window.scrollTo(0, 0)
      if (document.scrollingElement) {
        document.scrollingElement.scrollTop = 0
      }
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    resetWindowScroll()
    const rafId = requestAnimationFrame(resetWindowScroll)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [location.pathname, location.search, location.hash])

  return null
}

export default ScrollToTop
