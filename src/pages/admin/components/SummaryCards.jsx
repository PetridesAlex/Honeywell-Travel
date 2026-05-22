const SECTIONS = [
  {
    id: 'overview',
    title: 'Overview',
    cards: [
      { label: 'Total Leads', valueKey: 'total', filter: 'All' },
      { label: 'Leads Today', valueKey: 'leadsToday' },
      { label: 'Leads This Week', valueKey: 'leadsThisWeek' },
    ],
  },
  {
    id: 'pipeline',
    title: 'Pipeline',
    cards: [
      { label: 'New', valueKey: 'newCount', filter: 'New', tone: 'new' },
      { label: 'Contacted', valueKey: 'contacted', filter: 'Contacted', tone: 'contacted' },
      { label: 'Quoted', valueKey: 'quoted', filter: 'Quoted', tone: 'quoted' },
      { label: 'Confirmed', valueKey: 'confirmed', filter: 'Confirmed', tone: 'confirmed' },
      { label: 'Lost', valueKey: 'lost', filter: 'Lost', tone: 'lost' },
    ],
  },
  {
    id: 'followups',
    title: 'Follow-ups',
    cards: [
      { label: 'Due Today', valueKey: 'followUpsToday', quickFilter: 'followups_today' },
      { label: 'Overdue', valueKey: 'overdueFollowUps', quickFilter: 'overdue' },
      { label: 'All Due', valueKey: 'followUpsDue', quickFilter: 'followups_due' },
    ],
  },
  {
    id: 'revenue',
    title: 'Revenue',
    cards: [
      { label: 'Conversion', valueKey: 'conversionRate', format: 'percent' },
      { label: 'Pipeline Value', valueKey: 'totalPipelineValue', format: 'currency' },
      { label: 'Confirmed', valueKey: 'confirmedRevenue', format: 'currency' },
      { label: 'Lost', valueKey: 'lostRevenue', format: 'currency' },
    ],
  },
]

function formatValue(stats, card) {
  const raw = stats[card.valueKey]
  if (card.format === 'percent') return `${raw}%`
  if (card.format === 'currency') return `€${Math.round(raw || 0).toLocaleString()}`
  return raw ?? 0
}

function SummaryCards({ stats, activeStatus, activeQuickFilter, onStatusClick, onQuickFilterClick }) {
  return (
    <div className="crm-summary-sections">
      {SECTIONS.map((section) => (
        <section key={section.id} className="crm-summary-section">
          <h2 className="crm-summary-section__title">{section.title}</h2>
          <div className="crm-summary-grid">
            {section.cards.map((card) => {
              const isStatusActive = card.filter && activeStatus === card.filter
              const isQuickActive = card.quickFilter && activeQuickFilter === card.quickFilter
              const isInteractive = Boolean(card.filter || card.quickFilter)
              const className = [
                'crm-summary-card',
                card.tone ? `crm-summary-card--${card.tone}` : '',
                isInteractive ? 'crm-summary-card--clickable' : '',
                isStatusActive || isQuickActive ? 'crm-summary-card--active' : '',
              ]
                .filter(Boolean)
                .join(' ')

              const handleClick = () => {
                if (card.filter) onStatusClick?.(card.filter)
                if (card.quickFilter) onQuickFilterClick?.(card.quickFilter)
              }

              return (
                <article
                  key={card.label}
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
                  aria-pressed={isStatusActive || isQuickActive ? true : undefined}
                >
                  <p className="crm-summary-label">{card.label}</p>
                  <h3 className="crm-summary-value">{formatValue(stats, card)}</h3>
                  {isInteractive ? <span className="crm-summary-hint">Click to filter</span> : null}
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

export default SummaryCards
