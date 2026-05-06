import React, { useEffect, useState } from 'react'
import { EMPTY_LEAD, SOURCE_OPTIONS, STATUS_OPTIONS } from '../constants'

function LeadFormModal({ open, initialLead, onClose, onSave, saving, saveError }) {
  const [form, setForm] = useState(EMPTY_LEAD)

  useEffect(() => {
    if (initialLead) {
      setForm({
        ...EMPTY_LEAD,
        ...initialLead,
        follow_up_date: initialLead.follow_up_date ? initialLead.follow_up_date.slice(0, 10) : ''
      })
      return
    }
    setForm(EMPTY_LEAD)
  }, [initialLead, open])

  if (!open) return null

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(form)
  }

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <div className="crm-modal" onClick={event => event.stopPropagation()}>
        <div className="crm-modal-header">
          <h3>{initialLead?.id ? 'Edit Lead' : 'Add Lead'}</h3>
          <button type="button" className="crm-btn crm-btn-ghost" onClick={onClose}>Close</button>
        </div>

        <form onSubmit={handleSubmit} className="crm-form-grid">
          <label>
            Full Name
            <input required value={form.full_name} onChange={e => handleChange('full_name', e.target.value)} />
          </label>
          <label>
            Phone
            <input required value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
          </label>
          <label>
            Email
            <input type="email" value={form.email || ''} onChange={e => handleChange('email', e.target.value)} />
          </label>
          <label>
            Destination
            <input value={form.destination || ''} onChange={e => handleChange('destination', e.target.value)} />
          </label>
          <label>
            Travel Dates
            <input value={form.travel_dates || ''} onChange={e => handleChange('travel_dates', e.target.value)} />
          </label>
          <label>
            Number of Travelers
            <input value={form.number_of_travelers || ''} onChange={e => handleChange('number_of_travelers', e.target.value)} />
          </label>
          <label>
            Budget
            <input value={form.budget || ''} onChange={e => handleChange('budget', e.target.value)} />
          </label>
          <label>
            Deal Value
            <input type="number" min="0" value={form.deal_value || 0} onChange={e => handleChange('deal_value', e.target.value)} />
          </label>
          <label>
            Assigned Agent
            <input value={form.assigned_agent || ''} onChange={e => handleChange('assigned_agent', e.target.value)} />
          </label>
          <label>
            Status
            <select value={form.status || 'New'} onChange={e => handleChange('status', e.target.value)}>
              {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label>
            Source
            <select value={form.source || 'Website'} onChange={e => handleChange('source', e.target.value)}>
              {SOURCE_OPTIONS.map(source => <option key={source} value={source}>{source}</option>)}
            </select>
          </label>
          <label>
            Follow-up Date
            <input type="date" value={form.follow_up_date || ''} onChange={e => handleChange('follow_up_date', e.target.value)} />
          </label>
          <label className="crm-form-full">
            Message
            <textarea rows={3} value={form.message || ''} onChange={e => handleChange('message', e.target.value)} />
          </label>
          <label className="crm-form-full">
            Notes
            <textarea rows={3} value={form.notes || ''} onChange={e => handleChange('notes', e.target.value)} />
          </label>
          {saveError ? <p className="crm-form-error crm-form-full">{saveError}</p> : null}
          <div className="crm-modal-actions crm-form-full">
            <button type="button" className="crm-btn crm-btn-ghost" onClick={onClose}>Cancel</button>
            <button disabled={saving} type="submit" className="crm-btn crm-btn-primary">
              {saving ? 'Saving...' : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LeadFormModal
