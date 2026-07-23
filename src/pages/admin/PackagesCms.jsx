import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, RefreshCw, Upload } from 'lucide-react'
import AdminLayout from './components/AdminLayout'
import ToastHost from './components/ToastHost'
import {
  fetchCmsPackages,
  importStaticPackagesIntoCms,
  PACKAGES_CMS_SETUP_HINT
} from './api/packagesCmsApi'
import { clearPackagesCatalogCache } from '../../lib/packagesCatalog'
import { travelPackages } from '../../data/packages'
import './Leads.css'

function formatMoney(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return `€${n.toLocaleString()}`
}

function formatUpdated(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '—'
  }
}

function PackagesCms() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [schemaMissing, setSchemaMissing] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(null)
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

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: queryError, schemaMissing: missing } = await fetchCmsPackages()
    if (queryError) {
      setError(queryError.message)
      setSchemaMissing(Boolean(missing || queryError.schemaMissing))
      setRows([])
    } else {
      setRows(data || [])
      setSchemaMissing(false)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const categories = useMemo(() => {
    const set = new Set(rows.map((row) => row.category).filter(Boolean))
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [rows])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (category !== 'all' && row.category !== category) return false
      if (!term) return true
      return [row.title, row.destination, row.category, String(row.legacy_id)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    })
  }, [rows, search, category])

  const handleImport = async () => {
    const confirmed = window.confirm(
      `Import ${travelPackages.length} website packages into the CMS?\n\nThis overwrites matching CMS rows with the current website data (by package ID).`
    )
    if (!confirmed) return

    setImporting(true)
    setImportProgress({ imported: 0, total: travelPackages.length })
    const result = await importStaticPackagesIntoCms({
      onProgress: setImportProgress
    })
    setImporting(false)

    if (result.error) {
      setSchemaMissing(Boolean(result.error.schemaMissing))
      setError(result.error.message)
      pushToast(result.error.message, 'error')
      return
    }

    clearPackagesCatalogCache()
    pushToast(`Imported ${result.imported} packages into the CMS.`, 'success')
    await load()
  }

  return (
    <AdminLayout
      title="Packages CMS"
      subtitle="Edit prices, departure dates, and hotel tariffs. Changes publish to the website when saved."
      actions={
        <>
          <button type="button" className="crm-btn crm-btn-ghost" onClick={load} disabled={loading || importing}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            type="button"
            className="crm-btn crm-btn-primary"
            onClick={handleImport}
            disabled={importing || schemaMissing}
          >
            <Upload size={16} />
            {importing
              ? `Importing ${importProgress?.imported || 0}/${importProgress?.total || '…'}`
              : 'Import from website'}
          </button>
        </>
      }
    >
      <ToastHost toasts={toasts} onDismiss={dismissToast} />

      <div className="crm-workspace crm-workspace--clients">
        {schemaMissing && (
          <div className="crm-state crm-state-error" role="alert">
            <p>
              <strong>Setup required.</strong> {PACKAGES_CMS_SETUP_HINT}
            </p>
            <button type="button" className="crm-btn crm-btn-primary" onClick={load}>
              Check again
            </button>
          </div>
        )}

        {!schemaMissing && error && (
          <div className="crm-state crm-state-error" role="alert">
            {error}
          </div>
        )}

        {!schemaMissing && (
          <>
            <div className="crm-filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <label className="crm-filter-field--search" style={{ flex: '1 1 220px' }}>
                <span className="crm-field__label">Search</span>
                <input
                  className="crm-search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Title, destination, ID…"
                />
              </label>
              <label style={{ flex: '0 1 220px' }}>
                <span className="crm-field__label">Category</span>
                <select className="crm-search-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item === 'all' ? 'All categories' : item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <p className="crm-muted" style={{ marginBottom: '0.75rem' }}>
              {loading ? 'Loading…' : `${filtered.length} package${filtered.length === 1 ? '' : 's'}`}
              {rows.length === 0 && !loading
                ? ' — click “Import from website” to load packages into Supabase.'
                : null}
            </p>

            {loading ? (
              <div className="crm-state">Loading packages…</div>
            ) : filtered.length === 0 ? (
              <div className="crm-empty">
                <Package size={28} />
                <p>No packages match your filters.</p>
              </div>
            ) : (
              <div className="crm-table-wrap">
                <table className="crm-table crm-table--premium">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Destination</th>
                      <th>Category</th>
                      <th>From</th>
                      <th>Status</th>
                      <th>Updated</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row.id}>
                        <td>{row.legacy_id}</td>
                        <td>
                          <strong>{row.title}</strong>
                        </td>
                        <td>{row.destination || '—'}</td>
                        <td>{row.category || '—'}</td>
                        <td>{formatMoney(row.price)}</td>
                        <td>
                          {row.hidden ? 'Hidden' : row.published === false ? 'Draft' : 'Published'}
                        </td>
                        <td>{formatUpdated(row.updated_at)}</td>
                        <td>
                          <Link className="crm-btn crm-btn-ghost crm-btn--small" to={`/admin/packages/${row.id}`}>
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}

export default PackagesCms
