function SourceBreakdown({ items = [] }) {
  if (!items.length) {
    return <p className="crm-muted-inline">No source data yet.</p>
  }

  const max = Math.max(...items.map((item) => item.count), 1)

  return (
    <div className="crm-bar-list">
      {items.map((item) => (
        <div key={item.source} className="crm-bar-row">
          <div className="crm-bar-row__label">
            <span>{item.source}</span>
            <strong>
              {item.count} ({item.percent}%)
            </strong>
          </div>
          <div className="crm-bar-row__track">
            <span className="crm-bar-row__fill" style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default SourceBreakdown
