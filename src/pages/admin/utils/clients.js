export const CLIENT_TYPE_OPTIONS = [
  {
    id: 'individual',
    label: 'Individual',
    description: 'Leisure travelers, couples, families, and independent bookings.'
  },
  {
    id: 'group',
    label: 'Group',
    description: 'Corporate, school, sports, or incentive group travelers.'
  }
]

export function normalizeClientType(type) {
  return type === 'group' ? 'group' : 'individual'
}

export function getClientTypeLabel(type) {
  return normalizeClientType(type) === 'group' ? 'Group' : 'Individual'
}

export function clientTypeClass(type) {
  return `crm-client-type crm-client-type--${normalizeClientType(type)}`
}

export function countClientsByType(clients = []) {
  const counts = { all: clients.length, individual: 0, group: 0 }
  clients.forEach((client) => {
    const key = normalizeClientType(client.client_type)
    counts[key] += 1
  })
  return counts
}

export function clientMatchesCategory(client, categoryId) {
  if (!categoryId || categoryId === 'all') return true
  return normalizeClientType(client?.client_type) === categoryId
}
