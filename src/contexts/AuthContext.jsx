import React, { createContext, useContext } from 'react'
import { APP_ID } from '../lib/appConfig'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Single-tenant: no authentication. Provide fixed APP_ID as the user.
const FIXED_USER = {
  id: APP_ID,
  email: 'single-tenant@app.local',
  full_name: 'Single Tenant App User',
  role: 'owner'
}

export const AuthProvider = ({ children }) => {
  const value = {
    isAuthenticated: true,
    isLoading: false,
    isRecoveringSession: false,
    authError: '',
    user: FIXED_USER,
    organization: null,
    userProfile: FIXED_USER,
    mockRequests: [],
    setMockRequests: () => {},
    signUp: async () => ({ success: true, user: FIXED_USER }),
    signIn: async () => ({ success: true, user: FIXED_USER }),
    signOut: async () => ({ success: true }),
    resetPassword: async () => ({ success: true }),
    updateProfile: async () => ({ success: true, user: FIXED_USER }),
    switchOrganization: async () => ({ success: true }),
    login: async () => ({ success: true, user: FIXED_USER }),
    logout: async () => ({ success: true }),
    session: async () => ({ user: FIXED_USER }),
    organizationId: null
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

