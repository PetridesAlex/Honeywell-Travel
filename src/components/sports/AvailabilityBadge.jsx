function AvailabilityBadge({ numberOfTickets, stock, hasPrice }) {
  const count = Number(numberOfTickets ?? stock)
  if (Number.isFinite(count) && count > 0) {
    const limited = count <= 20
    return (
      <span className={`st-availability st-availability--${limited ? 'limited' : 'ok'}`}>
        {limited ? 'Limited availability' : 'Tickets available'}
      </span>
    )
  }

  if (hasPrice === false) {
    return (
      <span className="st-availability st-availability--pending">Tickets coming soon</span>
    )
  }

  return null
}

export default AvailabilityBadge
