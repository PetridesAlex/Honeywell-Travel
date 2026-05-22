function getDayKey(dateValue) {
  const date = new Date(dateValue)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function buildAnalytics(leads) {
  const total = leads.length
  const confirmed = leads.filter(item => (item.status || 'New') === 'Confirmed').length
  const lost = leads.filter(item => (item.status || 'New') === 'Lost').length
  const conversionRate = total > 0 ? ((confirmed / total) * 100).toFixed(1) : '0.0'

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart)
  weekStart.setDate(todayStart.getDate() - 6)

  const leadsToday = leads.filter(item => item.created_at && new Date(item.created_at) >= todayStart).length
  const leadsThisWeek = leads.filter(item => item.created_at && new Date(item.created_at) >= weekStart).length

  const destinations = {}
  leads.forEach(item => {
    const key = (item.destination || 'Unknown').trim() || 'Unknown'
    destinations[key] = (destinations[key] || 0) + 1
  })
  const topDestinations = Object.entries(destinations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([destination, count]) => ({ destination, count }))

  const totalPipelineValue = leads.reduce((acc, item) => acc + Number(item.deal_value || 0), 0)
  const confirmedRevenue = leads
    .filter(item => (item.status || 'New') === 'Confirmed')
    .reduce((acc, item) => acc + Number(item.deal_value || 0), 0)
  const lostRevenue = leads
    .filter(item => (item.status || 'New') === 'Lost')
    .reduce((acc, item) => acc + Number(item.deal_value || 0), 0)

  const seriesMap = {}
  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(todayStart)
    day.setDate(todayStart.getDate() - i)
    seriesMap[getDayKey(day)] = 0
  }
  leads.forEach(item => {
    if (!item.created_at) return
    const key = getDayKey(item.created_at)
    if (key in seriesMap) seriesMap[key] += 1
  })

  const leadsPerDay = Object.entries(seriesMap).map(([date, count]) => ({ date, count }))

  const bySource = {}
  leads.forEach((item) => {
    const key = item.source || 'Unknown'
    bySource[key] = (bySource[key] || 0) + 1
  })
  const sourceBreakdown = Object.entries(bySource)
    .sort((a, b) => b[1] - a[1])
    .map(([source, count]) => ({ source, count, percent: total > 0 ? ((count / total) * 100).toFixed(1) : '0' }))

  const byTripType = {}
  leads.forEach((item) => {
    const key = item.trip_type || 'Not set'
    byTripType[key] = (byTripType[key] || 0) + 1
  })
  const tripTypeBreakdown = Object.entries(byTripType)
    .sort((a, b) => b[1] - a[1])
    .map(([tripType, count]) => ({ tripType, count }))

  const pipelineFunnel = ['New', 'Contacted', 'Quoted', 'Confirmed', 'Lost'].map((status) => ({
    status,
    count: leads.filter((item) => (item.status || 'New') === status).length
  }))

  const quotedPlus = leads.filter((item) =>
    ['Quoted', 'Confirmed'].includes(item.status || '')
  ).length
  const quoteToBookRate = quotedPlus > 0
    ? ((confirmed / quotedPlus) * 100).toFixed(1)
    : '0.0'

  return {
    conversionRate,
    quoteToBookRate,
    leadsToday,
    leadsThisWeek,
    topDestinations,
    totalPipelineValue,
    confirmedRevenue,
    lostRevenue,
    leadsPerDay,
    sourceBreakdown,
    tripTypeBreakdown,
    pipelineFunnel
  }
}
