import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Download,
  Mail,
  Pencil,
  Plus,
  Printer,
  Trash2,
  X
} from 'lucide-react'
import {
  addVoucherNote,
  createSender,
  deleteSender,
  updateSender,
  updateVoucher
} from '../../api/vouchersApi'
import {
  buildVoucherMailto,
  computeVoucherBalance,
  EMPTY_SENDER,
  formatVoucherDate,
  formatVoucherDateTime,
  formatVoucherMoney,
  getVoucherTypeEmoji,
  SENDER_PAYMENT_STATUSES,
  VOUCHER_PAYMENT_METHODS,
  VOUCHER_STATUSES,
  voucherStatusClass,
  voucherStatusLabel
} from '../../utils/vouchers'
import VoucherPrintSheet from './VoucherPrintSheet'
import VoucherProgressBar from './VoucherProgressBar'

function VoucherDetailModal({ open, voucher, onClose, onUpdated }) {
  const printRef = useRef(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [senderForm, setSenderForm] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
    if (!open) {
      setSenderForm(null)
      setNoteText('')
      setError('')
      setPreviewOpen(false)
    }
  }, [open])

  if (!open || !voucher) return null

  const receiver = voucher.receiver
  const senders = voucher.senders || []
  const payments = voucher.payments || []
  const activities = [...(voucher.activities || [])].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  )
  const balance = computeVoucherBalance(voucher, senders)
  const mailto = buildVoucherMailto(voucher, receiver, senders)
  const pendingSenders = senders.filter((s) => s.payment_status === 'pending')

  const handleStatusChange = async (status) => {
    setSaving(true)
    setError('')
    const { data, error: err } = await updateVoucher(voucher.id, { ...voucher, status })
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    onUpdated?.(data)
  }

  const handleSaveSender = async () => {
    if (!senderForm?.full_name?.trim()) {
      setError('Sender name is required.')
      return
    }
    setSaving(true)
    setError('')
    const payload = {
      ...senderForm,
      payment_date: senderForm.payment_date || null
    }
    const { data, error: err } = senderForm.id
      ? await updateSender(senderForm.id, voucher.id, payload)
      : await createSender(voucher.id, payload)
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    setSenderForm(null)
    const refreshed = await onUpdated?.()
    return data || refreshed
  }

  const handleDeleteSender = async (sender) => {
    if (!window.confirm(`Remove ${sender.full_name}?`)) return
    setSaving(true)
    const { error: err } = await deleteSender(sender.id, voucher.id)
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    onUpdated?.()
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) return
    setSaving(true)
    await addVoucherNote(voucher.id, noteText.trim())
    setNoteText('')
    setSaving(false)
    onUpdated?.()
  }

  const handlePrint = () => {
    setPreviewOpen(true)
    requestAnimationFrame(() => {
      window.print()
    })
  }

  const handleDownload = () => {
    setPreviewOpen(true)
    requestAnimationFrame(() => {
      window.print()
    })
  }

  return createPortal(
    <>
      <div className="crm-modal-backdrop crm-modal-backdrop--voucher" onClick={onClose} role="presentation">
        <div
          className="crm-modal crm-modal--voucher"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="voucher-detail-title"
        >
          <header className="crm-modal__header crm-modal__header--voucher">
            <div className="crm-modal__header-copy">
              <p className="crm-voucher-detail__eyebrow">
                {getVoucherTypeEmoji(voucher.voucher_type)} {voucher.voucher_code}
              </p>
              <h2 id="voucher-detail-title" className="crm-modal__title">
                {voucher.voucher_title}
              </h2>
              <span className={voucherStatusClass(voucher.status)}>{voucherStatusLabel(voucher.status)}</span>
            </div>
            <button type="button" className="crm-modal__close crm-modal__close--voucher" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </header>

          <div className="crm-modal__body crm-voucher-detail">
          {error ? <p className="crm-state crm-state-error">{error}</p> : null}

          <section className="crm-voucher-detail__grid">
            <article className="crm-voucher-card">
              <h3>Receiver</h3>
              <p className="crm-voucher-card__name">{receiver?.full_name || '—'}</p>
              <p>{receiver?.email || '—'}</p>
              <p>{receiver?.phone || '—'}</p>
              {voucher.expiry_date ? (
                <p className="crm-voucher-detail__expiry">
                  Expires {formatVoucherDate(voucher.expiry_date)}
                </p>
              ) : null}
            </article>
            <article className="crm-voucher-card crm-voucher-card--funding">
              <h3>Funding progress</h3>
              <VoucherProgressBar
                total={balance.total}
                collected={balance.collected}
                currency={voucher.currency}
              />
              <p className="crm-voucher-detail__pending">
                {pendingSenders.length} sender{pendingSenders.length === 1 ? '' : 's'} still owe{' '}
                {formatVoucherMoney(balance.pending, voucher.currency)}
              </p>
            </article>
          </section>

          <section className="crm-voucher-detail__actions">
            <button type="button" className="crm-btn crm-btn-ghost" onClick={() => setPreviewOpen(true)}>
              Preview
            </button>
            <button type="button" className="crm-btn crm-btn-ghost" onClick={handlePrint}>
              <Printer size={16} aria-hidden />
              Print
            </button>
            <button type="button" className="crm-btn crm-btn-ghost" onClick={handleDownload}>
              <Download size={16} aria-hidden />
              Download PDF
            </button>
            {mailto ? (
              <a href={mailto} className="crm-btn crm-btn-ghost" target="_blank" rel="noreferrer">
                <Mail size={16} aria-hidden />
                Email receiver
              </a>
            ) : null}
            <select
              className="crm-select crm-voucher-detail__status"
              value={voucher.status}
              disabled={saving}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              {VOUCHER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {voucherStatusLabel(s)}
                </option>
              ))}
            </select>
          </section>

          <section className="crm-voucher-detail__section">
            <div className="crm-voucher-detail__section-head">
              <h3>Contributors</h3>
              <button
                type="button"
                className="crm-btn crm-btn-primary crm-btn--sm"
                onClick={() => setSenderForm({ ...EMPTY_SENDER })}
              >
                <Plus size={14} aria-hidden />
                Add sender
              </button>
            </div>
            <div className="crm-table-wrap crm-table-wrap--vouchers">
              <table className="crm-table crm-table--vouchers">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Method</th>
                    <th>%</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {senders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="crm-table-empty">
                        No contributors yet — add friends or family funding this gift.
                      </td>
                    </tr>
                  ) : (
                    senders.map((sender) => {
                      const pct =
                        balance.total > 0
                          ? Math.round((Number(sender.contribution_amount) / balance.total) * 100)
                          : 0
                      return (
                        <tr key={sender.id}>
                          <td>
                            <strong>{sender.full_name}</strong>
                            {sender.email ? <span className="crm-voucher-table__sub">{sender.email}</span> : null}
                          </td>
                          <td>{formatVoucherMoney(sender.contribution_amount, voucher.currency)}</td>
                          <td>
                            <span className={`crm-voucher-pay-status crm-voucher-pay-status--${sender.payment_status}`}>
                              {sender.payment_status}
                            </span>
                          </td>
                          <td>{sender.payment_method || '—'}</td>
                          <td>{pct}%</td>
                          <td className="crm-voucher-table__actions">
                            <button
                              type="button"
                              className="crm-icon-btn"
                              aria-label="Edit sender"
                              onClick={() =>
                                setSenderForm({
                                  ...sender,
                                  payment_date: sender.payment_date ? sender.payment_date.slice(0, 10) : ''
                                })
                              }
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              className="crm-icon-btn crm-icon-btn--danger"
                              aria-label="Remove sender"
                              onClick={() => handleDeleteSender(sender)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="crm-voucher-detail__section">
            <h3>Payment timeline</h3>
            {payments.length === 0 ? (
              <p className="crm-state">No payments recorded yet.</p>
            ) : (
              <ol className="crm-voucher-timeline">
                {payments.map((p) => (
                  <li key={p.id} className="crm-voucher-timeline__item">
                    <span className="crm-voucher-timeline__dot" aria-hidden="true" />
                    <div>
                      <p>
                        <strong>{formatVoucherMoney(p.amount, voucher.currency)}</strong>
                        {p.sender?.full_name ? ` from ${p.sender.full_name}` : ''}
                      </p>
                      <p className="crm-voucher-timeline__meta">
                        {formatVoucherDateTime(p.payment_date)} · {p.payment_method || '—'}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="crm-voucher-detail__section">
            <h3>Activity &amp; notes</h3>
            <div className="crm-voucher-note-form">
              <textarea
                className="crm-textarea"
                rows={2}
                placeholder="Add an internal note…"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <button
                type="button"
                className="crm-btn crm-btn-primary crm-btn--sm"
                disabled={saving || !noteText.trim()}
                onClick={handleAddNote}
              >
                Add note
              </button>
            </div>
            <ol className="crm-voucher-timeline crm-voucher-timeline--activity">
              {activities.map((a) => (
                <li key={a.id} className="crm-voucher-timeline__item">
                  <span className="crm-voucher-timeline__dot" aria-hidden="true" />
                  <div>
                    <p>{a.description}</p>
                    <p className="crm-voucher-timeline__meta">
                      {formatVoucherDateTime(a.created_at)}
                      {a.created_by_name ? ` · ${a.created_by_name}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          </div>
        </div>
      </div>

      {senderForm ? (
        <div
          className="crm-modal-backdrop crm-modal-backdrop--voucher crm-modal-backdrop--nested"
          onClick={() => setSenderForm(null)}
          role="presentation"
        >
          <div
            className="crm-modal crm-modal--nested crm-modal--sender"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <header className="crm-modal__header crm-modal__header--voucher">
              <div className="crm-modal__header-copy">
                <h3 className="crm-modal__title">{senderForm.id ? 'Edit contributor' : 'Add contributor'}</h3>
              </div>
              <button type="button" className="crm-modal__close crm-modal__close--voucher" onClick={() => setSenderForm(null)} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="crm-modal__body">
            <div className="crm-form-grid">
              <label className="crm-field">
                <span>Full name</span>
                <input
                  className="crm-input"
                  value={senderForm.full_name}
                  onChange={(e) => setSenderForm((p) => ({ ...p, full_name: e.target.value }))}
                />
              </label>
              <label className="crm-field">
                <span>Contribution (EUR)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="crm-input"
                  value={senderForm.contribution_amount}
                  onChange={(e) => setSenderForm((p) => ({ ...p, contribution_amount: e.target.value }))}
                />
              </label>
              <label className="crm-field">
                <span>Payment status</span>
                <select
                  className="crm-select"
                  value={senderForm.payment_status}
                  onChange={(e) => setSenderForm((p) => ({ ...p, payment_status: e.target.value }))}
                >
                  {SENDER_PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="crm-field">
                <span>Payment method</span>
                <select
                  className="crm-select"
                  value={senderForm.payment_method || ''}
                  onChange={(e) => setSenderForm((p) => ({ ...p, payment_method: e.target.value }))}
                >
                  {VOUCHER_PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <label className="crm-field">
                <span>Email</span>
                <input
                  type="email"
                  className="crm-input"
                  value={senderForm.email || ''}
                  onChange={(e) => setSenderForm((p) => ({ ...p, email: e.target.value }))}
                />
              </label>
              <label className="crm-field">
                <span>Phone</span>
                <input
                  className="crm-input"
                  value={senderForm.phone || ''}
                  onChange={(e) => setSenderForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </label>
              <label className="crm-field">
                <span>Payment date</span>
                <input
                  type="date"
                  className="crm-input"
                  value={senderForm.payment_date || ''}
                  onChange={(e) => setSenderForm((p) => ({ ...p, payment_date: e.target.value }))}
                />
              </label>
              <label className="crm-field crm-field--full">
                <span>Notes</span>
                <textarea
                  className="crm-textarea"
                  rows={2}
                  value={senderForm.notes || ''}
                  onChange={(e) => setSenderForm((p) => ({ ...p, notes: e.target.value }))}
                />
              </label>
            </div>
            <div className="crm-modal__footer">
              <button type="button" className="crm-btn crm-btn-ghost" onClick={() => setSenderForm(null)}>
                Cancel
              </button>
              <button type="button" className="crm-btn crm-btn-primary" disabled={saving} onClick={handleSaveSender}>
                Save contributor
              </button>
            </div>
            </div>
          </div>
        </div>
      ) : null}

      {previewOpen ? (
        <div className="crm-voucher-preview-layer">
          <div className="crm-voucher-preview-layer__toolbar no-print">
            <button type="button" className="crm-btn crm-btn-ghost" onClick={() => setPreviewOpen(false)}>
              Close preview
            </button>
            <button type="button" className="crm-btn crm-btn-primary" onClick={handlePrint}>
              Print / Save PDF
            </button>
          </div>
          <VoucherPrintSheet ref={printRef} voucher={voucher} receiver={receiver} senders={senders} />
        </div>
      ) : null}
    </>,
    document.body
  )
}

export default VoucherDetailModal
