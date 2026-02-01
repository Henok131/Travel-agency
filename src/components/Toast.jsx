import React, { useState, useEffect } from 'react'
import './Toast.css'

export const ToastContext = React.createContext()

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    // Return a no-op toast if not in provider (for backwards compatibility)
    return {
      success: () => {},
      error: () => {},
      info: () => {},
      warning: () => {},
      showToast: () => {}
    }
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random()
    const toast = { id, message, type, duration }
    
    setToasts(prev => [...prev, toast])
    
    setTimeout(() => {
      removeToast(id)
    }, duration)
    
    return id
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (message, duration) => showToast(message, 'success', duration)
  const error = (message, duration) => showToast(message, 'error', duration)
  const info = (message, duration) => showToast(message, 'info', duration)
  const warning = (message, duration) => showToast(message, 'warning', duration)

  return (
    <ToastContext.Provider value={{ success, error, info, warning, showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            onClick={() => removeToast(toast.id)}
          >
            <div className="toast-content">
              <span className="toast-message">{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
