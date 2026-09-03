function AvailabilityBadge({ numberOfTickets, stock }) {
  const count = Number(numberOfTickets ?? stock)
  if (!Number.isFinite(count) || count <= 0) return null

  const limited = count > 0 && count <= 20
  return (
    <span className={`st-availability st-availability--${limited ? 'limited' : 'ok'}`}>
      {limited ? 'Limited availability' : 'Tickets available'}
    </span>
  )
}

export default AvailabilityBadge
