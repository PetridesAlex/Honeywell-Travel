import { useState } from 'react'
import { ChevronDown, Trash2, Users } from 'lucide-react'
import PassportExpiryAlert from './PassportExpiryAlert'
import { PASSENGER_FIELD_LABELS, PASSENGER_ROSTER_FIELD_ORDER } from '../../utils/passengerImport/passengerFields'

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}

function cellValue(passenger, field) {
  switch (field) {
    case 'last_name':
    case 'first_name':
    case 'gender':
    case 'nationality':
    case 'passport_number':
    case 'national_id':
      return passenger[field] || '—'
    case 'date_of_issue':
    case 'passport_expiry':
      return formatDate(passenger[field])
    default:
      return '—'
  }
}

function passengerLabel(passenger) {
  const surname = (passenger.last_name || '').trim()
  const name = (passenger.first_name || '').trim()
  return [surname, name].filter(Boolean).join(' ') || 'Unnamed passenger'
}

function PassengerRosterPanel({ passengers, onRemove, onImportClick, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  if (!passengers.length) {
    return (
      <section className="crm-roster-panel crm-roster-panel--empty">
        <div className="crm-roster-panel__empty">
          <Users size={28} aria-hidden />
          <p>No passengers saved yet. Import an Excel or CSV file for this group.</p>
          <button type="button" className="crm-btn crm-btn-primary" onClick={onImportClick}>
            Import passengers
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={`crm-roster-panel${open ? ' crm-roster-panel--open' : ''}`}>
      <button type="button" className="crm-roster-panel__cover" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="crm-roster-panel__cover-icon" aria-hidden="true">
          <Users size={22} />
        </span>
        <span className="crm-roster-panel__cover-text">
          <strong>Passenger list</strong>
          <span>{passengers.length} traveller{passengers.length === 1 ? '' : 's'} saved in this group</span>
        </span>
        <ChevronDown size={20} className="crm-roster-panel__chevron" aria-hidden />
      </button>

      {open ? (
        <div className="crm-roster-panel__body">
          <div className="crm-table-wrap crm-table-wrap--roster">
            <table className="crm-table crm-table--roster">
              <thead>
                <tr>
                  <th>#</th>
                  {PASSENGER_ROSTER_FIELD_ORDER.map((field) => (
                    <th key={field}>{PASSENGER_FIELD_LABELS[field]}</th>
                  ))}
                  <th>Alert</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {passengers.map((passenger, index) => (
                  <tr key={passenger.id}>
                    <td className="crm-table__num">{index + 1}</td>
                    {PASSENGER_ROSTER_FIELD_ORDER.map((field) => (
                      <td key={field} title={cellValue(passenger, field)}>
                        {cellValue(passenger, field)}
                      </td>
                    ))}
                    <td>
                      <PassportExpiryAlert expiresOn={passenger.passport_expiry} compact />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="crm-roster-panel__remove"
                        onClick={() => onRemove(passenger.id)}
                        title={`Remove ${passengerLabel(passenger)}`}
                      >
                        <Trash2 size={14} aria-hidden />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="crm-roster-panel__hint">Click the panel above to view all traveller details.</p>
      )}
    </section>
  )
}

export default PassengerRosterPanel
