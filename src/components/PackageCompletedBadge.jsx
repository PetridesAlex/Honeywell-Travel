import { useTranslation } from 'react-i18next'
import './PackageCompletedBadge.css'

function PackageCompletedBadge({ className = '', variant = 'card' }) {
  const { t } = useTranslation()

  return (
    <div
      className={`package-completed-badge package-completed-badge--${variant} ${className}`.trim()}
      role="status"
      aria-label={t('package.completedBadge.label')}
    >
      <span className="package-completed-badge__icon" aria-hidden="true">✓</span>
      <span className="package-completed-badge__label">{t('package.completedBadge.title')}</span>
    </div>
  )
}

export default PackageCompletedBadge
