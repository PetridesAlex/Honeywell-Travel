import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import './Header.css'

const ESIM_AFFILIATE_URL =
  'https://globaladvancedcomm.myshopify.com?sca_ref=11515440.g6jdihq0ttYGdlkB'

function HeaderUtilityControls() {
  const { t } = useTranslation()

  return (
    <>
      <a
        href={ESIM_AFFILIATE_URL}
        className="tagline-esim-link"
        target="_blank"
        rel="noopener noreferrer sponsored"
        aria-label={t('header.esimAria')}
      >
        <span className="tagline-esim-link__icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="2" width="14" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M9 7h6M9 11h6M9 15h4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <circle cx="16.5" cy="16.5" r="2.5" fill="currentColor" opacity="0.9" />
          </svg>
        </span>
        <span className="tagline-esim-link__copy">
          <span className="tagline-esim-link__label">{t('header.esimLabel')}</span>
          <span className="tagline-esim-link__hint">{t('header.esimHint')}</span>
        </span>
      </a>
      <LanguageSwitcher />
    </>
  )
}

// Helper function to convert category name to URL-friendly slug
const categoryToSlug = (category) => {
  return category
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9-]/g, '')
}

/** Desktop vs mobile Holiday Types link modifiers for featured rows. */
const holidayTypesLinkClass = (item, mode) => {
  const base = mode === 'mobile' ? 'mobile-dropdown-item' : 'dropdown-item'
  if (item === 'Summer Packages') return `${base} ${base}--summer-primary`
  if (item === 'Summer Packages to Greece') return `${base} ${base}--summer-secondary`
  if (item === 'Exotic Packages' || item === 'Mary Specials Trips') return `${base} ${base}--exotic-premium`
  return `${base} ${base}--holiday-caps`
}

function Header() {
  const { t } = useTranslation()
  const [activeDropdown, setActiveDropdown] = useState(null) // desktop dropdowns
  const [closeTimeout, setCloseTimeout] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null)

  const holidayTypes = [
    'Summer Packages',
    'Summer Packages to Greece',
    'Mary Specials Trips',
    'Exotic Packages',
    'Easter Packages',
    'Autumn Packages',
    'Winter Packages',
    'Christmas Packages',
    'Green Monday Packages',
    'Cruises',
    'City Breaks',
    'Music & Sports'
  ]

  const honeymoonTypes = [
    'Honeymoon Trips',
    'Honeymoon Calendar',
    'Gift Voucher'
  ]

  const handleDropdownEnter = (type) => {
    if (closeTimeout) {
      clearTimeout(closeTimeout)
      setCloseTimeout(null)
    }
    setActiveDropdown(type)
  }

  const handleDropdownLeave = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null)
    }, 200) // 200ms delay before closing
    setCloseTimeout(timeout)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
    setActiveMobileDropdown(null)
  }

  const toggleMobileDropdown = (type) => {
    setActiveMobileDropdown((prev) => (prev === type ? null : type))
  }

  return (
    <header className="header">
      <div className="tagline-bar">
        <span className="tagline-brand">Honeywell Travel</span>
        <span className="tagline-text">#LivetheExperience</span>
        <div className="tagline-right-controls">
          <div className="tagline-utility-controls">
            <HeaderUtilityControls />
          </div>
          <div className="social-icons tagline-social-icons">
            <a
              href="https://www.facebook.com/honeywelltravel"
              className="social-icon social-icon--facebook"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a
              href="https://www.instagram.com/honeywell_travel/"
              className="social-icon social-icon--instagram"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="header-container">
        <Link to="/" className="logo">
          <img 
            src="/images/icons/honeywell-travel-logo.webp" 
            alt="Honeywell Travel Logo" 
            className="logo-image"
          />
        </Link>

        <div className="header-cta-group">
          <Link 
            to="/build-your-trip" 
            className="header-build-trip"
            onClick={() => {
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
            }}
          >
            <span className="header-build-trip-text">Build Your Trip</span>
            <span className="header-build-trip-icon">→</span>
          </Link>

          <Link
            to="/flight-tickets/"
            className="header-flight-tickets"
            onClick={() => {
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
            }}
          >
            <span className="header-flight-tickets-icon" aria-hidden>✈</span>
            <span className="header-flight-tickets-text">Flight Tickets</span>
          </Link>

          <Link
            to="/cruises/"
            className="header-cruises-cta"
            onClick={() => {
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
            }}
          >
            <span className="header-cruises-cta-icon" aria-hidden>🚢</span>
            <span className="header-cruises-cta-text">Cruises</span>
          </Link>
        </div>
        
        <nav className="nav">
          <Link to="/ourworld/" className="nav-link">Our World</Link>
          
          <div 
            className="nav-dropdown"
            onMouseEnter={() => handleDropdownEnter('holiday')}
            onMouseLeave={handleDropdownLeave}
          >
            <span className="nav-link dropdown-trigger">
              Holiday Types
              <span className="dropdown-arrow">▼</span>
            </span>
            {activeDropdown === 'holiday' && (
              <div className="dropdown-menu" onMouseEnter={() => handleDropdownEnter('holiday')} onMouseLeave={handleDropdownLeave}>
                <div className="dropdown-arrow-top"></div>
                {holidayTypes.map((item, index) => (
                  <Link 
                    key={index} 
                    to={item === 'Cruises' ? '/cruises/' : `/tour-category/${categoryToSlug(item)}/`}
                    className={holidayTypesLinkClass(item, 'desktop')}
                    onClick={() => {
                      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
                      if (document.documentElement) document.documentElement.scrollTop = 0
                      if (document.body) document.body.scrollTop = 0
                      setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }), 0)
                    }}
                  >
                    <span className="dropdown-item-icon">→</span>
                    {item}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div 
            className="nav-dropdown"
            onMouseEnter={() => handleDropdownEnter('honeymoon')}
            onMouseLeave={handleDropdownLeave}
          >
            <span className="nav-link dropdown-trigger">
              {t('header.honeymoon')}
              <span className="dropdown-arrow">▼</span>
            </span>
            {activeDropdown === 'honeymoon' && (
              <div className="dropdown-menu" onMouseEnter={() => handleDropdownEnter('honeymoon')} onMouseLeave={handleDropdownLeave}>
                <div className="dropdown-arrow-top"></div>
                {honeymoonTypes.map((item, index) => (
                  <Link 
                    key={index} 
                    to={
                      item === 'Gift Voucher'
                        ? '/gift-vouchers'
                        : item === 'Honeymoon Calendar'
                          ? '/honeymoon-calendar'
                          : `/${item.toLowerCase().replace(/\s+/g, '-')}`
                    } 
                    className="dropdown-item"
                  >
                    <span className="dropdown-item-icon">→</span>
                    {item}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/our-services/" className="nav-link nav-link-corporate">
            <span className="nav-link-corporate-icon" aria-hidden>▸</span>
            {t('header.corporate')}
            <span className="nav-link-corporate-badge" aria-hidden>B2B</span>
          </Link>
          <Link to="/dmc-cyprus" className="nav-link">{t('header.dmcServices')}</Link>
          
          <div 
            className="nav-dropdown"
            onMouseEnter={() => handleDropdownEnter('services')}
            onMouseLeave={handleDropdownLeave}
          >
            <span className="nav-link dropdown-trigger">
              Services
              <span className="dropdown-arrow">▼</span>
            </span>
            {activeDropdown === 'services' && (
              <div className="dropdown-menu" onMouseEnter={() => handleDropdownEnter('services')} onMouseLeave={handleDropdownLeave}>
                <div className="dropdown-arrow-top"></div>
                <a
                  href="https://summerautos.com/"
                  className="dropdown-item"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="dropdown-item-icon">→</span>
                  {t('header.carHire')}
                </a>
                <a 
                  href="https://www.icontract.gr/whitelabelcy/el/index.aspx" 
                  className="dropdown-item" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <span className="dropdown-item-icon">→</span>
                  {t('header.insurance')}
                </a>
                <Link
                  to="/terms-and-conditions/"
                  className="dropdown-item"
                  onClick={() => {
                    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
                    if (document.documentElement) document.documentElement.scrollTop = 0
                    if (document.body) document.body.scrollTop = 0
                    setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }), 0)
                  }}
                >
                  <span className="dropdown-item-icon">→</span>
                  {t('header.termsAndConditions')}
                </Link>
              </div>
            )}
          </div>

          <div
            className="nav-dropdown nav-dropdown-right"
            onMouseEnter={() => handleDropdownEnter('inspiration')}
            onMouseLeave={handleDropdownLeave}
          >
            <span className="nav-link dropdown-trigger">
              Inspiration
              <span className="dropdown-arrow">▼</span>
            </span>
            {activeDropdown === 'inspiration' && (
              <div
                className="dropdown-menu"
                onMouseEnter={() => handleDropdownEnter('inspiration')}
                onMouseLeave={handleDropdownLeave}
              >
                <div className="dropdown-arrow-top"></div>
                <Link
                  to="/honeywell-travel-gallery/"
                  className="dropdown-item"
                  onClick={() => {
                    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
                    if (document.documentElement) document.documentElement.scrollTop = 0
                    if (document.body) document.body.scrollTop = 0
                    setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }), 0)
                  }}
                >
                  <span className="dropdown-item-icon">→</span>
                  {t('header.gallery')}
                </Link>
                <Link
                  to="/our-blog/"
                  className="dropdown-item"
                  onClick={() => {
                    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
                    if (document.documentElement) document.documentElement.scrollTop = 0
                    if (document.body) document.body.scrollTop = 0
                    setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }), 0)
                  }}
                >
                  <span className="dropdown-item-icon">→</span>
                  {t('header.blog')}
                </Link>
              </div>
            )}
          </div>

          <Link to="/contact/" className="nav-link">{t('header.contact')}</Link>
        </nav>

        <div className="header-mobile-actions">
          <div className="header-utility-controls">
            <HeaderUtilityControls />
          </div>

          <button
            className={`mobile-menu-btn ${isMobileMenuOpen ? 'is-open' : ''}`}
            onClick={() => {
              setIsMobileMenuOpen((prev) => !prev)
              setActiveMobileDropdown(null)
            }}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <span className="hamburger-icon" aria-hidden="true">
              <span className="hamburger-line hamburger-line--top" />
              <span className="hamburger-line hamburger-line--middle" />
              <span className="hamburger-line hamburger-line--bottom" />
            </span>
          </button>
        </div>
      </div>

      <div className="header-announcement-bar" role="status" aria-live="polite">
        <div className="header-announcement-track">
          <div className="header-announcement-group">
            <span className="header-announcement-item">
              Prices may vary due to airline and airport tax changes.
            </span>
            <span className="header-announcement-separator" aria-hidden>
              •
            </span>
            <span className="header-announcement-item" aria-hidden>
              Prices may vary due to airline and airport tax changes.
            </span>
            <span className="header-announcement-separator" aria-hidden>
              •
            </span>
          </div>
          <div className="header-announcement-group" aria-hidden>
            <span className="header-announcement-item">
              Prices may vary due to airline and airport tax changes.
            </span>
            <span className="header-announcement-separator">•</span>
            <span className="header-announcement-item">
              Prices may vary due to airline and airport tax changes.
            </span>
            <span className="header-announcement-separator">•</span>
          </div>
        </div>
      </div>

      <div className="header-summer-availability">
        <Link to="/summer-availability/" className="header-summer-availability-link">
          <span className="header-summer-availability-text">
            Summer package availability — see what&apos;s left
          </span>
          <span className="header-summer-availability-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <Link to="/build-your-trip" className="mobile-link mobile-build-trip" onClick={closeMobileMenu}>
            <span>Build Your Trip</span>
            <span className="mobile-build-trip-icon">→</span>
          </Link>
          <Link to="/flight-tickets/" className="mobile-link mobile-flight-tickets" onClick={closeMobileMenu}>
            <span className="mobile-flight-tickets-icon" aria-hidden>✈</span>
            <span>Flight Tickets</span>
            <span className="mobile-flight-tickets-arrow">→</span>
          </Link>
          <Link to="/cruises/" className="mobile-link mobile-cruises-cta" onClick={closeMobileMenu}>
            <span className="mobile-cruises-cta-icon" aria-hidden>🚢</span>
            <span>Cruises</span>
            <span className="mobile-cruises-cta-arrow">→</span>
          </Link>
          <Link to="/ourworld/" className="mobile-link" onClick={closeMobileMenu}>{t('header.ourWorld')}</Link>
          
          <div className="mobile-dropdown">
            <button 
              className="mobile-link mobile-dropdown-trigger" 
              onClick={() => toggleMobileDropdown('holiday')}
            >
              {t('header.holidayTypes')}
              <span className="mobile-dropdown-arrow">{activeMobileDropdown === 'holiday' ? '▲' : '▼'}</span>
            </button>
            {activeMobileDropdown === 'holiday' && (
              <div className="mobile-dropdown-menu">
                {holidayTypes.map((item, index) => (
                  <Link 
                    key={index} 
                    to={item === 'Cruises' ? '/cruises/' : `/tour-category/${categoryToSlug(item)}/`}
                    className={holidayTypesLinkClass(item, 'mobile')}
                    onClick={() => {
                      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
                      if (document.documentElement) document.documentElement.scrollTop = 0
                      if (document.body) document.body.scrollTop = 0
                      setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }), 0)
                      closeMobileMenu()
                    }}
                  >
                    <span className="dropdown-item-icon">→</span>
                    {item}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mobile-dropdown">
            <button 
              className="mobile-link mobile-dropdown-trigger" 
              onClick={() => toggleMobileDropdown('honeymoon')}
            >
              {t('header.honeymoon')}
              <span className="mobile-dropdown-arrow">{activeMobileDropdown === 'honeymoon' ? '▲' : '▼'}</span>
            </button>
            {activeMobileDropdown === 'honeymoon' && (
              <div className="mobile-dropdown-menu">
                {honeymoonTypes.map((item, index) => (
                  <Link 
                    key={index} 
                    to={
                      item === 'Gift Voucher'
                        ? '/gift-vouchers'
                        : item === 'Honeymoon Calendar'
                          ? '/honeymoon-calendar'
                          : `/${item.toLowerCase().replace(/\s+/g, '-')}`
                    } 
                    className="mobile-dropdown-item"
                    onClick={closeMobileMenu}
                  >
                    <span className="dropdown-item-icon">→</span>
                    {item}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/our-services/" className="mobile-link" onClick={closeMobileMenu}>{t('header.corporate')}</Link>
          <Link to="/dmc-cyprus" className="mobile-link" onClick={closeMobileMenu}>{t('header.dmcServices')}</Link>
          <a
            href="https://summerautos.com/"
            className="mobile-link"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMobileMenu}
          >
            {t('header.carHire')}
          </a>
          <Link to="/honeywell-travel-gallery/" className="mobile-link" onClick={closeMobileMenu}>{t('header.gallery')}</Link>
          <Link to="/our-blog/" className="mobile-link" onClick={closeMobileMenu}>{t('header.blog')}</Link>
          <a 
            href="https://www.icontract.gr/whitelabelcy/el/index.aspx" 
            className="mobile-link" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={closeMobileMenu}
          >
            {t('header.insurance')}
          </a>
          <Link to="/terms-and-conditions/" className="mobile-link" onClick={closeMobileMenu}>
            {t('header.termsAndConditions')}
          </Link>
          <Link to="/contact/" className="mobile-link" onClick={closeMobileMenu}>{t('header.contact')}</Link>

          <div className="mobile-social-icons">
            <a 
              href="https://www.facebook.com/honeywelltravel" 
              className="mobile-social-icon mobile-social-icon--facebook" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Facebook"
              onClick={closeMobileMenu}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </a>
            <a 
              href="https://www.instagram.com/honeywell_travel/" 
              className="mobile-social-icon mobile-social-icon--instagram" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Instagram"
              onClick={closeMobileMenu}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Instagram</span>
            </a>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header

