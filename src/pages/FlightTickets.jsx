import { Link } from 'react-router-dom'
import { getDestinationSummaries } from '../data/flightTickets'
import './FlightTickets.css'

function FlightTickets() {
  const destinations = getDestinationSummaries()

  return (
    <div className="flight-tickets-page">
      <section className="flight-tickets-hero">
        <div className="flight-tickets-container">
          <h1>Flight Tickets</h1>
          <p>
            Επιλέξτε προορισμό και δείτε όλες τις διαθέσιμες αναχωρήσεις και τιμές.
          </p>

          <div className="flight-destinations-grid">
            {destinations.map((item) => (
              <Link
                key={item.destinationSlug}
                to={`/flight-tickets/${item.destinationSlug}`}
                className="flight-destination-card"
                aria-label={`${item.destination} flight tickets from €${item.fromPrice}`}
              >
                <div
                  className="flight-destination-image"
                  style={{ backgroundImage: `url("${item.image}")` }}
                  aria-hidden="true"
                />
                <div className="flight-destination-shade" aria-hidden="true" />
                <span className="flight-destination-type-badge">Flights</span>
                <div className="flight-destination-overlay">
                  <span className="flight-destination-chip">Flight deals</span>
                  <h3 className="flight-destination-title">{item.destination}</h3>
                  <div className="flight-destination-meta">
                    <span>{item.offersCount} επιλογές πτήσεων</span>
                  </div>
                  <div className="flight-destination-footer">
                    <span className="flight-destination-price">From €{item.fromPrice}</span>
                    <span className="flight-destination-cta">Book Now</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default FlightTickets
