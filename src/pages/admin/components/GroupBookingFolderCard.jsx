import { Link } from 'react-router-dom'
import { Calendar, ChevronRight, MapPin, Upload, Users } from 'lucide-react'

function formatDate(value) {
  if (!value) return 'Date TBC'
  try {
    return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return 'Date TBC'
  }
}

function statusClass(status) {
  const key = (status || '').toLowerCase().replace(/\s+/g, '-')
  return `crm-group-folder__status crm-group-folder__status--${key || 'planning'}`
}

function GroupBookingFolderCard({ group, typeLabel, passengerCount = 0 }) {
  return (
    <article className="crm-group-folder">
      <Link to={`/admin/group-bookings/${group.id}`} className="crm-group-folder__cover">
        <div className="crm-group-folder__spine" aria-hidden="true" />
        <div className="crm-group-folder__content">
          <span className="crm-group-folder__type">{typeLabel}</span>
          <h3 className="crm-group-folder__name">{group.group_name || 'Untitled group'}</h3>
          <ul className="crm-group-folder__meta">
            <li>
              <MapPin size={15} aria-hidden />
              {group.destination || 'No destination'}
            </li>
            <li>
              <Calendar size={15} aria-hidden />
              {formatDate(group.departure_date)}
            </li>
            <li className="crm-group-folder__meta--highlight">
              <Users size={15} aria-hidden />
              <strong>{passengerCount}</strong>
              <span>passenger{passengerCount === 1 ? '' : 's'}</span>
            </li>
          </ul>
          <span className={statusClass(group.status)}>{group.status || 'Planning'}</span>
        </div>
        <span className="crm-group-folder__arrow-wrap" aria-hidden="true">
          <ChevronRight className="crm-group-folder__arrow" size={20} />
        </span>
      </Link>
      <div className="crm-group-folder__actions">
        <Link
          to={`/admin/group-bookings/${group.id}`}
          className="crm-group-folder__action crm-group-folder__action--secondary"
        >
          Open group
        </Link>
        <Link
          to={`/admin/group-bookings/${group.id}?import=1`}
          className="crm-group-folder__action crm-group-folder__action--primary"
        >
          <Upload size={15} aria-hidden />
          Import file
        </Link>
      </div>
    </article>
  )
}

export default GroupBookingFolderCard
