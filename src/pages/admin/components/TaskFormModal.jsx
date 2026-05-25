import { useEffect, useMemo, useState } from 'react'
import {
  CalendarCheck,
  Check,
  CreditCard,
  FileText,
  IdCard,
  Plane,
  Sparkles,
  X
} from 'lucide-react'
import { EMPTY_TEAM_TASK, TEAM_TASK_QUICK_TEMPLATES } from '../constants'
import {
  getTaskPriorityLabel,
  getTaskTypeLabel,
  taskTypeClass,
  TEAM_TASK_PRIORITY_OPTIONS,
  TEAM_TASK_STATUS_OPTIONS,
  TEAM_TASK_TYPE_OPTIONS
} from '../utils/team'

const TEMPLATE_ICONS = {
  checkin_finalize: CalendarCheck,
  checkin_departure: Plane,
  payment_balance: CreditCard,
  documents_send: FileText,
  passport_verify: IdCard
}

function formatSuggestedDate(daysOffset) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + daysOffset)
  return d.toISOString().slice(0, 10)
}

function formatPreviewDate(value) {
  if (!value) return 'Pick a date below'
  try {
    return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  } catch {
    return value
  }
}

function TaskFormModal({
  open,
  initialTask,
  agents = [],
  clients = [],
  leads = [],
  defaultClientId = '',
  defaultLeadId = '',
  defaultTaskType = '',
  defaultAssignedTo = '',
  onClose,
  onSave,
  saving,
  saveError
}) {
  const [form, setForm] = useState(EMPTY_TEAM_TASK)
  const [selectedTemplateId, setSelectedTemplateId] = useState('')

  useEffect(() => {
    if (initialTask) {
      setForm({
        ...EMPTY_TEAM_TASK,
        ...initialTask,
        task_type: initialTask.task_type || 'general',
        due_date: initialTask.due_date ? initialTask.due_date.slice(0, 10) : '',
        client_id: initialTask.client_id ?? '',
        lead_id: initialTask.lead_id ?? '',
        assigned_to: initialTask.assigned_to || ''
      })
      setSelectedTemplateId('')
      return
    }
    setForm({
      ...EMPTY_TEAM_TASK,
      client_id: defaultClientId ? String(defaultClientId) : '',
      lead_id: defaultLeadId ? String(defaultLeadId) : '',
      task_type: defaultTaskType || 'general',
      assigned_to: defaultAssignedTo || ''
    })
    setSelectedTemplateId('')
  }, [initialTask, open, defaultClientId, defaultLeadId, defaultTaskType, defaultAssignedTo])

  const clientOptions = useMemo(() => {
    return [...clients]
      .sort((a, b) => {
        const an = `${a.first_name || ''} ${a.last_name || ''}`.trim()
        const bn = `${b.first_name || ''} ${b.last_name || ''}`.trim()
        return an.localeCompare(bn)
      })
      .map((c) => ({
        id: c.id,
        label: [c.first_name, c.last_name].filter(Boolean).join(' ').trim() || c.email || `Client #${c.id}`
      }))
  }, [clients])

  const leadOptions = useMemo(() => {
    const cid = form.client_id ? Number(form.client_id) : null
    const pool = cid ? leads.filter((l) => l.client_id === cid || !l.client_id) : leads
    return pool.slice(0, 50).map((l) => ({
      id: l.id,
      label: l.destination || l.email || `Lead #${l.id}`
    }))
  }, [leads, form.client_id])

  const selectedTemplate = useMemo(
    () => TEAM_TASK_QUICK_TEMPLATES.find((t) => t.id === selectedTemplateId) || null,
    [selectedTemplateId]
  )

  if (!open) return null

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key === 'title' || key === 'task_type') {
      setSelectedTemplateId('')
    }
  }

  const isEdit = Boolean(initialTask?.id)
  const isClientDeadline = Boolean(defaultClientId || form.client_id)

  const applyTemplate = (template) => {
    const isActive = selectedTemplateId === template.id
    if (isActive) {
      setSelectedTemplateId('')
      setForm((prev) => ({
        ...EMPTY_TEAM_TASK,
        client_id: prev.client_id,
        lead_id: prev.lead_id,
        assigned_to: prev.assigned_to,
        status: prev.status
      }))
      return
    }

    setSelectedTemplateId(template.id)
    setForm((prev) => ({
      ...prev,
      task_type: template.task_type,
      title: template.title,
      priority: template.priority || prev.priority,
      description: template.descriptionHint || '',
      due_date:
        template.daysOffset != null ? formatSuggestedDate(template.daysOffset) : prev.due_date
    }))
  }

  const clearTemplate = () => {
    setSelectedTemplateId('')
    setForm((prev) => ({
      ...EMPTY_TEAM_TASK,
      client_id: prev.client_id,
      lead_id: prev.lead_id,
      assigned_to: prev.assigned_to,
      status: prev.status
    }))
  }

  return (
    <div className="crm-modal-backdrop crm-modal-backdrop--premium" onClick={onClose} role="presentation">
      <div className="crm-modal crm-modal--lead crm-modal--team" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="crm-modal__hero crm-modal__hero--team">
          <div className="crm-modal__hero-text">
            <p className="crm-modal__eyebrow">{isClientDeadline ? 'Client deadline' : 'Agent task'}</p>
            <h3>{isEdit ? 'Edit deadline' : 'Set deadline / task'}</h3>
            <p className="crm-modal__subtitle">
              Track check-in dates, payments, and reminders — visible to all agents on Team hub.
            </p>
          </div>
          <button type="button" className="crm-modal__close" onClick={onClose} aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <form
          id="task-modal-form"
          onSubmit={(e) => {
            e.preventDefault()
            onSave(form)
          }}
          className="crm-modal__body"
        >
          {!isEdit ? (
            <section className="crm-deadline-picker" aria-label="Quick start templates">
              <div className="crm-deadline-picker__head">
                <div className="crm-deadline-picker__intro">
                  <span className="crm-deadline-picker__intro-icon" aria-hidden="true">
                    <Sparkles size={18} strokeWidth={2.2} />
                  </span>
                  <div>
                    <h4 className="crm-deadline-picker__title">Quick start templates</h4>
                    <p className="crm-deadline-picker__hint">
                      Tap a card to auto-fill type, title, notes, and a suggested deadline — then tweak anything below.
                    </p>
                  </div>
                </div>
                {selectedTemplateId ? (
                  <button type="button" className="crm-deadline-picker__clear" onClick={clearTemplate}>
                    <X size={14} aria-hidden />
                    Clear
                  </button>
                ) : null}
              </div>

              <div className="crm-deadline-picker__grid">
                {TEAM_TASK_QUICK_TEMPLATES.map((template) => {
                  const Icon = TEMPLATE_ICONS[template.id] || CalendarCheck
                  const isActive = selectedTemplateId === template.id
                  return (
                    <button
                      key={template.id}
                      type="button"
                      className={`crm-deadline-picker__card crm-deadline-picker__card--${template.task_type}${isActive ? ' crm-deadline-picker__card--active' : ''}`}
                      onClick={() => applyTemplate(template)}
                      aria-pressed={isActive}
                    >
                      <span className="crm-deadline-picker__icon-wrap" aria-hidden="true">
                        <Icon size={18} strokeWidth={2.1} />
                      </span>
                      <span className={`crm-deadline-picker__type ${taskTypeClass(template.task_type)}`}>
                        {getTaskTypeLabel(template.task_type)}
                      </span>
                      <strong className="crm-deadline-picker__card-title">{template.title}</strong>
                      <span className="crm-deadline-picker__card-sub">{template.subtitle}</span>
                      <span className="crm-deadline-picker__card-meta">
                        {template.daysOffset === 0
                          ? 'Due today'
                          : template.daysOffset === 1
                            ? 'Due tomorrow'
                            : `Suggested in ${template.daysOffset} days`}
                        · {getTaskPriorityLabel(template.priority)}
                      </span>
                      {isActive ? (
                        <span className="crm-deadline-picker__check" aria-hidden="true">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>

              {selectedTemplate ? (
                <div className="crm-deadline-picker__preview" role="status">
                  <span className="crm-deadline-picker__preview-label">Ready to save</span>
                  <p className="crm-deadline-picker__preview-copy">
                    <strong>{form.title}</strong>
                    <span>
                      {getTaskTypeLabel(form.task_type)} · {formatPreviewDate(form.due_date)} ·{' '}
                      {getTaskPriorityLabel(form.priority)} priority
                    </span>
                  </p>
                </div>
              ) : (
                <p className="crm-deadline-picker__empty">Or skip templates and fill in the form manually below.</p>
              )}
            </section>
          ) : null}

          <div className="crm-form-grid crm-form-grid--modal">
            <label className="crm-field">
              <span className="crm-field__label">Type *</span>
              <select value={form.task_type} onChange={(e) => handleChange('task_type', e.target.value)}>
                {TEAM_TASK_TYPE_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </label>
            <label className="crm-field">
              <span className="crm-field__label">Deadline *</span>
              <input
                type="date"
                required
                value={form.due_date || ''}
                onChange={(e) => handleChange('due_date', e.target.value)}
              />
            </label>
            <label className="crm-field crm-form-full">
              <span className="crm-field__label">Title *</span>
              <input required value={form.title} onChange={(e) => handleChange('title', e.target.value)} />
            </label>
            <label className="crm-field crm-form-full">
              <span className="crm-field__label">Notes (steps, flight, hotel, amounts…)</span>
              <textarea
                rows={3}
                value={form.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="e.g. Finalize check-in with airline before 18:00, room 204…"
              />
            </label>
            <label className="crm-field">
              <span className="crm-field__label">Customer</span>
              <select
                value={form.client_id || ''}
                onChange={(e) => handleChange('client_id', e.target.value)}
                disabled={Boolean(defaultClientId) && !isEdit}
              >
                <option value="">No customer linked</option>
                {clientOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </label>
            <label className="crm-field">
              <span className="crm-field__label">Related enquiry</span>
              <select value={form.lead_id || ''} onChange={(e) => handleChange('lead_id', e.target.value)}>
                <option value="">None</option>
                {leadOptions.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
            </label>
            <label className="crm-field">
              <span className="crm-field__label">Assign to</span>
              <select value={form.assigned_to || ''} onChange={(e) => handleChange('assigned_to', e.target.value)}>
                <option value="">Anyone / unassigned</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </label>
            <label className="crm-field">
              <span className="crm-field__label">Status</span>
              <select value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
                {TEAM_TASK_STATUS_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </label>
            <label className="crm-field">
              <span className="crm-field__label">Priority</span>
              <select value={form.priority} onChange={(e) => handleChange('priority', e.target.value)}>
                {TEAM_TASK_PRIORITY_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </label>
          </div>
          {saveError ? <p className="crm-form-error">{saveError}</p> : null}
        </form>
        <footer className="crm-modal__footer">
          <button type="button" className="crm-btn crm-btn--modal-ghost" onClick={onClose}>Cancel</button>
          <button disabled={saving} type="submit" form="task-modal-form" className="crm-btn crm-btn--modal-primary crm-btn--team-save">
            {saving ? 'Saving…' : isEdit ? 'Save deadline' : 'Add deadline'}
          </button>
        </footer>
      </div>
    </div>
  )
}


export default TaskFormModal
