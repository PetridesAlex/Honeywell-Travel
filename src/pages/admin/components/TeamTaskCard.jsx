import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, ChevronDown, MessageSquare, Pencil, Trash2, User } from 'lucide-react'
import {
  addTaskComment,
  deleteTaskComment,
  fetchLatestTaskComment,
  fetchTaskCommentCount,
  fetchTaskComments
} from '../api/teamApi'
import {
  authorInitials,
  clientDisplayName,
  dueDateClass,
  dueDateLabel,
  dueDateStatus,
  formatTeamDate,
  formatTeamDateTime,
  getTaskPriorityLabel,
  getTaskStatusLabel,
  getTaskTypeLabel,
  taskPriorityClass,
  taskStatusClass,
  taskTypeClass
} from '../utils/team'

function truncateText(text, max = 100) {
  const t = String(text || '').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max).trim()}…`
}

function TeamTaskCard({
  task,
  currentAgent,
  onEdit,
  onDelete,
  onStatusChange,
  compact = false,
  defaultOpen = false
}) {
  const [open, setOpen] = useState(compact || defaultOpen)
  const [comments, setComments] = useState([])
  const [messageCount, setMessageCount] = useState(0)
  const [latestPreview, setLatestPreview] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [posting, setPosting] = useState(false)

  const loadComments = async () => {
    setLoadingComments(true)
    const { data } = await fetchTaskComments(task.id)
    const list = data || []
    setComments(list)
    setMessageCount(list.length)
    if (list.length > 0) setLatestPreview(list[list.length - 1])
    setLoadingComments(false)
  }

  const refreshMessageMeta = async () => {
    const [countRes, latestRes] = await Promise.all([
      fetchTaskCommentCount(task.id),
      fetchLatestTaskComment(task.id)
    ])
    if (!countRes.error) setMessageCount(countRes.count)
    if (!latestRes.error) setLatestPreview(latestRes.data)
  }

  useEffect(() => {
    if (compact) return
    refreshMessageMeta()
  }, [task.id, compact])

  useEffect(() => {
    if (open && !compact) loadComments()
  }, [open, task.id, compact])

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setPosting(true)
    const { data, error } = await addTaskComment(task.id, commentText)
    setPosting(false)
    if (!error && data) {
      setComments((prev) => [...prev, data])
      setMessageCount((n) => n + 1)
      setLatestPreview(data)
      setCommentText('')
    }
  }

  const handleToggleOpen = () => setOpen((v) => !v)

  const hasMessages = messageCount > 0
  const isMine = task.assigned_to && currentAgent && task.assigned_to === currentAgent
  const dueStatus = dueDateStatus(task.due_date)
  const dueLabel = dueDateLabel(dueStatus)
  const customerName = clientDisplayName(task.client)
  const typeKey = (task.task_type || 'general').replace(/\s+/g, '_')
  const coverAvatarName = task.assigned_to || task.created_by_name
  const coverSnippet =
    truncateText(latestPreview?.body, 72) ||
    truncateText(task.description, 72) ||
    'Tap to open chat'

  if (compact) {
    return (
      <article
        className={`crm-team-task crm-team-task--${typeKey}${isMine ? ' crm-team-task--mine' : ''} crm-team-task--compact crm-team-task--open`}
      >
        <div className="crm-team-task__accent" aria-hidden="true" />
        <div className="crm-team-task__panel crm-team-task__panel--compact">
          <h3 className="crm-team-task__title">{task.title}</h3>
          {task.description ? <p className="crm-team-task__desc">{task.description}</p> : null}
        </div>
      </article>
    )
  }

  return (
    <article
      className={`crm-team-task crm-team-task--${typeKey}${isMine ? ' crm-team-task--mine' : ''}${dueStatus === 'overdue' ? ' crm-team-task--overdue' : ''}${open ? ' crm-team-task--open' : ' crm-team-task--closed'}`}
    >
      <div className="crm-team-task__accent" aria-hidden="true" />

      <div className="crm-team-task__main">
        <button
          type="button"
          className="crm-team-task__cover"
          onClick={handleToggleOpen}
          aria-expanded={open}
        >
          <span className="crm-team-task__cover-avatar" aria-hidden="true">
            {authorInitials(coverAvatarName)}
          </span>

          <span className="crm-team-task__cover-main">
            <span className="crm-team-task__cover-top">
              <span className={taskTypeClass(task.task_type)}>{getTaskTypeLabel(task.task_type)}</span>
              {dueStatus && dueLabel && task.due_date ? (
                <span className={`crm-team-task__due crm-team-task__due--cover ${dueDateClass(dueStatus)}`}>
                  <CalendarClock size={12} aria-hidden />
                  {dueLabel}
                </span>
              ) : null}
            </span>
            <span className="crm-team-task__cover-title">{task.title}</span>
            <span className="crm-team-task__cover-snippet">{coverSnippet}</span>
            <span className="crm-team-task__cover-meta">
              <span className={taskStatusClass(task.status)}>{getTaskStatusLabel(task.status)}</span>
              {customerName ? <span className="crm-team-task__cover-customer">{customerName}</span> : null}
            </span>
          </span>

          <span className="crm-team-task__cover-aside">
            {hasMessages ? (
              <span className="crm-team-task__cover-messages">
                <MessageSquare size={14} aria-hidden />
                {messageCount}
              </span>
            ) : null}
            <ChevronDown
              size={20}
              className={`crm-team-task__cover-chevron${open ? ' crm-team-task__cover-chevron--open' : ''}`}
              aria-hidden
            />
          </span>
        </button>

        {open ? (
          <div className="crm-team-task__panel crm-team-task__panel--messenger">
            <div className="crm-team-task__messenger-header">
              <label className="crm-team-task__status-label">
                <span className="crm-team-task__status-label-text">Status</span>
                <span className="crm-team-task__status-wrap">
                  <select
                    className={`crm-team-task__status-select crm-team-task__status-select--${task.status}`}
                    value={task.status}
                    onChange={(e) => onStatusChange(task, e.target.value)}
                    aria-label="Change task status"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <ChevronDown size={14} className="crm-team-task__status-chevron" aria-hidden />
                </span>
              </label>
              <div className="crm-team-task__toolbar-actions">
                <button
                  type="button"
                  className="crm-team-task__action crm-team-task__action--edit"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(task)
                  }}
                  aria-label="Edit task"
                >
                  <Pencil size={15} aria-hidden />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="crm-team-task__action crm-team-task__action--delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(task)
                  }}
                  aria-label="Delete task"
                >
                  <Trash2 size={15} aria-hidden />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            <div className="crm-team-task__meta-bar">
              {customerName && task.client_id ? (
                <Link
                  to={`/admin/clients/${task.client_id}`}
                  className="crm-team-meta-chip crm-team-meta-chip--link"
                >
                  {customerName}
                </Link>
              ) : null}
              <span className="crm-team-meta-chip">
                <User size={13} aria-hidden />
                {task.assigned_to || 'Anyone'}
              </span>
              <span className={`crm-team-meta-chip ${taskPriorityClass(task.priority)}`}>
                {getTaskPriorityLabel(task.priority)}
              </span>
              {task.due_date ? (
                <span className={`crm-team-meta-chip ${dueDateClass(dueStatus)}`}>
                  <CalendarClock size={13} aria-hidden />
                  {formatTeamDate(task.due_date)}
                </span>
              ) : (
                <span className="crm-team-meta-chip crm-team-meta-chip--muted">No deadline</span>
              )}
            </div>

            <div className="crm-team-task__messenger-body">
              {task.description ? (
                <div className="crm-team-msg crm-team-msg--pinned">
                  <span className="crm-team-msg__pin-icon" aria-hidden="true">
                    <MessageSquare size={14} />
                  </span>
                  <div className="crm-team-msg__bubble crm-team-msg__bubble--pinned">
                    <span className="crm-team-msg__sender">Task notes</span>
                    <p className="crm-team-msg__text">{task.description}</p>
                  </div>
                </div>
              ) : null}

              {loadingComments ? (
                <p className="crm-team-task__comments-hint">Loading messages…</p>
              ) : null}

              {!loadingComments && comments.length === 0 && !task.description ? (
                <p className="crm-team-task__comments-hint crm-team-task__comments-hint--empty">
                  No messages yet. Say hello to the team.
                </p>
              ) : null}

              <ul className="crm-team-comment-list crm-team-comment-list--messenger">
                {comments.map((c) => {
                  const isOwn = Boolean(currentAgent && c.created_by_name === currentAgent)
                  return (
                    <li
                      key={c.id}
                      className={`crm-team-comment crm-team-comment--messenger${isOwn ? ' crm-team-comment--mine' : ' crm-team-comment--theirs'}`}
                    >
                      {!isOwn ? (
                        <span className="crm-team-comment__avatar" aria-hidden="true">
                          {authorInitials(c.created_by_name)}
                        </span>
                      ) : null}
                      <div className="crm-team-comment__bubble">
                        <div className="crm-team-comment__head">
                          <strong>{c.created_by_name}</strong>
                          <time>{formatTeamDateTime(c.created_at)}</time>
                          {isOwn ? (
                            <button
                              type="button"
                              className="crm-team-comment__remove"
                              onClick={async () => {
                                await deleteTaskComment(c.id)
                                setComments((prev) => {
                                  const next = prev.filter((x) => x.id !== c.id)
                                  setMessageCount(next.length)
                                  setLatestPreview(next.length ? next[next.length - 1] : null)
                                  return next
                                })
                              }}
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                        <p className="crm-team-comment__body">{c.body}</p>
                      </div>
                      {isOwn ? (
                        <span className="crm-team-comment__avatar crm-team-comment__avatar--mine" aria-hidden="true">
                          {authorInitials(c.created_by_name)}
                        </span>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            </div>

            <form className="crm-team-messenger-compose" onSubmit={handleAddComment}>
              <div className="crm-team-messenger-compose__wrap">
                <textarea
                  rows={1}
                  placeholder="Write a message…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      if (commentText.trim() && !posting) handleAddComment(e)
                    }
                  }}
                  aria-label="Message the team"
                />
                <button
                  disabled={posting || !commentText.trim()}
                  type="submit"
                  className="crm-team-messenger-compose__send"
                >
                  {posting ? '…' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export default TeamTaskCard
