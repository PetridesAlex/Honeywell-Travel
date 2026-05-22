import { useEffect, useState } from 'react'
import {
  CORPORATE_INDUSTRY_OPTIONS,
  CORPORATE_STATUS_OPTIONS,
  EMPTY_CORPORATE_GROUP
} from '../constants'

function GroupFormModal({ open, initialGroup, onClose, onSave, saving, saveError }) {
  const [form, setForm] = useState(EMPTY_CORPORATE_GROUP)

  useEffect(() => {
    if (initialGroup) {
      setForm({ ...EMPTY_CORPORATE_GROUP, ...initialGroup })
      return
    }
    setForm(EMPTY_CORPORATE_GROUP)
  }, [initialGroup, open])

  if (!open) return null

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(form)
  }

  const isEdit = Boolean(initialGroup?.id)

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
            <p className="crm-modal__eyebrow">{isEdit ? 'Corporate partner' : 'New cooperation'}</p>
            <h3>{isEdit ? 'Edit corporate group' : 'Add corporate group'}</h3>
            <p className="crm-modal__subtitle">Company details, contacts, and commercial terms for group travel.</p>
          </div>
          <button type="button" className="crm-modal__close" onClick={onClose} aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <form id="group-modal-form" onSubmit={handleSubmit} className="crm-modal__body">
          <section className="crm-modal__section crm-modal__section--corporate">
            <div className="crm-modal__section-head">
              <span className="crm-modal__section-icon" aria-hidden="true">★</span>
              <h4>Company</h4>
            </div>
            <div className="crm-form-grid crm-form-grid--modal">
              <label className="crm-field crm-form-full">
                <span className="crm-field__label">Company name *</span>
                <input
                  required
                  value={form.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  placeholder="Legal company name"
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Industry</span>
                <select value={form.industry || ''} onChange={(e) => handleChange('industry', e.target.value)}>
                  <option value="">Select industry</option>
                  {CORPORATE_INDUSTRY_OPTIONS.map((item) => (
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
                <span className="crm-field__label">Website</span>
                <input
                  value={form.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://"
                />
              </label>
            </div>
          </section>

          <section className="crm-modal__section">
            <div className="crm-modal__section-head">
              <span className="crm-modal__section-icon" aria-hidden="true">01</span>
              <h4>Primary contact</h4>
            </div>
            <div className="crm-form-grid crm-form-grid--modal">
              <label className="crm-field">
                <span className="crm-field__label">Contact person</span>
                <input
                  value={form.contact_person || ''}
                  onChange={(e) => handleChange('contact_person', e.target.value)}
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Email</span>
                <input
                  type="email"
                  value={form.contact_email || ''}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                />
              </label>
              <label className="crm-field crm-form-full">
                <span className="crm-field__label">Phone</span>
                <input
                  value={form.contact_phone || ''}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="crm-modal__section">
            <div className="crm-modal__section-head">
              <span className="crm-modal__section-icon" aria-hidden="true">02</span>
              <h4>Location &amp; groups</h4>
            </div>
            <div className="crm-form-grid crm-form-grid--modal">
              <label className="crm-field crm-form-full">
                <span className="crm-field__label">Address</span>
                <input value={form.address || ''} onChange={(e) => handleChange('address', e.target.value)} />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">City</span>
                <input value={form.city || ''} onChange={(e) => handleChange('city', e.target.value)} />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Country</span>
                <input value={form.country || ''} onChange={(e) => handleChange('country', e.target.value)} />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Typical group size</span>
                <input
                  value={form.typical_group_size || ''}
                  onChange={(e) => handleChange('typical_group_size', e.target.value)}
                  placeholder="e.g. 25–80 pax"
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Payment terms</span>
                <input
                  value={form.payment_terms || ''}
                  onChange={(e) => handleChange('payment_terms', e.target.value)}
                  placeholder="e.g. Net 30"
                />
              </label>
            </div>
          </section>

          <section className="crm-modal__section crm-modal__section--notes">
            <div className="crm-modal__section-head">
              <span className="crm-modal__section-icon" aria-hidden="true">03</span>
              <h4>Notes</h4>
            </div>
            <label className="crm-field crm-form-full">
              <span className="crm-field__label">Internal notes</span>
              <textarea
                rows={4}
                value={form.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Contracts, preferences, past trips…"
              />
            </label>
          </section>

          {saveError ? <p className="crm-form-error crm-form-full">{saveError}</p> : null}
        </form>

        <footer className="crm-modal__footer">
          <button type="button" className="crm-btn crm-btn--modal-ghost" onClick={onClose}>
            Cancel
          </button>
          <button disabled={saving} type="submit" form="group-modal-form" className="crm-btn crm-btn--modal-primary crm-btn--corporate">
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add corporate group'}
          </button>
        </footer>
      </div>
    </div>
  )
}

export default GroupFormModal
