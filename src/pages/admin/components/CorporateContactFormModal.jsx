import { useEffect, useState } from 'react'
import {
  CORPORATE_SERVICE_CATEGORIES,
  CORPORATE_STATUS_OPTIONS,
  EMPTY_CORPORATE_SERVICE_CONTACT
} from '../constants'

function CorporateContactFormModal({ open, initialContact, onClose, onSave, onDelete, saving, saveError }) {
  const [form, setForm] = useState(EMPTY_CORPORATE_SERVICE_CONTACT)

  useEffect(() => {
    if (initialContact) {
      setForm({ ...EMPTY_CORPORATE_SERVICE_CONTACT, ...initialContact })
      return
    }
    setForm(EMPTY_CORPORATE_SERVICE_CONTACT)
  }, [initialContact, open])

  if (!open) return null

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(form)
  }

  const isEdit = Boolean(initialContact?.id)

  return (
    <div className="crm-modal-backdrop crm-modal-backdrop--premium" onClick={onClose} role="presentation">
      <div
        className="crm-modal crm-modal--lead crm-modal--group"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="crm-modal__hero crm-modal__hero--corporate">
          <div className="crm-modal__hero-text">
            <p className="crm-modal__eyebrow">{isEdit ? 'Service contact' : 'New contact'}</p>
            <h3>{isEdit ? 'Edit contact' : 'Add service contact'}</h3>
            <p className="crm-modal__subtitle">
              Supplier, DMC, hotel, or corporate services contact for the team directory.
            </p>
          </div>
          <button type="button" className="crm-modal__close" onClick={onClose} aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <form id="corp-contact-modal-form" onSubmit={handleSubmit} className="crm-modal__body">
          <section className="crm-modal__section crm-modal__section--corporate">
            <div className="crm-form-grid crm-form-grid--modal">
              <label className="crm-field crm-form-full">
                <span className="crm-field__label">Organization / company *</span>
                <input
                  required
                  value={form.organization}
                  onChange={(e) => handleChange('organization', e.target.value)}
                  placeholder="e.g. Cyprus DMC, Hilton Nicosia"
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Contact name</span>
                <input
                  value={form.contact_name || ''}
                  onChange={(e) => handleChange('contact_name', e.target.value)}
                  placeholder="Person to ask for"
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Job title</span>
                <input
                  value={form.job_title || ''}
                  onChange={(e) => handleChange('job_title', e.target.value)}
                  placeholder="e.g. Sales manager"
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Category</span>
                <select value={form.category} onChange={(e) => handleChange('category', e.target.value)}>
                  {CORPORATE_SERVICE_CATEGORIES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Status</span>
                <select value={form.status || 'Active'} onChange={(e) => handleChange('status', e.target.value)}>
                  {CORPORATE_STATUS_OPTIONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Email</span>
                <input
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Phone</span>
                <input
                  type="tel"
                  value={form.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Mobile</span>
                <input
                  type="tel"
                  value={form.mobile || ''}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">City</span>
                <input value={form.city || ''} onChange={(e) => handleChange('city', e.target.value)} />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Country</span>
                <input value={form.country || ''} onChange={(e) => handleChange('country', e.target.value)} />
              </label>
              <label className="crm-field crm-form-full">
                <span className="crm-field__label">Website</span>
                <input
                  type="url"
                  value={form.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://"
                />
              </label>
              <label className="crm-field crm-form-full">
                <span className="crm-field__label">Notes</span>
                <textarea
                  rows={3}
                  value={form.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Best time to call, account ref, special rates…"
                />
              </label>
            </div>
          </section>
          {saveError ? <p className="crm-form-error crm-form-full">{saveError}</p> : null}
        </form>

        <footer className="crm-modal__footer crm-modal__footer--split">
          {isEdit && onDelete ? (
            <button type="button" className="crm-btn crm-btn-danger" onClick={onDelete} disabled={saving}>
              Delete contact
            </button>
          ) : (
            <span />
          )}
          <div className="crm-modal__footer-actions">
            <button type="button" className="crm-btn crm-btn--modal-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              disabled={saving}
              type="submit"
              form="corp-contact-modal-form"
              className="crm-btn crm-btn--modal-primary crm-btn--corporate-header"
            >
              {saving ? 'Saving…' : isEdit ? 'Save contact' : 'Add contact'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default CorporateContactFormModal
