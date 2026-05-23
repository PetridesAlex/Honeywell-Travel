import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { EMPTY_FINANCIAL_RECORD } from '../constants'
import {
  CURRENCY_OPTIONS,
  FINANCIAL_RECORD_TYPES,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  computeMargin,
  formatMoney
} from '../utils/financials'

function FinancialRecordModal({ open, initialRecord, leads = [], onClose, onSave, saving, saveError }) {
  const [form, setForm] = useState(EMPTY_FINANCIAL_RECORD)

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  useEffect(() => {
    if (initialRecord) {
      setForm({
        ...EMPTY_FINANCIAL_RECORD,
        ...initialRecord,
        sell_price: initialRecord.sell_price ?? '',
        net_price: initialRecord.net_price ?? '',
        amount_received: initialRecord.amount_received ?? '',
        lead_id: initialRecord.lead_id ?? '',
        invoice_date: initialRecord.invoice_date ? initialRecord.invoice_date.slice(0, 10) : '',
        due_date: initialRecord.due_date ? initialRecord.due_date.slice(0, 10) : '',
        paid_date: initialRecord.paid_date ? initialRecord.paid_date.slice(0, 10) : ''
      })
      return
    }
    setForm(EMPTY_FINANCIAL_RECORD)
  }, [initialRecord, open])

  const calc = useMemo(
    () => computeMargin(form.sell_price, form.net_price),
    [form.sell_price, form.net_price]
  )

  if (!open) return null

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))
  const isEdit = Boolean(initialRecord?.id)

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
            <p className="crm-modal__eyebrow">{isEdit ? 'Accounting record' : 'New record'}</p>
            <h3>{isEdit ? 'Edit invoice / receipt' : 'Add invoice or receipt'}</h3>
            <p className="crm-modal__subtitle">Sell price, net cost, margin, and payments for your accountant.</p>
          </div>
          <button type="button" className="crm-modal__close" onClick={onClose} aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <form id="financial-modal-form" onSubmit={handleSubmit} className="crm-modal__body">
          <section className="crm-modal__section crm-modal__section--financial">
            <div className="crm-fin-calc" aria-live="polite">
              <div className="crm-fin-calc__item">
                <span>Sell price</span>
                <strong>{formatMoney(calc.sell, form.currency)}</strong>
              </div>
              <div className="crm-fin-calc__item">
                <span>Net cost</span>
                <strong>{formatMoney(calc.net, form.currency)}</strong>
              </div>
              <div className="crm-fin-calc__item crm-fin-calc__item--margin">
                <span>Margin</span>
                <strong>
                  {formatMoney(calc.margin, form.currency)}
                  <em>{calc.marginPercent.toFixed(1)}%</em>
                </strong>
              </div>
            </div>

            <div className="crm-form-grid crm-form-grid--modal">
              <label className="crm-field">
                <span className="crm-field__label">Record type</span>
                <select value={form.record_type} onChange={(e) => handleChange('record_type', e.target.value)}>
                  {FINANCIAL_RECORD_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Invoice / receipt no.</span>
                <input
                  value={form.reference_no || ''}
                  onChange={(e) => handleChange('reference_no', e.target.value)}
                  placeholder="e.g. INV-2026-0142"
                />
              </label>
              <label className="crm-field crm-form-full">
                <span className="crm-field__label">Description *</span>
                <input
                  required
                  value={form.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. Dubai package — 2 pax"
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Sell price (client pays)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.sell_price}
                  onChange={(e) => handleChange('sell_price', e.target.value)}
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Net price (supplier cost)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.net_price}
                  onChange={(e) => handleChange('net_price', e.target.value)}
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Amount received</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount_received}
                  onChange={(e) => handleChange('amount_received', e.target.value)}
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Currency</span>
                <select value={form.currency} onChange={(e) => handleChange('currency', e.target.value)}>
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Payment status</span>
                <select
                  value={form.payment_status}
                  onChange={(e) => handleChange('payment_status', e.target.value)}
                >
                  {PAYMENT_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Payment method</span>
                <select
                  value={form.payment_method || ''}
                  onChange={(e) => handleChange('payment_method', e.target.value)}
                >
                  {PAYMENT_METHOD_OPTIONS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Supplier</span>
                <input
                  value={form.supplier_name || ''}
                  onChange={(e) => handleChange('supplier_name', e.target.value)}
                  placeholder="e.g. TUI, DMC partner"
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Invoice date</span>
                <input
                  type="date"
                  value={form.invoice_date || ''}
                  onChange={(e) => handleChange('invoice_date', e.target.value)}
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Due date</span>
                <input
                  type="date"
                  value={form.due_date || ''}
                  onChange={(e) => handleChange('due_date', e.target.value)}
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Paid date</span>
                <input
                  type="date"
                  value={form.paid_date || ''}
                  onChange={(e) => handleChange('paid_date', e.target.value)}
                />
              </label>
              {leads.length > 0 ? (
                <label className="crm-field crm-form-full">
                  <span className="crm-field__label">Linked enquiry (optional)</span>
                  <select value={form.lead_id || ''} onChange={(e) => handleChange('lead_id', e.target.value)}>
                    <option value="">None</option>
                    {leads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        #{lead.id} — {lead.destination || 'Trip'} ({lead.status})
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <label className="crm-field crm-form-full">
                <span className="crm-field__label">Notes (accountant)</span>
                <textarea
                  rows={3}
                  value={form.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Payment terms, bank ref, commission notes…"
                />
              </label>
            </div>
          </section>
          {saveError ? <p className="crm-form-error crm-form-full">{saveError}</p> : null}
        </form>

        <footer className="crm-modal__footer">
          <button type="button" className="crm-btn crm-btn--modal-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            disabled={saving}
            type="submit"
            form="financial-modal-form"
            className="crm-btn crm-btn--modal-primary crm-btn--financial-save"
          >
            {saving ? 'Saving…' : isEdit ? 'Save record' : 'Add record'}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  )
}

export default FinancialRecordModal
