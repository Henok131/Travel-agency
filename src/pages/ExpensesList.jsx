import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../contexts/StoreContext'
import logo from '../assets/logo.png'
import taxLogo from '../assets/tax-logo.png'
import settingLogo from '../assets/setting-logo.png'
import './RequestsList.css' // Use same CSS as Requests table for Excel-like styling
import './ExpensesList.css' // Modal styles

const fetch = () => Promise.resolve()

// SKR03 Tax Categories (German tax chart of accounts)
const SKR03_CATEGORIES = [
  { code: "4210", name: "Vehicle Expenses", deductible: 100 },
  { code: "4800", name: "Miscellaneous", deductible: 100 },
  { code: "4890", name: "Bank Fees", deductible: 100 },
  { code: "4910", name: "Telephone & Internet", deductible: 100 },
  { code: "4920", name: "Office Rent", deductible: 100 },
  { code: "4930", name: "Utilities", deductible: 100 },
  { code: "4940", name: "Office Supplies", deductible: 100 },
  { code: "4960", name: "Software & Tools", deductible: 100 },
  { code: "6000", name: "Staff Salary", deductible: 100 },
  { code: "6300", name: "Travel Expenses", deductible: 100 },
  { code: "6400", name: "Advertising & Marketing", deductible: 100 },
  { code: "6805", name: "Meal & Entertainment", deductible: 70 },
  { code: "6825", name: "Training & Education", deductible: 100 },
  { code: "6850", name: "Legal & Consulting", deductible: 100 }
]

// Map old categories to SKR03 codes for migration
const OLD_TO_SKR03_MAP = {
  'Office Rent': '4920',
  'Internet & Phone': '4910',
  'Utilities (Electricity / Water)': '4930',
  'Staff Salary': '6000',
  'Marketing & Ads': '6400',
  'Meal & Entertainment': '6805',
  'Software / Tools': '4960',
  'Miscellaneous': '4800'
}

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
      title: 'Expenses',
      loading: 'Loading expenses...',
      noExpenses: 'No expenses found.',
      error: 'Error loading expenses',
      refresh: 'Refresh',
      addExpense: 'Add Expense',
      search: {
        placeholder: 'Search by category, description, payment method, invoice number, or vendor...'
      },
      pagination: {
        previous: 'Previous',
        next: 'Next',
        showing: 'Showing',
        to: 'to',
        ofTotal: 'of'
      },
      columns: {
        rowNumber: '#',
        expenseDate: 'Expense Date',
        category: 'Category',
        paymentMethod: 'Payment Method',
        amount: 'Amount',
        grossAmount: 'Gross Amount',
        vatRate: 'VAT Rate',
        netAmount: 'Net Amount',
        vatAmount: 'VAT Amount',
        invoiceNumber: 'Invoice Number',
        vendorName: 'Vendor Name',
        currency: 'Currency',
        description: 'Description',
        receiptUrl: 'Receipt URL',
        createdAt: 'Created At'
      },
      categories: {
        officeRent: 'Office Rent',
        internetPhone: 'Internet & Phone',
        utilities: 'Utilities (Electricity / Water)',
        staffSalary: 'Staff Salary',
        marketingAds: 'Marketing & Ads',
        mealEntertainment: 'Meal & Entertainment',
        softwareTools: 'Software / Tools',
        miscellaneous: 'Miscellaneous'
      },
      paymentMethods: {
        cash: 'Cash',
        bankTransfer: 'Bank Transfer',
        card: 'Card'
      }
    },
    modal: {
      title: 'Add Expense',
      expenseDate: 'Expense Date',
      category: 'Category',
      paymentMethod: 'Payment Method',
      amount: 'Amount Paid (Gross)',
      grossAmount: 'Amount Paid (Gross)',
      vatRate: 'VAT Rate',
      netAmount: 'Net Amount',
      vatAmount: 'VAT Amount',
      invoiceNumber: 'Invoice/Receipt Number',
      vendorName: 'Vendor / Paid To',
      currency: 'Currency',
      description: 'Description',
      receiptUrl: 'Receipt URL',
      uploadDocument: 'Upload Document',
      uploading: 'Uploading...',
      cancel: 'Cancel',
      submit: 'Add Expense',
      submitting: 'Adding...',
      success: 'Expense added successfully!',
      error: 'Failed to add expense. Please try again.'
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
      title: 'Ausgaben',
      loading: 'Ausgaben werden geladen...',
      noExpenses: 'Keine Ausgaben gefunden.',
      error: 'Fehler beim Laden der Ausgaben',
      refresh: 'Aktualisieren',
      addExpense: 'Ausgabe hinzufügen',
      search: {
        placeholder: 'Suche nach Kategorie, Beschreibung, Zahlungsmethode, Rechnungsnummer oder Lieferant...'
      },
      pagination: {
        previous: 'Zurück',
        next: 'Weiter',
        showing: 'Zeige',
        to: 'bis',
        ofTotal: 'von'
      },
      columns: {
        rowNumber: '#',
        expenseDate: 'Ausgabedatum',
        category: 'Kategorie',
        paymentMethod: 'Zahlungsmethode',
        amount: 'Betrag',
        grossAmount: 'Bruttobetrag',
        vatRate: 'MwSt-Satz',
        netAmount: 'Nettobetrag',
        vatAmount: 'MwSt-Betrag',
        invoiceNumber: 'Rechnungsnummer',
        vendorName: 'Lieferant',
        currency: 'Währung',
        description: 'Beschreibung',
        receiptUrl: 'Beleg-URL',
        createdAt: 'Erstellt am'
      },
      categories: {
        officeRent: 'Büromiete',
        internetPhone: 'Internet & Telefon',
        utilities: 'Versorgungsunternehmen (Strom / Wasser)',
        staffSalary: 'Mitarbeitergehalt',
        marketingAds: 'Marketing & Werbung',
        mealEntertainment: 'Mahlzeiten & Unterhaltung',
        softwareTools: 'Software / Tools',
        miscellaneous: 'Verschiedenes'
      },
      paymentMethods: {
        cash: 'Bargeld',
        bankTransfer: 'Überweisung',
        card: 'Karte'
      }
    },
    modal: {
      title: 'Ausgabe hinzufügen',
      expenseDate: 'Ausgabedatum',
      category: 'Kategorie',
      paymentMethod: 'Zahlungsmethode',
      amount: 'Gezahlter Betrag (Brutto)',
      grossAmount: 'Gezahlter Betrag (Brutto)',
      vatRate: 'MwSt-Satz',
      netAmount: 'Nettobetrag',
      vatAmount: 'MwSt-Betrag',
      invoiceNumber: 'Rechnungs-/Belegnummer',
      vendorName: 'Lieferant / Gezahlt an',
      currency: 'Währung',
      description: 'Beschreibung',
      receiptUrl: 'Beleg-URL',
      uploadDocument: 'Dokument hochladen',
      uploading: 'Wird hochgeladen...',
      cancel: 'Abbrechen',
      submit: 'Ausgabe hinzufügen',
      submitting: 'Hinzufügen...',
      success: 'Ausgabe erfolgreich hinzugefügt!',
      error: 'Fehler beim Hinzufügen der Ausgabe. Bitte versuchen Sie es erneut.'
    }
  }
}

function ExpensesList() {
  const { store } = useStore()
  const [language, setLanguage] = useState('en')
  const t = translations[language]
  
  const [theme, setTheme] = useState('dark')
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(50) // Fixed page size
  const [totalCount, setTotalCount] = useState(0)
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('')
  
  // Date filter state (default to 'thisMonth')
  const [dateFilter, setDateFilter] = useState('thisMonth') // 'today' | 'thisMonth' | 'thisYear' | 'year_YYYY' | null
  
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
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState(null)
  const [submitError, setSubmitError] = useState(false)
  
  // Form state for modal
  const [formData, setFormData] = useState({
    expense_date: '',
    category: '',
    payment_method: '',
    gross_amount: '',
    vat_rate: '19',
    net_amount: '',
    vat_amount: '',
    invoice_number: '',
    vendor_name: '',
    currency: 'EUR',
    description: '',
    receipt_url: ''
  })
  
  // File upload state
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const fileInputRef = useRef(null)
  
  // Column resizing state
  const [columnWidths, setColumnWidths] = useState({
    row_number: 60,
    expense_date: 120,
    category: 180,
    payment_method: 130,
    gross_amount: 110,
    vat_rate: 90,
    net_amount: 110,
    vat_amount: 110,
    invoice_number: 140,
    vendor_name: 150,
    description: 200,
    receipt_url: 150,
    created_at: 150
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

  // Column resizing handlers - Excel-like behavior
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

  // Excel-like: Double-click to auto-fit column width
  const handleResizeDoubleClick = (field, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    let maxWidth = 100
    
    // Use all expenses for auto-fit calculation
    expenses.forEach(expense => {
      const value = getCellValue(expense, field)
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

  // Fetch expenses from mock store with pagination
  const fetchExpenses = async (page) => {
    try {
      setLoading(true)
      setError(null)
      
      const offset = (page - 1) * pageSize
      
      // Get all expenses from mock store
      const allExpenses = store.expenses.getAll()
      
      // Sort by expense_date descending, then created_at descending
      const sortedExpenses = [...allExpenses].sort((a, b) => {
        const dateA = new Date(a.expense_date || a.created_at || 0)
        const dateB = new Date(b.expense_date || b.created_at || 0)
        if (dateB.getTime() !== dateA.getTime()) {
          return dateB - dateA
        }
        const createdA = new Date(a.created_at || 0)
        const createdB = new Date(b.created_at || 0)
        return createdB - createdA
      })
      
      setTotalCount(sortedExpenses.length)
      
      // Paginate
      const data = sortedExpenses.slice(offset, offset + pageSize)
      setExpenses(data || [])
    } catch (err) {
      console.error('Error fetching expenses:', err)
      setError(err.message || t.table.error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses(currentPage)
    // Subscribe to store changes for reactive updates
    const unsubscribe = store.subscribe(() => {
      fetchExpenses(currentPage)
    })
    return unsubscribe
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

  // Convert date from YYYY-MM-DD to DD-MM-YYYY for display
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  // Format datetime as "DD-MM-YYYY, HH:MM"
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

  // Format currency
  const formatCurrency = (amount, currency = 'EUR') => {
    if (amount === null || amount === undefined) return '-'
    return new Intl.NumberFormat(language === 'de' ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
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

  // Filter expenses by date range (using expense_date, not created_at)
  const filterByDate = (expenses, filterType) => {
    if (!filterType) return expenses
    
    let year = selectedYear
    if (filterType && filterType.startsWith('year_')) {
      const extractedYear = parseInt(filterType.replace('year_', ''), 10)
      if (!isNaN(extractedYear)) {
        year = extractedYear
      }
    }
    
    const range = getDateFilterRange(filterType, selectedMonth, year)
    if (!range) return expenses
    
    return expenses.filter(expense => {
      if (!expense.expense_date) return false
      
      const expenseDate = new Date(expense.expense_date)
      expenseDate.setHours(0, 0, 0, 0)
      
      if (range.startDate && expenseDate < range.startDate) return false
      if (range.endDate) {
        const endDate = new Date(range.endDate)
        endDate.setHours(23, 59, 59, 999)
        if (expenseDate > endDate) return false
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

  // Get all previous years (from current year going back)
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

  // Group expenses by month and year (using expense_date)
  const groupByMonth = (expenses) => {
    const groups = {}
    
    expenses.forEach(expense => {
      if (!expense.expense_date) return
      
      const date = new Date(expense.expense_date)
      const month = date.getMonth()
      const year = date.getFullYear()
      const key = `${year}-${String(month + 1).padStart(2, '0')}`
      
      if (!groups[key]) {
        groups[key] = {
          key,
          year,
          month,
          monthName: date.toLocaleString('en-US', { month: 'long' }),
          expenses: []
        }
      }
      
      groups[key].expenses.push(expense)
    })
    
    return Object.values(groups).sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year
      return b.month - a.month
    })
  }

  // Initialize expanded groups (current month expanded by default)
  useEffect(() => {
    if (expenses.length > 0 && expandedGroups.size === 0) {
      const now = new Date()
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      setExpandedGroups(new Set([currentMonthKey]))
    }
  }, [expenses.length])

  // Calculate VAT amounts from gross amount and VAT rate (real-time)
  const calculateVAT = (grossAmount, vatRate) => {
    const gross = parseFloat(grossAmount) || 0
    const rate = parseFloat(vatRate) || 0
    
    if (gross === 0) {
      return { net: 0, vat: 0 }
    }
    
    const net = gross / (1 + (rate / 100))
    const vat = gross - net
    
    return {
      net: Math.round(net * 100) / 100,
      vat: Math.round(vat * 100) / 100
    }
  }

  // Calculate VAT amounts from gross amount and VAT rate (legacy - kept for backward compatibility)
  const calculateVATAmounts = (grossAmount, vatRate) => {
    const result = calculateVAT(grossAmount, vatRate)
    return {
      netAmount: result.net,
      vatAmount: result.vat
    }
  }

  // Calculate gross amount from net amount and VAT rate
  const calculateGrossFromNet = (netAmount, vatRate) => {
    if (!netAmount || !vatRate) return null
    const net = parseFloat(netAmount)
    const rate = parseFloat(vatRate) / 100
    return Math.round((net * (1 + rate)) * 100) / 100
  }

  // Helper function to get SKR03 category by code or name
  const getSKR03Category = (codeOrName) => {
    return SKR03_CATEGORIES.find(cat => cat.code === codeOrName || cat.name === codeOrName)
  }

  // Helper function to get SKR03 category by old category name (for migration)
  const getSKR03ByOldCategory = (oldCategory) => {
    const code = OLD_TO_SKR03_MAP[oldCategory]
    return code ? getSKR03Category(code) : null
  }

  // Get cell value for display
  const getCellValue = (expense, field, rowIndex = null) => {
    if (field === 'row_number') {
      return rowIndex !== null ? String(rowIndex + 1) : ''
    }
    switch (field) {
      case 'expense_date':
        return formatDateForDisplay(expense[field])
      case 'created_at':
        return formatDateTime(expense[field])
      case 'amount':
      case 'gross_amount':
      case 'net_amount':
      case 'vat_amount':
        return formatCurrency(expense[field], expense.currency)
      case 'vat_rate':
        return expense[field] ? `${parseFloat(expense[field]).toFixed(0)}%` : ''
      case 'category':
        // Display category name only (hide SKR03 code in table view)
        return expense[field] || ''
      case 'payment_method':
        const methodMap = {
          'Cash': t.table.paymentMethods.cash,
          'Bank Transfer': t.table.paymentMethods.bankTransfer,
          'Card': t.table.paymentMethods.card
        }
        return expense[field] ? (methodMap[expense[field]] || expense[field]) : ''
      default:
        return expense[field] || ''
    }
  }

  // Get raw cell value for editing
  const getRawCellValue = (expense, field) => {
    switch (field) {
      case 'amount':
      case 'gross_amount':
      case 'net_amount':
      case 'vat_amount':
        return expense[field] !== null && expense[field] !== undefined ? String(expense[field]) : ''
      case 'vat_rate':
        // Return as integer for dropdown (19, 7, 0)
        return expense[field] !== null && expense[field] !== undefined ? String(Math.round(parseFloat(expense[field]))) : '19'
      default:
        return expense[field] || ''
    }
  }

  // Start editing a cell
  const startEditing = (rowId, field, e) => {
    e.stopPropagation()
    const expense = expenses.find(e => e.id === rowId)
    if (!expense) return

    // Don't allow editing of readonly fields
    if (field === 'created_at' || field === 'id' || field === 'expense_date' || field === 'updated_at') return

    const rawValue = getRawCellValue(expense, field)
    setEditingCell({ rowId, field })
    setEditValue(rawValue)
    setOriginalValue(rawValue)
    
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus()
        editInputRef.current.select()
      }
    }, 0)
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingCell(null)
    setEditValue('')
    setOriginalValue('')
  }

  // Save cell value
  const saveCell = async (rowId, field, value, skipCancel = false) => {
    const expense = expenses.find(e => e.id === rowId)
    if (!expense) return

    let dbValue = value.trim()
    
    // Handle numeric fields (convert to number)
    const numericFields = ['amount', 'gross_amount', 'net_amount', 'vat_amount', 'vat_rate']
    if (numericFields.includes(field)) {
      const numValue = parseFloat(dbValue)
      if (isNaN(numValue) && dbValue !== '') {
        if (!skipCancel) cancelEditing()
        return
      }
      dbValue = dbValue === '' ? null : numValue
    }

    // Store original expenses for rollback
    const originalExpenses = [...expenses]

    // Update local state optimistically
    const updatedExpenses = expenses.map(e => {
      if (e.id === rowId) {
        const updated = { ...e }
        
        // Real-time VAT calculations when gross_amount or vat_rate changes
        if (field === 'gross_amount' || field === 'vat_rate') {
          const grossAmount = field === 'gross_amount' ? dbValue : (updated.gross_amount || expense.gross_amount)
          const vatRate = field === 'vat_rate' ? dbValue : (updated.vat_rate || expense.vat_rate || 19)
          
          // Use calculateVAT for real-time updates
          const calculated = calculateVAT(grossAmount, vatRate)
          updated.gross_amount = grossAmount
          updated.amount = grossAmount // Backward compatibility
          updated.vat_rate = vatRate
          updated.net_amount = calculated.net
          updated.vat_amount = calculated.vat
        } else if (field === 'category') {
          // Update category and set tax_category_code and deductible_percentage
          const skr03Category = getSKR03Category(dbValue)
          updated.category = dbValue || null
          updated.tax_category_code = skr03Category ? skr03Category.code : null
          updated.deductible_percentage = skr03Category ? skr03Category.deductible : 100.00
        } else if (field === 'net_amount') {
          const netAmount = dbValue
          const vatRate = updated.vat_rate || expense.vat_rate || 19.00
          
          if (netAmount && vatRate) {
            const grossAmount = calculateGrossFromNet(netAmount, vatRate)
            const vatAmount = grossAmount - netAmount
            updated.net_amount = netAmount
            updated.gross_amount = grossAmount
            updated.vat_rate = vatRate
            updated.vat_amount = Math.round(vatAmount * 100) / 100
          } else {
            updated[field] = dbValue
          }
        } else {
          updated[field] = dbValue || null
        }
        
        return updated
      }
      return e
    })
    setExpenses(updatedExpenses)

    // Update backend
    try {
      const updateData = {}
      const updatedExpense = updatedExpenses.find(e => e.id === rowId)
      
      if (field === 'gross_amount' || field === 'vat_rate' || field === 'net_amount') {
        // Update all VAT-related fields together
        updateData.gross_amount = updatedExpense.gross_amount
        updateData.vat_rate = updatedExpense.vat_rate
        updateData.net_amount = updatedExpense.net_amount
        updateData.vat_amount = updatedExpense.vat_amount
        // Also update amount field for backward compatibility
        updateData.amount = updatedExpense.gross_amount
      } else if (field === 'category') {
        // Update category and tax fields together
        updateData.category = updatedExpense.category
        updateData.tax_category_code = updatedExpense.tax_category_code
        updateData.deductible_percentage = updatedExpense.deductible_percentage
      } else {
        updateData[field] = updatedExpense[field]
      }

      // Ensure organization_id is included in update if organization exists
      if (organization?.id && !updateData.organization_id) {
        updateData.organization_id = organization.id
      }
      
      let updateQuery = supabase
        .from('expenses')
        .update(updateData)
        .eq('id', rowId)
      
      // Add organization_id filter if organization exists
      if (organization?.id) {
        updateQuery = updateQuery.eq('organization_id', organization.id)
      }
      
      const { error: updateError } = await updateQuery

      if (updateError) {
        throw updateError
      }
    } catch (err) {
      console.error('Error updating cell:', err)
      // Revert on error
      setExpenses(originalExpenses)
      alert(`Error updating ${field}: ${err.message}`)
    }

    if (!skipCancel) {
      cancelEditing()
    }
  }

  // Handle input change with real-time VAT calculations
  const handleInputChange = (e) => {
    const value = e.target.value
    setEditValue(value)
    
    // Real-time VAT calculation for gross_amount inline editing
    if (editingCell && editingCell.field === 'gross_amount') {
      const expense = expenses.find(e => e.id === editingCell.rowId)
      if (expense) {
        const grossAmount = parseFloat(value) || 0
        const vatRate = parseFloat(expense.vat_rate) || 19
        const calculated = calculateVAT(grossAmount, vatRate)
        
        // Update local state optimistically for immediate display
        setExpenses(prevExpenses => 
          prevExpenses.map(exp => 
            exp.id === editingCell.rowId 
              ? { ...exp, net_amount: calculated.net, vat_amount: calculated.vat }
              : exp
          )
        )
      }
    }
  }

  // Handle input blur (save on click outside)
  const handleInputBlur = (rowId, field) => {
    saveCell(rowId, field, editValue)
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
      e.preventDefault()
      saveCell(rowId, field, editValue)
      
      const currentRowIndex = expenses.findIndex(e => e.id === rowId)
      const columns = ['category', 'payment_method', 'amount', 'description']
      const currentColIndex = columns.indexOf(field)
      
      let newRowIndex = currentRowIndex
      let newColIndex = currentColIndex
      
      if (e.key === 'ArrowUp') {
        newRowIndex = Math.max(0, currentRowIndex - 1)
      } else if (e.key === 'ArrowDown') {
        newRowIndex = Math.min(expenses.length - 1, currentRowIndex + 1)
      } else if (e.key === 'ArrowLeft') {
        newColIndex = Math.max(0, currentColIndex - 1)
      } else if (e.key === 'ArrowRight' || e.key === 'Tab') {
        newColIndex = Math.min(columns.length - 1, currentColIndex + 1)
        if (e.key === 'Tab' && newColIndex === currentColIndex) {
          newRowIndex = Math.min(expenses.length - 1, currentRowIndex + 1)
          newColIndex = 0
        }
      }
      
      if (newRowIndex >= 0 && newRowIndex < expenses.length && newColIndex >= 0 && newColIndex < columns.length) {
        const newRowId = expenses[newRowIndex].id
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
    return field !== 'id' && 
           field !== 'created_at' && 
           field !== 'updated_at' && 
           field !== 'row_number' && 
           field !== 'expense_date' && 
           field !== 'currency' && 
           field !== 'receipt_url' &&
           field !== 'net_amount' &&  // Read-only (calculated)
           field !== 'vat_amount' &&  // Read-only (calculated)
           (field === 'category' || 
            field === 'payment_method' || 
            field === 'gross_amount' || 
            field === 'vat_rate' || 
            field === 'invoice_number' || 
            field === 'vendor_name' || 
            field === 'description')
  }

  // Render cell content
  const renderCell = (expense, field, rowIndex = null) => {
    if (field === 'row_number') {
      return (
        <div className="excel-cell">
          {rowIndex !== null ? String(rowIndex + 1) : ''}
        </div>
      )
    }
    
    if (editingCell && editingCell.rowId === expense.id && editingCell.field === field) {
      // Render input for editing
      if (field === 'category') {
        return (
          <select
            ref={editInputRef}
            className="excel-cell-input"
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value)
              saveCell(expense.id, field, e.target.value, true)
            }}
            onBlur={() => handleInputBlur(expense.id, field)}
            onKeyDown={(e) => handleInputKeyDown(e, expense.id, field)}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">-</option>
            {SKR03_CATEGORIES.map(cat => (
              <option key={cat.code} value={cat.name}>
                {cat.name} ({cat.code})
              </option>
            ))}
          </select>
        )
      } else if (field === 'payment_method') {
        return (
          <select
            ref={editInputRef}
            className="excel-cell-input"
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value)
              saveCell(expense.id, field, e.target.value, true)
            }}
            onBlur={() => handleInputBlur(expense.id, field)}
            onKeyDown={(e) => handleInputKeyDown(e, expense.id, field)}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">-</option>
            <option value="Cash">{t.table.paymentMethods.cash}</option>
            <option value="Bank Transfer">{t.table.paymentMethods.bankTransfer}</option>
            <option value="Card">{t.table.paymentMethods.card}</option>
          </select>
        )
      } else if (field === 'gross_amount') {
        return (
          <input
            ref={editInputRef}
            type="number"
            step="0.01"
            className="excel-cell-input"
            value={editValue}
            onChange={handleInputChange}
            onBlur={() => handleInputBlur(expense.id, field)}
            onKeyDown={(e) => handleInputKeyDown(e, expense.id, field)}
            onClick={(e) => e.stopPropagation()}
          />
        )
      } else if (field === 'vat_rate') {
        return (
          <select
            ref={editInputRef}
            className="excel-cell-input"
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value)
              saveCell(expense.id, field, e.target.value, true)
            }}
            onBlur={() => handleInputBlur(expense.id, field)}
            onKeyDown={(e) => handleInputKeyDown(e, expense.id, field)}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="19">19%</option>
            <option value="7">7%</option>
            <option value="0">0%</option>
          </select>
        )
      } else {
        return (
          <input
            ref={editInputRef}
            type="text"
            className="excel-cell-input"
            value={editValue}
            onChange={handleInputChange}
            onBlur={() => handleInputBlur(expense.id, field)}
            onKeyDown={(e) => handleInputKeyDown(e, expense.id, field)}
            onClick={(e) => e.stopPropagation()}
          />
        )
      }
    } else {
      // Render display value
      const value = getCellValue(expense, field, rowIndex)
      
      // Special handling for receipt_url - display as clickable link
      if (field === 'receipt_url' && expense.receipt_url) {
        return (
          <div
            className="excel-cell"
            data-row-id={expense.id}
            data-field={field}
          >
            <a
              href={expense.receipt_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                color: '#3b82f6',
                textDecoration: 'underline',
                cursor: 'pointer',
                wordBreak: 'break-all'
              }}
              title={expense.receipt_url}
            >
              View Document
            </a>
          </div>
        )
      }
      
      return (
        <div
          className={`excel-cell ${isEditable(field) ? 'excel-cell-editable' : ''}`}
          data-row-id={expense.id}
          data-field={field}
          onClick={(e) => isEditable(field) && startEditing(expense.id, field, e)}
        >
          {value || '-'}
        </div>
      )
    }
  }

  // Get column order
  const columnOrder = [
    'row_number',
    'expense_date',
    'category',
    'payment_method',
    'gross_amount',
    'vat_rate',
    'net_amount',
    'vat_amount',
    'invoice_number',
    'vendor_name',
    'description',
    'receipt_url',
    'created_at'
  ]

  // Get column label
  const getColumnLabel = (field) => {
    const labelMap = {
      row_number: '#',
      expense_date: t.table.columns.expenseDate,
      category: t.table.columns.category,
      payment_method: t.table.columns.paymentMethod,
      gross_amount: t.table.columns.grossAmount,
      vat_rate: t.table.columns.vatRate,
      net_amount: t.table.columns.netAmount,
      vat_amount: t.table.columns.vatAmount,
      invoice_number: t.table.columns.invoiceNumber,
      vendor_name: t.table.columns.vendorName,
      description: t.table.columns.description,
      receipt_url: t.table.columns.receiptUrl,
      created_at: t.table.columns.createdAt
    }
    return labelMap[field] || field
  }

  // Apply date filter first, then search filter
  const dateFilteredExpenses = filterByDate(expenses, dateFilter)
  
  // Filter expenses based on search term
  const filteredExpenses = searchTerm.trim() === '' 
    ? dateFilteredExpenses 
    : dateFilteredExpenses.filter(expense => {
        const searchLower = searchTerm.toLowerCase()
        const searchableFields = [
          expense.category || '',
          expense.description || '',
          expense.payment_method || '',
          expense.invoice_number || '',
          expense.vendor_name || ''
        ]
        return searchableFields.some(field => 
          field.toLowerCase().includes(searchLower)
        )
      })

  // Group filtered expenses by month
  const groupedExpenses = groupByMonth(filteredExpenses)

  // Modal handlers
  const handleOpenModal = () => {
    setIsModalOpen(true)
    setFormData({
      expense_date: getTodayDate(), // Default to today's date
      category: '',
      payment_method: '',
      gross_amount: '',
      vat_rate: '19',
      net_amount: '',
      vat_amount: '',
      invoice_number: '',
      vendor_name: '',
      currency: 'EUR',
      description: '',
      receipt_url: ''
    })
    setSubmitMessage(null)
    setSubmitError(false)
    setUploadingFile(false)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFormData({
      expense_date: '',
      category: '',
      payment_method: '',
      gross_amount: '',
      vat_rate: '19',
      net_amount: '',
      vat_amount: '',
      invoice_number: '',
      vendor_name: '',
      currency: 'EUR',
      description: '',
      receipt_url: ''
    })
    setSubmitMessage(null)
    setSubmitError(false)
    setUploadingFile(false)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFormInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Real-time VAT calculation when gross_amount or vat_rate changes
      if (field === 'gross_amount' || field === 'vat_rate') {
        const grossAmount = field === 'gross_amount' ? value : prev.gross_amount
        const vatRate = field === 'vat_rate' ? value : (prev.vat_rate || '19')
        
        // Use calculateVAT for real-time updates
        const calculated = calculateVAT(grossAmount, vatRate)
        updated.net_amount = calculated.net.toFixed(2)
        updated.vat_amount = calculated.vat.toFixed(2)
      }
      
      return updated
    })
  }

  // Compress image file - aggressive compression for small storage size
  const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.6) => {
    return new Promise((resolve, reject) => {
      // Only compress image files
      if (!file.type.startsWith('image/')) {
        resolve(file) // Return original file if not an image
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width
          let height = img.height

          // Resize if larger than max dimensions
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height * maxWidth) / width
              width = maxWidth
            } else {
              width = (width * maxHeight) / height
              height = maxHeight
            }
          }

          // Create canvas and compress
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')

          // Use high-quality image rendering for better compression results
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)

          // Determine output format - convert to JPEG for better compression (unless it's PNG with transparency)
          let outputType = 'image/jpeg'
          let outputQuality = quality

          // For PNG, check if it has transparency
          if (file.type === 'image/png') {
            // Check for transparency by examining alpha channel
            const imageData = ctx.getImageData(0, 0, width, height)
            const hasTransparency = imageData.data.some((_, i) => i % 4 === 3 && imageData.data[i] < 255)
            
            if (hasTransparency) {
              // Keep as PNG if transparency exists, but use lower quality
              outputType = 'image/png'
              outputQuality = 0.8 // PNG compression is different
            } else {
              // Convert to JPEG for better compression if no transparency
              outputType = 'image/jpeg'
              outputQuality = quality
            }
          }

          // Convert to blob with aggressive compression
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // If compressed file is larger than original, use original
                if (blob.size > file.size) {
                  console.log('Compression increased size, using original file')
                  resolve(file)
                  return
                }

                // Create a new File object with compressed data
                const fileName = file.name.replace(/\.(png|jpg|jpeg)$/i, outputType === 'image/jpeg' ? '.jpg' : '.png')
                const compressedFile = new File([blob], fileName, {
                  type: outputType,
                  lastModified: Date.now()
                })
                
                const originalSizeKB = (file.size / 1024).toFixed(2)
                const compressedSizeKB = (compressedFile.size / 1024).toFixed(2)
                const reduction = ((1 - compressedFile.size / file.size) * 100).toFixed(1)
                
                console.log(`✅ Compressed: ${originalSizeKB}KB → ${compressedSizeKB}KB (${reduction}% reduction)`)
                
                resolve(compressedFile)
              } else {
                reject(new Error('Failed to compress image'))
              }
            },
            outputType,
            outputQuality
          )
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target.result
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  // Compress PDF using a simple approach (for PDFs, we'll keep original but can add PDF.js compression later)
  const compressPDF = async (file) => {
    // For now, return original PDF
    // PDF compression requires server-side processing or specialized libraries
    // We'll keep PDFs as-is but can add compression later if needed
    return file
  }

  // Handle file upload with compression
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    setUploadError(null)

    try {
      let fileToUpload = file
      const originalSize = file.size

      // Compress images aggressively for small storage
      if (file.type.startsWith('image/')) {
        fileToUpload = await compressImage(file, 1200, 1200, 0.6) // Max 1200x1200, 60% quality for very small size
      } else if (file.type === 'application/pdf') {
        // For PDFs, we keep original (PDF compression requires server-side processing)
        // But enforce size limit
        if (file.size > 3 * 1024 * 1024) { // 3MB limit for PDFs
          setUploadError('PDF file is too large (max 3MB). Please compress it manually or use a smaller file.')
          setUploadingFile(false)
          return
        }
        fileToUpload = await compressPDF(file)
      } else {
        // For other file types (documents), enforce size limit
        if (file.size > 2 * 1024 * 1024) { // 2MB limit for other files
          setUploadError('File is too large (max 2MB). Please use a smaller file.')
          setUploadingFile(false)
          return
        }
      }

      // Generate unique filename
      const fileExt = fileToUpload.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `expenses/receipts/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('expenses')
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        // If bucket doesn't exist, show helpful error but allow manual URL entry
        if (uploadError.message?.includes('Bucket') || uploadError.message?.includes('not found')) {
          setUploadError('Storage bucket not configured. Please enter URL manually or contact administrator.')
        } else {
          throw uploadError
        }
        setUploadingFile(false)
        return
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('expenses')
        .getPublicUrl(filePath)

      // Update receipt_url with the public URL
      setFormData(prev => ({
        ...prev,
        receipt_url: urlData.publicUrl
      }))

      const compressedSize = fileToUpload.size
      const reduction = originalSize > 0 ? ((1 - compressedSize / originalSize) * 100).toFixed(1) : 0
      console.log(`Upload successful: ${(compressedSize / 1024).toFixed(2)}KB (${reduction}% size reduction)`)

      setUploadingFile(false)
    } catch (err) {
      console.error('Error uploading file:', err)
      setUploadError(err.message || 'Failed to upload file. You can still enter URL manually.')
      setUploadingFile(false)
    }
  }

  // Handle upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // Get today's date in DD-MM-YYYY format
  const getTodayDate = () => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const year = today.getFullYear()
    return `${day}-${month}-${year}`
  }

  // Convert date from DD-MM-YYYY to YYYY-MM-DD for database
  const convertDateToISO = (dateStr) => {
    if (!dateStr || dateStr.trim() === '') return null
    
    // Trim whitespace
    const trimmed = dateStr.trim()
    
    // Try DD-MM-YYYY format first
    const ddmmyyyyPattern = /^(\d{2})-(\d{2})-(\d{4})$/
    const match = trimmed.match(ddmmyyyyPattern)
    if (match) {
      const [, day, month, year] = match
      const dayNum = parseInt(day, 10)
      const monthNum = parseInt(month, 10)
      const yearNum = parseInt(year, 10)
      
      // Basic range validation
      if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900 || yearNum > 2100) {
        return null
      }
      
      // Validate actual calendar date (e.g., 31-02-2026 is invalid)
      const date = new Date(yearNum, monthNum - 1, dayNum)
      if (date.getFullYear() !== yearNum || date.getMonth() !== monthNum - 1 || date.getDate() !== dayNum) {
        return null
      }
      
      return `${year}-${month}-${day}`
    }
    
    // Try YYYY-MM-DD format (already ISO)
    const yyyymmddPattern = /^(\d{4})-(\d{2})-(\d{2})$/
    const isoMatch = trimmed.match(yyyymmddPattern)
    if (isoMatch) {
      const [, year, month, day] = isoMatch
      const dayNum = parseInt(day, 10)
      const monthNum = parseInt(month, 10)
      const yearNum = parseInt(year, 10)
      
      // Validate actual calendar date
      const date = new Date(yearNum, monthNum - 1, dayNum)
      if (date.getFullYear() === yearNum && date.getMonth() === monthNum - 1 && date.getDate() === dayNum) {
        return trimmed
      }
    }
    
    return null
  }

  // Handle date input with auto-formatting (DD-MM-YYYY)
  const handleDateInputChange = (e) => {
    const value = e.target.value
    const cursorPosition = e.target.selectionStart || 0
    const oldValue = formData.expense_date || ''
    
    // Remove all non-numeric characters
    const digits = value.replace(/\D/g, '')
    
    // Limit to 8 digits (DDMMYYYY)
    const limitedDigits = digits.slice(0, 8)
    
    // Build formatted string with auto-inserted hyphens
    let formatted = ''
    for (let i = 0; i < limitedDigits.length; i++) {
      formatted += limitedDigits[i]
      // Add hyphen after 2nd digit (DD-)
      if (i === 1 && limitedDigits.length >= 2) {
        formatted += '-'
      }
      // Add hyphen after 4th digit (DD-MM-)
      if (i === 3 && limitedDigits.length >= 4) {
        formatted += '-'
      }
    }
    
    // Calculate new cursor position
    const oldDigits = oldValue.replace(/\D/g, '').length
    const newDigits = limitedDigits.length
    let newCursorPosition = cursorPosition
    
    // If digits increased, adjust cursor position
    if (newDigits > oldDigits) {
      if (newDigits === 2 && oldDigits === 1) {
        // Just completed DD - move past hyphen
        newCursorPosition = 3
      } else if (newDigits === 4 && oldDigits === 3) {
        // Just completed MM - move past hyphen
        newCursorPosition = 6
      } else {
        // Count digits before cursor to determine new position
        const digitsBeforeCursor = value.substring(0, cursorPosition).replace(/\D/g, '').length
        if (digitsBeforeCursor <= 2) {
          newCursorPosition = digitsBeforeCursor
        } else if (digitsBeforeCursor <= 4) {
          newCursorPosition = digitsBeforeCursor + 1 // +1 for first hyphen
        } else {
          newCursorPosition = digitsBeforeCursor + 2 // +2 for both hyphens
        }
      }
    } else {
      // Digits decreased or stayed same - maintain relative position
      const digitsBeforeCursor = value.substring(0, cursorPosition).replace(/\D/g, '').length
      if (digitsBeforeCursor <= 2) {
        newCursorPosition = digitsBeforeCursor
      } else if (digitsBeforeCursor <= 4) {
        newCursorPosition = digitsBeforeCursor + 1
      } else {
        newCursorPosition = digitsBeforeCursor + 2
      }
    }
    
    // Update form state
    setFormData(prev => ({
      ...prev,
      expense_date: formatted
    }))
    
    // Set cursor position after state update
    setTimeout(() => {
      if (e.target && document.activeElement === e.target) {
        const clampedPos = Math.min(Math.max(0, newCursorPosition), formatted.length)
        e.target.setSelectionRange(clampedPos, clampedPos)
      }
    }, 0)
  }

  const handleModalSubmit = async (e) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    setSubmitMessage(null)
    setSubmitError(false)

    try {
      // Validate date format first
      const dateValue = formData.expense_date?.trim() || ''
      
      // Check if date is required and provided
      if (!dateValue) {
        setSubmitMessage('Expense date is required. Please enter a date in DD-MM-YYYY format.')
        setSubmitError(true)
        setIsSubmitting(false)
        return
      }
      
      // Check if date is complete (exactly 10 characters: DD-MM-YYYY)
      if (dateValue.length !== 10) {
        setSubmitMessage('Please enter a complete date in DD-MM-YYYY format (e.g., 13-01-2026).')
        setSubmitError(true)
        setIsSubmitting(false)
        return
      }
      
      // Convert date from DD-MM-YYYY to YYYY-MM-DD for database
      const expenseDateISO = convertDateToISO(dateValue)
      
      if (!expenseDateISO) {
        // Check if it's a format issue or invalid date
        const ddmmyyyyPattern = /^(\d{2})-(\d{2})-(\d{4})$/
        if (!dateValue.match(ddmmyyyyPattern)) {
          setSubmitMessage('Invalid date format. Please use DD-MM-YYYY format (e.g., 13-01-2026).')
        } else {
          setSubmitMessage('Invalid date. Please enter a valid calendar date in DD-MM-YYYY format (e.g., 13-01-2026).')
        }
        setSubmitError(true)
        setIsSubmitting(false)
        return
      }
      
      // Validate required fields
      if (!formData.gross_amount || !formData.invoice_number || !formData.vendor_name) {
        setSubmitError(true)
        setSubmitMessage(t.modal.error + ': Please fill in all required fields (Amount Paid, Invoice Number, Vendor Name)')
        setIsSubmitting(false)
        return
      }
      
      // Calculate VAT fields from gross_amount and vat_rate using calculateVAT
      const grossAmount = parseFloat(formData.gross_amount)
      const vatRate = parseFloat(formData.vat_rate || '19')
      const calculated = calculateVAT(grossAmount, vatRate)
      
      // Get SKR03 tax category info
      const skr03Category = formData.category ? getSKR03Category(formData.category) : null
      
      const dbData = {
        expense_date: expenseDateISO,
        category: formData.category || null,
        tax_category_code: skr03Category ? skr03Category.code : null,
        deductible_percentage: skr03Category ? skr03Category.deductible : 100.00,
        payment_method: formData.payment_method || null,
        amount: grossAmount, // Keep amount for backward compatibility
        gross_amount: grossAmount,
        vat_rate: vatRate,
        net_amount: calculated.net,
        vat_amount: calculated.vat,
        invoice_number: formData.invoice_number.trim(),
        vendor_name: formData.vendor_name.trim(),
        currency: formData.currency || 'EUR',
        description: formData.description || null,
        receipt_url: formData.receipt_url || null,
        organization_id: organization?.id || null
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert([dbData])
        .select()

      if (error) {
        throw error
      }

      setSubmitMessage(t.modal.success)
      setSubmitError(false)

      setTimeout(() => {
        handleCloseModal()
        fetchExpenses(currentPage)
      }, 1000)

    } catch (err) {
      console.error('Error adding expense:', err)
      setSubmitMessage(err.message || t.modal.error)
      setSubmitError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <Link to="/bookings" className="nav-item">
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
          <Link to="/expenses" className="nav-item active">
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
      <main className="main-content expenses-page">
        <div className="requests-list-page">
          {/* Page Header */}
          <div className="requests-header">
            <h1 className="requests-title">{t.table.title}</h1>
            <button
              className="button button-primary"
              onClick={handleOpenModal}
            >
              + {t.table.addExpense}
            </button>
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
          {!loading && !error && expenses.length === 0 && (
            <div className="requests-empty-state">
              <div className="empty-state-content">
                <p className="empty-state-title">No expenses yet</p>
                <p className="empty-state-description">Get started by adding your first expense</p>
                <button className="button button-primary" onClick={handleOpenModal}>
                  + Add first expense
                </button>
              </div>
            </div>
          )}

          {!loading && !error && expenses.length > 0 && (
            <div className="excel-table-container" ref={tableRef}>
              <table className="excel-table">
                <tbody>
                  {/* Query Bar */}
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
                  {/* Current Month Header */}
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
                          <div
                            className="excel-resize-handle"
                            onMouseDown={(e) => handleResizeStart(field, e)}
                            onDoubleClick={(e) => handleResizeDoubleClick(field, e)}
                            title="Drag to resize, double-click to auto-fit"
                          />
                        </th>
                      )
                    })}
                  </tr>
                  {groupedExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={columnOrder.length} style={{ textAlign: 'center', padding: '2rem' }}>
                        {dateFilter || searchTerm.trim() ? 'No matching records found.' : t.table.noExpenses}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {(() => {
                        const flatExpenses = groupedExpenses.flatMap(group => group.expenses)
                        return flatExpenses.map((expense, index) => (
                          <tr key={expense.id}>
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
                                  {renderCell(expense, field, index)}
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
          {!loading && !error && expenses.length > 0 && groupedExpenses.length > 0 && (
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

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t.modal.title}</h2>
              <button
                className="modal-close"
                onClick={handleCloseModal}
                type="button"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleModalSubmit} className="modal-form">
              <div className="form-field">
                <label htmlFor="expense_date">
                  {t.modal.expenseDate} <span className="required">*</span>
                </label>
                <input
                  id="expense_date"
                  type="text"
                  placeholder="DD-MM-YYYY"
                  value={formData.expense_date}
                  onChange={handleDateInputChange}
                  onBlur={(e) => {
                    const dateValue = e.target.value.trim()
                    if (dateValue && dateValue.length !== 10) {
                      e.target.setCustomValidity('Please enter a complete date in DD-MM-YYYY format (e.g., 13-01-2026)')
                    } else {
                      e.target.setCustomValidity('')
                    }
                  }}
                  pattern="^\d{2}-\d{2}-\d{4}$"
                  title="Please enter a date in DD-MM-YYYY format (e.g., 13-01-2026)"
                  required
                  data-flatpickr="true"
                  data-flatpickr-format="d-m-Y"
                />
              </div>

              <div className="form-field">
                <label htmlFor="category">
                  {t.modal.category} <span className="required">*</span>
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleFormInputChange('category', e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  {SKR03_CATEGORIES.map(cat => (
                    <option key={cat.code} value={cat.name}>
                      {cat.name} ({cat.code})
                    </option>
                  ))}
                </select>
                {formData.category && getSKR03Category(formData.category)?.code === '6805' && (
                  <div style={{ color: '#f59e0b', fontSize: '0.875rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    ⚠️ Only 70% tax deductible
                  </div>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="payment_method">
                  {t.modal.paymentMethod} <span className="required">*</span>
                </label>
                <select
                  id="payment_method"
                  value={formData.payment_method}
                  onChange={(e) => handleFormInputChange('payment_method', e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  <option value="Cash">{t.table.paymentMethods.cash}</option>
                  <option value="Bank Transfer">{t.table.paymentMethods.bankTransfer}</option>
                  <option value="Card">{t.table.paymentMethods.card}</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="gross_amount">
                  {t.modal.amount} <span className="required">*</span>
                </label>
                <input
                  id="gross_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.gross_amount}
                  onChange={(e) => handleFormInputChange('gross_amount', e.target.value)}
                  placeholder="Total amount paid including VAT"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="vat_rate">
                  {t.modal.vatRate} <span className="required">*</span>
                </label>
                <select
                  id="vat_rate"
                  value={formData.vat_rate}
                  onChange={(e) => handleFormInputChange('vat_rate', e.target.value)}
                  required
                >
                  <option value="19">19% (Standard)</option>
                  <option value="7">7% (Reduced)</option>
                  <option value="0">0% (No VAT)</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="net_amount">{t.modal.netAmount}</label>
                <input
                  id="net_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.net_amount}
                  readOnly
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                  placeholder="Auto-calculated"
                />
              </div>

              <div className="form-field">
                <label htmlFor="vat_amount">{t.modal.vatAmount}</label>
                <input
                  id="vat_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.vat_amount}
                  readOnly
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                  placeholder="Auto-calculated"
                />
              </div>

              <div className="form-field">
                <label htmlFor="invoice_number">
                  {t.modal.invoiceNumber} <span className="required">*</span>
                </label>
                <input
                  id="invoice_number"
                  type="text"
                  value={formData.invoice_number}
                  onChange={(e) => handleFormInputChange('invoice_number', e.target.value)}
                  placeholder="RE-2025-001"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="vendor_name">
                  {t.modal.vendorName} <span className="required">*</span>
                </label>
                <input
                  id="vendor_name"
                  type="text"
                  value={formData.vendor_name}
                  onChange={(e) => handleFormInputChange('vendor_name', e.target.value)}
                  placeholder="Telekom AG"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="currency">{t.modal.currency}</label>
                <input
                  id="currency"
                  type="text"
                  value={formData.currency}
                  readOnly
                  disabled
                />
              </div>

              <div className="form-field">
                <label htmlFor="description">{t.modal.description}</label>
                <textarea
                  id="description"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => handleFormInputChange('description', e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="receipt_url">{t.modal.receiptUrl}</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <input
                    id="receipt_url"
                    type="text"
                    value={formData.receipt_url}
                    onChange={(e) => handleFormInputChange('receipt_url', e.target.value)}
                    placeholder="https://... or upload document"
                    style={{ flex: 1 }}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="button"
                    onClick={handleUploadClick}
                    disabled={uploadingFile}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {uploadingFile ? t.modal.uploading : t.modal.uploadDocument}
                  </button>
                </div>
                {uploadError && (
                  <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {uploadError}
                  </div>
                )}
                {uploadingFile && (
                  <div style={{ color: '#3b82f6', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {t.modal.uploading}
                  </div>
                )}
                {formData.receipt_url && !uploadingFile && (
                  <div style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                    Document URL: <a href={formData.receipt_url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>View</a>
                  </div>
                )}
              </div>

              {submitMessage && (
                <div className={`submit-message ${submitError ? 'submit-error' : 'submit-success'}`}>
                  {submitMessage}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-cancel"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  {t.modal.cancel}
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t.modal.submitting : t.modal.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpensesList
