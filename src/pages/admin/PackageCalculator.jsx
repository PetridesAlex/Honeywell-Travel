import { useCallback, useEffect, useMemo, useState } from 'react'
import { Calculator, FilePlus, FolderOpen, MapPin, Save, Sparkles, Trash2, UserRound, Users } from 'lucide-react'
import AdminLayout from './components/AdminLayout'
import PackageCalculatorSheet from './components/PackageCalculatorSheet'
import {
  PACKAGE_QUOTES_SETUP_HINT,
  deletePackageQuote,
  fetchPackageQuote,
  fetchPackageQuotes,
  savePackageQuote
} from './api/packageQuotesApi'
import { EMPTY_PACKAGE_QUOTE, TRIP_TYPE_OPTIONS } from './constants'
import { CURRENCY_OPTIONS } from './utils/financials'
import {
  createDefaultLines,
  createLocalLine,
  formatCalcMoney,
  formatMarginPercent,
  perPersonTotals,
  sellFromNetWithMargin,
  summarizePackageLines
} from './utils/packageCalculator'
import './Leads.css'

const LOCAL_STORAGE_KEY = 'hw-package-calculator-draft'

function linesFromQuote(quote) {
  if (!quote?.lines?.length) return createDefaultLines()
  return quote.lines.map((line) => ({
    localId: crypto.randomUUID(),
    id: line.id,
    service_name: line.service_name || '',
    category: line.category || 'Other',
    supplier: line.supplier || '',
    quantity: line.quantity ?? 1,
    net_price: line.net_price ?? '',
    sell_price: line.sell_price ?? '',
    notes: line.notes || ''
  }))
}

function loadLocalDraft() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveLocalDraft(quote, lines) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ quote, lines, savedAt: new Date().toISOString() }))
}

function PackageCalculator() {
  const [quotes, setQuotes] = useState([])
  const [quote, setQuote] = useState({ ...EMPTY_PACKAGE_QUOTE })
  const [lines, setLines] = useState(() => createDefaultLines())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dbReady, setDbReady] = useState(true)
  const [schemaMissing, setSchemaMissing] = useState(false)

  const totals = useMemo(() => summarizePackageLines(lines, quote.currency), [lines, quote.currency])
  const perPerson = useMemo(() => perPersonTotals(totals, quote.pax), [totals, quote.pax])

  const loadQuotes = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: fetchError, schemaMissing: missing } = await fetchPackageQuotes()
    if (fetchError) {
      setDbReady(false)
      setSchemaMissing(Boolean(missing))
      setQuotes([])
      const draft = loadLocalDraft()
      if (draft) {
        setQuote({ ...EMPTY_PACKAGE_QUOTE, ...draft.quote })
        setLines(draft.lines?.length ? draft.lines : createDefaultLines())
      }
      setError(fetchError.message)
    } else {
      setDbReady(true)
      setSchemaMissing(false)
      setQuotes(data)
      setError('')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadQuotes()
  }, [loadQuotes])

  useEffect(() => {
    if (!dbReady) saveLocalDraft(quote, lines)
  }, [quote, lines, dbReady])

  const handleQuoteField = (key, value) => {
    setQuote((prev) => ({ ...prev, [key]: value }))
  }

  const handleLineChange = (lineKey, field, value) => {
    setLines((prev) =>
      prev.map((line) => {
        const key = line.localId || line.id
        if (key !== lineKey) return line
        return { ...line, [field]: value }
      })
    )
  }

  const handleAddLine = () => {
    setLines((prev) => [...prev, createLocalLine()])
  }

  const handleRemoveLine = (lineKey) => {
    setLines((prev) => {
      const next = prev.filter((line) => (line.localId || line.id) !== lineKey)
      return next.length ? next : [createLocalLine()]
    })
  }

  const handleApplyTargetMargin = () => {
    const pct = Number(quote.target_margin_percent) || 0
    setLines((prev) =>
      prev.map((line) => {
        const net = line.net_price
        if (!net && net !== 0) return line
        const sell = sellFromNetWithMargin(net, pct)
        return { ...line, sell_price: sell ? sell.toFixed(2) : '' }
      })
    )
  }

  const handleNew = () => {
    setQuote({ ...EMPTY_PACKAGE_QUOTE })
    setLines(createDefaultLines())
    setError('')
  }

  const handleOpenQuote = async (id) => {
    setLoading(true)
    setError('')
    const { data, error: fetchError } = await fetchPackageQuote(id)
    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }
    setQuote({
      id: data.id,
      title: data.title,
      client_name: data.client_name || '',
      destination: data.destination || '',
      trip_type: data.trip_type || 'Package Holiday',
      pax: data.pax ?? 2,
      currency: data.currency || 'EUR',
      target_margin_percent: data.target_margin_percent ?? 15,
      notes: data.notes || ''
    })
    setLines(linesFromQuote(data))
    setLoading(false)
  }

  const handleSave = async () => {
    if (!quote.title?.trim()) {
      setError('Package title is required.')
      return
    }
    setSaving(true)
    setError('')
    const payload = { ...quote, title: quote.title.trim() }
    const { data, error: saveError } = await savePackageQuote(payload, lines)
    if (saveError) {
      if (!dbReady) {
        saveLocalDraft(quote, lines)
        setError(`${saveError.message} Draft saved in this browser only.`)
      } else {
        setError(saveError.message)
      }
      setSaving(false)
      return
    }
    setQuote({
      id: data.id,
      title: data.title,
      client_name: data.client_name || '',
      destination: data.destination || '',
      trip_type: data.trip_type || 'Package Holiday',
      pax: data.pax ?? 2,
      currency: data.currency || 'EUR',
      target_margin_percent: data.target_margin_percent ?? 15,
      notes: data.notes || ''
    })
    setLines(linesFromQuote(data))
    await loadQuotes()
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!quote.id) {
      handleNew()
      return
    }
    if (!window.confirm(`Delete "${quote.title}"?`)) return
    const { error: deleteError } = await deletePackageQuote(quote.id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    handleNew()
    await loadQuotes()
  }

  return (
    <AdminLayout
      title="Package Calculator"
      subtitle="Build travel packages like a spreadsheet — add services, net cost, sell price, and margin."
      actions={
        <>
          <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={handleNew}>
            <FilePlus size={16} aria-hidden />
            New
          </button>
          {quote.id ? (
            <button type="button" className="crm-btn crm-btn-danger" onClick={handleDelete}>
              <Trash2 size={16} aria-hidden />
              Delete
            </button>
          ) : null}
          <button type="button" className="crm-btn crm-btn-primary crm-btn--corporate-header" onClick={handleSave} disabled={saving}>
            <Save size={16} aria-hidden />
            {saving ? 'Saving…' : 'Save package'}
          </button>
        </>
      }
    >
      <section className="crm-workspace crm-workspace--package-calc">
        {!dbReady || error ? (
          <div className="crm-pkg-notice" role="alert">
            {schemaMissing ? (
              <>
                <p>
                  <strong>Cloud save needs a one-time database setup.</strong> Your worksheet still works locally — drafts
                  are saved in this browser until Supabase is ready.
                </p>
                <ol className="crm-pkg-notice__steps">
                  <li>
                    Open your <strong>Supabase Dashboard</strong> → <strong>SQL Editor</strong> → <strong>New query</strong>
                  </li>
                  <li>
                    Copy all of <code>supabase/fix_package_quotes.sql</code> from this project and paste it into the editor
                  </li>
                  <li>
                    Click <strong>Run</strong>, then return here and click <strong>Check again</strong>
                  </li>
                </ol>
                <p className="crm-pkg-notice__hint">{PACKAGE_QUOTES_SETUP_HINT}</p>
                <button type="button" className="crm-btn crm-btn-primary crm-btn--small" onClick={loadQuotes}>
                  Check again
                </button>
              </>
            ) : !dbReady ? (
              <p>
                <strong>Local mode.</strong> Packages are stored in this browser only. Fix the connection or database setup,
                then use Check again.
              </p>
            ) : null}
            {error && !schemaMissing ? <p className="crm-pkg-notice__sub">{error}</p> : null}
            {error && schemaMissing ? <p className="crm-pkg-notice__sub">{error}</p> : null}
            {!schemaMissing && !dbReady ? (
              <button type="button" className="crm-btn crm-btn--dark crm-btn--small" onClick={loadQuotes}>
                Check again
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="crm-pkg-layout">
          <aside className="crm-pkg-sidebar">
            <div className="crm-pkg-sidebar__head">
              <span className="crm-pkg-sidebar__icon" aria-hidden="true">
                <FolderOpen size={20} strokeWidth={2} />
              </span>
              <div>
                <h3 className="crm-pkg-sidebar__title">Saved packages</h3>
                <p className="crm-pkg-sidebar__subtitle">Your pricing worksheets &amp; quotes</p>
              </div>
              <span className="crm-pkg-sidebar__count">{quotes.length}</span>
            </div>

            {!dbReady ? (
              <div className="crm-pkg-sidebar__status crm-pkg-sidebar__status--local">
                <Sparkles size={14} aria-hidden />
                Local drafts only
              </div>
            ) : (
              <div className="crm-pkg-sidebar__status crm-pkg-sidebar__status--cloud">
                Cloud save enabled
              </div>
            )}

            <div className="crm-pkg-sidebar__current">
              <p className="crm-pkg-sidebar__section-label">Current worksheet</p>
              <article className="crm-pkg-sidebar__draft">
                <strong>{quote.title?.trim() || 'Untitled package'}</strong>
                <span>{quote.client_name || quote.destination || 'Add client & destination'}</span>
                <div className="crm-pkg-sidebar__draft-stats">
                  <span>{formatCalcMoney(totals.totalSell, quote.currency)} sell</span>
                  <span>{formatMarginPercent(totals.marginPercent)} margin</span>
                </div>
              </article>
              <button type="button" className="crm-btn crm-btn-primary crm-btn--sm crm-pkg-sidebar__new" onClick={handleNew}>
                <FilePlus size={14} aria-hidden />
                New package
              </button>
            </div>

            <div className="crm-pkg-sidebar__list-wrap">
              <p className="crm-pkg-sidebar__section-label">Library</p>
              {loading ? <p className="crm-pkg-sidebar__hint">Loading saved packages…</p> : null}
              {!loading && quotes.length === 0 ? (
                <div className="crm-pkg-sidebar__empty">
                  <div className="crm-pkg-sidebar__empty-icons" aria-hidden="true">
                    <span>HT</span>
                    <span>FL</span>
                    <span>TR</span>
                  </div>
                  <h4>No saved packages yet</h4>
                  <p>Build your first worksheet on the right, then click <strong>Save package</strong>.</p>
                  <ol className="crm-pkg-sidebar__steps">
                    <li>Add package title &amp; client</li>
                    <li>Enter services with net &amp; sell</li>
                    <li>Save to your library</li>
                  </ol>
                </div>
              ) : null}
              <ul className="crm-pkg-quote-list">
                {quotes.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`crm-pkg-quote-item${quote.id === item.id ? ' crm-pkg-quote-item--active' : ''}`}
                      onClick={() => handleOpenQuote(item.id)}
                    >
                      <span className="crm-pkg-quote-item__badge">{item.currency || 'EUR'}</span>
                      <strong>{item.title}</strong>
                      <span>{item.client_name || item.destination || 'No client'}</span>
                      <span className="crm-pkg-quote-item__meta">
                        {item.trip_type || 'Package'} · {item.pax || 2} pax
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <footer className="crm-pkg-sidebar__foot">
              <p>
                <strong>Tip:</strong> Set target margin % then use <em>Apply margin</em> on the worksheet to fill sell prices from net.
              </p>
            </footer>
          </aside>

          <div className="crm-pkg-main">
            <div className="crm-pkg-hero">
              <div className="crm-pkg-hero__top">
                <div className="crm-pkg-hero__intro">
                  <span className="crm-pkg-hero__icon" aria-hidden="true">
                    <Calculator size={26} strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="crm-pkg-hero__eyebrow">Honeywell Travel · Pricing worksheet</p>
                    <h2 className="crm-pkg-hero__title">Package calculator</h2>
                    <p className="crm-pkg-hero__text">
                      Add services below — net cost, sell price, and margin update live as you type.
                    </p>
                  </div>
                </div>
              </div>

              <div className="crm-pkg-hero__metrics">
                <article className="crm-pkg-metric">
                  <span>Total net</span>
                  <strong>{formatCalcMoney(totals.totalNet, quote.currency)}</strong>
                </article>
                <article className="crm-pkg-metric crm-pkg-metric--sell">
                  <span>Total sell</span>
                  <strong>{formatCalcMoney(totals.totalSell, quote.currency)}</strong>
                </article>
                <article className="crm-pkg-metric crm-pkg-metric--margin">
                  <span>Margin</span>
                  <strong>{formatCalcMoney(totals.totalMargin, quote.currency)}</strong>
                  <em>{formatMarginPercent(totals.marginPercent)}</em>
                </article>
                <article className="crm-pkg-metric">
                  <span>Per person · {quote.pax || 1} pax</span>
                  <strong>{formatCalcMoney(perPerson.sellPerPerson, quote.currency)}</strong>
                  <em>Net {formatCalcMoney(perPerson.netPerPerson, quote.currency)}</em>
                </article>
              </div>
            </div>

            <div className="crm-pkg-meta">
              <header className="crm-pkg-meta__head">
                <div>
                  <h3>Package details</h3>
                  <p>Client, destination, and pricing defaults for this worksheet.</p>
                </div>
              </header>

              <div className="crm-pkg-meta__body">
                <div className="crm-pkg-meta__section">
                  <p className="crm-pkg-meta__section-label">Trip information</p>
                  <div className="crm-pkg-meta__grid">
                    <label className="crm-pkg-meta__field crm-pkg-meta__field--wide">
                      <span className="crm-pkg-meta__label">Package title *</span>
                      <input
                        className="crm-pkg-meta__input"
                        value={quote.title}
                        onChange={(e) => handleQuoteField('title', e.target.value)}
                        placeholder="e.g. Cyprus 7 nights — Smith family"
                      />
                    </label>
                    <label className="crm-pkg-meta__field">
                      <span className="crm-pkg-meta__label">
                        <UserRound size={13} aria-hidden />
                        Client name
                      </span>
                      <input
                        className="crm-pkg-meta__input"
                        value={quote.client_name}
                        onChange={(e) => handleQuoteField('client_name', e.target.value)}
                        placeholder="Client or group name"
                      />
                    </label>
                    <label className="crm-pkg-meta__field">
                      <span className="crm-pkg-meta__label">
                        <MapPin size={13} aria-hidden />
                        Destination
                      </span>
                      <input
                        className="crm-pkg-meta__input"
                        value={quote.destination}
                        onChange={(e) => handleQuoteField('destination', e.target.value)}
                        placeholder="e.g. Paphos, Cyprus"
                      />
                    </label>
                    <label className="crm-pkg-meta__field crm-pkg-meta__field--wide">
                      <span className="crm-pkg-meta__label">Trip type</span>
                      <select
                        className="crm-pkg-meta__input crm-pkg-meta__select"
                        value={quote.trip_type}
                        onChange={(e) => handleQuoteField('trip_type', e.target.value)}
                      >
                        {TRIP_TYPE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <div className="crm-pkg-meta__section crm-pkg-meta__section--pricing">
                  <p className="crm-pkg-meta__section-label">Pricing settings</p>
                  <div className="crm-pkg-meta__pricing-grid">
                    <label className="crm-pkg-meta__field crm-pkg-meta__field--compact">
                      <span className="crm-pkg-meta__label">
                        <Users size={13} aria-hidden />
                        Pax
                      </span>
                      <input
                        className="crm-pkg-meta__input"
                        type="number"
                        min="1"
                        value={quote.pax}
                        onChange={(e) => handleQuoteField('pax', e.target.value)}
                      />
                    </label>
                    <label className="crm-pkg-meta__field crm-pkg-meta__field--compact">
                      <span className="crm-pkg-meta__label">Currency</span>
                      <select
                        className="crm-pkg-meta__input crm-pkg-meta__select"
                        value={quote.currency}
                        onChange={(e) => handleQuoteField('currency', e.target.value)}
                      >
                        {CURRENCY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </label>
                    <label className="crm-pkg-meta__field crm-pkg-meta__field--compact crm-pkg-meta__field--highlight">
                      <span className="crm-pkg-meta__label">Target margin %</span>
                      <input
                        className="crm-pkg-meta__input"
                        type="number"
                        min="0"
                        max="99"
                        step="0.5"
                        value={quote.target_margin_percent}
                        onChange={(e) => handleQuoteField('target_margin_percent', e.target.value)}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <PackageCalculatorSheet
              lines={lines}
              currency={quote.currency}
              targetMarginPercent={quote.target_margin_percent}
              onLineChange={handleLineChange}
              onAddLine={handleAddLine}
              onRemoveLine={handleRemoveLine}
              onApplyTargetMargin={handleApplyTargetMargin}
            />
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}

export default PackageCalculator
