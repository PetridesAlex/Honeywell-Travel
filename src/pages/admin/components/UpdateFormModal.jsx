import { useEffect, useState } from 'react'
import { EMPTY_TEAM_UPDATE } from '../constants'
import { TEAM_UPDATE_CATEGORIES } from '../utils/team'

function UpdateFormModal({ open, initialUpdate, onClose, onSave, saving, saveError }) {
  const [form, setForm] = useState(EMPTY_TEAM_UPDATE)

  useEffect(() => {
    if (initialUpdate) {
      setForm({ ...EMPTY_TEAM_UPDATE, ...initialUpdate, pinned: Boolean(initialUpdate.pinned) })
      return
    }
    setForm(EMPTY_TEAM_UPDATE)
  }, [initialUpdate, open])

  if (!open) return null

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))
  const isEdit = Boolean(initialUpdate?.id)

  return (
    <div className="crm-modal-backdrop crm-modal-backdrop--premium" onClick={onClose} role="presentation">
      <div className="crm-modal crm-modal--lead crm-modal--team" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="crm-modal__hero crm-modal__hero--team">
          <div className="crm-modal__hero-text">
            <p className="crm-modal__eyebrow">Team broadcast</p>
            <h3>{isEdit ? 'Edit post' : 'Share news or update'}</h3>
            <p className="crm-modal__subtitle">Visible to everyone logged into the CRM.</p>
          </div>
          <button type="button" className="crm-modal__close" onClick={onClose} aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <form
          id="update-modal-form"
          onSubmit={(e) => {
            e.preventDefault()
            onSave(form)
          }}
          className="crm-modal__body"
        >
          <div className="crm-form-grid crm-form-grid--modal">
            <label className="crm-field">
              <span className="crm-field__label">Category</span>
              <select value={form.category} onChange={(e) => handleChange('category', e.target.value)}>
                {TEAM_UPDATE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </label>
            <label className="crm-field crm-field--checkbox">
              <input
                type="checkbox"
                checked={Boolean(form.pinned)}
                onChange={(e) => handleChange('pinned', e.target.checked)}
              />
              <span>Pin to top</span>
            </label>
            <label className="crm-field crm-form-full">
              <span className="crm-field__label">Headline *</span>
              <input required value={form.title} onChange={(e) => handleChange('title', e.target.value)} />
            </label>
            <label className="crm-field crm-form-full">
              <span className="crm-field__label">Message *</span>
              <textarea
                required
                rows={6}
                value={form.body}
                onChange={(e) => handleChange('body', e.target.value)}
                placeholder="News, policy change, office update, reminder for the team…"
              />
            </label>
          </div>
          {saveError ? <p className="crm-form-error">{saveError}</p> : null}
        </form>
        <footer className="crm-modal__footer">
          <button type="button" className="crm-btn crm-btn--modal-ghost" onClick={onClose}>Cancel</button>
          <button disabled={saving} type="submit" form="update-modal-form" className="crm-btn crm-btn--modal-primary crm-btn--team-save">
            {saving ? 'Saving…' : isEdit ? 'Save post' : 'Publish'}
          </button>
        </footer>
      </div>
    </div>
  )
}

export default UpdateFormModal
