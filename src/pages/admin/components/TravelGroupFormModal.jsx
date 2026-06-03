import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { EMPTY_TRAVEL_GROUP, TRAVEL_GROUP_STATUSES, TRAVEL_GROUP_TYPES } from '../constants'

function TravelGroupFormModal({ open, initialGroup, onClose, onSave, saving, saveError }) {
  const [form, setForm] = useState(EMPTY_TRAVEL_GROUP)

  useEffect(() => {
    if (initialGroup) {
      setForm({
        ...EMPTY_TRAVEL_GROUP,
        ...initialGroup,
        departure_date: initialGroup.departure_date ? initialGroup.departure_date.slice(0, 10) : '',
        return_date: initialGroup.return_date ? initialGroup.return_date.slice(0, 10) : ''
      })
      return
    }
    setForm(EMPTY_TRAVEL_GROUP)
  }, [initialGroup, open])

  if (!open) return null

  const isEdit = Boolean(initialGroup?.id)

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(form)
  }

  return createPortal(
    <div className="crm-modal-backdrop crm-modal-backdrop--premium" onClick={onClose} role="presentation">
      <div className="crm-modal crm-modal--lead crm-modal--travel-group" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className="crm-modal__hero crm-modal__hero--confirm">
          <div className="crm-modal__hero-text">
            <p className="crm-modal__eyebrow">Group booking</p>
            <h3>{isEdit ? 'Edit group' : 'New group'}</h3>
            <p className="crm-modal__subtitle">Cruise, school, corporate, or incentive — then import your passenger list.</p>
          </div>
          <button type="button" className="crm-modal__close" onClick={onClose} aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <form id="travel-group-form" className="crm-modal__body" onSubmit={handleSubmit}>
          {saveError ? <div className="crm-form-error">{saveError}</div> : null}
          <div className="crm-form-grid">
            <label className="crm-form-full">
              <span className="crm-field__label">Group name</span>
              <input value={form.group_name} onChange={(e) => handleChange('group_name', e.target.value)} required />
            </label>
            <label>
              <span className="crm-field__label">Type</span>
              <select value={form.group_type} onChange={(e) => handleChange('group_type', e.target.value)}>
                {TRAVEL_GROUP_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="crm-field__label">Status</span>
              <select value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
                {TRAVEL_GROUP_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="crm-field__label">Departure date</span>
              <input type="date" value={form.departure_date} onChange={(e) => handleChange('departure_date', e.target.value)} />
            </label>
            <label>
              <span className="crm-field__label">Return date</span>
              <input type="date" value={form.return_date} onChange={(e) => handleChange('return_date', e.target.value)} />
            </label>
            <label>
              <span className="crm-field__label">Destination</span>
              <input value={form.destination} onChange={(e) => handleChange('destination', e.target.value)} />
            </label>
            <label>
              <span className="crm-field__label">Supplier</span>
              <input value={form.supplier} onChange={(e) => handleChange('supplier', e.target.value)} />
            </label>
            <label className="crm-form-full">
              <span className="crm-field__label">Notes</span>
              <textarea rows={3} value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} />
            </label>
          </div>
        </form>

        <footer className="crm-modal__footer">
          <button type="button" className="crm-btn crm-btn--modal-ghost" onClick={onClose}>
            Cancel
          </button>
          <button disabled={saving} type="submit" form="travel-group-form" className="crm-btn crm-btn--modal-primary">
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create group'}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  )
}

export default TravelGroupFormModal
