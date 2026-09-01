import { Award, Star, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './StatsRewardsSection.css'

function StatsRewardsSection() {
  const { t } = useTranslation()

  const stats = [
    {
      value: t('home.statsClientsValue'),
      label: t('home.happyClients'),
      detail: t('home.happyClientsDetail'),
      Icon: Users,
    },
    {
      value: t('home.statsYearsValue'),
      label: t('home.yearsExpertise'),
      detail: t('home.trustedPartners'),
      Icon: Star,
    },
    {
      value: t('home.statsLeadingValue'),
      label: t('home.travelManagement'),
      detail: t('home.industryExcellence'),
      Icon: Award,
    },
  ]

  return (
    <section className="stats-rewards-section" aria-labelledby="stats-rewards-title">
      <div className="stats-rewards-atmosphere" aria-hidden="true" />
      <div className="stats-rewards-container">
        <header className="stats-rewards-header">
          <p className="stats-rewards-eyebrow">{t('home.statsEyebrow')}</p>
          <h2 id="stats-rewards-title" className="stats-rewards-title">
            {t('home.statsTitle')}
          </h2>
          <p className="stats-rewards-subtitle">
            {t('home.statsSubtitle')}
          </p>
        </header>

        <div className="stats-rewards-grid">
          {stats.map(({ value, label, detail, Icon }, index) => (
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
