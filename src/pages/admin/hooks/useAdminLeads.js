import { useCallback, useEffect, useState } from 'react'
import { fetchLeads } from '../api/leadsApi'
import { normalizeLeadStatus } from '../constants'

function normalizeLeadsList(rows = []) {
  return rows.map((lead) => ({
    ...lead,
    status: normalizeLeadStatus(lead.status)
  }))
}

export function useAdminLeads(autoLoad = true) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(autoLoad)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: queryError } = await fetchLeads()
    if (queryError) {
      setError(queryError.message)
      setLeads([])
    } else {
      setLeads(normalizeLeadsList(data))
    }
    setLoading(false)
    return { data: data || [], error: queryError }
  }, [])

  useEffect(() => {
    if (autoLoad) reload()
  }, [autoLoad, reload])

  return { leads, setLeads, loading, error, reload }
}
