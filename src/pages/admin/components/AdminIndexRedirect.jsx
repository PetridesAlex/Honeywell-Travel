import { Navigate, useLocation } from 'react-router-dom'
import { ADMIN_DASHBOARD_PATH, getCrmPreviewSearch } from '../../../lib/adminAuth'

function AdminIndexRedirect() {
  const { search } = useLocation()
  return <Navigate to={`${ADMIN_DASHBOARD_PATH}${getCrmPreviewSearch(search)}`} replace />
}

export default AdminIndexRedirect
