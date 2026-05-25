import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  PAYMENT_METHOD_OPTIONS,
  computeOutstanding,
  formatMoney,
  sumPayments
} from '../utils/financials'

function FinancialReceiptModal({
  open,
  invoice,
  onClose,
  onSave,
  saving,
  saveError
}) {
  const [form, setForm] = useState({
    amount: '',
    payment_method: 'Bank transfer',
    payment_date: new Date().toISOString().slice(0, 10),
    receipt_no: '',
    notes: ''
  })

  useEffect(() => {
    if (!open) return undefined
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const outstanding = computeOutstanding(invoice?.sell_price, sumPayments(invoice?.payments))
    setForm({
      amount: outstanding > 0 ? String(outstanding) : '',
      payment_method: 'Bank transfer',
      payment_date: new Date().toISOString().slice(0, 10),
      receipt_no: '',
      notes: ''
    })
  }, [open, invoice])

  const outstanding = useMemo(
    () => computeOutstanding(invoice?.sell_price, sumPayments(invoice?.payments)),
    [invoice]
  )

  if (!open || !invoice) return null

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(form)
  }

  return createPortal(
    <div className="crm-modal-backdrop crm-modal-backdrop--premium" onClick={onClose} role="presentation">
      <div
        className="crm-modal crm-modal--lead crm-modal--financial"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="crm-modal__hero crm-modal__hero--financial">
          <div className="crm-modal__hero-text">
            <p className="crm-modal__eyebrow">Credit — payment received</p>
            <h3>Record receipt</h3>
            <p className="crm-modal__subtitle">
              Reduces the client account balance for invoice{' '}
              <strong>{invoice.reference_no || `#${invoice.id}`}</strong>
            </p>
          </div>
          <button type="button" className="crm-modal__close" onClick={onClose} aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <form id="financial-receipt-form" onSubmit={handleSubmit} className="crm-modal__body">
          <div className="crm-fin-receipt-summary">
            <div>
              <span>Invoice</span>
              <strong>{invoice.title}</strong>
            </div>
            <div>
              <span>Outstanding</span>
              <strong>{formatMoney(outstanding, invoice.currency)}</strong>
            </div>
          </div>

          <div className="crm-form-grid crm-form-grid--modal">
            <label className="crm-field">
              <span className="crm-field__label">Amount received *</span>
              <input
                type="number"
                min="0.01"
                max={outstanding}
                step="0.01"
                required
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              />
            </label>
            <label className="crm-field">
              <span className="crm-field__label">Payment method</span>
              <select
                value={form.payment_method}
                onChange={(e) => setForm((p) => ({ ...p, payment_method: e.target.value }))}
              >
                {PAYMENT_METHOD_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>
            <label className="crm-field">
              <span className="crm-field__label">Receipt date</span>
              <input
                type="date"
                value={form.payment_date}
                onChange={(e) => setForm((p) => ({ ...p, payment_date: e.target.value }))}
              />
            </label>
            <label className="crm-field">
              <span className="crm-field__label">Receipt no. (optional)</span>
              <input
                value={form.receipt_no}
                onChange={(e) => setForm((p) => ({ ...p, receipt_no: e.target.value }))}
                placeholder="Auto-generated if blank"
              />
            </label>
            <label className="crm-field crm-form-full">
              <span className="crm-field__label">Notes</span>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Bank reference, who paid, etc."
              />
            </label>
          </div>
          {saveError ? <p className="crm-form-error crm-form-full">{saveError}</p> : null}
        </form>

        <footer className="crm-modal__footer">
          <button type="button" className="crm-btn crm-btn--modal-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            disabled={saving}
            type="submit"
            form="financial-receipt-form"
            className="crm-btn crm-btn--modal-primary crm-btn--financial-save"
          >
            {saving ? 'Saving…' : 'Record receipt & reduce balance'}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  )
}

export default FinancialReceiptModal
