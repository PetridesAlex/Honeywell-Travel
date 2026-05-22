import { Link } from 'react-router-dom'
import ComposeEmailActions from './ComposeEmailActions'
import { leadDisplayName } from '../utils/leadName'
import { getFollowUpBucket } from '../utils/followUp'

function FollowUpList({ leads, onMarkDone }) {
  if (!leads.length) {
    return <p className="crm-muted-inline">Nothing scheduled in this view.</p>
  }

  return (
    <div className="crm-followup-list">
      {leads.map((lead) => {
        const bucket = getFollowUpBucket(lead.follow_up_date)
        const phone = (lead.phone || '').replace(/[^\d+]/g, '')
        return (
          <article key={lead.id} className={`crm-followup-item crm-followup-item--${bucket}`}>
            <div className="crm-followup-item__main">
              <strong>{leadDisplayName(lead)}</strong>
              <p>{lead.destination || 'No destination'} · {lead.trip_type || 'Trip type TBC'}</p>
              <p className="crm-followup-item__contact">
                {lead.email || '—'} · {lead.phone || '—'}
              </p>
            </div>
            <div className="crm-followup-item__meta">
              <span className={`crm-status crm-status-${(lead.status || 'new').toLowerCase()}`}>
                {lead.status || 'New'}
              </span>
              <time>
                {lead.follow_up_date
                  ? new Date(lead.follow_up_date).toLocaleDateString()
                  : '—'}
              </time>
            </div>
            <div className="crm-followup-item__actions">
              <ComposeEmailActions
                to={lead.email}
                recipientName={leadDisplayName(lead)}
                destination={lead.destination}
                variant="compact"
              />
              <a className="crm-link-btn" href={phone ? `tel:${phone}` : undefined}>
                Call
              </a>
              <a
                className="crm-link-btn"
                href={
                  phone
                    ? `https://wa.me/${phone.replace('+', '')}?text=${encodeURIComponent(`Hello ${leadDisplayName(lead)}, following up on your travel enquiry with Honeywell Travel.`)}`
                    : undefined
                }
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
              <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={() => onMarkDone(lead.id)}>
                Done
              </button>
              <Link to="/admin/leads" className="crm-link-btn">
                Open lead
              </Link>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default FollowUpList
