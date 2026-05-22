import { PASSPORT_STATUS_LABELS, getPassportStatus } from '../utils/passport'

function PassportStatusBadge({ expiresOn, compact = false }) {
  const status = getPassportStatus(expiresOn)
  const label = PASSPORT_STATUS_LABELS[status]

  return (
    <span className={`crm-passport-badge crm-passport-badge--${status}${compact ? ' crm-passport-badge--compact' : ''}`}>
      {label}
    </span>
  )
}

export default PassportStatusBadge
