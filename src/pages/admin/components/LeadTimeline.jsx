import React from 'react'

function LeadTimeline({ items }) {
  if (!items?.length) {
    return <p className="crm-muted">No activity yet.</p>
  }

  return (
    <div className="crm-timeline">
      {items.map(item => (
        <div className="crm-timeline-item" key={item.id}>
          <div className="crm-timeline-dot" />
          <div>
            <p className="crm-timeline-title">{item.description}</p>
            <p className="crm-timeline-meta">
              {item.type} · {item.created_at ? new Date(item.created_at).toLocaleString() : '-'}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default LeadTimeline
