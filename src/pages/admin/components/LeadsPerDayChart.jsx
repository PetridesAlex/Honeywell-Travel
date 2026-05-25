function LeadsPerDayChart({ data }) {
  const max = Math.max(1, ...data.map((item) => item.count))
  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <section className="crm-chart-card crm-chart-card--premium">
      <header className="crm-dash-panel__head">
        <div>
          <h3>Lead momentum</h3>
          <p>Enquiries over the last 7 days</p>
        </div>
        <span className="crm-chart-card__total">{total} total</span>
      </header>
      <div className="crm-chart-bars crm-chart-bars--premium">
        {data.map((item, index) => (
          <div
            className="crm-chart-col crm-chart-col--premium"
            key={item.date}
            style={{ '--bar-height': `${(item.count / max) * 100}%`, '--bar-delay': `${index * 50}ms` }}
          >
            <span className="crm-chart-count">{item.count}</span>
            <div className="crm-chart-bar-wrap">
              <div className="crm-chart-bar" />
            </div>
            <span className="crm-chart-label">{item.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default LeadsPerDayChart
