import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getDestinationSummaries } from '../data/flightTickets'
import './FlightTickets.css'

function FlightTickets() {
  const { t } = useTranslation()
  const destinations = getDestinationSummaries()

  return (
    <div className="flight-tickets-page">
      <section className="flight-tickets-hero">
        <div className="flight-tickets-container">
          <h1>{t('flights.title')}</h1>
          <p>{t('flights.subtitle')}</p>

          <div className="flight-destinations-grid">
            {destinations.map((item) => (
              <Link
                key={item.destinationSlug}
                to={`/flight-tickets/${item.destinationSlug}`}
                className="flight-destination-card"
                aria-label={t('flights.destinationAria', {
                  destination: item.destination,
                  price: item.fromPrice,
                })}
              >
                <div
                  className="flight-destination-image"
                  style={{ backgroundImage: `url("${item.image}")` }}
                  aria-hidden="true"
                />
                <div className="flight-destination-shade" aria-hidden="true" />
                <span className="flight-destination-type-badge">{t('flights.badge')}</span>
                <div className="flight-destination-overlay">
                  <span className="flight-destination-chip">{t('flights.deals')}</span>
                  <h3 className="flight-destination-title">{item.destination}</h3>
                  <div className="flight-destination-meta">
                    <span>{t('flights.offersCount', { count: item.offersCount })}</span>
                  </div>
                  <div className="flight-destination-footer">
                    <span className="flight-destination-price">
                      {t('flights.fromPrice', { price: item.fromPrice })}
                    </span>
                    <span className="flight-destination-cta">{t('flights.bookNow')}</span>
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
