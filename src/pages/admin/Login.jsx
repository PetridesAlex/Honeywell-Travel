import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
        navigate('/admin/leads', { replace: true })
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

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    })

    if (signInError) {
      setError(signInError.message || 'Login failed. Please check your credentials.')
      setLoading(false)
      return
    }

    navigate('/admin/leads', { replace: true })
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <p className="admin-login-eyebrow">Honeywell Travel Admin</p>
        <h1>Admin Login</h1>
        <p className="admin-login-subtitle">Secure access to CRM leads dashboard.</p>

        {checkingSession ? (
          <p className="admin-login-muted">Checking session...</p>
        ) : (
          <form className="admin-login-form" onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="username"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
              />
            </label>

            {error ? <p className="admin-login-error">{error}</p> : null}

            <button type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login
