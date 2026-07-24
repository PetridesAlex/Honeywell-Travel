import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { CalendarDays, Image, LogOut, Package, Sparkles } from 'lucide-react'
import {
  hasAuthCallbackInUrl,
  shouldUseCrmDesignPreview,
  signOutAdmin
} from '../../../lib/adminAuth'
import { supabase } from '../../../lib/supabase'
import { ADMIN_NAV } from '../constants'
import { getAdminDisplayName } from '../utils/adminUser'
import CmsBlackHoleFx from './CmsBlackHoleFx'
import '../Leads.css'
import './PackagesCms.css'

const ICONS = {
  packages: Package
}

function adminInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
  }
  const single = parts[0] || '?'
  return single.slice(0, 2).toUpperCase()
}

function AdminLayout({ title, subtitle, actions, header, children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [welcomeName, setWelcomeName] = useState(null)
  const [preferMotion, setPreferMotion] = useState(true)

  const designPreview =
    !hasAuthCallbackInUrl() &&
    shouldUseCrmDesignPreview({
      search: location.search,
      authReady: !checkingAuth,
      authed: hasSession
    })

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setPreferMotion(!media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession()
      const session = data?.session ?? null
      setHasSession(Boolean(session))
      if (session?.user) {
        setWelcomeName(getAdminDisplayName(session.user))
      } else {
        setWelcomeName(null)
      }
      setCheckingAuth(false)
    }

    loadUser()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setHasSession(Boolean(session))
      if (!session) {
        setWelcomeName(null)
        if (event === 'SIGNED_OUT') {
          navigate('/admin/login', { replace: true })
        }
        return
      }
      setWelcomeName(getAdminDisplayName(session.user))
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const navItems = useMemo(
    () =>
      ADMIN_NAV.map((item) => ({
        ...item,
        Icon: ICONS[item.icon] || Package
      })),
    []
  )

  const currentNav = useMemo(() => {
    const path = location.pathname
    return [...ADMIN_NAV]
      .sort((a, b) => b.to.length - a.to.length)
      .find((item) => path === item.to || path.startsWith(`${item.to}/`))
  }, [location.pathname])

  const PageIcon = currentNav ? ICONS[currentNav.icon] || Package : Package
  const firstName = useMemo(() => {
    const name = String(welcomeName || '').trim()
    if (!name) return null
    return name.split(/\s+/)[0]
  }, [welcomeName])

  const handleSignOut = async () => {
    if (designPreview) {
      navigate('/admin/login', { replace: true })
      return
    }
    await signOutAdmin()
    navigate('/admin/login', { replace: true })
  }

  if (checkingAuth) {
    return (
      <div className="crm-page cms-shell-page">
        <div className="crm-state">Checking session...</div>
      </div>
    )
  }

  return (
    <div className={`crm-page cms-shell-page${preferMotion ? ' cms-shell-page--fx' : ''}`}>
      <div className="crm-shell cms-shell">
        <aside
          className={`crm-sidebar crm-sidebar--premium cms-sidebar${
            preferMotion ? ' cms-sidebar--fx' : ''
          }`}
        >
          {preferMotion ? <CmsBlackHoleFx variant="sidebar" /> : null}

          <div className="cms-sidebar__content">
            <div className="crm-sidebar__brand">
              <div className="crm-sidebar__brand-logo">
                <img
                  src="/images/icons/honeywell-travel-logo.webp"
                  alt="Honeywell Travel"
                  width={180}
                  height={52}
                  className="crm-sidebar__brand-logo-img"
                />
              </div>
              <p className="crm-sidebar__brand-tagline">Travel Workspace</p>
              {designPreview ? (
                <div className="crm-sidebar__brand-user crm-sidebar__brand-user--preview">
                  <span className="crm-sidebar__brand-user-avatar" aria-hidden="true">
                    PV
                  </span>
                  <div className="crm-sidebar__brand-user-copy">
                    <span className="crm-sidebar__brand-user-label">Design preview</span>
                    <span className="crm-sidebar__brand-user-name">Local dev only</span>
                  </div>
                </div>
              ) : welcomeName ? (
                <div className="crm-sidebar__brand-user">
                  <span className="crm-sidebar__brand-user-avatar" aria-hidden="true">
                    {adminInitials(welcomeName)}
                  </span>
                  <div className="crm-sidebar__brand-user-copy">
                    <span className="crm-sidebar__brand-user-label">Signed in</span>
                    <span className="crm-sidebar__brand-user-name">{welcomeName}</span>
                  </div>
                </div>
              ) : null}
            </div>

            <p className="crm-sidebar__section">Workspace</p>
            <nav className="crm-sidebar__nav" aria-label="Packages CMS navigation">
              {navItems.map(({ to, label, Icon, icon }, index) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `crm-nav-link crm-nav-link--${icon} crm-nav-link--featured${
                      isActive ? ' crm-nav-link--active' : ''
                    }`
                  }
                  style={{ '--nav-index': index }}
                >
                  <span className="crm-nav-link__indicator" aria-hidden="true" />
                  <span className="crm-nav-link__glow" aria-hidden="true" />
                  <span className="crm-nav-link__icon-wrap">
                    <Icon size={18} strokeWidth={2.2} aria-hidden />
                  </span>
                  <span className="crm-nav-link__label">{label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="crm-sidebar__footer">
              <p className="crm-sidebar__hint">Search, edit, and publish travel packages live.</p>
              <button type="button" className="crm-sidebar__signout" onClick={handleSignOut}>
                <LogOut size={16} strokeWidth={2} aria-hidden />
                {designPreview ? 'Exit preview' : 'Sign out'}
              </button>
            </div>
          </div>
        </aside>

        <div className="crm-shell__main">
          {designPreview ? (
            <div className="crm-preview-banner" role="status">
              <strong>Layout preview only — you are not logged in</strong>
              <span>
                Sign in at <a href="/admin/login">/admin/login</a> with email and password to edit packages.
              </span>
            </div>
          ) : null}
          {header ?? (
            <header className="crm-header crm-header--premium cms-header cms-header--fx">
              {preferMotion ? (
                <CmsBlackHoleFx variant="header" />
              ) : (
                <>
                  <div className="crm-header__mesh cms-header__mesh" aria-hidden="true" />
                  <div className="crm-header__glow crm-header__glow--gold" aria-hidden="true" />
                  <div className="crm-header__glow crm-header__glow--red" aria-hidden="true" />
                  <div className="cms-header__orb cms-header__orb--teal" aria-hidden="true" />
                  <div className="cms-header__orb cms-header__orb--gold" aria-hidden="true" />
                  <div className="cms-header__shine" aria-hidden="true" />
                  <div className="cms-header__grid" aria-hidden="true" />
                </>
              )}

              <div className="crm-header__inner cms-header__inner">
                <div className="crm-header__main cms-header__main">
                  <div className="cms-header__top">
                    <p className="crm-header__eyebrow cms-header__eyebrow">
                      Honeywell Travel · Content studio
                    </p>
                    <span className="cms-header__live" aria-label="Connected to live website">
                      <span className="cms-header__live-dot" aria-hidden="true" />
                      Live site connected
                    </span>
                  </div>

                  <p className="cms-header__welcome">
                    {designPreview
                      ? 'Welcome to your workspace'
                      : firstName
                        ? `Welcome Back, ${firstName}`
                        : 'Welcome to your workspace'}
                  </p>

                  <div className="crm-header__title-row cms-header__title-row">
                    <span className="crm-header__page-icon cms-header__page-icon" aria-hidden="true">
                      <PageIcon size={22} strokeWidth={1.85} />
                      <span className="cms-header__page-icon-ring" />
                    </span>
                    <div className="cms-header__heading">
                      <h1 className="crm-header__title cms-header__title">
                        <span className="cms-header__title-line">{title}</span>
                      </h1>
                      <p className="cms-header__role">
                        <Sparkles size={13} strokeWidth={2.4} aria-hidden />
                        Shape what travelers see online
                      </p>
                    </div>
                  </div>

                  {subtitle ? (
                    <p className="crm-header__subtitle cms-header__subtitle">{subtitle}</p>
                  ) : null}

                  <ul className="cms-header__points">
                    <li style={{ '--point-i': 0 }}>
                      <span className="cms-header__point-icon" aria-hidden="true">
                        <CalendarDays size={15} strokeWidth={2.3} />
                      </span>
                      <span>
                        <strong>Prices &amp; dates</strong>
                        <em>Hotels, departures, tariffs</em>
                      </span>
                    </li>
                    <li style={{ '--point-i': 1 }}>
                      <span className="cms-header__point-icon" aria-hidden="true">
                        <Image size={15} strokeWidth={2.3} />
                      </span>
                      <span>
                        <strong>Media</strong>
                        <em>Covers &amp; gallery images</em>
                      </span>
                    </li>
                    <li style={{ '--point-i': 2 }}>
                      <span className="cms-header__point-icon" aria-hidden="true">
                        <Sparkles size={15} strokeWidth={2.3} />
                      </span>
                      <span>
                        <strong>Publish</strong>
                        <em>Go live on the website</em>
                      </span>
                    </li>
                  </ul>
                </div>

                {actions ? (
                  <div className="crm-header-actions cms-header-actions">
                    <p className="cms-header-actions__label">Quick actions</p>
                    <div className="crm-header-actions__toolbar cms-header-actions__toolbar">
                      {actions}
                    </div>
                  </div>
                ) : null}
              </div>
            </header>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
