import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/logo.png'
import './SettingsPro.css'

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">
        {type === 'success' && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
        {type === 'error' && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        )}
        {type === 'info' && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        )}
      </div>
      <div className="toast-content">
        <p>{message}</p>
      </div>
    </div>
  )
}

// Confirmation Modal Component
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', danger = false }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onCancel}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

function SettingsPro() {
  // Get current user from auth context
  const { user, currentOrganization } = useAuth() || {}
  
  // State management
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false })
  
  // Profile state
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    avatar_url: '',
    phone: '',
    timezone: 'UTC'
  })
  
  // Organization state
  const [organization, setOrganization] = useState({
    name: '',
    logo_url: '',
    currency: 'EUR',
    date_format: 'DD/MM/YYYY',
    language: 'en',
    time_zone: 'Europe/Berlin'
  })
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    language: 'en',
    theme: 'dark',
    notifications_enabled: true,
    email_notifications: true,
    auto_save: true,
    default_date_filter: 'thisMonth'
  })
  
  // Security state
  const [passwordChange, setPasswordChange] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  
  // Load data on mount
  useEffect(() => {
    loadUserProfile()
    loadOrganizationSettings()
    loadPreferences()
  }, [user])

  // Load user profile
  const loadUserProfile = async () => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: data.email || user.email || '',
          avatar_url: data.avatar_url || '',
          phone: data.phone || '',
          timezone: data.timezone || 'UTC'
        })
      } else {
        // Create profile if doesn't exist
        setProfile({
          full_name: '',
          email: user.email || '',
          avatar_url: '',
          phone: '',
          timezone: 'UTC'
        })
      }
    } catch (err) {
      console.error('Error loading profile:', err)
      showToast('Failed to load profile', 'error')
    }
  }

  // Load organization settings
  const loadOrganizationSettings = async () => {
    if (!currentOrganization?.id) return
    
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', currentOrganization.id)
        .single()
      
      if (error) throw error
      
      if (data) {
        setOrganization({
          name: data.name || '',
          logo_url: data.logo_url || '',
          currency: data.currency || 'EUR',
          date_format: data.date_format || 'DD/MM/YYYY',
          language: data.language || 'en',
          time_zone: data.time_zone || 'Europe/Berlin'
        })
      }
    } catch (err) {
      console.error('Error loading organization:', err)
      showToast('Failed to load organization settings', 'error')
    }
  }

  // Load preferences from localStorage
  const loadPreferences = () => {
    const saved = localStorage.getItem('userPreferences')
    if (saved) {
      try {
        setPreferences(JSON.parse(saved))
      } catch (err) {
        console.error('Error loading preferences:', err)
      }
    }
  }

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type })
  }

  // Update user profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          timezone: profile.timezone,
          updated_at: new Date().toISOString()
        })
      
      if (error) throw error
      
      showToast('Profile updated successfully', 'success')
    } catch (err) {
      console.error('Error updating profile:', err)
      showToast('Failed to update profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Update organization settings
  const handleOrganizationUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: organization.name,
          currency: organization.currency,
          date_format: organization.date_format,
          language: organization.language,
          time_zone: organization.time_zone,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentOrganization.id)
      
      if (error) throw error
      
      showToast('Organization settings updated', 'success')
    } catch (err) {
      console.error('Error updating organization:', err)
      showToast('Failed to update organization settings', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error')
      return
    }
    
    if (file.size > 2 * 1024 * 1024) {
      showToast('File size must be less than 2MB', 'error')
      return
    }
    
    setLoading(true)
    
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath)
      
      // Update profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id)
      
      if (updateError) throw updateError
      
      setProfile({ ...profile, avatar_url: urlData.publicUrl })
      showToast('Avatar updated successfully', 'success')
    } catch (err) {
      console.error('Error uploading avatar:', err)
      showToast('Failed to upload avatar', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Handle logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error')
      return
    }
    
    if (file.size > 2 * 1024 * 1024) {
      showToast('File size must be less than 2MB', 'error')
      return
    }
    
    setLoading(true)
    
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${currentOrganization.id}-${Date.now()}.${fileExt}`
      const filePath = `logos/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath)
      
      // Update organization
      const { error: updateError } = await supabase
        .from('organizations')
        .update({ logo_url: urlData.publicUrl })
        .eq('id', currentOrganization.id)
      
      if (updateError) throw updateError
      
      setOrganization({ ...organization, logo_url: urlData.publicUrl })
      showToast('Logo updated successfully', 'success')
    } catch (err) {
      console.error('Error uploading logo:', err)
      showToast('Failed to upload logo', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Update preferences
  const handlePreferencesUpdate = (key, value) => {
    const updated = { ...preferences, [key]: value }
    setPreferences(updated)
    localStorage.setItem('userPreferences', JSON.stringify(updated))
    
    // Apply theme immediately
    if (key === 'theme') {
      document.documentElement.className = value
      document.documentElement.setAttribute('data-theme', value)
    }
    
    showToast('Preferences updated', 'success')
  }

  // Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    // Validate passwords
    if (passwordChange.new_password !== passwordChange.confirm_password) {
      showToast('Passwords do not match', 'error')
      return
    }
    
    if (passwordChange.new_password.length < 8) {
      showToast('Password must be at least 8 characters', 'error')
      return
    }
    
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordChange.new_password
      })
      
      if (error) throw error
      
      setPasswordChange({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
      
      showToast('Password changed successfully', 'success')
    } catch (err) {
      console.error('Error changing password:', err)
      showToast('Failed to change password', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Export data
  const handleExportData = async () => {
    setLoading(true)
    
    try {
      const [requests, bookings, expenses] = await Promise.all([
        supabase.from('requests').select('*').eq('organization_id', currentOrganization.id),
        supabase.from('main_table').select('*').eq('organization_id', currentOrganization.id),
        supabase.from('expenses').select('*').eq('organization_id', currentOrganization.id)
      ])
      
      const data = {
        organization: organization.name,
        exported_at: new Date().toISOString(),
        requests: requests.data || [],
        bookings: bookings.data || [],
        expenses: expenses.data || []
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${organization.name}-export-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      showToast('Data exported successfully', 'success')
    } catch (err) {
      console.error('Error exporting data:', err)
      showToast('Failed to export data', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Delete account
  const handleDeleteAccount = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Account',
      message: 'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      onConfirm: async () => {
        setLoading(true)
        try {
          // In production, this should call a backend function
          // that handles all cleanup and deletion
          const { error } = await supabase.auth.admin.deleteUser(user.id)
          
          if (error) throw error
          
          showToast('Account deleted successfully', 'success')
          
          // Redirect to login after 2 seconds
          setTimeout(() => {
            window.location.href = '/login'
          }, 2000)
        } catch (err) {
          console.error('Error deleting account:', err)
          showToast('Failed to delete account', 'error')
        } finally {
          setLoading(false)
          setConfirmModal({ isOpen: false })
        }
      },
      onCancel: () => setConfirmModal({ isOpen: false }),
      confirmText: 'Delete Account',
      cancelText: 'Cancel',
      danger: true
    })
  }

  return (
    <div className="settings-pro-container">
      {/* Toast Notifications */}
      {toast && (
        <div className="toast-container">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
      
      {/* Confirmation Modal */}
      <ConfirmModal {...confirmModal} />
      
      <div className="settings-pro-header">
        <div className="settings-pro-header-content">
          <div>
            <h1 className="settings-pro-title">Settings</h1>
            <p className="settings-pro-subtitle">Manage your account and preferences</p>
          </div>
          <Link to="/dashboard" className="btn btn-secondary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      <div className="settings-pro-layout">
        {/* Tab Navigation */}
        <nav className="settings-pro-tabs">
          <button
            className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Profile
          </button>
          
          <button
            className={`settings-tab ${activeTab === 'organization' ? 'active' : ''}`}
            onClick={() => setActiveTab('organization')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Organization
          </button>
          
          <button
            className={`settings-tab ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6"/>
            </svg>
            Preferences
          </button>
          
          <button
            className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Security
          </button>
          
          <button
            className={`settings-tab ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Data & Privacy
          </button>
        </nav>
        
        {/* Tab Content */}
        <div className="settings-pro-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Profile Information</h2>
                <p>Update your personal information and profile picture</p>
              </div>
              
              <form onSubmit={handleProfileUpdate} className="settings-form">
                {/* Avatar Upload */}
                <div className="form-group avatar-group">
                  <label>Profile Picture</label>
                  <div className="avatar-upload-container">
                    <div className="avatar-preview">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" />
                      ) : (
                        <div className="avatar-placeholder">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="avatar-upload-actions">
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="avatar-upload" className="btn btn-secondary btn-sm">
                        Upload Photo
                      </label>
                      <p className="form-hint">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="full_name">Full Name</label>
                    <input
                      type="text"
                      id="full_name"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder="Enter your email"
                      disabled
                    />
                    <p className="form-hint">Email cannot be changed</p>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+49 123 456 7890"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="timezone">Time Zone</label>
                    <select
                      id="timezone"
                      value={profile.timezone}
                      onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                    >
                      <option value="UTC">UTC</option>
                      <option value="Europe/Berlin">Europe/Berlin</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="America/New_York">America/New York</option>
                      <option value="America/Los_Angeles">America/Los Angeles</option>
                      <option value="Asia/Tokyo">Asia/Tokyo</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Organization Tab */}
          {activeTab === 'organization' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Organization Settings</h2>
                <p>Manage your organization information and branding</p>
              </div>
              
              <form onSubmit={handleOrganizationUpdate} className="settings-form">
                {/* Logo Upload */}
                <div className="form-group logo-group">
                  <label>Organization Logo</label>
                  <div className="logo-upload-container">
                    <div className="logo-preview">
                      {organization.logo_url ? (
                        <img src={organization.logo_url} alt="Logo" />
                      ) : (
                        <div className="logo-placeholder">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="logo-upload-actions">
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="logo-upload" className="btn btn-secondary btn-sm">
                        Upload Logo
                      </label>
                      <p className="form-hint">PNG or SVG. Max 2MB.</p>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="org_name">Organization Name</label>
                  <input
                    type="text"
                    id="org_name"
                    value={organization.name}
                    onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
                    placeholder="Enter organization name"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="currency">Currency</label>
                    <select
                      id="currency"
                      value={organization.currency}
                      onChange={(e) => setOrganization({ ...organization, currency: e.target.value })}
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CHF">CHF (Fr)</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="date_format">Date Format</label>
                    <select
                      id="date_format"
                      value={organization.date_format}
                      onChange={(e) => setOrganization({ ...organization, date_format: e.target.value })}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="org_language">Language</label>
                    <select
                      id="org_language"
                      value={organization.language}
                      onChange={(e) => setOrganization({ ...organization, language: e.target.value })}
                    >
                      <option value="en">English</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="time_zone">Time Zone</label>
                    <select
                      id="time_zone"
                      value={organization.time_zone}
                      onChange={(e) => setOrganization({ ...organization, time_zone: e.target.value })}
                    >
                      <option value="Europe/Berlin">Europe/Berlin</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Preferences</h2>
                <p>Customize your application experience</p>
              </div>
              
              <div className="settings-list">
                <div className="settings-item">
                  <div className="settings-item-info">
                    <h3>Language</h3>
                    <p>Choose your preferred language</p>
                  </div>
                  <div className="settings-item-control">
                    <select
                      value={preferences.language}
                      onChange={(e) => handlePreferencesUpdate('language', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                </div>
                
                <div className="settings-item">
                  <div className="settings-item-info">
                    <h3>Theme</h3>
                    <p>Choose your preferred color theme</p>
                  </div>
                  <div className="settings-item-control">
                    <div className="theme-switcher">
                      <button
                        className={`theme-option ${preferences.theme === 'light' ? 'active' : ''}`}
                        onClick={() => handlePreferencesUpdate('theme', 'light')}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="5"/>
                          <line x1="12" y1="1" x2="12" y2="3"/>
                          <line x1="12" y1="21" x2="12" y2="23"/>
                          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                          <line x1="1" y1="12" x2="3" y2="12"/>
                          <line x1="21" y1="12" x2="23" y2="12"/>
                          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                        </svg>
                        Light
                      </button>
                      <button
                        className={`theme-option ${preferences.theme === 'dark' ? 'active' : ''}`}
                        onClick={() => handlePreferencesUpdate('theme', 'dark')}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                        </svg>
                        Dark
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="settings-item">
                  <div className="settings-item-info">
                    <h3>Auto-save</h3>
                    <p>Automatically save changes as you work</p>
                  </div>
                  <div className="settings-item-control">
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={preferences.auto_save}
                        onChange={(e) => handlePreferencesUpdate('auto_save', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="settings-item">
                  <div className="settings-item-info">
                    <h3>Email Notifications</h3>
                    <p>Receive email updates about your bookings</p>
                  </div>
                  <div className="settings-item-control">
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={preferences.email_notifications}
                        onChange={(e) => handlePreferencesUpdate('email_notifications', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="settings-item">
                  <div className="settings-item-info">
                    <h3>Default Date Filter</h3>
                    <p>Set your default date range for data views</p>
                  </div>
                  <div className="settings-item-control">
                    <select
                      value={preferences.default_date_filter}
                      onChange={(e) => handlePreferencesUpdate('default_date_filter', e.target.value)}
                    >
                      <option value="today">Today</option>
                      <option value="thisWeek">This Week</option>
                      <option value="thisMonth">This Month</option>
                      <option value="thisYear">This Year</option>
                      <option value="all">All Time</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Security</h2>
                <p>Manage your password and security settings</p>
              </div>
              
              <form onSubmit={handlePasswordChange} className="settings-form">
                <div className="form-group">
                  <label htmlFor="current_password">Current Password</label>
                  <input
                    type="password"
                    id="current_password"
                    value={passwordChange.current_password}
                    onChange={(e) => setPasswordChange({ ...passwordChange, current_password: e.target.value })}
                    placeholder="Enter current password"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="new_password">New Password</label>
                  <input
                    type="password"
                    id="new_password"
                    value={passwordChange.new_password}
                    onChange={(e) => setPasswordChange({ ...passwordChange, new_password: e.target.value })}
                    placeholder="Enter new password"
                  />
                  <p className="form-hint">Must be at least 8 characters</p>
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirm_password">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirm_password"
                    value={passwordChange.confirm_password}
                    onChange={(e) => setPasswordChange({ ...passwordChange, confirm_password: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
              
              <div className="settings-divider"></div>
              
              <div className="settings-info-box">
                <h3>Two-Factor Authentication</h3>
                <p>Add an extra layer of security to your account (Coming soon)</p>
                <button className="btn btn-secondary" disabled>
                  Enable 2FA
                </button>
              </div>
            </div>
          )}
          
          {/* Data & Privacy Tab */}
          {activeTab === 'data' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Data & Privacy</h2>
                <p>Manage your data and privacy settings</p>
              </div>
              
              <div className="settings-info-box">
                <h3>Export Your Data</h3>
                <p>Download a copy of all your data in JSON format</p>
                <button className="btn btn-primary" onClick={handleExportData} disabled={loading}>
                  {loading ? 'Exporting...' : 'Export Data'}
                </button>
              </div>
              
              <div className="settings-divider"></div>
              
              <div className="settings-danger-zone">
                <h3>Danger Zone</h3>
                <p>Permanently delete your account and all associated data</p>
                <button className="btn btn-danger" onClick={handleDeleteAccount}>
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPro
