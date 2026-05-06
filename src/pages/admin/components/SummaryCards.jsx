import React from 'react'

function SummaryCards({ stats }) {
  const cards = [
    { label: 'Total Leads', value: stats.total },
    { label: 'Leads Today', value: stats.leadsToday },
    { label: 'Leads This Week', value: stats.leadsThisWeek },
    { label: 'New Leads', value: stats.newCount },
    { label: 'Contacted', value: stats.contacted },
    { label: 'Quoted', value: stats.quoted },
    { label: 'Confirmed', value: stats.confirmed },
    { label: 'Lost', value: stats.lost },
    { label: 'Follow-ups Today', value: stats.followUpsToday },
    { label: 'Overdue', value: stats.overdueFollowUps },
    { label: 'Follow-ups Due', value: stats.followUpsDue },
    { label: 'Conversion %', value: `${stats.conversionRate}%` },
    { label: 'Pipeline Value', value: `€${Math.round(stats.totalPipelineValue).toLocaleString()}` },
    { label: 'Confirmed Revenue', value: `€${Math.round(stats.confirmedRevenue).toLocaleString()}` },
    { label: 'Lost Revenue', value: `€${Math.round(stats.lostRevenue).toLocaleString()}` }
  ]

  return (
    <section className="crm-summary-grid">
      {cards.map(card => (
        <article className="crm-summary-card" key={card.label}>
          <p className="crm-summary-label">{card.label}</p>
          <h3 className="crm-summary-value">{card.value}</h3>
        </article>
      ))}
    </section>
  )
}

export default SummaryCards
