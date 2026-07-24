import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import { CRM_SENDER_EMAIL } from './constants'
import { getAdminAuthRedirectUrl } from '../../lib/adminAuth'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import './Login.css'

const syncInputValue = (setter) => (event) => {
  setter(event.currentTarget.value)
}

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!isSupabaseConfigured) {
      setError(
        'Password reset is unavailable: Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.'
      )
      setLoading(false)
      return
    }

    const emailValue = email.trim().toLowerCase()

    if (!emailValue) {
      setError('Please enter your email.')
      setLoading(false)
      return
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(emailValue, {
      redirectTo: getAdminAuthRedirectUrl()
    })

    if (resetError) {
      setError(resetError.message || 'Password reset failed. Please try again.')
      setLoading(false)
      return
    }

    setSuccess('Password reset email sent. Check your inbox for next steps.')
    setLoading(false)
  }

  return (
    <div className="admin-auth-page">
      <motion.div
        className="admin-auth-shell"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="admin-auth-visual-col">
          <div className="admin-auth-visual-art" aria-hidden="true">
            <span className="admin-auth-visual-orb admin-auth-visual-orb--1" />
            <span className="admin-auth-visual-orb admin-auth-visual-orb--2" />
            <span className="admin-auth-visual-orb admin-auth-visual-orb--3" />
          </div>
          <div className="admin-auth-visual-content">
            <p className="admin-auth-visual-welcome">Security check</p>
            <div className="admin-auth-visual-brand">
              <span className="admin-auth-visual-mark">
                <img
                  src="/images/icons/honeywell-travel-logo.webp"
                  alt="Honeywell Travel"
                  className="admin-auth-visual-mark__img"
                />
              </span>
              <span className="admin-auth-visual-name">Honeywell Travel</span>
            </div>
            <p className="admin-auth-visual-tagline">
              Recover your admin
              <br />
              account access
            </p>
          </div>
        </div>

        <div className="admin-auth-form-col">
          <div className="admin-auth-form-inner">
            <motion.h1
              className="admin-auth-title"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
            >
              Forgot password
            </motion.h1>

            <form className="admin-auth-form" onSubmit={handleSubmit} noValidate>
              <input
                name="email"
                type="email"
                className="admin-auth-input"
                value={email}
                onChange={syncInputValue(setEmail)}
                onInput={syncInputValue(setEmail)}
                placeholder="Admin email"
                required
                autoComplete="email"
                aria-label="Email"
              />

              {error ? <p className="admin-auth-error">{error}</p> : null}
              {success ? <p className="admin-auth-success">{success}</p> : null}

              <button type="submit" className="admin-auth-submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send reset email'}
              </button>
            </form>

            <p className="admin-auth-email-hint">
              Reset emails are sent through <strong>{CRM_SENDER_EMAIL}</strong>.
            </p>

            <div className="admin-auth-links">
              <Link to="/admin/login" className="admin-auth-back">
                Back to sign in
              </Link>
              <Link to="/admin/signup" className="admin-auth-back">
                Create admin account
              </Link>
            </div>

            <div className="admin-auth-footer">
              <Link to="/" className="admin-auth-back">
                <ArrowLeft size={15} />
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPassword
