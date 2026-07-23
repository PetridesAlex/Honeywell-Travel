import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Mail } from 'lucide-react'
import {
  ADMIN_MAGIC_LINK_SUCCESS_MESSAGE,
  ADMIN_MAGIC_LINK_SUCCESS_MESSAGE_DEV,
  CRM_DEV_PREVIEW_DASHBOARD,
  getAdminMagicLinkRedirectUrl,
  getMagicLinkErrorMessage,
  resolveDevMagicLinkUrl,
  sendAdminMagicLink
} from '../../lib/adminAuth'
import { isSupabaseConfigured } from '../../lib/supabase'
import './Login.css'

const syncInputValue = (setter) => (event) => {
  setter(event.currentTarget.value)
}

function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pastedMagicLink, setPastedMagicLink] = useState('')
  const [pasteError, setPasteError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!isSupabaseConfigured) {
      setError(
        'Admin login is unavailable: Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.'
      )
      setLoading(false)
      return
    }

    const emailValue = String(email).trim().toLowerCase()
    if (!emailValue) {
      setError('Please enter your email address.')
      setLoading(false)
      return
    }

    setEmail(emailValue)

    const { error: otpError } = await sendAdminMagicLink(emailValue)

    if (otpError) {
      setError(getMagicLinkErrorMessage(otpError))
      setLoading(false)
      return
    }

    setSuccess(
      import.meta.env.DEV
        ? `${ADMIN_MAGIC_LINK_SUCCESS_MESSAGE_DEV} Return URL: ${getAdminMagicLinkRedirectUrl()}.`
        : ADMIN_MAGIC_LINK_SUCCESS_MESSAGE
    )
    setLoading(false)
  }

  const handlePasteMagicLink = (event) => {
    event.preventDefault()
    setPasteError('')
    const resolved = resolveDevMagicLinkUrl(pastedMagicLink)
    if (!resolved) {
      setPasteError('Paste the full link from your email (Supabase verify URL or localhost dashboard link).')
      return
    }
    window.location.replace(resolved)
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
            <p className="admin-auth-visual-welcome">
              <span className="admin-auth-visual-welcome__line" aria-hidden="true" />
              <span className="admin-auth-visual-welcome__text">Welcome back</span>
              <span className="admin-auth-visual-welcome__line" aria-hidden="true" />
            </p>
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
            <p className="admin-auth-visual-tagline">Your premium travel hub</p>
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
              Sign in
            </motion.h1>
            <p className="admin-auth-muted admin-auth-muted--intro">
              Enter your work email and we will send you a secure one-time login link.
            </p>

            <form className="admin-auth-form" onSubmit={handleSubmit} noValidate>
              <input
                id="admin-email"
                name="email"
                type="email"
                className="admin-auth-input"
                value={email}
                onChange={syncInputValue(setEmail)}
                onInput={syncInputValue(setEmail)}
                placeholder="Email"
                required
                autoComplete="email"
                aria-label="Email"
                disabled={loading || Boolean(success)}
              />

              {error ? (
                <p className="admin-auth-error" role="alert">
                  {error}
                </p>
              ) : null}

              {success ? (
                <p className="admin-auth-success" role="status">
                  {success}
                </p>
              ) : null}

              <button
                type="submit"
                className="admin-auth-submit"
                disabled={loading || Boolean(success)}
              >
                <Mail size={18} aria-hidden />
                {loading ? 'Sending link…' : 'Send Login Link'}
              </button>
            </form>

            {import.meta.env.DEV ? (
              <section className="admin-auth-paste" aria-labelledby="admin-auth-paste-title">
                <h2 id="admin-auth-paste-title" className="admin-auth-paste__title">
                  Open login link in Cursor
                </h2>
                <p className="admin-auth-paste__hint">
                  After the email arrives, <strong>right-click the login button → Copy link</strong> (do not
                  click it — Outlook opens Safari and you will not be logged in here). Paste the full link
                  below to open the CRM dashboard in Cursor with your real account.
                </p>
                <form className="admin-auth-paste__form" onSubmit={handlePasteMagicLink}>
                  <input
                    type="url"
                    className="admin-auth-input admin-auth-input--paste"
                    value={pastedMagicLink}
                    onChange={syncInputValue(setPastedMagicLink)}
                    onInput={syncInputValue(setPastedMagicLink)}
                    placeholder="Paste magic link from Outlook here"
                    aria-label="Paste magic link from email"
                  />
                  {pasteError ? (
                    <p className="admin-auth-error" role="alert">
                      {pasteError}
                    </p>
                  ) : null}
                  <button type="submit" className="admin-auth-submit admin-auth-submit--paste">
                    Open in Cursor &amp; sign in
                  </button>
                </form>
                <p className="admin-auth-dev-hint">
                  <Link
                    to={`${CRM_DEV_PREVIEW_DASHBOARD}?preview=dev`}
                    className="admin-auth-dev-preview"
                  >
                    Layout preview only (no login)
                  </Link>
                </p>
              </section>
            ) : null}

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

export default Login
