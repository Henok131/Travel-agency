import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../contexts/StoreContext'
import logo from '../assets/logo.png'
import taxLogo from '../assets/tax-logo.png'
import settingLogo from '../assets/setting-logo.png'
import './RequestsList.css'

// Translation dictionaries
const translations = {
  en: {
    sidebar: {
      mainTable: 'Main Table',
      dashboard: 'Dashboard',
      requests: 'Requests',
      bookings: 'Bookings',
      invoices: 'Invoices',
      expenses: 'Expenses',
      customers: 'Customers',
      bank: 'Bank',
      tax: 'TAX',
      settings: 'Settings',
      footer: '© 2026 LST Travel Agency'
    },
    theme: {
      dark: 'Dark',
      light: 'Light'
    },
    table: {
      title: 'Bookings',
      loading: 'Loading bookings...',
      noBookings: 'No bookings found.',
      error: 'Error loading bookings',
      refresh: 'Refresh',
      search: {
        placeholder: 'Search by customer name, booking reference, or airline...'
      },
      pagination: {
        previous: 'Previous',
        next: 'Next',
        page: 'Page',
        of: 'of',
        showing: 'Showing',
        to: 'to',
        ofTotal: 'of'
      },
      columns: {
        rowNumber: '#',
        customer: 'Customer',
        bookingRef: 'Booking Ref',
        travelDates: 'Travel Dates',
        airline: 'Airline',
        totalAmount: 'Total Amount',
        bookingStatus: 'Booking Status',
        bookingDate: 'Booking Date',
        actions: 'Actions'
      },
      bookingStatus: {
        confirmed: 'Confirmed',
        pending: 'Pending',
        cancelled: 'Cancelled',
        draft: 'Draft'
      },
      viewInvoice: 'View Invoice',
      generateInvoice: 'Generate Invoice'
    }
  },
  de: {
    sidebar: {
      mainTable: 'Haupttabelle',
      dashboard: 'Dashboard',
      requests: 'Anfragen',
      bookings: 'Buchungen',
      invoices: 'Rechnungen',
      expenses: 'Ausgaben',
      customers: 'Kunden',
      bank: 'Bank',
      tax: 'Steuern',
      settings: 'Einstellungen',
      footer: '© 2026 LST Reisebüro'
    },
    theme: {
      dark: 'Dunkel',
      light: 'Hell'
    },
    table: {
      title: 'Buchungen',
      loading: 'Buchungen werden geladen...',
      noBookings: 'Keine Buchungen gefunden.',
      error: 'Fehler beim Laden der Buchungen',
      refresh: 'Aktualisieren',
      search: {
        placeholder: 'Suche nach Kundenname, Buchungsreferenz oder Fluggesellschaft...'
      },
      pagination: {
        previous: 'Zurück',
        next: 'Weiter',
        page: 'Seite',
        of: 'von',
        showing: 'Zeige',
        to: 'bis',
        ofTotal: 'von'
      },
      columns: {
        rowNumber: '#',
        customer: 'Kunde',
        bookingRef: 'Buchungsreferenz',
        travelDates: 'Reisedaten',
        airline: 'Fluggesellschaft',
        totalAmount: 'Gesamtbetrag',
        bookingStatus: 'Buchungsstatus',
        bookingDate: 'Buchungsdatum',
        actions: 'Aktionen'
      },
      bookingStatus: {
        confirmed: 'Bestätigt',
        pending: 'Ausstehend',
        cancelled: 'Storniert',
        draft: 'Entwurf'
      },
      viewInvoice: 'Rechnung anzeigen',
      generateInvoice: 'Rechnung erstellen'
    }
  }
}

function BookingsList() {
  const { store } = useStore()
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en'
  })
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('thisMonth')
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [selectedYear, setSelectedYear] = useState(null)
  const [expandedGroups, setExpandedGroups] = useState(new Set())
  
  // Column resizing state
  const [columnWidths, setColumnWidths] = useState({
    row_number: 60,
    customer: 200,
    booking_ref: 150,
    travel_dates: 180,
    airline: 200,
    total_amount: 120,
    booking_status: 120,
    booking_date: 120,
    actions: 150
  })
  const resizingRef = useRef({ isResizing: false, column: null, startX: 0, startWidth: 0 })
  const tableRef = useRef(null)

  const t = translations[language]

  // Handle theme change
  const handleThemeChange = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  // Apply theme to HTML element
  useEffect(() => {
    document.documentElement.className = theme
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Language handling
  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  // Column resizing handlers
  const handleResizeStart = (field, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const startX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0
    const startWidth = columnWidths[field] || 120
    
    resizingRef.current = {
      isResizing: true,
      column: field,
      startX: startX,
      startWidth: startWidth
    }
    
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
    
    const handleMouseMove = (moveEvent) => {
      if (!resizingRef.current || !resizingRef.current.isResizing) return
      
      const currentX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0]?.clientX) || 0
      if (!currentX) return
      
      moveEvent.preventDefault()
      moveEvent.stopPropagation()
      
      const diff = currentX - resizingRef.current.startX
      const newWidth = Math.max(30, resizingRef.current.startWidth + diff)
      
      setColumnWidths(prev => ({
        ...prev,
        [resizingRef.current.column]: newWidth
      }))
    }
    
    const handleMouseUp = () => {
      if (resizingRef.current) {
        resizingRef.current.isResizing = false
      }
      
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
      
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleMouseMove)
      document.removeEventListener('touchend', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('mouseup', handleMouseUp, true)
    document.addEventListener('touchmove', handleMouseMove, { passive: false, capture: true })
    document.addEventListener('touchend', handleMouseUp, true)
  }

  // Auto-fit column width
  const handleResizeDoubleClick = (field, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    let maxWidth = 100
    
    bookings.forEach(booking => {
      const value = getCellValue(booking, field)
      if (value) {
        const temp = document.createElement('span')
        temp.style.visibility = 'hidden'
        temp.style.position = 'absolute'
        temp.style.fontSize = '0.875rem'
        temp.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
        temp.style.whiteSpace = 'nowrap'
        temp.textContent = value
        document.body.appendChild(temp)
        const width = temp.offsetWidth + 32
        maxWidth = Math.max(maxWidth, width)
        document.body.removeChild(temp)
      }
    })
    
    const headerLabel = getColumnLabel(field)
    const temp = document.createElement('span')
    temp.style.visibility = 'hidden'
    temp.style.position = 'absolute'
    temp.style.fontSize = '0.875rem'
    temp.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
    temp.style.whiteSpace = 'nowrap'
    temp.textContent = headerLabel
    document.body.appendChild(temp)
    const headerWidth = temp.offsetWidth + 32
    maxWidth = Math.max(maxWidth, headerWidth)
    document.body.removeChild(temp)
    
    setColumnWidths(prev => ({
      ...prev,
      [field]: Math.min(maxWidth, 500)
    }))
  }

  // Format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '€0.00'
    const num = parseFloat(value)
    if (isNaN(num)) return '€0.00'
    return `€${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  // Format datetime
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}-${month}-${year}, ${hours}:${minutes}`
  }

  // Get booking status
  const getBookingStatus = (booking) => {
    const status = booking.booking_status || booking.status || 'pending'
    return status.toLowerCase()
  }

  // Date filter functions
  const getDateFilterRange = (filterType, month = null, year = null) => {
    if (!filterType) return null
    
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    today.setHours(0, 0, 0, 0)
    
    let startDate = null
    let endDate = new Date(now)
    
    switch (filterType) {
      case 'today':
        startDate = new Date(today)
        break
      case 'thisWeek':
        const dayOfWeek = now.getDay()
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        startDate = new Date(today)
        startDate.setDate(today.getDate() - daysToMonday)
        break
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'thisYear':
        if (month !== null) {
          startDate = new Date(now.getFullYear(), month, 1)
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(now.getFullYear(), month + 1, 0)
          endDate.setHours(23, 59, 59, 999)
        } else {
          startDate = new Date(now.getFullYear(), 0, 1)
          startDate.setHours(0, 0, 0, 0)
        }
        break
      default:
        if (filterType && filterType.startsWith('year_')) {
          const year = parseInt(filterType.replace('year_', ''), 10)
          if (!isNaN(year)) {
            if (month !== null) {
              startDate = new Date(year, month, 1)
              startDate.setHours(0, 0, 0, 0)
              endDate = new Date(year, month + 1, 0)
              endDate.setHours(23, 59, 59, 999)
            } else {
              startDate = new Date(year, 0, 1)
              startDate.setHours(0, 0, 0, 0)
              endDate = new Date(year, 11, 31)
              endDate.setHours(23, 59, 59, 999)
            }
            return { startDate, endDate }
          }
        }
        return null
    }
    
    return { startDate, endDate }
  }

  // Filter bookings by date range
  const filterByDate = (bookings, filterType) => {
    if (!filterType) return bookings
    
    let year = selectedYear
    if (filterType && filterType.startsWith('year_')) {
      const extractedYear = parseInt(filterType.replace('year_', ''), 10)
      if (!isNaN(extractedYear)) {
        year = extractedYear
      }
    }
    
    const range = getDateFilterRange(filterType, selectedMonth, year)
    if (!range) return bookings
    
    return bookings.filter(booking => {
      if (!booking.created_at) return false
      
      const bookingDate = new Date(booking.created_at)
      bookingDate.setHours(0, 0, 0, 0)
      
      if (range.startDate && bookingDate < range.startDate) return false
      if (range.endDate) {
        const endDate = new Date(range.endDate)
        endDate.setHours(23, 59, 59, 999)
        if (bookingDate > endDate) return false
      }
      
      return true
    })
  }

  // Handle time filter change
  const handleTimeFilterChange = (newFilter) => {
    setDateFilter(newFilter === 'allTime' ? null : newFilter)
    setSelectedMonth(null)
    setSelectedYear(null)
  }

  // Get previous years list
  const getPreviousYearsList = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const years = []
    const startYear = currentYear - 1
    const endYear = 2020
    
    for (let year = startYear; year >= endYear; year--) {
      years.push(year)
    }
    
    return years
  }

  // Group bookings by month
  const groupByMonth = (bookings) => {
    const groups = {}
    
    bookings.forEach(booking => {
      if (!booking.created_at) return
      
      const date = new Date(booking.created_at)
      const month = date.getMonth()
      const year = date.getFullYear()
      const key = `${year}-${String(month + 1).padStart(2, '0')}`
      
      if (!groups[key]) {
        groups[key] = {
          key,
          year,
          month,
          monthName: date.toLocaleString('en-US', { month: 'long' }),
          bookings: []
        }
      }
      
      groups[key].bookings.push(booking)
    })
    
    return Object.values(groups).sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year
      return b.month - a.month
    })
  }

  // Initialize expanded groups
  useEffect(() => {
    if (bookings.length > 0 && expandedGroups.size === 0) {
      const now = new Date()
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      setExpandedGroups(new Set([currentMonthKey]))
    }
  }, [bookings.length])

  // Toggle group expansion
  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey)
      } else {
        newSet.add(groupKey)
      }
      return newSet
    })
  }

  // Get cell value for display
  const getCellValue = (booking, field, rowIndex = null) => {
    if (field === 'row_number') {
      return rowIndex !== null ? String(rowIndex + 1) : ''
    }
    switch (field) {
      case 'customer':
        return `${booking.first_name || ''} ${booking.middle_name || ''} ${booking.last_name || ''}`.trim() || 'Unknown'
      case 'booking_ref':
        return booking.booking_ref || '-'
      case 'travel_dates':
        if (booking.travel_date && booking.return_date) {
          return `${formatDate(booking.travel_date)} - ${formatDate(booking.return_date)}`
        }
        return booking.travel_date ? formatDate(booking.travel_date) : '-'
      case 'airline':
        return booking.airlines || '-'
      case 'total_amount':
        return formatCurrency(booking.total_amount_due)
      case 'booking_status':
        return getBookingStatus(booking)
      case 'booking_date':
        return formatDateTime(booking.created_at)
      default:
        return booking[field] || ''
    }
  }

  // Fetch bookings from mock store
  const fetchBookings = () => {
    try {
      setLoading(true)
      setError(null)
      const data = store.mainTable.getAll()
        .slice()
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      setBookings(data || [])
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError(err.message || t.table.error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
    const unsubscribe = store.subscribe(fetchBookings)
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Get column order
  const columnOrder = [
    'row_number',
    'customer',
    'booking_ref',
    'travel_dates',
    'airline',
    'total_amount',
    'booking_status',
    'booking_date',
    'actions'
  ]

  // Get column label
  const getColumnLabel = (field) => {
    const labelMap = {
      row_number: t.table.columns.rowNumber,
      customer: t.table.columns.customer,
      booking_ref: t.table.columns.bookingRef,
      travel_dates: t.table.columns.travelDates,
      airline: t.table.columns.airline,
      total_amount: t.table.columns.totalAmount,
      booking_status: t.table.columns.bookingStatus,
      booking_date: t.table.columns.bookingDate,
      actions: t.table.columns.actions
    }
    return labelMap[field] || field
  }

  // Apply filters
  const dateFilteredBookings = filterByDate(bookings, dateFilter)
  const filteredBookings = searchTerm.trim() === '' 
    ? dateFilteredBookings 
    : dateFilteredBookings.filter(booking => {
        const searchLower = searchTerm.toLowerCase()
        const customerName = `${booking.first_name || ''} ${booking.last_name || ''}`.toLowerCase()
        const bookingRef = (booking.booking_ref || '').toLowerCase()
        const airline = (booking.airlines || '').toLowerCase()
        
        return customerName.includes(searchLower) || 
               bookingRef.includes(searchLower) || 
               airline.includes(searchLower)
      })

  // Group filtered bookings
  const groupedBookings = groupByMonth(filteredBookings)

  // Calculate booking statistics
  const bookingStats = React.useMemo(() => {
    const total = filteredBookings.length
    let confirmed = 0
    let pending = 0
    let cancelled = 0
    let draft = 0
    let totalAmount = 0

    filteredBookings.forEach(booking => {
      const status = getBookingStatus(booking)
      const amount = parseFloat(booking.total_amount_due) || 0
      totalAmount += amount

      if (status === 'confirmed') {
        confirmed++
      } else if (status === 'pending') {
        pending++
      } else if (status === 'cancelled') {
        cancelled++
      } else {
        draft++
      }
    })

    return {
      total,
      confirmed,
      pending,
      cancelled,
      draft,
      totalAmount
    }
  }, [filteredBookings])


  return (
    <div className="page-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <img src={logo} alt="LST Travel Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          </div>
          <div className="sidebar-brand-text">LST Travel</div>
        </div>

        <div className="sidebar-language">
          <button 
            className={`lang-button ${language === 'de' ? 'active' : ''}`} 
            type="button" 
            title="Deutsch"
            onClick={() => setLanguage('de')}
          >
            DE
          </button>
          <button 
            className={`lang-button ${language === 'en' ? 'active' : ''}`} 
            type="button" 
            title="English"
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
        </div>

        <div className="sidebar-theme">
          <button 
            className={`theme-button ${theme === 'dark' ? 'active' : ''}`} 
            type="button" 
            title={theme === 'dark' ? t.theme.dark : t.theme.light}
            onClick={handleThemeChange}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {theme === 'dark' ? (
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              ) : (
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              )}
            </svg>
            {theme === 'dark' ? t.theme.dark : t.theme.light}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/main" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span>{t.sidebar.mainTable}</span>
          </Link>
          <Link to="/dashboard" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <span>{t.sidebar.dashboard}</span>
          </Link>
          <Link to="/requests" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>{t.sidebar.requests}</span>
          </Link>
          <Link to="/bookings" className="nav-item active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>{t.sidebar.bookings}</span>
          </Link>
          <Link to="/invoices" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
              <path d="M9 9h1v6h-1"/>
            </svg>
            <span>{t.sidebar.invoices}</span>
          </Link>
          <Link to="/expenses" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span>{t.sidebar.expenses}</span>
          </Link>
          <Link to="/customers" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>{t.sidebar.customers}</span>
          </Link>
          <Link to="/bank" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <path d="M2 10h20"/>
              <path d="M7 14h.01"/>
              <path d="M11 14h.01"/>
            </svg>
            <span>{t.sidebar.bank}</span>
          </Link>
          <Link to="/tax" className="nav-item">
            <img src={taxLogo} alt="TAX" width="24" height="24" />
            <span>{t.sidebar.tax}</span>
          </Link>
          <Link to="/settings" className="nav-item">
            <img src={settingLogo} alt="Settings" width="24" height="24" />
            <span>{t.sidebar.settings}</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-text">{t.sidebar.footer}</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content bookings-page">
        <div className="requests-list-page">
          {/* Page Header */}
          <div className="requests-header">
            <h1 className="requests-title">{t.table.title}</h1>
          </div>

          {loading && (
            <div className="requests-loading">
              {t.table.loading}
            </div>
          )}

          {error && (
            <div className="requests-error">
              {error}
            </div>
          )}

          {/* Empty States */}
          {!loading && !error && bookings.length === 0 && (
            <div className="requests-empty-state">
              <div className="empty-state-content">
                <p className="empty-state-title">No bookings yet</p>
                <p className="empty-state-description">Bookings will appear here once they are created</p>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          {!loading && !error && bookings.length > 0 && (
            <div className="invoice-summary-cards" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '1rem', 
              marginBottom: '2rem' 
            }}>
              {/* Total Bookings */}
              <div className="summary-card" style={{
                background: 'hsl(222, 22%, 11%)',
                borderRadius: '0.5rem',
                padding: '1.25rem',
                border: '1px solid hsl(222, 15%, 25%)',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '0.5rem',
                    background: 'hsla(200, 80%, 55%, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(200, 80%, 55%)" strokeWidth="2">
                      <path d="M22 16v-6M2 10v6M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                    </svg>
                  </div>
                  <h3 style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '600', 
                    color: 'hsl(210, 20%, 70%)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    margin: 0
                  }}>
                    Total Bookings
                  </h3>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'hsl(0, 0%, 98%)', marginBottom: '0.25rem' }}>
                  {bookingStats.total}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'hsl(210, 20%, 70%)' }}>
                  {formatCurrency(bookingStats.totalAmount)} total
                </div>
              </div>

              {/* Confirmed Bookings */}
              <div className="summary-card" style={{
                background: 'hsl(222, 22%, 11%)',
                borderRadius: '0.5rem',
                padding: '1.25rem',
                border: '1px solid hsl(222, 15%, 25%)',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '0.5rem',
                    background: 'hsla(152, 60%, 45%, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(152, 60%, 45%)" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <h3 style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '600', 
                    color: 'hsl(210, 20%, 70%)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    margin: 0
                  }}>
                    Confirmed
                  </h3>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'hsl(152, 60%, 45%)', marginBottom: '0.25rem' }}>
                  {bookingStats.confirmed}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'hsl(210, 20%, 70%)' }}>
                  {bookingStats.total > 0 ? Math.round((bookingStats.confirmed / bookingStats.total) * 100) : 0}% of total
                </div>
              </div>

              {/* Pending Bookings */}
              <div className="summary-card" style={{
                background: 'hsl(222, 22%, 11%)',
                borderRadius: '0.5rem',
                padding: '1.25rem',
                border: '1px solid hsl(222, 15%, 25%)',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '0.5rem',
                    background: 'hsla(38, 75%, 55%, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(38, 75%, 55%)" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <h3 style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '600', 
                    color: 'hsl(210, 20%, 70%)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    margin: 0
                  }}>
                    Pending
                  </h3>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'hsl(38, 75%, 55%)', marginBottom: '0.25rem' }}>
                  {bookingStats.pending}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'hsl(210, 20%, 70%)' }}>
                  {bookingStats.total > 0 ? Math.round((bookingStats.pending / bookingStats.total) * 100) : 0}% of total
                </div>
              </div>

              {/* Cancelled Bookings */}
              {bookingStats.cancelled > 0 && (
                <div className="summary-card" style={{
                  background: 'hsl(222, 22%, 11%)',
                  borderRadius: '0.5rem',
                  padding: '1.25rem',
                  border: '1px solid hsl(222, 15%, 25%)',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '0.5rem',
                      background: 'hsla(4, 72%, 55%, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(4, 72%, 55%)" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                    </div>
                    <h3 style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '600', 
                      color: 'hsl(210, 20%, 70%)', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em',
                      margin: 0
                    }}>
                      Cancelled
                    </h3>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'hsl(4, 72%, 55%)', marginBottom: '0.25rem' }}>
                    {bookingStats.cancelled}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'hsl(210, 20%, 70%)' }}>
                    {bookingStats.total > 0 ? Math.round((bookingStats.cancelled / bookingStats.total) * 100) : 0}% of total
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && !error && bookings.length > 0 && (
            <div className="excel-table-container" ref={tableRef}>
              <table className="excel-table">
                <tbody>
                  {/* Query Bar - First Row */}
                  <tr className="query-bar-row">
                    <td colSpan={columnOrder.length} className="query-bar-cell">
                      <div className="query-bar">
                        <div className="query-bar-left">
                          <input
                            type="text"
                            className="query-search-input"
                            placeholder={t.table.search.placeholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="query-bar-right">
                          <label className="query-label">Time:</label>
                          <select
                            className="query-time-select"
                            value={dateFilter || 'allTime'}
                            onChange={(e) => handleTimeFilterChange(e.target.value)}
                          >
                            <option value="allTime">All Time</option>
                            <option value="today">Today</option>
                            <option value="thisWeek">This Week</option>
                            <option value="thisMonth">This Month</option>
                            <option value="thisYear">This Year</option>
                            {getPreviousYearsList().map(year => (
                              <option key={year} value={`year_${year}`}>{year}</option>
                            ))}
                          </select>
                          
                          {dateFilter === 'thisYear' && (
                            <>
                              <label className="query-label">Month:</label>
                              <select
                                className="query-time-select"
                                value={selectedMonth !== null ? selectedMonth : ''}
                                onChange={(e) => setSelectedMonth(e.target.value === '' ? null : parseInt(e.target.value))}
                              >
                                <option value="">All Months</option>
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(month => {
                                  const monthDate = new Date(2000, month, 1)
                                  return (
                                    <option key={month} value={month}>
                                      {monthDate.toLocaleString('en-US', { month: 'long' })}
                                    </option>
                                  )
                                })}
                              </select>
                            </>
                          )}
                          
                          {dateFilter && dateFilter.startsWith('year_') && (
                            <>
                              <label className="query-label">Month:</label>
                              <select
                                className="query-time-select"
                                value={selectedMonth !== null ? selectedMonth : ''}
                                onChange={(e) => setSelectedMonth(e.target.value === '' ? null : parseInt(e.target.value))}
                              >
                                <option value="">All Months</option>
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(month => {
                                  const monthDate = new Date(2000, month, 1)
                                  return (
                                    <option key={month} value={month}>
                                      {monthDate.toLocaleString('en-US', { month: 'long' })}
                                    </option>
                                  )
                                })}
                              </select>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Table Column Headers */}
                  <tr className="excel-column-headers-row">
                    {columnOrder.map((field) => {
                      const width = columnWidths[field] || 120
                      return (
                        <th
                          key={field}
                          style={{ 
                            width: `${width}px`,
                            minWidth: `${width}px`,
                            position: 'relative'
                          }}
                          className="excel-header-cell"
                        >
                          <span className="excel-header-label">{getColumnLabel(field)}</span>
                          {field !== 'actions' && (
                            <div
                              className="excel-resize-handle"
                              onMouseDown={(e) => handleResizeStart(field, e)}
                              onDoubleClick={(e) => handleResizeDoubleClick(field, e)}
                              title="Drag to resize, double-click to auto-fit"
                            />
                          )}
                        </th>
                      )
                    })}
                  </tr>
                  
                  {groupedBookings.length === 0 ? (
                    <tr>
                      <td colSpan={columnOrder.length} style={{ textAlign: 'center', padding: '2rem' }}>
                        {dateFilter || searchTerm.trim() ? 'No matching records found.' : t.table.noBookings}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {groupedBookings.map((group) => {
                        const flatBookings = group.bookings
                        return (
                          <React.Fragment key={group.key}>
                            {groupedBookings.length > 1 && (
                              <tr className="excel-group-header">
                                <td colSpan={columnOrder.length}>
                                  <div className="excel-group-header-content">
                                    <button
                                      className="excel-group-toggle"
                                      onClick={() => toggleGroup(group.key)}
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginRight: '0.5rem' }}
                                    >
                                      {expandedGroups.has(group.key) ? '▼' : '▶'}
                                    </button>
                                    <span className="excel-group-label">
                                      {group.monthName} {group.year}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            )}
                            {(!groupedBookings.length > 1 || expandedGroups.has(group.key)) && flatBookings.map((booking, index) => {
                              const globalIndex = groupedBookings.reduce((acc, g, gIdx) => {
                                if (gIdx < groupedBookings.indexOf(group)) {
                                  return acc + g.bookings.length
                                }
                                return acc
                              }, 0) + index
                              
                              return (
                                <tr key={booking.id}>
                                  {columnOrder.map((field) => {
                                    const width = columnWidths[field] || 120
                                    return (
                                      <td
                                        key={field}
                                        style={{ 
                                          width: `${width}px`,
                                          minWidth: `${width}px`
                                        }}
                                      >
                                        {field === 'actions' ? (
                                          <div className="excel-cell">
                                          </div>
                                        ) : field === 'booking_status' ? (
                                          <div className="excel-cell">
                                            <span className={`status-badge status-${getBookingStatus(booking)}`}>
                                              {t.table.bookingStatus[getBookingStatus(booking)] || getBookingStatus(booking)}
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="excel-cell excel-cell-readonly">
                                            {getCellValue(booking, field, globalIndex)}
                                          </div>
                                        )}
                                      </td>
                                    )
                                  })}
                                </tr>
                              )
                            })}
                          </React.Fragment>
                        )
                      })}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default BookingsList
