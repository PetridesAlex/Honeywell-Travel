import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Heart, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFavorites } from '../context/FavoritesContext'
import { getPackageById } from '../data/packages'
import { loadMergedPackages } from '../lib/packagesCatalog'
import { packageCardImageUrl } from '../utils/packageCardImage'
import { localizePackage } from '../utils/packageTranslations'
import { translatePackageDuration } from '../utils/packageTitleI18n'
import './FavoritesPanel.css'

function FavoritesPanel() {
  const { t, i18n } = useTranslation()
  const { panelOpen, closePanel, favoriteIds, removeFavorite, clearFavorites } = useFavorites()
  const [catalog, setCatalog] = useState([])

  useEffect(() => {
    if (!panelOpen) return undefined
    let cancelled = false
    loadMergedPackages({ force: true }).then((list) => {
      if (!cancelled) setCatalog(Array.isArray(list) ? list : [])
    })
    return () => {
      cancelled = true
    }
  }, [panelOpen, favoriteIds])

  useEffect(() => {
    if (!panelOpen) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') closePanel()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [panelOpen, closePanel])

  const items = useMemo(() => {
    return favoriteIds
      .map((id) => {
        const numericId = Number(id)
        const fromCatalog =
          catalog.find((pkg) => String(pkg.id) === String(id)) ||
          (Number.isFinite(numericId) ? catalog.find((pkg) => Number(pkg.id) === numericId) : null)
        const pkg = fromCatalog || getPackageById(id)
        if (!pkg) {
          return {
            id: String(id),
            missing: true,
            title: t('favorites.unavailable'),
            imageUrl: '',
            destination: '',
            duration: '',
            price: 0,
            link: `/packages/${id}/details`,
          }
        }
        const localized = localizePackage(pkg, i18n)
        return {
          id: String(pkg.id),
          missing: false,
          title: localized.title,
          imageUrl: packageCardImageUrl(pkg),
          destination: pkg.destination || '',
          duration: translatePackageDuration(pkg.duration, i18n.language),
          price: getPackageLeadPrice(pkg),
          link: `/packages/${pkg.id}/details`,
        }
      })
      .filter(Boolean)
  }, [favoriteIds, catalog, t, i18n.language])

  if (!panelOpen || typeof document === 'undefined') return null

  return createPortal(
    <div className="favorites-panel-root" role="presentation">
      <button
        type="button"
        className="favorites-panel-backdrop"
        aria-label={t('favorites.close')}
        onClick={closePanel}
      />
      <aside className="favorites-panel" role="dialog" aria-modal="true" aria-label={t('favorites.title')}>
        <header className="favorites-panel__header">
          <div className="favorites-panel__heading">
            <Heart className="favorites-panel__heading-icon" aria-hidden="true" />
            <div>
              <h2 className="favorites-panel__title">{t('favorites.title')}</h2>
              <p className="favorites-panel__subtitle">
                {t('favorites.count', { count: favoriteIds.length })}
              </p>
            </div>
          </div>
          <button type="button" className="favorites-panel__close" onClick={closePanel} aria-label={t('favorites.close')}>
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="favorites-panel__body">
          {items.length === 0 ? (
            <div className="favorites-panel__empty">
              <Heart className="favorites-panel__empty-icon" aria-hidden="true" />
              <p className="favorites-panel__empty-title">{t('favorites.emptyTitle')}</p>
              <p className="favorites-panel__empty-text">{t('favorites.emptyText')}</p>
              <Link to="/packages" className="favorites-panel__browse" onClick={closePanel}>
                {t('favorites.browse')}
              </Link>
            </div>
          ) : (
            <ul className="favorites-panel__list">
              {items.map((item) => (
                <li key={item.id} className="favorites-panel__item">
                  <Link to={item.link} className="favorites-panel__card" onClick={closePanel}>
                    <div className="favorites-panel__thumb">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="favorites-panel__thumb-fallback" aria-hidden="true">
                          <Heart size={18} />
                        </span>
                      )}
                    </div>
                    <div className="favorites-panel__meta">
                      {item.destination ? (
                        <span className="favorites-panel__destination">{item.destination}</span>
                      ) : null}
                      <strong className="favorites-panel__name">{item.title}</strong>
                      <div className="favorites-panel__row">
                        {item.duration ? <span>{item.duration}</span> : null}
                        {!item.missing && item.price > 0 ? (
                          <span className="favorites-panel__price">
                            {t('favorites.fromPrice', { price: item.price.toLocaleString() })}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                  <button
                    type="button"
                    className="favorites-panel__remove"
                    onClick={() => removeFavorite(item.id)}
                    aria-label={t('favorites.remove')}
                    title={t('favorites.remove')}
                  >
                    <Heart size={16} fill="currentColor" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <footer className="favorites-panel__footer">
            <button type="button" className="favorites-panel__clear" onClick={clearFavorites}>
              {t('favorites.clear')}
            </button>
            <Link to="/packages" className="favorites-panel__browse favorites-panel__browse--footer" onClick={closePanel}>
              {t('favorites.browse')}
            </Link>
          </footer>
        ) : null}
      </aside>
    </div>,
    document.body
  )
}

export default FavoritesPanel
