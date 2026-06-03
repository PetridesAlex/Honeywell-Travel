import { FileUp, Sparkles, Upload } from 'lucide-react'
import { PASSENGER_FIELD_LABELS } from '../../utils/passengerImport/passengerFields'
import { formatProfileFieldsList } from '../../utils/passengerImport/importProfiles'
import { usePassengerImport } from '../../hooks/usePassengerImport'
import ImportPreviewTable from './ImportPreviewTable'
import ImportProfileSelector from './ImportProfileSelector'

function PassengerImportPanel({ group, expanded, onToggle, onSuccess, onError }) {
  const imp = usePassengerImport(group, { onSuccess, onError })

  if (!group?.id) return null

  const mappingFieldOptions = imp.profileFields.map((key) => [key, PASSENGER_FIELD_LABELS[key]])

  return (
    <section className={`crm-passenger-import-panel${expanded ? ' crm-passenger-import-panel--open' : ''}`}>
      <div className="crm-passenger-import-panel__head">
        <div>
          <p className="crm-passenger-import-panel__eyebrow">Passenger import</p>
          <h3 className="crm-passenger-import-panel__title">Import passengers</h3>
          <p className="crm-passenger-import-panel__hint">
            Choose your list type, then upload Excel or CSV. Columns match the import you selected.
          </p>
        </div>
        <button
          type="button"
          className="crm-btn crm-btn-primary crm-passenger-import-panel__toggle"
          onClick={onToggle}
          aria-expanded={expanded}
        >
          <Upload size={16} aria-hidden />
          {expanded ? 'Hide import' : 'Import passengers'}
        </button>
      </div>

      {expanded ? (
        <div className="crm-passenger-import-panel__body">
          {imp.error ? (
            <div className="crm-form-error" role="alert">
              {imp.error}
            </div>
          ) : null}

          {imp.step === 'profile' ? (
            <ImportProfileSelector
              value={imp.importProfileId}
              onSelect={imp.selectProfile}
              onContinue={() => imp.setStep('upload')}
            />
          ) : null}

          {imp.step === 'upload' ? (
            <>
              <div className="crm-import-profile-active">
                <div>
                  <span className="crm-import-profile-active__label">Import type</span>
                  <strong>{imp.importProfile.label}</strong>
                  <p className="crm-muted">{formatProfileFieldsList(imp.importProfileId)}</p>
                </div>
                <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark crm-btn--small" onClick={() => imp.setStep('profile')}>
                  Change type
                </button>
              </div>
              <div
                className={`crm-passenger-import__dropzone${imp.dragOver ? ' crm-passenger-import__dropzone--active' : ''}`}
                onDragOver={imp.handleDragOver}
                onDragLeave={imp.handleDragLeave}
                onDrop={imp.handleDrop}
              >
                <input
                  id="passenger-import-file"
                  type="file"
                  accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) imp.handleFile(f)
                    e.target.value = ''
                  }}
                />
                <Upload size={36} aria-hidden />
                <strong>Drag &amp; drop your {imp.importProfile.shortLabel.toLowerCase()} file here</strong>
                <span>or click to browse</span>
                <span className="crm-passenger-import__formats">Supports .xlsx, .xls, and .csv · max 8 MB</span>
                <label htmlFor="passenger-import-file" className="crm-btn crm-btn--dark crm-passenger-import__browse">
                  Choose file
                </label>
                {imp.loading ? <span className="crm-muted">Reading file…</span> : null}
              </div>
            </>
          ) : null}

          {imp.step === 'mapping' ? (
            <div className="crm-passenger-import__mapping">
              <div className="crm-import-profile-active crm-import-profile-active--compact">
                <strong>{imp.importProfile.label}</strong>
                <button type="button" className="crm-link-btn" onClick={() => imp.setStep('profile')}>
                  Change type
                </button>
              </div>
              <p className="crm-passenger-import__detected">
                <FileUp size={18} aria-hidden />
                {imp.rawRows?.length || 0} rows detected · {imp.file?.name}
              </p>
              <p className="crm-passenger-import__profile-fields">
                Map your columns to: <em>{formatProfileFieldsList(imp.importProfileId)}</em>
              </p>
              <p className="crm-passenger-import__mapped-count">
                {Object.keys(imp.columnMapping).length} of {imp.headers.length} columns mapped
              </p>
              <div className="crm-passenger-import__mapping-grid">
                {imp.headers.map((header) => (
                  <label key={header} className="crm-passenger-import__map-row">
                    <span className="crm-passenger-import__source-col">
                      {header}
                      <em className="crm-passenger-import__sample">
                        e.g. {imp.rawRows[0]?.[header] || '—'}
                      </em>
                    </span>
                    <select
                      value={imp.columnMapping[header] || ''}
                      onChange={(e) =>
                        imp.setColumnMapping((prev) => ({
                          ...prev,
                          [header]: e.target.value || undefined
                        }))
                      }
                    >
                      <option value="">— Ignore —</option>
                      {mappingFieldOptions.map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              <div className="crm-passenger-import__toolbar">
                <button type="button" className="crm-btn crm-btn--dark" onClick={() => imp.setStep('upload')}>
                  Upload different file
                </button>
                <button type="button" className="crm-btn crm-btn--dark" onClick={imp.handleAiMapping} disabled={imp.aiLoading}>
                  <Sparkles size={16} aria-hidden />
                  {imp.aiLoading ? 'Enhancing…' : 'Enhance mapping with AI'}
                </button>
                <button
                  type="button"
                  className="crm-btn crm-btn-primary"
                  onClick={() => imp.buildPreview(imp.columnMapping)}
                >
                  Continue to preview
                </button>
              </div>
            </div>
          ) : null}

          {imp.step === 'review' ? (
            <div className="crm-passenger-import__review">
              <div className="crm-import-profile-active crm-import-profile-active--compact">
                <strong>{imp.importProfile.label}</strong>
                <span className="crm-muted">{imp.file?.name}</span>
              </div>
              <div className="crm-passenger-import__summary">
                <strong>✓ {imp.selectedCount} passengers ready to import</strong>
                <button
                  type="button"
                  className="crm-btn crm-btn-ghost crm-btn--dark crm-btn--small"
                  onClick={imp.handleCleanValidate}
                >
                  <Sparkles size={14} aria-hidden />
                  Clean &amp; validate
                </button>
              </div>
              <ImportPreviewTable
                rows={imp.previewRows}
                onChange={imp.updateRow}
                onRemove={imp.removeRow}
                profileId={imp.importProfileId}
              />
              <div className="crm-passenger-import__toolbar">
                <button type="button" className="crm-btn crm-btn--dark" onClick={() => imp.setStep('mapping')}>
                  Edit column mapping
                </button>
                <button type="button" className="crm-btn crm-btn--dark" onClick={imp.reset}>
                  Start over
                </button>
                <button
                  type="button"
                  className="crm-btn crm-btn-primary"
                  onClick={imp.handleImport}
                  disabled={imp.importing || imp.selectedCount === 0}
                >
                  {imp.importing ? 'Importing…' : `Import ${imp.selectedCount} passengers`}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

export default PassengerImportPanel
