import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import {
  ADMIN_LOGIN_PATH,
  hasAuthCallbackInUrl,
  shouldUseCrmDesignPreview
} from '../../../lib/adminAuth'
import { useAdminAuthGate } from '../hooks/useAdminAuthGate'
import AdminAuthLoading from './AdminAuthLoading'

/**
 * Guards all CRM routes. Magic-link callbacks land on /admin/dashboard and
 * stay there — no intermediate login page.
 * Dev-only: localhost opens CRM layout without login (incl. /admin/dashboard#).
 */
function AdminProtectedRoute() {
  const location = useLocation()
  const { ready, authed, callbackFailed } = useAdminAuthGate()

  if (hasAuthCallbackInUrl()) {
    if (!ready) {
      return <AdminAuthLoading />
    }
    if (!authed) {
      return (
        <div className="crm-page admin-auth-loading">
          <div className="crm-state">
            {callbackFailed
              ? 'This login link has expired or was already used. Request a new link and paste it again.'
              : 'Signing you in…'}
          </div>
          {callbackFailed ? (
            <p style={{ marginTop: '1rem', textAlign: 'center' }}>
              <Link to={ADMIN_LOGIN_PATH}>Back to login</Link>
            </p>
          ) : null}
        </div>
      )
    }
    return <Outlet />
  }

  if (shouldUseCrmDesignPreview({ search: location.search, authReady: ready, authed })) {
    return <Outlet />
  }

  if (!ready) {
    return <AdminAuthLoading />
  }

  if (!authed) {
    return <Navigate to={ADMIN_LOGIN_PATH} replace />
  }

  return <Outlet />
}

export default AdminProtectedRoute
