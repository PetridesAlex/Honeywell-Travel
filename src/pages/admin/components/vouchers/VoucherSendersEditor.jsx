import { HandCoins, Plus, Sparkles, Trash2, Users } from 'lucide-react'
import { formatVoucherMoney, parseSenderNamesBulk, splitSenderAmount } from '../../utils/vouchers'

const EMPTY_ROW = {
  full_name: '',
  contribution_amount: '',
  payment_status: 'pending',
  payment_method: 'bank transfer'
}

function senderInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length >= 2) return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
  return (parts[0]?.slice(0, 2) || '?').toUpperCase()
}

function VoucherSendersEditor({ senders, onChange, voucherTotal = '', variant = 'default' }) {
  const namedSenders = senders.filter((s) => s.full_name?.trim())
  const totalPending = namedSenders
    .filter((s) => s.payment_status === 'pending')
    .reduce((sum, s) => sum + Number(s.contribution_amount || 0), 0)
  const totalPaid = namedSenders
    .filter((s) => s.payment_status === 'paid')
    .reduce((sum, s) => sum + Number(s.contribution_amount || 0), 0)
  const paidCount = namedSenders.filter((s) => s.payment_status === 'paid').length

  const updateRow = (idx, patch) => {
    const next = senders.map((row, i) => (i === idx ? { ...row, ...patch } : row))
    onChange(next)
  }

  const addRow = () => onChange([...senders, { ...EMPTY_ROW }])

  const removeRow = (idx) => onChange(senders.filter((_, i) => i !== idx))

  const applyBulkNames = (text) => {
    const names = parseSenderNamesBulk(text)
    if (!names.length) return
    const split = splitSenderAmount(voucherTotal, names.length)
    const rows = names.map((name) => ({
      ...EMPTY_ROW,
      full_name: name,
      contribution_amount: split
    }))
    onChange([...senders.filter((s) => s.full_name?.trim()), ...rows])
  }

  const splitEvenly = () => {
    const rows = senders.filter((s) => s.full_name?.trim())
    if (!rows.length) return
    const each = splitSenderAmount(voucherTotal, rows.length)
    onChange(rows.map((r) => ({ ...r, contribution_amount: each })))
  }

  return (
    <section className={`crm-voucher-senders-editor${variant === 'ig' ? ' crm-voucher-senders-editor--ig' : ''}`}>
      <header className="crm-voucher-senders-editor__head">
        <div className="crm-voucher-senders-editor__intro">
          <span className="crm-voucher-senders-editor__icon" aria-hidden="true">
            <Users size={18} strokeWidth={2.1} />
          </span>
          <div className="crm-voucher-senders-editor__copy">
            <h3>Contributors</h3>
            <p>Everyone paying towards this gift — their names appear on the printed voucher.</p>
          </div>
        </div>
        <button type="button" className="crm-btn crm-btn-primary crm-btn--sm" onClick={addRow}>
          <Plus size={14} aria-hidden />
          Add contributor
        </button>
      </header>

      {namedSenders.length > 0 ? (
        <div className="crm-voucher-senders-editor__stats">
          <article className="crm-voucher-senders-stat">
            <span className="crm-voucher-senders-stat__label">Contributors</span>
            <strong>{namedSenders.length}</strong>
          </article>
          <article className="crm-voucher-senders-stat crm-voucher-senders-stat--paid">
            <span className="crm-voucher-senders-stat__label">Collected</span>
            <strong>{formatVoucherMoney(totalPaid)}</strong>
            <span className="crm-voucher-senders-stat__sub">{paidCount} paid</span>
          </article>
          <article className="crm-voucher-senders-stat crm-voucher-senders-stat--due">
            <span className="crm-voucher-senders-stat__label">Still owed</span>
            <strong>{formatVoucherMoney(totalPending)}</strong>
          </article>
        </div>
      ) : null}

      <div className="crm-voucher-senders-editor__bulk">
        <div className="crm-voucher-senders-editor__bulk-head">
          <Sparkles size={15} aria-hidden />
          <div>
            <strong>Quick add names</strong>
            <span>Paste one name per line — amounts split automatically when you leave the box.</span>
          </div>
        </div>
        <textarea
          className="crm-voucher-senders-editor__bulk-input"
          rows={3}
          placeholder={'Maria Papadou\nAndreas Christou\nElena Georgiou'}
          onBlur={(e) => {
            if (e.target.value.trim()) {
              applyBulkNames(e.target.value)
              e.target.value = ''
            }
          }}
        />
      </div>

      {senders.length > 0 ? (
        <div className="crm-voucher-senders-editor__list">
          <div className="crm-voucher-senders-editor__list-head">
            <span>Contributor</span>
            <span>Amount</span>
            <span>Status</span>
            <span aria-hidden="true" />
          </div>
          {senders.map((sender, idx) => (
            <div key={idx} className="crm-voucher-sender-row">
              <div className="crm-voucher-sender-row__name">
                <span className="crm-voucher-sender-row__avatar" aria-hidden="true">
                  {sender.full_name?.trim() ? senderInitials(sender.full_name) : '?'}
                </span>
                <input
                  className="crm-voucher-sender-row__input"
                  placeholder="Full name"
                  value={sender.full_name}
                  onChange={(e) => updateRow(idx, { full_name: e.target.value })}
                />
              </div>
              <div className="crm-voucher-sender-row__amount">
                <span className="crm-voucher-sender-row__currency">€</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="crm-voucher-sender-row__input crm-voucher-sender-row__input--amount"
                  placeholder="0.00"
                  value={sender.contribution_amount}
                  onChange={(e) => updateRow(idx, { contribution_amount: e.target.value })}
                />
              </div>
              <div className="crm-voucher-sender-row__status">
                <button
                  type="button"
                  className={`crm-voucher-pay-pill${sender.payment_status === 'paid' ? ' crm-voucher-pay-pill--paid' : ''}`}
                  onClick={() => updateRow(idx, { payment_status: 'paid' })}
                  aria-pressed={sender.payment_status === 'paid'}
                >
                  Paid
                </button>
                <button
                  type="button"
                  className={`crm-voucher-pay-pill${sender.payment_status === 'pending' ? ' crm-voucher-pay-pill--due' : ''}`}
                  onClick={() => updateRow(idx, { payment_status: 'pending' })}
                  aria-pressed={sender.payment_status === 'pending'}
                >
                  Owes
                </button>
              </div>
              <button
                type="button"
                className="crm-voucher-sender-row__remove"
                aria-label="Remove contributor"
                onClick={() => removeRow(idx)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {namedSenders.length > 1 && voucherTotal ? (
            <button type="button" className="crm-voucher-senders-editor__split" onClick={splitEvenly}>
              <HandCoins size={15} aria-hidden />
              Split {formatVoucherMoney(voucherTotal)} evenly
            </button>
          ) : null}
        </div>
      ) : null}

      {namedSenders.length > 0 ? (
        <div className="crm-voucher-senders-preview">
          <p className="crm-voucher-senders-preview__label">Voucher sender list</p>
          <ul className="crm-voucher-senders-preview__list">
            {namedSenders.map((s, i) => (
              <li key={`${s.full_name}-${i}`} className="crm-voucher-senders-preview__item">
                <span className="crm-voucher-senders-preview__avatar" aria-hidden="true">
                  {senderInitials(s.full_name)}
                </span>
                <span className="crm-voucher-senders-preview__name">{s.full_name}</span>
                <span
                  className={`crm-voucher-senders-preview__badge crm-voucher-senders-preview__badge--${s.payment_status}`}
                >
                  {s.payment_status === 'paid' ? 'Paid' : 'Owes'}
                </span>
                <span className="crm-voucher-senders-preview__meta">
                  {s.contribution_amount ? formatVoucherMoney(s.contribution_amount) : '—'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="crm-voucher-senders-editor__empty">
          <HandCoins size={22} aria-hidden />
          <p>No contributors yet — add names above or leave empty if one person pays the full amount.</p>
        </div>
      )}
    </section>
  )
}


export default VoucherSendersEditor
