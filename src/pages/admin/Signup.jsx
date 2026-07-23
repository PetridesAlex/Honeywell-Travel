import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { CRM_SENDER_EMAIL } from './constants'
import { getAdminAuthErrorMessage, isSupabaseConfigured, supabase } from '../../lib/supabase'
import './Login.css'

const syncInputValue = (setter) => (event) => {
  setter(event.currentTarget.value)
}

function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
        'Admin signup is unavailable: Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.'
      )
      setLoading(false)
      return
    }

    const emailValue = email.trim().toLowerCase()
    const passwordValue = password

    if (!emailValue || !passwordValue) {
      setError('Please enter your email and password.')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: emailValue,
      password: passwordValue
    })

    if (signUpError) {
      setError(getAdminAuthErrorMessage(signUpError))
      setLoading(false)
      return
    }

    if (data?.user) {
      setSuccess('Account created. Please confirm the email before signing in.')
      setPassword('')
    } else {
      setError('Signup did not complete. Please try again.')
    }

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
            <p className="admin-auth-visual-welcome">Welcome</p>
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
              Create your admin
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
              Sign up
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

              <div className="admin-auth-password-wrap">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="admin-auth-input"
                  value={password}
                  onChange={syncInputValue(setPassword)}
                  onInput={syncInputValue(setPassword)}
                  placeholder="Password"
                  required
                  autoComplete="new-password"
                  aria-label="Password"
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
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error ? <p className="admin-auth-error">{error}</p> : null}
              {success ? <p className="admin-auth-success">{success}</p> : null}

              <button type="submit" className="admin-auth-submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="admin-auth-email-hint">
              Admin notifications continue through <strong>{CRM_SENDER_EMAIL}</strong> via Outlook.
            </p>

            <div className="admin-auth-links">
              <Link to="/admin/login" className="admin-auth-back">
                Already have an account? Sign in
              </Link>
              <Link to="/admin/forgot-password" className="admin-auth-back">
                Forgot password?
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

export default Signup
