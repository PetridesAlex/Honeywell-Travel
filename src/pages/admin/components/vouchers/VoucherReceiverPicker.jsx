import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, UserRound } from 'lucide-react'
import { clientDisplayName } from '../../utils/vouchers'

function VoucherReceiverPicker({
  clients = [],
  receivers = [],
  mode,
  onModeChange,
  clientSearch,
  onClientSearchChange,
  selectedClientId,
  onSelectClient,
  selectedReceiverId,
  onSelectReceiver,
  newReceiver,
  onNewReceiverChange
}) {
  const filteredClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase()
    const list = [...clients].sort((a, b) => clientDisplayName(a).localeCompare(clientDisplayName(b)))
    if (!q) return list.slice(0, 24)
    return list
      .filter((c) => {
        const hay = [
          clientDisplayName(c),
          c.email,
          c.phone,
          c.nationality
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return hay.includes(q)
      })
      .slice(0, 24)
  }, [clients, clientSearch])

  const selectedClient = clients.find((c) => String(c.id) === String(selectedClientId))

  return (
    <section className="crm-voucher-receiver-picker">
      <h3>Who receives this voucher?</h3>
      <p className="crm-voucher-receiver-picker__hint">
        Pick a CRM client — we create or link their voucher receiver account automatically.
      </p>

      <div className="crm-voucher-receiver-toggle">
        <button
          type="button"
          className={`crm-chip${mode === 'client' ? ' crm-chip--active' : ''}`}
          onClick={() => onModeChange('client')}
        >
          CRM client
        </button>
        <button
          type="button"
          className={`crm-chip${mode === 'existing' ? ' crm-chip--active' : ''}`}
          onClick={() => onModeChange('existing')}
        >
          Voucher receiver
        </button>
        <button
          type="button"
          className={`crm-chip${mode === 'new' ? ' crm-chip--active' : ''}`}
          onClick={() => onModeChange('new')}
        >
          New person
        </button>
      </div>

      {mode === 'client' ? (
        <>
          <label className="crm-voucher-client-search">
            <Search size={16} aria-hidden />
            <input
              type="search"
              placeholder="Search clients by name, email, or phone…"
              value={clientSearch}
              onChange={(e) => onClientSearchChange(e.target.value)}
            />
          </label>

          {selectedClient ? (
            <div className="crm-voucher-client-selected">
              <UserRound size={18} aria-hidden />
              <div>
                <strong>{clientDisplayName(selectedClient)}</strong>
                <span>
                  {selectedClient.email || '—'}
                  {selectedClient.phone ? ` · ${selectedClient.phone}` : ''}
                </span>
              </div>
              <button type="button" className="crm-link-btn" onClick={() => onSelectClient('')}>
                Change
              </button>
              <Link to={`/admin/clients/${selectedClient.id}`} className="crm-link-btn">
                Open profile
              </Link>
            </div>
          ) : (
            <ul className="crm-voucher-client-list">
              {filteredClients.length === 0 ? (
                <li className="crm-voucher-client-list__empty">No clients match. Try another search or add a new person.</li>
              ) : (
                filteredClients.map((client) => (
                  <li key={client.id}>
                    <button type="button" className="crm-voucher-client-card" onClick={() => onSelectClient(String(client.id))}>
                      <span className="crm-voucher-client-card__avatar" aria-hidden="true">
                        {clientDisplayName(client).charAt(0).toUpperCase()}
                      </span>
                      <span className="crm-voucher-client-card__copy">
                        <strong>{clientDisplayName(client)}</strong>
                        <span>{client.email || client.phone || 'No contact on file'}</span>
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </>
      ) : null}

      {mode === 'existing' ? (
        <label className="crm-field">
          <span>Select voucher receiver</span>
          <select className="crm-select" value={selectedReceiverId} onChange={(e) => onSelectReceiver(e.target.value)}>
            <option value="">Choose receiver…</option>
            {receivers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.full_name} {r.email ? `(${r.email})` : ''}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {mode === 'new' ? (
        <div className="crm-form-grid">
          <label className="crm-field">
            <span>Full name</span>
            <input
              className="crm-input"
              value={newReceiver.full_name}
              onChange={(e) => onNewReceiverChange({ ...newReceiver, full_name: e.target.value })}
            />
          </label>
          <label className="crm-field">
            <span>Phone</span>
            <input
              className="crm-input"
              value={newReceiver.phone}
              onChange={(e) => onNewReceiverChange({ ...newReceiver, phone: e.target.value })}
            />
          </label>
          <label className="crm-field">
            <span>Email</span>
            <input
              type="email"
              className="crm-input"
              value={newReceiver.email}
              onChange={(e) => onNewReceiverChange({ ...newReceiver, email: e.target.value })}
            />
          </label>
          <label className="crm-field">
            <span>Nationality</span>
            <input
              className="crm-input"
              value={newReceiver.nationality}
              onChange={(e) => onNewReceiverChange({ ...newReceiver, nationality: e.target.value })}
            />
          </label>
        </div>
      ) : null}
    </section>
  )
}

export default VoucherReceiverPicker
