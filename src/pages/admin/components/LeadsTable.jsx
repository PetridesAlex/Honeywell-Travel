import React from 'react'
import { Mail, Phone } from 'lucide-react'
import PassportStatusBadge from './PassportStatusBadge'
import { leadDisplayName, parseLeadName } from '../utils/leadName'

function normalizePhone(phone = '') {
  return phone.replace(/[^\d+]/g, '')
}

function getFollowUpClass(date) {
  if (!date) return ''

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const followDate = new Date(date)
  const followDay = new Date(followDate.getFullYear(), followDate.getMonth(), followDate.getDate())

  if (followDay < today) return 'crm-lead-table__follow--overdue'
  if (followDay.getTime() === today.getTime()) return 'crm-lead-table__follow--today'
  return ''
}

function formatTableDate(value) {
  if (!value) return null
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function leadInitials(firstName, lastName) {
  const first = (firstName || '').trim().charAt(0)
  const last = (lastName || '').trim().charAt(0)
  if (first && last) return `${first}${last}`.toUpperCase()
  return (firstName || lastName || '?').slice(0, 2).toUpperCase()
}

function tripTypeClass(tripType) {
  const key = String(tripType || 'other').toLowerCase().replace(/[^a-z0-9]+/g, '_')
  return `crm-lead-trip crm-lead-trip--${key}`
}

function statusClass(status) {
  return `crm-lead-status crm-lead-status--${String(status || 'new').toLowerCase().replace(/\s+/g, '_')}`
}

function priorityClass(priority) {
  return `crm-lead-priority crm-lead-priority--${String(priority || 'normal').toLowerCase()}`
}

function EmptyCell() {
  return <span className="crm-table-empty">—</span>
}

function LeadsTable({ leads, onEdit, onDelete, onRowOpen, onLogCall, onLogWhatsapp, onLogEmailTemplate }) {
  if (leads.length === 0) {
    return <div className="crm-empty">No leads match your current filters.</div>
  }

  return (
    <div className="crm-table-wrap crm-table-wrap--leads">
      <table className="crm-table crm-table--leads">
        <thead>
          <tr>
            <th>Lead</th>
            <th>Contact</th>
            <th>Trip</th>
            <th>Priority</th>
            <th>Passport</th>
            <th>Status</th>
            <th>Follow-up</th>
            <th>Added</th>
            <th className="crm-lead-table__col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const phone = normalizePhone(lead.phone)
            const { first_name, last_name } = parseLeadName(lead)
            const followUpDate = formatTableDate(lead.follow_up_date)
            const createdDate = formatTableDate(lead.created_at)

            return (
              <tr key={lead.id} className={lead.__isNew ? 'crm-row-new' : ''} onClick={() => onRowOpen(lead)}>
                <td className="crm-lead-table__lead">
                  <div className="crm-lead-table__identity">
                    <span className="crm-lead-table__avatar" aria-hidden="true">
                      {leadInitials(first_name, last_name)}
                    </span>
                    <div className="crm-lead-table__name-wrap">
                      <strong>{leadDisplayName(lead) || 'Unnamed lead'}</strong>
                      {lead.notes ? <p className="crm-lead-table__notes">{lead.notes}</p> : null}
                    </div>
                  </div>
                </td>
                <td className="crm-lead-table__contact">
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="crm-lead-table__email"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {lead.email}
                    </a>
                  ) : (
                    <EmptyCell />
                  )}
                  {phone ? (
                    <span className="crm-lead-table__phone">
                      <Phone size={12} aria-hidden />
                      {lead.phone}
                    </span>
                  ) : null}
                </td>
                <td className="crm-lead-table__trip">
                  {lead.trip_type ? (
                    <span className={tripTypeClass(lead.trip_type)}>{lead.trip_type}</span>
                  ) : (
                    <EmptyCell />
                  )}
                  {lead.destination ? (
                    <span className="crm-lead-table__destination">{lead.destination}</span>
                  ) : null}
                </td>
                <td className="crm-lead-table__priority">
                  <span className={priorityClass(lead.priority || 'Normal')}>{lead.priority || 'Normal'}</span>
                </td>
                <td className="crm-lead-table__passport">
                  {lead.client ? (
                    <PassportStatusBadge expiresOn={lead.client.date_of_expiry} compact short />
                  ) : (
                    <EmptyCell />
                  )}
                </td>
                <td className="crm-lead-table__status">
                  <span className={statusClass(lead.status)}>{lead.status || 'New'}</span>
                </td>
                <td className={`crm-lead-table__follow ${getFollowUpClass(lead.follow_up_date)}`}>
                  {followUpDate || <EmptyCell />}
                </td>
                <td className="crm-lead-table__created">{createdDate || <EmptyCell />}</td>
                <td className="crm-lead-table__col-actions">
                  <div className="crm-lead-table-actions" onClick={(e) => e.stopPropagation()} role="group" aria-label="Lead actions">
                    <a
                      className={`crm-lead-action${phone ? '' : ' crm-lead-action--disabled'}`}
                      href={phone ? `tel:${phone}` : undefined}
                      onClick={() => onLogCall(lead)}
                      aria-label={`Call ${leadDisplayName(lead)}`}
                    >
                      <Phone size={13} aria-hidden />
                      Call
                    </a>
                    <a
                      className={`crm-lead-action${lead.email ? '' : ' crm-lead-action--disabled'}`}
                      href={
                        lead.email
                          ? `mailto:${lead.email}?subject=${encodeURIComponent(`Re: ${lead.destination || 'your travel enquiry'}`)}`
                          : undefined
                      }
                      onClick={() => onLogEmailTemplate(lead, 'quick_reply')}
                      aria-label={`Email ${leadDisplayName(lead)}`}
                    >
                      <Mail size={13} aria-hidden />
                      Email
                    </a>
                    <a
                      className={`crm-lead-action${phone ? '' : ' crm-lead-action--disabled'}`}
                      href={
                        phone
                          ? `https://wa.me/${phone.replace('+', '')}?text=${encodeURIComponent(`Hello ${leadDisplayName(lead)}, thank you for your interest in ${lead.destination || 'our travel packages'}. We will prepare your offer shortly.`)}`
                          : undefined
                      }
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => onLogWhatsapp(lead)}
                      aria-label={`WhatsApp ${leadDisplayName(lead)}`}
                    >
                      WhatsApp
                    </a>
                    <button type="button" className="crm-lead-action crm-lead-action--edit" onClick={() => onEdit(lead)}>
                      Edit
                    </button>
                    <button type="button" className="crm-lead-action crm-lead-action--delete" onClick={() => onDelete(lead)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default LeadsTable
