import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AUTH_FROZEN = false
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.VITE_DISABLE_AUTH === 'true'
const DEV_USER = { id: 'dev-user', email: 'dev@local', full_name: 'Dev User', organization_id: '00000000-0000-0000-0000-000000000000', role: 'owner' }
const DEV_ORG = { id: '00000000-0000-0000-0000-000000000000', name: 'Development Organization' }

const mapAuthError = (error) => {
  if (!error) return 'Unexpected error'
  const message = error?.message || ''
  const code = error?.code || ''
  const name = error?.name || ''

  if (name === 'AbortError' || message.toLowerCase().includes('abort')) {
    return 'Network interrupted. Please try again.'
  }

  const normalized = `${code} ${message}`.toLowerCase()
  if (normalized.includes('invalid login credentials') || normalized.includes('invalid email or password')) {
    return 'Email or password is incorrect.'
  }
  if (normalized.includes('email not confirmed')) {
    return 'Please confirm your email before signing in.'
  }
  if (normalized.includes('too many requests')) {
    return 'Too many attempts. Please wait and try again.'
  }
  return message || 'Unexpected error'
}

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [mockRequests, setMockRequests] = useState([])
  if (AUTH_FROZEN) {
    const frozenValue = {
      isAuthenticated: true,
      isLoading: false,
      isRecoveringSession: false,
      authError: '',
      user: DEV_USER,
      organization: DEV_ORG,
      userProfile: DEV_USER,
      mockRequests,
      setMockRequests,
      signUp: async () => ({ success: true, user: DEV_USER }),
      signIn: async () => ({ success: true }),
      signOut: async () => ({ success: true }),
      resetPassword: async () => ({ success: true }),
      updateProfile: async () => ({ success: true }),
      switchOrganization: async () => ({ success: true }),
      login: async () => ({ success: true }),
      logout: async () => ({ success: true }),
      session: async () => ({ user: DEV_USER }),
      organizationId: DEV_ORG.id
    }
    return <AuthContext.Provider value={frozenValue}>{children}</AuthContext.Provider>
  }

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRecoveringSession, setIsRecoveringSession] = useState(false)
  const [user, setUser] = useState(null)
  const [organization, setOrganization] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [authError, setAuthError] = useState('')
  const [authOpInFlight, setAuthOpInFlight] = useState(false)

  const withRetry = async (fn, { attempts = 3, delayMs = 300, backoff = 2 } = {}) => {
    if (AUTH_FROZEN) return fn()
    let lastErr
    let currentDelay = delayMs
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn()
      } catch (err) {
        lastErr = err
        // Retry on AbortError or network-like errors
        if (err?.name === 'AbortError' || err?.message?.toLowerCase?.().includes('abort')) {
          if (i < attempts - 1) {
            await new Promise(res => setTimeout(res, currentDelay))
            currentDelay *= backoff
            continue
          }
        }
        throw err
      }
    }
    throw lastErr
  }

  // Check for existing session on mount
  useEffect(() => {
    if (DEV_MODE) {
      setIsAuthenticated(true)
      setUser(DEV_USER)
      setOrganization(DEV_ORG)
      setUserProfile(DEV_USER)
      setIsLoading(false)
      return
    }
    checkSession()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (authOpInFlight) return
      if (event === 'SIGNED_IN' && session) {
        await loadUserData(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        setUser(null)
        setOrganization(null)
        setUserProfile(null)
        setAuthError('')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkSession = async () => {
    if (DEV_MODE) return
    if (authOpInFlight) return
    try {
      setIsRecoveringSession(true)
      const { data: { session } } = await withRetry(() => supabase.auth.getSession(), { attempts: 3, delayMs: 200 })
      if (session?.user) {
        await loadUserData(session.user.id)
      } else {
        setIsAuthenticated(false)
        setUser(null)
        setOrganization(null)
        setUserProfile(null)
      }
      setAuthError('')
    } catch (error) {
      console.error('Error checking session:', error)
      setIsAuthenticated(false)
      setUser(null)
      setOrganization(null)
      setUserProfile(null)
      setAuthError(mapAuthError(error))
    } finally {
      setIsRecoveringSession(false)
      setIsLoading(false)
    }
  }

  const loadUserData = async (userId) => {
    if (DEV_MODE) {
      setUser(DEV_USER)
      setOrganization(DEV_ORG)
      setUserProfile(DEV_USER)
      setIsAuthenticated(true)
      setAuthError('')
      return
    }
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'loadUserData',
          hypothesisId: 'H1',
          location: 'AuthContext.jsx:loadUserData',
          message: 'Starting loadUserData',
          data: { userId },
          timestamp: Date.now()
        })
      }).catch(() => {})
      // #endregion

      // Get auth user info first
      const { data: { user: authUser }, error: authUserError } = await withRetry(() => supabase.auth.getUser(), { attempts: 2, delayMs: 100 })
      if (authUserError) throw authUserError
      if (!authUser) throw new Error('No authenticated user')

      const userEmail = authUser.email || ''
      const userFullName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User'

      // Try to get user profile with organization
      let profile
      const { data: profileData, error: profileError } = await withRetry(() => supabase
        .from('user_profiles')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('id', userId)
        .single(), { attempts: 2, delayMs: 100 })
      
      profile = profileData

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'loadUserData',
          hypothesisId: 'H1',
          location: 'AuthContext.jsx:loadUserData',
          message: 'Profile query result',
          data: { hasProfile: !!profile, errorCode: profileError?.code, errorMessage: profileError?.message?.slice(0, 100) },
          timestamp: Date.now()
        })
      }).catch(() => {})
      // #endregion

      // If profile doesn't exist (PGRST116 = not found), create it with default organization
      if (profileError && profileError.code === 'PGRST116') {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'loadUserData',
            hypothesisId: 'H2',
            location: 'AuthContext.jsx:loadUserData',
            message: 'Profile missing, creating default',
            data: { userId, email: userEmail },
            timestamp: Date.now()
          })
        }).catch(() => {})
        // #endregion

        // Create default organization for user
        const defaultOrgName = `${userFullName}'s Organization`
        const slug = defaultOrgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + userId.substring(0, 8)
        
        const { data: org, error: orgError } = await withRetry(() => supabase
          .from('organizations')
          .insert([{ name: defaultOrgName, slug }])
          .select()
          .single(), { attempts: 3, delayMs: 200 })

        if (orgError) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: 'debug-session',
              runId: 'loadUserData',
              hypothesisId: 'H2',
              location: 'AuthContext.jsx:loadUserData',
              message: 'Failed to create org',
              data: { errorCode: orgError.code, errorMessage: orgError.message?.slice(0, 100) },
              timestamp: Date.now()
            })
          }).catch(() => {})
          // #endregion
          throw new Error(`Failed to create organization: ${orgError.message}`)
        }

        // Create user profile
        const { error: profileCreateError } = await withRetry(() => supabase
          .from('user_profiles')
          .insert([{
            id: userId,
            email: userEmail,
            full_name: userFullName
          }]), { attempts: 3, delayMs: 200 })

        if (profileCreateError) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: 'debug-session',
              runId: 'loadUserData',
              hypothesisId: 'H2',
              location: 'AuthContext.jsx:loadUserData',
              message: 'Failed to create profile',
              data: { errorCode: profileCreateError.code, errorMessage: profileCreateError.message?.slice(0, 100) },
              timestamp: Date.now()
            })
          }).catch(() => {})
          // #endregion
          throw new Error(`Failed to create profile: ${profileCreateError.message}`)
        }

        // Add user as owner in organization_members
        const { error: memberError } = await withRetry(() => supabase
          .from('organization_members')
          .insert([{
            user_id: userId,
            organization_id: org.id,
            role: 'owner'
          }]), { attempts: 3, delayMs: 200 })

        if (memberError) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: 'debug-session',
              runId: 'loadUserData',
              hypothesisId: 'H2',
              location: 'AuthContext.jsx:loadUserData',
              message: 'Failed to create member',
              data: { errorCode: memberError.code, errorMessage: memberError.message?.slice(0, 100) },
              timestamp: Date.now()
            })
          }).catch(() => {})
          // #endregion
          throw new Error(`Failed to create organization membership: ${memberError.message}`)
        }

        // Reload profile with organization
        const { data: newProfile, error: reloadError } = await withRetry(() => supabase
          .from('user_profiles')
          .select(`
            *,
            organization:organizations(*)
          `)
          .eq('id', userId)
          .single(), { attempts: 2, delayMs: 100 })

        if (reloadError) throw reloadError
        profile = newProfile
      } else if (profileError) {
        // Handle other RLS/permission errors gracefully
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'loadUserData',
            hypothesisId: 'H3',
            location: 'AuthContext.jsx:loadUserData',
            message: 'Profile query RLS error',
            data: { errorCode: profileError.code, errorMessage: profileError.message?.slice(0, 100) },
            timestamp: Date.now()
          })
        }).catch(() => {})
        // #endregion
        
        // Check if it's an AbortError or RLS denial
        if (profileError.message?.includes('aborted') || profileError.code === 'PGRST301') {
          setAuthError('Database access denied. Please contact support.')
          setIsAuthenticated(false)
          return
        }
        throw profileError
      }

      // Get organization membership
      if (profile?.organization_id) {
        const { data: member, error: memberError } = await withRetry(() => supabase
          .from('organization_members')
          .select('*, organization:organizations(*)')
          .eq('user_id', userId)
          .eq('organization_id', profile.organization_id)
          .single(), { attempts: 2, delayMs: 100 })

        if (!memberError && member?.organization) {
          setOrganization(member.organization)
          setUserProfile({ ...profile, role: member.role })
        } else if (memberError && memberError.code !== 'PGRST116') {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: 'debug-session',
              runId: 'loadUserData',
              hypothesisId: 'H3',
              location: 'AuthContext.jsx:loadUserData',
              message: 'Member query error',
              data: { errorCode: memberError.code, errorMessage: memberError.message?.slice(0, 100) },
              timestamp: Date.now()
            })
          }).catch(() => {})
          // #endregion
          // Member missing but org exists - create membership
          if (memberError.code === 'PGRST116' && profile.organization_id) {
            const { error: createMemberError } = await withRetry(() => supabase
              .from('organization_members')
              .insert([{
                user_id: userId,
                organization_id: profile.organization_id,
                role: 'owner'
              }]), { attempts: 2, delayMs: 100 })
            
            if (!createMemberError) {
              // Reload member
              const { data: newMember } = await supabase
                .from('organization_members')
                .select('*, organization:organizations(*)')
                .eq('user_id', userId)
                .eq('organization_id', profile.organization_id)
                .single()
              
              if (newMember?.organization) {
                setOrganization(newMember.organization)
                setUserProfile({ ...profile, role: newMember.role })
              } else {
                setOrganization(profile.organization || null)
                setUserProfile(profile)
              }
            } else {
              setOrganization(profile.organization || null)
              setUserProfile(profile)
            }
          } else {
            setOrganization(profile.organization || null)
            setUserProfile(profile)
          }
        } else {
          setOrganization(profile.organization || null)
          setUserProfile(profile)
        }
      } else {
        // Try to get first organization membership
        const { data: members, error: membersError } = await withRetry(() => supabase
          .from('organization_members')
          .select('*, organization:organizations(*)')
          .eq('user_id', userId)
          .limit(1)
          .single(), { attempts: 2, delayMs: 100 })

        if (!membersError && members?.organization) {
          setOrganization(members.organization)
          setUserProfile({ ...profile, role: members.role })
        } else {
          setUserProfile(profile)
        }
      }

      setUser(authUser)
      setIsAuthenticated(true)
      setAuthError('')
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'loadUserData',
          hypothesisId: 'H1',
          location: 'AuthContext.jsx:loadUserData',
          message: 'loadUserData success',
          data: { hasOrg: !!profile?.organization_id, hasProfile: !!profile },
          timestamp: Date.now()
        })
      }).catch(() => {})
      // #endregion
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'loadUserData',
          hypothesisId: 'H4',
          location: 'AuthContext.jsx:loadUserData',
          message: 'loadUserData error',
          data: { errorName: error?.name, errorMessage: error?.message?.slice(0, 200) },
          timestamp: Date.now()
        })
      }).catch(() => {})
      // #endregion
      
      console.error('Error loading user data:', error)
      setIsAuthenticated(false)
      setUser(null)
      setOrganization(null)
      setUserProfile(null)
      
      // Map error to user-friendly message
      if (error.message?.includes('aborted') || error.name === 'AbortError') {
        setAuthError('Network interrupted. Please try again.')
      } else if (error.message?.includes('RLS') || error.message?.includes('permission') || error.message?.includes('denied')) {
        setAuthError('Access denied. Please contact support to set up your account.')
      } else {
        setAuthError(`Setup error: ${error.message || 'Unknown error'}`)
      }
    }
  }

  const signUp = async (email, password, fullName, organizationName) => {
    if (DEV_MODE) return { success: true, user: { id: 'dev-user' } }
    if (authOpInFlight) return { success: false, error: 'Another auth operation is in progress' }
    try {
      setAuthOpInFlight(true)
      const { data: authData, error: authError } = await withRetry(() => supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      }), { attempts: 3, delayMs: 200 })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user')

      // Do not create org/profile here (RLS). This will be done via server /api/signup-complete
      return { success: true, user: authData.user }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: mapAuthError(error) }
    } finally {
      setAuthOpInFlight(false)
    }
  }

  const signIn = async (email, password) => {
    if (DEV_MODE) return { success: true }
    if (authOpInFlight) {
      return { success: false, error: 'Login already in progress' }
    }
    try {
      setAuthOpInFlight(true)
      const { data, error } = await withRetry(() => supabase.auth.signInWithPassword({
        email,
        password
      }), { attempts: 3, delayMs: 200 })

      if (error) throw error
      if (!data.user) throw new Error('Failed to sign in')

      await loadUserData(data.user.id)
      return { success: true }
    } catch (error) {
      console.error('Sign in error:', error)
      const msg = mapAuthError(error)
      setAuthError(msg)
      return { success: false, error: msg }
    } finally {
      setAuthOpInFlight(false)
    }
  }

  const signOut = async () => {
    if (DEV_MODE) return { success: true }
    if (authOpInFlight) return
    try {
      setAuthOpInFlight(true)
      const { error } = await withRetry(() => supabase.auth.signOut(), { attempts: 2, delayMs: 150 })
      if (error) throw error
      
      setIsAuthenticated(false)
      setUser(null)
      setOrganization(null)
      setUserProfile(null)
      setAuthError('')
    } catch (error) {
      console.error('Sign out error:', error)
      setAuthError(mapAuthError(error))
    } finally {
      setAuthOpInFlight(false)
    }
  }

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Reset password error:', error)
      return { success: false, error: error.message }
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user?.id) throw new Error('No user logged in')
      
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error
      await loadUserData(user.id)
      return { success: true }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, error: error.message }
    }
  }

  const switchOrganization = async (orgId) => {
    try {
      const { data: member, error } = await supabase
        .from('organization_members')
        .select('*, organization:organizations(*)')
        .eq('user_id', user.id)
        .eq('organization_id', orgId)
        .single()

      if (error) throw error
      if (!member?.organization) throw new Error('Organization not found')

      setOrganization(member.organization)
      setUserProfile(prev => ({ ...prev, role: member.role }))
      
      // Update user profile organization_id
      await supabase
        .from('user_profiles')
        .update({ organization_id: orgId })
        .eq('id', user.id)

      return { success: true }
    } catch (error) {
      console.error('Switch organization error:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    isAuthenticated,
    isLoading,
    isRecoveringSession,
    authError,
    user,
    organization,
    userProfile,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    switchOrganization,
    // Legacy compatibility
    login: signIn,
    logout: signOut,
    // Provide session for direct Supabase operations
    session: async () => {
      if (DEV_MODE) return { user: DEV_USER }
      const { data: { session } } = await supabase.auth.getSession()
      return session
    },
    // Provide organization_id for inserts
    organizationId: DEV_MODE ? DEV_ORG.id : organization?.id || null
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
