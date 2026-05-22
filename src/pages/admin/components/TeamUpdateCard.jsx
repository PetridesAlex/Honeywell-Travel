import { Bell, ExternalLink, Megaphone, Newspaper, Pencil, Pin, ScrollText, Trash2 } from 'lucide-react'
import {
  authorInitials,
  formatTeamDateTime,
  getUpdateCategoryLabel,
  updateCategoryClass
} from '../utils/team'

const CATEGORY_ICONS = {
  news: Newspaper,
  update: Megaphone,
  reminder: Bell,
  policy: ScrollText
}

function TeamUpdateCard({ update, onEdit, onDelete }) {
  const Icon = CATEGORY_ICONS[update.category] || Megaphone
  const label = getUpdateCategoryLabel(update.category)

  return (
    <article
      className={`crm-announce${update.pinned ? ' crm-announce--pinned' : ''} crm-announce--${update.category || 'update'}`}
    >
      <div className="crm-announce__accent" aria-hidden="true" />
      <div className="crm-announce__inner">
        <header className="crm-announce__header">
          <div className="crm-announce__labels">
            <span className={updateCategoryClass(update.category)}>
              <Icon size={14} strokeWidth={2.25} aria-hidden />
              {label}
            </span>
            {update.pinned ? (
              <span className="crm-announce__pin">
                <Pin size={12} strokeWidth={2.5} aria-hidden />
                Featured
              </span>
            ) : null}
          </div>
          <div className="crm-announce__toolbar">
            <button
              type="button"
              className="crm-announce__tool"
              onClick={() => onEdit(update)}
              aria-label="Edit announcement"
            >
              <Pencil size={16} aria-hidden />
            </button>
            <button
              type="button"
              className="crm-announce__tool crm-announce__tool--danger"
              onClick={() => onDelete(update)}
              aria-label="Delete announcement"
            >
              <Trash2 size={16} aria-hidden />
            </button>
          </div>
        </header>

        <h3 className="crm-announce__title">{update.title}</h3>

        {update.image_url ? (
          <div className="crm-announce__media">
            <img src={update.image_url} alt="" loading="lazy" />
          </div>
        ) : null}

        {update.link_url ? (
          <a
            href={update.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="crm-announce__link"
          >
            <ExternalLink size={14} aria-hidden />
            View link
          </a>
        ) : null}

        {update.body ? (
          <div className="crm-announce__body">
            <p>{update.body}</p>
          </div>
        ) : null}

        <footer className="crm-announce__footer">
          <span className="crm-announce__avatar" aria-hidden="true">
            {authorInitials(update.created_by_name)}
          </span>
          <div className="crm-announce__author">
            <span className="crm-announce__author-name">{update.created_by_name}</span>
            <time dateTime={update.created_at}>{formatTeamDateTime(update.created_at)}</time>
          </div>
        </footer>
      </div>
    </article>
  )
}

export default TeamUpdateCard
