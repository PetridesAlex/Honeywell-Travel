import { Link } from 'react-router-dom'
import { STATUS_OPTIONS } from '../constants'
import { leadDisplayName } from '../utils/leadName'

function PipelineBoard({ leads, onStatusChange }) {
  const columns = STATUS_OPTIONS.map((status) => ({
    status,
    items: leads.filter((lead) => (lead.status || 'New') === status)
  }))

  return (
    <div className="crm-pipeline">
      {columns.map((column) => (
        <section key={column.status} className={`crm-pipeline-col crm-pipeline-col--${column.status.toLowerCase()}`}>
          <header className="crm-pipeline-col__head">
            <h3>{column.status}</h3>
            <span className="crm-pipeline-col__count">{column.items.length}</span>
          </header>
          <div className="crm-pipeline-col__cards">
            {column.items.length === 0 ? (
              <p className="crm-pipeline-empty">No leads</p>
            ) : (
              column.items.map((lead) => (
                <article key={lead.id} className="crm-pipeline-card">
                  <div className="crm-pipeline-card__top">
                    <strong>{leadDisplayName(lead)}</strong>
                    {lead.priority && lead.priority !== 'Normal' ? (
                      <span className={`crm-priority crm-priority--${lead.priority.toLowerCase()}`}>
                        {lead.priority}
                      </span>
                    ) : null}
                  </div>
                  <p className="crm-pipeline-card__meta">{lead.destination || 'Destination TBC'}</p>
                  {lead.trip_type ? <p className="crm-pipeline-card__tag">{lead.trip_type}</p> : null}
                  {lead.travel_dates ? <p className="crm-pipeline-card__dates">{lead.travel_dates}</p> : null}
                  <p className="crm-pipeline-card__value">
                    {lead.deal_value ? `€${Math.round(Number(lead.deal_value)).toLocaleString()}` : '—'}
                  </p>
                  <div className="crm-pipeline-card__actions">
                    <select
                      value={lead.status || 'New'}
                      onChange={(event) => onStatusChange(lead, event.target.value)}
                      aria-label={`Update status for ${leadDisplayName(lead)}`}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <Link to="/admin/leads" className="crm-link-btn">
                      Open
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  )
}

export default PipelineBoard
