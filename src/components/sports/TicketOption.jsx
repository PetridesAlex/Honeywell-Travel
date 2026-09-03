import AvailabilityBadge from './AvailabilityBadge'
import EventPrice from './EventPrice'
import { ticketDisplayPrice } from '../../utils/xs2eventUi'

function TicketOption({
  ticket,
  optionsCount = 1,
  isOpen,
  quantity,
  email,
  maxQty,
  reserving,
  reserveError,
  onOpen,
  onCancel,
  onQuantityChange,
  onEmailChange,
  onSubmit,
}) {
  const title = ticket.category_name || ticket.ticket_title || 'Ticket category'
  const meta = [ticket.sub_category, ticket.type_ticket || ticket.ticket_type, ticket.ticket_validity]
    .filter(Boolean)
    .join(' · ')

  return (
    <li className={`st-ticket-option${isOpen ? ' is-open' : ''}`}>
      <div className="st-ticket-option__row">
        <div>
          <h3 className="st-ticket-option__title">{title}</h3>
          {meta ? <p className="st-ticket-option__meta">{meta}</p> : null}
          {optionsCount > 1 ? (
            <p className="st-ticket-option__meta">{optionsCount} options in this category</p>
          ) : null}
          <div style={{ marginTop: '0.45rem' }}>
            <AvailabilityBadge stock={ticket.stock} />
          </div>
        </div>
        <div style={{ textAlign: 'right', display: 'grid', gap: '0.55rem', justifyItems: 'end' }}>
          <EventPrice alreadyFormatted={ticketDisplayPrice(ticket)} label="From" size="lg" />
          {!isOpen ? (
            <button type="button" className="st-btn st-btn--primary" onClick={() => onOpen(ticket)}>
              Select tickets
            </button>
          ) : null}
        </div>
      </div>

      {isOpen ? (
        <div className="sports-tickets-reserve-form">
          <label>
            Quantity
            <input
              type="number"
              min={1}
              max={maxQty}
              value={quantity}
              onChange={(e) => onQuantityChange(Number(e.target.value) || 1)}
            />
          </label>
          <label>
            Booking email
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
            />
          </label>
          {reserveError ? <p className="sports-tickets-error">{reserveError}</p> : null}
          <div className="sports-tickets-reserve-actions">
            <button
              type="button"
              className="st-btn st-btn--primary"
              disabled={reserving}
              onClick={() => onSubmit(ticket)}
            >
              {reserving ? 'Reserving…' : 'Hold tickets'}
            </button>
            <button type="button" className="st-btn st-btn--ghost" disabled={reserving} onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </li>
  )
}

export default TicketOption
