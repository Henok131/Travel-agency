import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import logo from '../assets/logo.png'
import './AdminLogin.css'

const AUTH_FROZEN = false

function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isProcessingToken, setIsProcessingToken] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const setSessionWithRetry = async (accessToken, refreshToken) => {
    const maxAttempts = 3
    let delay = 200
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const result = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        })
        return result
      } catch (err) {
        if (err?.name === 'AbortError' || err?.message?.toLowerCase?.().includes('abort')) {
          if (i < maxAttempts - 1) {
            await new Promise(res => setTimeout(res, delay))
            delay *= 2
            continue
          }
        }
        throw err
      }
    }
  }

  useEffect(() => {
    if (AUTH_FROZEN) {
      navigate('/dashboard', { replace: true })
      return
    }
    let mounted = true

    // Parse URL hash parameters
    const hashParams = new URLSearchParams(location.hash.substring(1))
    const refreshToken = hashParams.get('refresh_token')
    
    // Check for error parameters first (Supabase sends errors in hash)
    const errorParam = hashParams.get('error')
    const errorCode = hashParams.get('error_code')
    const errorDescription = hashParams.get('error_description')

    if (errorParam) {
      // Handle error cases
      let errorMessage = 'Invalid or expired reset link.'
      
      if (errorCode === 'otp_expired') {
        errorMessage = 'This password reset link has expired. Please request a new one.'
      } else if (errorCode === 'access_denied') {
        errorMessage = errorDescription 
          ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
          : 'Access denied. The reset link may be invalid or expired.'
      } else if (errorDescription) {
        errorMessage = decodeURIComponent(errorDescription.replace(/\+/g, ' '))
      }
      
      if (mounted) {
        setError(errorMessage)
        setIsValidToken(false)
        setIsProcessingToken(false)
      }
      return
    }

    // Check if we have a recovery token in the URL hash
    // Supabase sends tokens in the hash: #access_token=...&type=recovery
    const accessToken = hashParams.get('access_token')
    const type = hashParams.get('type')

    // If we have a recovery token, show the form immediately
    // We'll validate and set the session when user submits
    if (accessToken && type === 'recovery') {
      // Show form immediately - no need to wait
      setIsValidToken(true)
      setIsProcessingToken(false)
      setError('')
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'H1',
          location: 'ResetPassword.jsx:useEffect',
          message: 'Parsed reset token from URL',
          data: {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            type
          },
          timestamp: Date.now()
        })
      }).catch(() => {})
      // #endregion
      // Don't set session here - we'll do it in handleSubmit to avoid conflicts
    } else {
      // No token - show error
      setIsProcessingToken(false)
      setIsValidToken(false)
      setError('Invalid reset link. Please check your email for the correct link.')
    }

    return () => {
      mounted = false
    }
  }, [location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate passwords
      if (password.length < 6) {
        setError('Password must be at least 6 characters long')
        setLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      // Get the token from URL hash
      const hashParams = new URLSearchParams(location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (!accessToken) {
        setError('No valid reset token found. Please request a new reset link.')
        setLoading(false)
        return
      }
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'H2',
          location: 'ResetPassword.jsx:handleSubmit',
          message: 'Submitting reset',
          data: {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            passwordLength: password.length,
            confirmLength: confirmPassword.length
          },
          timestamp: Date.now()
        })
      }).catch(() => {})
      // #endregion

      // Try setSession with retry; if it still fails, fall back to REST
      let sessionSucceeded = false
      let sessionErrorMessage = ''
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'run2',
            hypothesisId: 'H3',
            location: 'ResetPassword.jsx:handleSubmit',
            message: 'Calling setSession (with retry helper)',
            data: { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken },
            timestamp: Date.now()
          })
        }).catch(() => {})
        // #endregion
        const result = await setSessionWithRetry(accessToken, refreshToken)
        sessionSucceeded = !!result?.data?.session && !result?.error
        if (result?.error) {
          sessionErrorMessage = result.error.message || 'setSession error'
        }
      } catch (err) {
        sessionErrorMessage = err?.message || 'setSession threw'
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'run2',
            hypothesisId: 'H3',
            location: 'ResetPassword.jsx:handleSubmit',
            message: 'setSession threw',
            data: { name: err?.name || 'unknown', message: err?.message || 'unknown' },
            timestamp: Date.now()
          })
        }).catch(() => {})
        // #endregion
      }

      if (sessionSucceeded) {
        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        })

        if (updateError) {
          console.error('Password update error:', updateError)
          setError(updateError.message || 'Failed to update password. Please try again.')
          setLoading(false)
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: 'debug-session',
              runId: 'run2',
              hypothesisId: 'H4',
              location: 'ResetPassword.jsx:handleSubmit',
              message: 'Password update error (session path)',
              data: { message: updateError.message },
              timestamp: Date.now()
            })
          }).catch(() => {})
          // #endregion
          return
        }

        // Success via session path
        setSuccess(true)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'run2',
            hypothesisId: 'H4',
            location: 'ResetPassword.jsx:handleSubmit',
            message: 'Password updated via session path',
            data: {},
            timestamp: Date.now()
          })
        }).catch(() => {})
        // #endregion
        setTimeout(() => {
          navigate('/admin/login', { replace: true })
        }, 2000)
        return
      }

      // Fall back to REST if session failed/aborted
      if (sessionErrorMessage) {
        setError('Session failed. Trying alternative reset path...')
      }

      // Supabase REST: POST {supabaseUrl}/auth/v1/user with Authorization: Bearer <access_token> and apikey
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        setError('Missing Supabase configuration.')
        setLoading(false)
        return
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'run3',
          hypothesisId: 'H3',
          location: 'ResetPassword.jsx:handleSubmit',
          message: 'Calling auth/v1/user with bearer',
          data: { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken },
          timestamp: Date.now()
        })
      }).catch(() => {})
      // #endregion

      const resp = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ password })
      })

      if (!resp.ok) {
        const errText = await resp.text()
        console.error('Password update failed', errText)
        setError('Failed to update password. Please request a new reset link.')
        setLoading(false)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'run3',
            hypothesisId: 'H4',
            location: 'ResetPassword.jsx:handleSubmit',
            message: 'Password update REST failed',
            data: { status: resp.status, body: errText?.slice(0, 200) || '' },
            timestamp: Date.now()
          })
        }).catch(() => {})
        // #endregion
        return
      }

      // Success!
      setSuccess(true)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'run3',
          hypothesisId: 'H4',
          location: 'ResetPassword.jsx:handleSubmit',
          message: 'Password updated via REST',
          data: {},
          timestamp: Date.now()
        })
      }).catch(() => {})
      // #endregion

      setTimeout(() => {
        navigate('/admin/login', { replace: true })
      }, 2000)
    } catch (err) {
      console.error('Unexpected error:', err)
      setError(err.message || 'An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  // Show loading state while processing token
  if (isProcessingToken && !isValidToken && !success) {
    return AUTH_FROZEN ? <></> : (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-login-logo">
              <img src={logo} alt="LST Travel Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
            </div>
            <h1>LST Travel</h1>
            <p>Backoffice System</p>
            <h2>Reset Password</h2>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9375rem' }}>
              Verifying reset link...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!isValidToken && !success) {
    return AUTH_FROZEN ? <></> : (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-login-logo">
              <img src={logo} alt="LST Travel Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
            </div>
            <h1>LST Travel</h1>
            <p>Backoffice System</p>
            <h2>Reset Password</h2>
          </div>

          {error && (
            <div className="admin-login-error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9375rem', lineHeight: '1.5' }}>
              {error 
                ? 'Please request a new password reset link from the login page.'
                : 'Invalid or expired reset link. Please request a new one from the login page.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => navigate('/admin/login')}
                className="admin-login-button"
              >
                Back to Login
              </button>
              <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
                You can request a new reset link from the login page.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return AUTH_FROZEN ? <></> : (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-login-logo">
              <img src={logo} alt="LST Travel Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
            </div>
            <h1>LST Travel</h1>
            <p>Backoffice System</p>
            <h2>Password Reset Successful</h2>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <p style={{ color: '#1a4d3a', marginBottom: '1rem', fontSize: '1rem' }}>
              Your password has been successfully updated!
            </p>
            <p style={{ color: '#666', fontSize: '0.875rem' }}>
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    AUTH_FROZEN ? <></> : (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-login-logo">
              <img src={logo} alt="LST Travel Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
            </div>
            <h1>LST Travel</h1>
            <p>Backoffice System</p>
            <h2>Reset Password</h2>
          </div>

          <form onSubmit={handleSubmit} className="admin-login-form">
            {error && <div className="admin-login-error">{error}</div>}
            
            <div className="admin-login-input-group">
              <label htmlFor="password">New Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Enter your new password"
                minLength={6}
              />
            </div>

            <div className="admin-login-input-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Confirm your new password"
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              className="admin-login-button"
              disabled={loading}
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>

          <div className="admin-login-footer">
            <p>Remember your password? <button 
              type="button"
              onClick={() => navigate('/admin/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#1a4d3a',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
                fontSize: '0.75rem'
              }}
            >
              Back to Login
            </button></p>
          </div>
        </div>
      </div>
    )
  )
}

export default ResetPassword
