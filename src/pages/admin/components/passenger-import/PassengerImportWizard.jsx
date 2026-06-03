import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { FileUp, Sparkles, Upload, X } from 'lucide-react'
import { parseSpreadsheetFile } from '../../utils/passengerImport/parseSpreadsheet'
import { applyColumnMapping, mapPassengerColumns } from '../../utils/passengerImport/mapPassengerColumns'
import { normalizePassengerRows } from '../../utils/passengerImport/normalizePassengerRow'
import { emptyPassengerRow, PASSENGER_FIELD_LABELS } from '../../utils/passengerImport/passengerFields'
import { cleanAndValidatePassengers, runAiColumnMapping } from '../../utils/passengerImport/passengerAi'
import { bulkInsertPassengers, logPassengerImport } from '../../api/passengersApi'
import ImportPreviewTable from './ImportPreviewTable'

const STEPS = ['upload', 'mapping', 'review', 'done']

function PassengerImportWizard({ open, group, onClose, onImported }) {
  const [step, setStep] = useState('upload')
  const [file, setFile] = useState(null)
  const [headers, setHeaders] = useState([])
  const [rawRows, setRawRows] = useState([])
  const [columnMapping, setColumnMapping] = useState({})
  const [previewRows, setPreviewRows] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [importing, setImporting] = useState(false)

  const selectedCount = useMemo(
    () => previewRows.filter((row) => row._selected !== false).length,
    [previewRows]
  )

  const reset = () => {
    setStep('upload')
    setFile(null)
    setHeaders([])
    setRawRows([])
    setColumnMapping({})
    setPreviewRows([])
    setError('')
    setLoading(false)
    setAiLoading(false)
    setImporting(false)
  }

  const handleClose = () => {
    reset()
    onClose?.()
  }

  const handleFile = async (selected) => {
    setError('')
    setLoading(true)
    setFile(selected)
    const parsed = await parseSpreadsheetFile(selected)
    setLoading(false)
    if (parsed.error) {
      setError(parsed.error)
      return
    }
    setHeaders(parsed.headers)
    setRawRows(parsed.rows)
    const mapping = mapPassengerColumns(parsed.headers)
    setColumnMapping(mapping)
    setStep('mapping')
  }

  const buildPreview = (mapping) => {
    const mapped = applyColumnMapping(rawRows, mapping)
    const normalized = normalizePassengerRows(mapped)
    const withIds = normalized.map((row) => ({
      ...emptyPassengerRow(),
      ...row,
      _id: crypto.randomUUID(),
      _selected: true
    }))
    setPreviewRows(cleanAndValidatePassengers(withIds))
    setStep('review')
  }

  const handleAiMapping = async () => {
    setAiLoading(true)
    const enhanced = await runAiColumnMapping(headers, columnMapping)
    setColumnMapping(enhanced)
    setAiLoading(false)
  }

  const handleCleanValidate = () => {
    setPreviewRows(cleanAndValidatePassengers(previewRows))
  }

  const handleImport = async () => {
    setImporting(true)
    setError('')
    const cleaned = cleanAndValidatePassengers(previewRows)
    const { data, error: insertError } = await bulkInsertPassengers(group.id, cleaned)
    if (insertError) {
      setError(insertError.message)
      setImporting(false)
      return
    }
    await logPassengerImport({
      groupId: group.id,
      fileName: file?.name || 'import',
      fileType: file?.name?.split('.').pop(),
      rowCount: previewRows.length,
      importedCount: data?.length || 0,
      columnMapping,
      warnings: cleaned.flatMap((r) => r._warnings || [])
    })
    setStep('done')
    setImporting(false)
    onImported?.(data)
  }

  const updateRow = (id, patch) => {
    setPreviewRows((prev) => prev.map((row) => (row._id === id ? { ...row, ...patch } : row)))
  }

  const removeRow = (id) => {
    setPreviewRows((prev) => prev.filter((row) => row._id !== id))
  }

  if (!open || !group) return null

  return createPortal(
    <div className="crm-modal-backdrop crm-modal-backdrop--premium" onClick={handleClose} role="presentation">
      <div
        className="crm-modal crm-modal--lead crm-modal--passenger-import"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="passenger-import-title"
      >
        <header className="crm-modal__hero crm-modal__hero--confirm">
          <div className="crm-modal__hero-text">
            <p className="crm-modal__eyebrow crm-modal__eyebrow--confirm">Passenger import</p>
            <h3 id="passenger-import-title">Import passengers</h3>
            <p className="crm-modal__subtitle">
              {group.group_name} · Upload Excel or CSV — columns are detected automatically.
            </p>
          </div>
          <button type="button" className="crm-modal__close" onClick={handleClose} aria-label="Close">
            <X size={20} aria-hidden />
          </button>
        </header>

        <div className="crm-modal__body crm-passenger-import__body">
          {error ? <div className="crm-form-error" role="alert">{error}</div> : null}

          {step === 'upload' ? (
            <label className="crm-passenger-import__dropzone">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFile(f)
                }}
              />
              <Upload size={32} aria-hidden />
              <strong>Drop file or click to upload</strong>
              <span>.xlsx, .xls, or .csv · max 8 MB</span>
              {loading ? <span className="crm-muted">Reading file…</span> : null}
            </label>
          ) : null}

          {step === 'mapping' ? (
            <div className="crm-passenger-import__mapping">
              <p className="crm-passenger-import__detected">
                <FileUp size={18} aria-hidden />
                {rawRows.length} rows detected · {file?.name}
              </p>
              <div className="crm-passenger-import__mapping-grid">
                {headers.map((header) => (
                  <label key={header} className="crm-passenger-import__map-row">
                    <span className="crm-passenger-import__source-col">{header}</span>
                    <select
                      value={columnMapping[header] || ''}
                      onChange={(e) =>
                        setColumnMapping((prev) => ({
                          ...prev,
                          [header]: e.target.value || undefined
                        }))
                      }
                    >
                      <option value="">— Ignore —</option>
                      {Object.entries(PASSENGER_FIELD_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              <div className="crm-passenger-import__toolbar">
                <button type="button" className="crm-btn crm-btn--dark" onClick={handleAiMapping} disabled={aiLoading}>
                  <Sparkles size={16} aria-hidden />
                  {aiLoading ? 'Enhancing mapping…' : 'Enhance mapping with AI'}
                </button>
                <button type="button" className="crm-btn crm-btn-primary" onClick={() => buildPreview(columnMapping)}>
                  Continue to preview
                </button>
              </div>
            </div>
          ) : null}

          {step === 'review' ? (
            <div className="crm-passenger-import__review">
              <div className="crm-passenger-import__summary">
                <strong>✓ {selectedCount} passengers ready to import</strong>
                <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark crm-btn--small" onClick={handleCleanValidate}>
                  <Sparkles size={14} aria-hidden />
                  Clean &amp; validate data
                </button>
              </div>
              <ImportPreviewTable rows={previewRows} onChange={updateRow} onRemove={removeRow} />
              <div className="crm-passenger-import__toolbar">
                <button type="button" className="crm-btn crm-btn--dark" onClick={() => setStep('mapping')}>
                  Back
                </button>
                <button
                  type="button"
                  className="crm-btn crm-btn-primary"
                  onClick={handleImport}
                  disabled={importing || selectedCount === 0}
                >
                  {importing ? 'Importing…' : `Import ${selectedCount} passengers`}
                </button>
              </div>
            </div>
          ) : null}

          {step === 'done' ? (
            <div className="crm-passenger-import__done">
              <p className="crm-passenger-import__done-title">Import complete</p>
              <p className="crm-muted">{selectedCount} passengers added to {group.group_name}.</p>
              <button type="button" className="crm-btn crm-btn-primary" onClick={handleClose}>
                Done
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default PassengerImportWizard
