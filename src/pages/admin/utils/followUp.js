export function getFollowUpBucket(followUpDate) {
  if (!followUpDate) return 'none'

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const follow = new Date(followUpDate)
  const followDay = new Date(follow.getFullYear(), follow.getMonth(), follow.getDate())

  if (followDay < today) return 'overdue'
  if (followDay.getTime() === today.getTime()) return 'today'

  const weekAhead = new Date(today)
  weekAhead.setDate(weekAhead.getDate() + 7)
  if (followDay <= weekAhead) return 'upcoming'

  return 'later'
}

export function countFollowUps(leads = []) {
  const counts = { today: 0, overdue: 0, upcoming: 0, later: 0 }
  leads.forEach((lead) => {
    const bucket = getFollowUpBucket(lead.follow_up_date)
    if (bucket in counts) counts[bucket] += 1
  })
  return counts
}

export function filterFollowUps(leads = [], bucket) {
  return leads.filter((lead) => getFollowUpBucket(lead.follow_up_date) === bucket)
}
