import { useTranslation } from 'react-i18next'
import { normalizeLang } from '../utils/localizedContent'
import './LanguageSwitcher.css'

function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  const currentLanguage = normalizeLang(i18n.resolvedLanguage || i18n.language)

  const changeLanguage = (lng) => {
    const next = normalizeLang(lng)
    if (currentLanguage === next) return
    void i18n.changeLanguage(next)
  }

  return (
    <div className="language-switcher">
      <button
        type="button"
        className={`lang-btn ${currentLanguage === 'en' ? 'active' : ''}`}
        onClick={() => changeLanguage('en')}
        aria-label={t('language.switchToEnglish')}
        aria-pressed={currentLanguage === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        className={`lang-btn ${currentLanguage === 'el' ? 'active' : ''}`}
        onClick={() => changeLanguage('el')}
        aria-label={t('language.switchToGreek')}
        aria-pressed={currentLanguage === 'el'}
      >
        GR
      </button>
    </div>
  )
}

export default LanguageSwitcher
