import { useEffect, useMemo, useState } from 'react'
import { Building2, PauseCircle, Sparkles, Users } from 'lucide-react'
import AdminLayout from './components/AdminLayout'
import ComposeEmailActions from './components/ComposeEmailActions'
import GroupFormModal from './components/GroupFormModal'
import {
  createCorporateGroup,
  deleteCorporateGroup,
  fetchCorporateGroups,
  updateCorporateGroup
} from './api/groupsApi'
import { CORPORATE_STATUS_OPTIONS } from './constants'
import './Leads.css'

const FILTERS = [
  { id: 'all', label: 'All partners' },
  ...CORPORATE_STATUS_OPTIONS.map((status) => ({
    id: status,
    label: status
  }))
]

function statusBadgeClass(status) {
  const key = (status || 'Active').toLowerCase().replace(/\s+/g, '_')
  return `crm-corp-status crm-corp-status--${key}`
}

function CorporateGroups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [view, setView] = useState('cards')

  const loadGroups = async () => {
    setLoading(true)
    setError('')
    const { data, error: queryError } = await fetchCorporateGroups()
    if (queryError) {
      if (queryError.message?.includes('corporate_groups')) {
        setError(
          'Corporate groups table not found. Run supabase/migrations/20260524_corporate_groups.sql in Supabase SQL editor.'
        )
      } else {
        setError(queryError.message)
      }
      setGroups([])
    } else {
      setGroups(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadGroups()
  }, [])

  const counts = useMemo(() => {
    const map = { all: groups.length }
    CORPORATE_STATUS_OPTIONS.forEach((status) => {
      map[status] = groups.filter((g) => g.status === status).length
    })
    return map
  }, [groups])

  const activeShare = useMemo(() => {
    if (!counts.all) return 0
    return Math.round(((counts.Active || 0) / counts.all) * 100)
  }, [counts])

  const bannerStats = useMemo(
    () => [
      {
        id: 'all',
        label: 'Total partners',
        value: counts.all || 0,
        icon: Building2,
        tone: 'total'
      },
      {
        id: 'Active',
        label: 'Active',
        value: counts.Active || 0,
        icon: Users,
        tone: 'active'
      },
      {
        id: 'Prospect',
        label: 'Prospects',
        value: counts.Prospect || 0,
        icon: Sparkles,
        tone: 'prospect'
      },
      {
        id: 'On hold',
        label: 'On hold',
        value: counts['On hold'] || 0,
        icon: PauseCircle,
        tone: 'hold'
      }
    ],
    [counts]
  )

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return groups.filter((group) => {
      if (filter !== 'all' && group.status !== filter) return false
      if (!term) return true
      return [
        group.company_name,
        group.industry,
        group.contact_person,
        group.contact_email,
        group.contact_phone,
        group.city,
        group.country
      ].some((value) => (value || '').toLowerCase().includes(term))
    })
  }, [groups, search, filter])

  const openCreate = () => {
    setSaveError('')
    setSelected(null)
    setModalOpen(true)
  }

  const openEdit = (group) => {
    setSaveError('')
    setSelected(group)
    setModalOpen(true)
  }

  const handleSave = async (form) => {
    if (!form.company_name?.trim()) {
      setSaveError('Company name is required.')
      return
    }

    setSaving(true)
    setSaveError('')

    const { data, error: saveErr } = selected?.id
      ? await updateCorporateGroup(selected.id, form)
      : await createCorporateGroup(form)

    if (saveErr) {
      setSaveError(saveErr.message)
      setSaving(false)
      return
    }

    if (selected?.id) {
      setGroups((prev) => prev.map((item) => (item.id === selected.id ? data : item)))
    } else {
      setGroups((prev) => [...prev, data].sort((a, b) => a.company_name.localeCompare(b.company_name)))
    }

    setSaving(false)
    setModalOpen(false)
    setSelected(null)
  }

  const handleDelete = async (group) => {
    if (!window.confirm(`Remove corporate partner "${group.company_name}"?`)) return
    const { error: deleteError } = await deleteCorporateGroup(group.id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setGroups((prev) => prev.filter((item) => item.id !== group.id))
  }

  return (
    <AdminLayout
      title="Corporate groups"
      subtitle="Companies and organisations you cooperate with for group travel, incentives, and corporate bookings."
      actions={
        <>
          <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={loadGroups}>
            Refresh
          </button>
          <button type="button" className="crm-btn crm-btn-primary crm-btn--corporate-header" onClick={openCreate}>
            + Add corporate group
          </button>
        </>
      }
    >
      <section className="crm-workspace crm-workspace--corporate">
        <div className="crm-corp-banner">
          <div className="crm-corp-banner__mesh" aria-hidden="true" />
          <div className="crm-corp-banner__glow" aria-hidden="true" />

          <div className="crm-corp-banner__main">
            <div className="crm-corp-banner__intro">
              <div className="crm-corp-banner__icon" aria-hidden="true">
                <Building2 size={28} strokeWidth={1.75} />
              </div>
              <div className="crm-corp-banner__copy">
                <p className="crm-corp-banner__eyebrow">B2B partnerships</p>
                <h2 className="crm-corp-banner__title">Corporate &amp; group cooperations</h2>
                <p className="crm-corp-banner__text">
                  Keep every partner company, contact details, and group size expectations in one place.
                </p>
              </div>
            </div>

            <div className="crm-corp-banner__stats">
              {bannerStats.map(({ id, label, value, icon: Icon, tone }) => (
                <button
                  key={id}
                  type="button"
                  className={`crm-corp-stat crm-corp-stat--${tone}${filter === id || (id === 'all' && filter === 'all') ? ' crm-corp-stat--selected' : ''}`}
                  onClick={() => setFilter(id === 'all' ? 'all' : id)}
                >
                  <span className="crm-corp-stat__icon" aria-hidden="true">
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <span className="crm-corp-stat__label">{label}</span>
                  <strong className="crm-corp-stat__value">{value}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="crm-corp-banner__footer">
            <div className="crm-corp-banner__progress" role="presentation">
              <div
                className="crm-corp-banner__progress-fill"
                style={{ width: `${activeShare}%` }}
              />
            </div>
            <p className="crm-corp-banner__progress-label">
              <strong>{activeShare}%</strong> of partners are active
              {counts.all > 0 ? (
                <span className="crm-corp-banner__progress-meta">
                  · {counts.Inactive || 0} inactive · {filtered.length} shown in current view
                </span>
              ) : (
                <span className="crm-corp-banner__progress-meta"> · Add your first partner to get started</span>
              )}
            </p>
          </div>
        </div>

        <div className="crm-corp-toolbar">
          <div className="crm-filter-chips">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`crm-chip${filter === item.id ? ' crm-chip--active' : ''}${item.id === 'Active' ? ' crm-chip--confirmed' : ''}${item.id === 'Prospect' ? ' crm-chip--quoted' : ''}${item.id === 'Inactive' ? ' crm-chip--lost' : ''}`}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
                {item.id !== 'all' ? ` (${counts[item.id] || 0})` : ''}
              </button>
            ))}
          </div>
          <div className="crm-corp-toolbar__right">
            <label className="crm-filter-field crm-filter-field--search">
              <span>Search companies</span>
              <input
                type="search"
                placeholder="Company, contact, city…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <div className="crm-corp-view-toggle">
              <button
                type="button"
                className={view === 'cards' ? 'crm-corp-view-toggle__btn--active' : ''}
                onClick={() => setView('cards')}
              >
                Cards
              </button>
              <button
                type="button"
                className={view === 'table' ? 'crm-corp-view-toggle__btn--active' : ''}
                onClick={() => setView('table')}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {loading ? <div className="crm-state">Loading corporate groups…</div> : null}
        {!loading && error ? <div className="crm-state crm-state-error">{error}</div> : null}
        {!loading && !error && filtered.length === 0 ? (
          <div className="crm-state">
            No corporate groups yet. Click <strong>+ Add corporate group</strong> to add your first partner.
          </div>
        ) : null}

        {!loading && !error && filtered.length > 0 && view === 'cards' ? (
          <div className="crm-corp-grid">
            {filtered.map((group) => (
              <article key={group.id} className="crm-corp-card">
                <div className="crm-corp-card__head">
                  <div className="crm-corp-card__logo" aria-hidden="true">
                    {(group.company_name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="crm-corp-card__title-wrap">
                    <h3 className="crm-corp-card__name">{group.company_name}</h3>
                    <p className="crm-corp-card__industry">{group.industry || 'Industry not set'}</p>
                  </div>
                  <span className={statusBadgeClass(group.status)}>{group.status || 'Active'}</span>
                </div>
                <dl className="crm-corp-card__details">
                  <div>
                    <dt>Contact</dt>
                    <dd>{group.contact_person || '—'}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{group.contact_email || '—'}</dd>
                  </div>
                  <div>
                    <dt>Phone</dt>
                    <dd>{group.contact_phone || '—'}</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>
                      {[group.city, group.country].filter(Boolean).join(', ') || '—'}
                    </dd>
                  </div>
                  <div>
                    <dt>Group size</dt>
                    <dd>{group.typical_group_size || '—'}</dd>
                  </div>
                </dl>
                {group.notes ? <p className="crm-corp-card__notes">{group.notes}</p> : null}
                <div className="crm-corp-card__actions">
                  <ComposeEmailActions
                    to={group.contact_email}
                    recipientName={group.contact_person}
                    companyName={group.company_name}
                    variant="compact"
                  />
                  <button type="button" className="crm-link-btn" onClick={() => openEdit(group)}>
                    Edit
                  </button>
                  <button type="button" className="crm-btn crm-btn-danger" onClick={() => handleDelete(group)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {!loading && !error && filtered.length > 0 && view === 'table' ? (
          <div className="crm-table-wrap">
            <table className="crm-table crm-table--corporate">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Industry</th>
                  <th>Status</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Group size</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((group) => (
                  <tr key={group.id}>
                    <td>
                      <strong>{group.company_name}</strong>
                    </td>
                    <td>{group.industry || '—'}</td>
                    <td>
                      <span className={statusBadgeClass(group.status)}>{group.status || 'Active'}</span>
                    </td>
                    <td>{group.contact_person || '—'}</td>
                    <td>{group.contact_email || '—'}</td>
                    <td>{group.contact_phone || '—'}</td>
                    <td>{group.city || '—'}</td>
                    <td>{group.typical_group_size || '—'}</td>
                    <td>
                      <div className="crm-action-buttons">
                        <ComposeEmailActions
                          to={group.contact_email}
                          recipientName={group.contact_person}
                          companyName={group.company_name}
                          variant="compact"
                        />
                        <button type="button" className="crm-link-btn" onClick={() => openEdit(group)}>
                          Edit
                        </button>
                        <button type="button" className="crm-btn crm-btn-danger" onClick={() => handleDelete(group)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <GroupFormModal
        open={modalOpen}
        initialGroup={selected}
        onClose={() => {
          setModalOpen(false)
          setSelected(null)
        }}
        onSave={handleSave}
        saving={saving}
        saveError={saveError}
      />
    </AdminLayout>
  )
}

export default CorporateGroups
