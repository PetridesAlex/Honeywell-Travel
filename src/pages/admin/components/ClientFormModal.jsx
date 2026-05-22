import { useEffect, useState } from 'react'
import { EMPTY_CLIENT } from '../constants'

function ClientFormModal({ open, initialClient, onClose, onSave, saving, saveError }) {
  const [form, setForm] = useState(EMPTY_CLIENT)

  useEffect(() => {
    if (initialClient) {
      setForm({
        ...EMPTY_CLIENT,
        ...initialClient,
        date_of_issue: initialClient.date_of_issue ? initialClient.date_of_issue.slice(0, 10) : '',
        date_of_expiry: initialClient.date_of_expiry ? initialClient.date_of_expiry.slice(0, 10) : '',
        date_of_birth: initialClient.date_of_birth ? initialClient.date_of_birth.slice(0, 10) : ''
      })
      return
    }
    setForm(EMPTY_CLIENT)
  }, [initialClient, open])

  if (!open) return null

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(form)
  }

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      <div className="crm-modal" onClick={(event) => event.stopPropagation()}>
        <div className="crm-modal-header">
          <h3>{initialClient?.id ? 'Edit client' : 'Add client'}</h3>
          <button type="button" className="crm-btn crm-btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="crm-form-grid">
          <label>
            Name
            <input required value={form.first_name} onChange={(e) => handleChange('first_name', e.target.value)} />
          </label>
          <label>
            Surname
            <input required value={form.last_name} onChange={(e) => handleChange('last_name', e.target.value)} />
          </label>
          <label>
            Email
            <input type="email" required value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
          </label>
          <label>
            Phone
            <input value={form.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} />
          </label>
          <label>
            Nationality
            <input
              value={form.nationality || ''}
              onChange={(e) => handleChange('nationality', e.target.value)}
              placeholder="e.g. Cypriot, British"
            />
          </label>
          <label>
            Date of birth
            <input type="date" value={form.date_of_birth || ''} onChange={(e) => handleChange('date_of_birth', e.target.value)} />
          </label>

          <p className="crm-form-section crm-form-full">Passport details</p>

          <label>
            Passport number
            <input
              value={form.passport_number || ''}
              onChange={(e) => handleChange('passport_number', e.target.value)}
              placeholder="Passport number"
            />
          </label>
          <label>
            Date of issue
            <input
              type="date"
              value={form.date_of_issue || ''}
              onChange={(e) => handleChange('date_of_issue', e.target.value)}
            />
          </label>
          <label>
            Date of expiry
            <input
              type="date"
              value={form.date_of_expiry || ''}
              onChange={(e) => handleChange('date_of_expiry', e.target.value)}
            />
          </label>

          <label className="crm-form-full">
            Notes
            <textarea rows={3} value={form.notes || ''} onChange={(e) => handleChange('notes', e.target.value)} />
          </label>

          {saveError ? <p className="crm-form-error crm-form-full">{saveError}</p> : null}

          <div className="crm-modal-actions crm-form-full">
            <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={onClose}>
              Cancel
            </button>
            <button disabled={saving} type="submit" className="crm-btn crm-btn-primary">
              {saving ? 'Saving...' : 'Save client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClientFormModal
