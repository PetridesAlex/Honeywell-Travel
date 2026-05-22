import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, ChevronDown, MessageSquare, User } from 'lucide-react'
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

function messageCountLabel(count) {
  if (!count) return 'No messages'
  if (count === 1) return '1 message'
  return `${count} messages`
}

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
  const [threadOpen, setThreadOpen] = useState(false)
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
    if (open && threadOpen && !compact) loadComments()
  }, [open, threadOpen, task.id, compact])

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

  const handleToggleOpen = () => {
    setOpen((v) => {
      const next = !v
      if (next && hasMessages) setThreadOpen(true)
      return next
    })
  }

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
    'Tap to view details and team discussion'

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
        <div className="crm-team-task__panel">
          <div className="crm-team-task__panel-toolbar">
            <label className="crm-team-task__status-label">
              <span>Status</span>
              <select
                className="crm-team-task__status-select"
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
            </label>
            <button
              type="button"
              className="crm-link-btn"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(task)
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="crm-btn crm-btn-danger crm-btn--small"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(task)
              }}
            >
              Delete
            </button>
          </div>

          {task.description ? (
            <div className="crm-team-task__notes">
              <p className="crm-team-task__notes-label">Notes</p>
              <p className="crm-team-task__desc">{task.description}</p>
            </div>
          ) : null}

          <ul className="crm-team-task__facts">
            {customerName && task.client_id ? (
              <li>
                <span className="crm-team-task__fact-label">Customer</span>
                <Link
                  to={`/admin/clients/${task.client_id}`}
                  className="crm-team-task__fact-value crm-team-task__client-link"
                >
                  {customerName}
                </Link>
              </li>
            ) : null}
            <li>
              <span className="crm-team-task__fact-label">Assigned to</span>
              <span className="crm-team-task__fact-value">
                {task.assigned_to ? (
                  <>
                    <User size={14} aria-hidden />
                    {task.assigned_to}
                  </>
                ) : (
                  'Anyone on the team'
                )}
              </span>
            </li>
            <li>
              <span className="crm-team-task__fact-label">Priority</span>
              <span className="crm-team-task__fact-value">
                {getTaskPriorityLabel(task.priority)}
              </span>
            </li>
            <li>
              <span className="crm-team-task__fact-label">Deadline</span>
              <span className="crm-team-task__fact-value">
                {task.due_date ? formatTeamDate(task.due_date) : 'Not set'}
              </span>
            </li>
          </ul>

          <div className="crm-team-task__thread">
            <button
              type="button"
              className={`crm-team-task__thread-toggle${threadOpen ? ' crm-team-task__thread-toggle--open' : ''}${hasMessages ? ' crm-team-task__thread-toggle--active' : ''}`}
              onClick={() => setThreadOpen((v) => !v)}
              aria-expanded={threadOpen}
            >
              <MessageSquare size={18} aria-hidden />
              <span>Team discussion</span>
              <em>{messageCountLabel(messageCount)}</em>
              <ChevronDown
                size={18}
                className={`crm-team-task__cover-chevron${threadOpen ? ' crm-team-task__cover-chevron--open' : ''}`}
                aria-hidden
              />
            </button>

            {threadOpen ? (
              <div className="crm-team-task__thread-panel">
                {loadingComments ? (
                  <p className="crm-team-task__comments-hint">Loading messages…</p>
                ) : null}
                {!loadingComments && comments.length === 0 ? (
                  <p className="crm-team-task__comments-hint">
                    Start the conversation — check-in updates, payment reminders, or handover notes.
                  </p>
                ) : null}
                <ul className="crm-team-comment-list">
                  {comments.map((c) => (
                    <li key={c.id} className="crm-team-comment">
                      <span className="crm-team-comment__avatar" aria-hidden="true">
                        {authorInitials(c.created_by_name)}
                      </span>
                      <div className="crm-team-comment__bubble">
                        <div className="crm-team-comment__head">
                          <strong>{c.created_by_name}</strong>
                          <time>{formatTeamDateTime(c.created_at)}</time>
                          <button
                            type="button"
                            className="crm-link-btn crm-link-btn--danger"
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
                        </div>
                        <p className="crm-team-comment__body">{c.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <form className="crm-team-comment-form" onSubmit={handleAddComment}>
                  <label className="crm-team-comment-form__label">
                    <span>Message the team</span>
                    <textarea
                      rows={2}
                      placeholder="Write an update…"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                  </label>
                  <button disabled={posting} type="submit" className="crm-btn crm-btn-primary crm-btn--small">
                    {posting ? 'Sending…' : 'Send'}
                  </button>
                </form>
              </div>
            ) : null}

            {!threadOpen && hasMessages && latestPreview ? (
              <button
                type="button"
                className="crm-team-task__comments-preview"
                onClick={() => setThreadOpen(true)}
              >
                <span className="crm-team-task__comments-avatar" aria-hidden="true">
                  {authorInitials(latestPreview.created_by_name)}
                </span>
                <span className="crm-team-task__comments-preview-quote">
                  <strong>{latestPreview.created_by_name}</strong>
                  {truncateText(latestPreview.body, 120)}
                </span>
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      </div>
    </article>
  )
}

export default TeamTaskCard
