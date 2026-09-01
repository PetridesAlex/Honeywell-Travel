import { useTranslation } from 'react-i18next'
import './LanguageSwitcher.css'

function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  const currentLanguage = i18n.language?.startsWith('el') ? 'el' : 'en'

  return (
    <div className="language-switcher">
      <button
        className={`lang-btn ${currentLanguage === 'en' ? 'active' : ''}`}
        onClick={() => changeLanguage('en')}
        aria-label={t('language.switchToEnglish')}
      >
        EN
      </button>
      <button
        className={`lang-btn ${currentLanguage === 'el' ? 'active' : ''}`}
        onClick={() => changeLanguage('el')}
        aria-label={t('language.switchToGreek')}
      >
        GR
      </button>
    </div>
  )
}

export default LanguageSwitcher
