import { useCallback, useEffect, useMemo, useState } from 'react'
import { Gift, Plus, RefreshCw, Search, UserRound } from 'lucide-react'
import AdminLayout from './components/AdminLayout'
import VoucherDetailModal from './components/vouchers/VoucherDetailModal'
import VoucherProgressBar from './components/vouchers/VoucherProgressBar'
import VoucherReceiverPicker from './components/vouchers/VoucherReceiverPicker'
import VoucherSendersEditor from './components/vouchers/VoucherSendersEditor'
import CreateReceiverAccountModal from './components/vouchers/CreateReceiverAccountModal'
import ReceiverAccountPanel from './components/vouchers/ReceiverAccountPanel'
import VoucherDashboard from './components/vouchers/VoucherDashboard'
import { fetchClients } from './api/clientsApi'
import {
  createReceiver,
  createVoucher,
  ensureReceiverFromClient,
  fetchAllPayments,
  fetchReceiverProfile,
  fetchReceivers,
  fetchVouchersWithDetails
} from './api/vouchersApi'
import {
  clientDisplayName,
  computeVoucherBalance,
  EMPTY_RECEIVER,
  EMPTY_SENDER,
  EMPTY_VOUCHER,
  formatVoucherDate,
  formatVoucherDateTime,
  formatVoucherMoney,
  generateVoucherCode,
  getVoucherTypeEmoji,
  getVoucherTypeLabel,
  VOUCHER_STATUSES,
  VOUCHER_TEMPLATES,
  VOUCHER_TYPES,
  voucherMatchesSearch,
  voucherStatusClass,
  voucherStatusLabel
} from './utils/vouchers'
import './Leads.css'

const TABS = [
  { id: 'accounts', label: 'Receiver Accounts', icon: UserRound },
  { id: 'vouchers', label: 'Gift Vouchers', icon: Gift }
]

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'partially_paid', label: 'Partially paid' },
  { id: 'fully_paid', label: 'Fully paid' },
  { id: 'draft', label: 'Draft' },
  { id: 'expired', label: 'Expired' },
  { id: 'redeemed', label: 'Redeemed' },
  { id: 'cancelled', label: 'Cancelled' }
]

function GiftVouchers() {
  const [tab, setTab] = useState('accounts')
  const [voucherView, setVoucherView] = useState('list')
  const [vouchers, setVouchers] = useState([])
  const [receivers, setReceivers] = useState([])
  const [clients, setClients] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedVoucher, setSelectedVoucher] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [receiverProfile, setReceiverProfile] = useState(null)
  const [createReceiverOpen, setCreateReceiverOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [voucherForm, setVoucherForm] = useState({ ...EMPTY_VOUCHER, voucher_code: generateVoucherCode() })
  const [receiverMode, setReceiverMode] = useState('client')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const [newReceiver, setNewReceiver] = useState({ ...EMPTY_RECEIVER })
  const [initialSenders, setInitialSenders] = useState([{ ...EMPTY_SENDER }])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const [vRes, rRes, pRes, cRes] = await Promise.all([
      fetchVouchersWithDetails(),
      fetchReceivers(),
      fetchAllPayments(),
      fetchClients()
    ])
    if (vRes.error?.message?.includes('Gift voucher tables')) {
      setError(vRes.error.message)
    } else if (vRes.error) {
      setError(vRes.error.message)
    } else {
      setVouchers(vRes.data)
    }
    if (!rRes.error) setReceivers(rRes.data)
    if (!pRes.error) setPayments(pRes.data)
    if (!cRes.error) setClients(cRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      if (!voucherMatchesSearch(v, search)) return false
      if (statusFilter !== 'all' && v.status !== statusFilter) return false
      return true
    })
  }, [vouchers, search, statusFilter])

  const setupRequired = Boolean(error?.includes('Gift voucher tables'))

  const openCreate = () => {
    setSaveError('')
    setVoucherForm({ ...EMPTY_VOUCHER, voucher_code: generateVoucherCode() })
    setReceiverMode('client')
    setSelectedClientId('')
    setClientSearch('')
    setNewReceiver({ ...EMPTY_RECEIVER })
    setInitialSenders([{ ...EMPTY_SENDER }])
    setTab('vouchers')
    setVoucherView('create')
  }

  const focusReceiver = async (receiverOrId) => {
    const id = typeof receiverOrId === 'object' ? receiverOrId?.id : receiverOrId
    if (!id) return
    setTab('accounts')
    const existing = receivers.find((r) => Number(r.id) === Number(id))
    if (existing) {
      await openReceiverProfile(existing)
      return
    }
    const { data } = await fetchReceiverProfile(id)
    if (data) setReceiverProfile(data)
  }

  const renderVoucherList = ({ compact = false, emptyMessage = 'No vouchers match your search.' } = {}) => {
    if (filteredVouchers.length === 0) {
      return (
        <div className="crm-voucher-empty">
          <Gift size={28} aria-hidden />
          <p>{setupRequired ? 'Run the database setup below, then create your first receiver account.' : emptyMessage}</p>
          {!setupRequired ? (
            <button type="button" className="crm-btn crm-btn-primary crm-btn--voucher-cta" onClick={openCreateReceiver}>
              <Plus size={16} aria-hidden />
              Create receiver account
            </button>
          ) : null}
        </div>
      )
    }

    if (compact) {
      return (
        <div className="crm-voucher-list">
          {filteredVouchers.slice(0, 8).map((v) => renderVoucherRow(v))}
        </div>
      )
    }

    return (
      <div className="crm-table-wrap crm-table-wrap--vouchers">
        <table className="crm-table crm-table--vouchers crm-table--vouchers-list">
          <thead>
            <tr>
              <th>Code</th>
              <th>Voucher</th>
              <th>Receiver</th>
              <th>Amount</th>
              <th>Collected</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Expiry</th>
            </tr>
          </thead>
          <tbody>
            {filteredVouchers.map((v) => {
              const bal = computeVoucherBalance(v, v.senders)
              return (
                <tr key={v.id} className="crm-voucher-list-row" onClick={() => openVoucher(v)}>
                  <td>
                    <code className="crm-voucher-code">{v.voucher_code}</code>
                  </td>
                  <td>
                    <span className="crm-voucher-list-row__title">
                      {getVoucherTypeEmoji(v.voucher_type)} {v.voucher_title}
                    </span>
                    <span className="crm-voucher-table__sub">{getVoucherTypeLabel(v.voucher_type)}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="crm-link-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (v.receiver) focusReceiver(v.receiver)
                      }}
                    >
                      {v.receiver?.full_name || '—'}
                    </button>
                    {v.receiver?.email ? <span className="crm-voucher-table__sub">{v.receiver.email}</span> : null}
                  </td>
                  <td>{formatVoucherMoney(v.total_amount, v.currency)}</td>
                  <td>{formatVoucherMoney(bal.collected, v.currency)}</td>
                  <td className="crm-voucher-list-row__progress">
                    <VoucherProgressBar total={bal.total} collected={bal.collected} currency={v.currency} showLabels={false} />
                  </td>
                  <td>
                    <span className={voucherStatusClass(v.status)}>{voucherStatusLabel(v.status)}</span>
                  </td>
                  <td>{formatVoucherDate(v.expiry_date)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  const renderVoucherRow = (v) => {
    const bal = computeVoucherBalance(v, v.senders)
    return (
      <button key={v.id} type="button" className="crm-voucher-row" onClick={() => openVoucher(v)}>
        <span className="crm-voucher-row__emoji">{getVoucherTypeEmoji(v.voucher_type)}</span>
        <span className="crm-voucher-row__main">
          <strong>{v.voucher_title}</strong>
          <span>
            {v.receiver?.full_name || '—'} · {v.voucher_code}
          </span>
        </span>
        <span className={voucherStatusClass(v.status)}>{voucherStatusLabel(v.status)}</span>
        <span className="crm-voucher-row__amount">{formatVoucherMoney(v.total_amount, v.currency)}</span>
        <span className="crm-voucher-row__progress">
          <VoucherProgressBar total={bal.total} collected={bal.collected} currency={v.currency} showLabels={false} />
        </span>
      </button>
    )
  }

  const openVoucher = (voucher) => {
    setSelectedVoucher(voucher)
    setDetailOpen(true)
  }

  const applyTemplate = (type) => {
    const tpl = VOUCHER_TEMPLATES[type] || VOUCHER_TEMPLATES.custom
    setVoucherForm((prev) => ({
      ...prev,
      voucher_type: type,
      template_key: type,
      voucher_title: prev.voucher_title || tpl.title,
      gift_message: prev.gift_message || tpl.message
    }))
  }

  const openReceiverProfile = async (receiver) => {
    const { data } = await fetchReceiverProfile(receiver.id)
    setReceiverProfile(data)
  }

  const openReceiverFromDashboard = async (receiver) => {
    await openReceiverProfile(receiver)
  }

  const openCreateReceiver = () => {
    setCreateReceiverOpen(true)
  }

  const handleVoucherUpdated = async () => {
    const receiverId = selectedVoucher?.receiver_id
    const { data } = await fetchVouchersWithDetails()
    if (data) {
      setVouchers(data)
      if (selectedVoucher?.id) {
        const fresh = data.find((v) => v.id === selectedVoucher.id)
        if (fresh) setSelectedVoucher(fresh)
      }
    }
    const pRes = await fetchAllPayments()
    if (!pRes.error) setPayments(pRes.data)
    const rRes = await fetchReceivers()
    if (!rRes.error) setReceivers(rRes.data)
    const focusId = receiverId || selectedVoucher?.receiver_id
    if (focusId) await focusReceiver(focusId)
  }

  const handleReceiverAccountCreated = async (receiver) => {
    await load()
    if (receiver?.id) {
      await focusReceiver(receiver)
    }
  }

  const refreshReceiverProfile = async () => {
    if (!receiverProfile?.receiver?.id) return
    const { data } = await fetchReceiverProfile(receiverProfile.receiver.id)
    if (data) setReceiverProfile(data)
    await load()
  }

  const handleCreateVoucher = async (event) => {
    event.preventDefault()
    setSaveError('')
    if (setupRequired) {
      setSaveError('Run supabase/fix_gift_vouchers.sql in Supabase first.')
      return
    }
    if (!voucherForm.voucher_title?.trim()) {
      setSaveError('Voucher title is required.')
      return
    }
    if (!voucherForm.total_amount || Number(voucherForm.total_amount) <= 0) {
      setSaveError('Enter a valid voucher amount.')
      return
    }

    setSaving(true)
    let receiverId = voucherForm.receiver_id

    if (receiverMode === 'client') {
      const client = clients.find((c) => String(c.id) === String(selectedClientId))
      if (!client) {
        setSaveError('Select a CRM client as the voucher receiver.')
        setSaving(false)
        return
      }
      const { data: recv, error: recvErr } = await ensureReceiverFromClient(client)
      if (recvErr) {
        setSaveError(recvErr.message)
        setSaving(false)
        return
      }
      receiverId = recv.id
      setReceivers((prev) => {
        const exists = prev.some((r) => r.id === recv.id)
        const next = exists ? prev.map((r) => (r.id === recv.id ? recv : r)) : [...prev, recv]
        return next.sort((a, b) => a.full_name.localeCompare(b.full_name))
      })
    } else if (receiverMode === 'new') {
      if (!newReceiver.full_name?.trim()) {
        setSaveError('Receiver name is required.')
        setSaving(false)
        return
      }
      const { data: recv, error: recvErr } = await createReceiver(newReceiver)
      if (recvErr) {
        setSaveError(recvErr.message)
        setSaving(false)
        return
      }
      receiverId = recv.id
      setReceivers((prev) => [...prev, recv].sort((a, b) => a.full_name.localeCompare(b.full_name)))
    } else if (receiverMode === 'existing') {
      if (!receiverId) {
        setSaveError('Select a voucher receiver.')
        setSaving(false)
        return
      }
    }

    const { data, error: createErr } = await createVoucher(
      { ...voucherForm, receiver_id: receiverId, status: voucherForm.status || 'active' },
      initialSenders.filter((s) => s.full_name?.trim())
    )
    setSaving(false)
    if (createErr) {
      setSaveError(createErr.message)
      return
    }

    setVoucherForm({ ...EMPTY_VOUCHER, voucher_code: generateVoucherCode() })
    setNewReceiver({ ...EMPTY_RECEIVER })
    setInitialSenders([{ ...EMPTY_SENDER }])
    setSelectedClientId('')
    setClientSearch('')
    setReceiverMode('client')
    await load()
    setTab('accounts')
    setVoucherView('list')
    if (receiverId) await focusReceiver(receiverId)
  }

  return (
    <AdminLayout
      title="Gift Vouchers"
      subtitle="Create receiver accounts, add senders, and track gift voucher balances."
      actions={
        <button type="button" className="crm-btn crm-btn-primary crm-btn--voucher-cta" onClick={openCreateReceiver}>
          <Plus size={16} aria-hidden />
          Create receiver account
        </button>
      }
    >
      <section className="crm-workspace crm-workspace--vouchers">
        <div className="crm-voucher-command-bar">
          {tab === 'vouchers' ? (
            <label className="crm-voucher-search">
              <Search size={18} aria-hidden className="crm-voucher-search__icon" />
              <input
                type="search"
                className="crm-voucher-search__input"
                placeholder="Search receiver, sender, code, phone, or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search vouchers"
              />
            </label>
          ) : (
            <p className="crm-voucher-command-bar__create-hint">
              Create receiver accounts, add senders, and see balances when money comes in.
            </p>
          )}

          <div className="crm-voucher-command-bar__actions">
            <button type="button" className="crm-btn crm-btn-ghost crm-btn--sm" onClick={load} disabled={loading}>
              <RefreshCw size={14} aria-hidden />
              Refresh
            </button>
            {tab === 'accounts' ? (
              <button
                type="button"
                className="crm-btn crm-btn-primary crm-btn--sm crm-btn--voucher-cta"
                onClick={openCreateReceiver}
              >
                <Plus size={14} aria-hidden />
                New account
              </button>
            ) : (
              <button type="button" className="crm-btn crm-btn-primary crm-btn--sm" onClick={openCreate}>
                <Plus size={14} aria-hidden />
                New voucher
              </button>
            )}
          </div>
        </div>

        <div className="crm-team-tabs crm-team-tabs--vouchers" role="tablist" aria-label="Gift voucher views">
          {TABS.map((t) => {
            const TabIcon = t.icon
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`crm-team-tabs__btn crm-team-tabs__btn--vouchers${isActive ? ' crm-team-tabs__btn--active' : ''}`}
                onClick={() => {
                  setTab(t.id)
                  if (t.id === 'vouchers') setVoucherView('list')
                }}
              >
                <TabIcon size={16} aria-hidden className="crm-team-tabs__icon" />
                <span className="crm-team-tabs__label">{t.label}</span>
              </button>
            )
          })}
        </div>

        {loading ? <p className="crm-state">Loading gift vouchers…</p> : null}

        {!loading && setupRequired ? (
          <div className="crm-voucher-setup-banner" role="alert">
            <div className="crm-voucher-setup-banner__copy">
              <h3>Database setup required</h3>
              <p>
                Gift voucher tables are not in Supabase yet. Open the Supabase SQL Editor, paste the contents of{' '}
                <code>supabase/fix_gift_vouchers.sql</code>, run it, then click Refresh.
              </p>
              <ol className="crm-voucher-setup-banner__steps">
                <li>Supabase dashboard → SQL Editor → New query</li>
                <li>Copy all of <code>supabase/fix_gift_vouchers.sql</code> from this project</li>
                <li>Run query, then refresh this page</li>
              </ol>
            </div>
            <button type="button" className="crm-btn crm-btn-primary" onClick={load} disabled={loading}>
              <RefreshCw size={14} aria-hidden />
              I ran the SQL — refresh
            </button>
          </div>
        ) : null}

        {!loading && error && !setupRequired ? <p className="crm-state crm-state-error">{error}</p> : null}

        {!loading && (!error || setupRequired) && tab === 'accounts' ? (
          <div className="crm-voucher-accounts">
            <VoucherDashboard
              receivers={receivers}
              vouchers={vouchers}
              setupRequired={setupRequired}
              selectedReceiverId={receiverProfile?.receiver?.id}
              onCreateReceiver={openCreateReceiver}
              onOpenReceiver={openReceiverFromDashboard}
              onViewAllVouchers={() => {
                setTab('vouchers')
                setVoucherView('list')
              }}
            >
              {receiverProfile ? (
                <ReceiverAccountPanel
                  profile={receiverProfile}
                  clients={clients}
                  setupRequired={setupRequired}
                  onRefresh={refreshReceiverProfile}
                  onOpenVoucher={openVoucher}
                  onVoucherCreated={() => refreshReceiverProfile()}
                />
              ) : null}
            </VoucherDashboard>
          </div>
        ) : null}

        {!loading && (!error || setupRequired) && tab === 'vouchers' && voucherView === 'list' ? (
          <section className="crm-voucher-panel crm-voucher-panel--list">
            <div className="crm-voucher-panel__head">
              <div>
                <h3>All gift vouchers</h3>
                <p className="crm-voucher-panel__sub">
                  Create any gift voucher — the receiver account appears automatically when senders pay in.
                </p>
                <p className="crm-voucher-panel__sub">{filteredVouchers.length} voucher{filteredVouchers.length === 1 ? '' : 's'}</p>
              </div>
              <button type="button" className="crm-btn crm-btn-primary crm-btn--sm" onClick={openCreate}>
                <Plus size={14} aria-hidden />
                New voucher
              </button>
            </div>

            <div className="crm-filter-chips crm-filter-chips--vouchers" role="toolbar" aria-label="Filter by status">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`crm-chip${statusFilter === f.id ? ' crm-chip--active' : ''}`}
                  onClick={() => setStatusFilter(f.id)}
                  aria-pressed={statusFilter === f.id}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {renderVoucherList({
              emptyMessage: 'No gift vouchers yet. Create one or start from a receiver account.'
            })}
          </section>
        ) : null}

        {!loading && (!error || setupRequired) && tab === 'vouchers' && voucherView === 'create' ? (
          <form className="crm-voucher-create" onSubmit={handleCreateVoucher}>
            <div className="crm-voucher-create__head">
              <div>
                <h3>Create gift voucher</h3>
                <p className="crm-voucher-panel__sub">
                  Issue a voucher for any recipient. Their receiver account is created or linked automatically.
                </p>
              </div>
              <button type="button" className="crm-btn crm-btn-ghost crm-btn--sm" onClick={() => setVoucherView('list')}>
                Back to list
              </button>
            </div>

            <div className="crm-voucher-create__templates">
              <p className="crm-voucher-create__label">Quick templates</p>
              <div className="crm-voucher-template-chips">
                {VOUCHER_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`crm-chip${voucherForm.voucher_type === t.id ? ' crm-chip--active' : ''}`}
                    onClick={() => applyTemplate(t.id)}
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {saveError ? <p className="crm-state crm-state-error">{saveError}</p> : null}

            <div className="crm-form-grid crm-form-grid--voucher">
              <label className="crm-field">
                <span>Voucher code</span>
                <input className="crm-input" value={voucherForm.voucher_code} readOnly />
              </label>
              <label className="crm-field">
                <span>Status</span>
                <select
                  className="crm-select"
                  value={voucherForm.status}
                  onChange={(e) => setVoucherForm((p) => ({ ...p, status: e.target.value }))}
                >
                  {VOUCHER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {voucherStatusLabel(s)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="crm-field crm-field--full">
                <span>Voucher title</span>
                <input
                  className="crm-input"
                  value={voucherForm.voucher_title}
                  onChange={(e) => setVoucherForm((p) => ({ ...p, voucher_title: e.target.value }))}
                  required
                />
              </label>
              <label className="crm-field">
                <span>Total amount (EUR)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="crm-input"
                  value={voucherForm.total_amount}
                  onChange={(e) => setVoucherForm((p) => ({ ...p, total_amount: e.target.value }))}
                  required
                />
              </label>
              <label className="crm-field">
                <span>Expiry date</span>
                <input
                  type="date"
                  className="crm-input"
                  value={voucherForm.expiry_date || ''}
                  onChange={(e) => setVoucherForm((p) => ({ ...p, expiry_date: e.target.value }))}
                />
              </label>
              <label className="crm-field crm-field--full">
                <span>Gift message</span>
                <textarea
                  className="crm-textarea"
                  rows={3}
                  value={voucherForm.gift_message || ''}
                  onChange={(e) => setVoucherForm((p) => ({ ...p, gift_message: e.target.value }))}
                />
              </label>
              <label className="crm-field crm-field--full">
                <span>Internal notes</span>
                <textarea
                  className="crm-textarea"
                  rows={2}
                  value={voucherForm.notes || ''}
                  onChange={(e) => setVoucherForm((p) => ({ ...p, notes: e.target.value }))}
                />
              </label>
            </div>

            <VoucherReceiverPicker
              clients={clients}
              receivers={receivers}
              mode={receiverMode}
              onModeChange={setReceiverMode}
              clientSearch={clientSearch}
              onClientSearchChange={setClientSearch}
              selectedClientId={selectedClientId}
              onSelectClient={setSelectedClientId}
              selectedReceiverId={voucherForm.receiver_id || ''}
              onSelectReceiver={(value) => setVoucherForm((p) => ({ ...p, receiver_id: value }))}
              newReceiver={newReceiver}
              onNewReceiverChange={setNewReceiver}
            />

            <VoucherSendersEditor
              senders={initialSenders}
              onChange={setInitialSenders}
              voucherTotal={voucherForm.total_amount}
            />

            <div className="crm-voucher-create__submit">
              <button type="submit" className="crm-btn crm-btn-primary" disabled={saving}>
                <Gift size={16} aria-hidden />
                {saving ? 'Creating…' : 'Create voucher'}
              </button>
            </div>
          </form>
        ) : null}

      </section>

      <VoucherDetailModal
        open={detailOpen}
        voucher={selectedVoucher}
        onClose={() => {
          setDetailOpen(false)
          setSelectedVoucher(null)
        }}
        onUpdated={handleVoucherUpdated}
      />

      <CreateReceiverAccountModal
        open={createReceiverOpen}
        clients={clients}
        setupRequired={setupRequired}
        onClose={() => setCreateReceiverOpen(false)}
        onCreated={handleReceiverAccountCreated}
      />
    </AdminLayout>
  )
}


export default GiftVouchers
