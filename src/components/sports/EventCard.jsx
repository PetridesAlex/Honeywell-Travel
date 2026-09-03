import { Link } from 'react-router-dom'
import { eventDisplayFromPrice, formatEventWhen } from '../../utils/xs2eventUi'
import AvailabilityBadge from './AvailabilityBadge'
import EventDateBadge from './EventDateBadge'
import EventPrice from './EventPrice'
import SportArt from './SportArt'

function eventTitle(event) {
  const home = event?.hometeam_name
  const away = event?.visiting_name
  if (home && away) return null
  return event?.event_name || 'Sporting event'
}

function EventCard({ event }) {
  if (!event?.event_id) return null

  const home = event.hometeam_name
  const away = event.visiting_name
  const hasTeams = Boolean(home && away)
  const location = [event.venue_name, event.city].filter(Boolean).join(', ')
  const listPrice = eventDisplayFromPrice(event)

  return (
    <li>
      <Link
        to={`/sports-tickets/event/${encodeURIComponent(event.event_id)}`}
        className="st-event-card"
      >
        <div className="st-event-card__art">
          <div className="st-event-card__art-inner">
            <SportArt sportType={event.sport_type} />
          </div>
        </div>
        <div className="st-event-card__body">
          {event.tournament_name ? (
            <p className="st-event-card__competition">{event.tournament_name}</p>
          ) : null}

          {hasTeams ? (
            <div className="st-event-card__vs">
              <span className="st-event-card__team">{home}</span>
              <span className="st-event-card__vs-label">VS</span>
              <span className="st-event-card__team">{away}</span>
            </div>
          ) : (
            <h2 className="st-event-card__title">{eventTitle(event)}</h2>
          )}

          <div className="st-event-card__meta-row">
            <EventDateBadge iso={event.date_start} />
            <div className="st-event-card__meta">
              <p className="st-event-card__meta-text st-event-card__meta-text--when">
                {formatEventWhen(event.date_start) || 'Date TBC'}
              </p>
              {location ? (
                <p className="st-event-card__meta-text st-event-card__meta-text--where">{location}</p>
              ) : null}
              <div className="st-event-card__availability">
                <AvailabilityBadge numberOfTickets={event.number_of_tickets} />
              </div>
            </div>
          </div>

          <div className="st-event-card__footer">
            <EventPrice alreadyFormatted={listPrice} label="From" />
            <span className="st-event-card__cta">View tickets →</span>
          </div>
        </div>
      </Link>
    </li>
  )
}

export default EventCard
