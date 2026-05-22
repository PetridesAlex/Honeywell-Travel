import React from 'react'
import EmailTemplatePicker from './EmailTemplatePicker'
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

  if (followDay < today) return 'crm-follow-overdue'
  if (followDay.getTime() === today.getTime()) return 'crm-follow-today'
  return ''
}

function LeadsTable({ leads, onEdit, onDelete, onRowOpen, onLogCall, onLogWhatsapp, onLogEmailTemplate }) {
  if (leads.length === 0) {
    return <div className="crm-empty">No leads match your current filters.</div>
  }

  return (
    <div className="crm-table-wrap">
      <table className="crm-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Surname</th>
            <th>Email</th>
            <th>Trip</th>
            <th>Destination</th>
            <th>Priority</th>
            <th>Passport</th>
            <th>Status</th>
            <th>Follow-up</th>
            <th>Created</th>
            <th>Quick Actions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => {
            const phone = normalizePhone(lead.phone)
            const { first_name, last_name } = parseLeadName(lead)
            return (
              <tr key={lead.id} className={lead.__isNew ? 'crm-row-new' : ''} onClick={() => onRowOpen(lead)}>
                <td>
                  <strong>{first_name || '—'}</strong>
                  {lead.notes ? <p className="crm-note-preview">{lead.notes}</p> : null}
                </td>
                <td>{last_name || '—'}</td>
                <td>{lead.email || '—'}</td>
                <td>{lead.trip_type || '—'}</td>
                <td>{lead.destination || '—'}</td>
                <td>
                  {lead.priority && lead.priority !== 'Normal' ? (
                    <span className={`crm-priority crm-priority--${lead.priority.toLowerCase()}`}>{lead.priority}</span>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  {lead.client ? (
                    <PassportStatusBadge expiresOn={lead.client.date_of_expiry} compact />
                  ) : (
                    '—'
                  )}
                </td>
                <td><span className={`crm-status crm-status-${(lead.status || 'new').toLowerCase()}`}>{lead.status || 'New'}</span></td>
                <td className={getFollowUpClass(lead.follow_up_date)}>
                  {lead.follow_up_date ? new Date(lead.follow_up_date).toLocaleDateString() : '-'}
                </td>
                <td>{lead.created_at ? new Date(lead.created_at).toLocaleString() : '-'}</td>
                <td>
                  <div className="crm-quick-actions">
                    <a className="crm-link-btn" href={phone ? `tel:${phone}` : undefined} onClick={(e) => { e.stopPropagation(); onLogCall(lead) }}>Call</a>
                    <EmailTemplatePicker lead={lead} onLog={(template) => onLogEmailTemplate(lead, template)} />
                    <a
                      className="crm-link-btn"
                      href={phone ? `https://wa.me/${phone.replace('+', '')}?text=${encodeURIComponent(`Hello ${leadDisplayName(lead)}, thank you for your interest in ${lead.destination || 'our travel packages'}. We will prepare your offer shortly.`)}` : undefined}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => { e.stopPropagation(); onLogWhatsapp(lead) }}
                    >
                      WhatsApp
                    </a>
                  </div>
                </td>
                <td>
                  <div className="crm-action-buttons">
                    <button className="crm-btn crm-btn-ghost" onClick={(e) => { e.stopPropagation(); onEdit(lead) }}>Edit</button>
                    <button className="crm-btn crm-btn-danger" onClick={(e) => { e.stopPropagation(); onDelete(lead) }}>Delete</button>
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
