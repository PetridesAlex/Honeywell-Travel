import { useTranslation } from 'react-i18next'
import './DepartureCountdownBadge.css'

function DepartureCountdownBadge({ countdown, className = '', variant = 'card' }) {
  const { t } = useTranslation()

  if (!countdown || countdown.days == null) return null

  const { days } = countdown
  const urgent = days <= 30
  const imminent = days <= 7

  let caption = t('package.departureCountdown.days', { count: days })
  if (days === 0) caption = t('package.departureCountdown.today')
  else if (days === 1) caption = t('package.departureCountdown.tomorrow')

  return (
    <div
      className={`departure-countdown departure-countdown--${variant}${urgent ? ' departure-countdown--urgent' : ''}${imminent ? ' departure-countdown--imminent' : ''} ${className}`.trim()}
      role="status"
      aria-label={caption}
    >
      <span className="departure-countdown__value">{days}</span>
      <span className="departure-countdown__unit">
        {days === 1
          ? t('package.departureCountdown.dayUnit')
          : t('package.departureCountdown.daysUnit')}
      </span>
      <span className="departure-countdown__caption">{t('package.departureCountdown.caption')}</span>
    </div>
  )
}

export default DepartureCountdownBadge
