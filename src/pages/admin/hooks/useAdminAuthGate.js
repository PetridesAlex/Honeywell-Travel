import { useEffect, useState } from 'react'
import {
  cleanAdminAuthUrlAfterLogin,
  ensureAuthCallbackLandsOnDashboard,
  hasAuthCallbackInUrl
} from '../../../lib/adminAuth'
import { supabase } from '../../../lib/supabase'

const CALLBACK_SETTLE_MS = 8000
const READY_FALLBACK_MS = 3000

/**
 * Waits for Supabase session (including magic-link callbacks) before routing.
 * Never hangs indefinitely — always becomes ready within a few seconds.
 */
export function useAdminAuthGate() {
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState(null)
  const [callbackFailed, setCallbackFailed] = useState(false)

  useEffect(() => {
    if (ensureAuthCallbackLandsOnDashboard()) return

    let mounted = true
    let callbackTimer
    let readyFallbackTimer
    let settled = false

    const waitingForCallback = hasAuthCallbackInUrl()

    const finish = (nextSession, failed = false) => {
      if (!mounted || settled) return
      settled = true
      if (callbackTimer) clearTimeout(callbackTimer)
      if (readyFallbackTimer) clearTimeout(readyFallbackTimer)
      setSession(nextSession)
      setReady(true)
      setCallbackFailed(Boolean(failed))
      if (nextSession) cleanAdminAuthUrlAfterLogin()
    }

    const recoverSessionFromCallback = async () => {
      const { data: initial } = await supabase.auth.getSession()
      if (initial?.session) return initial.session

      const code = new URLSearchParams(window.location.search).get('code')
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && data?.session) return data.session
      }
      return null
    }

    const bootstrap = async () => {
      try {
        if (waitingForCallback) {
          const recovered = await recoverSessionFromCallback()
          if (recovered) {
            finish(recovered)
            return
          }
          callbackTimer = setTimeout(() => finish(null, true), CALLBACK_SETTLE_MS)
          return
        }

        const { data } = await supabase.auth.getSession()
        finish(data?.session ?? null)
      } catch {
        finish(null)
      }
    }

    bootstrap()

    if (!waitingForCallback) {
      readyFallbackTimer = setTimeout(() => {
        if (!settled) finish(null)
      }, READY_FALLBACK_MS)
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        finish(nextSession, waitingForCallback && !nextSession)
      }
      if (event === 'SIGNED_OUT') {
        settled = false
        setSession(null)
        setReady(true)
        setCallbackFailed(false)
      }
    })

    return () => {
      mounted = false
      if (callbackTimer) clearTimeout(callbackTimer)
      if (readyFallbackTimer) clearTimeout(readyFallbackTimer)
      subscription.unsubscribe()
    }
  }, [])

  return {
    ready,
    session,
    authed: Boolean(session),
    callbackFailed
  }
}
