import { useMemo, useState } from 'react'
import { parseSpreadsheetFile } from '../utils/passengerImport/parseSpreadsheet'
import { applyColumnMapping, buildColumnMapping } from '../utils/passengerImport/mapPassengerColumns'
import { fillUnmappedColumns } from '../utils/passengerImport/fillUnmappedColumns'
import { mappingHasIdentityFields, previewRowsMissingNames } from '../utils/passengerImport/inferColumnsFromData'
import { normalizePassengerRows } from '../utils/passengerImport/normalizePassengerRow'
import { emptyPassengerRow } from '../utils/passengerImport/passengerFields'
import { cleanAndValidatePassengers, runAiColumnMapping } from '../utils/passengerImport/passengerAi'
import {
  DEFAULT_IMPORT_PROFILE_ID,
  getImportProfile,
  getProfilePreviewFields
} from '../utils/passengerImport/importProfiles'
import { bulkInsertPassengers, logPassengerImport } from '../api/passengersApi'

export function usePassengerImport(group, { onSuccess, onError } = {}) {
  const [step, setStep] = useState('profile')
  const [importProfileId, setImportProfileId] = useState(DEFAULT_IMPORT_PROFILE_ID)
  const [file, setFile] = useState(null)
  const [headers, setHeaders] = useState([])
  const [rawRows, setRawRows] = useState([])
  const [columnMapping, setColumnMapping] = useState({})
  const [previewRows, setPreviewRows] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const importProfile = useMemo(() => getImportProfile(importProfileId), [importProfileId])
  const profileFields = useMemo(() => getProfilePreviewFields(importProfileId), [importProfileId])

  const selectedCount = useMemo(
    () => previewRows.filter((row) => row._selected !== false).length,
    [previewRows]
  )

  const reset = () => {
    setStep('profile')
    setImportProfileId(DEFAULT_IMPORT_PROFILE_ID)
    setFile(null)
    setHeaders([])
    setRawRows([])
    setColumnMapping({})
    setPreviewRows([])
    setError('')
    setLoading(false)
    setAiLoading(false)
    setImporting(false)
    setDragOver(false)
  }

  const buildPreview = (mapping) => {
    let mapped = applyColumnMapping(rawRows, mapping)
    mapped = fillUnmappedColumns(mapped, rawRows, mapping)
    const normalized = normalizePassengerRows(mapped)
    const withIds = normalized.map((row) => ({
      ...emptyPassengerRow(),
      ...row,
      _id: crypto.randomUUID(),
      _selected: true
    }))
    const validated = cleanAndValidatePassengers(withIds, importProfileId)
    setPreviewRows(validated)
    if (previewRowsMissingNames(validated)) {
      setError('Some columns were not detected. Review the column mapping below, then continue.')
      setStep('mapping')
      return
    }
    setError('')
    setStep('review')
  }

  const handleFile = async (selected) => {
    if (!selected || !group?.id) return
    setError('')
    setLoading(true)
    setFile(selected)
    const parsed = await parseSpreadsheetFile(selected)
    setLoading(false)
    if (parsed.error) {
      setError(parsed.error)
      onError?.(parsed.error)
      return
    }
    setHeaders(parsed.headers)
    setRawRows(parsed.rows)
    const mapping = buildColumnMapping(parsed.headers, parsed.rows, profileFields)
    setColumnMapping(mapping)
    if (mappingHasIdentityFields(mapping)) {
      buildPreview(mapping)
    } else {
      setError('We could not detect name columns automatically. Please match your spreadsheet columns below.')
      setStep('mapping')
    }
  }

  const handleAiMapping = async () => {
    setAiLoading(true)
    const enhanced = await runAiColumnMapping(headers, columnMapping, rawRows[0] || null, profileFields)
    setColumnMapping(enhanced)
    setAiLoading(false)
  }

  const handleCleanValidate = () => {
    setPreviewRows(cleanAndValidatePassengers(previewRows, importProfileId))
  }

  const handleImport = async () => {
    if (!group?.id) return
    setImporting(true)
    setError('')
    const cleaned = cleanAndValidatePassengers(previewRows, importProfileId)
    const { data, error: insertError } = await bulkInsertPassengers(group.id, cleaned)
    if (insertError) {
      const message =
        insertError.message?.includes('passengers') || insertError.code === '42P01'
          ? 'Could not save passengers. Run the travel_groups migration in Supabase first.'
          : insertError.message
      setError(message)
      onError?.(message)
      setImporting(false)
      return
    }
    await logPassengerImport({
      groupId: group.id,
      fileName: file?.name || 'import',
      fileType: file?.name?.split('.').pop(),
      rowCount: previewRows.length,
      importedCount: data?.length || 0,
      columnMapping: { ...columnMapping, _importProfile: importProfileId },
      warnings: cleaned.flatMap((r) => r._warnings || [])
    })
    setImporting(false)
    reset()
    onSuccess?.(data)
  }

  const selectProfile = (profileId) => {
    setImportProfileId(profileId)
    setStep('upload')
    setError('')
  }

  const updateRow = (id, patch) => {
    setPreviewRows((prev) => prev.map((row) => (row._id === id ? { ...row, ...patch } : row)))
  }

  const removeRow = (id) => {
    setPreviewRows((prev) => prev.filter((row) => row._id !== id))
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setDragOver(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setDragOver(false)
    const dropped = event.dataTransfer?.files?.[0]
    if (dropped) handleFile(dropped)
  }

  return {
    step,
    setStep,
    importProfileId,
    importProfile,
    profileFields,
    selectProfile,
    file,
    rawRows,
    headers,
    columnMapping,
    setColumnMapping,
    previewRows,
    error,
    loading,
    aiLoading,
    importing,
    dragOver,
    selectedCount,
    reset,
    handleFile,
    buildPreview,
    handleAiMapping,
    handleCleanValidate,
    handleImport,
    updateRow,
    removeRow,
    handleDragOver,
    handleDragLeave,
    handleDrop
  }
}
