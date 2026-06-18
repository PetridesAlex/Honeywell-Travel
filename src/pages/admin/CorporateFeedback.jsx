import { useCallback, useEffect, useMemo, useState } from 'react'
import { ClipboardCopy, Link2, MessageSquare, Plus, Star } from 'lucide-react'
import AdminLayout from './components/AdminLayout'
import {
  buildFeedbackPublicUrl,
  computeFeedbackStats,
  createFeedbackCampaign,
  createFeedbackQuestion,
  createFeedbackToken,
  deleteFeedbackQuestion,
  FEEDBACK_CAMPAIGN_STATUSES,
  FEEDBACK_QUESTION_TYPES,
  fetchFeedbackCampaigns,
  fetchFeedbackQuestions,
  fetchFeedbackResponses,
  fetchFeedbackTokens,
  updateFeedbackCampaign,
  updateFeedbackQuestion,
  updateFeedbackToken,
} from './api/feedbackApi'
import { exportFeedbackToCsv } from './utils/exportFeedback'
import './Leads.css'

const TABS = [
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'links', label: 'Links' },
  { id: 'responses', label: 'Responses' },
]

const EMPTY_CAMPAIGN = {
  company_name: '',
  trip_name: '',
  destination: '',
  travel_date_start: '',
  travel_date_end: '',
  status: 'draft',
  notes: '',
}

function statusClass(status) {
  return `crm-corp-status crm-corp-status--${String(status || 'draft').toLowerCase()}`
}

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(value))
  } catch {
    return value
  }
}

function CorporateFeedbackAdmin() {
  const [tab, setTab] = useState('campaigns')
  const [campaigns, setCampaigns] = useState([])
  const [tokens, setTokens] = useState([])
  const [responses, setResponses] = useState([])
  const [questions, setQuestions] = useState([])
  const [selectedCampaignId, setSelectedCampaignId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [campaignModalOpen, setCampaignModalOpen] = useState(false)
  const [campaignForm, setCampaignForm] = useState(EMPTY_CAMPAIGN)
  const [editingCampaignId, setEditingCampaignId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [copyNotice, setCopyNotice] = useState('')
  const [newQuestion, setNewQuestion] = useState({
    label: '',
    question_type: 'textarea',
    is_required: false,
  })
  const [tokenExpiry, setTokenExpiry] = useState('')
  const [detailResponse, setDetailResponse] = useState(null)

  const selectedCampaign = useMemo(
    () => campaigns.find((c) => c.id === selectedCampaignId) || null,
    [campaigns, selectedCampaignId]
  )

  const stats = useMemo(
    () => computeFeedbackStats(responses, tokens.filter((t) => !selectedCampaignId || t.campaign_id === selectedCampaignId)),
    [responses, tokens, selectedCampaignId]
  )

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data: campaignData, error: campaignError } = await fetchFeedbackCampaigns()
    if (campaignError) {
      if (campaignError.message?.includes('feedback_campaigns')) {
        setError('Run supabase/migrations/20260611_corporate_feedback.sql in Supabase SQL editor.')
      } else {
        setError(campaignError.message)
      }
      setCampaigns([])
      setLoading(false)
      return
    }
    setCampaigns(campaignData)
    const campaignId = selectedCampaignId || campaignData[0]?.id || ''
    if (!selectedCampaignId && campaignId) setSelectedCampaignId(campaignId)

    const [{ data: tokenData }, { data: responseData }, { data: questionData }] = await Promise.all([
      fetchFeedbackTokens(campaignId || null),
      fetchFeedbackResponses(campaignId || null),
      campaignId ? fetchFeedbackQuestions(campaignId) : Promise.resolve({ data: [] }),
    ])

    setTokens(tokenData || [])
    setResponses(responseData || [])
    setQuestions(questionData || [])
    setLoading(false)
  }, [selectedCampaignId])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  useEffect(() => {
    if (!selectedCampaignId) return
    const loadCampaignData = async () => {
      const [{ data: tokenData }, { data: responseData }, { data: questionData }] = await Promise.all([
        fetchFeedbackTokens(selectedCampaignId),
        fetchFeedbackResponses(selectedCampaignId),
        fetchFeedbackQuestions(selectedCampaignId),
      ])
      setTokens(tokenData || [])
      setResponses(responseData || [])
      setQuestions(questionData || [])
    }
    loadCampaignData()
  }, [selectedCampaignId])

  const openCreateCampaign = () => {
    setEditingCampaignId(null)
    setCampaignForm(EMPTY_CAMPAIGN)
    setSaveError('')
    setCampaignModalOpen(true)
  }

  const openEditCampaign = (campaign) => {
    setEditingCampaignId(campaign.id)
    setCampaignForm({
      company_name: campaign.company_name || '',
      trip_name: campaign.trip_name || '',
      destination: campaign.destination || '',
      travel_date_start: campaign.travel_date_start || '',
      travel_date_end: campaign.travel_date_end || '',
      status: campaign.status || 'draft',
      notes: campaign.notes || '',
    })
    setSaveError('')
    setCampaignModalOpen(true)
  }

  const handleSaveCampaign = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    const action = editingCampaignId
      ? updateFeedbackCampaign(editingCampaignId, campaignForm)
      : createFeedbackCampaign(campaignForm)
    const { data, error: saveErr } = await action
    setSaving(false)
    if (saveErr) {
      setSaveError(saveErr.message)
      return
    }
    setCampaignModalOpen(false)
    if (data?.id && !selectedCampaignId) setSelectedCampaignId(data.id)
    await loadAll()
  }

  const handleAddQuestion = async () => {
    if (!selectedCampaignId || !newQuestion.label.trim()) return
    setSaving(true)
    const { error: qErr } = await createFeedbackQuestion({
      campaign_id: selectedCampaignId,
      ...newQuestion,
      sort_order: questions.length,
    })
    setSaving(false)
    if (qErr) {
      setSaveError(qErr.message)
      return
    }
    setNewQuestion({ label: '', question_type: 'textarea', is_required: false })
    const { data } = await fetchFeedbackQuestions(selectedCampaignId)
    setQuestions(data || [])
  }

  const handleToggleQuestion = async (question) => {
    await updateFeedbackQuestion(question.id, {
      ...question,
      is_active: !question.is_active,
    })
    const { data } = await fetchFeedbackQuestions(selectedCampaignId)
    setQuestions(data || [])
  }

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return
    await deleteFeedbackQuestion(id)
    const { data } = await fetchFeedbackQuestions(selectedCampaignId)
    setQuestions(data || [])
  }

  const handleGenerateLink = async () => {
    if (!selectedCampaignId) return
    setSaving(true)
    const expiresAt = tokenExpiry ? new Date(tokenExpiry).toISOString() : null
    const { error: tokenErr } = await createFeedbackToken(selectedCampaignId, expiresAt)
    setSaving(false)
    if (tokenErr) {
      setSaveError(tokenErr.message)
      return
    }
    setTokenExpiry('')
    const { data } = await fetchFeedbackTokens(selectedCampaignId)
    setTokens(data || [])
  }

  const handleCopyLink = async (token) => {
    const url = buildFeedbackPublicUrl(token)
    try {
      await navigator.clipboard.writeText(url)
      setCopyNotice('Link copied to clipboard.')
      setTimeout(() => setCopyNotice(''), 2500)
    } catch {
      setCopyNotice(url)
    }
  }

  const handleToggleToken = async (tokenRow) => {
    await updateFeedbackToken(tokenRow.id, { is_active: !tokenRow.is_active, expires_at: tokenRow.expires_at })
    const { data } = await fetchFeedbackTokens(selectedCampaignId)
    setTokens(data || [])
  }

  const responseCountByCampaign = useMemo(() => {
    const map = {}
    responses.forEach((r) => {
      map[r.campaign_id] = (map[r.campaign_id] || 0) + 1
    })
    return map
  }, [responses])

  return (
    <AdminLayout
      title="Corporate Feedback"
      subtitle="Create secure post-trip feedback campaigns, share links with travelers, and review responses."
      actions={
        <button type="button" className="crm-btn crm-btn-primary" onClick={openCreateCampaign}>
          <Plus size={16} /> New campaign
        </button>
      }
    >
      {error ? <p className="crm-error-banner">{error}</p> : null}
      {copyNotice ? <p className="crm-muted-inline">{copyNotice}</p> : null}

      <div className="crm-filter-chips" style={{ marginBottom: '1rem' }}>
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`crm-chip${tab === item.id ? ' crm-chip--active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'campaigns' ? (
        <div className="crm-table-wrap">
          {loading ? (
            <p className="crm-muted-inline">Loading campaigns…</p>
          ) : campaigns.length === 0 ? (
            <p className="crm-muted-inline">No campaigns yet. Create your first feedback campaign.</p>
          ) : (
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Trip</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th>Responses</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>{campaign.company_name}</td>
                    <td>{campaign.trip_name}</td>
                    <td>
                      {formatDate(campaign.travel_date_start)}
                      {campaign.travel_date_end ? ` – ${formatDate(campaign.travel_date_end)}` : ''}
                    </td>
                    <td>
                      <span className={statusClass(campaign.status)}>{campaign.status}</span>
                    </td>
                    <td>{responseCountByCampaign[campaign.id] || 0}</td>
                    <td>
                      <button
                        type="button"
                        className="crm-btn crm-btn-ghost crm-btn--dark"
                        onClick={() => {
                          setSelectedCampaignId(campaign.id)
                          openEditCampaign(campaign)
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}

      {tab !== 'campaigns' ? (
        <div className="crm-field" style={{ maxWidth: 420, marginBottom: '1rem' }}>
          <label htmlFor="campaign-select">Campaign</label>
          <select
            id="campaign-select"
            className="crm-input"
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
          >
            <option value="">Select campaign…</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company_name} — {c.trip_name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {tab === 'links' && selectedCampaignId ? (
        <div className="crm-reports-grid">
          <section className="crm-chart-card">
            <h3>Generate secure link</h3>
            <p className="crm-muted-inline">
              Share this link only with travelers from {selectedCampaign?.company_name || 'this trip'}.
            </p>
            <div className="crm-field">
              <label htmlFor="token-expiry">Optional expiry</label>
              <input
                id="token-expiry"
                type="datetime-local"
                className="crm-input"
                value={tokenExpiry}
                onChange={(e) => setTokenExpiry(e.target.value)}
              />
            </div>
            <button type="button" className="crm-btn crm-btn-primary" onClick={handleGenerateLink} disabled={saving}>
              <Link2 size={16} /> Generate link
            </button>
          </section>

          <section className="crm-chart-card">
            <h3>Active links</h3>
            {tokens.length === 0 ? (
              <p className="crm-muted-inline">No links yet for this campaign.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {tokens.map((tokenRow) => (
                  <li key={tokenRow.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e4e4e7' }}>
                    <code style={{ fontSize: '0.78rem', wordBreak: 'break-all' }}>
                      {buildFeedbackPublicUrl(tokenRow.token)}
                    </code>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="crm-btn crm-btn-ghost crm-btn--dark"
                        onClick={() => handleCopyLink(tokenRow.token)}
                      >
                        <ClipboardCopy size={14} /> Copy
                      </button>
                      <button
                        type="button"
                        className="crm-btn crm-btn-ghost crm-btn--dark"
                        onClick={() => handleToggleToken(tokenRow)}
                      >
                        {tokenRow.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <span className="crm-muted-inline">
                        {tokenRow.submission_count || 0} submissions
                        {tokenRow.expires_at ? ` · expires ${formatDate(tokenRow.expires_at)}` : ''}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}

      {tab === 'responses' && selectedCampaignId ? (
        <>
          <div className="crm-reports-grid" style={{ marginBottom: '1rem' }}>
            <section className="crm-chart-card">
              <h3>Total responses</h3>
              <p style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{stats.total}</p>
            </section>
            <section className="crm-chart-card">
              <h3>Avg. satisfaction</h3>
              <p style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{stats.avgRating != null ? `${stats.avgRating}/5` : '—'}</p>
            </section>
            <section className="crm-chart-card">
              <h3>Avg. NPS</h3>
              <p style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{stats.avgNps != null ? stats.avgNps : '—'}</p>
            </section>
            <section className="crm-chart-card">
              <h3>Active links</h3>
              <p style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{stats.activeTokens}</p>
            </section>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              className="crm-btn crm-btn-ghost crm-btn--dark"
              disabled={!responses.length}
              onClick={() => exportFeedbackToCsv(responses, questions, selectedCampaign)}
            >
              Export CSV
            </button>
          </div>

          <div className="crm-table-wrap">
            {responses.length === 0 ? (
              <p className="crm-muted-inline">No responses yet.</p>
            ) : (
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Submitted</th>
                    <th>Traveler</th>
                    <th>Score</th>
                    <th>NPS</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {responses.map((row) => (
                    <tr key={row.id}>
                      <td>{formatDate(row.submitted_at)}</td>
                      <td>
                        {row.traveler_name}
                        {row.traveler_email ? (
                          <div className="crm-muted-inline">{row.traveler_email}</div>
                        ) : null}
                      </td>
                      <td>{row.overall_score ?? '—'}</td>
                      <td>{row.nps_score ?? '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="crm-btn crm-btn-ghost crm-btn--dark"
                          onClick={() => setDetailResponse(row)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : null}

      {campaignModalOpen ? (
        <div className="crm-modal-backdrop" role="presentation" onClick={() => setCampaignModalOpen(false)}>
          <div
            className="crm-modal crm-modal--wide"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{editingCampaignId ? 'Edit campaign' : 'New feedback campaign'}</h2>
            <form onSubmit={handleSaveCampaign} className="crm-form-grid">
              <div className="crm-field">
                <label>Company name *</label>
                <input
                  className="crm-input"
                  value={campaignForm.company_name}
                  onChange={(e) => setCampaignForm((f) => ({ ...f, company_name: e.target.value }))}
                  required
                />
              </div>
              <div className="crm-field">
                <label>Trip name *</label>
                <input
                  className="crm-input"
                  value={campaignForm.trip_name}
                  onChange={(e) => setCampaignForm((f) => ({ ...f, trip_name: e.target.value }))}
                  required
                />
              </div>
              <div className="crm-field">
                <label>Destination</label>
                <input
                  className="crm-input"
                  value={campaignForm.destination}
                  onChange={(e) => setCampaignForm((f) => ({ ...f, destination: e.target.value }))}
                />
              </div>
              <div className="crm-field">
                <label>Status</label>
                <select
                  className="crm-input"
                  value={campaignForm.status}
                  onChange={(e) => setCampaignForm((f) => ({ ...f, status: e.target.value }))}
                >
                  {FEEDBACK_CAMPAIGN_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="crm-field">
                <label>Travel start</label>
                <input
                  type="date"
                  className="crm-input"
                  value={campaignForm.travel_date_start}
                  onChange={(e) => setCampaignForm((f) => ({ ...f, travel_date_start: e.target.value }))}
                />
              </div>
              <div className="crm-field">
                <label>Travel end</label>
                <input
                  type="date"
                  className="crm-input"
                  value={campaignForm.travel_date_end}
                  onChange={(e) => setCampaignForm((f) => ({ ...f, travel_date_end: e.target.value }))}
                />
              </div>
              <div className="crm-field crm-field--full">
                <label>Internal notes</label>
                <textarea
                  className="crm-input"
                  rows={3}
                  value={campaignForm.notes}
                  onChange={(e) => setCampaignForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>

              {editingCampaignId ? (
                <div className="crm-field crm-field--full">
                  <h3 style={{ margin: '0 0 0.75rem' }}>Questions</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {questions.map((q) => (
                      <li key={q.id} style={{ marginBottom: '0.75rem' }}>
                        <strong>{q.label}</strong>
                        <span className="crm-muted-inline"> · {q.question_type}</span>
                        {!q.is_active ? <span className="crm-muted-inline"> · inactive</span> : null}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                          <button
                            type="button"
                            className="crm-btn crm-btn-ghost crm-btn--dark"
                            onClick={() => handleToggleQuestion(q)}
                          >
                            {q.is_active ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            type="button"
                            className="crm-btn crm-btn-ghost crm-btn--dark"
                            onClick={() => handleDeleteQuestion(q.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="crm-form-grid" style={{ marginTop: '0.75rem' }}>
                    <div className="crm-field crm-field--full">
                      <label>New question</label>
                      <input
                        className="crm-input"
                        value={newQuestion.label}
                        onChange={(e) => setNewQuestion((q) => ({ ...q, label: e.target.value }))}
                        placeholder="Question label"
                      />
                    </div>
                    <div className="crm-field">
                      <label>Type</label>
                      <select
                        className="crm-input"
                        value={newQuestion.question_type}
                        onChange={(e) => setNewQuestion((q) => ({ ...q, question_type: e.target.value }))}
                      >
                        {FEEDBACK_QUESTION_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="crm-field" style={{ alignSelf: 'end' }}>
                      <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={handleAddQuestion}>
                        Add question
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {saveError ? <p className="crm-error-inline crm-field--full">{saveError}</p> : null}

              <div className="crm-modal-actions crm-field--full">
                <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={() => setCampaignModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="crm-btn crm-btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {detailResponse ? (
        <div className="crm-modal-backdrop" role="presentation" onClick={() => setDetailResponse(null)}>
          <div className="crm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2>
              <MessageSquare size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Feedback detail
            </h2>
            <p>
              <strong>{detailResponse.traveler_name}</strong>
              {detailResponse.traveler_email ? ` · ${detailResponse.traveler_email}` : ''}
            </p>
            <p className="crm-muted-inline">Submitted {formatDate(detailResponse.submitted_at)}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {questions.map((q) => (
                <li key={q.id} style={{ marginBottom: '0.75rem' }}>
                  <strong>{q.label}</strong>
                  <div>{detailResponse.answers?.[q.id] ?? '—'}</div>
                </li>
              ))}
            </ul>
            <div className="crm-modal-actions">
              <button type="button" className="crm-btn crm-btn-primary" onClick={() => setDetailResponse(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'campaigns' && !loading && campaigns.length > 0 ? (
        <p className="crm-muted-inline" style={{ marginTop: '1rem' }}>
          <Star size={14} style={{ verticalAlign: 'middle' }} /> Set campaign status to <strong>active</strong> before
          generating links and collecting feedback.
        </p>
      ) : null}
    </AdminLayout>
  )
}

export default CorporateFeedbackAdmin
