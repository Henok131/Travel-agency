// Simple store context - no authentication, just data access
import React, { createContext, useContext } from 'react'
import { APP_ID } from '../lib/appConfig'

const StoreContext = createContext()

export const useStore = () => {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within StoreProvider')
  }
  return context
}

export const StoreProvider = ({ children }) => {
  // Mock store removed for single-tenant Supabase-only app
  const value = {
    store: null,
    isAuthenticated: true,
    isLoading: false,
    user: { id: APP_ID, email: 'single-tenant@app.local', full_name: 'Single Tenant' },
    organization: null
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
