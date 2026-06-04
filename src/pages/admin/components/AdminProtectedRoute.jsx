import { Navigate, Outlet } from 'react-router-dom'
import { ADMIN_DASHBOARD_PATH, ADMIN_LOGIN_PATH } from '../../../lib/adminAuth'
import { useAdminAuthGate } from '../hooks/useAdminAuthGate'
import AdminAuthLoading from './AdminAuthLoading'

/**
 * Guards all CRM routes. Magic-link callbacks land on /admin/dashboard and
 * stay there — no intermediate login page.
 */
function AdminProtectedRoute() {
  const { ready, authed } = useAdminAuthGate()

  if (!ready) {
    return <AdminAuthLoading />
  }

  if (!authed) {
    return <Navigate to={ADMIN_LOGIN_PATH} replace />
  }

  return <Outlet />
}

export default AdminProtectedRoute
