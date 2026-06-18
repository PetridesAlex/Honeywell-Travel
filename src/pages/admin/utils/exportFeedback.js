function escapeCsv(value) {
  const text = String(value ?? '')
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export function exportFeedbackToCsv(responses, questions = [], campaign = null, filename) {
  const baseName = campaign?.company_name
    ? `feedback-${campaign.company_name.replace(/\s+/g, '-').toLowerCase()}`
    : 'honeywell-corporate-feedback'
  const file = filename || `${baseName}.csv`

  const questionHeaders = questions.map((q) => q.label)
  const headers = [
    'Submitted',
    'Traveler',
    'Email',
    'Overall score',
    'NPS',
    ...questionHeaders,
  ]

  const rows = responses.map((row) => {
    const answers = row.answers && typeof row.answers === 'object' ? row.answers : {}
    return [
      row.submitted_at,
      row.traveler_name,
      row.traveler_email,
      row.overall_score,
      row.nps_score,
      ...questions.map((q) => answers[q.id] ?? ''),
    ].map(escapeCsv).join(',')
  })

  const csv = [headers.map(escapeCsv).join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = file
  link.click()
  URL.revokeObjectURL(url)
}
