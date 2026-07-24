import { Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFavorites } from '../context/FavoritesContext'
import './FavoritesTrigger.css'

function FavoritesTrigger({ className = '' }) {
  const { t } = useTranslation()
  const { count, togglePanel, panelOpen } = useFavorites()

  return (
    <button
      type="button"
      className={`favorites-trigger ${className}`.trim()}
      onClick={togglePanel}
      aria-label={t('favorites.openAria', { count })}
      aria-expanded={panelOpen}
      aria-haspopup="dialog"
      title={t('favorites.title')}
    >
      <Heart
        className={`favorites-trigger__icon${count > 0 ? ' is-active' : ''}`}
        aria-hidden="true"
        fill={count > 0 ? 'currentColor' : 'none'}
      />
      {count > 0 ? <span className="favorites-trigger__badge">{count > 99 ? '99+' : count}</span> : null}
    </button>
  )
}

export default FavoritesTrigger
