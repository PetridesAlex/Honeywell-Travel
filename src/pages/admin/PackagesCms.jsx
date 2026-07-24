import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  ExternalLink,
  EyeOff,
  Filter,
  Globe,
  MapPin,
  Package,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Upload,
  X
} from 'lucide-react'
import AdminLayout from './components/AdminLayout'
import CmsPremiumSelect from './components/CmsPremiumSelect'
import ToastHost from './components/ToastHost'
import {
  fetchCmsPackages,
  importStaticPackagesIntoCms,
  PACKAGES_CMS_SETUP_HINT
} from './api/packagesCmsApi'
import { clearPackagesCatalogCache } from '../../lib/packagesCatalog'
import { resolvePackageCoverImage } from '../../lib/packagesCms'
import { travelPackages } from '../../data/packages'
import './components/PackagesCms.css'

function formatMoney(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return `From €${n.toLocaleString()}`
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

function packageStatus(row) {
  if (row.hidden) return { id: 'hidden', label: 'Hidden' }
  if (row.published === false) return { id: 'draft', label: 'Draft' }
  return { id: 'published', label: 'Published' }
}

function coverFor(row) {
  const fromCms = resolvePackageCoverImage(row)
  if (fromCms) return fromCms

  const legacyId = Number(row?.legacy_id)
  if (!Number.isFinite(legacyId)) return ''
  const staticPkg = travelPackages.find((pkg) => Number(pkg.id) === legacyId)
  return resolvePackageCoverImage(staticPkg)
}

function departureList(row) {
  const list = row?.details?.departureDates
  if (Array.isArray(list) && list.length) {
    return list.map((d) => String(d).trim()).filter(Boolean)
  }
  if (row?.details?.departureDate) {
    return String(row.details.departureDate)
      .split(/[,;]+/)
      .map((d) => d.trim())
      .filter(Boolean)
  }
  return []
}

function PackagesCms() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [schemaMissing, setSchemaMissing] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [destination, setDestination] = useState('all')
  const [status, setStatus] = useState('all')
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

  const destinations = useMemo(() => {
    const set = new Set(rows.map((row) => row.destination).filter(Boolean))
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [rows])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return rows.filter((row) => {
      const rowStatus = packageStatus(row).id
      if (status !== 'all' && rowStatus !== status) return false
      if (category !== 'all' && row.category !== category) return false
      if (destination !== 'all' && row.destination !== destination) return false
      if (!term) return true
      return [row.title, row.destination, row.category, String(row.legacy_id), row.duration]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    })
  }, [rows, search, category, destination, status])

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
      title="Honeywell Travel Workspace"
      subtitle="Your private studio for the travel catalog. Edit a package, then publish — shoppers see it on the live site."
      actions={
        <>
          <Link to="/admin/packages/new" className="cms-btn cms-btn--primary">
            <Plus size={16} />
            New package
          </Link>
          <button type="button" className="cms-btn cms-btn--ghost" onClick={load} disabled={loading || importing}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            type="button"
            className="cms-btn cms-btn--ghost"
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

      <div className="cms-workspace">
        {schemaMissing ? (
          <div className="cms-alert" role="alert">
            <p>
              <strong>Setup required.</strong> {PACKAGES_CMS_SETUP_HINT}
            </p>
            <button type="button" className="cms-btn cms-btn--primary" onClick={load}>
              Check again
            </button>
          </div>
        ) : null}

        {!schemaMissing && error ? (
          <div className="cms-alert" role="alert">
            {error}
          </div>
        ) : null}

        {!schemaMissing ? (
          <>
            <div className="cms-toolbar">
              <div className={`cms-search${search.trim() ? ' cms-search--filled' : ''}`}>
                <span className="cms-search__glow" aria-hidden="true" />
                <Search className="cms-search__icon" size={18} strokeWidth={2.2} aria-hidden />
                <input
                  className="cms-search__input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title, destination, category, or ID…"
                  aria-label="Search packages"
                />
                {search.trim() ? (
                  <button
                    type="button"
                    className="cms-search__clear"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                  >
                    <X size={15} strokeWidth={2.4} aria-hidden />
                  </button>
                ) : (
                  <span className="cms-search__hint" aria-hidden="true">
                    Catalog
                  </span>
                )}
              </div>

              <div className="cms-toolbar__controls">
                <div className="cms-filter-block">
                  <span className="cms-filter-block__label">Status</span>
                  <div className="cms-status-pills" role="group" aria-label="Status filters">
                    {[
                      { id: 'all', label: 'All', Icon: Filter },
                      { id: 'published', label: 'Published', Icon: Globe },
                      { id: 'draft', label: 'Draft', Icon: PencilLine },
                      { id: 'hidden', label: 'Hidden', Icon: EyeOff }
                    ].map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        className={`cms-status-pill cms-status-pill--${id}${
                          status === id ? ' cms-status-pill--active' : ''
                        }`}
                        onClick={() => setStatus(id)}
                        aria-pressed={status === id}
                      >
                        <Icon size={14} strokeWidth={2.4} aria-hidden />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="cms-filter-block cms-filter-block--selects">
                  <CmsPremiumSelect
                    label="Category"
                    value={category}
                    onChange={setCategory}
                    ariaLabel="Filter by category"
                    icon={Tag}
                    options={categories.map((item) => ({
                      value: item,
                      label: item === 'all' ? 'All categories' : item
                    }))}
                  />

                  <CmsPremiumSelect
                    label="Destination"
                    value={destination}
                    onChange={setDestination}
                    ariaLabel="Filter by destination"
                    icon={MapPin}
                    options={destinations.map((item) => ({
                      value: item,
                      label: item === 'all' ? 'All destinations' : item
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="cms-meta-row">
              <div className="cms-result-count">
                <span className="cms-result-count__value">{loading ? '…' : filtered.length}</span>
                <span className="cms-result-count__copy">
                  {loading
                    ? 'Loading packages'
                    : `package${filtered.length === 1 ? '' : 's'} shown`}
                  {rows.length === 0 && !loading ? ' — import from the website to get started' : null}
                </span>
              </div>
              {(status !== 'all' || category !== 'all' || destination !== 'all' || search.trim()) && (
                <button
                  type="button"
                  className="cms-btn cms-btn--ghost cms-btn--clear"
                  onClick={() => {
                    setSearch('')
                    setStatus('all')
                    setCategory('all')
                    setDestination('all')
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="cms-empty">Loading packages…</div>
            ) : filtered.length === 0 ? (
              <div className="cms-empty">
                <Package size={32} />
                <p>No packages match your search.</p>
              </div>
            ) : (
              <div className="cms-grid">
                {filtered.map((row) => {
                  const statusInfo = packageStatus(row)
                  const cover = coverFor(row)
                  const departures = departureList(row)
                  const metaBits = [
                    row.destination && { icon: 'place', label: row.destination },
                    row.category && { icon: 'tag', label: row.category },
                    row.duration && { icon: 'time', label: row.duration }
                  ].filter(Boolean)

                  return (
                    <article key={row.id} className="cms-card">
                      <div className="cms-card__media">
                        {cover ? (
                          <img src={cover} alt="" loading="lazy" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="cms-card__media-fallback">
                            <Package size={36} />
                          </div>
                        )}
                      </div>
                      <div className="cms-card__body">
                        <div className="cms-card__top">
                          <span className="cms-card__id">ID {row.legacy_id}</span>
                          <span className={`cms-status cms-status--${statusInfo.id}`}>{statusInfo.label}</span>
                        </div>
                        <h2 className="cms-card__title">{row.title}</h2>

                        {metaBits.length ? (
                          <div className="cms-card__meta-row">
                            {metaBits.map((bit) => (
                              <span key={`${bit.icon}-${bit.label}`} className="cms-card__chip">
                                {bit.icon === 'place' ? <MapPin size={12} strokeWidth={2.4} aria-hidden /> : null}
                                {bit.label}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <p className="cms-card__price">{formatMoney(row.price)}</p>

                        <div className="cms-card__departures">
                          <div className="cms-card__departures-label">
                            <CalendarDays size={13} strokeWidth={2.4} aria-hidden />
                            Departures
                          </div>
                          {departures.length ? (
                            <div className="cms-card__date-chips">
                              {departures.slice(0, 6).map((date) => (
                                <span key={date} className="cms-card__date-chip">
                                  {date}
                                </span>
                              ))}
                              {departures.length > 6 ? (
                                <span className="cms-card__date-chip cms-card__date-chip--more">
                                  +{departures.length - 6}
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <span className="cms-card__dates-empty">No dates set</span>
                          )}
                        </div>

                        <p className="cms-card__updated">Updated {formatUpdated(row.updated_at)}</p>

                        <div className="cms-card__actions">
                          <Link className="cms-btn cms-btn--primary" to={`/admin/packages/${row.id}`}>
                            Edit
                          </Link>
                          <a
                            className="cms-btn cms-btn--ghost"
                            href={`/packages/${row.legacy_id}/details`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink size={15} />
                            View site
                          </a>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </>
        ) : null}
      </div>
    </AdminLayout>
  )
}

export default PackagesCms
