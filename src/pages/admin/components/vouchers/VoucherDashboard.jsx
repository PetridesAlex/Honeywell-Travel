import { Check, Gift, Plus, UserRound, Users, Wallet } from 'lucide-react'
import VoucherProgressBar from './VoucherProgressBar'
import {
  computeVoucherBalance,
  computeReceiverSummaries,
  formatVoucherMoney,
  voucherStatusClass,
  voucherStatusLabel
} from '../../utils/vouchers'

const WORKFLOW_STEPS = [
  { id: 1, label: 'Create account', desc: 'Pick the gift recipient from CRM' },
  { id: 2, label: 'Add senders', desc: 'List everyone paying towards the gift' },
  { id: 3, label: 'Track payments', desc: 'Mark paid when money comes in' }
]

function ReceiverDirectoryItem({ summary, selected, onOpen, setupRequired }) {
  const { receiver, senderCount, totalCollected, hasFunds } = summary
  const initials = profileInitials(receiver.full_name)

  return (
    <button
      type="button"
      className={`crm-voucher-directory__item${selected ? ' crm-voucher-directory__item--active' : ''}${
        hasFunds ? ' crm-voucher-directory__item--funded' : ''
      }`}
      onClick={() => onOpen?.(receiver)}
      disabled={setupRequired}
    >
      <span className="crm-voucher-directory__avatar-ring">
        <span className="crm-voucher-directory__avatar" aria-hidden="true">
          {initials}
        </span>
      </span>
      <span className="crm-voucher-directory__copy">
        <strong>{receiver.full_name}</strong>
        <span className="crm-voucher-directory__meta">
          <Users size={12} aria-hidden />
          {senderCount} sender{senderCount === 1 ? '' : 's'}
          {totalCollected > 0 ? (
            <>
              <Wallet size={12} aria-hidden />
              {formatVoucherMoney(totalCollected)}
            </>
          ) : null}
        </span>
      </span>
    </button>
  )
}

function profileInitials(name) {
  return (name || '?')
    .trim()
    .split(/\s+/)
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function VoucherDashboard({
  receivers = [],
  vouchers = [],
  setupRequired,
  selectedReceiverId,
  onCreateReceiver,
  onOpenReceiver,
  onViewAllVouchers,
  children
}) {
  const summaries = computeReceiverSummaries(receivers, vouchers)
  const accountCount = receivers.length
  const totalGiftValue = summaries.reduce((sum, s) => sum + s.totalValue, 0)
  const totalCollected = summaries.reduce((sum, s) => sum + s.totalCollected, 0)
  const totalOutstanding = summaries.reduce((sum, s) => sum + s.totalRemaining, 0)
  const hasSelection = Boolean(selectedReceiverId)
  const activeStep = !accountCount ? 1 : hasSelection ? 2 : 1

  return (
    <div className="crm-voucher-dashboard">
      <div className="crm-voucher-dashboard__stats">
        <article className="crm-voucher-dashboard-stat">
          <span className="crm-voucher-dashboard-stat__icon" aria-hidden="true">
            <UserRound size={18} />
          </span>
          <div>
            <p>Receiver accounts</p>
            <h3>{accountCount}</h3>
          </div>
        </article>
        <article className="crm-voucher-dashboard-stat crm-voucher-dashboard-stat--gold">
          <span className="crm-voucher-dashboard-stat__icon" aria-hidden="true">
            <Gift size={18} />
          </span>
          <div>
            <p>Total gift value</p>
            <h3>{formatVoucherMoney(totalGiftValue)}</h3>
          </div>
        </article>
        <article className="crm-voucher-dashboard-stat crm-voucher-dashboard-stat--success">
          <span className="crm-voucher-dashboard-stat__icon" aria-hidden="true">
            <Wallet size={18} />
          </span>
          <div>
            <p>Collected</p>
            <h3>{formatVoucherMoney(totalCollected)}</h3>
          </div>
        </article>
        <article className="crm-voucher-dashboard-stat crm-voucher-dashboard-stat--warn">
          <span className="crm-voucher-dashboard-stat__icon" aria-hidden="true">
            <Users size={18} />
          </span>
          <div>
            <p>Balance due</p>
            <h3>{formatVoucherMoney(totalOutstanding)}</h3>
          </div>
        </article>
      </div>

      <section className="crm-voucher-dashboard__hero crm-voucher-dashboard__hero--hub">
        <header className="crm-voucher-dashboard__hero-head">
          <div>
            <p className="crm-voucher-dashboard__eyebrow">Gift voucher workflow</p>
            <h2>Receiver accounts</h2>
          </div>
          <button
            type="button"
            className="crm-btn crm-btn-primary crm-btn--voucher-cta"
            onClick={onCreateReceiver}
            disabled={setupRequired}
          >
            <Plus size={16} aria-hidden />
            Create receiver account
          </button>
        </header>

        <ol className="crm-voucher-workflow-steps" aria-label="Workflow steps">
          {WORKFLOW_STEPS.map((step) => (
            <li
              key={step.id}
              className={`crm-voucher-workflow-step${
                step.id === activeStep ? ' crm-voucher-workflow-step--active' : ''
              }${step.id < activeStep ? ' crm-voucher-workflow-step--done' : ''}`}
            >
              <span className="crm-voucher-workflow-step__num">
                {step.id < activeStep ? <Check size={14} aria-hidden /> : step.id}
              </span>
              <span className="crm-voucher-workflow-step__copy">
                <strong>{step.label}</strong>
                <span>{step.desc}</span>
              </span>
            </li>
          ))}
        </ol>

        {setupRequired ? (
          <div className="crm-voucher-accounts-hub__setup">
            <p>
              <strong>Database setup required.</strong> Run <code>supabase/fix_gift_vouchers.sql</code> in
              Supabase, then refresh — create account, add senders, and track payments will work.
            </p>
          </div>
        ) : null}

        <div className="crm-voucher-accounts-hub__layout">
          <aside className="crm-voucher-accounts-hub__sidebar">
            <div className="crm-voucher-accounts-hub__sidebar-head">
              <h3>Accounts ({accountCount})</h3>
              <button
                type="button"
                className="crm-link-btn"
                onClick={onCreateReceiver}
                disabled={setupRequired}
              >
                + New
              </button>
            </div>

            {summaries.length === 0 ? (
              <div className="crm-voucher-accounts-hub__sidebar-empty">
                <UserRound size={24} aria-hidden />
                <p>No accounts yet. Create the gift recipient&apos;s account to begin.</p>
                <button
                  type="button"
                  className="crm-btn crm-btn-primary crm-btn--sm crm-btn--voucher-cta"
                  onClick={onCreateReceiver}
                  disabled={setupRequired}
                >
                  Create first account
                </button>
              </div>
            ) : (
              <div className="crm-voucher-directory">
                {summaries.map((summary) => (
                  <ReceiverDirectoryItem
                    key={summary.receiver.id}
                    summary={summary}
                    selected={Number(selectedReceiverId) === Number(summary.receiver.id)}
                    onOpen={onOpenReceiver}
                    setupRequired={setupRequired}
                  />
                ))}
              </div>
            )}
          </aside>

          <div className="crm-voucher-accounts-hub__workspace">
            {children || (
              <div className="crm-voucher-accounts-hub__placeholder">
                <Users size={32} aria-hidden />
                <h3>Select a receiver account</h3>
                <p>
                  Choose someone from the list on the left — then add senders and track who has paid.
                </p>
                {summaries.length === 0 ? (
                  <button
                    type="button"
                    className="crm-btn crm-btn-primary crm-btn--voucher-cta"
                    onClick={onCreateReceiver}
                    disabled={setupRequired}
                  >
                    <Plus size={16} aria-hidden />
                    Create receiver account
                  </button>
                ) : (
                  <button
                    type="button"
                    className="crm-btn crm-btn-primary crm-btn--voucher-cta"
                    onClick={() => onOpenReceiver?.(summaries[0].receiver)}
                    disabled={setupRequired}
                  >
                    Open {summaries[0].receiver.full_name}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default VoucherDashboard
