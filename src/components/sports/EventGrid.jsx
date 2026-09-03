import EventCard from './EventCard'
import EventCardSkeleton from './EventCardSkeleton'

function EventGrid({ events = [], loading = false, emptyAction }) {
  if (loading) return <EventCardSkeleton />

  if (!events.length) {
    return (
      <div className="st-empty">
        <h3>No events match your search</h3>
        <p>Try adjusting filters or clearing your search to see more sporting events.</p>
        {emptyAction || null}
      </div>
    )
  }

  return (
    <ul className="st-event-grid">
      {events.map((event) => (
        <EventCard key={event.event_id || event.slug} event={event} />
      ))}
    </ul>
  )
}

export default EventGrid
