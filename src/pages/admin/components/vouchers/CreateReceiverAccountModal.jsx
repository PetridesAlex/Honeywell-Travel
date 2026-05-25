import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Search, UserPlus, UserRound, X } from 'lucide-react'
import { createReceiver, ensureReceiverFromClient } from '../../api/vouchersApi'
import { clientDisplayName, EMPTY_RECEIVER } from '../../utils/vouchers'

function CreateReceiverAccountModal({ open, clients = [], onClose, onCreated, setupRequired }) {
  const [mode, setMode] = useState('client')
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [manualReceiver, setManualReceiver] = useState({ ...EMPTY_RECEIVER })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setMode('client')
      setClientSearch('')
      setSelectedClientId('')
      setManualReceiver({ ...EMPTY_RECEIVER })
      setError('')
    }
  }, [open])

  const filteredClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase()
    const list = [...clients].sort((a, b) => clientDisplayName(a).localeCompare(clientDisplayName(b)))
    if (!q) return list.slice(0, 30)
    return list
      .filter((c) => {
        const hay = [clientDisplayName(c), c.email, c.phone].filter(Boolean).join(' ').toLowerCase()
        return hay.includes(q)
      })
      .slice(0, 30)
  }, [clients, clientSearch])

  const selectedClient = clients.find((c) => String(c.id) === String(selectedClientId))
  const canSubmit =
    mode === 'client' ? Boolean(selectedClient) : Boolean(manualReceiver.full_name?.trim())

  if (!open) return null

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (setupRequired) {
      setError('Run supabase/fix_gift_vouchers.sql in Supabase first.')
      return
    }

    setSaving(true)
    setError('')

    if (mode === 'client') {
      if (!selectedClient) {
        setError('Select a CRM client for this gift recipient.')
        setSaving(false)
        return
      }
      const { data, error: err } = await ensureReceiverFromClient(selectedClient)
      setSaving(false)
      if (err) {
        setError(err.message)
        return
      }
      onCreated?.(data)
      onClose()
      return
    }

    if (!manualReceiver.full_name?.trim()) {
      setError('Enter the gift recipient\'s name.')
      setSaving(false)
      return
    }

    const { data, error: err } = await createReceiver(manualReceiver)
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    onCreated?.(data)
    onClose()
  }

  return createPortal(
    <div className="crm-modal-backdrop crm-modal-backdrop--premium" onClick={onClose} role="presentation">
      <div className="crm-modal crm-modal--lead" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="crm-modal__hero crm-modal__hero--team">
          <div className="crm-modal__hero-text">
            <p className="crm-modal__eyebrow">Step 1</p>
            <h3>Create receiver account</h3>
            <p className="crm-modal__subtitle">
              This is the person who will receive the gift voucher. Link them to a CRM client or add their
              details manually.
            </p>
          </div>
          <button type="button" className="crm-modal__close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </header>

        <div className="crm-receiver-create__modes" role="tablist" aria-label="Receiver source">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'client'}
            className={`crm-receiver-create__mode${mode === 'client' ? ' crm-receiver-create__mode--active' : ''}`}
            onClick={() => setMode('client')}
          >
            <UserRound size={16} aria-hidden />
            From CRM client
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'manual'}
            className={`crm-receiver-create__mode${mode === 'manual' ? ' crm-receiver-create__mode--active' : ''}`}
            onClick={() => setMode('manual')}
          >
            <UserPlus size={16} aria-hidden />
            Add manually
          </button>
        </div>

        <form id="create-receiver-form" className="crm-modal__body" onSubmit={handleSubmit}>
          {error ? <p className="crm-state crm-state-error">{error}</p> : null}

          {mode === 'client' ? (
            <>
              <label className="crm-voucher-client-search">
                <Search size={16} aria-hidden />
                <input
                  type="search"
                  placeholder="Find CRM client…"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                />
              </label>

              {selectedClient ? (
                <div className="crm-voucher-client-selected">
                  <UserRound size={18} aria-hidden />
                  <div>
                    <strong>{clientDisplayName(selectedClient)}</strong>
                    <span>{selectedClient.email || selectedClient.phone || '—'}</span>
                  </div>
                  <button type="button" className="crm-link-btn" onClick={() => setSelectedClientId('')}>
                    Change
                  </button>
                </div>
              ) : (
                <ul className="crm-voucher-client-list">
                  {filteredClients.length === 0 ? (
                    <li className="crm-voucher-client-list__empty">
                      {clients.length === 0
                        ? 'No CRM clients yet — use “Add manually” or create a client first.'
                        : 'No clients match your search.'}
                    </li>
                  ) : (
                    filteredClients.map((client) => (
                      <li key={client.id}>
                        <button
                          type="button"
                          className="crm-voucher-client-card"
                          onClick={() => setSelectedClientId(String(client.id))}
                        >
                          <span className="crm-voucher-client-card__avatar" aria-hidden="true">
                            {clientDisplayName(client).charAt(0).toUpperCase()}
                          </span>
                          <span className="crm-voucher-client-card__copy">
                            <strong>{clientDisplayName(client)}</strong>
                            <span>{client.email || client.phone || 'No contact'}</span>
                          </span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </>
          ) : (
            <div className="crm-form-grid crm-form-grid--receiver-create">
              <label className="crm-field crm-field--full">
                <span>Full name</span>
                <input
                  className="crm-input"
                  value={manualReceiver.full_name}
                  onChange={(e) => setManualReceiver((p) => ({ ...p, full_name: e.target.value }))}
                  placeholder="Gift recipient name"
                  required
                />
              </label>
              <label className="crm-field">
                <span>Email</span>
                <input
                  type="email"
                  className="crm-input"
                  value={manualReceiver.email}
                  onChange={(e) => setManualReceiver((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Optional"
                />
              </label>
              <label className="crm-field">
                <span>Phone</span>
                <input
                  type="tel"
                  className="crm-input"
                  value={manualReceiver.phone}
                   onChange={(e) => setManualReceiver((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="Optional"
                />
              </label>
            </div>
          )}
        </form>

        <footer className="crm-modal__footer">
          <button type="button" className="crm-btn crm-btn--modal-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            form="create-receiver-form"
            className="crm-btn crm-btn--modal-primary crm-btn--voucher-cta"
            disabled={saving || !canSubmit}
          >
            {saving ? 'Creating…' : 'Create receiver account'}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  )
}

export default CreateReceiverAccountModal
