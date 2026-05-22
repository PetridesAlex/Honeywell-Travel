import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Mail, Trash2, UserRound } from 'lucide-react'
import AdminLayout from './components/AdminLayout'
import ClientFormModal from './components/ClientFormModal'
import PassportStatusBadge from './components/PassportStatusBadge'
import ComposeEmailActions from './components/ComposeEmailActions'
import { createClient, deleteClient, fetchClients, updateClient } from './api/clientsApi'
import { exportClientsToCsv } from './utils/exportClients'
import { getPassportStatus, maskPassportNumber } from './utils/passport'
import { getComposeLinks } from './utils/composeEmail'
import { useAdminLeads } from './hooks/useAdminLeads'
import './Leads.css'

function clientInitials(client) {
  const first = (client.first_name || '').trim().charAt(0)
  const last = (client.last_name || '').trim().charAt(0)
  return (first + last).toUpperCase() || '?'
}

function clientFullName(client) {
  return [client.first_name, client.last_name].filter(Boolean).join(' ').trim() || 'Unnamed client'
}

function TableEmpty({ children = '—' }) {
  return <span className="crm-table-empty">{children}</span>
}

const FILTERS = [
  { id: 'all', label: 'All clients' },
  { id: 'expiring_soon', label: 'Expiring (90 days)' },
  { id: 'expired', label: 'Expired' },
  { id: 'missing', label: 'Missing passport' }
]

function Clients() {
  const [searchParams] = useSearchParams()
  const { leads, reload: reloadLeads } = useAdminLeads(false)
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const loadClients = async () => {
    setLoading(true)
    setError('')
    const { data, error: queryError } = await fetchClients()
    if (queryError) {
      setError(queryError.message)
      setClients([])
    } else {
      setClients(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadClients()
    reloadLeads()
  }, [])

  useEffect(() => {
    const urlFilter = searchParams.get('filter')
    if (urlFilter && FILTERS.some((item) => item.id === urlFilter)) {
      setFilter(urlFilter)
    }
  }, [searchParams])

  const leadCountByClient = useMemo(() => {
    const map = {}
    leads.forEach((lead) => {
      if (lead.client_id) map[lead.client_id] = (map[lead.client_id] || 0) + 1
    })
    return map
  }, [leads])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return clients.filter((client) => {
      const status = getPassportStatus(client.date_of_expiry)
      const missing = !client.date_of_expiry || !client.passport_number

      if (filter === 'expiring_soon' && status !== 'expiring_soon') return false
      if (filter === 'expired' && status !== 'expired') return false
      if (filter === 'missing' && !missing) return false

      if (!term) return true
      return [
        client.first_name,
        client.last_name,
        client.email,
        client.phone,
        client.nationality,
        client.passport_number
      ].some((value) => (value || '').toLowerCase().includes(term))
    })
  }, [clients, search, filter])

  const openCreate = () => {
    setSaveError('')
    setSelectedClient(null)
    setModalOpen(true)
  }

  const handleSave = async (form) => {
    setSaving(true)
    setSaveError('')

    const { data, error: saveErr } = selectedClient?.id
      ? await updateClient(selectedClient.id, form)
      : await createClient(form)

    if (saveErr) {
      setSaveError(saveErr.message)
      setSaving(false)
      return
    }

    if (selectedClient?.id) {
      setClients((prev) => prev.map((item) => (item.id === selectedClient.id ? data : item)))
    } else {
      setClients((prev) => [data, ...prev])
    }

    setSaving(false)
    setModalOpen(false)
    setSelectedClient(null)
  }

  const handleDelete = async (client) => {
    if (!window.confirm(`Delete profile for ${client.first_name} ${client.last_name}?`)) return
    const { error: deleteError } = await deleteClient(client.id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setClients((prev) => prev.filter((item) => item.id !== client.id))
  }

  return (
    <AdminLayout
      title="Clients"
      subtitle="Client profiles with passport, nationality, and linked enquiry history."
      actions={
        <>
          <button
            type="button"
            className="crm-btn crm-btn-ghost crm-btn--dark"
            onClick={() => exportClientsToCsv(filtered)}
            disabled={!filtered.length}
          >
            Export CSV
          </button>
          <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={loadClients}>
            Refresh
          </button>
          <button type="button" className="crm-btn crm-btn-primary" onClick={openCreate}>
            + Add client
          </button>
        </>
      }
    >
      <section className="crm-workspace">
        <div className="crm-filter-chips">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`crm-chip${filter === item.id ? ' crm-chip--active' : ''}${item.id === 'expired' ? ' crm-chip--danger' : ''}${item.id === 'expiring_soon' ? ' crm-chip--alert' : ''}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="crm-filter-field crm-filter-field--search">
          <span>Search clients</span>
          <input
            type="search"
            placeholder="Name, email, nationality, passport…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        {loading ? <div className="crm-state">Loading clients...</div> : null}
        {!loading && error ? <div className="crm-state crm-state-error">Error: {error}</div> : null}
        {!loading && !error && filtered.length === 0 ? (
          <div className="crm-state">No clients match your filters.</div>
        ) : null}

        {!loading && !error && filtered.length > 0 ? (
          <div className="crm-table-wrap crm-table-wrap--clients">
            <table className="crm-table crm-table--clients">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Contact</th>
                  <th>Nationality</th>
                  <th>Passport</th>
                  <th>Expiry</th>
                  <th>Passport status</th>
                  <th className="crm-table--clients__col-leads">Leads</th>
                  <th className="crm-table--clients__col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => {
                  const name = clientFullName(client)
                  const leadCount = leadCountByClient[client.id] || 0
                  const passportStatus = getPassportStatus(client.date_of_expiry)
                  const mailto = client.email
                    ? getComposeLinks({ to: client.email, recipientName: name }).mailto
                    : null

                  return (
                    <tr key={client.id} className={`crm-client-row crm-client-row--${passportStatus}`}>
                      <td className="crm-client-row__identity-cell">
                        <Link to={`/admin/clients/${client.id}`} className="crm-client-row__identity">
                          <span className="crm-client-row__avatar" aria-hidden="true">
                            {clientInitials(client)}
                          </span>
                          <span className="crm-client-row__name-block">
                            <span className="crm-client-row__name">{name}</span>
                            <span className="crm-client-row__id">Profile #{client.id}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="crm-client-row__contact-cell">
                        {client.email ? (
                          <a className="crm-client-row__email" href={mailto}>
                            <Mail size={14} aria-hidden />
                            {client.email}
                          </a>
                        ) : (
                          <TableEmpty>No email</TableEmpty>
                        )}
                        {client.phone ? (
                          <span className="crm-client-row__phone">{client.phone}</span>
                        ) : null}
                      </td>
                      <td>{client.nationality ? <span>{client.nationality}</span> : <TableEmpty />}</td>
                      <td className="crm-client-row__passport-cell">
                        {client.passport_number ? (
                          <code className="crm-client-row__passport">{maskPassportNumber(client.passport_number)}</code>
                        ) : (
                          <TableEmpty>Not on file</TableEmpty>
                        )}
                      </td>
                      <td className="crm-client-row__expiry-cell">
                        {client.date_of_expiry ? (
                          <time dateTime={client.date_of_expiry}>
                            {new Date(client.date_of_expiry).toLocaleDateString(undefined, {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </time>
                        ) : (
                          <TableEmpty />
                        )}
                      </td>
                      <td>
                        <PassportStatusBadge expiresOn={client.date_of_expiry} compact />
                      </td>
                      <td className="crm-client-row__leads-cell">
                        <span
                          className={`crm-client-row__leads-pill${leadCount > 0 ? ' crm-client-row__leads-pill--active' : ''}`}
                        >
                          {leadCount}
                        </span>
                      </td>
                      <td className="crm-client-row__actions-cell">
                        <div className="crm-client-row__actions">
                          <ComposeEmailActions to={client.email} recipientName={name} variant="compact" />
                          <Link
                            to={`/admin/clients/${client.id}`}
                            className="crm-client-row__action crm-client-row__action--view"
                            title="View profile"
                          >
                            <UserRound size={15} aria-hidden />
                            <span>View</span>
                          </Link>
                          <button
                            type="button"
                            className="crm-client-row__action crm-client-row__action--delete"
                            onClick={() => handleDelete(client)}
                            title="Delete client"
                          >
                            <Trash2 size={15} aria-hidden />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <ClientFormModal
        open={modalOpen}
        initialClient={selectedClient}
        onClose={() => {
          setModalOpen(false)
          setSelectedClient(null)
        }}
        onSave={handleSave}
        saving={saving}
        saveError={saveError}
      />
    </AdminLayout>
  )
}

export default Clients
