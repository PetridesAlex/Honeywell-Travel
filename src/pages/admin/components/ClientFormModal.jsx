import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Building2, UserRound } from 'lucide-react'
import { EMPTY_CLIENT } from '../constants'
import { fetchCorporateGroups } from '../api/groupsApi'
import { CLIENT_TYPE_OPTIONS, normalizeClientType } from '../utils/clients'

function ClientFormModal({
  open,
  initialClient,
  defaultClientType = 'individual',
  onClose,
  onSave,
  saving,
  saveError
}) {
  const [form, setForm] = useState(EMPTY_CLIENT)
  const [groups, setGroups] = useState([])
  const [groupsLoading, setGroupsLoading] = useState(false)

  useEffect(() => {
    if (initialClient) {
      setForm({
        ...EMPTY_CLIENT,
        ...initialClient,
        client_type: normalizeClientType(initialClient.client_type),
        corporate_group_id: initialClient.corporate_group_id ?? '',
        date_of_issue: initialClient.date_of_issue ? initialClient.date_of_issue.slice(0, 10) : '',
        date_of_expiry: initialClient.date_of_expiry ? initialClient.date_of_expiry.slice(0, 10) : '',
        date_of_birth: initialClient.date_of_birth ? initialClient.date_of_birth.slice(0, 10) : ''
      })
      return
    }
    setForm({
      ...EMPTY_CLIENT,
      client_type: normalizeClientType(defaultClientType)
    })
  }, [initialClient, open, defaultClientType])

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    setGroupsLoading(true)
    fetchCorporateGroups().then(({ data }) => {
      setGroups(data || [])
      setGroupsLoading(false)
    })
  }, [open])

  if (!open) return null

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleTypeChange = (type) => {
    setForm((prev) => ({
      ...prev,
      client_type: normalizeClientType(type),
      corporate_group_id: normalizeClientType(type) === 'group' ? prev.corporate_group_id : ''
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(form)
  }

  const isGroup = normalizeClientType(form.client_type) === 'group'

  return createPortal(
    <div className="crm-modal-backdrop crm-modal-backdrop--premium" onClick={onClose} role="presentation">
      <div
        className="crm-modal crm-modal--lead crm-modal--client"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-form-title"
      >
        <header className="crm-modal__hero crm-modal__hero--client">
          <div className="crm-modal__hero-text">
            <p className="crm-modal__eyebrow">{initialClient?.id ? 'Client profile' : 'New client'}</p>
            <h3 id="client-form-title">{initialClient?.id ? 'Edit client' : 'Add client'}</h3>
            <p className="crm-modal__subtitle">
              Choose a category, add passport details, and link group travelers to a corporate partner when needed.
            </p>
          </div>
          <button type="button" className="crm-modal__close" onClick={onClose} aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <form id="client-modal-form" onSubmit={handleSubmit} className="crm-modal__body">
          <section className="crm-modal__section crm-client-category-section">
            <div className="crm-modal__section-head">
              <span className="crm-modal__section-icon">CAT</span>
              <h4>Client category</h4>
            </div>

            <div className="crm-client-type-cards" role="radiogroup" aria-label="Client category">
              {CLIENT_TYPE_OPTIONS.map((option) => {
                const active = normalizeClientType(form.client_type) === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={`crm-client-type-card${active ? ' crm-client-type-card--active' : ''} crm-client-type-card--${option.id}`}
                    onClick={() => handleTypeChange(option.id)}
                  >
                    <span className="crm-client-type-card__icon" aria-hidden="true">
                      {option.id === 'group' ? <Building2 size={20} /> : <UserRound size={20} />}
                    </span>
                    <span className="crm-client-type-card__copy">
                      <strong>{option.label}</strong>
                      <span>{option.description}</span>
                    </span>
                  </button>
                )
              })}
            </div>

            {isGroup ? (
              <label className="crm-field crm-client-group-link">
                <span className="crm-field__label">Corporate / group partner</span>
                <select
                  value={form.corporate_group_id || ''}
                  onChange={(e) => handleChange('corporate_group_id', e.target.value)}
                >
                  <option value="">Select company (optional)</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.company_name}
                    </option>
                  ))}
                </select>
                {groupsLoading ? (
                  <span className="crm-client-group-link__hint">Loading partners…</span>
                ) : groups.length === 0 ? (
                  <span className="crm-client-group-link__hint">
                    No corporate partners yet — add them under Corporate Groups.
                  </span>
                ) : null}
              </label>
            ) : null}
          </section>

          <section className="crm-modal__section">
            <div className="crm-modal__section-head">
              <span className="crm-modal__section-icon">ID</span>
              <h4>Personal details</h4>
            </div>
            <div className="crm-form-grid crm-form-grid--modal">
              <label className="crm-field">
                <span className="crm-field__label">Name *</span>
                <input required value={form.first_name} onChange={(e) => handleChange('first_name', e.target.value)} />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Surname *</span>
                <input required value={form.last_name} onChange={(e) => handleChange('last_name', e.target.value)} />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Email *</span>
                <input type="email" required value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Phone</span>
                <input value={form.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Nationality</span>
                <input
                  value={form.nationality || ''}
                  onChange={(e) => handleChange('nationality', e.target.value)}
                  placeholder="e.g. Cypriot, British"
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Date of birth</span>
                <input
                  type="date"
                  value={form.date_of_birth || ''}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="crm-modal__section">
            <div className="crm-modal__section-head">
              <span className="crm-modal__section-icon">PP</span>
              <h4>Passport details</h4>
            </div>
            <div className="crm-form-grid crm-form-grid--modal">
              <label className="crm-field">
                <span className="crm-field__label">Passport number</span>
                <input
                  value={form.passport_number || ''}
                  onChange={(e) => handleChange('passport_number', e.target.value)}
                  placeholder="Passport number"
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Date of issue</span>
                <input
                  type="date"
                  value={form.date_of_issue || ''}
                  onChange={(e) => handleChange('date_of_issue', e.target.value)}
                />
              </label>
              <label className="crm-field">
                <span className="crm-field__label">Date of expiry</span>
                <input
                  type="date"
                  value={form.date_of_expiry || ''}
                  onChange={(e) => handleChange('date_of_expiry', e.target.value)}
                />
              </label>
              <label className="crm-field crm-form-full">
                <span className="crm-field__label">Notes</span>
                <textarea rows={3} value={form.notes || ''} onChange={(e) => handleChange('notes', e.target.value)} />
              </label>
            </div>
          </section>

          {saveError ? <p className="crm-form-error crm-form-full">{saveError}</p> : null}
        </form>

        <footer className="crm-modal__footer">
          <button type="button" className="crm-btn crm-btn--modal-ghost" onClick={onClose}>
            Cancel
          </button>
          <button disabled={saving} type="submit" form="client-modal-form" className="crm-btn crm-btn--modal-primary">
            {saving ? 'Saving…' : initialClient?.id ? 'Save changes' : 'Save client'}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  )
}

export default ClientFormModal
