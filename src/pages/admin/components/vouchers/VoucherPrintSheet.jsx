import { forwardRef } from 'react'
import {
  formatVoucherDate,
  formatVoucherMoney,
  getVoucherTypeEmoji,
  getVoucherTypeLabel
} from '../../utils/vouchers'

const VoucherPrintSheet = forwardRef(function VoucherPrintSheet({ voucher, receiver, senders = [] }, ref) {
  if (!voucher) return null

  const paidSenders = senders.filter((s) => s.payment_status !== 'cancelled')
  const senderNames = paidSenders.map((s) => s.full_name).filter(Boolean).join(', ')

  return (
    <div ref={ref} className="crm-voucher-print">
      <div className="crm-voucher-print__frame">
        <div className="crm-voucher-print__header">
          <img
            src="/images/icons/honeywell-travel-logo.webp"
            alt="Honeywell Travel"
            className="crm-voucher-print__logo"
          />
          <p className="crm-voucher-print__tagline">Luxury Travel Experiences</p>
        </div>

        <div className="crm-voucher-print__hero">
          <span className="crm-voucher-print__emoji" aria-hidden="true">
            {getVoucherTypeEmoji(voucher.voucher_type)}
          </span>
          <h1 className="crm-voucher-print__title">{voucher.voucher_title}</h1>
          <p className="crm-voucher-print__type">{getVoucherTypeLabel(voucher.voucher_type)} Gift Voucher</p>
        </div>

        <div className="crm-voucher-print__body">
          <div className="crm-voucher-print__col">
            <p className="crm-voucher-print__label">Presented to</p>
            <p className="crm-voucher-print__value">{receiver?.full_name || '—'}</p>
          </div>
          <div className="crm-voucher-print__col crm-voucher-print__col--amount">
            <p className="crm-voucher-print__label">Voucher value</p>
            <p className="crm-voucher-print__amount">
              {formatVoucherMoney(voucher.total_amount, voucher.currency)}
            </p>
          </div>
        </div>

        {senderNames ? (
          <div className="crm-voucher-print__senders">
            <p className="crm-voucher-print__label">With love from</p>
            <p className="crm-voucher-print__value">{senderNames}</p>
          </div>
        ) : null}

        {voucher.gift_message ? (
          <blockquote className="crm-voucher-print__message">&ldquo;{voucher.gift_message}&rdquo;</blockquote>
        ) : null}

        <div className="crm-voucher-print__footer">
          <div className="crm-voucher-print__meta">
            <div>
              <p className="crm-voucher-print__label">Voucher code</p>
              <p className="crm-voucher-print__code">{voucher.voucher_code}</p>
            </div>
            {voucher.expiry_date ? (
              <div>
                <p className="crm-voucher-print__label">Valid until</p>
                <p className="crm-voucher-print__value">{formatVoucherDate(voucher.expiry_date)}</p>
              </div>
            ) : null}
          </div>
          <div className="crm-voucher-print__qr" aria-hidden="true">
            <div className="crm-voucher-print__qr-placeholder">
              <span>QR</span>
              <small>{voucher.voucher_code}</small>
            </div>
          </div>
        </div>

        <p className="crm-voucher-print__fine">
          Present this voucher at Honeywell Travel to redeem towards your next journey. Terms apply.
        </p>
      </div>
    </div>
  )
})

export default VoucherPrintSheet
