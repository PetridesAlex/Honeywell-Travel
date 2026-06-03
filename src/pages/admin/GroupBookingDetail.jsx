import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Download, FileDown } from 'lucide-react'
import AdminLayout from './components/AdminLayout'
import TravelGroupFormModal from './components/TravelGroupFormModal'
import PassengerImportPanel from './components/passenger-import/PassengerImportPanel'
import PassengerRosterPanel from './components/passenger-import/PassengerRosterPanel'
import PassportExpiryAlert from './components/passenger-import/PassportExpiryAlert'
import ConfirmDialog from './components/ConfirmDialog'
import ToastHost from './components/ToastHost'
import { fetchTravelGroupById, updateTravelGroup, deleteTravelGroup } from './api/travelGroupsApi'
import { deletePassenger, fetchPassengersByGroup } from './api/passengersApi'
import {
  exportApisList,
  exportCruisePassengerList,
  exportEmergencyContacts,
  exportPassengerManifest,
  exportRoomingList
} from './utils/exportPassengers'
import { TRAVEL_GROUP_TYPES } from './constants'
import { getPassportExpiryWarning } from './utils/passport'
import './Leads.css'
import './passenger-import.css'

function groupTypeLabel(type) {
  return TRAVEL_GROUP_TYPES.find((t) => t.id === type)?.label || type
}

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}

function GroupBookingDetail() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [group, setGroup] = useState(null)
  const [passengers, setPassengers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [importExpanded, setImportExpanded] = useState(false)
  const [exportsOpen, setExportsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deleteGroupOpen, setDeleteGroupOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toasts, setToasts] = useState([])

  const pushToast = useCallback((message, type = 'info') => {
    const toastId = crypto.randomUUID()
    setToasts((prev) => [...prev, { id: toastId, message, type }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId))
    }, 5000)
  }, [])

  const dismissToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId))
  }, [])

  const loadPassengers = async (groupId = id) => {
    const { data: paxData, error: paxError } = await fetchPassengersByGroup(groupId)
    if (paxError) {
      setError(paxError.message)
      return []
    }
    setPassengers(paxData || [])
    return paxData || []
  }

  const load = async () => {
    setLoading(true)
    setError('')
    const { data: groupData, error: groupError } = await fetchTravelGroupById(id)
    if (groupError || !groupData) {
      setError(groupError?.message || 'Group not found.')
      setLoading(false)
      return
    }
    setGroup(groupData)
    const pax = await loadPassengers(id)
    if (!pax.length) setImportExpanded(true)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [id])

  useEffect(() => {
    if (searchParams.get('import') === '1') {
      setImportExpanded(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const passportWarnings = useMemo(() => {
    return passengers.filter((p) => getPassportExpiryWarning(p.passport_expiry))
  }, [passengers])

  const handleSave = async (form) => {
    setSaving(true)
    setSaveError('')
    const { data, error: saveErr } = await updateTravelGroup(id, form)
    setSaving(false)
    if (saveErr) {
      setSaveError(saveErr.message)
      pushToast(saveErr.message, 'error')
      return
    }
    setGroup(data)
    setEditOpen(false)
    pushToast('Group saved — you can import more files anytime', 'success')
  }

  const handleDeleteGroup = async () => {
    setDeleting(true)
    const { error: delErr } = await deleteTravelGroup(id)
    setDeleting(false)
    if (delErr) {
      setError(delErr.message)
      pushToast(delErr.message, 'error')
      return
    }
    pushToast('Group deleted', 'success')
    window.location.href = '/admin/group-bookings'
  }

  const handleRemovePassenger = async (passengerId) => {
    const { error: delErr } = await deletePassenger(passengerId)
    if (delErr) {
      pushToast(delErr.message, 'error')
      return
    }
    setPassengers((prev) => prev.filter((p) => p.id !== passengerId))
    pushToast('Passenger removed', 'success')
  }

  const handleImportSuccess = (imported) => {
    const count = imported?.length || 0
    if (count > 0) {
      setPassengers((prev) => [...prev, ...imported])
    } else {
      loadPassengers()
    }
    setImportExpanded(false)
    pushToast(`Saved ${count} passenger${count === 1 ? '' : 's'} to “${group?.group_name}”`, 'success')
  }

  if (loading) {
    return (
      <AdminLayout title="Group booking" subtitle="Loading…">
        <div className="crm-state">Loading group…</div>
      </AdminLayout>
    )
  }

  if (error && !group) {
    return (
      <AdminLayout title="Group booking" subtitle="">
        <div className="crm-state crm-state-error">{error}</div>
        <Link to="/admin/group-bookings" className="crm-btn crm-btn-ghost crm-btn--dark">
          Back to groups
        </Link>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title={group.group_name}
      subtitle="Each group keeps its own passenger list — import Excel or CSV per trip."
      actions={
        <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={() => setEditOpen(true)}>
          Edit group name
        </button>
      }
    >
      <ToastHost toasts={toasts} onDismiss={dismissToast} />

      <Link to="/admin/group-bookings" className="crm-back-link">
        <ArrowLeft size={18} strokeWidth={2.25} aria-hidden />
        All saved groups
      </Link>

      <section className="crm-group-summary">
        <div className="crm-group-summary__main">
          <p className="crm-group-summary__eyebrow">Saved group</p>
          <h2 className="crm-group-summary__title">{group.group_name}</h2>
          <div className="crm-group-summary__chips">
            <span>{groupTypeLabel(group.group_type)}</span>
            <span>{group.destination || 'No destination'}</span>
            <span>Departs {formatDate(group.departure_date)}</span>
            <span className="crm-group-summary__status">{group.status}</span>
          </div>
        </div>
        <div className="crm-group-summary__stats">
          <div>
            <strong>{passengers.length}</strong>
            <span>Travellers</span>
          </div>
          <div>
            <strong>{passportWarnings.length}</strong>
            <span>Passport alerts</span>
          </div>
        </div>
      </section>

      {passportWarnings.length > 0 ? (
        <div className="crm-passenger-alerts-banner" role="status">
          {passportWarnings.slice(0, 5).map((p) => (
            <PassportExpiryAlert key={p.id} expiresOn={p.passport_expiry} compact />
          ))}
        </div>
      ) : null}

      <PassengerImportPanel
        group={group}
        expanded={importExpanded}
        onToggle={() => setImportExpanded((open) => !open)}
        onSuccess={handleImportSuccess}
        onError={(message) => pushToast(message, 'error')}
      />

      <PassengerRosterPanel
        passengers={passengers}
        onRemove={handleRemovePassenger}
        onImportClick={() => setImportExpanded(true)}
        defaultOpen={false}
      />

      {passengers.length > 0 ? (
        <section className={`crm-roster-panel crm-roster-panel--exports${exportsOpen ? ' crm-roster-panel--open' : ''}`}>
          <button type="button" className="crm-roster-panel__cover" onClick={() => setExportsOpen((v) => !v)} aria-expanded={exportsOpen}>
            <span className="crm-roster-panel__cover-text">
              <strong>Export lists</strong>
              <span>Manifest, APIS, rooming, and more</span>
            </span>
            <span className="crm-roster-panel__chevron">▾</span>
          </button>
          {exportsOpen ? (
            <div className="crm-roster-panel__body">
              <div className="crm-export-actions">
                {[
                  { label: 'Passenger manifest', fn: exportPassengerManifest },
                  { label: 'Rooming list', fn: exportRoomingList },
                  { label: 'Cruise passenger list', fn: exportCruisePassengerList },
                  { label: 'Airline APIS', fn: exportApisList },
                  { label: 'Emergency contacts', fn: exportEmergencyContacts }
                ].map(({ label, fn }) => (
                  <div key={label} className="crm-export-actions__item">
                    <span>{label}</span>
                    <div className="crm-export-actions__btns">
                      <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark crm-btn--small" onClick={() => { fn(passengers, group, 'csv'); pushToast(`${label} exported`, 'success') }}>
                        <Download size={14} aria-hidden /> CSV
                      </button>
                      <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark crm-btn--small" onClick={() => { fn(passengers, group, 'xlsx'); pushToast(`${label} exported`, 'success') }}>
                        <FileDown size={14} aria-hidden /> Excel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="crm-passenger-detail-footer">
        <button type="button" className="crm-btn crm-btn-danger" onClick={() => setDeleteGroupOpen(true)}>
          Delete this group
        </button>
      </div>

      <TravelGroupFormModal
        open={editOpen}
        initialGroup={group}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        saving={saving}
        saveError={saveError}
      />

      <ConfirmDialog
        open={deleteGroupOpen}
        title="Delete this group?"
        description="All passengers in this group will be permanently removed."
        onCancel={() => setDeleteGroupOpen(false)}
        onConfirm={handleDeleteGroup}
        confirming={deleting}
        confirmLabel="Delete group"
      />
    </AdminLayout>
  )
}

export default GroupBookingDetail
