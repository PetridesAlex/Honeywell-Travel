import { Award, Star, Users } from 'lucide-react'
import './StatsRewardsSection.css'

const STATS = [
  {
    value: '50,000+',
    label: 'Happy Clients',
    detail: 'Journeys planned with care',
    Icon: Users
  },
  {
    value: '35+',
    label: 'Years of Expertise',
    detail: 'Trusted Cyprus travel partners',
    Icon: Star
  },
  {
    value: 'Cyprus Leading',
    label: 'Travel Management Company',
    detail: 'Recognised industry excellence',
    Icon: Award
  }
]

function StatsRewardsSection() {
  return (
    <section className="stats-rewards-section" aria-labelledby="stats-rewards-title">
      <div className="stats-rewards-atmosphere" aria-hidden="true" />
      <div className="stats-rewards-container">
        <header className="stats-rewards-header">
          <p className="stats-rewards-eyebrow">Recognition & trust</p>
          <h2 id="stats-rewards-title" className="stats-rewards-title">
            Our Rewards
          </h2>
          <p className="stats-rewards-subtitle">
            Trusted by travellers and recognised by the industry
          </p>
        </header>

        <div className="stats-rewards-grid">
          {STATS.map(({ value, label, detail, Icon }, index) => (
            <article key={label} className={`stats-rewards-card stats-rewards-card--${index + 1}`}>
              <span className="stats-rewards-icon" aria-hidden="true">
                <Icon size={22} strokeWidth={1.6} />
              </span>
              <div className="stats-rewards-value">{value}</div>
              <div className="stats-rewards-label">{label}</div>
              <p className="stats-rewards-detail">{detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsRewardsSection
