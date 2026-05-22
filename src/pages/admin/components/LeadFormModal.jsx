import React, { useEffect, useState } from 'react'
import { EMPTY_LEAD, PRIORITY_OPTIONS, SOURCE_OPTIONS, STATUS_OPTIONS, TRIP_TYPE_OPTIONS } from '../constants'
import { parseLeadName } from '../utils/leadName'

function LeadFormModal({ open, initialLead, onClose, onSave, saving, saveError }) {
  const [form, setForm] = useState(EMPTY_LEAD)

  useEffect(() => {
    if (initialLead) {
      const names = parseLeadName(initialLead)
      setForm({
        ...EMPTY_LEAD,
        ...initialLead,
        ...names,
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

  const isEdit = Boolean(initialLead?.id)

  return (
    <div className="crm-modal-backdrop crm-modal-backdrop--premium" onClick={onClose} role="presentation">
      <div
        className="crm-modal crm-modal--lead"
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
      >
        <header className="crm-modal__hero">
          <div className="crm-modal__hero-text">
            <p className="crm-modal__eyebrow">{isEdit ? 'Lead workspace' : 'New enquiry'}</p>
            <h3 id="lead-modal-title">{isEdit ? 'Edit lead' : 'Add lead'}</h3>
            <p className="crm-modal__subtitle">
              Capture contact, trip intent, and follow-up in one place.
            </p>
          </div>
          <button
            type="button"
            className="crm-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <form id="lead-modal-form" onSubmit={handleSubmit} className="crm-modal__body">
          <section className="crm-modal__section">
            <div className="crm-modal__section-head">
              <span className="crm-modal__section-icon" aria-hidden="true">01</span>
              <h4>Contact</h4>
            </div>
            <div className="crm-form-grid crm-form-grid--modal">
              <label className="crm-field">
                <span className="crm-field__label">Name</span>
                <input
                  required
                  value={form.first_name}
                  onChange={e => handleChange('first_name', e.target.value)}
                  placeholder="First name"
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Surname</span>
                <input
                  required
                  value={form.last_name}
                  onChange={e => handleChange('last_name', e.target.value)}
                  placeholder="Last name"
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Email</span>
                <input
                  type="email"
                  required
                  value={form.email || ''}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="name@email.com"
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Phone</span>
                <input
                  required
                  value={form.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  placeholder="+357 …"
                />
              </label>
            </div>
          </section>

          <section className="crm-modal__section">
            <div className="crm-modal__section-head">
              <span className="crm-modal__section-icon" aria-hidden="true">02</span>
              <h4>Trip &amp; interest</h4>
            </div>
            <div className="crm-form-grid crm-form-grid--modal">
              <label className="crm-field">
                <span className="crm-field__label">Trip type</span>
                <select value={form.trip_type || 'Package Holiday'} onChange={e => handleChange('trip_type', e.target.value)}>
                  {TRIP_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Priority</span>
                <select
                  className={`crm-field__select-priority crm-field__select-priority--${(form.priority || 'Normal').toLowerCase()}`}
                  value={form.priority || 'Normal'}
                  onChange={e => handleChange('priority', e.target.value)}
                >
                  {PRIORITY_OPTIONS.map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Destination</span>
                <input
                  value={form.destination || ''}
                  onChange={e => handleChange('destination', e.target.value)}
                  placeholder="e.g. Portugal, Greece cruise"
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Package / interest</span>
                <input
                  value={form.package_interest || ''}
                  onChange={e => handleChange('package_interest', e.target.value)}
                  placeholder="Package name or service"
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Travel dates</span>
                <input
                  value={form.travel_dates || ''}
                  onChange={e => handleChange('travel_dates', e.target.value)}
                  placeholder="e.g. 15 Jul – 22 Jul 2026"
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Number of travelers</span>
                <input
                  value={form.number_of_travelers || ''}
                  onChange={e => handleChange('number_of_travelers', e.target.value)}
                  placeholder="2 adults, 1 child"
                />
              </label>
            </div>
          </section>

          <section className="crm-modal__section">
            <div className="crm-modal__section-head">
              <span className="crm-modal__section-icon" aria-hidden="true">03</span>
              <h4>Deal &amp; workflow</h4>
            </div>
            <div className="crm-form-grid crm-form-grid--modal">
              <label className="crm-field">
                <span className="crm-field__label">Budget</span>
                <input value={form.budget || ''} onChange={e => handleChange('budget', e.target.value)} placeholder="€ range" />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Deal value</span>
                <input
                  type="number"
                  min="0"
                  value={form.deal_value || 0}
                  onChange={e => handleChange('deal_value', e.target.value)}
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Assigned agent</span>
                <input
                  value={form.assigned_agent || ''}
                  onChange={e => handleChange('assigned_agent', e.target.value)}
                  placeholder="Agent name"
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Status</span>
                <select value={form.status || 'New'} onChange={e => handleChange('status', e.target.value)}>
                  {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Source</span>
                <select value={form.source || 'Website'} onChange={e => handleChange('source', e.target.value)}>
                  {SOURCE_OPTIONS.map(source => <option key={source} value={source}>{source}</option>)}
                </select>
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Follow-up date</span>
                <input type="date" value={form.follow_up_date || ''} onChange={e => handleChange('follow_up_date', e.target.value)} />
              </label>
            </div>
          </section>

          <section className="crm-modal__section crm-modal__section--notes">
            <div className="crm-modal__section-head">
              <span className="crm-modal__section-icon" aria-hidden="true">04</span>
              <h4>Notes</h4>
            </div>
            <div className="crm-form-grid crm-form-grid--modal">
              <label className="crm-field crm-form-full">
                <span className="crm-field__label">Message</span>
                <textarea
                  rows={3}
                  value={form.message || ''}
                  onChange={e => handleChange('message', e.target.value)}
                  placeholder="Initial enquiry from the client…"
                />
              </label>
              <label className="crm-field crm-form-full">
                <span className="crm-field__label">Internal notes</span>
                <textarea
                  rows={3}
                  value={form.notes || ''}
                  onChange={e => handleChange('notes', e.target.value)}
                  placeholder="Team-only notes"
                />
              </label>
            </div>
          </section>

          {saveError ? <p className="crm-form-error crm-form-full">{saveError}</p> : null}
        </form>

        <footer className="crm-modal__footer">
          <button type="button" className="crm-btn crm-btn--modal-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            disabled={saving}
            type="submit"
            form="lead-modal-form"
            className="crm-btn crm-btn--modal-primary"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create lead'}
          </button>
        </footer>
      </div>
    </div>
  )
}

export default LeadFormModal
