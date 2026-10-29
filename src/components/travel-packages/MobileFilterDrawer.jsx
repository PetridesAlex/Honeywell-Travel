import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import PackageFilters from './PackageFilters'

function MobileFilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  onReset,
  priceBounds,
  availableCategories,
  activeCount = 0,
}) {
  const { t } = useTranslation()
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="tp-drawer" role="dialog" aria-modal="true" aria-labelledby="tp-drawer-title">
      <button type="button" className="tp-drawer__backdrop" aria-label={t('travelPackages.closeFilters')} onClick={onClose} />
      <div className="tp-drawer__panel">
        <div className="tp-drawer__header">
          <h2 id="tp-drawer-title" className="tp-drawer__title">
            {t('travelPackages.filtersTitle')}
            {activeCount > 0 ? (
              <span className="tp-drawer__count">{activeCount}</span>
            ) : null}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="tp-drawer__close"
            onClick={onClose}
            aria-label={t('travelPackages.closeFilters')}
          >
            <X size={22} strokeWidth={2.25} aria-hidden="true" />
          </button>
        </div>
        <div className="tp-drawer__body">
          <PackageFilters
            idPrefix="tp-mobile"
            filters={filters}
            onChange={onChange}
            onReset={onReset}
            priceBounds={priceBounds}
            availableCategories={availableCategories}
          />
        </div>
        <div className="tp-drawer__footer">
          <button type="button" className="tp-drawer__apply" onClick={onClose}>
            {t('travelPackages.showResults')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MobileFilterDrawer
