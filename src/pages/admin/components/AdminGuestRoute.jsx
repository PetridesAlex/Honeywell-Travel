import { Navigate } from 'react-router-dom'
import { ADMIN_DASHBOARD_PATH } from '../../../lib/adminAuth'
import { useAdminAuthGate } from '../hooks/useAdminAuthGate'
import AdminAuthLoading from './AdminAuthLoading'

/** Login page only — redirects authenticated users straight to the dashboard. */
function AdminGuestRoute({ children }) {
  const { ready, authed } = useAdminAuthGate()

  if (!ready) {
    return <AdminAuthLoading />
  }

  if (authed) {
    return <Navigate to={ADMIN_DASHBOARD_PATH} replace />
  }

  return children
}

export default AdminGuestRoute
