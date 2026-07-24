import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

const TOAST_META = {
  success: {
    Icon: CheckCircle2,
    label: 'Saved'
  },
  error: {
    Icon: AlertTriangle,
    label: 'Needs attention'
  },
  info: {
    Icon: Info,
    label: 'Update'
  }
}

function splitMessage(message) {
  const text = String(message || '').trim()
  if (!text) return { title: 'Notification', detail: '' }

  const parts = text.split(/(?<=[.!?])\s+/)
  if (parts.length > 1) {
    return {
      title: parts[0].replace(/[.!?]+$/, ''),
      detail: parts.slice(1).join(' ')
    }
  }

  return { title: text, detail: '' }
}

function ToastHost({ toasts, onDismiss }) {
  return (
    <div className="crm-toast-host cms-toast-host" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => {
        const type = toast.type || 'info'
        const meta = TOAST_META[type] || TOAST_META.info
        const { Icon, label } = meta
        const { title, detail } = splitMessage(toast.message)

        return (
          <div
            key={toast.id}
            className={`crm-toast crm-toast-${type} cms-toast cms-toast--${type}`}
            role="status"
          >
            <span className="cms-toast__icon" aria-hidden="true">
              <Icon size={18} strokeWidth={2.35} />
            </span>
            <div className="cms-toast__copy">
              <span className="cms-toast__eyebrow">{label}</span>
              <strong className="cms-toast__title">{title}</strong>
              {detail ? <p className="cms-toast__detail">{detail}</p> : null}
            </div>
            <button
              type="button"
              className="cms-toast__close"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={15} strokeWidth={2.4} aria-hidden />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default ToastHost
