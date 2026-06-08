import {
  Calendar,
  CalendarClock,
  FileText,
  Globe2,
  Lock,
  Mail,
  Phone,
  Shield
} from 'lucide-react'
import PassportStatusBadge from './PassportStatusBadge'
import { getComposeLinks } from '../utils/composeEmail'
import { getPassportStatus, maskPassportNumber } from '../utils/passport'

function formatDate(value) {
  if (!value) return null
  try {
    return new Date(value).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return null
  }
}

function getNotesMeta(notes) {
  const text = String(notes || '').trim()
  if (!text) return { words: 0, lines: 0, chars: 0 }

  return {
    words: text.split(/\s+/).filter(Boolean).length,
    lines: text.split(/\n/).length,
    chars: text.length
  }
}

function ProfileFact({ icon: Icon, label, value, href, emptyText = 'Not provided', mono = false }) {
  const hasValue = Boolean(value && value !== '—')
  return (
    <div className={`crm-profile-fact${hasValue ? '' : ' crm-profile-fact--empty'}`}>
      <span className="crm-profile-fact__icon" aria-hidden="true">
        <Icon size={18} strokeWidth={2} />
      </span>
      <div className="crm-profile-fact__body">
        <span className="crm-profile-fact__label">{label}</span>
        {hasValue ? (
          href ? (
            <a className={`crm-profile-fact__value${mono ? ' crm-profile-fact__value--mono' : ''}`} href={href}>
              {value}
            </a>
          ) : (
            <span className={`crm-profile-fact__value${mono ? ' crm-profile-fact__value--mono' : ''}`}>{value}</span>
          )
        ) : (
          <span className="crm-profile-fact__empty">{emptyText}</span>
        )}
      </div>
    </div>
  )
}

function ClientProfileDetails({ client, clientName }) {
  const passportStatus = getPassportStatus(client.date_of_expiry)
  const notesMeta = getNotesMeta(client.notes)
  const mailto = client.email
    ? getComposeLinks({ to: client.email, recipientName: clientName }).mailto
    : null

  return (
    <div className="crm-profile-details-panel">
      <section className="crm-profile-block crm-profile-block--contact">
        <header className="crm-profile-block__head">
          <span className="crm-profile-block__icon crm-profile-block__icon--contact" aria-hidden="true">
            <Mail size={20} />
          </span>
          <div>
            <h2 className="crm-profile-block__title">Contact details</h2>
            <p className="crm-profile-block__desc">Email, phone, and nationality on file</p>
          </div>
        </header>
        <div className="crm-profile-facts">
          <ProfileFact
            icon={Mail}
            label="Email address"
            value={client.email}
            href={mailto}
            emptyText="No email saved"
          />
          <ProfileFact icon={Phone} label="Phone" value={client.phone} emptyText="No phone saved" />
          <ProfileFact
            icon={Globe2}
            label="Nationality"
            value={client.nationality}
            emptyText="Nationality not set"
          />
          <ProfileFact
            icon={Calendar}
            label="Date of birth"
            value={formatDate(client.date_of_birth)}
            emptyText="Date of birth not set"
          />
        </div>
      </section>

      <section className={`crm-profile-block crm-profile-block--passport crm-profile-block--${passportStatus}`}>
        <header className="crm-profile-block__head">
          <span className="crm-profile-block__icon crm-profile-block__icon--passport" aria-hidden="true">
            <Shield size={20} />
          </span>
          <div className="crm-profile-block__head-text">
            <h2 className="crm-profile-block__title">Passport &amp; travel ID</h2>
            <p className="crm-profile-block__desc">Document number and validity dates</p>
          </div>
          <PassportStatusBadge expiresOn={client.date_of_expiry} compact />
        </header>
        <div className="crm-profile-facts">
          <ProfileFact
            icon={Shield}
            label="Passport number"
            value={client.passport_number ? maskPassportNumber(client.passport_number) : null}
            emptyText="No passport on file"
            mono
          />
          <ProfileFact
            icon={Calendar}
            label="Date of issue"
            value={formatDate(client.date_of_issue)}
            emptyText="Issue date not set"
          />
          <ProfileFact
            icon={CalendarClock}
            label="Date of expiry"
            value={formatDate(client.date_of_expiry)}
            emptyText="Expiry date not set"
          />
        </div>
      </section>

      {client.notes ? (
        <section className="crm-profile-block crm-profile-block--notes crm-profile-notes-block">
          <header className="crm-profile-block__head crm-profile-notes-block__head">
            <span
              className="crm-profile-block__icon crm-profile-block__icon--notes crm-profile-notes-block__icon"
              aria-hidden="true"
            >
              <FileText size={20} strokeWidth={2.25} />
            </span>
            <div className="crm-profile-notes-block__head-copy">
              <p className="crm-profile-notes-block__eyebrow">Team workspace</p>
              <div className="crm-profile-notes-block__title-row">
                <h2 className="crm-profile-block__title">Internal notes</h2>
                <span className="crm-profile-notes-block__badge">
                  <Lock size={11} aria-hidden="true" />
                  Private
                </span>
              </div>
              <p className="crm-profile-block__desc">Private notes for your team only</p>
            </div>
            {client.updated_at ? (
              <div className="crm-profile-notes-block__meta">
                <span className="crm-profile-notes-block__meta-label">Last updated</span>
                <time className="crm-profile-notes-block__meta-value" dateTime={client.updated_at}>
                  {formatDate(client.updated_at)}
                </time>
              </div>
            ) : null}
          </header>
          <div className="crm-profile-notes-block__body">
            <div className="crm-profile-notes crm-profile-notes--premium" aria-label="Internal notes content">
              <span className="crm-profile-notes__quote" aria-hidden="true">
                &ldquo;
              </span>
              <p className="crm-profile-notes__text">{client.notes}</p>
            </div>
            <footer className="crm-profile-notes-block__footer">
              <span className="crm-profile-notes-block__stat">
                <strong>{notesMeta.words}</strong> {notesMeta.words === 1 ? 'word' : 'words'}
              </span>
              <span className="crm-profile-notes-block__stat">
                <strong>{notesMeta.lines}</strong> {notesMeta.lines === 1 ? 'line' : 'lines'}
              </span>
              <span className="crm-profile-notes-block__stat crm-profile-notes-block__stat--muted">
                Staff only
              </span>
            </footer>
          </div>
        </section>
      ) : null}
    </div>
  )
}

export default ClientProfileDetails
