import { useEffect, useState } from 'react'

/** True on phones/tablets where we prefer lighter animations and layouts. */
export function useMobileLite() {
  const [isMobileLite, setIsMobileLite] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(max-width: 768px)').matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    const handleChange = (event) => setIsMobileLite(event.matches)
    setIsMobileLite(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isMobileLite
}
