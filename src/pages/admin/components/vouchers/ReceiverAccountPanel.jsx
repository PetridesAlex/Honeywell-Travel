import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  ChevronDown,
  CircleDollarSign,
  ExternalLink,
  Gift,
  Mail,
  Phone,
  Plus,
  Sparkles,
  UserPlus,
  Users,
  Wallet
} from 'lucide-react'
import { createSender, createVoucher, updateSender } from '../../api/vouchersApi'
import {
  clientDisplayName,
  computeVoucherBalance,
  EMPTY_SENDER,
  EMPTY_VOUCHER,
  formatVoucherMoney,
  generateVoucherCode,
  getVoucherTypeEmoji,
  getVoucherTypeLabel,
  voucherStatusClass,
  voucherStatusLabel
} from '../../utils/vouchers'
import VoucherProgressBar from './VoucherProgressBar'
import VoucherSendersEditor from './VoucherSendersEditor'

function profileInitials(name) {
  return (name || '?')
    .trim()
    .split(/\s+/)
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function SenderListItem({ sender, onTogglePaid, savingId }) {
  const initials = profileInitials(sender.full_name)
  const isPaid = sender.payment_status === 'paid'
  const busy = savingId === sender.id

  return (
    <li className="crm-receiver-sender-row">
      <span className="crm-receiver-sender-row__avatar-ring">
        <span className="crm-receiver-sender-row__avatar" aria-hidden="true">
          {initials}
        </span>
      </span>
      <span className="crm-receiver-sender-row__copy">
        <strong>{sender.full_name}</strong>
        <span className="crm-receiver-sender-row__meta">
          <CircleDollarSign size={13} aria-hidden />
          {formatVoucherMoney(sender.contribution_amount)}
          <span className={`crm-receiver-sender-row__chip${isPaid ? ' crm-receiver-sender-row__chip--paid' : ''}`}>
            {isPaid ? (
              <>
                <BadgeCheck size={12} aria-hidden />
                Paid
              </>
            ) : (
              'Owes'
            )}
          </span>
        </span>
      </span>
      <button
        type="button"
        className={`crm-receiver-sender-row__pay-btn${isPaid ? ' crm-receiver-sender-row__pay-btn--paid' : ''}`}
        disabled={busy}
        onClick={() => onTogglePaid?.(sender)}
      >
        {busy ? '…' : isPaid ? (
          <>
            <BadgeCheck size={14} aria-hidden />
            Paid
          </>
        ) : (
          <>
            <Wallet size={14} aria-hidden />
            Mark paid
          </>
        )}
      </button>
    </li>
  )
}

function ReceiverAccountPanel({
  profile,
  clients = [],
  setupRequired,
  onRefresh,
  onOpenVoucher,
  onVoucherCreated
}) {
  const { receiver, vouchers, totalValue, totalCollected, totalRemaining, primaryVoucher, allSenders } =
    profile

  const client = clients.find((c) => Number(c.id) === Number(receiver.client_id))
  const [draftSenders, setDraftSenders] = useState([{ ...EMPTY_SENDER }])
  const [giftAmount, setGiftAmount] = useState('')
  const [showGiftDetails, setShowGiftDetails] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingSenderId, setSavingSenderId] = useState(null)
  const [error, setError] = useState('')

  const primaryBalance = useMemo(
    () => (primaryVoucher ? computeVoucherBalance(primaryVoucher, primaryVoucher.senders) : null),
    [primaryVoucher]
  )

  const draftCount = draftSenders.filter((s) => s.full_name?.trim()).length
  const senderTotal = allSenders.length
  const paidCount = allSenders.filter((s) => s.payment_status === 'paid').length

  const resolveGiftAmount = (rows) => {
    const fromSenders = rows.reduce((sum, s) => sum + Number(s.contribution_amount || 0), 0)
    const fromField = Number(giftAmount || 0)
    if (fromField > 0) return fromField
    if (fromSenders > 0) return fromSenders
    return 0
  }

  const handleSaveSenders = async () => {
    if (setupRequired) {
      setError('Run supabase/fix_gift_vouchers.sql first.')
      return
    }

    const rows = draftSenders.filter((s) => s.full_name?.trim())
    if (!rows.length) {
      setError('Add at least one sender name below.')
      return
    }

    setSaving(true)
    setError('')

    if (!primaryVoucher) {
      const total_amount = resolveGiftAmount(rows)
      if (total_amount <= 0) {
        setError('Enter a gift amount above, or set each sender\'s contribution.')
        setSaving(false)
        return
      }

      const { data, error: err } = await createVoucher(
        {
          ...EMPTY_VOUCHER,
          voucher_code: generateVoucherCode(),
          voucher_title: `${receiver.full_name}'s gift voucher`,
          voucher_type: 'custom',
          receiver_id: receiver.id,
          total_amount,
          status: 'active'
        },
        rows
      )
      setSaving(false)
      if (err) {
        setError(err.message)
        return
      }
      setDraftSenders([{ ...EMPTY_SENDER }])
      setGiftAmount('')
      onVoucherCreated?.(data)
      onRefresh?.()
      return
    }

    for (const row of rows) {
      const { error: err } = await createSender(primaryVoucher.id, row)
      if (err) {
        setError(err.message)
        setSaving(false)
        return
      }
    }
    setDraftSenders([{ ...EMPTY_SENDER }])
    setSaving(false)
    onRefresh?.()
  }

  const handleToggleSenderPaid = async (sender) => {
    if (setupRequired || !sender?.id || !sender?.voucher_id) return
    setSavingSenderId(sender.id)
    setError('')
    const nextStatus = sender.payment_status === 'paid' ? 'pending' : 'paid'
    const { error: err } = await updateSender(sender.id, sender.voucher_id, {
      ...sender,
      payment_status: nextStatus,
      payment_date: nextStatus === 'paid' ? new Date().toISOString().slice(0, 10) : null
    })
    setSavingSenderId(null)
    if (err) {
      setError(err.message)
      return
    }
    onRefresh?.()
  }

  return (
    <div className="crm-receiver-account crm-receiver-account--senders-first">
      <header className="crm-receiver-account__profile">
        <div className="crm-receiver-account__avatar-ring">
          <span className="crm-receiver-account__avatar" aria-hidden="true">
            {profileInitials(receiver.full_name)}
          </span>
        </div>

        <div className="crm-receiver-account__profile-main">
          <h2>{receiver.full_name}</h2>

          <ul className="crm-receiver-account__meta">
            {receiver.email ? (
              <li>
                <Mail size={14} aria-hidden />
                {receiver.email}
              </li>
            ) : null}
            {receiver.phone ? (
              <li>
                <Phone size={14} aria-hidden />
                {receiver.phone}
              </li>
            ) : null}
            {client ? (
              <li>
                <ExternalLink size={14} aria-hidden />
                <Link to={`/admin/clients/${client.id}`} className="crm-receiver-account__client-link">
                  {clientDisplayName(client)}
                </Link>
              </li>
            ) : receiver.client_id ? (
              <li>
                <ExternalLink size={14} aria-hidden />
                <span>CRM client #{receiver.client_id}</span>
              </li>
            ) : null}
          </ul>

          <div className="crm-receiver-account__counters">
            <div className="crm-receiver-account__counter">
              <strong>{senderTotal}</strong>
              <span>
                <Users size={13} aria-hidden />
                Senders
              </span>
            </div>
            <div className="crm-receiver-account__counter">
              <strong>{paidCount}</strong>
              <span>
                <BadgeCheck size={13} aria-hidden />
                Paid
              </span>
            </div>
            {primaryVoucher ? (
              <>
                <div className="crm-receiver-account__counter">
                  <strong>{formatVoucherMoney(totalCollected)}</strong>
                  <span>
                    <Wallet size={13} aria-hidden />
                    Collected
                  </span>
                </div>
                <div className="crm-receiver-account__counter">
                  <strong>{formatVoucherMoney(totalRemaining)}</strong>
                  <span>
                    <CircleDollarSign size={13} aria-hidden />
                    Due
                  </span>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {primaryVoucher && primaryBalance ? (
        <div className="crm-receiver-account__progress-card">
          <div className="crm-receiver-account__progress-head">
            <Gift size={16} aria-hidden />
            <span>Gift progress</span>
            <strong>{formatVoucherMoney(totalValue)}</strong>
          </div>
          <VoucherProgressBar
            total={primaryBalance.total}
            collected={primaryBalance.collected}
            currency={primaryVoucher.currency}
          />
        </div>
      ) : null}

      {error ? <p className="crm-state crm-state-error">{error}</p> : null}

      <section className="crm-receiver-account__senders-panel">
        <header className="crm-receiver-account__section-head">
          <span className="crm-receiver-account__section-icon" aria-hidden="true">
            <UserPlus size={18} />
          </span>
          <div>
            <h3>Add senders</h3>
            <p>Everyone paying towards {receiver.full_name}&apos;s gift.</p>
          </div>
        </header>

        {allSenders.length > 0 ? (
          <div className="crm-receiver-account__payments-block">
            <header className="crm-receiver-account__section-head crm-receiver-account__section-head--compact">
              <span className="crm-receiver-account__section-icon crm-receiver-account__section-icon--green" aria-hidden="true">
                <Wallet size={16} />
              </span>
              <div>
                <h3>Track payments</h3>
                <p>{paidCount} of {senderTotal} contributors paid</p>
              </div>
            </header>
            <ul className="crm-receiver-senders-list crm-receiver-senders-list--premium">
              {allSenders.map((s) => (
                <SenderListItem
                  key={`${s.id}-${s.voucher_id}`}
                  sender={s}
                  savingId={savingSenderId}
                  onTogglePaid={handleToggleSenderPaid}
                />
              ))}
            </ul>
          </div>
        ) : (
          <div className="crm-receiver-account__senders-empty">
            <span className="crm-receiver-account__empty-icon" aria-hidden="true">
              <Users size={22} />
            </span>
            <p>No senders yet</p>
            <span>Add names below to start collecting.</span>
          </div>
        )}

        {!primaryVoucher ? (
          <label className="crm-receiver-account__amount crm-field">
            <span className="crm-receiver-account__amount-label">
              <Gift size={14} aria-hidden />
              Total gift amount
            </span>
            <div className="crm-receiver-account__amount-input">
              <span>€</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="crm-input"
                placeholder="Optional — or set per sender"
                value={giftAmount}
                onChange={(e) => setGiftAmount(e.target.value)}
              />
            </div>
          </label>
        ) : null}

        <VoucherSendersEditor
          senders={draftSenders}
          onChange={setDraftSenders}
          voucherTotal={primaryVoucher?.total_amount || giftAmount}
          variant="ig"
        />

        <div className="crm-receiver-account__senders-actions">
          <button
            type="button"
            className="crm-btn crm-btn-primary crm-btn--voucher-cta crm-btn--ig"
            disabled={saving || draftCount === 0}
            onClick={handleSaveSenders}
          >
            <Plus size={16} aria-hidden />
            {saving
              ? 'Saving…'
              : primaryVoucher
                ? `Add ${draftCount || ''} sender${draftCount === 1 ? '' : 's'}`.trim()
                : `Save & create gift`.trim()}
          </button>
        </div>
      </section>

      {primaryVoucher ? (
        <section className="crm-receiver-account__voucher crm-receiver-account__voucher--compact">
          <button
            type="button"
            className="crm-receiver-account__voucher-toggle"
            onClick={() => setShowGiftDetails((v) => !v)}
            aria-expanded={showGiftDetails}
          >
            <span className="crm-receiver-account__voucher-emoji">{getVoucherTypeEmoji(primaryVoucher.voucher_type)}</span>
            <span className="crm-receiver-account__voucher-title">{primaryVoucher.voucher_title}</span>
            <span className={voucherStatusClass(primaryVoucher.status)}>
              {voucherStatusLabel(primaryVoucher.status)}
            </span>
            <ChevronDown size={16} aria-hidden className={showGiftDetails ? 'is-open' : ''} />
          </button>

          {showGiftDetails ? (
            <div className="crm-receiver-account__voucher-body">
              <p className="crm-voucher-panel__sub">
                <Sparkles size={13} aria-hidden />
                {primaryVoucher.voucher_code} · {getVoucherTypeLabel(primaryVoucher.voucher_type)}
              </p>
              <button
                type="button"
                className="crm-btn crm-btn-primary crm-btn--sm crm-receiver-account__open-details"
                onClick={() => onOpenVoucher?.(primaryVoucher)}
              >
                <ExternalLink size={14} aria-hidden />
                Open full details
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {vouchers.length > 1 ? (
        <section className="crm-receiver-account__history">
          <h4>
            <Gift size={15} aria-hidden />
            All vouchers
          </h4>
          <ul className="crm-voucher-mini-list">
            {vouchers.map((v) => {
              const bal = computeVoucherBalance(v, v.senders)
              return (
                <li key={v.id}>
                  <button type="button" onClick={() => onOpenVoucher?.(v)}>
                    <strong>{v.voucher_title}</strong>
                    <span>
                      {formatVoucherMoney(bal.collected)} / {formatVoucherMoney(v.total_amount, v.currency)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

export default ReceiverAccountPanel
