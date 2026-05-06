import React from 'react'

function LeadsPerDayChart({ data }) {
  const max = Math.max(1, ...data.map(item => item.count))

  return (
    <section className="crm-chart-card">
      <h3>Leads per day (last 7 days)</h3>
      <div className="crm-chart-bars">
        {data.map(item => (
          <div className="crm-chart-col" key={item.date}>
            <div className="crm-chart-bar-wrap">
              <div className="crm-chart-bar" style={{ height: `${(item.count / max) * 100}%` }} />
            </div>
            <span className="crm-chart-count">{item.count}</span>
            <span className="crm-chart-label">{item.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default LeadsPerDayChart
