import React, { useEffect, useMemo, useState } from 'react'
import { SOURCE_OPTIONS, STATUS_OPTIONS } from '../constants'
import LeadTimeline from './LeadTimeline'

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
  emailTemplatePicker
}) {
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [statusSaving, setStatusSaving] = useState(false)

  useEffect(() => {
    setForm(lead ? { ...lead, follow_up_date: lead.follow_up_date ? lead.follow_up_date.slice(0, 10) : '' } : null)
  }, [lead])

  const whatsappHref = useMemo(() => {
    if (!lead?.phone) return undefined
    const phone = String(lead.phone).replace(/[^\d+]/g, '').replace('+', '')
    const text = `Hello ${lead.full_name || ''}, thank you for your interest in ${lead.destination || 'our travel packages'}. We will prepare your offer shortly.`
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
  }, [lead])

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
    await onSave(lead.id, {
      status: form.status,
      source: form.source,
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
    <div className="crm-modal-backdrop" onClick={onClose}>
      <aside className="crm-drawer" onClick={e => e.stopPropagation()}>
        <div className="crm-modal-header">
          <h3>Lead Details</h3>
          <button type="button" className="crm-btn crm-btn-ghost" onClick={onClose}>Close</button>
        </div>

        <div className="crm-drawer-grid">
          <label>Full Name<input value={form.full_name || ''} readOnly /></label>
          <label>Phone<input value={form.phone || ''} readOnly /></label>
          <label>Email<input value={form.email || ''} readOnly /></label>
          <label>Created<input value={lead.created_at ? new Date(lead.created_at).toLocaleString() : ''} readOnly /></label>

          <label>Destination<input value={form.destination || ''} onChange={e => setField('destination', e.target.value)} /></label>
          <label>Travel Dates<input value={form.travel_dates || ''} onChange={e => setField('travel_dates', e.target.value)} /></label>
          <label>Travelers<input value={form.number_of_travelers || ''} onChange={e => setField('number_of_travelers', e.target.value)} /></label>
          <label>Budget<input value={form.budget || ''} onChange={e => setField('budget', e.target.value)} /></label>
          <label>Deal Value<input type="number" min="0" value={form.deal_value || 0} onChange={e => setField('deal_value', e.target.value)} /></label>

          <label>Status
            <select value={form.status || 'New'} onChange={e => handleStatusChange(e.target.value)} disabled={statusSaving}>
              {STATUS_OPTIONS.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
            {statusSaving ? <span className="crm-field-saving">Saving status...</span> : null}
          </label>
          <label>Source
            <select value={form.source || 'Website'} onChange={e => setField('source', e.target.value)}>
              {SOURCE_OPTIONS.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>Assigned Agent
            <select value={form.assigned_agent || ''} onChange={e => setField('assigned_agent', e.target.value)}>
              <option value="">Unassigned</option>
              {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.label}</option>)}
            </select>
          </label>
          <label>Follow-up Date<input type="date" value={form.follow_up_date || ''} onChange={e => setField('follow_up_date', e.target.value)} /></label>

          <label className="crm-form-full">Message<textarea rows={4} value={form.message || ''} onChange={e => setField('message', e.target.value)} /></label>
          <label className="crm-form-full">Notes<textarea rows={4} value={form.notes || ''} onChange={e => setField('notes', e.target.value)} /></label>
        </div>

        <div className="crm-drawer-actions">
          <button className="crm-btn crm-btn-ghost" onClick={() => onMarkDone(lead.id)}>Mark Follow-up Done</button>
          <a className="crm-link-btn" href={lead.phone ? `tel:${lead.phone}` : undefined} onClick={() => onLogCall(lead)}>Call</a>
          <a className="crm-link-btn" href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => onLogWhatsapp(lead)}>WhatsApp</a>
          {emailTemplatePicker}
          <button disabled={saving} className="crm-btn crm-btn-primary" onClick={handleSave}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="crm-drawer-timeline">
          <h4>Activity Timeline</h4>
          <LeadTimeline items={timeline} />
        </div>
      </aside>
    </div>
  )
}

export default LeadDetailsDrawer
