import { useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Reset window scroll on pathname changes only.
 * Do NOT reset on search-param filter updates (e.g. Packages category tiles),
 * or those intentional in-page scrolls get cancelled.
 */
function ScrollToTop() {
  const location = useLocation()
  const previousPathnameRef = useRef(location.pathname)

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    const previousPathname = previousPathnameRef.current
    previousPathnameRef.current = location.pathname

    // Same page with only ?query or #hash changes — leave scroll alone.
    if (previousPathname === location.pathname) return undefined
    if (location.hash) return undefined

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
  }, [location.pathname, location.hash])

  return null
}

export default ScrollToTop
