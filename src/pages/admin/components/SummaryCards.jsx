const PIPELINE = [
  { label: 'New', valueKey: 'newCount', filter: 'New', tone: 'new' },
  { label: 'Contacted', valueKey: 'contacted', filter: 'Contacted', tone: 'contacted' },
  { label: 'Quoted', valueKey: 'quoted', filter: 'Quoted', tone: 'quoted' },
  { label: 'Confirmed', valueKey: 'confirmed', filter: 'Confirmed', tone: 'confirmed' },
  { label: 'Lost', valueKey: 'lost', filter: 'Lost', tone: 'lost' }
]

const FOLLOWUPS = [
  { label: 'Due today', valueKey: 'followUpsToday', quickFilter: 'followups_today' },
  { label: 'Overdue', valueKey: 'overdueFollowUps', quickFilter: 'overdue' },
  { label: 'All due', valueKey: 'followUpsDue', quickFilter: 'followups_due' }
]

function formatValue(stats, card) {
  return stats[card.valueKey] ?? 0
}

function MetricPill({ card, stats, activeStatus, activeQuickFilter, onStatusClick, onQuickFilterClick }) {
  const isStatusActive = card.filter && activeStatus === card.filter
  const isQuickActive = card.quickFilter && activeQuickFilter === card.quickFilter
  const isInteractive = Boolean(card.filter || card.quickFilter)
  const className = [
    'crm-dash-metric',
    card.tone ? `crm-dash-metric--${card.tone}` : '',
    isInteractive ? 'crm-dash-metric--clickable' : '',
    isStatusActive || isQuickActive ? 'crm-dash-metric--active' : ''
  ]
    .filter(Boolean)
    .join(' ')

  const handleClick = () => {
    if (card.filter) onStatusClick?.(card.filter)
    if (card.quickFilter) onQuickFilterClick?.(card.quickFilter)
  }

  return (
    <article
      className={className}
      onClick={isInteractive ? handleClick : undefined}
      onKeyDown={
        isInteractive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleClick()
              }
            }
          : undefined
      }
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      <span className="crm-dash-metric__label">{card.label}</span>
      <strong className="crm-dash-metric__value">{formatValue(stats, card)}</strong>
    </article>
  )
}

function SummaryCards({ stats, activeStatus, activeQuickFilter, onStatusClick, onQuickFilterClick }) {
  return (
    <div className="crm-dash-metrics">
      <section className="crm-dash-panel crm-dash-panel--pipeline-metrics">
        <header className="crm-dash-panel__head">
          <h3>Pipeline stages</h3>
          <p>Click a stage to filter leads</p>
        </header>
        <div className="crm-dash-metrics__row">
          {PIPELINE.map((card) => (
            <MetricPill
              key={card.label}
              card={card}
              stats={stats}
              activeStatus={activeStatus}
              activeQuickFilter={activeQuickFilter}
              onStatusClick={onStatusClick}
              onQuickFilterClick={onQuickFilterClick}
            />
          ))}
        </div>
      </section>

      <section className="crm-dash-panel crm-dash-panel--followups-metrics">
        <header className="crm-dash-panel__head">
          <h3>Follow-ups</h3>
          <p>Stay on top of client contact</p>
        </header>
        <div className="crm-dash-metrics__row crm-dash-metrics__row--3">
          {FOLLOWUPS.map((card) => (
            <MetricPill
              key={card.label}
              card={card}
              stats={stats}
              activeStatus={activeStatus}
              activeQuickFilter={activeQuickFilter}
              onStatusClick={onStatusClick}
              onQuickFilterClick={onQuickFilterClick}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

export default SummaryCards
