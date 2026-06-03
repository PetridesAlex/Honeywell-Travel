import { AlertTriangle } from 'lucide-react'
import { getPassportExpiryWarning } from '../../utils/passport'

function PassportExpiryAlert({ expiresOn, message, inline = false, compact = false }) {
  const warning = message
    ? { level: message.includes('6 months') || message.includes('expired') ? 'critical' : 'caution', message }
    : getPassportExpiryWarning(expiresOn)

  if (!warning) return null

  const className = [
    'crm-passport-alert',
    `crm-passport-alert--${warning.level}`,
    inline ? 'crm-passport-alert--inline' : '',
    compact ? 'crm-passport-alert--compact' : ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={className} title={warning.message}>
      <AlertTriangle size={compact ? 12 : 14} aria-hidden />
      {!compact ? warning.message : null}
    </span>
  )
}

export default PassportExpiryAlert
