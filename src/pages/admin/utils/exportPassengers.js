import * as XLSX from 'xlsx'

function escapeCsv(value) {
  const text = String(value ?? '')
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

function passengerDisplayName(p) {
  return [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || p.full_name || '—'
}

function downloadCsv(filename, headers, rows) {
  const csv = [headers.join(','), ...rows.map((row) => row.map(escapeCsv).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function downloadXlsx(filename, headers, rows) {
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Passengers')
  XLSX.writeFile(workbook, filename)
}

function downloadPrintHtml(title, group, headers, rows) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title>
  <style>body{font-family:Inter,Segoe UI,sans-serif;padding:24px;color:#0f172a}
  h1{font-size:1.25rem;margin:0 0 4px}p{margin:0 0 16px;color:#64748b;font-size:0.9rem}
  table{width:100%;border-collapse:collapse;font-size:0.82rem}
  th,td{border:1px solid #e2e8f0;padding:8px 10px;text-align:left}
  th{background:#f8fafc}</style></head><body>
  <h1>${title}</h1>
  <p>${group.group_name || 'Group'} · ${group.destination || '—'} · Departure ${group.departure_date || '—'}</p>
  <table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
  <tbody>${rows.map((row) => `<tr>${row.map((c) => `<td>${String(c ?? '')}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></body></html>`
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
}

const BASE_HEADERS = [
  'First name',
  'Surname',
  'Full name',
  'Category',
  'Passport no.',
  'ID',
  'Passport issue',
  'Passport expiry',
  'Date of birth',
  'Nationality',
  'Gender',
  'Contact number',
  'Email',
  'Room',
  'Cabin',
  'Emergency contact',
  'Notes'
]

function baseRows(passengers) {
  return passengers.map((p) => [
    p.first_name,
    p.last_name,
    p.full_name,
    p.category,
    p.passport_number,
    p.national_id,
    p.date_of_issue,
    p.passport_expiry,
    p.date_of_birth,
    p.nationality,
    p.gender,
    p.phone,
    p.email,
    p.room_number,
    p.cabin_number,
    p.emergency_contact,
    p.notes
  ])
}

export function exportPassengerManifest(passengers, group, format = 'csv') {
  const slug = (group.group_name || 'group').replace(/\s+/g, '-').toLowerCase()
  const rows = baseRows(passengers)
  if (format === 'xlsx') downloadXlsx(`manifest-${slug}.xlsx`, BASE_HEADERS, rows)
  else if (format === 'pdf') downloadPrintHtml('Passenger Manifest', group, BASE_HEADERS, rows)
  else downloadCsv(`manifest-${slug}.csv`, BASE_HEADERS, rows)
}

export function exportRoomingList(passengers, group, format = 'csv') {
  const headers = ['Room', 'Cabin', 'Guest name', 'Passport', 'Notes']
  const rows = passengers.map((p) => [
    p.room_number,
    p.cabin_number,
    passengerDisplayName(p),
    p.passport_number,
    p.notes
  ])
  const slug = (group.group_name || 'group').replace(/\s+/g, '-').toLowerCase()
  if (format === 'xlsx') downloadXlsx(`rooming-${slug}.xlsx`, headers, rows)
  else if (format === 'pdf') downloadPrintHtml('Rooming List', group, headers, rows)
  else downloadCsv(`rooming-${slug}.csv`, headers, rows)
}

export function exportCruisePassengerList(passengers, group, format = 'csv') {
  const headers = ['Cabin', 'Surname', 'First name', 'DOB', 'Nationality', 'Passport', 'Expiry']
  const rows = passengers.map((p) => [
    p.cabin_number,
    p.last_name,
    p.first_name,
    p.date_of_birth,
    p.nationality,
    p.passport_number,
    p.passport_expiry
  ])
  const slug = (group.group_name || 'cruise').replace(/\s+/g, '-').toLowerCase()
  if (format === 'xlsx') downloadXlsx(`cruise-list-${slug}.xlsx`, headers, rows)
  else if (format === 'pdf') downloadPrintHtml('Cruise Passenger List', group, headers, rows)
  else downloadCsv(`cruise-list-${slug}.csv`, headers, rows)
}

export function exportApisList(passengers, group, format = 'csv') {
  const headers = ['Surname', 'First name', 'Gender', 'DOB', 'Nationality', 'Passport', 'Expiry']
  const rows = passengers.map((p) => [
    p.last_name,
    p.first_name,
    p.gender,
    p.date_of_birth,
    p.nationality,
    p.passport_number,
    p.passport_expiry
  ])
  const slug = (group.group_name || 'apis').replace(/\s+/g, '-').toLowerCase()
  if (format === 'xlsx') downloadXlsx(`apis-${slug}.xlsx`, headers, rows)
  else if (format === 'pdf') downloadPrintHtml('Airline APIS List', group, headers, rows)
  else downloadCsv(`apis-${slug}.csv`, headers, rows)
}

export function exportEmergencyContacts(passengers, group, format = 'csv') {
  const headers = ['Guest name', 'Phone', 'Email', 'Emergency contact', 'Room']
  const rows = passengers.map((p) => [
    passengerDisplayName(p),
    p.phone,
    p.email,
    p.emergency_contact,
    p.room_number
  ])
  const slug = (group.group_name || 'emergency').replace(/\s+/g, '-').toLowerCase()
  if (format === 'xlsx') downloadXlsx(`emergency-${slug}.xlsx`, headers, rows)
  else if (format === 'pdf') downloadPrintHtml('Emergency Contact List', group, headers, rows)
  else downloadCsv(`emergency-${slug}.csv`, headers, rows)
}
