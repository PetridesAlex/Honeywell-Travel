import { PASSPORT_STATUS_LABELS, PASSPORT_STATUS_SHORT_LABELS, getPassportStatus } from '../utils/passport'

function PassportStatusBadge({ expiresOn, compact = false, short = false }) {
  const status = getPassportStatus(expiresOn)
  const label = short ? PASSPORT_STATUS_SHORT_LABELS[status] : PASSPORT_STATUS_LABELS[status]

  return (
    <span
      className={`crm-passport-badge crm-passport-badge--${status}${compact ? ' crm-passport-badge--compact' : ''}${short ? ' crm-passport-badge--short' : ''}`}
      title={short ? PASSPORT_STATUS_LABELS[status] : undefined}
    >
      {label}
    </span>
  )
}

export default PassportStatusBadge
