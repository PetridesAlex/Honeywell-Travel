import { useEffect, useState } from 'react'
import {
  cleanAdminAuthUrlAfterLogin,
  ensureAuthCallbackLandsOnDashboard,
  hasAuthCallbackInUrl
} from '../../../lib/adminAuth'
import { supabase } from '../../../lib/supabase'

const CALLBACK_SETTLE_MS = 6000

/**
 * Waits for Supabase INITIAL_SESSION so magic-link URL tokens are processed
 * before we redirect to login or render protected CRM pages.
 */
export function useAdminAuthGate() {
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState(null)
  const [callbackFailed, setCallbackFailed] = useState(false)

  useEffect(() => {
    if (ensureAuthCallbackLandsOnDashboard()) return

    let mounted = true
    let callbackTimer

    const waitingForCallback = hasAuthCallbackInUrl()

    const applySession = (nextSession) => {
      if (!mounted) return
      if (callbackTimer) {
        clearTimeout(callbackTimer)
        callbackTimer = undefined
      }
      setSession(nextSession)
      setReady(true)
      setCallbackFailed(waitingForCallback && !nextSession)
      if (nextSession) cleanAdminAuthUrlAfterLogin()
    }

    const scheduleCallbackFailure = (nextSession) => {
      if (callbackTimer) clearTimeout(callbackTimer)
      callbackTimer = setTimeout(() => {
        applySession(nextSession)
      }, CALLBACK_SETTLE_MS)
    }

    const recoverSessionFromCallback = async () => {
      const { data: initial } = await supabase.auth.getSession()
      if (initial.session) return initial.session

      const code = new URLSearchParams(window.location.search).get('code')
      if (!code) return null

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error || !data.session) return null
      return data.session
    }

    if (waitingForCallback) {
      recoverSessionFromCallback().then((recovered) => {
        if (recovered) applySession(recovered)
      })
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'INITIAL_SESSION') {
        if (waitingForCallback && !nextSession) {
          scheduleCallbackFailure(nextSession)
          return
        }
        applySession(nextSession)
        return
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        applySession(nextSession)
        return
      }
      if (event === 'SIGNED_OUT') {
        applySession(null)
      }
    })

    return () => {
      mounted = false
      if (callbackTimer) clearTimeout(callbackTimer)
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
