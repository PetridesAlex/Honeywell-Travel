import React from 'react'

function ToastHost({ toasts, onDismiss }) {
  return (
    <div className="crm-toast-host" aria-live="polite" aria-atomic="true">
      {toasts.map(toast => (
        <div key={toast.id} className={`crm-toast crm-toast-${toast.type || 'info'}`}>
          <span>{toast.message}</span>
          <button onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">×</button>
        </div>
      ))}
    </div>
  )
}

export default ToastHost
