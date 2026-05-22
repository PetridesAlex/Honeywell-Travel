import { useEffect, useMemo, useState } from 'react'
import { EMPTY_TEAM_TASK, TEAM_TASK_QUICK_TEMPLATES } from '../constants'
import {
  TEAM_TASK_PRIORITY_OPTIONS,
  TEAM_TASK_STATUS_OPTIONS,
  TEAM_TASK_TYPE_OPTIONS
} from '../utils/team'

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
      return
    }
    setForm({
      ...EMPTY_TEAM_TASK,
      client_id: defaultClientId ? String(defaultClientId) : '',
      lead_id: defaultLeadId ? String(defaultLeadId) : '',
      task_type: defaultTaskType || 'general',
      assigned_to: defaultAssignedTo || ''
    })
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

  if (!open) return null

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))
  const isEdit = Boolean(initialTask?.id)
  const isClientDeadline = Boolean(defaultClientId || form.client_id)

  const applyTemplate = (template) => {
    setForm((prev) => ({
      ...prev,
      task_type: template.task_type,
      title: template.title,
      priority: template.priority || prev.priority
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
            <div className="crm-deadline-templates">
              <span className="crm-deadline-templates__label">Quick add</span>
              <div className="crm-deadline-templates__chips">
                {TEAM_TASK_QUICK_TEMPLATES.map((t) => (
                  <button
                    key={t.title}
                    type="button"
                    className="crm-chip crm-chip--template"
                    onClick={() => applyTemplate(t)}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
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
