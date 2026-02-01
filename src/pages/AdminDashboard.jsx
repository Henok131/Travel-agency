import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import ManageTimeSlots from '../components/Admin/ManageTimeSlots'
import ViewBookings from '../components/Admin/ViewBookings'
import PublicBookingView from '../components/Admin/PublicBookingView'
import './AdminDashboard.css'

function AdminDashboard() {
  const { isAuthenticated, isLoading, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('bookings')
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Authentication removed - page is now public

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="admin-dashboard">
      {/* Mobile Header */}
      <header className="admin-header-mobile">
        <div className="admin-header-mobile-content">
          <div className="admin-logo-mobile">
            <h1>KINGSTYLE</h1>
            <p>HAIR & COSMETICS</p>
          </div>
          <button 
            className="admin-menu-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {showMobileMenu ? (
                <path d="M18 6L6 18M6 6l12 12"/>
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18"/>
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-logo">
            <h1>KINGSTYLE</h1>
            <div className="admin-logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <p>HAIR & COSMETICS</p>
          </div>
          
          <div className="admin-header-actions">
            <button className="admin-logout-btn" onClick={handleLogout}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="admin-mobile-menu-overlay" onClick={() => setShowMobileMenu(false)}>
          <div className="admin-mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="admin-mobile-menu-header">
              <h2>Menu</h2>
              <button onClick={() => setShowMobileMenu(false)}>✕</button>
            </div>
            <nav className="admin-mobile-nav">
              <button 
                className={activeTab === 'bookings' ? 'active' : ''}
                onClick={() => { setActiveTab('bookings'); setShowMobileMenu(false); }}
              >
                View Bookings
              </button>
              <button 
                className={activeTab === 'time-slots' ? 'active' : ''}
                onClick={() => { setActiveTab('time-slots'); setShowMobileMenu(false); }}
              >
                Manage Time Slots
              </button>
              <button 
                className={activeTab === 'public-view' ? 'active' : ''}
                onClick={() => { setActiveTab('public-view'); setShowMobileMenu(false); }}
              >
                Public View
              </button>
              <button onClick={handleLogout}>Logout</button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="admin-main">
        {/* Desktop Navigation Tabs */}
        <div className="admin-tabs-desktop">
          <button 
            className={activeTab === 'bookings' ? 'active' : ''}
            onClick={() => setActiveTab('bookings')}
          >
            View Bookings
          </button>
          <button 
            className={activeTab === 'time-slots' ? 'active' : ''}
            onClick={() => setActiveTab('time-slots')}
          >
            Manage Time Slots
          </button>
          <button 
            className={activeTab === 'public-view' ? 'active' : ''}
            onClick={() => setActiveTab('public-view')}
          >
            Public View
          </button>
        </div>

        {/* Tab Content */}
        <div className="admin-content">
          {activeTab === 'bookings' && <ViewBookings />}
          {activeTab === 'time-slots' && <ManageTimeSlots />}
          {activeTab === 'public-view' && <PublicBookingView />}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
