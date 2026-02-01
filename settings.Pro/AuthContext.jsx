import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [currentOrganization, setCurrentOrganization] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        loadUserOrganization(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        loadUserOrganization(session.user.id)
      } else {
        setCurrentOrganization(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load user's organization
  const loadUserOrganization = async (userId) => {
    try {
      // Get user's organization membership
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', userId)
        .single()

      if (membershipError) {
        console.error('Error loading membership:', membershipError)
        setLoading(false)
        return
      }

      if (!membership) {
        console.log('No organization membership found')
        setLoading(false)
        return
      }

      // Get organization details
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', membership.organization_id)
        .single()

      if (orgError) {
        console.error('Error loading organization:', orgError)
        setLoading(false)
        return
      }

      setCurrentOrganization({
        ...organization,
        userRole: membership.role
      })
    } catch (err) {
      console.error('Error in loadUserOrganization:', err)
    } finally {
      setLoading(false)
    }
  }

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error signing in:', error)
      return { data: null, error }
    }
  }

  // Sign up with email and password
  const signUp = async (email, password, fullName, organizationName) => {
    try {
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (authError) throw authError

      // 2. Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([
          {
            name: organizationName,
            slug: organizationName.toLowerCase().replace(/\s+/g, '-'),
          },
        ])
        .select()
        .single()

      if (orgError) throw orgError

      // 3. Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: authData.user.id,
            email: email,
            full_name: fullName,
          },
        ])

      if (profileError) throw profileError

      // 4. Add user to organization as owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert([
          {
            organization_id: orgData.id,
            user_id: authData.user.id,
            role: 'owner',
          },
        ])

      if (memberError) throw memberError

      return { data: authData, error: null }
    } catch (error) {
      console.error('Error signing up:', error)
      return { data: null, error }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setCurrentOrganization(null)
      setSession(null)

      return { error: null }
    } catch (error) {
      console.error('Error signing out:', error)
      return { error }
    }
  }

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Error resetting password:', error)
      return { error }
    }
  }

  // Update password
  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Error updating password:', error)
      return { error }
    }
  }

  const value = {
    user,
    session,
    currentOrganization,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    loadUserOrganization,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
