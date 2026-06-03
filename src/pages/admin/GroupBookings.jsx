import { useEffect, useMemo, useState } from 'react'
import { Plus, RefreshCw, Search, Ship } from 'lucide-react'
import AdminLayout from './components/AdminLayout'
import GroupBookingFolderCard from './components/GroupBookingFolderCard'
import TravelGroupFormModal from './components/TravelGroupFormModal'
import { createTravelGroup, fetchTravelGroupsWithCounts } from './api/travelGroupsApi'
import { TRAVEL_GROUP_TYPES } from './constants'
import './Leads.css'
import './passenger-import.css'

function groupTypeLabel(type) {
  return TRAVEL_GROUP_TYPES.find((t) => t.id === type)?.label || type
}

function GroupBookings() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    const { data, error: queryError } = await fetchTravelGroupsWithCounts({ group_type: typeFilter })
    if (queryError) {
      setError(queryError.message)
      setGroups([])
    } else {
      setGroups(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [typeFilter])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return groups
    return groups.filter(
      (g) =>
        (g.group_name || '').toLowerCase().includes(q) ||
        (g.destination || '').toLowerCase().includes(q) ||
        (g.supplier || '').toLowerCase().includes(q)
    )
  }, [groups, search])

  const totalPassengers = useMemo(
    () => filtered.reduce((sum, g) => sum + (g.passenger_count || 0), 0),
    [filtered]
  )

  const handleCreate = async (form) => {
    setSaving(true)
    setSaveError('')
    const { data, error: saveErr } = await createTravelGroup(form)
    setSaving(false)
    if (saveErr) {
      setSaveError(saveErr.message)
      return
    }
    setModalOpen(false)
    if (data?.id) {
      window.location.href = `/admin/group-bookings/${data.id}`
      return
    }
    load()
  }

  return (
    <AdminLayout
      title="Group bookings"
      subtitle="Each group is saved separately — open a folder to view travellers or import a new Excel file."
      actions={
        <>
          <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={load}>
            <RefreshCw size={16} aria-hidden />
            Refresh
          </button>
          <button type="button" className="crm-btn crm-btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} aria-hidden />
            New group
          </button>
        </>
      }
    >
      <section className="crm-passenger-hub-hero">
        <div className="crm-passenger-hub-hero__intro">
          <span className="crm-passenger-hub-hero__icon" aria-hidden="true">
            <Ship size={28} />
          </span>
          <div>
            <p className="crm-passenger-hub-hero__eyebrow">How it is organised</p>
            <h2>One folder per trip or group</h2>
            <p>
              Create a group with a name (e.g. MSC Grandiosa July 2026), import your Excel, and all passengers stay
              linked to that group only.
            </p>
          </div>
        </div>
        <div className="crm-passenger-hub-hero__types">
          {TRAVEL_GROUP_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              className={`crm-passenger-type-pill${typeFilter === type.id ? ' crm-passenger-type-pill--active' : ''}`}
              onClick={() => setTypeFilter(typeFilter === type.id ? 'all' : type.id)}
            >
              {type.label}
            </button>
          ))}
        </div>
      </section>

      <div className="crm-workspace crm-workspace--groups">
        <div className="crm-workspace__head crm-workspace__head--groups">
          <div className="crm-workspace__head-copy">
            <h2 className="crm-workspace__title">Your saved groups</h2>
            <p className="crm-workspace__subtitle">
              <span>{filtered.length} group{filtered.length === 1 ? '' : 's'}</span>
              <span className="crm-workspace__subtitle-dot" aria-hidden="true">·</span>
              <span>{totalPassengers} total passengers</span>
            </p>
          </div>
          <label className="crm-search-field">
            <Search size={18} className="crm-search-field__icon" aria-hidden />
            <span className="crm-sr-only">Search groups</span>
            <input
              className="crm-search-input"
              type="search"
              placeholder="Search by group name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>

        {loading ? <div className="crm-state">Loading groups…</div> : null}
        {error ? <div className="crm-state crm-state-error">{error}</div> : null}

        {!loading && !error && filtered.length === 0 ? (
          <div className="crm-state">
            <p>Create a named group first, then import each Excel or CSV into that group.</p>
            <button type="button" className="crm-btn crm-btn-primary" onClick={() => setModalOpen(true)}>
              <Plus size={16} aria-hidden />
              Create first group
            </button>
          </div>
        ) : null}

        {!loading && filtered.length > 0 ? (
          <div className="crm-group-folder-grid">
            {filtered.map((group) => (
              <GroupBookingFolderCard
                key={group.id}
                group={group}
                typeLabel={groupTypeLabel(group.group_type)}
                passengerCount={group.passenger_count}
              />
            ))}
          </div>
        ) : null}
      </div>

      <TravelGroupFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreate}
        saving={saving}
        saveError={saveError}
      />
    </AdminLayout>
  )
}

export default GroupBookings
