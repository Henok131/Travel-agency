import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/logo.png'
import './AdminLogin.css'

const AUTH_FROZEN = false

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const { login, isAuthenticated, resetPassword, authError, isRecoveringSession } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (AUTH_FROZEN) {
      navigate('/dashboard', { replace: true })
      return
    }
    if (isAuthenticated) {
      // Check for redirect parameter
      const redirect = searchParams.get('redirect')
      if (redirect) {
        navigate(decodeURIComponent(redirect), { replace: true })
      } else {
        navigate('/admin', { replace: true })
      }
    }
  }, [isAuthenticated, navigate, searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (loading || isRecoveringSession) return
    setLoading(true)

    const result = await login(email, password)
    
    if (result.success) {
      // Check for redirect parameter
      const redirect = searchParams.get('redirect')
      if (redirect) {
        navigate(decodeURIComponent(redirect), { replace: true })
      } else {
        navigate('/admin', { replace: true })
      }
    } else {
      setError(result.error || authError || 'Invalid credentials')
    }
    
    setLoading(false)
  }

  return (
    AUTH_FROZEN ? <></> :
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-logo">
            <img src={logo} alt="LST Travel Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
          </div>
          <h1>LST Travel</h1>
          <p>Backoffice System</p>
          <h2>Login</h2>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {(error || authError) && <div className="admin-login-error">{error || authError}</div>}
          
          <div className="admin-login-input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="Enter your email"
            />
          </div>

          <div className="admin-login-input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                textDecoration: 'underline'
              }}
            >
              Forgot password?
            </button>
          </div>

          <button 
            type="submit" 
            className="admin-login-button"
            disabled={loading || isRecoveringSession}
          >
            {loading || isRecoveringSession ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {showForgotPassword && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Reset Password</h3>
            <div style={{ marginBottom: '0.75rem' }}>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            {resetMessage && (
              <div style={{
                marginBottom: '0.75rem',
                padding: '0.5rem',
                borderRadius: '4px',
                backgroundColor: resetMessage.includes('success') ? 'var(--success-bg)' : 'var(--error-bg)',
                color: resetMessage.includes('success') ? 'var(--success-text)' : 'var(--error-text)',
                fontSize: '0.875rem'
              }}>
                {resetMessage}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={async () => {
                  if (!resetEmail) {
                    setResetMessage('Please enter your email')
                    return
                  }
                  const result = await resetPassword(resetEmail)
                  if (result.success) {
                    setResetMessage('Password reset email sent! Check your inbox.')
                  } else {
                    setResetMessage(result.error || 'Failed to send reset email')
                  }
                }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Send Reset Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false)
                  setResetEmail('')
                  setResetMessage('')
                }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="admin-login-footer">
          <p>Use your email and password to sign in</p>
          <p style={{ marginTop: '0.5rem' }}>
            Don't have an account? <Link to="/admin/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
