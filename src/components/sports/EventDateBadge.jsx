function EventDateBadge({ iso }) {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null

  const month = date.toLocaleString(undefined, { month: 'short' }).toUpperCase()
  const day = date.getDate()
  const weekday = date.toLocaleString(undefined, { weekday: 'short' }).toUpperCase()

  return (
    <div className="st-date-badge" aria-hidden>
      <span className="st-date-badge__month">{month}</span>
      <span className="st-date-badge__day">{day}</span>
      <span className="st-date-badge__weekday">{weekday}</span>
    </div>
  )
}

export default EventDateBadge
