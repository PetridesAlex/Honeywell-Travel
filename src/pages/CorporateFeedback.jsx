import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import HoneypotField from '../components/HoneypotField'
import { FEEDBACK_ERROR_MESSAGE } from '../lib/formConstants'
import { submitCorporateFeedback, validateFeedbackToken } from '../lib/submitCorporateFeedback'
import './CorporateFeedback.css'

function StarRating({ value, onChange, name }) {
  return (
    <div className="cf-stars" role="radiogroup" aria-label={name}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`cf-star${Number(value) >= star ? ' is-active' : ''}`}
          onClick={() => onChange(String(star))}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          aria-pressed={Number(value) >= star}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function NpsScale({ value, onChange }) {
  return (
    <div className="cf-nps">
      <div className="cf-nps-scale">
        {Array.from({ length: 11 }, (_, i) => i).map((n) => (
          <button
            key={n}
            type="button"
            className={`cf-nps-btn${Number(value) === n ? ' is-active' : ''}`}
            onClick={() => onChange(String(n))}
            aria-pressed={Number(value) === n}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="cf-nps-labels">
        <span>Not likely</span>
        <span>Very likely</span>
      </div>
    </div>
  )
}

function QuestionField({ question, value, onChange }) {
  const id = `q-${question.id}`
  const type = question.question_type

  if (type === 'rating_stars') {
    return <StarRating name={question.label} value={value} onChange={onChange} />
  }

  if (type === 'nps') {
    return <NpsScale value={value} onChange={onChange} />
  }

  if (type === 'yes_no') {
    return (
      <div className="cf-yesno">
        {['yes', 'no'].map((opt) => (
          <button
            key={opt}
            type="button"
            className={`cf-yesno-btn${value === opt ? ' is-active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt === 'yes' ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    )
  }

  if (type === 'select') {
    const options = Array.isArray(question.options) ? question.options : []
    return (
      <select id={id} className="cf-input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    )
  }

  if (type === 'textarea') {
    return (
      <textarea
        id={id}
        className="cf-textarea"
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  return (
    <input
      id={id}
      type="text"
      className="cf-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function CorporateFeedback() {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [campaign, setCampaign] = useState(null)
  const [questions, setQuestions] = useState([])
  const [travelerName, setTravelerName] = useState('')
  const [travelerEmail, setTravelerEmail] = useState('')
  const [answers, setAnswers] = useState({})
  const [honeypot, setHoneypot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      const result = await validateFeedbackToken(token)
      if (cancelled) return
      if (!result.ok) {
        setError(result.error || FEEDBACK_ERROR_MESSAGE)
        setCampaign(null)
        setQuestions([])
      } else {
        setCampaign(result.campaign)
        setQuestions(result.questions)
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [token])

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    const result = await submitCorporateFeedback({
      token,
      travelerName,
      travelerEmail,
      answers,
      honeypot,
    })
    setSubmitting(false)
    if (!result.ok) {
      setFormError(result.error || FEEDBACK_ERROR_MESSAGE)
      return
    }
    setSubmitted(true)
  }

  return (
    <div className="corporate-feedback-page">
      <SEO
        title="Corporate Travel Feedback | Honeywell Travel"
        description="Secure post-trip feedback for Honeywell Travel corporate clients."
        noindex
      />

      <div className="cf-shell">
        <header className="cf-header">
          <img
            src="/images/icons/honeywell-travel-logo.webp"
            alt="Honeywell Travel"
            className="cf-logo"
          />
          <p className="cf-eyebrow">Corporate Travel Feedback</p>
        </header>

        {loading ? (
          <div className="cf-card cf-card--center">
            <p className="cf-muted">Loading your feedback form…</p>
          </div>
        ) : error ? (
          <div className="cf-card cf-card--center cf-card--error">
            <h1>Link unavailable</h1>
            <p>{error}</p>
          </div>
        ) : submitted ? (
          <div className="cf-card cf-card--center cf-card--success">
            <div className="cf-success-icon" aria-hidden="true">
              ✓
            </div>
            <h1>Thank you</h1>
            <p>
              Your feedback has been received. We appreciate you taking the time to share your
              experience with Honeywell Travel.
            </p>
          </div>
        ) : (
          <>
            <div className="cf-trip-card">
              <h1>Share your experience</h1>
              <dl className="cf-trip-meta">
                <div>
                  <dt>Company</dt>
                  <dd>{campaign?.company_name || '—'}</dd>
                </div>
                <div>
                  <dt>Trip</dt>
                  <dd>{campaign?.trip_name || '—'}</dd>
                </div>
                {campaign?.destination ? (
                  <div>
                    <dt>Destination</dt>
                    <dd>{campaign.destination}</dd>
                  </div>
                ) : null}
                {campaign?.travel_dates ? (
                  <div>
                    <dt>Travel dates</dt>
                    <dd>{campaign.travel_dates}</dd>
                  </div>
                ) : null}
              </dl>
            </div>

            <form className="cf-card cf-form" onSubmit={handleSubmit}>
              <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />

              <div className="cf-field">
                <label htmlFor="traveler-name">
                  Your name <span className="cf-required">*</span>
                </label>
                <input
                  id="traveler-name"
                  className="cf-input"
                  value={travelerName}
                  onChange={(e) => setTravelerName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="cf-field">
                <label htmlFor="traveler-email">Your email</label>
                <input
                  id="traveler-email"
                  type="email"
                  className="cf-input"
                  value={travelerEmail}
                  onChange={(e) => setTravelerEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              {questions.map((question) => (
                <div key={question.id} className="cf-field">
                  <label htmlFor={`q-${question.id}`}>
                    {question.label}
                    {question.is_required ? <span className="cf-required"> *</span> : null}
                  </label>
                  <QuestionField
                    question={question}
                    value={answers[question.id] || ''}
                    onChange={(val) => handleAnswerChange(question.id, val)}
                  />
                </div>
              ))}

              {formError ? <p className="cf-form-error">{formError}</p> : null}

              <button type="submit" className="cf-submit" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit feedback'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default CorporateFeedback
