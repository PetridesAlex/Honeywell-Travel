import { useTranslation } from 'react-i18next'
import { getCategoryLabel } from '../utils/categoryI18n'
import TourCategoryPackageRow from './TourCategoryPackageRow'
import './TourPackagesSection.css'

const CATEGORY_ROWS = [
  {
    slug: 'autumn-packages',
    category: 'Autumn Packages',
  },
  {
    slug: 'christmas-packages',
    category: 'Christmas Packages',
  },
  {
    slug: 'exotic-packages',
    category: 'Exotic Packages',
  },
  {
    slug: 'music-sports',
    category: 'Music & Sports',
  },
  {
    slug: 'summer-packages',
    category: 'Summer Packages',
  },
  {
    slug: 'summer-packages-to-greece',
    category: 'Summer Packages to Greece',
  },
  {
    slug: 'cruises',
    category: 'Cruises',
  },
  {
    slug: 'winter-packages',
    category: 'Winter Packages',
  },
  {
    slug: 'ski-packages',
    category: 'Ski Packages',
  },
]

function TourPackagesSection() {
  const { t } = useTranslation()

  return (
    <section className="tour-packages-section" aria-labelledby="tour-packages-heading">
      <div className="tour-packages-container">
        <header className="section-header">
          <h2 id="tour-packages-heading" className="section-title">
            {t('home.tourPackagesTitle')}
          </h2>
          <p className="section-subtitle">
            {t('home.tourPackagesSubtitle')}
          </p>
        </header>

        <div className="tour-category-rows">
          {CATEGORY_ROWS.map((row) => (
            <TourCategoryPackageRow
              key={row.slug}
              slug={row.slug}
              category={row.category}
              title={getCategoryLabel(row.category, t)}
              description={t(`home.categoryDescriptions.${row.slug}`)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TourPackagesSection
