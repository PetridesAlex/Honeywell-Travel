import { Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFavorites } from '../context/FavoritesContext'

function FavoriteToggleButton({ packageId, className = '', size = 15 }) {
  const { t } = useTranslation()
  const { isFavorite, toggleFavorite } = useFavorites()
  const active = isFavorite(packageId)

  return (
    <button
      type="button"
      className={`favorites-heart-btn${active ? ' is-active' : ''} ${className}`.trim()}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggleFavorite(packageId)
      }}
      aria-pressed={active}
      aria-label={active ? t('favorites.remove') : t('favorites.add')}
      title={active ? t('favorites.remove') : t('favorites.add')}
    >
      <Heart size={size} fill={active ? 'currentColor' : 'none'} aria-hidden="true" />
    </button>
  )
}

export default FavoriteToggleButton
