import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Eye, EyeOff, LogIn } from 'lucide-react'
import {
  ADMIN_DASHBOARD_PATH,
  getPasswordAuthErrorMessage,
  signInAdminWithPassword
} from '../../lib/adminAuth'
import { isSupabaseConfigured } from '../../lib/supabase'
import './Login.css'

const syncInputValue = (setter) => (event) => {
  setter(event.currentTarget.value)
}

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    if (!isSupabaseConfigured) {
      setError(
        'Admin login is unavailable: Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) to your environment.'
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
    if (!password) {
      setError('Please enter your password.')
      setLoading(false)
      return
    }

    setEmail(emailValue)

    const { data, error: signInError } = await signInAdminWithPassword(emailValue, password)

    if (signInError) {
      setError(getPasswordAuthErrorMessage(signInError))
      setLoading(false)
      return
    }

    if (!data?.session) {
      setError('Sign in did not complete. Please try again.')
      setLoading(false)
      return
    }

    navigate(ADMIN_DASHBOARD_PATH, { replace: true })
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
            <p className="admin-auth-visual-tagline">Your Travel Package Experience</p>
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
              Enter your work email and password to access Packages CMS.
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
                disabled={loading}
              />

              <div className="admin-auth-password-wrap">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="admin-auth-input"
                  value={password}
                  onChange={syncInputValue(setPassword)}
                  onInput={syncInputValue(setPassword)}
                  placeholder="Password"
                  required
                  autoComplete="current-password"
                  aria-label="Password"
                  disabled={loading}
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                />
                <button
                  type="button"
                  className="admin-auth-password-toggle"
                  tabIndex={-1}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error ? (
                <p className="admin-auth-error" role="alert">
                  {error}
                </p>
              ) : null}

              <button type="submit" className="admin-auth-submit" disabled={loading}>
                <LogIn size={18} aria-hidden />
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="admin-auth-footer">
              <Link to="/" className="admin-auth-home">
                <span className="admin-auth-home__icon" aria-hidden="true">
                  <ArrowLeft size={16} strokeWidth={2.35} />
                </span>
                <span className="admin-auth-home__copy">
                  <span className="admin-auth-home__label">Back to home</span>
                  <span className="admin-auth-home__hint">honeywelltravel.com.cy</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
