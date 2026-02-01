import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/logo.png'
import './AdminLogin.css'

const AUTH_FROZEN = false

function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (AUTH_FROZEN) {
      navigate('/dashboard', { replace: true })
      return
    }
    if (isAuthenticated) {
      navigate('/admin', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email || !password || !fullName || !organizationName) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const result = await signUp(email, password, fullName, organizationName)
    
    if (result.success && result.user) {
      // Call backend to finish signup (create org/profile/member with service role)
      try {
        const resp = await fetch('/api/signup-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: result.user.id,
            full_name: fullName,
            organization_name: organizationName,
            email
          })
        })
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}))
          throw new Error(err.error || 'Signup completion failed')
        }
        navigate('/admin', { replace: true })
      } catch (err) {
        setError(err.message || 'Failed to finalize signup')
      }
    } else {
      setError(result.error || 'Failed to create account')
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
          <h2>Create Account</h2>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && <div className="admin-login-error">{error}</div>}
          
          <div className="admin-login-input-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Enter your full name"
            />
          </div>

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
            <label htmlFor="organizationName">Organization Name</label>
            <input
              id="organizationName"
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              required
              placeholder="Enter your organization name"
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
              autoComplete="new-password"
              placeholder="Enter your password (min 6 characters)"
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>
            Already have an account? <Link to="/admin/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUp
