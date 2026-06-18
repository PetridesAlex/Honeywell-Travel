import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCopy,
  Link2,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
} from 'lucide-react'
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
  parseOptionsText,
  updateFeedbackCampaign,
  updateFeedbackQuestion,
} from './api/feedbackApi'
import { exportFeedbackToCsv } from './utils/exportFeedback'
import './Leads.css'
import './CorporateFeedbackAdmin.css'

const EMPTY_CAMPAIGN = {
  company_name: '',
  trip_name: '',
  destination: '',
  travel_date_start: '',
  travel_date_end: '',
  status: 'active',
  notes: '',
  cover_image_url: '',
}

const EMPTY_QUESTION = {
  label: '',
  question_type: 'textarea',
  is_required: false,
  options_text: '',
  image_url: '',
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
  const [view, setView] = useState('home')
  const [wizardStep, setWizardStep] = useState(1)
  const [campaigns, setCampaigns] = useState([])
  const [tokens, setTokens] = useState([])
  const [responses, setResponses] = useState([])
  const [questions, setQuestions] = useState([])
  const [selectedCampaignId, setSelectedCampaignId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [campaignForm, setCampaignForm] = useState(EMPTY_CAMPAIGN)
  const [editingCampaignId, setEditingCampaignId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [copyNotice, setCopyNotice] = useState('')
  const [newQuestion, setNewQuestion] = useState(EMPTY_QUESTION)
  const [tokenExpiry, setTokenExpiry] = useState('')
  const [detailResponse, setDetailResponse] = useState(null)
  const [latestLink, setLatestLink] = useState('')

  const selectedCampaign = useMemo(
    () => campaigns.find((c) => c.id === selectedCampaignId) || null,
    [campaigns, selectedCampaignId]
  )

  const stats = useMemo(
    () =>
      computeFeedbackStats(
        responses.filter((r) => !selectedCampaignId || r.campaign_id === selectedCampaignId),
        tokens.filter((t) => !selectedCampaignId || t.campaign_id === selectedCampaignId)
      ),
    [responses, tokens, selectedCampaignId]
  )

  const loadCampaigns = useCallback(async () => {
    setLoading(true)
    setError('')
    const [{ data, error: campaignError }, { data: responseData }] = await Promise.all([
      fetchFeedbackCampaigns(),
      fetchFeedbackResponses(),
    ])
    if (campaignError) {
      setError(
        campaignError.message?.includes('feedback_campaigns')
          ? 'Run supabase/migrations/20260611_corporate_feedback.sql in Supabase.'
          : campaignError.message
      )
      setCampaigns([])
    } else {
      setCampaigns(data || [])
    }
    setResponses(responseData || [])
    setLoading(false)
  }, [])

  const loadCampaignDetails = useCallback(async (campaignId) => {
    if (!campaignId) return
    const [{ data: tokenData }, { data: responseData }, { data: questionData }] = await Promise.all([
      fetchFeedbackTokens(campaignId),
      fetchFeedbackResponses(campaignId),
      fetchFeedbackQuestions(campaignId),
    ])
    setTokens(tokenData || [])
    setResponses(responseData || [])
    setQuestions(questionData || [])
    const active = (tokenData || []).find((t) => t.is_active)
    if (active) setLatestLink(buildFeedbackPublicUrl(active.token))
  }, [])

  useEffect(() => {
    loadCampaigns()
  }, [loadCampaigns])

  useEffect(() => {
    if (selectedCampaignId) loadCampaignDetails(selectedCampaignId)
  }, [selectedCampaignId, loadCampaignDetails])

  const startNewForm = () => {
    setEditingCampaignId(null)
    setCampaignForm(EMPTY_CAMPAIGN)
    setNewQuestion(EMPTY_QUESTION)
    setSaveError('')
    setWizardStep(1)
    setView('wizard')
  }

  const openWizard = (campaign) => {
    setEditingCampaignId(campaign.id)
    setSelectedCampaignId(campaign.id)
    setCampaignForm({
      company_name: campaign.company_name || '',
      trip_name: campaign.trip_name || '',
      destination: campaign.destination || '',
      travel_date_start: campaign.travel_date_start || '',
      travel_date_end: campaign.travel_date_end || '',
      status: campaign.status || 'active',
      notes: campaign.notes || '',
      cover_image_url: campaign.cover_image_url || '',
    })
    setWizardStep(1)
    setView('wizard')
    loadCampaignDetails(campaign.id)
  }

  const handleSaveDetails = async (e) => {
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
    if (data?.id) {
      setEditingCampaignId(data.id)
      setSelectedCampaignId(data.id)
      await loadCampaigns()
      await loadCampaignDetails(data.id)
      setWizardStep(2)
    }
  }

  const handleAddQuestion = async () => {
    if (!selectedCampaignId || !newQuestion.label.trim()) return
    setSaving(true)
    setSaveError('')
    const options =
      newQuestion.question_type === 'select' ? parseOptionsText(newQuestion.options_text) : []
    const { error: qErr } = await createFeedbackQuestion({
      campaign_id: selectedCampaignId,
      label: newQuestion.label,
      question_type: newQuestion.question_type,
      is_required: newQuestion.is_required,
      image_url: newQuestion.image_url,
      options,
      sort_order: questions.length,
    })
    setSaving(false)
    if (qErr) {
      setSaveError(qErr.message)
      return
    }
    setNewQuestion(EMPTY_QUESTION)
    await loadCampaignDetails(selectedCampaignId)
  }

  const handleToggleQuestion = async (question) => {
    await updateFeedbackQuestion(question.id, {
      ...question,
      is_active: !question.is_active,
    })
    await loadCampaignDetails(selectedCampaignId)
  }

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return
    await deleteFeedbackQuestion(id)
    await loadCampaignDetails(selectedCampaignId)
  }

  const handleGenerateLink = async () => {
    if (!selectedCampaignId) return
    setSaving(true)
    setSaveError('')
    const expiresAt = tokenExpiry ? new Date(tokenExpiry).toISOString() : null
    const { data, error: tokenErr } = await createFeedbackToken(selectedCampaignId, expiresAt)
    setSaving(false)
    if (tokenErr) {
      setSaveError(tokenErr.message)
      return
    }
    setTokenExpiry('')
    await loadCampaignDetails(selectedCampaignId)
    if (data?.token) {
      const url = buildFeedbackPublicUrl(data.token)
      setLatestLink(url)
      try {
        await navigator.clipboard.writeText(url)
        setCopyNotice('Link created and copied to clipboard.')
      } catch {
        setCopyNotice('Link created. Copy it below.')
      }
      setTimeout(() => setCopyNotice(''), 3500)
    }
  }

  const openResponseDetail = async (row) => {
    const { data } = await fetchFeedbackQuestions(row.campaign_id)
    setQuestions(data || [])
    setDetailResponse(row)
  }

  const handleCopyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopyNotice('Link copied.')
      setTimeout(() => setCopyNotice(''), 2500)
    } catch {
      setCopyNotice(url)
    }
  }

  const goToShareStep = async () => {
    if (campaignForm.status !== 'active') {
      setSaveError('Set status to active before sharing the form.')
      return
    }
    setWizardStep(3)
    if (!latestLink) await handleGenerateLink()
  }

  const responseCountByCampaign = useMemo(() => {
    const map = {}
    responses.forEach((r) => {
      map[r.campaign_id] = (map[r.campaign_id] || 0) + 1
    })
    return map
  }, [responses])

  if (view === 'wizard') {
    return (
      <AdminLayout
        title="Form builder"
        subtitle="Create your trip feedback form, add questions, then copy the secure client link."
        actions={
          <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={() => setView('home')}>
            <ArrowLeft size={16} /> Back to all forms
          </button>
        }
      >
        <div className="cfb-admin">
          {saveError ? <p className="crm-error-banner">{saveError}</p> : null}
          {copyNotice ? <p className="crm-muted-inline">{copyNotice}</p> : null}

          <div className="cfb-steps">
            {[
              { n: 1, label: 'Trip details' },
              { n: 2, label: 'Questions' },
              { n: 3, label: 'Share link' },
            ].map((s) => (
              <span
                key={s.n}
                className={`cfb-step${wizardStep === s.n ? ' is-active' : ''}${wizardStep > s.n ? ' is-done' : ''}`}
              >
                <span className="cfb-step__num">{wizardStep > s.n ? <Check size={12} /> : s.n}</span>
                {s.label}
              </span>
            ))}
          </div>

          {wizardStep === 1 ? (
            <section className="cfb-panel">
              <h3>Trip & company details</h3>
              <p className="cfb-panel__hint">
                This information appears at the top of the client form. Set status to <strong>active</strong> when ready
                to share.
              </p>
              <form className="crm-form-grid" onSubmit={handleSaveDetails}>
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
                  <label>Cover image URL (optional)</label>
                  <input
                    className="crm-input"
                    value={campaignForm.cover_image_url}
                    onChange={(e) => setCampaignForm((f) => ({ ...f, cover_image_url: e.target.value }))}
                    placeholder="https://… image shown on the client form"
                  />
                  {campaignForm.cover_image_url ? (
                    <img src={campaignForm.cover_image_url} alt="" className="cfb-preview-img" />
                  ) : null}
                </div>
                <div className="crm-modal-actions crm-field--full">
                  <button type="submit" className="crm-btn crm-btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Save & continue'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </section>
          ) : null}

          {wizardStep === 2 ? (
            <section className="cfb-panel">
              <h3>Build your questions</h3>
              <p className="cfb-panel__hint">
                Add star ratings, multiple choice, text, and optional images above each question.
              </p>

              {questions.map((q) => (
                <div key={q.id} className="cfb-question-card">
                  <div className="cfb-question-card__head">
                    <div>
                      <div className="cfb-question-card__meta">{q.question_type.replace('_', ' ')}</div>
                      <strong>{q.label}</strong>
                      {q.is_required ? ' *' : ''}
                    </div>
                    <div className="cfb-list-actions">
                      <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={() => handleToggleQuestion(q)}>
                        {q.is_active ? 'Hide' : 'Show'}
                      </button>
                      <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={() => handleDeleteQuestion(q.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                  {q.image_url ? <img src={q.image_url} alt="" className="cfb-preview-img" /> : null}
                  {q.question_type === 'select' && Array.isArray(q.options) && q.options.length ? (
                    <div className="cfb-choice-preview">
                      {q.options.map((opt) => (
                        <span key={opt}>{opt}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}

              <div className="crm-form-grid" style={{ marginTop: '1rem' }}>
                <div className="crm-field crm-field--full">
                  <label>Question text *</label>
                  <input
                    className="crm-input"
                    value={newQuestion.label}
                    onChange={(e) => setNewQuestion((q) => ({ ...q, label: e.target.value }))}
                    placeholder="e.g. How was your hotel experience?"
                  />
                </div>
                <div className="crm-field">
                  <label>Question type</label>
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
                <div className="crm-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={newQuestion.is_required}
                      onChange={(e) => setNewQuestion((q) => ({ ...q, is_required: e.target.checked }))}
                    />{' '}
                    Required
                  </label>
                </div>
                {newQuestion.question_type === 'select' ? (
                  <div className="crm-field crm-field--full">
                    <label>Choices (one per line)</label>
                    <textarea
                      className="crm-input"
                      rows={4}
                      value={newQuestion.options_text}
                      onChange={(e) => setNewQuestion((q) => ({ ...q, options_text: e.target.value }))}
                      placeholder={'Excellent\nGood\nAverage\nPoor'}
                    />
                  </div>
                ) : null}
                <div className="crm-field crm-field--full">
                  <label>Image above question (optional URL)</label>
                  <input
                    className="crm-input"
                    value={newQuestion.image_url}
                    onChange={(e) => setNewQuestion((q) => ({ ...q, image_url: e.target.value }))}
                    placeholder="https://…"
                  />
                </div>
                <div className="crm-field crm-field--full">
                  <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={handleAddQuestion} disabled={saving}>
                    <Plus size={16} /> Add question
                  </button>
                </div>
              </div>

              <div className="crm-modal-actions" style={{ marginTop: '1rem' }}>
                <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={() => setWizardStep(1)}>
                  Back
                </button>
                <button type="button" className="crm-btn crm-btn-primary" onClick={goToShareStep}>
                  Continue to share link
                  <Send size={16} />
                </button>
              </div>
            </section>
          ) : null}

          {wizardStep === 3 ? (
            <section className="cfb-panel">
              <h3>Share with your client</h3>
              <p className="cfb-panel__hint">
                Copy this private link and email it to travelers. Only people with the link can open the form.
              </p>
              <div className="cfb-share-box">
                <strong>{selectedCampaign?.company_name}</strong> — {selectedCampaign?.trip_name}
                <input className="cfb-share-url" readOnly value={latestLink || 'Generate a link below'} />
                <div className="cfb-share-actions">
                  <button type="button" className="crm-btn crm-btn-primary" onClick={handleGenerateLink} disabled={saving}>
                    <Link2 size={16} /> {latestLink ? 'Generate new link' : 'Generate link'}
                  </button>
                  {latestLink ? (
                    <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={() => handleCopyLink(latestLink)}>
                      <ClipboardCopy size={16} /> Copy link
                    </button>
                  ) : null}
                </div>
                <div className="crm-field" style={{ marginTop: '1rem' }}>
                  <label>Optional link expiry</label>
                  <input
                    type="datetime-local"
                    className="crm-input"
                    value={tokenExpiry}
                    onChange={(e) => setTokenExpiry(e.target.value)}
                  />
                </div>
              </div>
              <div className="crm-modal-actions" style={{ marginTop: '1rem' }}>
                <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={() => setWizardStep(2)}>
                  Back to questions
                </button>
                <button type="button" className="crm-btn crm-btn-primary" onClick={() => setView('home')}>
                  Done — view all forms
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Corporate Feedback"
      subtitle="Create client feedback forms, share secure links, and review responses."
      actions={
        <button type="button" className="crm-btn crm-btn-primary" onClick={startNewForm}>
          <Plus size={16} /> Create new form
        </button>
      }
    >
      <div className="cfb-admin">
        {error ? <p className="crm-error-banner">{error}</p> : null}
        {copyNotice ? <p className="crm-muted-inline">{copyNotice}</p> : null}

        <section className="cfb-hero-card">
          <h2>
            <Sparkles size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            How it works
          </h2>
          <p>
            1) Create a form with trip details · 2) Add questions (ratings, multiple choice, images) · 3) Copy the
            secure link and send it to your client. Responses arrive here and by email.
          </p>
        </section>

        <div className="crm-reports-grid">
          <section className="crm-chart-card">
            <h3>Forms</h3>
            <p style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{campaigns.length}</p>
          </section>
          <section className="crm-chart-card">
            <h3>Total responses</h3>
            <p style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{responses.length}</p>
          </section>
          <section className="crm-chart-card">
            <h3>Avg. satisfaction</h3>
            <p style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{stats.avgRating != null ? `${stats.avgRating}/5` : '—'}</p>
          </section>
          <section className="crm-chart-card">
            <h3>Avg. NPS</h3>
            <p style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{stats.avgNps != null ? stats.avgNps : '—'}</p>
          </section>
        </div>

        <section className="cfb-panel">
          <h3>Your feedback forms</h3>
          {loading ? (
            <p className="crm-muted-inline">Loading…</p>
          ) : campaigns.length === 0 ? (
            <p className="crm-muted-inline">No forms yet. Click <strong>Create new form</strong> to start.</p>
          ) : (
            <div className="crm-table-wrap">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Trip</th>
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
                        <span className={statusClass(campaign.status)}>{campaign.status}</span>
                      </td>
                      <td>{responseCountByCampaign[campaign.id] || 0}</td>
                      <td>
                        <div className="cfb-list-actions">
                          <button type="button" className="crm-btn crm-btn-primary" onClick={() => openWizard(campaign)}>
                            Edit / share
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {campaigns.length > 0 ? (
          <section className="cfb-panel">
            <h3>Recent responses</h3>
            <div style={{ marginBottom: '0.75rem' }}>
              <button
                type="button"
                className="crm-btn crm-btn-ghost crm-btn--dark"
                disabled={!responses.length}
                onClick={() => exportFeedbackToCsv(responses, questions, selectedCampaign)}
              >
                Export CSV
              </button>
            </div>
            {responses.length === 0 ? (
              <p className="crm-muted-inline">No responses yet.</p>
            ) : (
              <div className="crm-table-wrap">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Traveler</th>
                      <th>Score</th>
                      <th>NPS</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {responses.slice(0, 20).map((row) => (
                      <tr key={row.id}>
                        <td>{formatDate(row.submitted_at)}</td>
                        <td>{row.traveler_name}</td>
                        <td>{row.overall_score ?? '—'}</td>
                        <td>{row.nps_score ?? '—'}</td>
                        <td>
                          <button type="button" className="crm-btn crm-btn-ghost crm-btn--dark" onClick={() => openResponseDetail(row)}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}
      </div>

      {detailResponse ? (
        <div className="crm-modal-backdrop" role="presentation" onClick={() => setDetailResponse(null)}>
          <div className="crm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2>
              <MessageSquare size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Response detail
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
    </AdminLayout>
  )
}

export default CorporateFeedbackAdmin
