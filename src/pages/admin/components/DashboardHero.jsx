import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  CalendarClock,
  Euro,
  Gift,
  Target,
  TrendingUp,
  Users,
  Wallet
} from 'lucide-react'

function HeroKpi({ to, label, value, sub, icon: Icon, tone = 'navy', alert }) {
  const Tag = to ? Link : 'div'
  return (
    <Tag
      to={to}
      className={`crm-dash-kpi crm-dash-kpi--${tone}${alert ? ' crm-dash-kpi--alert' : ''}${to ? ' crm-dash-kpi--link' : ''}`}
    >
      <span className="crm-dash-kpi__glow" aria-hidden="true" />
      <span className="crm-dash-kpi__icon" aria-hidden="true">
        <Icon size={20} strokeWidth={2.25} />
      </span>
      <span className="crm-dash-kpi__copy">
        <span className="crm-dash-kpi__label">{label}</span>
        <strong className="crm-dash-kpi__value">{value}</strong>
        {sub ? <span className="crm-dash-kpi__sub">{sub}</span> : null}
      </span>
      {to ? (
        <span className="crm-dash-kpi__arrow" aria-hidden="true">
          <ArrowUpRight size={16} />
        </span>
      ) : null}
    </Tag>
  )
}

function DashboardHero({ stats, followUpCounts, passportCounts, overdueDeadlines, clientCount }) {
  const openPipeline = stats.quoted + stats.confirmed + stats.newCount + stats.contacted
  const followUpsTotal = followUpCounts.today + followUpCounts.overdue

  return (
    <div className="crm-dash-hero">
      <div className="crm-dash-hero__intro">
        <p className="crm-dash-hero__eyebrow">Live business pulse</p>
        <h2 className="crm-dash-hero__title">Everything that matters, right now</h2>
      </div>

      <div className="crm-dash-hero__grid">
        <HeroKpi
          to="/admin/leads"
          tone="navy"
          icon={Users}
          label="Total leads"
          value={stats.total}
          sub={`+${stats.leadsToday} today · ${stats.leadsThisWeek} this week`}
        />
        <HeroKpi
          to="/admin/pipeline"
          tone="crimson"
          icon={Target}
          label="Open pipeline"
          value={openPipeline}
          sub={`${stats.quoted} quoted · ${stats.confirmed} confirmed`}
        />
        <HeroKpi
          to="/admin/reports"
          tone="emerald"
          icon={Wallet}
          label="Confirmed revenue"
          value={`€${Math.round(stats.confirmedRevenue || 0).toLocaleString()}`}
          sub={`€${Math.round(stats.totalPipelineValue || 0).toLocaleString()} in pipeline`}
        />
        <HeroKpi
          to="/admin/follow-ups"
          tone="amber"
          icon={CalendarClock}
          label="Follow-ups due"
          value={followUpsTotal}
          sub={`${followUpCounts.overdue} overdue · ${followUpCounts.today} today`}
          alert={followUpCounts.overdue > 0}
        />
        <HeroKpi
          to="/admin/clients"
          tone="violet"
          icon={Users}
          label="CRM clients"
          value={clientCount ?? '—'}
          sub={`${passportCounts.expiring} passports expiring`}
        />
        <HeroKpi
          to="/admin/gift-vouchers"
          tone="gold"
          icon={Gift}
          label="Gift vouchers"
          value={stats.conversionRate ? `${stats.conversionRate}%` : '0%'}
          sub="Conversion rate · open module"
        />
      </div>

      <div className="crm-dash-hero__alerts">
        <Link
          to="/admin/clients?filter=expired"
          className={`crm-dash-alert${passportCounts.expired > 0 ? ' crm-dash-alert--danger' : ''}`}
        >
          <Euro size={15} aria-hidden />
          <span>
            <strong>{passportCounts.expired}</strong> expired passports
          </span>
        </Link>
        <Link
          to="/admin/team"
          className={`crm-dash-alert${overdueDeadlines > 0 ? ' crm-dash-alert--danger' : ''}`}
        >
          <TrendingUp size={15} aria-hidden />
          <span>
            <strong>{overdueDeadlines}</strong> overdue team deadlines
          </span>
        </Link>
        <Link to="/admin/pipeline" className="crm-dash-alert crm-dash-alert--info">
          <Target size={15} aria-hidden />
          <span>
            Quote-to-book <strong>{stats.quoteToBookRate || '0'}%</strong>
          </span>
        </Link>
      </div>
    </div>
  )
}

export default DashboardHero
