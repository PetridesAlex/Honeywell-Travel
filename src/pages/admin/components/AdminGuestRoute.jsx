import { Link, Navigate } from 'react-router-dom'
import { ADMIN_DASHBOARD_PATH, ADMIN_LOGIN_PATH, hasAuthCallbackInUrl } from '../../../lib/adminAuth'
import { useAdminAuthGate } from '../hooks/useAdminAuthGate'
import AdminAuthLoading from './AdminAuthLoading'

/** Login page — redirects authenticated users to Packages CMS. */
function AdminGuestRoute({ children }) {
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
              ? 'This login link has expired or was already used.'
              : 'Signing you in…'}
          </div>
          {callbackFailed ? (
            <p style={{ marginTop: '1rem', textAlign: 'center' }}>
              <Link to={ADMIN_LOGIN_PATH}>Back to sign in</Link>
            </p>
          ) : null}
        </div>
      )
    }
    return <Navigate to={ADMIN_DASHBOARD_PATH} replace />
  }

  if (!ready) {
    return <AdminAuthLoading />
  }

  if (authed) {
    return <Navigate to={ADMIN_DASHBOARD_PATH} replace />
  }

  return children
}

export default AdminGuestRoute
