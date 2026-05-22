import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Link2, Pin, Upload, X } from 'lucide-react'
import { EMPTY_TEAM_UPDATE } from '../constants'
import { uploadTeamUpdateImage } from '../api/teamApi'
import { TEAM_UPDATE_CATEGORIES } from '../utils/team'

function isValidHttpUrl(value) {
  const t = String(value || '').trim()
  if (!t) return true
  try {
    const u = new URL(t)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function UpdateFormModal({ open, initialUpdate, onClose, onSave, saving, saveError }) {
  const [form, setForm] = useState(EMPTY_TEAM_UPDATE)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [urlError, setUrlError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (initialUpdate) {
      setForm({
        ...EMPTY_TEAM_UPDATE,
        ...initialUpdate,
        pinned: Boolean(initialUpdate.pinned),
        image_url: initialUpdate.image_url || '',
        link_url: initialUpdate.link_url || ''
      })
      return
    }
    setForm(EMPTY_TEAM_UPDATE)
  }, [initialUpdate, open])

  useEffect(() => {
    if (!open) {
      setUploadError('')
      setUrlError('')
    }
  }, [open])

  if (!open) return null

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))
  const isEdit = Boolean(initialUpdate?.id)

  const handleImageFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setUploading(true)
    setUploadError('')
    const { url, error } = await uploadTeamUpdateImage(file)
    setUploading(false)
    if (error) {
      setUploadError(error.message || 'Upload failed.')
      return
    }
    if (url) handleChange('image_url', url)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isValidHttpUrl(form.image_url)) {
      setUrlError('Image URL must start with http:// or https://')
      return
    }
    if (!isValidHttpUrl(form.link_url)) {
      setUrlError('Link URL must start with http:// or https://')
      return
    }
    setUrlError('')
    onSave(form)
  }

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
        <form id="update-modal-form" onSubmit={handleSubmit} className="crm-modal__body">
          <div className="crm-form-grid crm-form-grid--modal">
            <div className="crm-form-row crm-form-row--update-meta">
              <label className="crm-field">
                <span className="crm-field__label">Category</span>
                <select value={form.category} onChange={(e) => handleChange('category', e.target.value)}>
                  {TEAM_UPDATE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={`crm-field crm-field--pin${form.pinned ? ' crm-field--pin-on' : ''}`}>
                <input
                  type="checkbox"
                  className="crm-field__pin-input"
                  checked={Boolean(form.pinned)}
                  onChange={(e) => handleChange('pinned', e.target.checked)}
                />
                <span className="crm-field__pin-card">
                  <span className="crm-field__pin-icon" aria-hidden="true">
                    <Pin size={18} strokeWidth={2.25} />
                  </span>
                  <span className="crm-field__pin-text">
                    <strong>Pin to top</strong>
                    <em>Featured in the feed</em>
                  </span>
                </span>
              </label>
            </div>
            <label className="crm-field crm-form-full">
              <span className="crm-field__label">Headline *</span>
              <input required value={form.title} onChange={(e) => handleChange('title', e.target.value)} />
            </label>
            <label className="crm-field crm-form-full">
              <span className="crm-field__label">Message *</span>
              <textarea
                required
                rows={5}
                value={form.body}
                onChange={(e) => handleChange('body', e.target.value)}
                placeholder="News, policy change, office update, reminder for the team…"
              />
            </label>

            <div className="crm-field crm-form-full crm-update-media">
              <span className="crm-field__label">
                <Link2 size={14} aria-hidden />
                Link URL <em className="crm-field__optional">(optional)</em>
              </span>
              <input
                type="url"
                value={form.link_url}
                onChange={(e) => handleChange('link_url', e.target.value)}
                placeholder="https://example.com/more-info"
                inputMode="url"
              />
              <span className="crm-field__hint">Adds a “View link” button on the post.</span>
            </div>

            <div className="crm-field crm-form-full crm-update-media">
              <span className="crm-field__label">
                <ImagePlus size={14} aria-hidden />
                Image <em className="crm-field__optional">(optional)</em>
              </span>
              <input
                type="url"
                value={form.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                placeholder="https://… or upload below"
                inputMode="url"
              />
              <span className="crm-field__hint">Paste an image URL, or upload a file (max 5 MB).</span>

              <div className="crm-update-media__upload">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="crm-update-media__file-input"
                  onChange={handleImageFile}
                  aria-label="Upload image"
                />
                <button
                  type="button"
                  className="crm-btn crm-btn-ghost crm-update-media__upload-btn"
                  disabled={uploading || saving}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} aria-hidden />
                  {uploading ? 'Uploading…' : 'Upload image'}
                </button>
                {form.image_url ? (
                  <button
                    type="button"
                    className="crm-link-btn crm-update-media__clear"
                    onClick={() => handleChange('image_url', '')}
                  >
                    <X size={14} aria-hidden />
                    Remove image
                  </button>
                ) : null}
              </div>

              {uploadError ? <p className="crm-form-error crm-form-error--inline">{uploadError}</p> : null}

              {form.image_url ? (
                <div className="crm-update-media__preview">
                  <img src={form.image_url} alt="" />
                </div>
              ) : null}
            </div>
          </div>
          {urlError ? <p className="crm-form-error">{urlError}</p> : null}
          {saveError ? <p className="crm-form-error">{saveError}</p> : null}
        </form>
        <footer className="crm-modal__footer">
          <button type="button" className="crm-btn crm-btn--modal-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            disabled={saving || uploading}
            type="submit"
            form="update-modal-form"
            className="crm-btn crm-btn--modal-primary crm-btn--team-save"
          >
            {saving ? 'Saving…' : isEdit ? 'Save post' : 'Publish'}
          </button>
        </footer>
      </div>
    </div>
  )
}

export default UpdateFormModal
