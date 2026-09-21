import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './FeaturedJapanPromo.css'

const GALLERY_IMAGES = [
  {
    id: 'aurora',
    src: '/images/winter-promo/aurora-hero.webp?v=2',
    labelKey: 'home.winterPromo.auroraLabel',
    altKey: 'home.winterPromo.auroraAlt',
    className: 'winter-promo__hero-image',
    frameClass: 'winter-promo__media-frame winter-promo__media-frame--hero',
    imgClass: 'winter-promo__img winter-promo__img--aurora',
  },
  {
    id: 'ski',
    src: '/images/winter-promo/ski-destinations.webp?v=5',
    labelKey: 'home.winterPromo.skiLabel',
    altKey: 'home.winterPromo.skiAlt',
    className: 'winter-promo__gallery-card winter-promo__gallery-card--ski',
    frameClass: 'winter-promo__media-frame winter-promo__media-frame--ski',
    imgClass: 'winter-promo__img winter-promo__img--ski',
  },
  {
    id: 'christmas',
    src: '/images/winter-promo/christmas-markets.webp?v=2',
    labelKey: 'home.winterPromo.christmasLabel',
    altKey: 'home.winterPromo.christmasAlt',
    className: 'winter-promo__gallery-card winter-promo__gallery-card--christmas',
    frameClass: 'winter-promo__media-frame winter-promo__media-frame--christmas',
    imgClass: 'winter-promo__img winter-promo__img--christmas',
  },
]

const SNOW_PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 5.7 + 3) % 100}%`,
  delay: `${(i % 9) * 0.7}s`,
  duration: `${10 + (i % 6) * 1.4}s`,
  size: `${2 + (i % 4)}px`,
  opacity: 0.25 + (i % 5) * 0.1,
}))

function FeaturedJapanPromo() {
  const { t } = useTranslation()

  return (
    <section className="featured-japan-promo winter-promo" aria-labelledby="winter-promo-title">
      <div className="winter-promo__atmosphere" aria-hidden="true">
        {SNOW_PARTICLES.map((particle) => (
          <span
            key={particle.id}
            className="winter-promo__snow-particle"
            style={{
              left: particle.left,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
        <span className="winter-promo__sparkle winter-promo__sparkle--1" />
        <span className="winter-promo__sparkle winter-promo__sparkle--2" />
        <span className="winter-promo__sparkle winter-promo__sparkle--3" />
      </div>

      <div className="featured-japan-promo__inner winter-promo__inner">
        <div className="winter-promo__content">
          <p className="winter-promo__eyebrow">
            <span className="winter-promo__badge">{t('home.winterPromo.badge')}</span>
          </p>

          <h2 id="winter-promo-title" className="winter-promo__title">
            {t('home.winterPromo.headline')}
          </h2>

          <p className="winter-promo__supporting">{t('home.winterPromo.supportingText')}</p>

          <p className="winter-promo__description">{t('home.winterPromo.description')}</p>

          <div className="winter-promo__actions">
            <Link to="/tour-category/christmas-packages/" className="winter-promo__cta">
              {t('home.winterPromo.primaryCta')}
            </Link>
            <Link to="/tour-category/christmas-markets/" className="winter-promo__link">
              {t('home.winterPromo.secondaryCta')}
            </Link>
          </div>
        </div>

        <div className="winter-promo__gallery" role="list" aria-label={t('home.winterPromo.galleryLabel')}>
          <div className={GALLERY_IMAGES[0].className} role="listitem">
            <div className={GALLERY_IMAGES[0].frameClass}>
              <img
                src={GALLERY_IMAGES[0].src}
                alt={t(GALLERY_IMAGES[0].altKey)}
                className={GALLERY_IMAGES[0].imgClass}
                loading="lazy"
                decoding="async"
              />
              <div className="winter-promo__img-gradient" aria-hidden="true" />
              <span className="winter-promo__image-label">{t(GALLERY_IMAGES[0].labelKey)}</span>
            </div>
          </div>

          <div className="winter-promo__secondary-grid">
            {GALLERY_IMAGES.slice(1).map((item) => (
              <div key={item.id} className={item.className} role="listitem">
                <div className={item.frameClass}>
                  <img
                    src={item.src}
                    alt={t(item.altKey)}
                    className={item.imgClass}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="winter-promo__img-gradient" aria-hidden="true" />
                  <span className="winter-promo__image-label">{t(item.labelKey)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturedJapanPromo
