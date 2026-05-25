import { getClientTypeLabel } from './clients'

function escapeCsv(value) {
  const text = String(value ?? '')
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export function exportClientsToCsv(clients, groupNameById = {}, filename = 'honeywell-clients.csv') {
  const headers = [
    'Category',
    'Corporate partner',
    'Name',
    'Surname',
    'Email',
    'Phone',
    'Nationality',
    'Date of Birth',
    'Passport Number',
    'Date of Issue',
    'Date of Expiry',
    'Notes',
    'Created'
  ]

  const rows = clients.map((client) =>
    [
      getClientTypeLabel(client.client_type),
      groupNameById[client.corporate_group_id] || '',
      client.first_name,
      client.last_name,
      client.email,
      client.phone,
      client.nationality,
      client.date_of_birth,
      client.passport_number,
      client.date_of_issue,
      client.date_of_expiry,
      client.notes,
      client.created_at
    ]
      .map(escapeCsv)
      .join(',')
  )

  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
