import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './SportsTickets.css'

function SportsTicketsMaintenance() {
  const { t } = useTranslation()

  return (
    <div className="sports-tickets-page">
      <section className="st-hero st-hero--compact">
        <div className="st-hero__backdrop" aria-hidden>
          <div className="st-hero__glow" />
          <div className="st-hero__mesh" />
          <div className="st-hero__overlay" />
        </div>
        <div className="sports-tickets-container st-hero__inner">
          <div className="st-hero__copy">
            <p className="st-hero__eyebrow">
              <span className="st-hero__eyebrow-mark" aria-hidden />
              <span className="st-hero__eyebrow-text">Honeywell Travel</span>
            </p>
            <h1 className="st-hero__title">{t('header.sportsTicketsMaintenanceTitle')}</h1>
            <p className="st-hero__lead">{t('header.sportsTicketsMaintenanceLead')}</p>
            <Link to="/" className="st-btn st-btn--primary" style={{ marginTop: '0.35rem' }}>
              {t('header.sportsTicketsMaintenanceCta')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SportsTicketsMaintenance
