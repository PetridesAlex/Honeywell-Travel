import { Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import PassportStatusBadge from './PassportStatusBadge'
import ComposeEmailActions from './ComposeEmailActions'
import { CRM_SENDER_EMAIL } from '../constants'
import { clientTypeClass, getClientTypeLabel } from '../utils/clients'

function clientInitials(client) {
  const first = (client.first_name || '').trim().charAt(0)
  const last = (client.last_name || '').trim().charAt(0)
  return (first + last).toUpperCase() || '?'
}

function clientFullName(client) {
  return [client.first_name, client.last_name].filter(Boolean).join(' ').trim() || 'Unnamed client'
}

function ClientProfileHeader({ client, leadsCount = 0, travelStats = null, groupName = '', onEdit, onDelete }) {
  const name = clientFullName(client)
  const lifetimeTrips = travelStats?.lifetimeTrips ?? 0
  const tripsThisYear = travelStats?.tripsThisYear ?? 0
  const currentYear = travelStats?.currentYear ?? new Date().getFullYear()

  return (
    <header className="crm-profile-header">
      <Link to="/admin/clients" className="crm-profile-header__back">
        <ArrowLeft size={16} aria-hidden />
        All clients
      </Link>

      <div className="crm-profile-header__grid">
        <div className="crm-profile-header__identity">
          <span className="crm-profile-header__avatar" aria-hidden="true">
            {clientInitials(client)}
          </span>
          <div className="crm-profile-header__copy">
            <p className="crm-profile-header__eyebrow">Client profile</p>
            <h1 className="crm-profile-header__name">{name}</h1>
            <p className="crm-profile-header__subtitle">
              Passport details, contact information, and linked enquiries.
            </p>
            <div className="crm-profile-header__meta">
              <span className={clientTypeClass(client.client_type)}>{getClientTypeLabel(client.client_type)}</span>
              {groupName ? (
                <span className="crm-profile-header__chip crm-profile-header__chip--group">{groupName}</span>
              ) : null}
              <PassportStatusBadge expiresOn={client.date_of_expiry} compact />
              <span className="crm-profile-header__chip">
                {leadsCount} linked {leadsCount === 1 ? 'lead' : 'leads'}
              </span>
              <span className="crm-profile-header__chip crm-profile-header__chip--travel">
                {lifetimeTrips} Honeywell {lifetimeTrips === 1 ? 'trip' : 'trips'}
              </span>
              <span className="crm-profile-header__chip crm-profile-header__chip--travel-year">
                {tripsThisYear} in {currentYear}
              </span>
              <span className="crm-profile-header__chip">ID #{client.id}</span>
              {client.email ? (
                <span className="crm-profile-header__chip crm-profile-header__chip--email">{client.email}</span>
              ) : null}
            </div>
          </div>
        </div>

        <aside className="crm-profile-header__panel" aria-label="Client actions">
          <p className="crm-profile-header__panel-label">Reply to client</p>
          <ComposeEmailActions
            to={client.email}
            recipientName={name}
            variant="header"
          />
          <p className="crm-profile-header__sender">
            Sending as <strong>{CRM_SENDER_EMAIL}</strong>
          </p>
          <button type="button" className="crm-profile-header__edit" onClick={onEdit}>
            <Pencil size={16} aria-hidden />
            Edit profile
          </button>
          {onDelete ? (
            <button type="button" className="crm-profile-header__delete" onClick={onDelete}>
              <Trash2 size={16} aria-hidden />
              Delete client
            </button>
          ) : null}
        </aside>
      </div>
    </header>
  )
}

export default ClientProfileHeader
