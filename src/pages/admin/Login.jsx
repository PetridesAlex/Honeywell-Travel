import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { CRM_ADMIN_LOGIN_EMAIL, CRM_SENDER_EMAIL } from './constants'
import { getAdminAuthErrorMessage, isSupabaseConfigured, supabase } from '../../lib/supabase'
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
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkSession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        setError('Unable to verify session. Please try again.')
        setCheckingSession(false)
        return
      }

      if (data?.session) {
        navigate('/admin/dashboard', { replace: true })
        return
      }
      setCheckingSession(false)
    }

    checkSession()
  }, [navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    if (!isSupabaseConfigured) {
      setError(
        'Admin login is unavailable: Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.'
      )
      setLoading(false)
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    const emailInput = form.querySelector('#admin-email')
    const passwordInput = form.querySelector('#admin-password')
    const emailValue = String(
      formData.get('email') ?? emailInput?.value ?? email
    )
      .trim()
      .toLowerCase()
    const passwordValue = String(
      formData.get('password') ?? passwordInput?.value ?? password
    )

    if (!emailValue || !passwordValue) {
      setError('Please enter your email and password.')
      setLoading(false)
      return
    }

    setEmail(emailValue)
    setPassword(passwordValue)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: emailValue,
      password: passwordValue,
    })

    if (signInError) {
      setError(getAdminAuthErrorMessage(signInError))
      setLoading(false)
      return
    }

    if (!data?.session) {
      setError('Sign in did not create a session. Please try again.')
      setLoading(false)
      return
    }

    navigate('/admin/dashboard', { replace: true })
  }

  return (
    <div className="admin-auth-page">
      <motion.div
        className="admin-auth-shell"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Left — brand & visual */}
        <div className="admin-auth-visual-col">
          <div className="admin-auth-visual-art" aria-hidden="true">
            <span className="admin-auth-visual-orb admin-auth-visual-orb--1" />
            <span className="admin-auth-visual-orb admin-auth-visual-orb--2" />
            <span className="admin-auth-visual-orb admin-auth-visual-orb--3" />
          </div>
          <div className="admin-auth-visual-content">
            <p className="admin-auth-visual-welcome">Welcome back</p>
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
              Your premium travel
              <br />
              CRM &amp; leads hub
            </p>
          </div>
        </div>

        {/* Right — sign in */}
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

            {checkingSession ? (
              <p className="admin-auth-muted">Checking session...</p>
            ) : (
              <form className="admin-auth-form" onSubmit={handleSubmit} noValidate>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  className="admin-auth-input"
                  value={email}
                  onChange={syncInputValue(setEmail)}
                  onInput={syncInputValue(setEmail)}
                  placeholder={CRM_ADMIN_LOGIN_EMAIL}
                  required
                  autoComplete="email"
                  aria-label="Email"
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

                <button type="submit" className="admin-auth-submit" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            )}

            <p className="admin-auth-email-hint">
              Sign in with <strong>{CRM_ADMIN_LOGIN_EMAIL}</strong>. Customer emails send from{' '}
              <strong>{CRM_SENDER_EMAIL}</strong> via Outlook.
            </p>

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
