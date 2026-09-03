function EventCardSkeleton({ count = 6 }) {
  return (
    <ul className="st-event-grid" aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <li key={index}>
          <div className="st-skeleton st-skeleton-card" />
        </li>
      ))}
    </ul>
  )
}

export function SportRailSkeleton() {
  return (
    <div className="st-sport-rail" aria-hidden>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="st-skeleton st-skeleton-pill" />
      ))}
    </div>
  )
}

export function TicketListSkeleton({ count = 4 }) {
  return (
    <div aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="st-skeleton st-skeleton-ticket" />
      ))}
    </div>
  )
}

export default EventCardSkeleton
