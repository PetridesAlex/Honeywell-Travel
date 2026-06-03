import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Pencil } from 'lucide-react'
import PassportStatusBadge from './PassportStatusBadge'
import ComposeEmailActions from './ComposeEmailActions'
import { maskPassportNumber } from '../utils/passport'

function clientDisplayName(client) {
  return [client?.first_name, client?.last_name].filter(Boolean).join(' ').trim() || 'Client'
}

function initials(client) {
  const first = (client?.first_name || '').trim()
  const last = (client?.last_name || '').trim()
  const a = first.charAt(0) || last.charAt(0) || '?'
  const b = last.charAt(0) || ''
  return (a + b).toUpperCase()
}

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return '—'
  }
}

function displayValue(value) {
  const text = String(value ?? '').trim()
  return text || '—'
}

function mergeProfile(client, liveFields = {}) {
  const base = client || {}
  return {
    ...base,
    first_name: liveFields.first_name ?? base.first_name ?? '',
    last_name: liveFields.last_name ?? base.last_name ?? '',
    email: liveFields.email ?? base.email ?? '',
    phone: liveFields.phone ?? base.phone ?? '',
    nationality: liveFields.nationality ?? base.nationality ?? '',
    passport_number: liveFields.passport_number ?? base.passport_number ?? '',
    date_of_issue: liveFields.date_of_issue ?? base.date_of_issue ?? '',
    date_of_expiry: liveFields.date_of_expiry ?? base.date_of_expiry ?? ''
  }
}

function ProfileField({ label, value, highlight }) {
  return (
    <div className={`crm-profile-field${highlight ? ' crm-profile-field--live' : ''}`}>
      <span className="crm-profile-field__label">{label}</span>
      <span className="crm-profile-field__value">{value}</span>
    </div>
  )
}

function ProfileCategory({ title, icon, accent, children }) {
  return (
    <div className={`crm-profile-category crm-profile-category--${accent}`}>
      <div className="crm-profile-category__head">
        <span className="crm-profile-category__icon" aria-hidden="true">{icon}</span>
        <h5>{title}</h5>
      </div>
      <div className="crm-profile-category__body">{children}</div>
    </div>
  )
}

function ClientProfileCard({ client, liveFields, enquiryPreview, live = false, onEdit }) {
  const profile = useMemo(() => mergeProfile(client, liveFields), [client, liveFields])

  const hasContact = Boolean(
    profile.first_name ||
    profile.last_name ||
    profile.email ||
    profile.phone
  )

  const hasPassport = Boolean(
    profile.nationality ||
    profile.passport_number ||
    profile.date_of_issue ||
    profile.date_of_expiry
  )

  const hasEnquiry = Boolean(
    enquiryPreview?.destination ||
    enquiryPreview?.trip_type ||
    enquiryPreview?.travel_dates ||
    enquiryPreview?.status
  )

  if (!client && !hasContact) {
    return (
      <section className="crm-client-card crm-client-card--empty">
        <p className="crm-profile-empty-title">No client profile linked</p>
        <p className="crm-profile-empty-text">
          Fill in name and contact below — the overview will update as you type. Save the lead to link or create a client.
        </p>
        {onEdit ? (
          <button type="button" className="crm-btn crm-btn-primary" onClick={onEdit}>
            Create client profile
          </button>
        ) : null}
      </section>
    )
  }

  const linked = Boolean(client?.id)
  const name = clientDisplayName(profile)

  return (
    <section className={`crm-client-card crm-profile-overview${live ? ' crm-profile-overview--live' : ''}`}>
      <div className="crm-profile-overview__header">
        <div className="crm-profile-overview__identity">
          <div className="crm-profile-overview__avatar" aria-hidden="true">
            {initials(profile)}
          </div>
          <div>
            <p className="crm-profile-overview__eyebrow">
              {linked ? 'Client profile' : 'Profile preview'}
              {live ? <span className="crm-profile-overview__live-tag">Live</span> : null}
            </p>
            <h4 className="crm-profile-overview__name">{name}</h4>
            {!linked && live ? (
              <p className="crm-profile-overview__hint">Updates automatically from the form below</p>
            ) : null}
          </div>
        </div>
        <PassportStatusBadge expiresOn={profile.date_of_expiry} compact />
      </div>

      <div className="crm-profile-overview__grid">
        <ProfileCategory title="Contact" icon="✉" accent="contact">
          <ProfileField label="Email" value={displayValue(profile.email)} highlight={live} />
          <ProfileField label="Phone" value={displayValue(profile.phone)} highlight={live} />
          <ProfileField label="First name" value={displayValue(profile.first_name)} highlight={live} />
          <ProfileField label="Surname" value={displayValue(profile.last_name)} highlight={live} />
        </ProfileCategory>

        <ProfileCategory title="Passport & ID" icon="🛂" accent="passport">
          {hasPassport || linked ? (
            <>
              <ProfileField label="Nationality" value={displayValue(profile.nationality)} />
              <ProfileField label="Passport no." value={maskPassportNumber(profile.passport_number)} />
              <ProfileField label="Date of issue" value={formatDate(profile.date_of_issue)} />
              <ProfileField label="Date of expiry" value={formatDate(profile.date_of_expiry)} />
            </>
          ) : (
            <p className="crm-profile-category__empty">
              No passport details yet. Use <strong>Edit passport</strong> or the full client profile.
            </p>
          )}
        </ProfileCategory>

        {hasEnquiry ? (
          <ProfileCategory title="This enquiry" icon="✈" accent="enquiry">
            <ProfileField label="Status" value={displayValue(enquiryPreview.status)} highlight={live} />
            <ProfileField label="Trip type" value={displayValue(enquiryPreview.trip_type)} highlight={live} />
            <ProfileField label="Destination" value={displayValue(enquiryPreview.destination)} highlight={live} />
            <ProfileField label="Travel dates" value={displayValue(enquiryPreview.travel_dates)} highlight={live} />
            {enquiryPreview.priority ? (
              <ProfileField label="Priority" value={displayValue(enquiryPreview.priority)} highlight={live} />
            ) : null}
          </ProfileCategory>
        ) : null}
      </div>

      <div className="crm-client-card__actions">
        <ComposeEmailActions
          to={profile.email}
          recipientName={name}
          destination={enquiryPreview?.destination}
          variant="card"
        />
        {client?.id || onEdit ? (
          <div className="crm-client-card__actions-secondary">
            {client?.id ? (
              <Link to={`/admin/clients/${client.id}`} className="crm-client-card__action-btn">
                <ArrowUpRight size={16} aria-hidden />
                Open full profile
              </Link>
            ) : null}
            {onEdit ? (
              <button type="button" className="crm-client-card__action-btn crm-client-card__action-btn--edit" onClick={onEdit}>
                <Pencil size={16} aria-hidden />
                {linked ? 'Edit passport' : 'Create / link client'}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default ClientProfileCard
