import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import RevealOnScroll from '../components/RevealOnScroll'
import SEO from '../components/SEO'
import { getCategoryLabel } from '../utils/categoryI18n'
import './HolidayTypes.css'

const HOLIDAY_CATEGORIES = [
  { id: 'destinations', category: 'Destinations', icon: '🌍' },
  { id: 'summer-packages', category: 'Summer Packages', icon: '☀️' },
  { id: 'autumn-packages', category: 'Autumn Packages', icon: '🍂' },
  { id: 'winter-packages', category: 'Winter Packages', icon: '❄️' },
  { id: 'christmas-packages', category: 'Christmas Packages', icon: '🎄' },
  { id: 'easter-packages', category: 'Easter Packages', icon: '🐰' },
  { id: 'green-monday', category: 'Green Monday', icon: '🌿' },
  { id: 'cruises', category: 'Cruises', icon: '🚢' },
  { id: 'city-breaks', category: 'City Breaks', icon: '🏙️' },
  { id: 'exotic-packages', category: 'Exotic Packages', icon: '🌴' },
  { id: 'mary-special-trips', category: 'Mary Special Trips', icon: '✨' },
]

const FEATURE_KEYS = [
  { icon: '✨', titleKey: 'features.tailoredTitle', textKey: 'features.tailoredText' },
  { icon: '🌍', titleKey: 'features.knowledgeTitle', textKey: 'features.knowledgeText' },
  { icon: '⭐', titleKey: 'features.serviceTitle', textKey: 'features.serviceText' },
  { icon: '🏖️', titleKey: 'features.holidaysTitle', textKey: 'features.holidaysText' },
  { icon: '💰', titleKey: 'features.valueTitle', textKey: 'features.valueText' },
]

function HolidayTypes() {
  const { t } = useTranslation()

  return (
    <div className="holiday-types-page">
      <SEO
        title={t('holidayTypes.seoTitle')}
        description={t('holidayTypes.seoDescription')}
        keywords={t('holidayTypes.seoKeywords')}
        url="https://www.honeywelltravel.com.cy/holiday-types"
      />
      <RevealOnScroll direction="up">
      <div className="holiday-types-container">
        <div className="page-header">
          <h1>{t('holidayTypes.title')}</h1>
          <p className="page-subtitle">{t('holidayTypes.subtitle')}</p>
        </div>

        <div className="categories-grid">
          {HOLIDAY_CATEGORIES.map((item) => (
            <Link
              key={item.id}
              to={`/tour-category/${item.id}/`}
              className="category-card"
            >
              <div className="category-icon">{item.icon}</div>
              <h3 className="category-title">{getCategoryLabel(item.category, t)}</h3>
              <p className="category-description">{t(`holidayTypes.categories.${item.id}`)}</p>
              <span className="category-link">{t('common.viewPackages')} →</span>
            </Link>
          ))}
        </div>

        <section className="content-section">
          <h2>{t('holidayTypes.whatWeDo')}</h2>
          <p className="intro-text">{t('holidayTypes.whatWeDoP1')}</p>
          <p>{t('holidayTypes.whatWeDoP2')}</p>
          <p>{t('holidayTypes.whatWeDoP3')}</p>
          <p>{t('holidayTypes.whatWeDoP4')}</p>
        </section>

        <section className="content-section why-section">
          <h2>{t('holidayTypes.whyHoneywell')}</h2>
          <p className="intro-text">{t('holidayTypes.whyIntro')}</p>

          <div className="features-grid">
            {FEATURE_KEYS.map((feature) => (
              <div key={feature.titleKey} className="feature-item">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{t(`holidayTypes.${feature.titleKey}`)}</h3>
                <p>{t(`holidayTypes.${feature.textKey}`)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="cta-section">
          <h2>{t('holidayTypes.readyTitle')}</h2>
          <p>{t('holidayTypes.readyText')}</p>
          <a href="/contact/" className="cta-button">{t('common.getInTouch')}</a>
        </section>
      </div>
      </RevealOnScroll>
    </div>
  )
}

export default HolidayTypes
