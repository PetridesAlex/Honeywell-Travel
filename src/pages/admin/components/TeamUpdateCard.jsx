import { Bell, Megaphone, Newspaper, Pencil, Pin, ScrollText, Trash2 } from 'lucide-react'
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
              <Icon size={13} aria-hidden />
              {label}
            </span>
            {update.pinned ? (
              <span className="crm-announce__pin">
                <Pin size={12} aria-hidden />
                Featured
              </span>
            ) : null}
          </div>
          <div className="crm-announce__toolbar">
            <button
              type="button"
              className="crm-announce__tool"
              onClick={() => onEdit(update)}
              title="Edit announcement"
            >
              <Pencil size={15} aria-hidden />
              <span>Edit</span>
            </button>
            <button
              type="button"
              className="crm-announce__tool crm-announce__tool--danger"
              onClick={() => onDelete(update)}
              title="Delete announcement"
            >
              <Trash2 size={15} aria-hidden />
              <span>Delete</span>
            </button>
          </div>
        </header>

        <h3 className="crm-announce__title">{update.title}</h3>

        <div className="crm-announce__body">
          <p>{update.body}</p>
        </div>

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
