import { formatVoucherMoney } from '../../utils/vouchers'

function VoucherProgressBar({ total, collected, currency = 'EUR', showLabels = true }) {
  const safeTotal = Number(total || 0)
  const safeCollected = Number(collected || 0)
  const progress = safeTotal > 0 ? Math.min(100, (safeCollected / safeTotal) * 100) : 0
  const remaining = Math.max(0, safeTotal - safeCollected)
  const fullyFunded = safeTotal > 0 && safeCollected >= safeTotal

  return (
    <div className="crm-voucher-progress">
      {showLabels ? (
        <div className="crm-voucher-progress__labels">
          <span>
            Collected <strong>{formatVoucherMoney(safeCollected, currency)}</strong>
          </span>
          <span>
            {fullyFunded ? (
              <strong className="crm-voucher-progress__funded">Fully funded</strong>
            ) : (
              <>
                Remaining <strong>{formatVoucherMoney(remaining, currency)}</strong>
              </>
            )}
          </span>
        </div>
      ) : null}
      <div
        className="crm-voucher-progress__track"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`crm-voucher-progress__fill${fullyFunded ? ' crm-voucher-progress__fill--complete' : ''}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {showLabels ? (
        <p className="crm-voucher-progress__pct">
          {Math.round(progress)}% of {formatVoucherMoney(safeTotal, currency)}
        </p>
      ) : null}
    </div>
  )
}

export default VoucherProgressBar
