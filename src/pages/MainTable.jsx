import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useStore } from '../contexts/StoreContext'
import { supabase } from '../lib/supabase'
import { STATUS, STATUS_LABELS, STATUS_ORDER, STATUS_TRANSITIONS, getStatusLabel, isValidTransition } from '../constants/statuses'
import { saveToRecyclingBin, getItemDisplayName } from '../lib/recyclingBin'
import generateBankTransferInvoicePdf from '../utils/generateBankTransferInvoicePdf'
import generateGroupInvoicePdf from '../utils/generateGroupInvoicePdf'
import AirlinesAutocomplete from '../components/AirlinesAutocomplete'
import { loadAirlines, formatAirlineCompact } from '../lib/airlines'
import AirportAutocomplete from '../components/AirportAutocomplete'
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
      footer: '© 2026 LST Travel Agency'
    },
    theme: {
      dark: 'Dark',
      light: 'Light'
    },
      table: {
        title: 'Main Table',
        loading: 'Loading bookings...',
        noRequests: 'No bookings found.',
        error: 'Error loading requests',
        refresh: 'Refresh',
        createNew: 'Create New Request',
        delete: 'Delete',
        deleteConfirm: 'Are you sure you want to delete this request?',
        deleteSuccess: 'Request deleted successfully',
        deleteError: 'Failed to delete request',
        search: {
          placeholder: 'Search by name, passport, or airport...'
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
        id: 'ID',
        bookingRef: 'Booking Ref',
        bookingStatus: 'Booking Status',
        printInvoice: 'Print Invoice',
        invoiceAction: 'Invoice',
        firstName: 'First Name',
        middleName: 'Middle Name',
        lastName: 'Last Name',
        dateOfBirth: 'Date of Birth',
        gender: 'Gender',
        passportNumber: 'Passport Number',
        travelDetails: 'Travel Details',
        departure: 'Departure',
        destination: 'Destination',
        travelDate: 'Travel Date',
        returnDate: 'Return Date',
        airlines: 'Airlines',
        requestTypes: 'Request Types',
        airlinesPrice: 'Airlines Price',
        serviceFee: 'Service Fee',
        totalTicketPrice: 'Total Ticket Price',
        visaPrice: 'Visa Price',
        serviceVisa: 'Service Visa',
        totVisaFees: 'Total Visa Fees',
        totalAmountDue: 'Total Amount Due',
        cashPaid: 'Cash Paid',
        bankTransfer: 'Bank Transfer',
        totalCustomerPayment: 'Total Customer Payment',
        paymentBalance: 'Payment Balance',
        commissionFromAirlines: 'Commission from Airlines',
        lstLoanFee: 'LST Loan Fee',
        lstProfit: 'LST Profit',
        notice: 'Notice',
        status: 'Status',
        createdAt: 'Created At'
      },
      bookingStatus: {
        draft: 'Draft',
        pending: 'Pending',
        confirmed: 'Confirmed',
        cancelled: 'Cancelled'
      },
      status: {
        draft: 'Draft',
        pending: 'Pending',
        confirmed: 'Confirmed',
        cancelled: 'Cancelled'
      },
      requestTypes: {
        flight: 'Flight',
        visa: 'Visa',
        package: 'Package',
        other: 'Other'
      },
      gender: {
        M: 'Male',
        F: 'Female',
        Other: 'Other'
      }
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
        title: 'Haupttabelle',
        loading: 'Buchungen werden geladen...',
        noRequests: 'Keine Buchungen gefunden.',
        error: 'Fehler beim Laden der Anfragen',
        refresh: 'Aktualisieren',
        createNew: 'Neue Anfrage erstellen',
        delete: 'Löschen',
        deleteConfirm: 'Sind Sie sicher, dass Sie diese Anfrage löschen möchten?',
        deleteSuccess: 'Anfrage erfolgreich gelöscht',
        deleteError: 'Fehler beim Löschen der Anfrage',
        search: {
          placeholder: 'Suche nach Name, Passnummer oder Flughafen...'
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
        id: 'ID',
        bookingRef: 'Buchungsreferenz',
        bookingStatus: 'Buchungsstatus',
        printInvoice: 'Rechnung drucken',
        invoiceAction: 'Rechnung',
        firstName: 'Vorname',
        middleName: 'Zweiter Vorname',
        lastName: 'Nachname',
        dateOfBirth: 'Geburtsdatum',
        gender: 'Geschlecht',
        passportNumber: 'Passnummer',
        travelDetails: 'Reisedetails',
        departure: 'Abflug',
        destination: 'Ziel',
        travelDate: 'Abflugdatum',
        returnDate: 'Rückflugdatum',
        airlines: 'Fluggesellschaft',
        requestTypes: 'Anfragetypen',
        airlinesPrice: 'Flugpreis',
        serviceFee: 'Servicegebühr',
        totalTicketPrice: 'Gesamtpreis Ticket',
        visaPrice: 'Visumpreis',
        serviceVisa: 'Service Visum',
        totVisaFees: 'Gesamt Visumgebühren',
        totalAmountDue: 'Gesamtbetrag fällig',
        cashPaid: 'Bar bezahlt',
        bankTransfer: 'Banküberweisung',
        totalCustomerPayment: 'Gesamtzahlung Kunde',
        paymentBalance: 'Zahlungsbilanz',
        commissionFromAirlines: 'Provision von Fluggesellschaften',
        lstLoanFee: 'LST Darlehensgebühr',
        lstProfit: 'LST Gewinn',
        notice: 'Hinweis',
        status: 'Status',
        createdAt: 'Erstellt am'
      },
      bookingStatus: {
        draft: 'Entwurf',
        pending: 'Ausstehend',
        confirmed: 'Bestätigt',
        cancelled: 'Storniert'
      },
      status: {
        draft: 'Entwurf',
        pending: 'Ausstehend',
        confirmed: 'Bestätigt',
        cancelled: 'Storniert'
      },
      requestTypes: {
        flight: 'Flug',
        visa: 'Visum',
        package: 'Paket',
        other: 'Sonstiges'
      },
      gender: {
        M: 'Männlich',
        F: 'Weiblich',
        Other: 'Andere'
      }
    }
  }
}

function RequestsList() {
  const { store } = useStore()
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'de')
  const t = translations[language]
  
  const [theme, setTheme] = useState('dark')
  const [requests, setRequests] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(50) // Fixed page size
  const [totalCount, setTotalCount] = useState(0)
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('')
  
  // Date filter state (default to 'thisMonth')
  const [dateFilter, setDateFilter] = useState('thisMonth') // 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'year_YYYY' | null
  
  // Month/Year filter state (for conditional filtering)
  const [selectedMonth, setSelectedMonth] = useState(null) // 0-11 (January = 0) or null for "All Months"
  const [selectedYear, setSelectedYear] = useState(null) // year number or null for "All Years"
  
  // Grouping state (which months are expanded)
  const [expandedGroups, setExpandedGroups] = useState(new Set())
  
  // Excel-like editing state
  const [editingCell, setEditingCell] = useState(null) // { rowId, field }
  const [editValue, setEditValue] = useState('')
  const [originalValue, setOriginalValue] = useState('')
  const editInputRef = useRef(null)
  const tableRef = useRef(null)
  const [airlineDisplayMap, setAirlineDisplayMap] = useState({})
  
  // Column resizing state
  const [columnWidths, setColumnWidths] = useState({
    select: 48,
    row_number: 60,
    booking_ref: 130,
    booking_status: 130,
    invoice_action: 100,
    first_name: 120,
    middle_name: 120,
    last_name: 120,
    date_of_birth: 110,
    gender: 80,
    passport_number: 130,
    departure_airport: 180,
    destination_airport: 180,
    travel_date: 150,
    return_date: 150,
    airlines: 160,
    request_types: 150,
    airlines_price: 120,
    service_fee: 120,
    total_ticket_price: 140,
    visa_price: 120,
    service_visa: 120,
    tot_visa_fees: 130,
    total_amount_due: 140,
    cash_paid: 120,
    bank_transfer: 130,
    total_customer_payment: 160,
    payment_balance: 130,
    commission_from_airlines: 170,
    lst_loan_fee: 120,
    lst_profit: 120,
    notice: 220,
    created_at: 150,
    delete: 80
  })
  const resizingRef = useRef({ isResizing: false, column: null, startX: 0, startWidth: 0 })

  // Handle theme change
  const handleThemeChange = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  // Apply theme to HTML element
  useEffect(() => {
    document.documentElement.className = theme
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Persist language choice
  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  // Persist language choice
  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const formatAirlineDisplay = (raw) => {
    if (!raw) return ''
    const cleaned = String(raw).trim()
    const lower = cleaned.toLowerCase()

    // Direct exact match (code or name)
    if (airlineDisplayMap[lower]) return airlineDisplayMap[lower]

    // Extract code from parentheses e.g. "Ethiopian Airlines (ET)"
    const paren = cleaned.match(/\(([A-Za-z0-9]{2,3})\)/)
    const codeFromParen = paren?.[1]
    if (codeFromParen) {
      const key = codeFromParen.toLowerCase()
      if (airlineDisplayMap[key]) return airlineDisplayMap[key]
    }

    // Tokens (strip punctuation) looking for 2-3 char code
    const tokens = cleaned.split(/[\s,;|/]+/)
    for (const t of tokens) {
      const token = t.replace(/[^A-Za-z0-9]/g, '')
      if (/^[A-Za-z0-9]{2,3}$/.test(token)) {
        const key = token.toLowerCase()
        if (airlineDisplayMap[key]) return airlineDisplayMap[key]
      }
    }

    // Any 2-3 letter/number substring
    const codes = cleaned.match(/[A-Za-z0-9]{2,3}/g) || []
    for (const c of codes) {
      const key = c.toLowerCase()
      if (airlineDisplayMap[key]) return airlineDisplayMap[key]
    }

    // Starts-with name lookup
    const nameMatch = Object.keys(airlineDisplayMap).find(k => lower.startsWith(k))
    if (nameMatch) return airlineDisplayMap[nameMatch]

    return cleaned
  }

  // Build airline display map for formatting stored codes/names to "Name (CODE)"
  useEffect(() => {
    loadAirlines()
      .then(list => {
        const map = {}
        list.forEach(a => {
          const formatted = formatAirlineCompact(a)
          if (a.iata) {
            map[a.iata.toLowerCase()] = formatted
          }
          if (a.name) {
            map[a.name.toLowerCase()] = formatted
          }
        })
        setAirlineDisplayMap(map)
      })
      .catch(() => {
        // ignore; fallback will show raw value
      })
  }, [])

  const formatAirportDisplay = (raw) => {
    if (!raw) return '-'
    const cleaned = String(raw)
      .replace(/\bairport\b/gi, '')
      .replace(/\bintl\b/gi, '')
      .replace(/\binternational\b/gi, '')
      .replace(/\bair\b/gi, '')
      .replace(/\bde\b/gi, '')
      .replace(/\buae\b/gi, '')
      .replace(/\bethiopia\b/gi, '')
      .replace(/\bet\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()

    // Extract IATA code (3 letters) from tokens or parentheses
    const parenCode = cleaned.match(/\(([A-Z]{3})\)/)
    let code = parenCode?.[1] || null
    if (!code) {
      const tokenCode = cleaned.match(/\b([A-Z]{3})\b/)
      if (tokenCode) code = tokenCode[1]
    }

    // Hard-map EBB
    if (code === 'EBB') {
      return 'Entebbe/Kampala(EBB)'
    }

    // Derive city/name part: take first comma/pipe-separated segment without the code
    const parts = cleaned.split(/[,|]/).map(p => p.trim()).filter(Boolean)
    let city = parts[0] || ''

    // Remove any trailing code from city
    city = city.replace(/\([A-Z]{3}\)/g, '').trim()

    // Fallback city from tokens if empty
    if (!city && code) city = code
    if (!city) city = cleaned

    if (!code) {
      // Try last 3-letter uppercase token as code
      const tokens = cleaned.split(/\s+/)
      const maybe = tokens.reverse().find(t => /^[A-Z]{3}$/.test(t))
      if (maybe) code = maybe
    }

    if (!code) return city || '-'
    return `${city.replace(/\s+/g, '') ? city.replace(/\s+/g, '') : city}(${code})`
  }

  // Column resizing handlers - Excel-like behavior (simple and reliable)
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
    
    // Prevent text selection and change cursor
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
      
      // Update width immediately
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
    
    // Add event listeners with capture to ensure we catch all events
    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('mouseup', handleMouseUp, true)
    document.addEventListener('touchmove', handleMouseMove, { passive: false, capture: true })
    document.addEventListener('touchend', handleMouseUp, true)
  }

  // Excel-like: Double-click to auto-fit column width
  const handleResizeDoubleClick = (field, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Find the widest content in this column
    let maxWidth = 100 // minimum width
    
    const flatRequests = groupedRequests.flatMap(group => group.requests)
    flatRequests.forEach(request => {
      const value = getCellValue(request, field)
      if (value) {
        // Create a temporary element to measure text width
        const temp = document.createElement('span')
        temp.style.visibility = 'hidden'
        temp.style.position = 'absolute'
        temp.style.fontSize = '0.875rem'
        temp.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
        temp.style.whiteSpace = 'nowrap'
        temp.textContent = value
        document.body.appendChild(temp)
        const width = temp.offsetWidth + 32 // Add padding
        maxWidth = Math.max(maxWidth, width)
        document.body.removeChild(temp)
      }
    })
    
    // Also check header width
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
    
    // Set the new width
    setColumnWidths(prev => ({
      ...prev,
      [field]: Math.min(maxWidth, 500) // Cap at 500px
    }))
  }

  // Fetch requests from Supabase with pagination
  const fetchRequests = async (page) => {
    try {
      setLoading(true)
      setError(null)
      
      // Calculate offset
      const offset = (page - 1) * pageSize
      
      // Fetch total count
      const { count, error: countError } = await supabase
        .from('main_table')
        .select('*', { count: 'exact', head: true })
      
      if (countError) {
        throw countError
      }
      
      setTotalCount(count || 0)
      
      // Fetch paginated data
      const { data, error: fetchError } = await supabase
        .from('main_table')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

      if (fetchError) {
        throw fetchError
      }

      // Calculate financial fields for loaded data (migration support)
      const dataWithCalculations = (data || []).map(request => {
        const airlinesPrice = parseFloat(request.airlines_price) || 0
        const serviceFee = parseFloat(request.service_fee) || 0
        const visaPrice = parseFloat(request.visa_price) || 0
        const serviceVisa = parseFloat(request.service_visa) || 0
        const cashPaid = parseFloat(request.cash_paid) || 0
        const bankTransfer = parseFloat(request.bank_transfer) || 0
        const commission = parseFloat(request.commission_from_airlines) || 0
        const loanFee = parseFloat(request.lst_loan_fee) || 0
        
        return {
          ...request,
          total_ticket_price: request.total_ticket_price || (airlinesPrice + serviceFee),
          tot_visa_fees: request.tot_visa_fees || (visaPrice + serviceVisa),
          total_customer_payment: request.total_customer_payment || (cashPaid + bankTransfer),
          total_amount_due: request.total_amount_due || ((airlinesPrice + serviceFee) + (visaPrice + serviceVisa)),
          lst_profit: request.lst_profit || (serviceFee + serviceVisa + commission - loanFee)
        }
      })

      setRequests(dataWithCalculations)
    } catch (err) {
      console.error('Error fetching requests:', err)
      setError(err.message || t.table.error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  // Handle page navigation
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleNextPage = () => {
    const totalPages = Math.ceil(totalCount / pageSize)
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  // Refresh button handler (resets to page 1)
  const handleRefresh = () => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    } else {
      // If already on page 1, just refetch
      fetchRequests(1)
    }
  }

  // Handle generate invoice (Supabase-enabled)
  const handleGenerateInvoice = async (request, e, mode = 'preview') => {
    e.stopPropagation()
    
    try {
      // Fetch invoice settings (best effort)
      let settingsData = {}
      try {
        const { data, error } = await supabase
          .from('invoice_settings')
          .select('*')
          .maybeSingle()
        if (!error && data) settingsData = data
      } catch (err) {
        console.warn('Invoice settings fetch failed:', err.message)
      }
      
      // Try to resolve logo URL (best effort)
      let logoUrl = settingsData.logo_url || null
      if (!logoUrl && supabase?.storage) {
        // Try to find logo in storage by listing folders
        try {
          const { data: files } = await supabase.storage
            .from('logos')
            .list('', { limit: 100 })
          const folders = files?.filter(f => !f.name.includes('.')) || []
          const orgId = folders.length > 0 ? folders[0].name : 'default'
          const formats = ['png', 'jpg', 'jpeg', 'svg']
          for (const fmt of formats) {
            try {
              const { data } = supabase.storage.from('logos').getPublicUrl(`${orgId}/logo.${fmt}`)
              if (data?.publicUrl) {
                logoUrl = data.publicUrl
                break
              }
            } catch (_) {
              // ignore and try next format
            }
          }
        } catch (_) {
          // ignore storage errors
        }
      }
      
      const settings = {
        ...settingsData,
        include_qr: settingsData?.include_qr ?? false,
        logo_url: logoUrl || settingsData.logo_url || ''
      }

      await generateBankTransferInvoicePdf({
        booking: request,
        settings,
        mode,
        language,
        includeParagraph: true
      })
    } catch (err) {
      console.error('Error generating invoice:', err)
      alert('Failed to generate invoice: ' + (err.message || 'Unknown error'))
    }
  }

  const normalizeId = (id) => (id === undefined || id === null ? '' : String(id))

  const handleToggleRowSelect = (rowId) => {
    const normalized = normalizeId(rowId)
    if (!normalized) return
    setSelectedIds((prev) =>
      prev.includes(normalized) ? prev.filter((id) => id !== normalized) : [...prev, normalized]
    )
  }

  const handleSelectAllVisible = (ids, checked) => {
    if (!ids || ids.length === 0) return
    const normalizedIds = ids.map(normalizeId).filter(Boolean)
    setSelectedIds((prev) => {
      if (checked) {
        const merged = new Set([...prev, ...normalizedIds])
        return Array.from(merged)
      }
      return prev.filter((id) => !normalizedIds.includes(id))
    })
  }

  const handleGenerateGroupInvoice = async (mode = 'preview') => {
    try {
      const selectedSet = new Set(selectedIds.map(normalizeId))
      const selectedBookings = requests.filter((r) => selectedSet.has(normalizeId(r.id)))
      if (selectedBookings.length === 0) {
        alert('Select at least one passenger to print a group invoice.')
        return
      }

      // Fetch invoice settings (best effort)
      let settingsData = {}
      try {
        const { data, error } = await supabase
          .from('invoice_settings')
          .select('*')
          .maybeSingle()
        if (!error && data) settingsData = data
      } catch (err) {
        console.warn('Invoice settings fetch failed:', err.message)
      }

      // Try to resolve logo URL (best effort)
      let logoUrl = settingsData.logo_url || null
      if (!logoUrl && supabase?.storage) {
        // Try to find logo in storage by listing folders
        try {
          const { data: files } = await supabase.storage
            .from('logos')
            .list('', { limit: 100 })
          const folders = files?.filter(f => !f.name.includes('.')) || []
          const orgId = folders.length > 0 ? folders[0].name : 'default'
          const formats = ['png', 'jpg', 'jpeg', 'svg']
          for (const fmt of formats) {
            try {
              const { data } = supabase.storage.from('logos').getPublicUrl(`${orgId}/logo.${fmt}`)
              if (data?.publicUrl) {
                logoUrl = data.publicUrl
                break
              }
            } catch (_) {
              // ignore and try next format
            }
          }
        } catch (_) {
          // ignore storage errors
        }
      }

      const settings = {
        ...settingsData,
        include_qr: settingsData?.include_qr ?? false,
        logo_url: logoUrl || settingsData.logo_url || ''
      }

      await generateGroupInvoicePdf(selectedBookings, settings, mode, language, true)
      setSelectedIds([])
    } catch (err) {
      console.error('Error generating group invoice:', err)
      alert('Failed to generate group invoice: ' + (err.message || 'Unknown error'))
    }
  }

  // Handle delete request
  const handleDeleteRequest = async (requestId, e) => {
    e.stopPropagation()
    
    // Confirm deletion
    if (!window.confirm(t.table.deleteConfirm)) {
      return
    }

    try {
      // Get the request data before deleting (for recycling bin)
      const { data: requestData } = await supabase
        .from('main_table')
        .select('*')
        .eq('id', requestId)
        .single()

      if (!requestData) {
        throw new Error('Request not found')
      }

      // Save to recycling bin before deleting
      saveToRecyclingBin('main_table', requestData, getItemDisplayName(requestData))

      // Delete from Supabase
      const { error } = await supabase
        .from('main_table')
        .delete()
        .eq('id', requestId)

      if (error) {
        throw error
      }

      // Show success message
      alert(t.table.deleteSuccess)
      
      // Refresh the current page
      fetchRequests(currentPage)
    } catch (err) {
      console.error('Error deleting request:', err)
      alert(t.table.deleteError + ': ' + (err.message || 'Unknown error'))
    }
  }

  // Convert date from YYYY-MM-DD to DD.MM.YYYY for display
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  }

  // Convert date from DD.MM.YYYY or DD-MM-YYYY to YYYY-MM-DD for database
  const convertDateToISO = (dateStr) => {
    if (!dateStr || dateStr.trim() === '') return null
    const ddmmyyyyPattern = /^(\d{2})[.-](\d{2})[.-](\d{2,4})$/
    const match = dateStr.match(ddmmyyyyPattern)
    if (match) {
      const [, day, month, yearRaw] = match
      const dayNum = parseInt(day, 10)
      const monthNum = parseInt(month, 10)
      let yearNum = parseInt(yearRaw, 10)
      if (yearRaw.length === 2) {
        yearNum = 2000 + yearNum
      }
      if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900 || yearNum > 2100) {
        return null
      }
      return `${yearNum}-${month}-${day}`
    }
    const yyyymmddPattern = /^\d{4}-\d{2}-\d{2}$/
    if (dateStr.match(yyyymmddPattern)) {
      return dateStr
    }
    return null
  }

  // Format datetime as "DD.MM.YYYY, HH:MM"
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}.${month}.${year}, ${hours}:${minutes}`
  }

  // Date filter functions - calculate ranges dynamically
  const getDateFilterRange = (filterType, month = null, year = null) => {
    if (!filterType) return null
    
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    today.setHours(0, 0, 0, 0)
    
    let startDate = null
    let endDate = new Date(now) // Now (inclusive)
    
    switch (filterType) {
      case 'today':
        startDate = new Date(today)
        break
      
      case 'thisWeek':
        // Start of week (Monday)
        const dayOfWeek = now.getDay()
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        startDate = new Date(today)
        startDate.setDate(today.getDate() - daysToMonday)
        break
      
      case 'thisMonth':
        // First day of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        startDate.setHours(0, 0, 0, 0)
        break
      
      case 'thisYear':
        if (month !== null) {
          // Specific month in current year
          startDate = new Date(now.getFullYear(), month, 1)
          startDate.setHours(0, 0, 0, 0)
          // Last day of the month
          endDate = new Date(now.getFullYear(), month + 1, 0)
          endDate.setHours(23, 59, 59, 999)
        } else {
          // January 1 of current year
          startDate = new Date(now.getFullYear(), 0, 1)
          startDate.setHours(0, 0, 0, 0)
        }
        break
      
      default:
        // Check if filterType is a year (format: 'year_YYYY')
        if (filterType && filterType.startsWith('year_')) {
          const year = parseInt(filterType.replace('year_', ''), 10)
          if (!isNaN(year)) {
            if (month !== null) {
              // Specific month in selected year
              startDate = new Date(year, month, 1)
              startDate.setHours(0, 0, 0, 0)
              endDate = new Date(year, month + 1, 0)
              endDate.setHours(23, 59, 59, 999)
            } else {
              // Entire year
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

  // Filter requests by date range
  const filterByDate = (requests, filterType) => {
    if (!filterType) return requests
    
    // Extract year from filterType if it's in 'year_YYYY' format
    let year = selectedYear
    if (filterType && filterType.startsWith('year_')) {
      const extractedYear = parseInt(filterType.replace('year_', ''), 10)
      if (!isNaN(extractedYear)) {
        year = extractedYear
      }
    }
    
    const range = getDateFilterRange(filterType, selectedMonth, year)
    if (!range) return requests
    
    return requests.filter(request => {
      if (!request.created_at) return false
      
      const requestDate = new Date(request.created_at)
      requestDate.setHours(0, 0, 0, 0)
      
      if (range.startDate && requestDate < range.startDate) return false
      if (range.endDate) {
        const endDate = new Date(range.endDate)
        endDate.setHours(23, 59, 59, 999)
        if (requestDate > endDate) return false
      }
      
      return true
    })
  }

  // Handle time filter change - reset month/year when changing time scope
  const handleTimeFilterChange = (newFilter) => {
    setDateFilter(newFilter === 'allTime' ? null : newFilter)
    // Reset month/year when changing time scope
    setSelectedMonth(null)
    setSelectedYear(null)
  }

  // Get available years for dropdown (previous years from current year)
  const getAvailableYears = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const years = []
    
    // Get unique years from requests that are before current year
    const yearSet = new Set()
    requests.forEach(request => {
      if (request.created_at) {
        const date = new Date(request.created_at)
        const year = date.getFullYear()
        if (year < currentYear) {
          yearSet.add(year)
        }
      }
    })
    
    // Convert to array and sort descending (latest first)
    return Array.from(yearSet).sort((a, b) => b - a)
  }

  // Get all previous years (from current year going back)
  const getPreviousYearsList = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const years = []
    
    // Generate years from current year - 1 going back to a reasonable limit (e.g., 2020)
    // This shows previous years based on the current date, not just data
    const startYear = currentYear - 1 // Last year
    const endYear = 2020 // Reasonable limit (adjust if needed)
    
    for (let year = startYear; year >= endYear; year--) {
      years.push(year)
    }
    
    return years
  }

  // Group requests by month and year
  const groupByMonth = (requests) => {
    const groups = {}
    
    requests.forEach(request => {
      if (!request.created_at) return
      
      const date = new Date(request.created_at)
      const month = date.getMonth()
      const year = date.getFullYear()
      const key = `${year}-${String(month + 1).padStart(2, '0')}`
      
      if (!groups[key]) {
        groups[key] = {
          key,
          year,
          month,
          monthName: date.toLocaleString('en-US', { month: 'long' }),
          requests: []
        }
      }
      
      groups[key].requests.push(request)
    })
    
    // Sort groups by date (newest first)
    return Object.values(groups).sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year
      return b.month - a.month
    })
  }

  // Initialize expanded groups (current month expanded by default)
  useEffect(() => {
    if (requests.length > 0 && expandedGroups.size === 0) {
      const now = new Date()
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      setExpandedGroups(new Set([currentMonthKey]))
    }
  }, [requests.length])

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

  // Format currency value
  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return ''
    const num = parseFloat(value)
    if (isNaN(num)) return ''
    return new Intl.NumberFormat(language === 'de' ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }

  // Get cell value for display
  const getCellValue = (request, field, rowIndex = null) => {
    if (field === 'row_number') {
      return rowIndex !== null ? String(rowIndex + 1) : ''
    }
    
    // Handle computed/calculated fields
    if (field === 'travel_date' || field === 'return_date') {
      if (!request[field]) return ''
      return formatDateForDisplay(request[field])
    }
    
    if (field === 'airlines') {
      const raw = (request.airlines || request.airline_name || '').trim()
      return formatAirlineDisplay(raw)
    }

    if (field === 'departure_airport' || field === 'destination_airport') {
      const raw = request[field]
      return formatAirportDisplay(raw)
    }
    
    // Financial calculations
    if (field === 'total_ticket_price') {
      const stored = parseFloat(request.total_ticket_price)
      if (!isNaN(stored)) {
        return stored !== 0 ? formatCurrency(stored) : formatCurrency(stored)
      }
      const airlinesPrice = parseFloat(request.airlines_price) || 0
      const serviceFee = parseFloat(request.service_fee) || 0
      const total = airlinesPrice + serviceFee
      return total > 0 ? formatCurrency(total) : ''
    }
    
    if (field === 'tot_visa_fees') {
      const stored = parseFloat(request.tot_visa_fees)
      if (!isNaN(stored)) {
        return stored !== 0 ? formatCurrency(stored) : formatCurrency(stored)
      }
      const visaPrice = parseFloat(request.visa_price) || 0
      const serviceVisa = parseFloat(request.service_visa) || 0
      const total = visaPrice + serviceVisa
      return total > 0 ? formatCurrency(total) : ''
    }
    
    if (field === 'total_customer_payment') {
      const cashPaid = parseFloat(request.cash_paid) || 0
      const bankTransfer = parseFloat(request.bank_transfer) || 0
      const total = cashPaid + bankTransfer
      return total > 0 ? formatCurrency(total) : ''
    }
    
    if (field === 'total_amount_due') {
      const stored = parseFloat(request.total_amount_due)
      if (!isNaN(stored)) {
        return stored !== 0 ? formatCurrency(stored) : formatCurrency(stored)
      }
      const ticketPrice = !isNaN(parseFloat(request.total_ticket_price))
        ? parseFloat(request.total_ticket_price)
        : (parseFloat(request.airlines_price) || 0) + (parseFloat(request.service_fee) || 0)
      const visaFees = !isNaN(parseFloat(request.tot_visa_fees))
        ? parseFloat(request.tot_visa_fees)
        : (parseFloat(request.visa_price) || 0) + (parseFloat(request.service_visa) || 0)
      const total = ticketPrice + visaFees
      return total > 0 ? formatCurrency(total) : ''
    }
    
    if (field === 'payment_balance') {
      const customerPayment = parseFloat(request.total_customer_payment) || 
        (parseFloat(request.cash_paid) || 0) + (parseFloat(request.bank_transfer) || 0)
      const amountDue = parseFloat(request.total_amount_due) || 
        ((parseFloat(request.airlines_price) || 0) + (parseFloat(request.service_fee) || 0)) +
        ((parseFloat(request.visa_price) || 0) + (parseFloat(request.service_visa) || 0))
      const balance = customerPayment - amountDue
      return formatCurrency(balance)
    }
    
    if (field === 'lst_profit') {
      const serviceFee = parseFloat(request.service_fee) || 0
      const serviceVisa = parseFloat(request.service_visa) || 0
      const commission = parseFloat(request.commission_from_airlines) || 0
      const loanFee = parseFloat(request.lst_loan_fee) || 0
      const profit = serviceFee + serviceVisa + commission - loanFee
      return profit !== 0 ? formatCurrency(profit) : ''
    }
    
    switch (field) {
      case 'date_of_birth':
      case 'travel_date':
      case 'return_date':
        return formatDateForDisplay(request[field])
      case 'created_at':
        return formatDateTime(request[field])
      case 'gender':
        return request[field] ? (t.table.gender[request[field]] || request[field]) : ''
      case 'status':
        return request[field] ? (t.table.status[request[field]] || request[field]) : ''
    case 'booking_status': {
      const val = request.booking_status || request.status
      return val ? getStatusLabel(val, language) : ''
    }
      case 'print_invoice':
        return request[field] ? 'Yes' : 'No'
      case 'request_types':
        if (!request.request_types || !Array.isArray(request.request_types) || request.request_types.length === 0) {
          return ''
        }
        return request.request_types.map(type => t.table.requestTypes[type] || type).join(', ')
      case 'airlines_price':
      case 'service_fee':
      case 'visa_price':
      case 'service_visa':
      case 'cash_paid':
      case 'bank_transfer':
      case 'commission_from_airlines':
      case 'lst_loan_fee':
        return request[field] ? formatCurrency(request[field]) : ''
      case 'notice':
        return request[field] || ''
      default:
        return request[field] || ''
    }
  }

  // Get raw cell value for editing
  const getRawCellValue = (request, field) => {
    switch (field) {
      case 'date_of_birth':
      case 'travel_date':
      case 'return_date':
        return formatDateForDisplay(request[field])
      case 'request_types':
        if (!request.request_types || !Array.isArray(request.request_types)) {
          return ''
        }
        return request.request_types.join(', ')
      case 'gender':
      case 'status':
      case 'booking_status':
        return request[field] || ''
      case 'print_invoice':
        return request[field] ? 'true' : 'false'
      case 'airlines_price':
      case 'service_fee':
      case 'visa_price':
      case 'service_visa':
      case 'cash_paid':
      case 'bank_transfer':
      case 'commission_from_airlines':
      case 'lst_loan_fee':
      case 'total_ticket_price':
      case 'tot_visa_fees':
      case 'total_amount_due':
        return request[field] !== undefined && request[field] !== null ? String(request[field]) : ''
      default:
        return request[field] || ''
    }
  }

  // Start editing a cell
  const startEditing = (rowId, field, e) => {
    e.stopPropagation()
    const request = requests.find(r => r.id === rowId)
    if (!request) return

    // Don't allow editing of readonly fields
    if (field === 'created_at' || field === 'id' || field === 'invoice_action') return

    const rawValue = getRawCellValue(request, field)
    setEditingCell({ rowId, field })
    setEditValue(rawValue)
    setOriginalValue(rawValue)
    
    // Focus input after state update (skip for checkbox)
    if (field !== 'print_invoice') {
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus()
          if (editInputRef.current.select) {
        editInputRef.current.select()
        }
      }
    }, 0)
    }
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingCell(null)
    setEditValue('')
    setOriginalValue('')
  }

  // Save cell value
  const saveCell = async (rowId, field, value, skipCancel = false) => {
    const request = requests.find(r => r.id === rowId)
    if (!request) return

    let dbValue = value.trim()
    
    // Convert dates to ISO format
    if (field === 'date_of_birth' || field === 'travel_date' || field === 'return_date') {
      dbValue = convertDateToISO(dbValue)
      if (dbValue === null && value.trim() !== '') {
        // Invalid date format, revert
        if (!skipCancel) cancelEditing()
        return
      }
    }

    // Handle request_types (comma-separated to array)
    if (field === 'request_types') {
      if (dbValue === '') {
        dbValue = []
      } else {
        dbValue = dbValue.split(',').map(s => s.trim()).filter(s => s.length > 0)
      }
    }

    // Handle boolean fields
    if (field === 'print_invoice') {
      dbValue = dbValue === 'true' || dbValue === true || dbValue === 'Yes' || dbValue === 'yes'
    }

    // Handle numeric fields - convert to number or null
    const numericFields = [
      'airlines_price', 'service_fee', 'visa_price', 'service_visa',
      'cash_paid', 'bank_transfer', 'commission_from_airlines', 'lst_loan_fee',
      'total_ticket_price', 'tot_visa_fees', 'total_amount_due'
    ]
    if (numericFields.includes(field)) {
      if (dbValue === '' || dbValue === null || dbValue === undefined) {
        dbValue = null
      } else {
        const num = parseFloat(dbValue)
        if (isNaN(num)) {
          // Invalid number, revert
          if (!skipCancel) cancelEditing()
          return
        }
        // Validate positive numbers for airlines_price and service_fee
        if ((field === 'airlines_price' || field === 'service_fee') && num < 0) {
          alert(`${field} must be a positive number`)
          if (!skipCancel) cancelEditing()
          return
        }
        dbValue = num
      }
    }

    // Store original requests for rollback
    const originalRequests = [...requests]

    // Update local state optimistically
    const updatedRequests = requests.map(r => {
      if (r.id === rowId) {
        const updated = { ...r }
        if (field === 'date_of_birth' || field === 'travel_date' || field === 'return_date') {
          updated[field] = dbValue
        } else if (field === 'request_types') {
          updated[field] = dbValue
        } else {
          updated[field] = dbValue === '' ? null : dbValue
        }
        
        // Calculate financial fields (allow manual overrides for totals)
        const airlinesPrice = parseFloat(updated.airlines_price) || 0
        const serviceFee = parseFloat(updated.service_fee) || 0
        const visaPrice = parseFloat(updated.visa_price) || 0
        const serviceVisa = parseFloat(updated.service_visa) || 0
        const cashPaid = parseFloat(updated.cash_paid) || 0
        const bankTransfer = parseFloat(updated.bank_transfer) || 0
        const commission = parseFloat(updated.commission_from_airlines) || 0
        const loanFee = parseFloat(updated.lst_loan_fee) || 0

        const recalcTicketPrice = field === 'airlines_price' || field === 'service_fee'
        const recalcVisaFees = field === 'visa_price' || field === 'service_visa'
        const recalcCustomerPayment = field === 'cash_paid' || field === 'bank_transfer'
        const recalcProfit = ['service_fee', 'service_visa', 'commission_from_airlines', 'lst_loan_fee'].includes(field)

        if (recalcTicketPrice) {
          updated.total_ticket_price = airlinesPrice + serviceFee
        } else if (field === 'total_ticket_price') {
          updated.total_ticket_price = dbValue === null ? null : dbValue
        }

        if (recalcVisaFees) {
          updated.tot_visa_fees = visaPrice + serviceVisa
        } else if (field === 'tot_visa_fees') {
          updated.tot_visa_fees = dbValue === null ? null : dbValue
        }

        if (recalcCustomerPayment) {
          updated.total_customer_payment = cashPaid + bankTransfer
        }

        if (recalcTicketPrice || recalcVisaFees) {
          const ticket = recalcTicketPrice ? airlinesPrice + serviceFee : (parseFloat(updated.total_ticket_price) || 0)
          const visa = recalcVisaFees ? visaPrice + serviceVisa : (parseFloat(updated.tot_visa_fees) || 0)
          updated.total_amount_due = ticket + visa
        } else if (field === 'total_ticket_price' || field === 'tot_visa_fees') {
          const ticket = field === 'total_ticket_price' ? (dbValue || 0) : (parseFloat(updated.total_ticket_price) || 0)
          const visa = field === 'tot_visa_fees' ? (dbValue || 0) : (parseFloat(updated.tot_visa_fees) || 0)
          updated.total_amount_due = ticket + visa
        } else if (field === 'total_amount_due') {
          updated.total_amount_due = dbValue === null ? null : dbValue
        }

        if (recalcProfit) {
          updated.lst_profit = serviceFee + serviceVisa + commission - loanFee
        }
        
        return updated
      }
      return r
    })
    setRequests(updatedRequests)

    // Update backend using Supabase with UUID id
    try {
      // Ensure rowId is a valid UUID
      if (!rowId || typeof rowId !== 'string') {
        throw new Error('Invalid row ID: must be a UUID')
      }

      const updateData = {}
      updateData[field] = dbValue
      
      // Get the updated request to calculate financial fields
      const updatedRequest = updatedRequests.find(r => r.id === rowId)
      if (updatedRequest) {
        // Include calculated fields in update
        updateData.total_ticket_price = updatedRequest.total_ticket_price ?? null
        updateData.tot_visa_fees = updatedRequest.tot_visa_fees ?? null
        updateData.total_customer_payment = updatedRequest.total_customer_payment ?? null
        updateData.total_amount_due = updatedRequest.total_amount_due ?? null
        updateData.lst_profit = updatedRequest.lst_profit ?? null
      }

      // Update using Supabase with UUID id (never use index, booking_ref, or undefined IDs)
      const { error } = await supabase
        .from('main_table')
        .update(updateData)
        .eq('id', rowId)

      if (error) {
        throw error
      }
    } catch (err) {
      console.error('Error updating cell:', err)
      // Revert on error
      setRequests(originalRequests)
      alert(`Error updating ${field}: ${err.message}`)
    }

    if (!skipCancel) {
      cancelEditing()
    }
  }

  // Handle input change
  const handleInputChange = (e) => {
    setEditValue(e.target.value)
  }

  // Handle input blur (save on click outside)
  const handleInputBlur = (rowId, field) => {
    if (field === 'airlines') {
      const formatted = formatAirlineDisplay(editValue)
      setEditValue(formatted)
      saveCell(rowId, field, formatted)
    } else {
      saveCell(rowId, field, editValue)
    }
  }

  // Handle key down in input
  const handleInputKeyDown = (e, rowId, field) => {
    if (e.key === 'Enter') {
        e.preventDefault()
      saveCell(rowId, field, editValue)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        cancelEditing()
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') {
      // Save current cell first
      e.preventDefault()
      saveCell(rowId, field, editValue)
      
      // Find current cell position - use all editable columns
      const currentRowIndex = requests.findIndex(r => r.id === rowId)
      const columns = columnOrder.filter(col => isEditable(col) && col !== 'delete' && col !== 'invoice_action')
      const currentColIndex = columns.indexOf(field)
      
      let newRowIndex = currentRowIndex
      let newColIndex = currentColIndex
      
      if (e.key === 'ArrowUp') {
        newRowIndex = Math.max(0, currentRowIndex - 1)
      } else if (e.key === 'ArrowDown') {
        newRowIndex = Math.min(requests.length - 1, currentRowIndex + 1)
      } else if (e.key === 'ArrowLeft') {
        newColIndex = Math.max(0, currentColIndex - 1)
      } else if (e.key === 'ArrowRight' || e.key === 'Tab') {
        newColIndex = Math.min(columns.length - 1, currentColIndex + 1)
        if (e.key === 'Tab' && newColIndex === currentColIndex) {
          // Tab at end of row, move to next row
          newRowIndex = Math.min(requests.length - 1, currentRowIndex + 1)
          newColIndex = 0
        }
      }
      
      // Move to new cell
      if (newRowIndex >= 0 && newRowIndex < requests.length && newColIndex >= 0 && newColIndex < columns.length) {
        const newRowId = requests[newRowIndex].id
        const newField = columns[newColIndex]
        setTimeout(() => {
          const cell = tableRef.current?.querySelector(`[data-row-id="${newRowId}"][data-field="${newField}"]`)
          if (cell) {
            cell.click()
          }
        }, 50)
      }
    }
  }

  // Check if cell is editable
  const isEditable = (field) => {
    // Read-only fields
    const readonlyFields = [
      'id', 'created_at', 'updated_at', 'row_number', 'delete',
      'total_customer_payment', 'payment_balance', 'lst_profit',
      'invoice_action'
    ]
    return !readonlyFields.includes(field)
  }

  // Render cell content
  const renderCell = (request, field, rowIndex = null) => {
    if (field === 'select') {
      return (
        <div className="excel-cell excel-cell-select">
          <input
            type="checkbox"
            checked={selectedIds.includes(request.id)}
            onChange={(e) => {
              e.stopPropagation()
              handleToggleRowSelect(request.id)
            }}
            aria-label="Select passenger"
          />
        </div>
      )
    }

    // Invoice button column (direct print)
    if (field === 'invoice_action') {
      return (
        <div className="excel-cell excel-cell-invoice">
          <button
            className="invoice-row-button"
            onClick={(e) => {
              e.stopPropagation()
              handleGenerateInvoice(request, e, 'preview')
            }}
            type="button"
            title={t.table.columns.invoiceAction}
            aria-label={t.table.columns.invoiceAction}
          >
            🖨️ {t.table.columns.invoiceAction}
          </button>
        </div>
      )
    }

    // Delete button column
    if (field === 'delete') {
      return (
        <div className="excel-cell excel-cell-delete">
          <button
            className="delete-row-button"
            onClick={(e) => handleDeleteRequest(request.id, e)}
            type="button"
            title={t.table.delete}
            aria-label={t.table.delete}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </div>
      )
    }
    
    // Row number is read-only
    if (field === 'row_number') {
      return (
        <div className="excel-cell">
          {rowIndex !== null ? String(rowIndex + 1) : ''}
        </div>
      )
    }
    
    if (editingCell && editingCell.rowId === request.id && editingCell.field === field) {
      // Render input for editing
      if (field === 'gender') {
        return (
          <select
            ref={editInputRef}
            className="excel-cell-input"
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value)
              // Auto-save on change for dropdowns (keep editing state)
              saveCell(request.id, field, e.target.value, true)
            }}
            onBlur={() => handleInputBlur(request.id, field)}
            onKeyDown={(e) => handleInputKeyDown(e, request.id, field)}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">-</option>
            <option value="M">{t.table.gender.M}</option>
            <option value="F">{t.table.gender.F}</option>
            <option value="Other">{t.table.gender.Other}</option>
          </select>
        )
      } else if (field === 'status') {
        const current = request.status || STATUS.DRAFT
        const allowed = STATUS_ORDER
        return (
          <select
            ref={editInputRef}
            className={`excel-cell-input status-dropdown status-${editValue || current}`}
            value={editValue || current}
            onChange={(e) => {
              setEditValue(e.target.value)
              // Auto-save on change for dropdowns (keep editing state)
              saveCell(request.id, field, e.target.value, true)
            }}
            onBlur={() => handleInputBlur(request.id, field)}
            onKeyDown={(e) => handleInputKeyDown(e, request.id, field)}
            onClick={(e) => e.stopPropagation()}
          >
            {allowed.map((opt) => (
              <option key={opt} value={opt}>
                {getStatusLabel(opt, language)}
              </option>
            ))}
          </select>
        )
      } else if (field === 'booking_status') {
        const current = request.booking_status || request.status || STATUS.DRAFT
        const allowed = STATUS_ORDER
        // Normalize status to lowercase for CSS class (database may have 'Draft', but CSS uses 'draft')
        const normalizedCurrent = String(editValue || current).toLowerCase()
        return (
          <select
            ref={editInputRef}
            className={`excel-cell-input status-dropdown status-${normalizedCurrent}`}
            value={editValue || current}
            onChange={(e) => {
              setEditValue(e.target.value)
              saveCell(request.id, field, e.target.value, true)
            }}
            onBlur={() => handleInputBlur(request.id, field)}
            onKeyDown={(e) => handleInputKeyDown(e, request.id, field)}
            onClick={(e) => e.stopPropagation()}
          >
            {allowed.map((opt) => (
              <option key={opt} value={opt}>
                {getStatusLabel(opt, language)}
              </option>
            ))}
          </select>
        )
      } else if (field === 'print_invoice') {
        return (
          <input
            ref={editInputRef}
            type="checkbox"
            className="excel-cell-input"
            checked={editValue === 'true' || editValue === true}
            onChange={(e) => {
              const newValue = e.target.checked ? 'true' : 'false'
              setEditValue(newValue)
              saveCell(request.id, field, newValue, true)
            }}
            onBlur={() => handleInputBlur(request.id, field)}
            onClick={(e) => e.stopPropagation()}
          />
        )
      } else if (field === 'airlines') {
        return (
          <AirlinesAutocomplete
            value={editValue}
            onChange={(value) => {
              setEditValue(value)
            }}
            onBlur={() => handleInputBlur(request.id, field)}
            onSelect={(formattedValue) => {
              const safe = formattedValue || formatAirlineDisplay(editValue)
              setEditValue(safe)
              saveCell(request.id, field, safe, true)
            }}
            disabled={false}
          />
        )
      } else if (field === 'departure_airport' || field === 'destination_airport') {
        return (
          <AirportAutocomplete
            value={editValue}
            onChange={(value) => {
              setEditValue(value)
              saveCell(request.id, field, value, true)
            }}
            onBlur={() => handleInputBlur(request.id, field)}
            disabled={false}
          />
        )
      } else if (field === 'notice') {
        return (
          <textarea
            ref={editInputRef}
            className="excel-cell-textarea"
            value={editValue}
            onChange={handleInputChange}
            onBlur={() => handleInputBlur(request.id, field)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                  cancelEditing()
                }
              // Allow Enter for newlines in textarea
            }}
            onClick={(e) => e.stopPropagation()}
            rows={3}
          />
        )
      } else if (['airlines_price', 'service_fee', 'visa_price', 'service_visa', 'cash_paid', 'bank_transfer', 'commission_from_airlines', 'lst_loan_fee', 'total_ticket_price', 'tot_visa_fees', 'total_amount_due'].includes(field)) {
        return (
          <input
            ref={editInputRef}
            type="number"
            step="0.01"
            min={field === 'airlines_price' || field === 'service_fee' ? '0' : undefined}
            className="excel-cell-input"
            value={editValue}
            onChange={handleInputChange}
            onBlur={() => handleInputBlur(request.id, field)}
            onKeyDown={(e) => handleInputKeyDown(e, request.id, field)}
            onClick={(e) => e.stopPropagation()}
          />
        )
      } else {
        return (
          <input
            ref={editInputRef}
            type="text"
            className="excel-cell-input"
            value={editValue}
            onChange={handleInputChange}
            onBlur={() => handleInputBlur(request.id, field)}
            onKeyDown={(e) => handleInputKeyDown(e, request.id, field)}
            onClick={(e) => e.stopPropagation()}
          />
        )
      }
    } else {
      // Render display value
      const value = getCellValue(request, field, rowIndex)
      
      // Special handling for booking_status with color coding
      if (field === 'booking_status') {
        const status = request.booking_status || request.status || STATUS.DRAFT
        // Normalize status to lowercase for CSS class (database may have 'Draft', but CSS uses 'draft')
        const normalizedStatus = String(status).toLowerCase()
        return (
          <div
            className={`excel-cell excel-cell-editable status-dropdown-display status-${normalizedStatus}`}
            data-row-id={request.id}
            data-field={field}
            onClick={(e) => startEditing(request.id, field, e)}
          >
            {getStatusLabel(status, language) || '-'}
          </div>
        )
      }
      
      // Special handling for print_invoice checkbox display
      if (field === 'print_invoice') {
        return (
          <div
            className="excel-cell excel-cell-editable"
            data-row-id={request.id}
            data-field={field}
            onClick={(e) => startEditing(request.id, field, e)}
          >
            <input
              type="checkbox"
              checked={request.print_invoice || false}
              readOnly
              onClick={(e) => {
                e.stopPropagation()
                startEditing(request.id, field, e)
              }}
            />
          </div>
        )
      }
      
      // Special handling for total_amount_due with highlighting (single layer)
      if (field === 'total_amount_due') {
        return (
          <div
            className={`excel-cell ${isEditable(field) ? 'excel-cell-editable' : 'excel-cell-readonly'} td-total-amount-due excel-cell-total-amount-due`}
            data-is-total-amount-due="true"
            data-row-id={request.id}
            data-field={field}
            onClick={(e) => isEditable(field) && startEditing(request.id, field, e)}
          >
            {value || '-'}
          </div>
        )
      }
      
      // Special handling for payment_balance with label + color
      if (field === 'payment_balance') {
        const customerPayment = parseFloat(request.total_customer_payment || 0)
        const amountDue = parseFloat(request.total_amount_due || 0)
        const balance = customerPayment - amountDue
        let label = '-'
        let balanceClass = ''

        if (amountDue > 0 || customerPayment > 0) {
          if (balance === 0) {
            label = 'Fully Paid'
            balanceClass = 'payment-balance-positive'
          } else if (balance < 0) {
            label = `Underpaid: ${formatCurrency(Math.abs(balance))}`
            balanceClass = 'payment-balance-negative'
          } else {
            label = `Overpaid: ${formatCurrency(balance)}`
            balanceClass = 'payment-balance-warning'
          }
        }

        return (
          <div
            className={`excel-cell excel-cell-readonly ${balanceClass}`}
            data-row-id={request.id}
            data-field={field}
          >
            {label}
          </div>
        )
      }
      
      // Special handling for notice field (multiline)
      if (field === 'notice') {
        return (
          <div
            className="excel-cell excel-cell-editable excel-cell-multiline"
            data-row-id={request.id}
            data-field={field}
            onClick={(e) => startEditing(request.id, field, e)}
          >
            {value || '-'}
          </div>
        )
      }
      
      // Default rendering
      return (
        <div
          className={`excel-cell ${isEditable(field) ? 'excel-cell-editable' : 'excel-cell-readonly'}`}
          data-row-id={request.id}
          data-field={field}
          onClick={(e) => isEditable(field) && startEditing(request.id, field, e)}
        >
          {value || '-'}
        </div>
      )
    }
  }

  // Get column order (matching table structure)
  const columnOrder = [
    'select',
    'row_number',
    'booking_ref',
    'booking_status',
    'invoice_action',
    'first_name',
    'middle_name',
    'last_name',
    'date_of_birth',
    'gender',
    'passport_number',
    'departure_airport',
    'destination_airport',
    'travel_date',
    'return_date',
    'airlines',
    'request_types',
    'airlines_price',
    'service_fee',
    'total_ticket_price',
    'visa_price',
    'service_visa',
    'tot_visa_fees',
    'total_amount_due',
    'cash_paid',
    'bank_transfer',
    'total_customer_payment',
    'payment_balance',
    'commission_from_airlines',
    'lst_loan_fee',
    'lst_profit',
    'notice',
    'created_at',
    'delete'
  ]

  // Get column label
  const getColumnLabel = (field) => {
    const labelMap = {
      select: '',
      row_number: '#',
      booking_ref: t.table.columns.bookingRef,
      booking_status: t.table.columns.bookingStatus,
      invoice_action: t.table.columns.invoiceAction,
      print_invoice: t.table.columns.printInvoice,
      first_name: t.table.columns.firstName,
      middle_name: t.table.columns.middleName,
      last_name: t.table.columns.lastName,
      date_of_birth: t.table.columns.dateOfBirth,
      gender: t.table.columns.gender,
      passport_number: t.table.columns.passportNumber,
      departure_airport: t.table.columns.departure,
      destination_airport: t.table.columns.destination,
      travel_date: t.table.columns.travelDate,
      return_date: t.table.columns.returnDate,
      airlines: t.table.columns.airlines,
      request_types: t.table.columns.requestTypes,
      airlines_price: t.table.columns.airlinesPrice,
      service_fee: t.table.columns.serviceFee,
      total_ticket_price: t.table.columns.totalTicketPrice,
      visa_price: t.table.columns.visaPrice,
      service_visa: t.table.columns.serviceVisa,
      tot_visa_fees: t.table.columns.totVisaFees,
      total_amount_due: t.table.columns.totalAmountDue,
      cash_paid: t.table.columns.cashPaid,
      bank_transfer: t.table.columns.bankTransfer,
      total_customer_payment: t.table.columns.totalCustomerPayment,
      payment_balance: t.table.columns.paymentBalance,
      commission_from_airlines: t.table.columns.commissionFromAirlines,
      lst_loan_fee: t.table.columns.lstLoanFee,
      lst_profit: t.table.columns.lstProfit,
      notice: t.table.columns.notice,
      created_at: t.table.columns.createdAt,
      delete: t.table.delete
    }
    return labelMap[field] || field
  }

  // Apply date filter first, then search filter
  const dateFilteredRequests = filterByDate(requests, dateFilter)
  
  // Filter requests based on search term (client-side only, on date-filtered data)
  const filteredRequests = searchTerm.trim() === '' 
    ? dateFilteredRequests 
    : dateFilteredRequests.filter(request => {
        const searchLower = searchTerm.toLowerCase()
        const searchableFields = [
          request.first_name || '',
          request.middle_name || '',
          request.last_name || '',
          request.passport_number || '',
          request.departure_airport || '',
          request.destination_airport || ''
        ]
        return searchableFields.some(field => 
          field.toLowerCase().includes(searchLower)
        )
      })

  // Group filtered requests by month
  const groupedRequests = groupByMonth(filteredRequests)

  const visibleRequests = groupedRequests.flatMap(group => group.requests)
  const visibleIds = visibleRequests.map(r => r.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id))
  const someVisibleSelected = visibleIds.some(id => selectedIds.includes(id)) && !allVisibleSelected
  const selectedCount = selectedIds.length

  return (
    <div className="page-layout">
      {/* Sidebar - Same as CreateRequest */}
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
          <NavLink to="/main" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span>{t.sidebar.mainTable}</span>
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <span>{t.sidebar.dashboard}</span>
          </NavLink>
          <NavLink to="/requests" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>{t.sidebar.requests}</span>
          </NavLink>
          <NavLink to="/bookings" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>{t.sidebar.bookings}</span>
          </NavLink>
          <NavLink to="/invoices" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
              <path d="M9 9h1v6h-1"/>
            </svg>
            <span>{t.sidebar.invoices}</span>
          </NavLink>
          <NavLink to="/expenses" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span>{t.sidebar.expenses}</span>
          </NavLink>
          <NavLink to="/customers" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>{t.sidebar.customers}</span>
          </NavLink>
          <NavLink to="/bank" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <path d="M2 10h20"/>
              <path d="M7 14h.01"/>
              <path d="M11 14h.01"/>
            </svg>
            <span>{t.sidebar.bank}</span>
          </NavLink>
          <NavLink to="/tax" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <img src={taxLogo} alt="TAX" width="24" height="24" />
            <span>{t.sidebar.tax}</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <img src={settingLogo} alt="Settings" width="24" height="24" />
            <span>{t.sidebar.settings || 'Settings'}</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-text">{t.sidebar.footer}</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
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
          {!loading && !error && requests.length === 0 && (
            <div className="requests-empty-state">
              <div className="empty-state-content">
                <p className="empty-state-title">No requests yet</p>
                <p className="empty-state-description">Get started by creating your first request</p>
                <Link to="/requests/new" className="button button-primary">
                  + Create first request
                </Link>
              </div>
            </div>
          )}

          {!loading && !error && requests.length > 0 && (
            <div className="excel-table-container" ref={tableRef}>
              <table className="excel-table">
                <tbody>
                  {/* Query Bar - First (Top) - Always visible when requests exist */}
                  <tr className="query-bar-row">
                    <td colSpan={columnOrder.length} className="query-bar-cell">
                      <div className="query-bar">
                        <div className="query-bar-left">
                          <input
                            type="text"
                            className="query-search-input"
                            placeholder="Search name, passport, or airport…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <div className="group-invoice-actions">
                            <button
                              type="button"
                              className="button button-primary"
                              onClick={() => handleGenerateGroupInvoice('preview')}
                              disabled={selectedCount === 0}
                            >
                              Group invoice ({selectedCount})
                            </button>
                            {selectedCount > 0 && (
                              <button
                                type="button"
                                className="button button-secondary"
                                onClick={() => setSelectedIds([])}
                              >
                                Clear selection
                              </button>
                            )}
                          </div>
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
                            
                            {/* Month dropdown - shown when Time = "This Year" */}
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
                            
                            {/* Month dropdown - shown when a previous year is selected */}
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
                  {/* Current Month Header - Always visible below Query Bar */}
                  <tr className="excel-group-header">
                    <td colSpan={columnOrder.length}>
                      <div className="excel-group-header-content">
                        <span className="excel-group-label">
                          {(() => {
                            const now = new Date()
                            return now.toLocaleString('en-US', { month: 'long', year: 'numeric' })
                          })()}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {/* Table Column Headers - Always visible below Month Header */}
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
                        {field === 'select' ? (
                          <label className="excel-header-select">
                            <input
                              type="checkbox"
                              checked={allVisibleSelected}
                              ref={(el) => {
                                if (el) {
                                  el.indeterminate = someVisibleSelected
                                }
                              }}
                              onChange={() => handleSelectAllVisible(visibleIds, !allVisibleSelected)}
                              aria-label="Select all visible passengers"
                            />
                          </label>
                        ) : (
                          <>
                            <span className="excel-header-label">{getColumnLabel(field)}</span>
                            <div
                              className="excel-resize-handle"
                              onMouseDown={(e) => handleResizeStart(field, e)}
                              onDoubleClick={(e) => handleResizeDoubleClick(field, e)}
                              title="Drag to resize, double-click to auto-fit"
                            />
                          </>
                        )}
                        </th>
                      )
                    })}
                  </tr>
                  {groupedRequests.length === 0 ? (
                    <tr>
                      <td colSpan={columnOrder.length} style={{ textAlign: 'center', padding: '2rem' }}>
                        {dateFilter || searchTerm.trim() ? 'No matching records found.' : t.table.noRequests}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {(() => {
                        // Flatten grouped requests to calculate row numbers
                        const flatRequests = groupedRequests.flatMap(group => group.requests)
                        return flatRequests.map((request, index) => (
                          <tr key={request.id}>
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
                                  {renderCell(request, field, index)}
                                </td>
                              )
                            })}
                          </tr>
                        ))
                      })()}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && !error && requests.length > 0 && groupedRequests.length > 0 && (
            <div className="pagination-controls">
              <div className="pagination-info">
                Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalCount)} of {totalCount}
              </div>
              <div className="pagination-buttons">
                <button
                  className="pagination-button"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || loading}
                >
                  ◀ Previous
                </button>
                <button
                  className="pagination-button"
                  onClick={handleNextPage}
                  disabled={currentPage >= Math.ceil(totalCount / pageSize) || loading}
                >
                  Next ▶
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default RequestsList
