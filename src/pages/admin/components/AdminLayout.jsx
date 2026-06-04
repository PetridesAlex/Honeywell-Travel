import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Building2,
  CalendarClock,
  ContactRound,
  Kanban,
  Layers,
  LayoutDashboard,
  Calculator,
  ChevronRight,
  Ship,
  ClipboardList,
  Gift,
  LogOut,
  UserCircle,
  Users
} from 'lucide-react'
import { fetchClientsWithExpiringPassports } from '../api/clientsApi'
import { signOutAdmin } from '../../../lib/adminAuth'
import { supabase } from '../../../lib/supabase'
import { ADMIN_NAV } from '../constants'
import { fetchLeads } from '../api/leadsApi'
import { fetchOpenTasksCount } from '../api/teamApi'
import { getAdminDisplayName } from '../utils/adminUser'
import { countFollowUps } from '../utils/followUp'
import '../Leads.css'

const ICONS = {
  dashboard: LayoutDashboard,
  servicesHub: Layers,
  corporate: Building2,
  corpContacts: ContactRound,
  clients: UserCircle,
  leads: Users,
  pipeline: Kanban,
  followups: CalendarClock,
  reports: BarChart3,
  team: ClipboardList,
  vouchers: Gift,
  calculator: Calculator,
  groupBookings: Ship
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
  const [followUpBadge, setFollowUpBadge] = useState(0)
  const [passportBadge, setPassportBadge] = useState(0)
  const [teamTaskBadge, setTeamTaskBadge] = useState(0)
  const [welcomeName, setWelcomeName] = useState(null)

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (data?.session?.user) {
        setWelcomeName(getAdminDisplayName(data.session.user))
      }
      setCheckingAuth(false)
    }

    loadUser()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
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

  useEffect(() => {
    const loadBadge = async () => {
      const { data } = await fetchLeads()
      const counts = countFollowUps(data || [])
      setFollowUpBadge(counts.today + counts.overdue)

      const { data: passportData } = await fetchClientsWithExpiringPassports(90)
      if (passportData) {
        setPassportBadge(passportData.expiring.length + passportData.expired.length)
      }

      const { count } = await fetchOpenTasksCount()
      setTeamTaskBadge(count)
    }
    if (!checkingAuth) loadBadge()
  }, [checkingAuth, title])

  const navItems = useMemo(
    () =>
      ADMIN_NAV.map((item) => ({
        ...item,
        Icon: ICONS[item.icon],
        badge:
          item.badgeKey === 'followUps'
            ? followUpBadge
            : item.badgeKey === 'teamTasks'
              ? teamTaskBadge
              : item.icon === 'clients'
                ? passportBadge
                : 0
      })),
    [followUpBadge, passportBadge, teamTaskBadge]
  )

  const currentNav = useMemo(() => {
    const path = location.pathname
    return [...ADMIN_NAV]
      .sort((a, b) => b.to.length - a.to.length)
      .find((item) => path === item.to || path.startsWith(`${item.to}/`))
  }, [location.pathname])

  const PageIcon = currentNav ? ICONS[currentNav.icon] : LayoutDashboard

  const handleSignOut = async () => {
    await signOutAdmin()
    navigate('/admin/login', { replace: true })
  }

  if (checkingAuth) {
    return (
      <div className="crm-page">
        <div className="crm-state">Checking session...</div>
      </div>
    )
  }

  return (
    <div className="crm-page">
      <div className="crm-shell">
        <aside className="crm-sidebar crm-sidebar--premium">
          <div className="crm-sidebar__brand">
            <div className="crm-sidebar__brand-logo">
              <img
                src="/images/icons/honeywell-travel-logo.webp"
                alt="Honeywell Travel"
                width={280}
                height={72}
                className="crm-sidebar__brand-logo-img"
              />
            </div>
            <p className="crm-sidebar__brand-tagline">CRM Workspace</p>
            {welcomeName ? (
              <div className="crm-sidebar__brand-user">
                <span className="crm-sidebar__brand-user-avatar" aria-hidden="true">
                  {adminInitials(welcomeName)}
                </span>
                <div className="crm-sidebar__brand-user-copy">
                  <span className="crm-sidebar__brand-user-label">Welcome back</span>
                  <span className="crm-sidebar__brand-user-name">{welcomeName}</span>
                </div>
              </div>
            ) : null}
          </div>

          <p className="crm-sidebar__section">Menu</p>
          <nav className="crm-sidebar__nav" aria-label="Admin navigation">
            {navItems.map(({ to, label, Icon, badge, icon, highlight }, index) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `crm-nav-link crm-nav-link--${icon}${highlight ? ' crm-nav-link--featured' : ''}${isActive ? ' crm-nav-link--active' : ''}`
                }
                style={{ '--nav-index': index }}
              >
                <span className="crm-nav-link__indicator" aria-hidden="true" />
                <span className="crm-nav-link__glow" aria-hidden="true" />
                <span className="crm-nav-link__icon-wrap">
                  <Icon size={18} strokeWidth={2.2} aria-hidden />
                </span>
                <span className="crm-nav-link__label">{label}</span>
                {badge > 0 ? <em className="crm-nav-badge">{badge > 99 ? '99+' : badge}</em> : null}
                <ChevronRight className="crm-nav-link__chevron" size={16} strokeWidth={2.25} aria-hidden />
              </NavLink>
            ))}
          </nav>

          <div className="crm-sidebar__footer">
            <p className="crm-sidebar__hint">Leads, clients, pipeline &amp; follow-ups in one place.</p>
            <button type="button" className="crm-sidebar__signout" onClick={handleSignOut}>
              <LogOut size={16} strokeWidth={2} aria-hidden />
              Sign out
            </button>
          </div>
        </aside>

        <div className="crm-shell__main">
          {header ?? (
            <header className="crm-header crm-header--premium">
              <div className="crm-header__mesh" aria-hidden="true" />
              <div className="crm-header__glow crm-header__glow--gold" aria-hidden="true" />
              <div className="crm-header__glow crm-header__glow--red" aria-hidden="true" />

              <div className="crm-header__inner">
                <div className="crm-header__main">
                  <p className="crm-header__eyebrow">Honeywell Travel · CRM workspace</p>
                  <div className="crm-header__title-row">
                    <span className="crm-header__page-icon" aria-hidden="true">
                      <PageIcon size={24} strokeWidth={1.85} />
                    </span>
                    <h1 className="crm-header__title">{title}</h1>
                  </div>
                  {subtitle ? <p className="crm-header__subtitle">{subtitle}</p> : null}
                </div>

                {actions ? (
                  <div className="crm-header-actions">
                    <div className="crm-header-actions__toolbar">{actions}</div>
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
