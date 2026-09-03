import { formatXs2Money } from '../../utils/xs2eventUi'

/**
 * Customer-facing Honeywell sell price only.
 * Lists + tickets: amounts are minor units (cents); prefer honeywell_* fields.
 */
function EventPrice({ amount, currency = 'EUR', label = 'From', size = 'md', alreadyFormatted }) {
  const display =
    alreadyFormatted ||
    (amount == null || amount === ''
      ? null
      : typeof amount === 'string' && amount.includes('€')
        ? amount
        : formatXs2Money(amount, currency))

  if (!display) return null

  return (
    <div className={`st-price${size === 'lg' ? ' st-price--lg' : ''}`}>
      {label ? <span className="st-price__label">{label}</span> : null}
      <span className="st-price__value">{display}</span>
    </div>
  )
}

export default EventPrice
