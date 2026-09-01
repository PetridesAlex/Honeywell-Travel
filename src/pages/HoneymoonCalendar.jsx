import { useTranslation } from 'react-i18next'
import RevealOnScroll from '../components/RevealOnScroll'
import SEO from '../components/SEO'
import './HoneymoonCalendar.css'

const MONTHS = [
  { name: 'January', destinations: ['Maldives', 'Seychelles', 'Thailand', 'Dubai'], icon: '❄️', color: '#4A90E2' },
  { name: 'February', destinations: ['Maldives', 'Seychelles', 'Mauritius', 'Lapland', 'Mexico'], icon: '💝', color: '#E91E63' },
  { name: 'March', destinations: ['Japan', 'Sri Lanka', 'Canary Islands', 'Cape Town'], icon: '🌸', color: '#9C27B0' },
  { name: 'April', destinations: ['Japan', 'Greece', 'Italy', 'Bali'], icon: '🌷', color: '#FF6B6B' },
  { name: 'May', destinations: ['Greek Islands', 'Italy', 'France', 'Hawaii'], icon: '🌺', color: '#4ECDC4' },
  { name: 'June', destinations: ['Greek Islands', 'Cyprus', 'Croatia', 'Bali', 'French Polynesia'], icon: '☀️', color: '#FFD93D' },
  { name: 'July', destinations: ['Italy', 'Greece', 'Spain', 'Canada'], icon: '🏖️', color: '#FF6B35' },
  { name: 'August', destinations: ['Greek Islands', 'Cyprus', 'Croatia', 'Spain', 'Bali', 'Kenya / Tanzania'], icon: '🌊', color: '#00D2FF' },
  { name: 'September', destinations: ['Santorini', 'Italy', 'Portugal', 'Bali', 'Maldives'], icon: '🍂', color: '#FF8C42' },
  { name: 'October', destinations: ['Japan (autumn)', 'Maldives', 'Seychelles', 'Morocco', 'New England'], icon: '🍁', color: '#FF6B6B' },
  { name: 'November', destinations: ['Maldives', 'Seychelles', 'Mauritius', 'Thailand', 'Vietnam', 'Dubai'], icon: '🌙', color: '#6C5CE7' },
  { name: 'December', destinations: ['Maldives', 'Seychelles', 'Mauritius', 'Caribbean', 'Lapland', 'Mexico'], icon: '🎄', color: '#00B894' },
]

const DESTINATION_ICONS = {
  Maldives: '🏝️', Seychelles: '🌴', Thailand: '🇹🇭', Dubai: '🏙️', Mauritius: '🌺', Lapland: '❄️',
  Mexico: '🌮', Japan: '🗾', 'Japan (autumn)': '🍂', 'Sri Lanka': '🌊', 'Canary Islands': '🏖️',
  'Cape Town': '🏔️', Greece: '🏛️', 'Greek Islands': '🏝️', Italy: '🍝', Bali: '🌋', France: '🗼',
  Hawaii: '🌺', Cyprus: '🏖️', Croatia: '🏰', 'French Polynesia': '🌺', Spain: '🍷', Canada: '🍁',
  'Kenya / Tanzania': '🦁', Santorini: '🌅', Portugal: '🏰', Morocco: '🏜️', 'New England': '🍂',
  Vietnam: '🛶', Caribbean: '🏝️',
}

function HoneymoonCalendar() {
  const { t } = useTranslation()

  return (
    <div className="honeymoon-calendar-page">
      <SEO
        title={t('honeymoon.calendarSeoTitle')}
        description={t('honeymoon.calendarSeoDescription')}
        keywords={t('honeymoon.calendarSeoKeywords')}
        url="https://www.honeywelltravel.com.cy/honeymoon-calendar"
      />
      <section className="honeymoon-hero">
        <div className="honeymoon-hero-content">
          <div className="hero-icon">💑</div>
          <h1>{t('honeymoon.calendarTitle')}</h1>
          <p className="hero-subtitle">{t('honeymoon.whereToGo')}</p>
          <p className="hero-description">{t('honeymoon.calendarIntro')}</p>
        </div>
      </section>

      <RevealOnScroll direction="up">
        <section className="honeymoon-months-section">
          <div className="honeymoon-months-grid">
            {MONTHS.map((month, index) => (
              <article key={month.name} className="honeymoon-month-card" style={{ '--month-color': month.color }}>
                <div className="card-gradient" />
                <header className="month-header">
                  <div className="month-number">{String(index + 1).padStart(2, '0')}</div>
                  <div className="month-info">
                    <div className="month-icon">{month.icon}</div>
                    <h2>{month.name}</h2>
                  </div>
                </header>
                <ul className="destinations-list">
                  {month.destinations.map((dest) => (
                    <li key={dest} className="destination-item">
                      <span className="destination-icon">{DESTINATION_ICONS[dest] || '✈️'}</span>
                      <span className="destination-name">{dest}</span>
                    </li>
                  ))}
                </ul>
                <div className="card-footer">
                  <span className="destination-count">
                    {t('honeymoon.destinationsCount', { count: month.destinations.length })}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </RevealOnScroll>
    </div>
  )
}

export default HoneymoonCalendar
