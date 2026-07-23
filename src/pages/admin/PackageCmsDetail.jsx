import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import AdminLayout from './components/AdminLayout'
import ConfirmDialog from './components/ConfirmDialog'
import ToastHost from './components/ToastHost'
import {
  deleteCmsPackage,
  fetchCmsPackageById,
  saveCmsPackage,
  PACKAGES_CMS_SETUP_HINT
} from './api/packagesCmsApi'
import { clearPackagesCatalogCache } from '../../lib/packagesCatalog'
import { cloneJson } from '../../lib/packagesCms'
import './Leads.css'

function emptyHotelRow() {
  return {
    name: '',
    stars: 3,
    roomType: 'Standard Room',
    image: '',
    location: '',
    boardBasis: 'Bed & Breakfast',
    prices: { double: 0 },
    packagePrice: 0,
    departureDate: '',
    nights: 3
  }
}

function PackageCmsDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [row, setRow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [schemaMissing, setSchemaMissing] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toasts, setToasts] = useState([])
  const [datesText, setDatesText] = useState('')

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

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: queryError } = await fetchCmsPackageById(id)
    if (queryError || !data) {
      setError(queryError?.message || 'Package not found.')
      setSchemaMissing(Boolean(queryError?.schemaMissing))
      setRow(null)
      setLoading(false)
      return
    }

    const details = cloneJson(data.details || {})
    if (!Array.isArray(details.hotels)) details.hotels = []
    if (!Array.isArray(details.departureDates)) details.departureDates = []
    setRow({ ...data, details })
    setDatesText((details.departureDates || []).join(', '))
    setLoading(false)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const hotels = useMemo(() => row?.details?.hotels || [], [row])

  const updateField = (key, value) => {
    setRow((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const updateDetails = (patch) => {
    setRow((prev) =>
      prev
        ? {
            ...prev,
            details: {
              ...prev.details,
              ...patch
            }
          }
        : prev
    )
  }

  const updateHotel = (index, patch) => {
    setRow((prev) => {
      if (!prev) return prev
      const nextHotels = [...(prev.details?.hotels || [])]
      const current = nextHotels[index] || emptyHotelRow()
      const next = { ...current, ...patch }
      if (patch.prices) {
        next.prices = { ...(current.prices || {}), ...patch.prices }
      }
      if (patch.doublePrice != null) {
        const double = Number(patch.doublePrice) || 0
        next.prices = { ...(current.prices || {}), double }
        next.packagePrice = double * 2
        delete next.doublePrice
      }
      nextHotels[index] = next
      return {
        ...prev,
        details: { ...prev.details, hotels: nextHotels }
      }
    })
  }

  const addHotelRow = () => {
    setRow((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        details: {
          ...prev.details,
          hotels: [...(prev.details?.hotels || []), emptyHotelRow()]
        }
      }
    })
  }

  const removeHotelRow = (index) => {
    setRow((prev) => {
      if (!prev) return prev
      const nextHotels = [...(prev.details?.hotels || [])]
      nextHotels.splice(index, 1)
      return {
        ...prev,
        details: { ...prev.details, hotels: nextHotels }
      }
    })
  }

  const handleSave = async () => {
    if (!row) return
    setSaving(true)
    setError('')

    const departureDates = datesText
      .split(/[,;\n]+/)
      .map((part) => part.trim())
      .filter(Boolean)

    const payload = {
      ...row,
      details: {
        ...row.details,
        departureDates,
        departureDate: departureDates[0] || row.details?.departureDate || ''
      }
    }

    const { data, error: saveError } = await saveCmsPackage(payload)
    setSaving(false)

    if (saveError) {
      setSchemaMissing(Boolean(saveError.schemaMissing))
      setError(saveError.message)
      pushToast(saveError.message, 'error')
      return
    }

    clearPackagesCatalogCache()
    setRow({
      ...data,
      details: {
        ...(data.details || {}),
        hotels: Array.isArray(data.details?.hotels) ? data.details.hotels : []
      }
    })
    setDatesText((data.details?.departureDates || []).join(', '))
    pushToast('Package saved. Website will show the update shortly.', 'success')
  }

  const handleDelete = async () => {
    setDeleting(true)
    const { error: deleteError } = await deleteCmsPackage(id)
    setDeleting(false)
    setDeleteOpen(false)
    if (deleteError) {
      pushToast(deleteError.message, 'error')
      return
    }
    clearPackagesCatalogCache()
    pushToast('Package removed from CMS.', 'success')
    navigate('/admin/packages')
  }

  if (loading) {
    return (
      <AdminLayout title="Edit package" subtitle="Loading…">
        <div className="crm-state">Loading package…</div>
      </AdminLayout>
    )
  }

  if (!row) {
    return (
      <AdminLayout title="Edit package" subtitle="Not found">
        <div className="crm-state crm-state-error" role="alert">
          {schemaMissing ? PACKAGES_CMS_SETUP_HINT : error || 'Package not found.'}
        </div>
        <Link to="/admin/packages" className="crm-btn crm-btn-ghost">
          <ArrowLeft size={16} /> Back to packages
        </Link>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title={row.title || 'Edit package'}
      subtitle={`Website ID #${row.legacy_id} · ${row.destination || 'No destination'}`}
      actions={
        <>
          <Link to="/admin/packages" className="crm-btn crm-btn-ghost">
            <ArrowLeft size={16} />
            Back
          </Link>
          <button type="button" className="crm-btn crm-btn-danger" onClick={() => setDeleteOpen(true)}>
            <Trash2 size={16} />
            Delete
          </button>
          <button type="button" className="crm-btn crm-btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={16} />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </>
      }
    >
      <ToastHost toasts={toasts} onDismiss={dismissToast} />
      <ConfirmDialog
        open={deleteOpen}
        title="Delete CMS package?"
        description="This removes the package from the CMS. The static website copy in code still exists until you re-import or remove it from code."
        confirmLabel="Delete"
        confirming={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      <div className="crm-workspace crm-workspace--clients">
        {error && (
          <div className="crm-state crm-state-error" role="alert" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <section className="crm-card" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
          <h2 style={{ marginTop: 0 }}>Package details</h2>
          <div className="crm-form-grid">
            <label className="crm-field">
              <span className="crm-field__label">Title</span>
              <input
                className="crm-search-input"
                value={row.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </label>
            <label className="crm-field">
              <span className="crm-field__label">Destination / country</span>
              <input
                className="crm-search-input"
                value={row.destination || ''}
                onChange={(e) => updateField('destination', e.target.value)}
              />
            </label>
            <label className="crm-field">
              <span className="crm-field__label">Category</span>
              <input
                className="crm-search-input"
                value={row.category || ''}
                onChange={(e) => updateField('category', e.target.value)}
              />
            </label>
            <label className="crm-field">
              <span className="crm-field__label">From price (€)</span>
              <input
                className="crm-search-input"
                type="number"
                min="0"
                step="1"
                value={row.price ?? ''}
                onChange={(e) => updateField('price', e.target.value)}
              />
            </label>
            <label className="crm-field">
              <span className="crm-field__label">Duration</span>
              <input
                className="crm-search-input"
                value={row.duration || ''}
                onChange={(e) => updateField('duration', e.target.value)}
              />
            </label>
            <label className="crm-field">
              <span className="crm-field__label">Departure dates (comma-separated)</span>
              <input
                className="crm-search-input"
                value={datesText}
                onChange={(e) => setDatesText(e.target.value)}
                placeholder="26/11, 03/12, 10/12"
              />
            </label>
            <label className="crm-field">
              <span className="crm-field__label">Cover image path</span>
              <input
                className="crm-search-input"
                value={row.details?.coverImage || ''}
                onChange={(e) => updateDetails({ coverImage: e.target.value })}
                placeholder="/images/christmas-packages/london/cover.webp"
              />
            </label>
            <label className="crm-field">
              <span className="crm-field__label">Thumbnail image path</span>
              <input
                className="crm-search-input"
                value={row.details?.thumbnailImage || ''}
                onChange={(e) => updateDetails({ thumbnailImage: e.target.value })}
              />
            </label>
            <label className="crm-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={Boolean(row.published)}
                onChange={(e) => updateField('published', e.target.checked)}
              />
              <span>Published on website</span>
            </label>
            <label className="crm-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={Boolean(row.hidden)}
                onChange={(e) => updateField('hidden', e.target.checked)}
              />
              <span>Hidden</span>
            </label>
          </div>
        </section>

        <section className="crm-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: 0 }}>Hotels & prices</h2>
              <p className="crm-muted" style={{ margin: '0.35rem 0 0' }}>
                Edit double price per person and departure date per hotel row (Excel-style).
              </p>
            </div>
            <button type="button" className="crm-btn crm-btn-ghost" onClick={addHotelRow}>
              <Plus size={16} />
              Add row
            </button>
          </div>

          <div className="crm-table-wrap" style={{ marginTop: '1rem' }}>
            <table className="crm-table crm-table--premium">
              <thead>
                <tr>
                  <th>Hotel</th>
                  <th>Departure</th>
                  <th>Board</th>
                  <th>Double €/pp</th>
                  <th>Package (2 pax)</th>
                  <th>Image path</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {hotels.length === 0 ? (
                  <tr>
                    <td colSpan={7}>No hotel rows yet. Add a row to start.</td>
                  </tr>
                ) : (
                  hotels.map((hotel, index) => (
                    <tr key={`${hotel.name || 'hotel'}-${index}`}>
                      <td>
                        <input
                          className="crm-search-input"
                          value={hotel.name || ''}
                          onChange={(e) => updateHotel(index, { name: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className="crm-search-input"
                          value={hotel.departureDate || ''}
                          onChange={(e) => updateHotel(index, { departureDate: e.target.value })}
                          placeholder="26/11"
                          style={{ minWidth: '5.5rem' }}
                        />
                      </td>
                      <td>
                        <input
                          className="crm-search-input"
                          value={hotel.boardBasis || ''}
                          onChange={(e) => updateHotel(index, { boardBasis: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className="crm-search-input"
                          type="number"
                          min="0"
                          step="1"
                          value={hotel.prices?.double ?? ''}
                          onChange={(e) => updateHotel(index, { doublePrice: e.target.value })}
                          style={{ minWidth: '5.5rem' }}
                        />
                      </td>
                      <td>{hotel.packagePrice != null ? `€${Number(hotel.packagePrice).toLocaleString()}` : '—'}</td>
                      <td>
                        <input
                          className="crm-search-input"
                          value={hotel.image || ''}
                          onChange={(e) => updateHotel(index, { image: e.target.value })}
                          placeholder="/images/…/hotel.webp"
                          style={{ minWidth: '10rem' }}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="crm-btn crm-btn-ghost crm-btn--small"
                          onClick={() => removeHotelRow(index)}
                          aria-label="Remove hotel row"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

export default PackageCmsDetail
