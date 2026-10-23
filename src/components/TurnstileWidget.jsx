import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const SCRIPT_ID = 'cf-turnstile-script'

let scriptPromise = null

function loadTurnstileScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Turnstile requires a browser environment.'))
  }
  if (window.turnstile) {
    return Promise.resolve(window.turnstile)
  }
  if (scriptPromise) {
    return scriptPromise
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID)
    if (existing) {
      existing.addEventListener('load', () => resolve(window.turnstile), { once: true })
      existing.addEventListener(
        'error',
        () => reject(new Error('Failed to load Cloudflare Turnstile.')),
        { once: true }
      )
      return
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve(window.turnstile)
    script.onerror = () => reject(new Error('Failed to load Cloudflare Turnstile.'))
    document.head.appendChild(script)
  })

  return scriptPromise
}

/**
 * Explicit-render Turnstile widget. Supports multiple instances on one page
 * (e.g. page form + footer newsletter). Call reset() after a successful submit.
 */
const TurnstileWidget = forwardRef(function TurnstileWidget(
  { onTokenChange, theme = 'auto', className = '' },
  ref
) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const onTokenChangeRef = useRef(onTokenChange)
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange
  }, [onTokenChange])

  useImperativeHandle(ref, () => ({
    reset() {
      onTokenChangeRef.current?.('')
      if (widgetIdRef.current != null && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current)
        } catch {
          // Widget may already be removed during unmount.
        }
      }
    },
  }))

  useEffect(() => {
    if (!siteKey || !containerRef.current) {
      onTokenChangeRef.current?.('')
      return undefined
    }

    let cancelled = false

    loadTurnstileScript()
      .then((turnstile) => {
        if (cancelled || !containerRef.current || !turnstile) return

        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          callback: (token) => {
            onTokenChangeRef.current?.(token || '')
          },
          'expired-callback': () => {
            onTokenChangeRef.current?.('')
          },
          'error-callback': () => {
            onTokenChangeRef.current?.('')
          },
        })
      })
      .catch((err) => {
        console.error(err)
        onTokenChangeRef.current?.('')
      })

    return () => {
      cancelled = true
      if (widgetIdRef.current != null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // Ignore cleanup races.
        }
      }
      widgetIdRef.current = null
    }
  }, [siteKey, theme])

  if (!siteKey) {
    return (
      <p className={`turnstile-missing ${className}`.trim()} role="alert">
        Security check is unavailable. Please try again later.
      </p>
    )
  }

  return (
    <div
      className={`turnstile-widget ${className}`.trim()}
      ref={containerRef}
      style={{ margin: '0.75rem 0' }}
    />
  )
})

export default TurnstileWidget
