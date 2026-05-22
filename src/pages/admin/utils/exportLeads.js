import { parseLeadName } from './leadName'

function escapeCsv(value) {
  const text = String(value ?? '')
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export function exportLeadsToCsv(leads, filename = 'honeywell-leads.csv') {
  const headers = [
    'Name',
    'Surname',
    'Email',
    'Phone',
    'Destination',
    'Travel Dates',
    'Travelers',
    'Trip Type',
    'Priority',
    'Package Interest',
    'Status',
    'Source',
    'Deal Value',
    'Budget',
    'Follow-up',
    'Assigned Agent',
    'Created'
  ]

  const rows = leads.map((lead) => {
    const { first_name, last_name } = parseLeadName(lead)
    return [
      first_name,
      last_name,
      lead.email,
      lead.phone,
      lead.destination,
      lead.travel_dates,
      lead.number_of_travelers,
      lead.trip_type,
      lead.priority,
      lead.package_interest,
      lead.status,
      lead.source,
      lead.deal_value,
      lead.budget,
      lead.follow_up_date,
      lead.assigned_agent,
      lead.created_at
    ].map(escapeCsv).join(',')
  })

  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
