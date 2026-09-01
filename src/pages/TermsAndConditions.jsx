import { useTranslation } from 'react-i18next'
import SEO from '../components/SEO'
import RevealOnScroll from '../components/RevealOnScroll'
import { siteTermsAndConditions } from '../data/siteTermsAndConditions'
import { getLocalizedTerms } from '../utils/localizedContent'
import './TermsAndConditions.css'

function TermsAndConditions() {
  const { t, i18n } = useTranslation()
  const { heroTitle, heroSubtitle, lastUpdated, sections } =
    getLocalizedTerms(siteTermsAndConditions, i18n.language) || siteTermsAndConditions.en

  return (
    <>
      <SEO
        title="Terms and Conditions - Honeywell Travel"
        description="Read the terms and conditions for bookings and travel services with Honeywell Travel, Cyprus."
        keywords="Honeywell Travel terms, travel agency terms Cyprus, booking conditions"
      />
      <div className="terms-page">
        <section className="terms-hero">
          <div className="terms-hero-content">
            <h1>{heroTitle}</h1>
            {heroSubtitle ? <p>{heroSubtitle}</p> : null}
            {lastUpdated ? (
              <p className="terms-hero-updated">{t('terms.lastUpdated')}: {lastUpdated}</p>
            ) : null}
          </div>
        </section>

        <div className="terms-container">
          <RevealOnScroll>
            <article className="terms-document">
              {sections.map((section) => (
                <section key={section.id} className="terms-section">
                  <h2 className="terms-section-title">{section.title}</h2>
                  {section.paragraphs?.map((paragraph, index) => (
                    <p key={index} className="terms-paragraph">
                      {paragraph}
                    </p>
                  ))}
                  {section.list?.length > 0 ? (
                    <ul className="terms-list">
                      {section.list.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </article>
          </RevealOnScroll>
        </div>
      </div>
    </>
  )
}

export default TermsAndConditions
