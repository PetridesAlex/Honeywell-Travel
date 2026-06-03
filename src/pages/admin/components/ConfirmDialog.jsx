import { createPortal } from 'react-dom'
import { AlertTriangle } from 'lucide-react'

function ConfirmDialog({
  open,
  title,
  description,
  onCancel,
  onConfirm,
  confirming,
  confirmLabel = 'Delete',
  confirmingLabel = 'Deleting...',
  eyebrow = 'Confirm action',
  variant = 'danger'
}) {
  if (!open) return null

  return createPortal(
    <div
      className="crm-modal-backdrop crm-modal-backdrop--premium crm-modal-backdrop--confirm"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className={`crm-modal crm-modal--confirm crm-modal--confirm-${variant}`}
        onClick={(event) => event.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="crm-confirm-title"
        aria-describedby="crm-confirm-description"
      >
        <header className={`crm-modal__hero crm-modal__hero--confirm crm-modal__hero--confirm-${variant}`}>
          <div className="crm-modal__hero-text">
            <p className="crm-modal__eyebrow crm-modal__eyebrow--confirm">{eyebrow}</p>
            <div className="crm-confirm__title-row">
              <span className="crm-confirm__icon" aria-hidden="true">
                <AlertTriangle size={22} strokeWidth={2.25} />
              </span>
              <h3 id="crm-confirm-title">{title}</h3>
            </div>
          </div>
          <button type="button" className="crm-modal__close" onClick={onCancel} aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="crm-confirm__body">
          <p id="crm-confirm-description" className="crm-confirm__description">
            {description}
          </p>
        </div>

        <footer className="crm-confirm__footer">
          <button type="button" className="crm-btn crm-btn--dark" onClick={onCancel} disabled={confirming}>
            Cancel
          </button>
          <button
            type="button"
            className="crm-btn crm-confirm__btn-confirm"
            onClick={onConfirm}
            disabled={confirming}
          >
            {confirming ? confirmingLabel : confirmLabel}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  )
}

export default ConfirmDialog
