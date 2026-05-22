import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Building2,
  CalendarClock,
  Kanban,
  LayoutDashboard,
  ClipboardList,
  LogOut,
  UserCircle,
  Users
} from 'lucide-react'
import { fetchClientsWithExpiringPassports } from '../api/clientsApi'
import { supabase } from '../../../lib/supabase'
import { ADMIN_NAV } from '../constants'
import { fetchLeads } from '../api/leadsApi'
import { fetchOpenTasksCount } from '../api/teamApi'
import { getAdminDisplayName } from '../utils/adminUser'
import { countFollowUps } from '../utils/followUp'
import '../Leads.css'

const ICONS = {
  dashboard: LayoutDashboard,
  corporate: Building2,
  clients: UserCircle,
  leads: Users,
  pipeline: Kanban,
  followups: CalendarClock,
  reports: BarChart3,
  team: ClipboardList
}

function AdminLayout({ title, subtitle, actions, header, children }) {
  const navigate = useNavigate()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [followUpBadge, setFollowUpBadge] = useState(0)
  const [passportBadge, setPassportBadge] = useState(0)
  const [teamTaskBadge, setTeamTaskBadge] = useState(0)
  const [welcomeName, setWelcomeName] = useState(null)

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error || !data?.session) {
        navigate('/admin/login', { replace: true })
        return
      }
      const { data: userData } = await supabase.auth.getUser()
      setWelcomeName(getAdminDisplayName(userData?.user))
      setCheckingAuth(false)
    }

    checkSession()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setWelcomeName(null)
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
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
            <div className="crm-sidebar__brand-mark">
              <div className="crm-sidebar__logo crm-sidebar__logo--brand">
                <img
                  src="/images/icons/honeywell-travel-logo.webp"
                  alt="Honeywell Travel"
                  width={96}
                  height={96}
                />
              </div>
              <span className="crm-sidebar__brand-rule" aria-hidden="true" />
            </div>
            <div className="crm-sidebar__brand-text">
              <p className="crm-sidebar__eyebrow">Honeywell Travel</p>
              <h1 className="crm-sidebar__title">CRM Workspace</h1>
              {welcomeName ? (
                <p className="crm-sidebar__welcome">
                  <span className="crm-sidebar__welcome-label">Welcome back</span>
                  <span className="crm-sidebar__welcome-name">{welcomeName}</span>
                </p>
              ) : null}
            </div>
          </div>

          <p className="crm-sidebar__section">Menu</p>
          <nav className="crm-sidebar__nav" aria-label="Admin navigation">
            {navItems.map(({ to, label, Icon, badge, icon, highlight }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `crm-nav-link crm-nav-link--${icon}${highlight ? ' crm-nav-link--featured' : ''}${isActive ? ' crm-nav-link--active' : ''}`
                }
              >
                <span className="crm-nav-link__icon-wrap">
                  <Icon size={18} strokeWidth={2.2} aria-hidden />
                </span>
                <span className="crm-nav-link__label">{label}</span>
                {badge > 0 ? <em className="crm-nav-badge">{badge > 99 ? '99+' : badge}</em> : null}
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
            <header className="crm-header">
              <div className="crm-header__main">
                <h1>{title}</h1>
                {subtitle ? <p className="crm-muted crm-header__subtitle">{subtitle}</p> : null}
              </div>
              {actions ? <div className="crm-header-actions">{actions}</div> : null}
            </header>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
