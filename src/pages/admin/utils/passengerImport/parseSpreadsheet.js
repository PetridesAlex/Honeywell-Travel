import * as XLSX from 'xlsx'
import { detectHeaderRowIndex } from './inferColumnsFromData'

const MAX_FILE_BYTES = 8 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['.xlsx', '.xls', '.csv']

export function validateImportFile(file) {
  if (!file) return { ok: false, error: 'No file selected.' }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, error: 'File is too large. Maximum size is 8 MB.' }
  }
  const name = (file.name || '').toLowerCase()
  const ext = ALLOWED_EXTENSIONS.find((item) => name.endsWith(item))
  if (!ext) {
    return { ok: false, error: 'Unsupported file type. Use .xlsx, .xls, or .csv.' }
  }
  return { ok: true, extension: ext.replace('.', '') }
}

function sheetToMatrix(workbook) {
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return { headers: [], rows: [] }
  const sheet = workbook.Sheets[sheetName]
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false })
  if (!matrix.length) return { headers: [], rows: [] }

  const headerIndex = detectHeaderRowIndex(matrix)

  const headers = (matrix[headerIndex] || []).map((cell, index) => {
    const label = String(cell || '').trim()
    return label || `Column ${index + 1}`
  })

  const rows = matrix
    .slice(headerIndex + 1)
    .map((row) => {
      const record = {}
      headers.forEach((header, index) => {
        record[header] = String(row[index] ?? '').trim()
      })
      return record
    })
    .filter((row) => Object.values(row).some((value) => String(value).trim()))

  return { headers, rows, sheetName }
}

export async function parseSpreadsheetFile(file) {
  const validation = validateImportFile(file)
  if (!validation.ok) {
    return { error: validation.error, headers: [], rows: [] }
  }

  try {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: false })
    const { headers, rows, sheetName } = sheetToMatrix(workbook)
    if (!rows.length) {
      return { error: 'No passenger rows found in this file.', headers, rows: [] }
    }
    return {
      error: null,
      headers,
      rows,
      sheetName,
      fileType: validation.extension
    }
  } catch (err) {
    return {
      error: err?.message || 'Could not read this file.',
      headers: [],
      rows: []
    }
  }
}
