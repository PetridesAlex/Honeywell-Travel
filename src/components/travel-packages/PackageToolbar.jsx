import { useTranslation } from 'react-i18next'
import { LayoutGrid, List, ArrowUpDown } from 'lucide-react'
import { SORT_OPTIONS } from '../../pages/travel-packages/filterOptions'

function PackageToolbar({ count, sort, onSortChange, view, onViewChange }) {
  const { t } = useTranslation()

  return (
    <div className="tp-toolbar">
      <div className="tp-toolbar__lead">
        <span className="tp-toolbar__mark" aria-hidden="true" />
        <div className="tp-toolbar__count-wrap">
          <span className="tp-toolbar__eyebrow">{t('travelPackages.resultsLabel')}</span>
          <p className="tp-toolbar__count" aria-live="polite">
            <span className="tp-toolbar__count-num">{count}</span>
            <span className="tp-toolbar__count-text">
              {count === 1
                ? t('travelPackages.showingOneLabel')
                : t('travelPackages.showingManyLabel')}
            </span>
          </p>
        </div>
      </div>

      <div className="tp-toolbar__controls">
        <div className="tp-toolbar__sort-group">
          <label className="tp-toolbar__sort-label" htmlFor="tp-sort">
            <ArrowUpDown size={13} strokeWidth={2.4} aria-hidden="true" />
            {t('travelPackages.sortLabel')}
          </label>
          <div className="tp-toolbar__sort-shell">
            <select
              id="tp-sort"
              className="tp-toolbar__sort"
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t(`travelPackages.sort.${option}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {typeof onViewChange === 'function' ? (
          <div className="tp-toolbar__view" role="group" aria-label={t('travelPackages.viewLabel')}>
            <button
              type="button"
              className={`tp-toolbar__view-btn${view === 'grid' ? ' is-active' : ''}`}
              aria-pressed={view === 'grid'}
              aria-label={t('travelPackages.viewGrid')}
              title={t('travelPackages.viewGrid')}
              onClick={() => onViewChange('grid')}
            >
              <LayoutGrid size={15} strokeWidth={2.35} aria-hidden="true" />
              <span>{t('travelPackages.viewGrid')}</span>
            </button>
            <button
              type="button"
              className={`tp-toolbar__view-btn${view === 'list' ? ' is-active' : ''}`}
              aria-pressed={view === 'list'}
              aria-label={t('travelPackages.viewList')}
              title={t('travelPackages.viewList')}
              onClick={() => onViewChange('list')}
            >
              <List size={15} strokeWidth={2.35} aria-hidden="true" />
              <span>{t('travelPackages.viewList')}</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default PackageToolbar
