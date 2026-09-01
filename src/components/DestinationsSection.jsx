import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getDestinationLabel } from '../utils/categoryI18n'
import './DestinationsSection.css'

function DestinationsSection() {
  const { t } = useTranslation()

  const destinations = [
    { name: 'Greece', tours: 9, image: '🇬🇷' },
    { name: 'Europe', tours: 62, image: '🇪🇺' },
    { name: 'Asia', tours: 6, image: '🌏' },
    { name: 'America', tours: 1, image: '🇺🇸' },
    { name: 'Africa', tours: 0, image: '🌍' }
  ]

  return (
    <section className="destinations-section">
      <div className="destinations-container">
        <h2 className="section-title">{t('home.destinationsTitle')}</h2>
        <div className="destinations-grid">
          {destinations.map((destination) => (
            <Link 
              key={destination.name} 
              to={`/destinations/${destination.name.toLowerCase()}`}
              className="destination-card"
            >
              <div className="destination-icon">{destination.image}</div>
              <h3 className="destination-name">{getDestinationLabel(destination.name, t)}</h3>
              <p className="destination-tours">
                {destination.tours} {destination.tours === 1 ? t('home.tour') : t('home.tours')}
              </p>
              {destination.tours > 0 && (
                <span className="view-all">{t('home.viewAllTours')}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default DestinationsSection
