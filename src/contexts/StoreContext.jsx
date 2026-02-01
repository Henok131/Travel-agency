// Simple store context - no authentication, just data access
import React, { createContext, useContext, useState, useEffect } from 'react'
import { mockStore } from '../store/mockStore'

const StoreContext = createContext()

export const useStore = () => {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within StoreProvider')
  }
  return context
}

export const StoreProvider = ({ children }) => {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    // Subscribe to store changes to trigger re-renders
    const unsubscribe = mockStore.subscribe(() => {
      forceUpdate(prev => prev + 1)
    })
    return unsubscribe
  }, [])

  const value = {
    store: mockStore,
    // Legacy compatibility - provide simple auth-like interface
    isAuthenticated: true,
    isLoading: false,
    user: { id: 'user-1', email: 'user@local', full_name: 'Local User' },
    organization: { id: 'org-1', name: 'Local Organization' }
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
