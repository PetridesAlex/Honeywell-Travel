import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  BookOpen,
  Copy,
  ExternalLink,
  FileText,
  ImageIcon,
  Hotel,
  Map,
  MapPin,
  Clock,
  Package,
  Plus,
  Save,
  ShieldAlert,
  Trash2,
  XCircle,
  Globe,
  PencilLine,
  EyeOff
} from 'lucide-react'
import AdminLayout from './components/AdminLayout'
import ConfirmDialog from './components/ConfirmDialog'
import ToastHost from './components/ToastHost'
import {
  deleteCmsPackage,
  fetchCmsPackageById,
  getNextLegacyId,
  saveCmsPackage,
  PACKAGES_CMS_SETUP_HINT
} from './api/packagesCmsApi'
import { clearPackagesCatalogCache } from '../../lib/packagesCatalog'
import { cloneJson, isUsableImageSrc, resolvePackageCoverImage } from '../../lib/packagesCms'
import { PACKAGE_CATEGORY_OPTIONS } from './constants'
import { travelPackages } from '../../data/packages'
import './components/PackagesCms.css'

function emptyHotelRow() {
  return {
    name: '',
    stars: 3,
    roomType: 'Standard Room',
    image: '',
    location: '',
    boardBasis: 'Bed & Breakfast',
    prices: { double: 0, single: 0, triple: 0, child1: 0, child2: 0 },
    packagePrice: 0,
    departureDate: '',
    nights: 3
  }
}

function money(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return '—'
  return `€${n.toLocaleString()}`
}

function listToText(list) {
  return Array.isArray(list) ? list.filter(Boolean).join('\n') : ''
}

function textToList(text) {
  return String(text || '')
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

const STATUS_OPTIONS = [
  { id: 'live', label: 'Published', Icon: Globe },
  { id: 'draft', label: 'Draft', Icon: PencilLine },
  { id: 'hidden', label: 'Hidden', Icon: EyeOff }
]

const EDITOR_SECTIONS = [
  { id: 'basics', label: 'Basics', Icon: Package, hint: 'Title, price, category' },
  { id: 'departures', label: 'Departures', Icon: CalendarDays, hint: 'Travel dates' },
  { id: 'hotels', label: 'Hotels & prices', Icon: Hotel, hint: 'Tariffs per hotel' },
  { id: 'program', label: 'Program & text', Icon: FileText, hint: 'Description & days' },
  { id: 'media', label: 'Media', Icon: ImageIcon, hint: 'Cover & gallery' }
]

function getProgramDayEntries(program) {
  if (!program || typeof program !== 'object') return []
  return Object.keys(program)
    .filter((key) => /^day\d+$/i.test(key))
    .sort((a, b) => Number(a.replace(/\D/g, '')) - Number(b.replace(/\D/g, '')))
    .map((key) => ({ key, text: program[key] || '' }))
}

function formatUpdated(value) {
  if (!value) return 'Not saved yet'
  try {
    return `Saved ${new Date(value).toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })}`
  } catch {
    return 'Saved'
  }
}

function normalizeImageUrlInput(value) {
  let next = String(value || '').trim()
  if (!next) return ''
  if ((next.startsWith('"') && next.endsWith('"')) || (next.startsWith("'") && next.endsWith("'"))) {
    next = next.slice(1, -1).trim()
  }
  // Keep first line only if staff paste multiple URLs by accident
  next = next.split(/\s+/)[0] || next
  return next
}

function ImageUrlField({
  label,
  value,
  onChange,
  placeholder = 'https://… or /images/…/photo.webp',
  hint = 'Right-click an image on Google → Copy image address → paste here.',
  large = false
}) {
  const [loadState, setLoadState] = useState('idle')
  const src = (value || '').trim()
  const usable = isUsableImageSrc(src)

  useEffect(() => {
    if (!src) {
      setLoadState('idle')
      return
    }
    if (!usable) {
      setLoadState('invalid')
      return
    }
    setLoadState('loading')
  }, [src, usable])

  return (
    <label className={`cms-field cms-image-field${large ? ' cms-image-field--large' : ''}`}>
      <span className="cms-field__label">{label}</span>
      <input
        value={value || ''}
        onChange={(e) => onChange(normalizeImageUrlInput(e.target.value))}
        onPaste={(e) => {
          const pasted = e.clipboardData?.getData('text')
          if (!pasted) return
          e.preventDefault()
          onChange(normalizeImageUrlInput(pasted))
        }}
        placeholder={placeholder}
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
      />
      <span className="cms-field__hint">{hint}</span>
      {src ? (
        <div
          className={`cms-media-preview${
            loadState === 'error' || loadState === 'invalid' ? ' cms-media-preview--error' : ''
          }${loadState === 'ok' ? ' cms-media-preview--ok' : ''}`}
        >
          {usable ? (
            <img
              key={src}
              src={src}
              alt=""
              referrerPolicy="no-referrer"
              onLoad={() => setLoadState('ok')}
              onError={() => setLoadState('error')}
            />
          ) : null}
          <div className="cms-media-preview__status">
            {loadState === 'loading' ? 'Checking image…' : null}
            {loadState === 'ok' ? 'Image loaded — looks good' : null}
            {loadState === 'invalid'
              ? 'Paste a full link starting with https:// or a site path like /images/…'
              : null}
            {loadState === 'error'
              ? 'Could not load this link. Use “Copy image address” (not the Google page link).'
              : null}
          </div>
        </div>
      ) : (
        <div className="cms-media-preview cms-media-preview--empty">
          <ImageIcon size={22} strokeWidth={2} aria-hidden />
          <span>Paste image address to preview here</span>
        </div>
      )}
    </label>
  )
}

function createBlankPackage(legacyId) {
  return {
    id: null,
    legacy_id: legacyId,
    title: '',
    destination: '',
    category: '',
    price: '',
    duration: '',
    description: '',
    long_description: '',
    image: '',
    featured: false,
    package_type: 'individual',
    hidden: false,
    published: false,
    details: {
      hotels: [],
      departureDates: [],
      gallery: [],
      included: [],
      notIncluded: [],
      program: { introduction: '' },
      coverImage: '',
      thumbnailImage: '',
      note: '',
      cancellationPolicy: ''
    },
    updated_at: null
  }
}

function PackageCmsDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const [row, setRow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [schemaMissing, setSchemaMissing] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toasts, setToasts] = useState([])
  const [datesText, setDatesText] = useState('')
  const [galleryText, setGalleryText] = useState('')
  const [includedText, setIncludedText] = useState('')
  const [notIncludedText, setNotIncludedText] = useState('')
  const [expandedHotel, setExpandedHotel] = useState(null)
  const [activeSection, setActiveSection] = useState('basics')

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

    if (isNew) {
      const { legacyId, error: nextError } = await getNextLegacyId()
      if (nextError?.schemaMissing) {
        setSchemaMissing(true)
        setError(nextError.message)
        setRow(null)
        setLoading(false)
        return
      }
      const blank = createBlankPackage(legacyId)
      setRow(blank)
      setDatesText('')
      setGalleryText('')
      setIncludedText('')
      setNotIncludedText('')
      setSchemaMissing(false)
      setLoading(false)
      return
    }

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
    if (!Array.isArray(details.gallery)) details.gallery = []
    setRow({ ...data, details })
    setDatesText((details.departureDates || []).join(', '))
    setGalleryText((details.gallery || []).join('\n'))
    setIncludedText(listToText(details.included))
    setNotIncludedText(listToText(details.notIncluded))
    setLoading(false)
  }, [id, isNew])

  useEffect(() => {
    load()
  }, [load])

  const hotels = useMemo(() => row?.details?.hotels || [], [row])

  const hotelStats = useMemo(() => {
    const doubles = hotels
      .map((h) => Number(h?.prices?.double))
      .filter((n) => Number.isFinite(n) && n > 0)
    const cheapest = doubles.length ? Math.min(...doubles) : null
    const uniqueHotels = new Set(hotels.map((h) => (h?.name || '').trim()).filter(Boolean)).size
    const uniqueDeps = new Set(hotels.map((h) => (h?.departureDate || '').trim()).filter(Boolean)).size
    return {
      rows: hotels.length,
      uniqueHotels,
      uniqueDeps,
      cheapest,
      fromPrice: Number(row?.price) || cheapest
    }
  }, [hotels, row?.price])

  const programDays = useMemo(() => getProgramDayEntries(row?.details?.program), [row])

  const coverPreview = useMemo(() => {
    const fromCms = resolvePackageCoverImage(row)
    if (fromCms) return fromCms
    const legacyId = Number(row?.legacy_id)
    if (!Number.isFinite(legacyId)) return ''
    const staticPkg = travelPackages.find((pkg) => Number(pkg.id) === legacyId)
    return resolvePackageCoverImage(staticPkg)
  }, [row])

  const categoryOptions = useMemo(() => {
    const current = (row?.category || '').trim()
    if (current && !PACKAGE_CATEGORY_OPTIONS.includes(current)) {
      return [current, ...PACKAGE_CATEGORY_OPTIONS]
    }
    return PACKAGE_CATEGORY_OPTIONS
  }, [row?.category])

  const currentStatus = row?.hidden ? 'hidden' : row?.published ? 'live' : 'draft'

  const setStatus = (status) => {
    setRow((prev) => {
      if (!prev) return prev
      if (status === 'live') return { ...prev, published: true, hidden: false }
      if (status === 'draft') return { ...prev, published: false, hidden: false }
      return { ...prev, published: false, hidden: true }
    })
  }

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

  const updateProgram = (patch) => {
    setRow((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        details: {
          ...prev.details,
          program: {
            ...(prev.details?.program || {}),
            ...patch
          }
        }
      }
    })
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
        const double = Number(patch.doublePrice)
        const safe = Number.isFinite(double) ? double : 0
        next.prices = { ...(current.prices || {}), double: safe }
        next.packagePrice = safe > 0 ? safe * 2 : 0
        delete next.doublePrice
      }

      if (patch.priceField != null) {
        const { key, value } = patch.priceField
        const n = Number(value)
        const safe = Number.isFinite(n) ? n : 0
        next.prices = { ...(next.prices || current.prices || {}), [key]: safe }
        if (key === 'double') {
          next.packagePrice = safe > 0 ? safe * 2 : 0
        }
        delete next.priceField
      }

      if (patch.packagePrice != null && patch.doublePrice == null && patch.priceField == null) {
        const n = Number(patch.packagePrice)
        next.packagePrice = Number.isFinite(n) ? n : 0
      }

      nextHotels[index] = next

      const doubles = nextHotels
        .map((h) => Number(h?.prices?.double))
        .filter((v) => Number.isFinite(v) && v > 0)
      const cheapest = doubles.length ? Math.min(...doubles) : null

      return {
        ...prev,
        price: cheapest != null ? cheapest : prev.price,
        details: { ...prev.details, hotels: nextHotels }
      }
    })
  }

  const duplicateHotelRow = (index) => {
    setRow((prev) => {
      if (!prev) return prev
      const list = [...(prev.details?.hotels || [])]
      const source = list[index] || emptyHotelRow()
      list.splice(index + 1, 0, cloneJson(source))
      return {
        ...prev,
        details: { ...prev.details, hotels: list }
      }
    })
    setExpandedHotel(index + 1)
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
    setExpandedHotel(hotels.length)
  }

  const addProgramDay = () => {
    setRow((prev) => {
      if (!prev) return prev
      const program = { ...(prev.details?.program || {}) }
      const existing = getProgramDayEntries(program)
      const nextNum = existing.length
        ? Math.max(...existing.map((d) => Number(d.key.replace(/\D/g, '')) || 0)) + 1
        : 1
      program[`day${nextNum}`] = ''
      return {
        ...prev,
        details: { ...prev.details, program }
      }
    })
  }

  const removeProgramDay = (key) => {
    setRow((prev) => {
      if (!prev) return prev
      const program = { ...(prev.details?.program || {}) }
      delete program[key]
      return {
        ...prev,
        details: { ...prev.details, program }
      }
    })
  }

  const removeHotelRow = (index) => {
    setRow((prev) => {
      if (!prev) return prev
      const nextHotels = [...(prev.details?.hotels || [])]
      nextHotels.splice(index, 1)
      const doubles = nextHotels
        .map((h) => Number(h?.prices?.double))
        .filter((v) => Number.isFinite(v) && v > 0)
      const cheapest = doubles.length ? Math.min(...doubles) : null
      return {
        ...prev,
        price: cheapest != null ? cheapest : prev.price,
        details: { ...prev.details, hotels: nextHotels }
      }
    })
    setExpandedHotel((prev) => {
      if (prev == null) return null
      if (prev === index) return null
      if (prev > index) return prev - 1
      return prev
    })
  }

  const handleSave = async () => {
    if (!row) return

    const title = (row.title || '').trim()
    const legacyId = Number(row.legacy_id)
    if (!title) {
      setError('Add a package title before saving.')
      setActiveSection('basics')
      pushToast('Title is required.', 'error')
      return
    }
    if (!(row.category || '').trim()) {
      setError('Choose a category (e.g. Summer Packages, Christmas Packages).')
      setActiveSection('basics')
      pushToast('Category is required.', 'error')
      return
    }
    if (!Number.isFinite(legacyId) || legacyId <= 0) {
      setError('Website ID must be a positive number.')
      setActiveSection('basics')
      pushToast('Website ID must be a positive number.', 'error')
      return
    }

    setSaving(true)
    setError('')

    const departureDates = datesText
      .split(/[,;\n]+/)
      .map((part) => part.trim())
      .filter(Boolean)

    const gallery = galleryText
      .split(/\n+/)
      .map((part) => normalizeImageUrlInput(part))
      .filter(Boolean)

    const coverImage = normalizeImageUrlInput(row.details?.coverImage || '')
    const thumbnailImage = normalizeImageUrlInput(row.details?.thumbnailImage || '')
    const hotels = Array.isArray(row.details?.hotels)
      ? row.details.hotels.map((hotel) => ({
          ...hotel,
          image: normalizeImageUrlInput(hotel?.image || '')
        }))
      : []

    const payload = {
      ...row,
      title,
      legacy_id: legacyId,
      image: coverImage || thumbnailImage || row.image || null,
      details: {
        ...row.details,
        coverImage,
        thumbnailImage,
        hotels,
        departureDates,
        departureDate: departureDates[0] || row.details?.departureDate || '',
        gallery,
        included: textToList(includedText),
        notIncluded: textToList(notIncludedText),
        note: row.details?.note || ''
      }
    }

    const wasNew = !row.id
    const { data, error: saveError } = await saveCmsPackage(payload)
    setSaving(false)

    if (saveError) {
      setSchemaMissing(Boolean(saveError.schemaMissing))
      setError(saveError.message)
      pushToast(saveError.message, 'error')
      return
    }

    clearPackagesCatalogCache()
    const details = {
      ...(data.details || {}),
      hotels: Array.isArray(data.details?.hotels) ? data.details.hotels : [],
      gallery: Array.isArray(data.details?.gallery) ? data.details.gallery : [],
      departureDates: Array.isArray(data.details?.departureDates) ? data.details.departureDates : [],
      included: Array.isArray(data.details?.included) ? data.details.included : [],
      notIncluded: Array.isArray(data.details?.notIncluded) ? data.details.notIncluded : []
    }
    setRow({ ...data, details })
    setDatesText((details.departureDates || []).join(', '))
    setGalleryText((details.gallery || []).join('\n'))
    setIncludedText(listToText(details.included))
    setNotIncludedText(listToText(details.notIncluded))
    pushToast(
      wasNew
        ? 'Package created. Add prices, program, and images — then publish when it is ready for the live site.'
        : 'Package saved. Your updates will appear on the website shortly.',
      'success'
    )

    if (wasNew && data?.id) {
      navigate(`/admin/packages/${data.id}`, { replace: true })
    }
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
      <AdminLayout title={isNew ? 'New package' : 'Edit package'} subtitle="Loading…">
        <div className="cms-workspace">
          <div className="cms-empty">{isNew ? 'Preparing new package…' : 'Loading package…'}</div>
        </div>
      </AdminLayout>
    )
  }

  if (!row) {
    return (
      <AdminLayout title="Edit package" subtitle="Not found">
        <div className="cms-workspace">
          <div className="cms-alert" role="alert">
            {schemaMissing ? PACKAGES_CMS_SETUP_HINT : error || 'Package not found.'}
          </div>
          <Link to="/admin/packages" className="cms-btn cms-btn--ghost" style={{ marginTop: '1rem' }}>
            <ArrowLeft size={16} /> Back to packages
          </Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title={isNew ? 'New package' : row.title || 'Edit package'}
      subtitle={
        isNew
          ? `New website ID #${row.legacy_id} · starts as Draft`
          : `Website ID #${row.legacy_id} · ${row.destination || 'No destination'}`
      }
      header={
        <div className="cms-editor cms-editor--head">
          <div className="cms-sticky-bar">
            <div className="cms-sticky-bar__left">
              <Link to="/admin/packages" className="cms-btn cms-btn--ghost cms-btn--icon" aria-label="Back to packages">
                <ArrowLeft size={16} />
              </Link>

              <div className="cms-sticky-bar__identity">
                <div className="cms-sticky-bar__cover" aria-hidden="true">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt=""
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement?.classList.add('cms-sticky-bar__cover--empty')
                      }}
                    />
                  ) : (
                    <span className="cms-sticky-bar__cover-fallback">
                      <Package size={22} strokeWidth={2} />
                    </span>
                  )}
                </div>

                <div className="cms-sticky-bar__title">
                  <div className="cms-sticky-bar__title-row">
                    <strong>{row.title?.trim() || (isNew ? 'New travel package' : 'Edit package')}</strong>
                    <span
                      className={`cms-status-badge cms-status-badge--${
                        row.hidden ? 'hidden' : row.published ? 'live' : 'draft'
                      }`}
                    >
                      {row.hidden ? 'Hidden' : row.published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <div className="cms-sticky-bar__facts">
                    <span className="cms-sticky-bar__fact">ID #{row.legacy_id}</span>
                    {row.destination ? (
                      <span className="cms-sticky-bar__fact">
                        <MapPin size={12} strokeWidth={2.4} aria-hidden />
                        {row.destination}
                      </span>
                    ) : null}
                    {row.duration ? (
                      <span className="cms-sticky-bar__fact">
                        <Clock size={12} strokeWidth={2.4} aria-hidden />
                        {row.duration}
                      </span>
                    ) : null}
                    {row.category ? <span className="cms-sticky-bar__fact">{row.category}</span> : null}
                    {Number(row.price) > 0 ? (
                      <span className="cms-sticky-bar__fact cms-sticky-bar__fact--price">
                        From {money(row.price)}
                      </span>
                    ) : null}
                  </div>

                  <span className="cms-sticky-bar__meta">
                    {isNew ? 'Draft package · not saved yet' : formatUpdated(row.updated_at)}
                  </span>
                </div>
              </div>
            </div>
            <div className="cms-sticky-bar__right">
              <div className="cms-status-control">
                <span className="cms-status-control__label">Status</span>
                <div className="cms-status-switch" role="group" aria-label="Package status">
                  {STATUS_OPTIONS.map(({ id: statusId, label, Icon }) => {
                    const active = currentStatus === statusId
                    return (
                      <button
                        key={statusId}
                        type="button"
                        className={`cms-status-switch__btn cms-status-switch__btn--${statusId}${
                          active ? ' cms-status-switch__btn--active' : ''
                        }`}
                        onClick={() => setStatus(statusId)}
                        aria-pressed={active}
                      >
                        <Icon size={14} strokeWidth={2.4} aria-hidden />
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
              {!isNew ? (
                <a
                  className="cms-btn cms-btn--ghost"
                  href={`/packages/${row.legacy_id}/details`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={15} />
                  View site
                </a>
              ) : null}
              {!isNew ? (
                <button type="button" className="cms-btn cms-btn--danger" onClick={() => setDeleteOpen(true)}>
                  <Trash2 size={16} />
                  Delete
                </button>
              ) : null}
              <button type="button" className="cms-btn cms-btn--primary" onClick={handleSave} disabled={saving}>
                <Save size={16} />
                {saving ? 'Saving…' : isNew ? 'Create package' : 'Save changes'}
              </button>
            </div>
          </div>

          <nav className="cms-section-tabs" aria-label="Package sections">
            {EDITOR_SECTIONS.map(({ id, label, Icon, hint }) => (
              <button
                key={id}
                type="button"
                className={`cms-section-tab cms-section-tab--${id}${
                  activeSection === id ? ' cms-section-tab--active' : ''
                }`}
                onClick={() => setActiveSection(id)}
                aria-pressed={activeSection === id}
              >
                <span className="cms-section-tab__icon">
                  <Icon size={16} strokeWidth={2.2} aria-hidden />
                </span>
                <span className="cms-section-tab__text">
                  <span className="cms-section-tab__label">{label}</span>
                  <span className="cms-section-tab__hint">{hint}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>
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

      <div className="cms-editor">
        {error ? (
          <div className="cms-alert" role="alert" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        ) : null}

        {activeSection === 'basics' ? (
        <section className="cms-panel cms-panel--basics">
          <div className="cms-panel__head">
            <div className="cms-panel__title-row">
              <span className="cms-panel__icon cms-panel__icon--red" aria-hidden="true">
                <Package size={18} strokeWidth={2.2} />
              </span>
              <div>
                <h2>Basics</h2>
                <p className="cms-panel__lead">Title, destination, category, listing price, and short card text.</p>
              </div>
            </div>
          </div>
          <div className="cms-form-grid">
            <label className="cms-field">
              <span className="cms-field__label">Website ID</span>
              <input
                type="number"
                min="1"
                step="1"
                value={row.legacy_id ?? ''}
                onChange={(e) => updateField('legacy_id', e.target.value)}
                disabled={!isNew && Boolean(row.id)}
              />
              <span className="cms-field__hint">
                {isNew
                  ? 'Unique package number used in /packages/ID/details URLs. Suggested next ID is filled in.'
                  : 'Fixed after create — matches the public package URL.'}
              </span>
            </label>
            <label className="cms-field cms-form-grid--full">
              <span className="cms-field__label">Title</span>
              <input
                value={row.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g. Christmas weekend in Vienna"
              />
            </label>
            <label className="cms-field">
              <span className="cms-field__label">Destination / country</span>
              <input value={row.destination || ''} onChange={(e) => updateField('destination', e.target.value)} />
            </label>
            <label className="cms-field">
              <span className="cms-field__label">Category</span>
              <select
                className="cms-select"
                value={row.category || ''}
                onChange={(e) => updateField('category', e.target.value)}
                aria-label="Package category"
              >
                <option value="">Select category…</option>
                {categoryOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <span className="cms-field__hint">
                Where this package appears on the website (Summer, Christmas, Exotic, etc.).
              </span>
            </label>
            <label className="cms-field cms-field--money">
              <span className="cms-field__label">From price</span>
              <div className="cms-money">
                <span className="cms-money__currency" aria-hidden="true">
                  €
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={row.price ?? ''}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="0"
                  aria-label="From price in euros"
                />
                <span className="cms-money__unit">per person</span>
              </div>
              <span className="cms-field__hint">Website listing “from” price. Lowest hotel double also updates this.</span>
            </label>
            <label className="cms-field">
              <span className="cms-field__label">Duration</span>
              <input
                value={row.duration || ''}
                onChange={(e) => updateField('duration', e.target.value)}
                placeholder="e.g. 4 Days / 3 Nights"
              />
            </label>
            <label className="cms-field cms-form-grid--full">
              <span className="cms-field__label">Short description</span>
              <textarea
                value={row.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="One or two lines for the package card…"
              />
            </label>
          </div>
        </section>
        ) : null}

        {activeSection === 'departures' ? (
        <section className="cms-panel cms-panel--departures">
          <div className="cms-panel__head">
            <div className="cms-panel__title-row">
              <span className="cms-panel__icon cms-panel__icon--blue" aria-hidden="true">
                <CalendarDays size={18} strokeWidth={2.2} />
              </span>
              <div>
                <h2>Departures</h2>
                <p className="cms-panel__lead">Comma-separated dates (e.g. 26/11, 03/12, 10/12).</p>
              </div>
            </div>
          </div>
          <div className="cms-form-grid">
            <label className="cms-field cms-form-grid--full">
              <span className="cms-field__label">Departure dates</span>
              <input
                value={datesText}
                onChange={(e) => setDatesText(e.target.value)}
                placeholder="26/11, 03/12, 10/12"
              />
              <span className="cms-field__hint">Separate each date with a comma. These appear on the package page.</span>
            </label>
            <label className="cms-field cms-form-grid--full">
              <span className="cms-field__label">Internal note</span>
              <textarea
                value={row.details?.note || ''}
                onChange={(e) => updateDetails({ note: e.target.value })}
                placeholder="Optional note for staff — not shown on the website"
              />
            </label>
          </div>
        </section>
        ) : null}

        {activeSection === 'media' ? (
        <section className="cms-panel cms-panel--media">
          <div className="cms-panel__head">
            <div className="cms-panel__title-row">
              <span className="cms-panel__icon cms-panel__icon--gold" aria-hidden="true">
                <ImageIcon size={18} strokeWidth={2.2} />
              </span>
              <div>
                <h2>Media</h2>
                <p className="cms-panel__lead cms-panel__lead--media">
                  Add photos in three quick steps — paste a direct image link and preview appears below.
                </p>
              </div>
            </div>
          </div>

          <div className="cms-media-guide" aria-label="How to add images">
            <div className="cms-media-guide__intro">
              <span className="cms-media-guide__eyebrow">How to add images</span>
              <p className="cms-media-guide__title">Google Images → copy address → paste</p>
            </div>

            <ol className="cms-media-guide__steps">
              <li>
                <span className="cms-media-guide__step-num" aria-hidden="true">
                  1
                </span>
                <span className="cms-media-guide__step-copy">
                  <strong>Find a photo</strong>
                  <em>Open Google Images and choose a clear package photo</em>
                </span>
              </li>
              <li>
                <span className="cms-media-guide__step-num" aria-hidden="true">
                  2
                </span>
                <span className="cms-media-guide__step-copy">
                  <strong>Copy image address</strong>
                  <em>Right-click the image → Copy image address (not the page link)</em>
                </span>
              </li>
              <li>
                <span className="cms-media-guide__step-num" aria-hidden="true">
                  3
                </span>
                <span className="cms-media-guide__step-copy">
                  <strong>Paste below</strong>
                  <em>Drop it into Cover, Thumbnail, or Gallery</em>
                </span>
              </li>
            </ol>

            <div className="cms-media-guide__tips">
              <p>
                <span className="cms-media-guide__tip-label">Best links</span>
                Prefer addresses ending in <code>.jpg</code>, <code>.webp</code>, or <code>.png</code>
              </p>
              <p>
                <span className="cms-media-guide__tip-label">Also works</span>
                Local site paths like <code>/images/bali/cover.webp</code>
              </p>
            </div>
          </div>

          <div className="cms-form-grid">
            <ImageUrlField
              label="Cover image"
              large
              value={row.details?.coverImage || ''}
              onChange={(next) => updateDetails({ coverImage: next })}
              placeholder="https://…jpg  or  /images/…/cover.webp"
            />
            <ImageUrlField
              label="Thumbnail image"
              large
              value={row.details?.thumbnailImage || ''}
              onChange={(next) => updateDetails({ thumbnailImage: next })}
              placeholder="https://…jpg  or  /images/…/thumb.webp"
            />
            <label className="cms-field cms-form-grid--full cms-image-field">
              <span className="cms-field__label">Gallery (one image address per line)</span>
              <textarea
                value={galleryText}
                onChange={(e) => setGalleryText(e.target.value)}
                onPaste={(e) => {
                  const pasted = e.clipboardData?.getData('text')
                  if (!pasted || !pasted.includes('http')) return
                  // Allow normal paste; normalize after a tick via onChange already
                }}
                placeholder={'https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg\n/images/…/three.webp'}
              />
              <span className="cms-field__hint">
                Paste several Google image addresses — one URL per line. Previews appear below.
              </span>
              {galleryText.trim() ? (
                <div className="cms-gallery-previews">
                  {galleryText
                    .split(/\n+/)
                    .map((part) => normalizeImageUrlInput(part))
                    .filter(Boolean)
                    .slice(0, 8)
                    .map((src) => (
                      <div key={src} className="cms-gallery-previews__item">
                        {isUsableImageSrc(src) ? (
                          <img src={src} alt="" referrerPolicy="no-referrer" />
                        ) : (
                          <span>Invalid</span>
                        )}
                      </div>
                    ))}
                </div>
              ) : null}
            </label>
          </div>
        </section>
        ) : null}

        {activeSection === 'hotels' ? (
        <section className="cms-panel cms-panel--hotels">
          <div className="cms-panel__head">
            <div className="cms-panel__title-row">
              <span className="cms-panel__icon cms-panel__icon--teal" aria-hidden="true">
                <Hotel size={18} strokeWidth={2.2} />
              </span>
              <div>
                <h2>Hotels & prices</h2>
                <p className="cms-panel__lead" style={{ marginBottom: 0 }}>
                  Each row is one hotel option for one departure. Double €/pp drives the website “from” price.
                </p>
              </div>
            </div>
            <button type="button" className="cms-btn cms-btn--ghost" onClick={addHotelRow}>
              <Plus size={16} />
              Add hotel option
            </button>
          </div>

          <div className="cms-tariff-summary">
            <div className="cms-tariff-summary__stat">
              <span className="cms-tariff-summary__label">Website from</span>
              <strong>{money(hotelStats.cheapest ?? hotelStats.fromPrice)}</strong>
              <em>lowest double €/pp</em>
            </div>
            <div className="cms-tariff-summary__stat">
              <span className="cms-tariff-summary__label">Options</span>
              <strong>{hotelStats.rows}</strong>
              <em>hotel × departure rows</em>
            </div>
            <div className="cms-tariff-summary__stat">
              <span className="cms-tariff-summary__label">Hotels</span>
              <strong>{hotelStats.uniqueHotels}</strong>
              <em>unique names</em>
            </div>
            <div className="cms-tariff-summary__stat">
              <span className="cms-tariff-summary__label">Departures</span>
              <strong>{hotelStats.uniqueDeps}</strong>
              <em>unique dates in tariffs</em>
            </div>
          </div>

          <div className="cms-tariff-list">
            {hotels.length === 0 ? (
              <div className="cms-tariff-empty">
                <p>No hotel tariffs yet. Add an option to set accurate live prices.</p>
                <button type="button" className="cms-btn cms-btn--primary" onClick={addHotelRow}>
                  <Plus size={16} />
                  Add first hotel option
                </button>
              </div>
            ) : (
              hotels.map((hotel, index) => {
                const open = expandedHotel === index
                const double = Number(hotel.prices?.double) || 0
                return (
                  <article
                    key={`${hotel.name || 'hotel'}-${hotel.departureDate || 'dep'}-${index}`}
                    className={`cms-tariff-card${open ? ' cms-tariff-card--open' : ''}`}
                  >
                    <button
                      type="button"
                      className="cms-tariff-card__summary"
                      onClick={() => setExpandedHotel(open ? null : index)}
                      aria-expanded={open}
                    >
                      <div className="cms-tariff-card__identity">
                        <span className="cms-tariff-card__index">#{index + 1}</span>
                        <div>
                          <strong>{hotel.name?.trim() || 'Untitled hotel'}</strong>
                          <span>
                            {[hotel.departureDate || 'No departure', hotel.boardBasis, hotel.stars ? `${hotel.stars}★` : null]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        </div>
                      </div>
                      <div className="cms-tariff-card__prices">
                        <div>
                          <em>Double /pp</em>
                          <strong>{money(double)}</strong>
                        </div>
                        <div>
                          <em>Package (2)</em>
                          <strong>{money(hotel.packagePrice ?? double * 2)}</strong>
                        </div>
                      </div>
                    </button>

                    {open ? (
                      <div className="cms-tariff-card__body">
                        <div className="cms-form-grid cms-form-grid--tariff">
                          <label className="cms-field cms-form-grid--full">
                            <span className="cms-field__label">Hotel name</span>
                            <input
                              value={hotel.name || ''}
                              onChange={(e) => updateHotel(index, { name: e.target.value })}
                              placeholder="e.g. Dorian Inn Hotel – Athens"
                            />
                          </label>
                          <label className="cms-field">
                            <span className="cms-field__label">Departure date</span>
                            <input
                              value={hotel.departureDate || ''}
                              onChange={(e) => updateHotel(index, { departureDate: e.target.value })}
                              placeholder="20/02 or 26/11"
                            />
                          </label>
                          <label className="cms-field">
                            <span className="cms-field__label">Board basis</span>
                            <input
                              value={hotel.boardBasis || ''}
                              onChange={(e) => updateHotel(index, { boardBasis: e.target.value })}
                              placeholder="Bed & Breakfast"
                            />
                          </label>
                          <label className="cms-field">
                            <span className="cms-field__label">Stars</span>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              step="1"
                              value={hotel.stars ?? ''}
                              onChange={(e) => updateHotel(index, { stars: Number(e.target.value) || 0 })}
                            />
                          </label>
                          <label className="cms-field">
                            <span className="cms-field__label">Nights</span>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={hotel.nights ?? ''}
                              onChange={(e) => updateHotel(index, { nights: Number(e.target.value) || 0 })}
                            />
                          </label>
                          <label className="cms-field">
                            <span className="cms-field__label">Room type</span>
                            <input
                              value={hotel.roomType || ''}
                              onChange={(e) => updateHotel(index, { roomType: e.target.value })}
                            />
                          </label>
                          <label className="cms-field cms-form-grid--full">
                            <span className="cms-field__label">Location / address</span>
                            <input
                              value={hotel.location || ''}
                              onChange={(e) => updateHotel(index, { location: e.target.value })}
                            />
                          </label>
                        </div>

                        <div className="cms-price-grid">
                          <p className="cms-price-grid__title">Per person tariffs (€)</p>
                          <div className="cms-price-grid__row">
                            <label className="cms-field cms-field--price cms-field--price-primary">
                              <span className="cms-field__label">Double /pp</span>
                              <div className="cms-field__affix">
                                <span className="cms-field__prefix" aria-hidden="true">
                                  €
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={hotel.prices?.double ?? ''}
                                  onChange={(e) =>
                                    updateHotel(index, { priceField: { key: 'double', value: e.target.value } })
                                  }
                                />
                              </div>
                              <span className="cms-field__hint">Main website “from” price source</span>
                            </label>
                            <label className="cms-field cms-field--price">
                              <span className="cms-field__label">Single /pp</span>
                              <div className="cms-field__affix">
                                <span className="cms-field__prefix" aria-hidden="true">
                                  €
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={hotel.prices?.single ?? ''}
                                  onChange={(e) =>
                                    updateHotel(index, { priceField: { key: 'single', value: e.target.value } })
                                  }
                                />
                              </div>
                            </label>
                            <label className="cms-field cms-field--price">
                              <span className="cms-field__label">Triple /pp</span>
                              <div className="cms-field__affix">
                                <span className="cms-field__prefix" aria-hidden="true">
                                  €
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={hotel.prices?.triple ?? ''}
                                  onChange={(e) =>
                                    updateHotel(index, { priceField: { key: 'triple', value: e.target.value } })
                                  }
                                />
                              </div>
                            </label>
                            <label className="cms-field cms-field--price">
                              <span className="cms-field__label">Child 1 /pp</span>
                              <div className="cms-field__affix">
                                <span className="cms-field__prefix" aria-hidden="true">
                                  €
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={hotel.prices?.child1 ?? ''}
                                  onChange={(e) =>
                                    updateHotel(index, { priceField: { key: 'child1', value: e.target.value } })
                                  }
                                />
                              </div>
                            </label>
                            <label className="cms-field cms-field--price">
                              <span className="cms-field__label">Child 2 /pp</span>
                              <div className="cms-field__affix">
                                <span className="cms-field__prefix" aria-hidden="true">
                                  €
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={hotel.prices?.child2 ?? ''}
                                  onChange={(e) =>
                                    updateHotel(index, { priceField: { key: 'child2', value: e.target.value } })
                                  }
                                />
                              </div>
                            </label>
                            <label className="cms-field cms-field--price">
                              <span className="cms-field__label">Package total (2 pax)</span>
                              <div className="cms-field__affix">
                                <span className="cms-field__prefix" aria-hidden="true">
                                  €
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={hotel.packagePrice ?? ''}
                                  onChange={(e) => updateHotel(index, { packagePrice: e.target.value })}
                                />
                              </div>
                              <span className="cms-field__hint">Auto = double × 2 when double changes</span>
                            </label>
                          </div>
                        </div>

                        <div style={{ marginTop: '0.85rem' }}>
                          <ImageUrlField
                            label="Hotel image"
                            value={hotel.image || ''}
                            onChange={(next) => updateHotel(index, { image: next })}
                            placeholder="https://…hotel.jpg  or  /images/hotels/…"
                            hint="Paste Google “Copy image address” or a local /images/… path. Preview shows below."
                          />
                        </div>

                        <div className="cms-tariff-card__actions">
                          <button
                            type="button"
                            className="cms-btn cms-btn--ghost"
                            onClick={() => duplicateHotelRow(index)}
                          >
                            <Copy size={15} />
                            Duplicate for another departure
                          </button>
                          <button
                            type="button"
                            className="cms-btn cms-btn--danger"
                            onClick={() => removeHotelRow(index)}
                          >
                            <Trash2 size={15} />
                            Remove option
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </article>
                )
              })
            )}
          </div>
        </section>
        ) : null}

        {activeSection === 'program' ? (
        <section className="cms-panel cms-panel--content">
          <div className="cms-panel__head">
            <div className="cms-panel__title-row">
              <span className="cms-panel__icon cms-panel__icon--navy" aria-hidden="true">
                <FileText size={18} strokeWidth={2.2} />
              </span>
              <div>
                <h2>Program & text</h2>
                <p className="cms-panel__lead" style={{ marginBottom: 0 }}>
                  Write content the way it appears on the package page — clear paragraphs and bullet lists.
                </p>
              </div>
            </div>
            <button type="button" className="cms-btn cms-btn--ghost" onClick={addProgramDay}>
              <Plus size={16} />
              Add day
            </button>
          </div>

          <div className="cms-content-stack">
            <article className="cms-content-block cms-content-block--story">
              <header className="cms-content-block__head">
                <span className="cms-content-block__icon cms-content-block__icon--story" aria-hidden="true">
                  <BookOpen size={16} strokeWidth={2.2} />
                </span>
                <div>
                  <h3>Package story</h3>
                  <p>Long description travellers read first on the package page.</p>
                </div>
              </header>
              <div className="cms-story-editor">
                <div className="cms-story-editor__toolbar" aria-hidden="true">
                  <span>Website copy</span>
                  <span>Shown on package detail</span>
                </div>
                <label className="cms-field">
                  <span className="visually-hidden">Long description</span>
                  <textarea
                    className="cms-textarea cms-textarea--story"
                    value={row.long_description || ''}
                    onChange={(e) => updateField('long_description', e.target.value)}
                    placeholder="Tell the full story of this trip — atmosphere, highlights, who it’s for…"
                    rows={8}
                  />
                </label>
              </div>
            </article>

            <article className="cms-content-block cms-content-block--program">
              <header className="cms-content-block__head">
                <span className="cms-content-block__icon cms-content-block__icon--program" aria-hidden="true">
                  <Map size={16} strokeWidth={2.2} />
                </span>
                <div>
                  <h3>Program</h3>
                  <p>Introduction and day-by-day itinerary for travellers.</p>
                </div>
              </header>
              <div className="cms-story-editor">
                <div className="cms-story-editor__toolbar" aria-hidden="true">
                  <span>Program intro</span>
                  <span>Opens the itinerary section</span>
                </div>
                <label className="cms-field">
                  <span className="visually-hidden">Program introduction</span>
                  <textarea
                    className="cms-textarea cms-textarea--story"
                    value={row.details?.program?.introduction || row.details?.program?.programNarrative || ''}
                    onChange={(e) =>
                      updateProgram({
                        introduction: e.target.value,
                        programNarrative: e.target.value
                      })
                    }
                    placeholder="Opening text for the program section…"
                    rows={6}
                  />
                </label>
              </div>

              <div className="cms-program-days">
                {programDays.length === 0 ? (
                  <div className="cms-program-empty">
                    <p>No day entries yet.</p>
                    <button type="button" className="cms-btn cms-btn--ghost" onClick={addProgramDay}>
                      <Plus size={15} />
                      Add Day 1
                    </button>
                  </div>
                ) : (
                  programDays.map((day, i) => {
                    const dayNum = day.key.replace(/\D/g, '') || i + 1
                    return (
                      <label key={day.key} className="cms-field cms-program-day">
                        <div className="cms-program-day__head">
                          <span className="cms-program-day__badge">Day {dayNum}</span>
                          <button
                            type="button"
                            className="cms-btn cms-btn--ghost"
                            onClick={() => removeProgramDay(day.key)}
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                        <textarea
                          className="cms-textarea"
                          value={day.text}
                          onChange={(e) => updateProgram({ [day.key]: e.target.value })}
                          placeholder={`What happens on day ${dayNum}…`}
                        />
                      </label>
                    )
                  })
                )}
              </div>
            </article>

            <div className="cms-include-grid">
              <article className="cms-content-block cms-content-block--included">
                <header className="cms-content-block__head">
                  <span className="cms-content-block__icon cms-content-block__icon--ok" aria-hidden="true">
                    <CheckCircle2 size={16} strokeWidth={2.2} />
                  </span>
                  <div>
                    <h3>Included</h3>
                    <p>One benefit per line — shown as a checklist on the site.</p>
                  </div>
                </header>
                <label className="cms-field">
                  <span className="visually-hidden">Included items</span>
                  <textarea
                    className="cms-textarea cms-textarea--list"
                    value={includedText}
                    onChange={(e) => setIncludedText(e.target.value)}
                    placeholder={'Round-trip flights\nHotel accommodation\nDaily breakfast'}
                  />
                </label>
              </article>

              <article className="cms-content-block cms-content-block--excluded">
                <header className="cms-content-block__head">
                  <span className="cms-content-block__icon cms-content-block__icon--no" aria-hidden="true">
                    <XCircle size={16} strokeWidth={2.2} />
                  </span>
                  <div>
                    <h3>Not included</h3>
                    <p>One item per line — extras travellers pay separately.</p>
                  </div>
                </header>
                <label className="cms-field">
                  <span className="visually-hidden">Not included items</span>
                  <textarea
                    className="cms-textarea cms-textarea--list"
                    value={notIncludedText}
                    onChange={(e) => setNotIncludedText(e.target.value)}
                    placeholder={'Travel insurance\nPersonal expenses'}
                  />
                </label>
              </article>
            </div>

            <article className="cms-content-block cms-content-block--policy">
              <header className="cms-content-block__head">
                <span className="cms-content-block__icon cms-content-block__icon--policy" aria-hidden="true">
                  <ShieldAlert size={16} strokeWidth={2.2} />
                </span>
                <div>
                  <h3>Cancellation policy</h3>
                  <p>Terms shown on the package page. Keep wording clear and accurate.</p>
                </div>
              </header>
              <label className="cms-field">
                <span className="visually-hidden">Cancellation policy</span>
                <textarea
                  className="cms-textarea cms-textarea--policy"
                  value={row.details?.cancellationPolicy || ''}
                  onChange={(e) => updateDetails({ cancellationPolicy: e.target.value })}
                  placeholder="Cancellation terms shown on the package page…"
                />
              </label>
            </article>
          </div>
        </section>
        ) : null}
      </div>
    </AdminLayout>
  )
}

export default PackageCmsDetail
