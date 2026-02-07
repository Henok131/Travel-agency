import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import logo from '../assets/logo.png'
import taxLogo from '../assets/tax-logo.png'
import settingLogo from '../assets/setting-logo.png'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts'
import './RequestsList.css'
import './Dashboard.css'
import { SidebarWhatsApp } from '@/components/SidebarWhatsApp'

const fetch = () => Promise.resolve()

// Data quality mapping functions
const getDestinationName = (dest) => {
  if (!dest) return 'Unknown'
  const normalizedDest = dest.trim()
  const destinations = {
    'Pardubice': 'Pardubice, Czech Republic',
    'Sturt Creek': 'Sturt Creek Airport',
    'Dubai': 'Dubai International',
    'Juba': 'Juba International',
    'Berlin': 'Berlin Brandenburg',
    'Dubia': 'Dubai International', // Fix typo
    'VUBQHW': 'Unknown Airport',
    'dubia': 'Dubai International'  // Fix lowercase
  }
  // Check exact match first
  if (destinations[normalizedDest]) {
    return destinations[normalizedDest]
  }
  // Check case-insensitive match
  const lowerDest = normalizedDest.toLowerCase()
  for (const [key, value] of Object.entries(destinations)) {
    if (key.toLowerCase() === lowerDest) {
      return value
    }
  }
  // Return original if no mapping found
  return normalizedDest
}

const getAirlineName = (airline) => {
  if (!airline) return 'Unknown Airline'
  const normalizedAirline = airline.trim()
  const airlines = {
    'China Southern Airlines': 'China Southern Airlines',
    'Ethiopian Airlines': 'Ethiopian Airlines', 
    'Lufthansa': 'Lufthansa',
    'Turkish Airlines': 'Turkish Airlines',
    'Df': 'Unknown Airline',
    'Swiss International Air Lines': 'Swiss International'
  }
  // Check exact match first
  if (airlines[normalizedAirline]) {
    return airlines[normalizedAirline]
  }
  // Check case-insensitive match
  const lowerAirline = normalizedAirline.toLowerCase()
  for (const [key, value] of Object.entries(airlines)) {
    if (key.toLowerCase() === lowerAirline) {
      return value
    }
  }
  // Return original if no mapping found
  return normalizedAirline
}

// SKR03 Categories for expense analytics
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
    dashboard: {
      title: 'Analytics Dashboard',
      timeFilter: {
        allTime: 'All Time',
        today: 'Today',
        thisWeek: 'This Week',
        thisMonth: 'This Month',
        thisYear: 'This Year'
      },
      kpi: {
        totalRevenue: 'Total Revenue',
        totalBookings: 'Total Bookings',
        avgBookingValue: 'Avg Booking Value',
        netProfit: 'Net Profit'
      },
      export: 'Export',
      refresh: 'Refresh',
      lastUpdated: 'Last updated',
      loading: 'Loading dashboard data...',
      noData: 'No data available'
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
    dashboard: {
      title: 'Analytics Dashboard',
      timeFilter: {
        allTime: 'Alle Zeit',
        today: 'Heute',
        thisWeek: 'Diese Woche',
        thisMonth: 'Dieser Monat',
        thisYear: 'Dieses Jahr'
      },
      kpi: {
        totalRevenue: 'Gesamtumsatz',
        totalBookings: 'Gesamtbuchungen',
        avgBookingValue: 'Durchschn. Buchungswert',
        netProfit: 'Netto-Gewinn'
      },
      export: 'Exportieren',
      refresh: 'Aktualisieren',
      lastUpdated: 'Zuletzt aktualisiert',
      loading: 'Dashboard-Daten werden geladen...',
      noData: 'Keine Daten verfügbar'
    }
  }
}

// Chart color scheme - Matching Reference HSL values
const COLORS = {
  primary: 'hsl(38, 75%, 55%)',      // Orange/Gold
  success: 'hsl(152, 60%, 45%)',     // Green
  danger: 'hsl(4, 72%, 55%)',         // Red
  warning: 'hsl(38, 75%, 55%)',      // Orange/Gold
  info: 'hsl(200, 80%, 55%)',        // Blue
  purple: 'hsl(280, 70%, 60%)'       // Purple
}

const CHART_COLORS = [
  'hsl(38, 75%, 55%)',   // Orange
  'hsl(152, 60%, 45%)',  // Green
  'hsl(200, 80%, 55%)',  // Blue
  'hsl(280, 70%, 60%)',  // Purple
  'hsl(4, 72%, 55%)'     // Red
]

function Dashboard() {
  const [language, setLanguage] = useState('en')
  const [theme, setTheme] = useState('dark')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [chartsLoading, setChartsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Time filter
  const [timeFilter, setTimeFilter] = useState('thisMonth')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  
  // Revenue Trend Chart Tab
  const [revenueTrendTab, setRevenueTrendTab] = useState('compare')
  
  // Revenue Breakdown View Toggle
  const [revenueBreakdownView, setRevenueBreakdownView] = useState('donut')
  
  // Data states
  const [bookings, setBookings] = useState([])
  const [expenses, setExpenses] = useState([])
  
  // KPI states
  const [kpis, setKpis] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    avgBookingValue: 0,
    netProfit: 0,
    revenueTrend: 0,
    bookingsTrend: 0,
    avgValueTrend: 0,
    profitTrend: 0,
    pendingPayments: 0,
    confirmedBookings: 0,
    draftBookings: 0,
    cancelledBookings: 0,
    monthlyExpenses: 0,
    bookingConversionRate: 0
  })
  
  // Chart data states
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([])
  const [dailyRevenueData, setDailyRevenueData] = useState([])
  const [dailyProfitData, setDailyProfitData] = useState([])
  const [dailyCompareData, setDailyCompareData] = useState([])
  const [revenueBreakdownData, setRevenueBreakdownData] = useState([])
  const [paymentMethodsData, setPaymentMethodsData] = useState([])
  const [bookingStatusData, setBookingStatusData] = useState([])
  const [dailyBookings, setDailyBookings] = useState([])
  const [vatSummary, setVatSummary] = useState({ vat19: 0, vat7: 0, vat0: 0 })
  const [lstProfitSummary, setLstProfitSummary] = useState({
    serviceFees: 0,
    commissions: 0,
    loanFees: 0,
    netProfit: 0
  })
  const [recentActivity, setRecentActivity] = useState([])

  // Mount tracking ref for preventing state updates after unmount
  const isMounted = useRef(true)

  const t = translations[language]

  // Theme handling
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const handleThemeChange = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  // Get time filter date range
  const getTimeFilterRange = () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:213',message:'getTimeFilterRange entry',data:{timeFilter,selectedYear},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    const now = new Date()
    let startDate = null
    let endDate = new Date()

    switch (timeFilter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'thisWeek':
        const dayOfWeek = now.getDay()
        startDate = new Date(now.getTime() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) * 24 * 60 * 60 * 1000)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'year':
        startDate = new Date(selectedYear, 0, 1)
        endDate = new Date(selectedYear, 11, 31, 23, 59, 59)
        break
      default: // allTime
        startDate = null
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:241',message:'getTimeFilterRange exit',data:{startDate:startDate?.toISOString(),endDate:endDate?.toISOString(),startDateValid:startDate instanceof Date && !isNaN(startDate.getTime()),endDateValid:endDate instanceof Date && !isNaN(endDate.getTime())},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    return { startDate, endDate }
  }

  // Fetch dashboard data with timeout and error handling
  const fetchDashboardData = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:245',message:'fetchDashboardData entry',data:{refreshing,isMounted:isMounted.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    // Prevent multiple simultaneous fetches
    if (refreshing || !isMounted.current) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:248',message:'fetchDashboardData early return',data:{refreshing,isMounted:isMounted.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      console.log('Already refreshing or component unmounted, skipping duplicate fetch')
      return
    }
    
    try {
      if (!isMounted.current) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:253',message:'fetchDashboardData unmounted check failed',data:{isMounted:isMounted.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        return
      }
      setError(null)
      setRefreshing(true)
      setChartsLoading(true)
      // Don't set loading=true here - only on initial load (handled in useEffect)
      const { startDate, endDate } = getTimeFilterRange()
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:260',message:'fetchDashboardData before queries',data:{timeFilter,selectedYear,startDate:startDate?.toISOString(),endDate:endDate?.toISOString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      console.log('Fetching dashboard data with filters:', { 
        timeFilter, 
        selectedYear, 
        startDate: startDate?.toISOString(), 
        endDate: endDate?.toISOString() 
      })

      // Get data from Supabase
      const [{ data: allBookingsData, error: bookingsError }, { data: allExpensesData, error: expensesError }] = await Promise.all([
        supabase.from('main_table').select('*'),
        supabase.from('expenses').select('*')
      ])
      if (bookingsError) throw bookingsError
      if (expensesError) throw expensesError
      let allBookings = allBookingsData || []
      let allExpenses = allExpensesData || []
      
      // Filter by date range
      if (startDate) {
        allBookings = allBookings.filter(b => {
          const createdAt = new Date(b.created_at)
          return createdAt >= startDate
        })
        allExpenses = allExpenses.filter(e => {
          const expenseDate = new Date(e.expense_date || e.created_at)
          return expenseDate >= startDate
        })
      }
      if (endDate && timeFilter !== 'allTime') {
        allBookings = allBookings.filter(b => {
          const createdAt = new Date(b.created_at)
          return createdAt <= endDate
        })
        allExpenses = allExpenses.filter(e => {
          const expenseDate = new Date(e.expense_date || e.created_at)
          return expenseDate <= endDate
        })
      }

      const bookingsData = allBookings
      const expensesData = allExpenses
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:325',message:'fetchDashboardData data loaded',data:{bookingsCount:bookingsData.length,expensesCount:expensesData.length,isMounted:isMounted.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C,D'})}).catch(()=>{});
      // #endregion
      console.log(`Loaded ${bookingsData.length} bookings and ${expensesData.length} expenses`)

      // Only update state if component is still mounted
      if (!isMounted.current) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:329',message:'fetchDashboardData unmounted before state update',data:{isMounted:isMounted.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        return
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:333',message:'fetchDashboardData updating state',data:{bookingsCount:bookingsData.length,expensesCount:expensesData.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      setBookings(bookingsData)
      setExpenses(expensesData)

      // Process data for charts and KPIs with error handling
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:336',message:'fetchDashboardData before processDashboardData',data:{bookingsCount:bookingsData.length,expensesCount:expensesData.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      try {
      processDashboardData(bookingsData, expensesData)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:339',message:'fetchDashboardData processDashboardData completed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
      } catch (processError) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:341',message:'fetchDashboardData processDashboardData error',data:{error:processError?.message,errorStack:processError?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        console.error('Error processing dashboard data:', processError)
        if (isMounted.current) {
          setError('Error processing data. Some charts may not display correctly.')
          // Don't throw - allow partial rendering
        }
      }

      if (isMounted.current) {
      setLastUpdated(new Date())
        setError(null)
      }
    } catch (error) {
      // Ignore AbortError (component unmounted or query cancelled)
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        console.log('Query aborted (component unmounted)')
        return
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:349',message:'fetchDashboardData catch block',data:{error:error?.message,errorType:error?.constructor?.name,isMounted:isMounted.current,errorStack:error?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
      // #endregion
      if (isMounted.current) {
      console.error('Error fetching dashboard data:', error)
        let errorMessage = 'Failed to load dashboard data. '
        
        // Provide more specific error messages
        if (error?.message) {
          if (error.message.includes('timeout')) {
            errorMessage += 'Request timed out. Please check your connection and try again.'
          } else if (error.message.includes('Failed to load bookings')) {
            errorMessage += 'Could not load bookings data. Please check your database connection.'
          } else if (error.message.includes('Failed to load expenses')) {
            errorMessage += 'Could not load expenses data. Please check your database connection.'
          } else if (error.message.includes('Failed to fetch data')) {
            errorMessage += error.message
          } else {
            errorMessage += error.message
          }
        } else {
          errorMessage += 'Please check your connection and try again.'
        }
        
        console.error('Full error details:', {
          message: errorMessage,
          error: error,
          stack: error?.stack
        })
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:375',message:'fetchDashboardData setting error state',data:{errorMessage,isMounted:isMounted.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        setError(errorMessage)
        // Still set loading to false so UI can render
      }
    } finally {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:380',message:'fetchDashboardData finally block',data:{isMounted:isMounted.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      if (isMounted.current) {
      setLoading(false)
      setRefreshing(false)
        setChartsLoading(false)
      }
    }
  }

  // Process dashboard data
  const processDashboardData = (bookingsData, expensesData) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:447',message:'processDashboardData entry',data:{bookingsCount:bookingsData?.length,expensesCount:expensesData?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    // Ensure bookingsData and expensesData are arrays
    const safeBookingsData = Array.isArray(bookingsData) ? bookingsData : []
    const safeExpensesData = Array.isArray(expensesData) ? expensesData : []
    
    // Calculate total_amount_due for bookings that don't have it
    const processedBookings = safeBookingsData.map(booking => {
      if (!booking.total_amount_due) {
        const ticketPrice = parseFloat(booking.total_ticket_price) || 0
        const visaFees = parseFloat(booking.tot_visa_fees) || 0
        booking.total_amount_due = ticketPrice + visaFees
      }
      return booking
    })

    // Get previous period for comparison
    const { startDate } = getTimeFilterRange()
    let prevStartDate = null
    let prevEndDate = startDate ? new Date(startDate.getTime() - 1) : null

    if (timeFilter === 'thisMonth') {
      const prevMonth = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1)
      prevStartDate = prevMonth
      prevEndDate = new Date(startDate.getFullYear(), startDate.getMonth(), 0, 23, 59, 59)
    } else if (timeFilter === 'thisYear') {
      prevStartDate = new Date(startDate.getFullYear() - 1, 0, 1)
      prevEndDate = new Date(startDate.getFullYear() - 1, 11, 31, 23, 59, 59)
    }

    // Fetch previous period data for comparison
    fetchPreviousPeriodData(prevStartDate, prevEndDate, processedBookings, safeExpensesData)
    
    // Process current period data
    processCurrentPeriodData(processedBookings, safeExpensesData)
  }

  const fetchPreviousPeriodData = async (prevStartDate, prevEndDate, currentBookings, currentExpenses) => {
    if (!prevStartDate || !prevEndDate) {
      processCurrentPeriodData(currentBookings, currentExpenses, {})
      return
    }

    try {
      const [bookingsResult, expensesResult] = await Promise.all([
        supabase
          .from('main_table')
          .select('*')
          .gte('created_at', prevStartDate.toISOString())
          .lte('created_at', prevEndDate.toISOString()),
        supabase
          .from('expenses')
          .select('*')
          .gte('expense_date', prevStartDate.toISOString())
          .lte('expense_date', prevEndDate.toISOString())
      ])

      if (bookingsResult.error) throw bookingsResult.error
      if (expensesResult.error) throw expensesResult.error

      const prevBookings = (bookingsResult.data || []).map(b => {
        if (!b.total_amount_due) {
          const ticketPrice = parseFloat(b.total_ticket_price) || 0
          const visaFees = parseFloat(b.tot_visa_fees) || 0
          b.total_amount_due = ticketPrice + visaFees
        }
        return b
      })

      const prevExpenses = expensesResult.data || []

      processCurrentPeriodData(currentBookings, currentExpenses, {
        bookings: prevBookings,
        expenses: prevExpenses
      })
    } catch (error) {
      console.error('Error fetching previous period data:', error)
      processCurrentPeriodData(currentBookings, currentExpenses, {})
    }
  }

  const processCurrentPeriodData = (bookings, expenses, previousPeriod = {}) => {
    // Ensure bookings and expenses are arrays
    const safeBookings = Array.isArray(bookings) ? bookings : []
    const safeExpenses = Array.isArray(expenses) ? expenses : []
    
    // Calculate KPIs
    const totalRevenue = safeBookings.reduce((sum, b) => sum + (parseFloat(b.total_amount_due) || 0), 0)
    const totalBookings = safeBookings.length
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0
    const totalExpenses = safeExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
    const netProfit = totalRevenue - totalExpenses

    // Previous period KPIs
    const prevRevenue = previousPeriod.bookings?.reduce((sum, b) => sum + (parseFloat(b.total_amount_due) || 0), 0) || 0
    const prevBookings = previousPeriod.bookings?.length || 0
    const prevAvgValue = prevBookings > 0 ? prevRevenue / prevBookings : 0
    const prevExpenses = previousPeriod.expenses?.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) || 0
    const prevProfit = prevRevenue - prevExpenses

    // Calculate trends
    const revenueTrend = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0
    const bookingsTrend = prevBookings > 0 ? ((totalBookings - prevBookings) / prevBookings) * 100 : 0
    const avgValueTrend = prevAvgValue > 0 ? ((avgBookingValue - prevAvgValue) / prevAvgValue) * 100 : 0
    const profitTrend = prevProfit !== 0 ? ((netProfit - prevProfit) / Math.abs(prevProfit)) * 100 : 0

    // Calculate additional KPIs
    const pendingPayments = safeBookings
      .filter(b => !b.cash_paid && !b.bank_transfer)
      .reduce((sum, b) => sum + (parseFloat(b.total_amount_due) || 0), 0)
    
    const confirmedBookings = safeBookings.filter(b => b.booking_status === 'confirmed' || b.status === 'confirmed').length
    const draftBookings = safeBookings.filter(b => b.status === 'draft').length
    const cancelledBookings = safeBookings.filter(b => b.status === 'cancelled' || b.booking_status === 'cancelled').length
    
    const bookingConversionRate = totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0
    
    // Calculate monthly expenses (current month)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthlyExpenses = safeExpenses
      .filter(e => {
        const expenseDate = new Date(e.expense_date)
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
      })
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)

    setKpis({
      totalRevenue,
      totalBookings,
      avgBookingValue,
      netProfit,
      revenueTrend,
      bookingsTrend,
      avgValueTrend,
      profitTrend,
      pendingPayments,
      confirmedBookings,
      draftBookings,
      cancelledBookings,
      monthlyExpenses,
      bookingConversionRate
    })

    // Process monthly revenue data
    const monthlyRevenue = {}
    safeBookings.forEach(booking => {
      const date = new Date(booking.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = { month: monthKey, revenue: 0 }
      }
      monthlyRevenue[monthKey].revenue += parseFloat(booking.total_amount_due) || 0
    })
    setMonthlyRevenueData(Object.values(monthlyRevenue).sort((a, b) => a.month.localeCompare(b.month)))

    // Process daily revenue data (last 30 days)
    const dailyRevenue = {}
    const dailyProfit = {}
    const dailyCompare = {}
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    const thirtyDaysAgo = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000)
    thirtyDaysAgo.setHours(0, 0, 0, 0)
    
    // Initialize all days in the range
    for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0]
      const dateLabel = d.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', { day: 'numeric', month: 'short' })
      dailyRevenue[dateKey] = { date: dateKey, dateLabel, revenue: 0 }
      dailyProfit[dateKey] = { date: dateKey, dateLabel, profit: 0 }
      dailyCompare[dateKey] = { date: dateKey, dateLabel, revenue: 0, expenses: 0 }
    }
    
    // Process bookings for daily revenue
    safeBookings.forEach(booking => {
      const date = new Date(booking.created_at)
      const dateKey = date.toISOString().split('T')[0]
      const revenue = parseFloat(booking.total_amount_due) || 0
      if (dailyRevenue[dateKey]) {
        dailyRevenue[dateKey].revenue += revenue
        dailyCompare[dateKey].revenue += revenue
      }
    })
    
    // Process expenses for daily profit and compare
    safeExpenses.forEach(expense => {
      const date = new Date(expense.expense_date)
      const dateKey = date.toISOString().split('T')[0]
      const expenseAmount = parseFloat(expense.amount) || 0
      if (dailyCompare[dateKey]) {
        dailyCompare[dateKey].expenses += expenseAmount
      }
    })
    
    // Calculate daily profit (revenue - expenses for that day)
    Object.keys(dailyProfit).forEach(key => {
      const revenue = dailyRevenue[key]?.revenue || 0
      const expenses = dailyCompare[key]?.expenses || 0
      dailyProfit[key].profit = revenue - expenses
    })
    
    // Sort and set daily data
    const sortedDailyRevenue = Object.values(dailyRevenue).sort((a, b) => a.date.localeCompare(b.date))
    const sortedDailyProfit = Object.values(dailyProfit).sort((a, b) => a.date.localeCompare(b.date))
    const sortedDailyCompare = Object.values(dailyCompare).sort((a, b) => a.date.localeCompare(b.date))
    
    setDailyRevenueData(sortedDailyRevenue)
    setDailyProfitData(sortedDailyProfit)
    setDailyCompareData(sortedDailyCompare)

    // Revenue breakdown (Airlines vs Service Fees vs Visa Fees vs Commission)
    const airlinesRevenue = safeBookings.reduce((sum, b) => sum + (parseFloat(b.airlines_price) || 0), 0)
    const serviceFees = safeBookings.reduce((sum, b) => {
      const ticketPrice = parseFloat(b.total_ticket_price) || 0
      const airlinesPrice = parseFloat(b.airlines_price) || 0
      const serviceTicket = ticketPrice - airlinesPrice // Service Ticket
      const serviceVisa = parseFloat(b.service_visa) || 0 // Service Visa
      return sum + serviceTicket + serviceVisa // Total Service Fees = Service Ticket + Service Visa
    }, 0)
    const visaFees = safeBookings.reduce((sum, b) => sum + (parseFloat(b.tot_visa_fees) || 0), 0)
    const commissions = safeBookings.reduce((sum, b) => sum + (parseFloat(b.commission_from_airlines) || 0), 0)
    setRevenueBreakdownData([
      { name: 'Airlines', value: airlinesRevenue, color: 'hsl(38, 75%, 55%)' }, // Orange
      { name: 'Service Fees', value: serviceFees, color: 'hsl(152, 60%, 45%)' }, // Green
      { name: 'Visa Fees', value: visaFees, color: 'hsl(200, 80%, 55%)' }, // Blue
      { name: 'Commission', value: commissions, color: 'hsl(280, 70%, 60%)' } // Purple
    ])

    // Payment methods
    const cashPaid = safeBookings.filter(b => b.cash_paid).reduce((sum, b) => sum + (parseFloat(b.total_amount_due) || 0), 0)
    const bankTransfer = safeBookings.filter(b => b.bank_transfer).reduce((sum, b) => sum + (parseFloat(b.total_amount_due) || 0), 0)
    setPaymentMethodsData([
      { name: 'Cash', value: cashPaid },
      { name: 'Bank Transfer', value: bankTransfer }
    ])


    // Booking status distribution
    const statusCounts = {
      draft: safeBookings.filter(b => b.status === 'draft').length,
      confirmed: safeBookings.filter(b => b.booking_status === 'confirmed' || b.status === 'confirmed').length,
      cancelled: safeBookings.filter(b => b.status === 'cancelled' || b.booking_status === 'cancelled').length,
      pending: safeBookings.filter(b => !b.cash_paid && !b.bank_transfer && (b.booking_status !== 'cancelled' && b.status !== 'cancelled')).length
    }
    setBookingStatusData([
      { name: language === 'de' ? 'Entwurf' : 'Draft', value: statusCounts.draft },
      { name: language === 'de' ? 'Bestätigt' : 'Confirmed', value: statusCounts.confirmed },
      { name: language === 'de' ? 'Storniert' : 'Cancelled', value: statusCounts.cancelled }
    ])



    // VAT Summary - Calculate from expenses grouped by VAT rate
    let vat19 = 0
    let vat7 = 0
    let vat0 = 0
    
    safeExpenses.forEach(expense => {
      const vatRate = parseFloat(expense.vat_rate) || 0
      let vatAmount = parseFloat(expense.vat_amount) || 0
      
      // If vat_amount is not available, calculate it from gross_amount and vat_rate
      if (vatAmount === 0 && expense.gross_amount && vatRate > 0) {
        const grossAmount = parseFloat(expense.gross_amount) || 0
        // VAT = Gross * (VAT Rate / (100 + VAT Rate))
        vatAmount = grossAmount * (vatRate / (100 + vatRate))
      }
      
      // Group VAT amounts by rate (19%, 7%, 0%)
      if (Math.abs(vatRate - 19) < 0.01) {
        vat19 += vatAmount
      } else if (Math.abs(vatRate - 7) < 0.01) {
        vat7 += vatAmount
      } else if (Math.abs(vatRate - 0) < 0.01) {
        vat0 += vatAmount
      }
    })
    
    setVatSummary({ 
      vat19: Math.round(vat19 * 100) / 100, 
      vat7: Math.round(vat7 * 100) / 100, 
      vat0: Math.round(vat0 * 100) / 100 
    })

    // LST Profit Summary
    const serviceFeesTotal = safeBookings.reduce((sum, b) => {
      const ticketPrice = parseFloat(b.total_ticket_price) || 0
      const airlinesPrice = parseFloat(b.airlines_price) || 0
      const serviceTicket = ticketPrice - airlinesPrice // Service Ticket
      const serviceVisa = parseFloat(b.service_visa) || 0 // Service Visa
      return sum + serviceTicket + serviceVisa // Total Service Fees = Service Ticket + Service Visa
    }, 0)
    const commissionsTotal = safeBookings.reduce((sum, b) => sum + (parseFloat(b.commission_from_airlines) || 0), 0)
    const loanFeesTotal = safeBookings.reduce((sum, b) => sum + (parseFloat(b.lst_loan_fee) || 0), 0)
    const netLstProfit = serviceFeesTotal + commissionsTotal - loanFeesTotal - totalExpenses
    setLstProfitSummary({
      serviceFees: serviceFeesTotal,
      commissions: commissionsTotal,
      loanFees: loanFeesTotal,
      netProfit: netLstProfit
    })


    // Recent activity (last 10 bookings)
    const recent = safeBookings
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10)
      .map(b => ({
        id: b.id,
        customer: `${b.first_name || ''} ${b.last_name || ''}`.trim() || 'Unknown',
        amount: parseFloat(b.total_amount_due) || 0,
        status: b.booking_status || b.status || 'pending',
        date: new Date(b.created_at)
      }))
    setRecentActivity(recent)

    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:887',message:'processCurrentPeriodData completed',data:{totalRevenue:kpis.totalRevenue,totalBookings:kpis.totalBookings},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
  }

  // Initial data fetch with error boundary and loading timeout
  useEffect(() => {
    // Initialize mount ref
    isMounted.current = true
    let loadingTimeout
    
    const loadData = async () => {
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:837',message:'loadData entry',data:{isMounted:isMounted.current,loading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:840',message:'loadData setting loading true',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        setLoading(true)
        // Set a maximum loading time of 15 seconds (reduced from 30)
        loadingTimeout = setTimeout(() => {
          if (isMounted.current && loading) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:843',message:'loadData timeout triggered',data:{isMounted:isMounted.current,loading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            console.warn('Loading timeout - forcing loading state to false')
            setLoading(false)
            setChartsLoading(false)
            setRefreshing(false)
            setError('Loading took too long. Please check your connection and try refreshing.')
          }
        }, 30000)
        
        await fetchDashboardData()
        
        // Clear timeout on success
        if (loadingTimeout) {
          clearTimeout(loadingTimeout)
        }
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:857',message:'loadData fetchDashboardData completed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
        // #endregion
      } catch (err) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:860',message:'loadData catch block',data:{error:err?.message,isMounted:isMounted.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
        // #endregion
        if (isMounted.current) {
          console.error('Failed to load dashboard:', err)
          const errorMsg = err?.message || 'Failed to load dashboard. Please check your connection and try refreshing.'
          setError(errorMsg)
          setLoading(false)
          setChartsLoading(false)
          setRefreshing(false)
        }
        if (loadingTimeout) {
          clearTimeout(loadingTimeout)
        }
      }
    }
    
    loadData()
    
    return () => {
      isMounted.current = false
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFilter, selectedYear])

  // Auto-refresh DISABLED to prevent white screen issues
  // The auto-refresh was causing white screens when data updates
  // Users can manually refresh using the refresh button instead
  useEffect(() => {
    // Disabled to prevent white screen issues
    // Uncomment below if you want auto-refresh back (with proper guards):
    /*
    if (error || !isMounted.current) return // Don't auto-refresh if there's an error
    const interval = setInterval(() => {
      if (isMounted.current && !refreshing && !loading) {
      fetchDashboardData()
      }
    }, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
    */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFilter, selectedYear, error])

  // Format currency - Matching Reference (M for millions, K for thousands)
  const formatCurrency = (value) => {
    const numValue = parseFloat(value) || 0
    if (numValue >= 1000000) {
      return `€${(numValue / 1000000).toFixed(2)}M`
    }
    if (numValue >= 1000) {
      return `€${(numValue / 1000).toFixed(1)}K`
    }
    return new Intl.NumberFormat(language === 'de' ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numValue)
  }

  // Format percentage
  const formatPercent = (value) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  // Enhanced Custom Tooltip Component - Matching Reference
  const CustomTooltip = ({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => {
            const formattedValue = formatter 
              ? formatter(entry.value, entry.name)
              : formatCurrency(entry.value)
            const displayName = entry.name || entry.dataKey || 'Value'
            return (
              <p key={index} className="tooltip-item" style={{ color: entry.color || 'hsl(0, 0%, 98%)' }}>
                {`${displayName}: ${formattedValue}`}
              </p>
            )
          })}
        </div>
      )
    }
    return null
  }

  // Custom center label for donut chart
  const DonutCenterLabel = ({ total }) => {
    return (
      <text 
        x="50%" 
        y="48%" 
        textAnchor="middle" 
        fill="hsl(0, 0%, 98%)" 
        fontSize="1.5rem" 
        fontWeight="700"
        dominantBaseline="middle"
      >
        {formatCurrency(total)}
      </text>
    )
  }

  // Enhanced Export Functions - Professional Implementation
  const handleExportPDF = () => {
    // Create a comprehensive PDF report
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>LST Travel Dashboard Report</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; background: white; color: black; }
              h1 { color: #333; }
              .kpi-section { margin: 20px 0; }
              .kpi-item { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
              th { background: #f5f5f5; }
            </style>
          </head>
          <body>
            <h1>LST Travel Dashboard Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>Period: ${timeFilter === 'allTime' ? 'All Time' : timeFilter}</p>
            <div class="kpi-section">
              <h2>Key Performance Indicators</h2>
              <div class="kpi-item">Total Revenue: ${formatCurrency(kpis.totalRevenue)}</div>
              <div class="kpi-item">Total Bookings: ${kpis.totalBookings}</div>
              <div class="kpi-item">Average Booking Value: ${formatCurrency(kpis.avgBookingValue)}</div>
              <div class="kpi-item">Net Profit: ${formatCurrency(kpis.netProfit)}</div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }

  const handleExportCSV = () => {
    // Create CSV export
    const csvRows = []
    
    // KPI Data
    csvRows.push('Metric,Value')
    csvRows.push(`Total Revenue,${kpis.totalRevenue}`)
    csvRows.push(`Total Bookings,${kpis.totalBookings}`)
    csvRows.push(`Average Booking Value,${kpis.avgBookingValue}`)
    csvRows.push(`Net Profit,${kpis.netProfit}`)
    csvRows.push(`Pending Payments,${kpis.pendingPayments}`)
    csvRows.push(`Confirmed Bookings,${kpis.confirmedBookings}`)
    csvRows.push(`Monthly Expenses,${kpis.monthlyExpenses}`)
    csvRows.push(`Booking Conversion Rate,${kpis.bookingConversionRate}`)
    
    // Revenue Breakdown
    csvRows.push('')
    csvRows.push('Revenue Breakdown,Amount')
    revenueBreakdownData.forEach(item => {
      csvRows.push(`${item.name},${item.value}`)
    })
    
    
    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `lst-dashboard-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Generate year options
  const currentYear = new Date().getFullYear()
  const yearOptions = []
  for (let year = 2020; year <= currentYear + 1; year++) {
    yearOptions.push(year)
  }

  // Prevent loading state from getting stuck - auto-clear after 10 seconds
  useEffect(() => {
    if (loading) {
      const stuckLoadingTimeout = setTimeout(() => {
        console.warn('Loading state stuck - auto-clearing')
        setLoading(false)
        setChartsLoading(false)
        setRefreshing(false)
        if (!error) {
          setError('Loading timeout. This might be due to RLS policies blocking unauthenticated access. Please check your database connection or log in.')
        }
      }, 10000)
      
      return () => clearTimeout(stuckLoadingTimeout)
    }
  }, [loading, error])

  // Show loading while loading data
  if (loading) {
    return (
      <div className="page-layout">
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
            <Link to="/dashboard" className="nav-item active">
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
              <img src={taxLogo} alt="TAX" width="20" height="20" />
              <span>{t.sidebar.tax}</span>
            </Link>
            <Link to="/settings" className="nav-item">
              <img src={settingLogo} alt="Settings" width="20" height="20" />
              <span>{t.sidebar.settings}</span>
            </Link>
          </nav>
          <div className="sidebar-footer">
          <SidebarWhatsApp currentPath="/dashboard" />
            <div className="sidebar-footer-text">{t.sidebar.footer}</div>
          </div>
        </aside>
        <main className="main-content">
          <div className="dashboard-main">
            <div className="loading">{t.dashboard.loading}</div>
          </div>
        </main>
      </div>
    )
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/>
            </svg>
            <span>{t.sidebar.mainTable}</span>
          </Link>
          <Link to="/dashboard" className="nav-item active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18"/>
              <path d="M18 7H9M18 12H9M18 17H9M6 7v10"/>
            </svg>
            <span>{t.sidebar.dashboard}</span>
          </Link>
          <Link to="/requests" className="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
            </svg>
            <span>{t.sidebar.requests}</span>
          </Link>
          <Link to="/bookings" className="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16v-6M2 10v6M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
            </svg>
            <span>{t.sidebar.bookings}</span>
          </Link>
          <Link to="/invoices" className="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6M12 18v-6M9 15h6"/>
            </svg>
            <span>{t.sidebar.invoices}</span>
          </Link>
          <Link to="/expenses" className="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span>{t.sidebar.expenses}</span>
          </Link>
          <Link to="/customers" className="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>{t.sidebar.customers}</span>
          </Link>
          <Link to="/bank" className="nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <path d="M2 10h20"/>
              <path d="M7 14h.01"/>
              <path d="M11 14h.01"/>
            </svg>
            <span>{t.sidebar.bank}</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-footer-text">{t.sidebar.footer}</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="dashboard-main">
          {/* Error Display */}
          {error && (
            <div className="error-banner" style={{
              background: 'hsl(4, 72%, 55%)',
              color: 'hsl(0, 0%, 98%)',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong>Error:</strong> {error}
              </div>
              <button 
                onClick={() => {
                  setError(null)
                  fetchDashboardData()
                }}
                style={{
                  background: 'hsl(0, 0%, 98%)',
                  color: 'hsl(4, 72%, 55%)',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Retry
              </button>
            </div>
          )}
          
          {/* Header with Controls */}
          <div className="dashboard-header">
            <h1>{t.dashboard.title}</h1>
            <div className="dashboard-controls">
              <select 
                className="time-filter-select"
                value={timeFilter === 'year' ? `year-${selectedYear}` : timeFilter}
                onChange={(e) => {
                  const value = e.target.value
                  if (value.startsWith('year-')) {
                    setTimeFilter('year')
                    setSelectedYear(parseInt(value.split('-')[1]))
                  } else {
                    setTimeFilter(value)
                  }
                }}
              >
                <option value="allTime">{t.dashboard.timeFilter.allTime}</option>
                <option value="today">{t.dashboard.timeFilter.today}</option>
                <option value="thisWeek">{t.dashboard.timeFilter.thisWeek}</option>
                <option value="thisMonth">{t.dashboard.timeFilter.thisMonth}</option>
                <option value="thisYear">{t.dashboard.timeFilter.thisYear}</option>
                {yearOptions.map(year => (
                  <option key={year} value={`year-${year}`}>{year}</option>
                ))}
              </select>
              <button className="export-button" onClick={handleExportPDF}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {t.dashboard.export}
              </button>
              <button 
                className={`refresh-button ${refreshing ? 'refreshing' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (!refreshing && !loading) {
                    fetchDashboardData()
                  }
                }}
                disabled={refreshing || loading}
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"/>
                  <polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.7L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                {t.dashboard.refresh}
              </button>
              {lastUpdated && (
                <span className="last-updated">
                  {t.dashboard.lastUpdated}: {lastUpdated.toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US')}
                </span>
              )}
            </div>
          </div>

          {/* Sophisticated KPI Cards Grid (2x4) */}
          <div className="sophisticated-kpi-grid">
            {/* 1. Total Revenue */}
            <div className="sophisticated-kpi-card">
              <div className="kpi-card-header">
                <div className="kpi-icon-wrapper" style={{ backgroundColor: 'hsla(152, 60%, 45%, 0.1)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(152, 60%, 45%)" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
              </div>
                <h3 className="kpi-card-title">TOTAL REVENUE</h3>
            </div>
              <div className="kpi-card-value">{formatCurrency(kpis.totalRevenue)}</div>
              <div className="kpi-card-detail">
                <span className={`trend-arrow ${kpis.revenueTrend >= 0 ? 'positive' : 'negative'}`}>
                  {kpis.revenueTrend >= 0 ? '↗' : '↘'}
                </span>
                <span className={`trend-text ${kpis.revenueTrend >= 0 ? 'positive' : 'negative'}`}>
                  {formatPercent(kpis.revenueTrend)} vs last month
                </span>
              </div>
            </div>

            {/* 2. Total Bookings */}
            <div className="sophisticated-kpi-card">
              <div className="kpi-card-header">
                <div className="kpi-icon-wrapper" style={{ backgroundColor: 'hsla(200, 80%, 55%, 0.1)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(200, 80%, 55%)" strokeWidth="2">
                    <path d="M22 16v-6M2 10v6M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                    <path d="M12 11v4M8 11v4M16 11v4"></path>
                  </svg>
                </div>
                <h3 className="kpi-card-title">TOTAL BOOKINGS</h3>
              </div>
              <div className="kpi-card-value">{kpis.totalBookings}</div>
              <div className="kpi-card-detail">
                <span className={`trend-arrow ${kpis.bookingsTrend >= 0 ? 'positive' : 'negative'}`}>
                  {kpis.bookingsTrend >= 0 ? '↗' : '↘'}
                </span>
                <span className={`trend-text ${kpis.bookingsTrend >= 0 ? 'positive' : 'negative'}`}>
                  {formatPercent(kpis.bookingsTrend)} vs last month
                </span>
              </div>
            </div>

            {/* 3. Average Booking Value */}
            <div className="sophisticated-kpi-card">
              <div className="kpi-card-header">
                <div className="kpi-icon-wrapper" style={{ backgroundColor: 'hsla(280, 70%, 60%, 0.1)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(280, 70%, 60%)" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <h3 className="kpi-card-title">AVERAGE BOOKING VALUE</h3>
              </div>
              <div className="kpi-card-value">{formatCurrency(kpis.avgBookingValue)}</div>
              <div className="kpi-card-detail">
                <span className={`trend-arrow ${kpis.avgValueTrend >= 0 ? 'positive' : 'negative'}`}>
                  {kpis.avgValueTrend >= 0 ? '↗' : '↘'}
                </span>
                <span className={`trend-text ${kpis.avgValueTrend >= 0 ? 'positive' : 'negative'}`}>
                  {formatPercent(kpis.avgValueTrend)} vs last month
                </span>
              </div>
            </div>

            {/* 4. Net Profit */}
            <div className="sophisticated-kpi-card">
              <div className="kpi-card-header">
                <div className="kpi-icon-wrapper" style={{ backgroundColor: kpis.netProfit >= 0 ? 'hsla(152, 60%, 45%, 0.1)' : 'hsla(4, 72%, 55%, 0.1)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={kpis.netProfit >= 0 ? 'hsl(152, 60%, 45%)' : 'hsl(4, 72%, 55%)'} strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <h3 className="kpi-card-title">NET PROFIT</h3>
              </div>
              <div className={`kpi-card-value ${kpis.netProfit >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(kpis.netProfit)}
              </div>
              <div className="kpi-card-detail">
                Revenue - Expenses
              </div>
            </div>

            {/* 5. Pending Payments */}
            <div className={`sophisticated-kpi-card ${kpis.pendingPayments > 10000 ? 'warning-border' : ''}`}>
              <div className="kpi-card-header">
                <div className="kpi-icon-wrapper" style={{ backgroundColor: 'hsla(38, 75%, 55%, 0.1)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(38, 75%, 55%)" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <h3 className="kpi-card-title">PENDING PAYMENTS</h3>
              </div>
              <div className="kpi-card-value">{formatCurrency(kpis.pendingPayments)}</div>
              <div className="kpi-card-detail">
                Outstanding payments
              </div>
            </div>

            {/* 6. Confirmed Bookings */}
            <div className="sophisticated-kpi-card">
              <div className="kpi-card-header">
                <div className="kpi-icon-wrapper" style={{ backgroundColor: 'hsla(152, 60%, 45%, 0.1)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(152, 60%, 45%)" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h3 className="kpi-card-title">CONFIRMED BOOKINGS</h3>
              </div>
              <div className="kpi-card-value">{kpis.confirmedBookings}</div>
              <div className="kpi-card-detail">
                {kpis.draftBookings} draft • {kpis.cancelledBookings} cancelled
              </div>
            </div>

            {/* 7. Monthly Expenses */}
            <div className="sophisticated-kpi-card">
              <div className="kpi-card-header">
                <div className="kpi-icon-wrapper" style={{ backgroundColor: 'hsla(4, 72%, 55%, 0.1)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(4, 72%, 55%)" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <h3 className="kpi-card-title">MONTHLY EXPENSES</h3>
              </div>
              <div className="kpi-card-value">{formatCurrency(kpis.monthlyExpenses)}</div>
              <div className="kpi-card-detail">
                Current month expenses
              </div>
            </div>

            {/* 8. Booking Conversion Rate */}
            <div className="sophisticated-kpi-card">
              <div className="kpi-card-header">
                <div className="kpi-icon-wrapper" style={{ backgroundColor: 'hsla(38, 75%, 55%, 0.1)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(38, 75%, 55%)" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <h3 className="kpi-card-title">BOOKING CONVERSION RATE</h3>
              </div>
              <div className="kpi-card-value">{kpis.bookingConversionRate.toFixed(1)}%</div>
              <div className="kpi-card-detail">
                Confirmed / Total bookings
              </div>
            </div>
          </div>

          {/* Revenue Analytics Section (2x2 grid) */}
          <div className="section-title" style={{ marginTop: '2rem' }}>Revenue Analytics</div>
          <div className="charts-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {/* Advanced Revenue Trend Chart with Tabs */}
            <div className="chart-card revenue-trend-card">
              <div className="revenue-trend-header">
                <div>
                  <h2>Revenue Trend</h2>
                  <p className="chart-subtitle">Revenue vs Cost vs Profit analysis</p>
                </div>
                <div className="revenue-trend-tabs">
                  <button 
                    className={`revenue-tab ${revenueTrendTab === 'revenue' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setRevenueTrendTab('revenue')
                    }}
                    type="button"
                  >
                    Revenue
                  </button>
                  <button 
                    className={`revenue-tab ${revenueTrendTab === 'profit' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      // #region agent log
                      fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:1646',message:'Profit tab clicked',data:{revenueTrendTab,hasDailyProfitData:!!dailyProfitData,dailyProfitDataLength:dailyProfitData?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
                      // #endregion
                      try {
                        setRevenueTrendTab('profit')
                      } catch (err) {
                        // #region agent log
                        fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:1651',message:'Profit tab click error',data:{error:err?.message,errorStack:err?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
                        // #endregion
                        console.error('Error switching to profit tab:', err)
                      }
                    }}
                    type="button"
                  >
                    Profit
                  </button>
                  <button 
                    className={`revenue-tab ${revenueTrendTab === 'compare' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      // #region agent log
                      fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:1657',message:'Compare tab clicked',data:{revenueTrendTab,hasDailyCompareData:!!dailyCompareData,dailyCompareDataLength:dailyCompareData?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
                      // #endregion
                      try {
                        setRevenueTrendTab('compare')
                      } catch (err) {
                        // #region agent log
                        fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:1662',message:'Compare tab click error',data:{error:err?.message,errorStack:err?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
                        // #endregion
                        console.error('Error switching to compare tab:', err)
                      }
                    }}
                    type="button"
                  >
                    Compare
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                {revenueTrendTab === 'revenue' && (
                  dailyRevenueData && Array.isArray(dailyRevenueData) && dailyRevenueData.length > 0 ? (
                    <AreaChart data={dailyRevenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(200, 80%, 55%)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(200, 80%, 55%)" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 20%)" vertical={false} />
                    <XAxis 
                      dataKey="dateLabel" 
                      tick={{ fontSize: 10, fill: 'hsl(210, 20%, 70%)' }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: 'hsl(210, 20%, 70%)' }}
                      tickLine={false}
                      axisLine={false}
                      width={60}
                      tickFormatter={(value) => {
                        if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`
                        return `€${value}`
                      }}
                    />
                    <Tooltip 
                      content={<CustomTooltip />}
                      contentStyle={{
                        backgroundColor: 'hsl(222, 22%, 11%)',
                        border: '1px solid hsl(222, 15%, 25%)',
                        borderRadius: '8px',
                        color: 'hsl(0, 0%, 98%)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(200, 80%, 55%)" 
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                      dot={false}
                    />
                    </AreaChart>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: 'hsl(210, 20%, 70%)',
                      fontSize: '0.875rem',
                      padding: '2rem'
                    }}>
                      No revenue data available for the selected period
                    </div>
                  )
                )}
                {revenueTrendTab === 'profit' && (
                  dailyProfitData && Array.isArray(dailyProfitData) && dailyProfitData.length > 0 ? (
                    <AreaChart data={dailyProfitData}>
                    <defs>
                      <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 20%)" vertical={false} />
                    <XAxis 
                      dataKey="dateLabel" 
                      tick={{ fontSize: 10, fill: 'hsl(210, 20%, 70%)' }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: 'hsl(210, 20%, 70%)' }}
                      tickLine={false}
                      axisLine={false}
                      width={60}
                      tickFormatter={(value) => {
                        if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`
                        if (value < 0) return `-€${Math.abs(value / 1000).toFixed(0)}K`
                        return `€${value}`
                      }}
                    />
                    <Tooltip 
                      content={<CustomTooltip />}
                      contentStyle={{
                        backgroundColor: 'hsl(222, 22%, 11%)',
                        border: '1px solid hsl(222, 15%, 25%)',
                        borderRadius: '8px',
                        color: 'hsl(0, 0%, 98%)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="hsl(152, 60%, 45%)" 
                      strokeWidth={2}
                      fill="url(#profitGradient)"
                      dot={false}
                    />
                    </AreaChart>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: 'hsl(210, 20%, 70%)',
                      fontSize: '0.875rem',
                      padding: '2rem'
                    }}>
                      No profit data available for the selected period
                    </div>
                  )
                )}
                {revenueTrendTab === 'compare' && (
                  dailyCompareData && Array.isArray(dailyCompareData) && dailyCompareData.length > 0 ? (
                    <ComposedChart 
                      data={dailyCompareData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                    <defs>
                      <linearGradient id="compareRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="compareExpenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(4, 72%, 55%)" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="hsl(4, 72%, 55%)" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 20%)" vertical={false} />
                    <XAxis 
                      dataKey="dateLabel" 
                      tick={{ fontSize: 10, fill: 'hsl(210, 20%, 70%)' }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: 'hsl(210, 20%, 70%)' }}
                      tickLine={false}
                      axisLine={false}
                      width={60}
                      tickFormatter={(value) => {
                        if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`
                        return `€${value}`
                      }}
                    />
                    <Tooltip 
                      content={<CustomTooltip />}
                      contentStyle={{
                        backgroundColor: 'hsl(222, 22%, 11%)',
                        border: '1px solid hsl(222, 15%, 25%)',
                        borderRadius: '8px',
                        color: 'hsl(0, 0%, 98%)'
                      }}
                    />
                  <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      name="Revenue"
                      stroke="hsl(152, 60%, 45%)" 
                      strokeWidth={2}
                      fill="url(#compareRevenueGradient)"
                      dot={false}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expenses" 
                      name="Expenses"
                      stroke="hsl(4, 72%, 55%)" 
                      strokeWidth={2}
                      fill="url(#compareExpenseGradient)"
                      dot={false}
                    />
                    </ComposedChart>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: 'hsl(210, 20%, 70%)',
                      fontSize: '0.875rem',
                      padding: '2rem'
                    }}>
                      No comparison data available for the selected period
                    </div>
                  )
                )}
              </ResponsiveContainer>
            </div>

            {/* Revenue Breakdown with Donut/Bar Toggle */}
            <div className="chart-card revenue-breakdown-card">
              <div className="revenue-breakdown-header">
                <div>
                  <h2>Revenue by Category</h2>
                  <p className="chart-subtitle">
                    Top {revenueBreakdownData.length} categories • Total {formatCurrency(
                      revenueBreakdownData.reduce((sum, item) => sum + item.value, 0)
                    )}
                  </p>
                </div>
                <div className="revenue-breakdown-tabs">
                  <button 
                    className={`breakdown-tab ${revenueBreakdownView === 'donut' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setRevenueBreakdownView('donut')
                    }}
                    type="button"
                  >
                    Donut
                  </button>
                  <button 
                    className={`breakdown-tab ${revenueBreakdownView === 'bar' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setRevenueBreakdownView('bar')
                    }}
                    type="button"
                  >
                    Bar
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                {revenueBreakdownView === 'donut' ? (
                  <div style={{ position: 'relative', width: 260, height: 260, margin: '0 auto', transform: 'translateX(40px)' }}>
                    <PieChart width={260} height={260}>
                      <Pie
                        data={revenueBreakdownData}
                        cx={130}
                        cy={130}
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {revenueBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={<CustomTooltip />}
                        contentStyle={{
                          backgroundColor: 'hsl(222, 22%, 11%)',
                          border: '1px solid hsl(222, 15%, 25%)',
                          borderRadius: '8px',
                          color: 'hsl(0, 0%, 98%)'
                        }}
                      />
                    </PieChart>
                    <div className="donut-center-label">
                      <div className="donut-center-value">
                        {formatCurrency(revenueBreakdownData.reduce((sum, item) => sum + item.value, 0))}
                      </div>
                      <div className="donut-center-text">Total Revenue</div>
                    </div>
                  </div>
                ) : (
                  <BarChart 
                    data={[...revenueBreakdownData].sort((a, b) => b.value - a.value)} 
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 20%)" horizontal={true} vertical={false} />
                    <XAxis 
                      type="number" 
                      tick={{ fontSize: 10, fill: 'hsl(210, 20%, 70%)' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => {
                        if (value >= 1000) return `€${(value / 1000).toFixed(1)}K`
                        return `€${value}`
                      }}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fontSize: 10, fill: 'hsl(210, 20%, 70%)' }}
                      tickLine={false}
                      axisLine={false}
                      width={75}
                    />
                    <Tooltip 
                      content={<CustomTooltip />}
                      contentStyle={{
                        backgroundColor: 'hsl(222, 22%, 11%)',
                        border: '1px solid hsl(222, 15%, 25%)',
                        borderRadius: '8px',
                        color: 'hsl(0, 0%, 98%)'
                      }}
                    />
                    <Bar 
                    dataKey="value"
                      name="Revenue"
                      fill="hsl(38, 75%, 55%)"
                      radius={[0, 4, 4, 0]}
                    >
                      {revenueBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                </BarChart>
                )}
              </ResponsiveContainer>
              {/* Legend for Donut Chart */}
              {revenueBreakdownView === 'donut' && (
                <div className="revenue-breakdown-legend">
                  {revenueBreakdownData.map((entry, index) => {
                    const percent = revenueBreakdownData.reduce((sum, item) => sum + item.value, 0) > 0
                      ? ((entry.value / revenueBreakdownData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0)
                      : 0
                    return (
                      <div key={index} className="legend-item">
                        <div 
                          className="legend-color" 
                          style={{ backgroundColor: entry.color || CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span className="legend-name">{entry.name}</span>
                        <span className="legend-percent">{percent}%</span>
            </div>
                    )
                  })}
          </div>
              )}
            </div>

            {/* Payment Methods Pie Chart */}
            <div className="chart-card">
              <h2>Payment Methods Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                    outerRadius={80}
                    fill="hsl(200, 80%, 55%)"
                    dataKey="value"
                  >
                    {paymentMethodsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.success : COLORS.primary} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* VAT Summary Cards */}
            <div className="chart-card">
              <h2>VAT Summary</h2>
              <div className="vat-summary-cards">
                <div className="vat-card">
                  <div className="vat-label">19% VAT</div>
                  <div className="vat-value">{formatCurrency(vatSummary.vat19)}</div>
            </div>
                <div className="vat-card">
                  <div className="vat-label">7% VAT</div>
                  <div className="vat-value">{formatCurrency(vatSummary.vat7)}</div>
          </div>
                <div className="vat-card">
                  <div className="vat-label">0% VAT</div>
                  <div className="vat-value">{formatCurrency(vatSummary.vat0)}</div>
            </div>
              </div>
            </div>
          </div>


          {/* Operational Metrics Section (full-width components) */}
          <div className="section-title" style={{ marginTop: '2rem' }}>Operational Metrics</div>
          
          {/* LST Profit Summary */}
          <div className="chart-card" style={{ marginBottom: '1.5rem' }}>
            <h2>LST Profit Summary</h2>
            <div className="lst-profit-grid">
              <div className="lst-profit-card">
                <div className="lst-profit-label">Service Fees</div>
                <div className="lst-profit-value">{formatCurrency(lstProfitSummary.serviceFees)}</div>
              </div>
              <div className="lst-profit-card">
                <div className="lst-profit-label">Commissions</div>
                <div className="lst-profit-value">{formatCurrency(lstProfitSummary.commissions)}</div>
              </div>
              <div className="lst-profit-card">
                <div className="lst-profit-label">Loan Fees</div>
                <div className="lst-profit-value">{formatCurrency(lstProfitSummary.loanFees)}</div>
              </div>
              <div className="lst-profit-card">
                <div className="lst-profit-label">Net LST Profit</div>
                <div className={`lst-profit-value ${lstProfitSummary.netProfit >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(lstProfitSummary.netProfit)}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="chart-card" style={{ marginBottom: '1.5rem' }}>
            <h2>Recent Activity (Last 10 Bookings)</h2>
            <div className="recent-activity-feed">
              {recentActivity.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((activity) => (
                      <tr key={activity.id}>
                        <td>{activity.customer}</td>
                        <td>{formatCurrency(activity.amount)}</td>
                        <td>{activity.status}</td>
                        <td>{activity.date.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>{t.dashboard.noData}</p>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default Dashboard
