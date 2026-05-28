import { useEffect, useState } from 'react'
import {
  Building2,
  Globe2,
  MapPin,
  MessageSquareText,
  Phone,
  UserRound,
  X
} from 'lucide-react'
import {
  CORPORATE_SERVICE_CATEGORIES,
  CORPORATE_STATUS_OPTIONS,
  EMPTY_CORPORATE_SERVICE_CONTACT
} from '../constants'
import { getServiceCategoryMeta } from '../utils/serviceCategories'

function SectionBlock({ icon: Icon, title, hint, children }) {
  return (
    <section className="crm-modal__section crm-modal__section--service-contact">
      <div className="crm-modal__section-head">
        <span className="crm-modal__section-icon crm-modal__section-icon--svg" aria-hidden="true">
          <Icon size={14} strokeWidth={2.25} />
        </span>
        <div className="crm-modal__section-copy">
          <h4>{title}</h4>
          {hint ? <p>{hint}</p> : null}
        </div>
      </div>
      {children}
    </section>
  )
}

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
  const categoryMeta = getServiceCategoryMeta(form.category)
  const CategoryIcon = categoryMeta.icon

  return (
    <div className="crm-modal-backdrop crm-modal-backdrop--premium crm-modal-backdrop--service-contact" onClick={onClose} role="presentation">
      <div
        className="crm-modal crm-modal--lead crm-modal--service-contact"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-contact-modal-title"
      >
        <header className="crm-modal__hero crm-modal__hero--services">
          <div className="crm-modal__hero-text">
            <p className="crm-modal__eyebrow">{isEdit ? 'Supplier directory' : 'New supplier contact'}</p>
            <h3 id="service-contact-modal-title">{isEdit ? 'Edit service contact' : 'Add service contact'}</h3>
            <p className="crm-modal__subtitle">
              Save supplier details in a clean, structured record your team can find instantly.
            </p>
            <div className="crm-service-contact-hero__chips">
              <span className={`crm-service-contact-chip crm-service-contact-chip--${categoryMeta.tone}`}>
                <CategoryIcon size={14} strokeWidth={2.2} aria-hidden />
                {form.category}
              </span>
              <span className="crm-service-contact-chip crm-service-contact-chip--status">
                {form.status || 'Active'}
              </span>
            </div>
          </div>
          <button type="button" className="crm-modal__close" onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={2.25} />
          </button>
        </header>

        <form id="corp-contact-modal-form" onSubmit={handleSubmit} className="crm-modal__body crm-modal__body--service-contact">
          <SectionBlock icon={Building2} title="Organization" hint="Company or supplier name and service classification.">
            <div className="crm-form-grid crm-form-grid--modal">
              <label className="crm-field crm-form-full">
                <span className="crm-field__label">Organization / company *</span>
                <input
                  className="crm-input"
                  required
                  value={form.organization}
                  onChange={(e) => handleChange('organization', e.target.value)}
                  placeholder="e.g. Cyprus DMC, Hilton Nicosia"
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Service category</span>
                <select className="crm-select" value={form.category} onChange={(e) => handleChange('category', e.target.value)}>
                  {CORPORATE_SERVICE_CATEGORIES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Status</span>
                <select className="crm-select" value={form.status || 'Active'} onChange={(e) => handleChange('status', e.target.value)}>
                  {CORPORATE_STATUS_OPTIONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
          </SectionBlock>

          <SectionBlock icon={UserRound} title="Contact person" hint="Who should the team ask for when calling or emailing.">
            <div className="crm-form-grid crm-form-grid--modal">
              <label className="crm-field">
                <span className="crm-field__label">Contact name</span>
                <input
                  className="crm-input"
                  value={form.contact_name || ''}
                  onChange={(e) => handleChange('contact_name', e.target.value)}
                  placeholder="Person to ask for"
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Job title</span>
                <input
                  className="crm-input"
                  value={form.job_title || ''}
                  onChange={(e) => handleChange('job_title', e.target.value)}
                  placeholder="e.g. Sales manager"
                />
              </label>
            </div>
          </SectionBlock>

          <SectionBlock icon={Phone} title="Communication" hint="Direct lines and email for quick outreach.">
            <div className="crm-form-grid crm-form-grid--modal">
              <label className="crm-field">
                <span className="crm-field__label">Email</span>
                <input
                  className="crm-input"
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="name@company.com"
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Phone</span>
                <input
                  className="crm-input"
                  type="tel"
                  value={form.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+357 …"
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Mobile</span>
                <input
                  className="crm-input"
                  type="tel"
                  value={form.mobile || ''}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  placeholder="+357 …"
                />
              </label>
            </div>
          </SectionBlock>

          <SectionBlock icon={MapPin} title="Location & web" hint="Where they operate and any booking portal.">
            <div className="crm-form-grid crm-form-grid--modal">
              <label className="crm-field">
                <span className="crm-field__label">City</span>
                <input className="crm-input" value={form.city || ''} onChange={(e) => handleChange('city', e.target.value)} placeholder="Nicosia" />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Country</span>
                <input className="crm-input" value={form.country || ''} onChange={(e) => handleChange('country', e.target.value)} placeholder="Cyprus" />
              </label>
              <label className="crm-field crm-form-full">
                <span className="crm-field__label">Website</span>
                <input
                  className="crm-input"
                  type="url"
                  value={form.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://"
                />
              </label>
            </div>
          </SectionBlock>

          <SectionBlock icon={MessageSquareText} title="Internal notes" hint="Rates, account refs, or anything the team should remember.">
            <label className="crm-field crm-field--full">
              <span className="crm-field__label">Notes</span>
              <textarea
                className="crm-textarea crm-textarea--service-contact"
                rows={4}
                value={form.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Best time to call, account ref, special rates, escalation contact…"
              />
            </label>
          </SectionBlock>

          {saveError ? <p className="crm-form-error crm-form-full">{saveError}</p> : null}
        </form>

        <footer className="crm-modal__footer crm-modal__footer--split crm-modal__footer--service-contact">
          {isEdit && onDelete ? (
            <button type="button" className="crm-btn crm-btn-danger" onClick={onDelete} disabled={saving}>
              Delete contact
            </button>
          ) : (
            <span className="crm-modal__footer-note">
              <Globe2 size={14} aria-hidden />
              Saved to Services Hub &amp; Corp. Services List
            </span>
          )}
          <div className="crm-modal__footer-actions">
            <button type="button" className="crm-btn crm-btn--modal-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              disabled={saving}
              type="submit"
              form="corp-contact-modal-form"
              className="crm-btn crm-btn--modal-primary crm-btn--service-contact-save"
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
