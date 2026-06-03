import { Link } from 'react-router-dom'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Sparkles,
  MessageCircle,
  FileText,
  BadgeCheck,
  Ban
} from 'lucide-react'
import { STATUS_OPTIONS, leadIdsMatch, normalizeLeadStatus } from '../constants'
import { leadDisplayName, parseLeadName } from '../utils/leadName'

const COLUMN_META = {
  New: {
    slug: 'new',
    icon: Sparkles,
    hint: 'Fresh enquiries waiting for first contact'
  },
  Contacted: {
    slug: 'contacted',
    icon: MessageCircle,
    hint: 'In conversation with the client'
  },
  Quoted: {
    slug: 'quoted',
    icon: FileText,
    hint: 'Proposal or quote shared'
  },
  Confirmed: {
    slug: 'confirmed',
    icon: BadgeCheck,
    hint: 'Booked and confirmed'
  },
  Lost: {
    slug: 'lost',
    icon: Ban,
    hint: 'Closed without booking'
  }
}

function leadInitials(lead) {
  const { first_name, last_name, full_name } = parseLeadName(lead)
  const first = (first_name || full_name || '?').trim().charAt(0)
  const last = (last_name || '').trim().charAt(0)
  return (first + last).toUpperCase() || '?'
}

function formatDealValue(value) {
  if (!value) return null
  return `€${Math.round(Number(value)).toLocaleString()}`
}

function columnValue(items) {
  return items.reduce((sum, lead) => sum + Number(lead.deal_value || 0), 0)
}

const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  show: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: index * 0.045,
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1]
    }
  }),
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.18 } }
}

const columnVariants = {
  hidden: { opacity: 0, y: 18 },
  show: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.06,
      duration: 0.38,
      ease: [0.22, 1, 0.36, 1]
    }
  })
}

function PipelineBoard({ leads, onStatusChange, updatingId = null }) {
  const columns = STATUS_OPTIONS.map((status) => ({
    status,
    meta: COLUMN_META[status] || { slug: status.toLowerCase(), icon: Sparkles, hint: '' },
    items: leads.filter((lead) => normalizeLeadStatus(lead.status) === status)
  }))

  return (
    <LayoutGroup id="crm-pipeline-board">
    <div className="crm-pipeline crm-pipeline--premium">
      {columns.map((column, columnIndex) => {
        const Icon = column.meta.icon
        const totalValue = columnValue(column.items)
        const slug = column.meta.slug

        return (
          <motion.section
            key={column.status}
            className={`crm-pipeline-col crm-pipeline-col--${slug}`}
            custom={columnIndex}
            variants={columnVariants}
            initial="hidden"
            animate="show"
          >
            <header className="crm-pipeline-col__head">
              <div className="crm-pipeline-col__head-main">
                <span className="crm-pipeline-col__ring" aria-hidden="true">
                  <span className="crm-pipeline-col__ring-inner">
                    <Icon size={15} strokeWidth={2.25} />
                  </span>
                </span>
                <div className="crm-pipeline-col__titles">
                  <h3>{column.status}</h3>
                  <p>{column.meta.hint}</p>
                </div>
              </div>
              <div className="crm-pipeline-col__stats">
                <span className="crm-pipeline-col__count">{column.items.length}</span>
                {totalValue > 0 ? (
                  <span className="crm-pipeline-col__value">{formatDealValue(totalValue)}</span>
                ) : null}
              </div>
            </header>

            <div className="crm-pipeline-col__cards">
              <AnimatePresence mode="popLayout">
                {column.items.length === 0 ? (
                  <motion.div
                    key="empty"
                    className="crm-pipeline-empty"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                  >
                    <span className="crm-pipeline-empty__icon" aria-hidden="true">
                      <Icon size={22} strokeWidth={1.75} />
                    </span>
                    <strong>No leads yet</strong>
                    <span>Cards appear here as enquiries move into {column.status.toLowerCase()}.</span>
                  </motion.div>
                ) : (
                  column.items.map((lead, cardIndex) => {
                    const name = leadDisplayName(lead)
                    const deal = formatDealValue(lead.deal_value)
                    const leadStatus = normalizeLeadStatus(lead.status)
                    const isUpdating = leadIdsMatch(updatingId, lead.id)

                    return (
                      <motion.article
                        key={lead.id}
                        layout
                        layoutId={`pipeline-lead-${lead.id}`}
                        custom={cardIndex}
                        variants={cardVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        transition={{ layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
                        whileHover={{ y: -3, transition: { duration: 0.18 } }}
                        className={`crm-pipeline-card crm-pipeline-card--${slug}${lead.priority && lead.priority !== 'Normal' ? ` crm-pipeline-card--${lead.priority.toLowerCase()}` : ''}`}
                      >
                        <div className="crm-pipeline-card__glow" aria-hidden="true" />

                        <div className="crm-pipeline-card__hero">
                          <span className="crm-pipeline-card__avatar-ring">
                            <span className="crm-pipeline-card__avatar">{leadInitials(lead)}</span>
                          </span>
                          <div className="crm-pipeline-card__identity">
                            <strong>{name}</strong>
                            {lead.priority && lead.priority !== 'Normal' ? (
                              <span className={`crm-priority crm-pipeline-card__priority crm-priority--${lead.priority.toLowerCase()}`}>
                                {lead.priority}
                              </span>
                            ) : null}
                          </div>
                          {deal ? <span className="crm-pipeline-card__deal">{deal}</span> : null}
                        </div>

                        <div className="crm-pipeline-card__body">
                          <p className="crm-pipeline-card__destination">
                            <MapPin size={13} aria-hidden />
                            {lead.destination || 'Destination TBC'}
                          </p>
                          {lead.trip_type ? (
                            <span className="crm-pipeline-card__tag">{lead.trip_type}</span>
                          ) : null}
                          {lead.travel_dates ? (
                            <p className="crm-pipeline-card__dates">
                              <CalendarDays size={13} aria-hidden />
                              {lead.travel_dates}
                            </p>
                          ) : null}
                        </div>

                        <div className="crm-pipeline-card__actions">
                          <label className="crm-pipeline-card__status">
                            <span className="sr-only">Move lead</span>
                            <select
                              value={leadStatus}
                              disabled={isUpdating}
                              onChange={(event) => {
                                event.stopPropagation()
                                const nextStatus = event.target.value
                                if (nextStatus !== leadStatus) {
                                  onStatusChange(lead, nextStatus)
                                }
                              }}
                              onClick={(event) => event.stopPropagation()}
                              aria-label={`Update status for ${name}`}
                            >
                              {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </label>
                          <Link to="/admin/leads" className="crm-pipeline-card__open">
                            Open
                            <ArrowUpRight size={14} aria-hidden />
                          </Link>
                        </div>
                      </motion.article>
                    )
                  })
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        )
      })}
    </div>
    </LayoutGroup>
  )
}

export default PipelineBoard
