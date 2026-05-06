import React from 'react'

function ConfirmDialog({ open, title, description, onCancel, onConfirm, confirming }) {
  if (!open) return null

  return (
    <div className="crm-modal-backdrop" onClick={onCancel}>
      <div className="crm-modal crm-modal-sm" onClick={event => event.stopPropagation()}>
        <h3>{title}</h3>
        <p className="crm-muted">{description}</p>
        <div className="crm-modal-actions">
          <button type="button" className="crm-btn crm-btn-ghost" onClick={onCancel}>Cancel</button>
          <button type="button" className="crm-btn crm-btn-danger" onClick={onConfirm} disabled={confirming}>
            {confirming ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
