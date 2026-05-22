import React, { useEffect, useMemo, useState } from 'react'
import { PRIORITY_OPTIONS, SOURCE_OPTIONS, STATUS_OPTIONS, TRIP_TYPE_OPTIONS } from '../constants'
import LeadTimeline from './LeadTimeline'
import ClientProfileCard from './ClientProfileCard'
import ComposeEmailActions from './ComposeEmailActions'
import { getComposeLinks } from '../utils/composeEmail'
import { leadDisplayName, parseLeadName } from '../utils/leadName'

function statusClass(status) {
  const key = (status || 'New').toLowerCase()
  return `crm-drawer-status crm-drawer-status--${key}`
}

function priorityClass(priority) {
  const key = (priority || 'Normal').toLowerCase()
  return `crm-drawer-priority crm-drawer-priority--${key}`
}

function LeadDetailsDrawer({
  lead,
  open,
  agents,
  timeline,
  onClose,
  onSave,
  onMarkDone,
  onLogCall,
  onLogWhatsapp,
  onEditClient,
  emailTemplatePicker
}) {
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [statusSaving, setStatusSaving] = useState(false)

  useEffect(() => {
    if (!lead) {
      setForm(null)
      return
    }
    setForm({
      ...lead,
      ...parseLeadName(lead),
      follow_up_date: lead.follow_up_date ? lead.follow_up_date.slice(0, 10) : ''
    })
  }, [lead])

  const whatsappHref = useMemo(() => {
    if (!form?.phone) return undefined
    const phone = String(form.phone).replace(/[^\d+]/g, '').replace('+', '')
    const text = `Hello ${leadDisplayName(form)}, thank you for your interest in ${form.destination || 'our travel packages'}. We will prepare your offer shortly.`
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
  }, [form])

  const profileLiveFields = useMemo(
    () => ({
      first_name: form?.first_name,
      last_name: form?.last_name,
      email: form?.email,
      phone: form?.phone
    }),
    [form?.first_name, form?.last_name, form?.email, form?.phone]
  )

  const enquiryPreview = useMemo(
    () => ({
      status: form?.status,
      trip_type: form?.trip_type,
      destination: form?.destination,
      travel_dates: form?.travel_dates,
      priority: form?.priority
    }),
    [form?.status, form?.trip_type, form?.destination, form?.travel_dates, form?.priority]
  )

  const displayName = leadDisplayName(form || lead)

  const composeLinks = useMemo(
    () =>
      getComposeLinks({
        to: form?.email ?? lead?.email,
        recipientName: displayName,
        destination: form?.destination ?? lead?.destination
      }),
    [form?.email, lead?.email, displayName, form?.destination, lead?.destination]
  )

  if (!open || !lead || !form) return null

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleStatusChange = async (nextStatus) => {
    setField('status', nextStatus)
    setStatusSaving(true)
    await onSave(lead.id, { status: nextStatus })
    setStatusSaving(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const first_name = (form.first_name || '').trim()
    const last_name = (form.last_name || '').trim()
    await onSave(lead.id, {
      first_name,
      last_name,
      full_name: [first_name, last_name].filter(Boolean).join(' ').trim(),
      email: (form.email || '').trim(),
      phone: (form.phone || '').trim(),
      status: form.status,
      source: form.source,
      trip_type: form.trip_type,
      priority: form.priority,
      package_interest: form.package_interest,
      destination: form.destination,
      travel_dates: form.travel_dates,
      number_of_travelers: form.number_of_travelers,
      budget: form.budget,
      deal_value: Number(form.deal_value || 0),
      message: form.message,
      notes: form.notes,
      assigned_agent: form.assigned_agent || '',
      follow_up_date: form.follow_up_date || null
    })
    setSaving(false)
  }

  return (
    <div className="crm-modal-backdrop crm-modal-backdrop--premium" onClick={onClose} role="presentation">
      <aside
        className="crm-drawer crm-drawer--lead"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-drawer-title"
      >
        <header className="crm-drawer__hero">
          <div className="crm-drawer__hero-main">
            <p className="crm-drawer__eyebrow">Lead workspace</p>
            <h3 id="lead-drawer-title">{displayName}</h3>
            <div className="crm-drawer__chips">
              {form.email ? (
                <a className="crm-drawer-chip crm-drawer-chip--email" href={composeLinks.mailto}>
                  {form.email}
                </a>
              ) : null}
              {form.phone ? (
                <a className="crm-drawer-chip crm-drawer-chip--phone" href={`tel:${form.phone}`}>
                  {form.phone}
                </a>
              ) : null}
            </div>
            <div className="crm-drawer__badges">
              <span className={statusClass(form.status)}>{form.status || 'New'}</span>
              <span className={priorityClass(form.priority)}>{form.priority || 'Normal'}</span>
              {form.trip_type ? <span className="crm-drawer-trip">{form.trip_type}</span> : null}
            </div>
          </div>
          <button type="button" className="crm-modal__close" onClick={onClose} aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="crm-drawer__body">
          <div className="crm-drawer__client-wrap">
            <ClientProfileCard
              client={lead.client}
              liveFields={profileLiveFields}
              enquiryPreview={enquiryPreview}
              live
              onEdit={onEditClient}
            />
          </div>

          <section className="crm-drawer__section crm-drawer__section--contact">
            <div className="crm-drawer__section-head">
              <span className="crm-drawer__section-icon" aria-hidden="true">01</span>
              <h4>Contact</h4>
            </div>
            <div className="crm-drawer-grid">
              <label className="crm-field">
                <span className="crm-field__label">Name</span>
                <input value={form.first_name || ''} onChange={e => setField('first_name', e.target.value)} />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Surname</span>
                <input value={form.last_name || ''} onChange={e => setField('last_name', e.target.value)} />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Email</span>
                <input type="email" value={form.email || ''} onChange={e => setField('email', e.target.value)} />
              </label>
              <div className="crm-field crm-field--compose-email">
                <span className="crm-field__label">Reply</span>
                <ComposeEmailActions
                  to={form.email}
                  recipientName={displayName}
                  destination={form.destination}
                  variant="inline"
                />
              </div>
              <label className="crm-field">
                <span className="crm-field__label">Phone</span>
                <input value={form.phone || ''} onChange={e => setField('phone', e.target.value)} />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Created</span>
                <input
                  className="crm-field--readonly"
                  value={lead.created_at ? new Date(lead.created_at).toLocaleString() : ''}
                  readOnly
                />
              </label>
            </div>
          </section>

          <section className="crm-drawer__section crm-drawer__section--trip">
            <div className="crm-drawer__section-head">
              <span className="crm-drawer__section-icon" aria-hidden="true">02</span>
              <h4>Trip &amp; interest</h4>
            </div>
            <div className="crm-drawer-grid">
              <label className="crm-field">
                <span className="crm-field__label">Trip type</span>
                <select value={form.trip_type || 'Package Holiday'} onChange={e => setField('trip_type', e.target.value)}>
                  {TRIP_TYPE_OPTIONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Priority</span>
                <select
                  className={`crm-field__select-priority crm-field__select-priority--${(form.priority || 'Normal').toLowerCase()}`}
                  value={form.priority || 'Normal'}
                  onChange={e => setField('priority', e.target.value)}
                >
                  {PRIORITY_OPTIONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Package interest</span>
                <input value={form.package_interest || ''} onChange={e => setField('package_interest', e.target.value)} />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Destination</span>
                <input value={form.destination || ''} onChange={e => setField('destination', e.target.value)} />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Travel dates</span>
                <input value={form.travel_dates || ''} onChange={e => setField('travel_dates', e.target.value)} />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Travelers</span>
                <input value={form.number_of_travelers || ''} onChange={e => setField('number_of_travelers', e.target.value)} />
              </label>
            </div>
          </section>

          <section className="crm-drawer__section crm-drawer__section--deal">
            <div className="crm-drawer__section-head">
              <span className="crm-drawer__section-icon" aria-hidden="true">03</span>
              <h4>Deal &amp; workflow</h4>
            </div>
            <div className="crm-drawer-grid">
              <label className="crm-field">
                <span className="crm-field__label">Budget</span>
                <input value={form.budget || ''} onChange={e => setField('budget', e.target.value)} />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Deal value</span>
                <input type="number" min="0" value={form.deal_value || 0} onChange={e => setField('deal_value', e.target.value)} />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Status</span>
                <select
                  value={form.status || 'New'}
                  onChange={e => handleStatusChange(e.target.value)}
                  disabled={statusSaving}
                >
                  {STATUS_OPTIONS.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                {statusSaving ? <span className="crm-field-saving">Saving status…</span> : null}
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Source</span>
                <select value={form.source || 'Website'} onChange={e => setField('source', e.target.value)}>
                  {SOURCE_OPTIONS.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Assigned agent</span>
                <select value={form.assigned_agent || ''} onChange={e => setField('assigned_agent', e.target.value)}>
                  <option value="">Unassigned</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.label}</option>
                  ))}
                </select>
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Follow-up date</span>
                <input type="date" value={form.follow_up_date || ''} onChange={e => setField('follow_up_date', e.target.value)} />
              </label>
            </div>
          </section>

          <section className="crm-drawer__section crm-drawer__section--notes">
            <div className="crm-drawer__section-head">
              <span className="crm-drawer__section-icon" aria-hidden="true">04</span>
              <h4>Messages &amp; notes</h4>
            </div>
            <div className="crm-drawer-grid">
              <label className="crm-field crm-form-full">
                <span className="crm-field__label">Message</span>
                <textarea rows={4} value={form.message || ''} onChange={e => setField('message', e.target.value)} />
              </label>
              <label className="crm-field crm-form-full">
                <span className="crm-field__label">Internal notes</span>
                <textarea rows={4} value={form.notes || ''} onChange={e => setField('notes', e.target.value)} />
              </label>
            </div>
          </section>

          <section className="crm-drawer__section crm-drawer__section--timeline">
            <div className="crm-drawer__section-head">
              <span className="crm-drawer__section-icon" aria-hidden="true">05</span>
              <h4>Activity timeline</h4>
            </div>
            <LeadTimeline items={timeline} />
          </section>
        </div>

        <footer className="crm-drawer__footer">
          <div className="crm-drawer__footer-quick">
            <button type="button" className="crm-drawer-action crm-drawer-action--muted" onClick={() => onMarkDone(lead.id)}>
              Mark follow-up done
            </button>
            <a
              className="crm-drawer-action crm-drawer-action--call"
              href={lead.phone ? `tel:${lead.phone}` : undefined}
              onClick={() => onLogCall(lead)}
            >
              Call
            </a>
            <a
              className="crm-drawer-action crm-drawer-action--wa"
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              onClick={() => onLogWhatsapp(lead)}
            >
              WhatsApp
            </a>
            <ComposeEmailActions
              to={form.email}
              recipientName={displayName}
              destination={form.destination}
              variant="bar"
            />
            {emailTemplatePicker}
          </div>
          <div className="crm-drawer__footer-save">
            <button type="button" className="crm-btn crm-btn--modal-ghost" onClick={onClose}>
              Close
            </button>
            <button disabled={saving} type="button" className="crm-btn crm-btn--modal-primary" onClick={handleSave}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </footer>
      </aside>
    </div>
  )
}

export default LeadDetailsDrawer
