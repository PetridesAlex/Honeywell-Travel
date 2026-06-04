import { useEffect, useState } from 'react'
import { cleanAdminAuthUrlAfterLogin } from '../../../lib/adminAuth'
import { supabase } from '../../../lib/supabase'

/**
 * Waits for Supabase INITIAL_SESSION so magic-link URL tokens are processed
 * before we redirect to login or render protected CRM pages.
 */
export function useAdminAuthGate() {
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState(null)

  useEffect(() => {
    let mounted = true

    const applySession = (nextSession) => {
      if (!mounted) return
      setSession(nextSession)
      setReady(true)
      if (nextSession) cleanAdminAuthUrlAfterLogin()
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'INITIAL_SESSION') {
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
      subscription.unsubscribe()
    }
  }, [])

  return {
    ready,
    session,
    authed: Boolean(session)
  }
}
