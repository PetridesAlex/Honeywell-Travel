import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Building2, Download, Mail, RefreshCw, Trash2, UserRound, Users } from 'lucide-react'
import AdminLayout from './components/AdminLayout'
import ClientFormModal from './components/ClientFormModal'
import PassportStatusBadge from './components/PassportStatusBadge'
import ComposeEmailActions from './components/ComposeEmailActions'
import { createClient, deleteClient, fetchClients, updateClient, friendlyClientSaveError } from './api/clientsApi'
import { fetchCorporateGroups } from './api/groupsApi'
import { exportClientsToCsv } from './utils/exportClients'
import {
  CLIENT_TYPE_OPTIONS,
  clientMatchesCategory,
  clientTypeClass,
  countClientsByType,
  getClientTypeLabel,
  normalizeClientType
} from './utils/clients'
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

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All clients', icon: Users },
  { id: 'individual', label: 'Individual', icon: UserRound },
  { id: 'group', label: 'Group', icon: Building2 }
]

const PASSPORT_FILTERS = [
  { id: 'all', label: 'All passports' },
  { id: 'expiring_soon', label: 'Expiring (90 days)' },
  { id: 'expired', label: 'Expired' },
  { id: 'missing', label: 'Missing passport' }
]

function Clients() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { leads, reload: reloadLeads } = useAdminLeads(false)
  const [clients, setClients] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [passportFilter, setPassportFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [defaultClientType, setDefaultClientType] = useState('individual')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [updatingCategoryId, setUpdatingCategoryId] = useState(null)

  const loadClients = async () => {
    setLoading(true)
    setError('')
    const [{ data, error: queryError }, groupsRes] = await Promise.all([
      fetchClients(),
      fetchCorporateGroups()
    ])
    if (queryError) {
      setError(queryError.message)
      setClients([])
    } else {
      setClients(data || [])
    }
    setGroups(groupsRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadClients()
    reloadLeads()
  }, [])

  useEffect(() => {
    const urlCategory = searchParams.get('category')
    const urlFilter = searchParams.get('filter')
    if (urlCategory && CATEGORY_FILTERS.some((item) => item.id === urlCategory)) {
      setCategory(urlCategory)
    }
    if (urlFilter && PASSPORT_FILTERS.some((item) => item.id === urlFilter)) {
      setPassportFilter(urlFilter)
    }
  }, [searchParams])

  const groupNameById = useMemo(() => {
    const map = {}
    groups.forEach((group) => {
      map[group.id] = group.company_name
    })
    return map
  }, [groups])

  const categoryCounts = useMemo(() => countClientsByType(clients), [clients])

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
      if (!clientMatchesCategory(client, category)) return false

      const status = getPassportStatus(client.date_of_expiry)
      const missing = !client.date_of_expiry || !client.passport_number

      if (passportFilter === 'expiring_soon' && status !== 'expiring_soon') return false
      if (passportFilter === 'expired' && status !== 'expired') return false
      if (passportFilter === 'missing' && !missing) return false

      if (!term) return true
      const groupName = groupNameById[client.corporate_group_id] || ''
      return [
        client.first_name,
        client.last_name,
        client.email,
        client.phone,
        client.nationality,
        client.passport_number,
        groupName,
        getClientTypeLabel(client.client_type)
      ].some((value) => (value || '').toLowerCase().includes(term))
    })
  }, [clients, search, category, passportFilter, groupNameById])

  const syncUrl = (nextCategory, nextPassportFilter) => {
    const params = new URLSearchParams()
    if (nextCategory && nextCategory !== 'all') params.set('category', nextCategory)
    if (nextPassportFilter && nextPassportFilter !== 'all') params.set('filter', nextPassportFilter)
    setSearchParams(params, { replace: true })
  }

  const openCreate = (type = 'individual') => {
    setSaveError('')
    setSelectedClient(null)
    setDefaultClientType(normalizeClientType(type))
    setModalOpen(true)
  }

  const handleSave = async (form) => {
    setSaving(true)
    setSaveError('')

    const { data, error: saveErr } = selectedClient?.id
      ? await updateClient(selectedClient.id, form)
      : await createClient(form)

    if (saveErr) {
      setSaveError(friendlyClientSaveError(saveErr.message))
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

  const handleCategoryChange = async (client, nextType) => {
    const normalized = normalizeClientType(nextType)
    if (normalizeClientType(client.client_type) === normalized) return

    setUpdatingCategoryId(client.id)
    const payload = {
      ...client,
      client_type: normalized,
      corporate_group_id: normalized === 'group' ? client.corporate_group_id || '' : ''
    }
    const { data, error: updateError } = await updateClient(client.id, payload)
    setUpdatingCategoryId(null)

    if (updateError) {
      setError(updateError.message)
      return
    }
    if (data) setClients((prev) => prev.map((item) => (item.id === client.id ? data : item)))
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
      subtitle="Traveler profiles with passport details, categories, and linked enquiries."
      actions={
        <div className="crm-header-actions crm-header-actions--split">
          <button
            type="button"
            className="crm-btn crm-btn-ghost crm-header-btn"
            onClick={() => openCreate('individual')}
          >
            <UserRound size={16} aria-hidden />
            Individual
          </button>
          <button
            type="button"
            className="crm-btn crm-btn-ghost crm-header-btn"
            onClick={() => openCreate('group')}
          >
            <Building2 size={16} aria-hidden />
            Group
          </button>
        </div>
      }
    >
      <section className="crm-workspace crm-workspace--clients">
        <div className="crm-clients-toolbar">
          <p className="crm-clients-toolbar__hint">
            <strong>Categories</strong> filter the list below. Use the table to view profiles or change a client&apos;s type.
          </p>
          <div className="crm-clients-toolbar__actions">
            <button
              type="button"
              className="crm-btn crm-btn-ghost crm-clients-toolbar__btn"
              onClick={() => exportClientsToCsv(filtered, groupNameById)}
              disabled={!filtered.length}
              title="Download the filtered client list as a spreadsheet file"
            >
              <Download size={15} aria-hidden />
              Download list
            </button>
            <button
              type="button"
              className="crm-btn crm-btn-ghost crm-clients-toolbar__btn"
              onClick={loadClients}
              title="Reload clients from the database"
            >
              <RefreshCw size={15} aria-hidden />
              Refresh
            </button>
          </div>
        </div>
        <div className="crm-client-category-tabs" role="tablist" aria-label="Client categories">
          {CATEGORY_FILTERS.map((item) => {
            const Icon = item.icon
            const active = category === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`crm-client-category-tab crm-client-category-tab--${item.id}${active ? ' crm-client-category-tab--active' : ''}`}
                onClick={() => {
                  setCategory(item.id)
                  syncUrl(item.id, passportFilter)
                }}
              >
                <span className="crm-client-category-tab__icon" aria-hidden="true">
                  <Icon size={17} />
                </span>
                <span className="crm-client-category-tab__label">{item.label}</span>
                <span className="crm-client-category-tab__count">{categoryCounts[item.id] ?? 0}</span>
              </button>
            )
          })}
        </div>

        <div className="crm-filter-chips crm-filter-chips--clients" role="toolbar" aria-label="Passport filters">
          {PASSPORT_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`crm-chip${passportFilter === item.id ? ' crm-chip--active' : ''}${item.id === 'expired' ? ' crm-chip--danger' : ''}${item.id === 'expiring_soon' ? ' crm-chip--alert' : ''}`}
              onClick={() => {
                setPassportFilter(item.id)
                syncUrl(category, item.id)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="crm-filter-field crm-filter-field--search">
          <span>Search clients</span>
          <input
            type="search"
            placeholder="Name, email, nationality, passport, company…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        {loading ? <div className="crm-state">Loading clients...</div> : null}
        {!loading && error ? <div className="crm-state crm-state-error">Error: {error}</div> : null}
        {!loading && !error && filtered.length === 0 ? (
          <div className="crm-state">
            No clients match your filters.
            {category !== 'all' ? (
              <>
                {' '}
                <button type="button" className="crm-link-btn" onClick={() => openCreate(category === 'group' ? 'group' : 'individual')}>
                  Add a {category === 'group' ? 'group' : 'individual'} client
                </button>
              </>
            ) : null}
          </div>
        ) : null}

        {!loading && !error && filtered.length > 0 ? (
          <div className="crm-table-wrap crm-table-wrap--clients">
            <table className="crm-table crm-table--clients">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Category</th>
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
                  const groupName = groupNameById[client.corporate_group_id]
                  const typeKey = normalizeClientType(client.client_type)

                  return (
                    <tr key={client.id} className={`crm-client-row crm-client-row--${passportStatus} crm-client-row--${typeKey}`}>
                      <td className="crm-client-row__identity-cell">
                        <Link to={`/admin/clients/${client.id}`} className="crm-client-row__identity">
                          <span className="crm-client-row__avatar" aria-hidden="true">
                            {clientInitials(client)}
                          </span>
                          <span className="crm-client-row__name-block">
                            <span className="crm-client-row__name">{name}</span>
                            <span className="crm-client-row__id">Profile #{client.id}</span>
                            {groupName ? (
                              <span className="crm-client-row__group-name">{groupName}</span>
                            ) : null}
                          </span>
                        </Link>
                      </td>
                      <td className="crm-client-row__category-cell">
                        <select
                          className={`crm-client-category-select ${clientTypeClass(client.client_type)}`}
                          value={typeKey}
                          disabled={updatingCategoryId === client.id}
                          onChange={(e) => handleCategoryChange(client, e.target.value)}
                          aria-label={`Category for ${name}`}
                        >
                          {CLIENT_TYPE_OPTIONS.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
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
        defaultClientType={defaultClientType}
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
