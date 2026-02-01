import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import logo from '../assets/logo.png'
import taxLogo from '../assets/tax-logo.png'
import settingLogo from '../assets/setting-logo.png'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import './RequestsList.css'
import './TaxPage.css'

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
    tax: {
      title: 'VAT Reports',
      filingFrequency: 'Filing Frequency',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      selectPeriod: 'Select Period',
      generateReport: 'Generate VAT Report',
      incomeFolder: 'Income Folder (Einnahmen)',
      expensesFolder: 'Expenses Folder (Ausgaben)',
      vatSummary: 'VAT Summary (UStVA-Übersicht)',
      outputVAT: 'Output VAT (Umsatzsteuer)',
      inputVAT: 'Input VAT (Vorsteuer)',
      netVAT: 'Net VAT to Pay/Refund',
      vatRate: 'VAT Rate',
      netAmount: 'Net Amount',
      vatAmount: 'VAT Amount',
      grossAmount: 'Gross Amount',
      total: 'Total',
      deductible: 'Deductible',
      nonDeductible: 'Non-Deductible',
      exportExcel: 'Export Excel Report',
      exportDATEV: 'Download DATEV Export (CSV)',
      exportPDF: 'Download Summary PDF',
      noData: 'No data available for selected period',
      deadline: 'Deadline',
      dueDate: 'Due Date',
      invoices: 'Invoices',
      expenses: 'Expenses',
      period: 'Period',
      year: 'Year',
      month: 'Month',
      quarter: 'Quarter',
      january: 'January',
      february: 'February',
      march: 'March',
      april: 'April',
      may: 'May',
      june: 'June',
      july: 'July',
      august: 'August',
      september: 'September',
      october: 'October',
      november: 'November',
      december: 'December',
      q1: 'Q1 (Jan-Mar)',
      q2: 'Q2 (Apr-Jun)',
      q3: 'Q3 (Jul-Sep)',
      q4: 'Q4 (Oct-Dec)',
      loading: 'Loading tax data...',
      invoiceNumber: 'Invoice Number',
      partner: 'Partner',
      date: 'Date',
      skr03Account: 'SKR03 Account',
      taxExempt: 'Tax-Exempt',
      standardRate: 'Standard Rate (19%)',
      reducedRate: 'Reduced Rate (7%)',
      zeroRate: 'Zero Rate (0%)',
      toPay: 'To Pay',
      refund: 'Refund',
      dashboard: 'Tax Dashboard',
      today: 'Today',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      thisQuarter: 'This Quarter',
      thisYear: 'This Year',
      dailyVAT: 'Daily VAT Progress',
      cumulativeVAT: 'Cumulative VAT Progress',
      inputVATDaily: 'Input VAT (Daily)',
      outputVATDaily: 'Output VAT (Daily)',
      netVATDaily: 'Net VAT (Daily)',
      inputVATCumulative: 'Input VAT (Cumulative)',
      outputVATCumulative: 'Output VAT (Cumulative)',
      netVATCumulative: 'Net VAT (Cumulative)',
      revenue: 'Revenue',
      totalRevenue: 'Total Revenue',
      vatOwed: 'VAT Owed',
      vatRefund: 'VAT Refund',
      clickToViewDetails: 'Click to view details',
      drillDownTitle: 'Transaction Details',
      drillDownDate: 'Date',
      drillDownType: 'Type',
      drillDownInvoice: 'Invoice',
      drillDownPartner: 'Partner',
      drillDownNet: 'Net',
      drillDownVAT: 'VAT',
      drillDownGross: 'Gross',
      drillDownClose: 'Close',
      income: 'Income',
      expense: 'Expense',
      predictions: 'Predictions',
      expected: 'Expected',
      projected: 'Projected',
      basedOnTrends: 'Based on current trends',
      todayPrediction: 'Today (Projected)',
      weekPrediction: 'This Week (Projected)',
      monthPrediction: 'This Month (Projected)'
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
    tax: {
      title: 'Umsatzsteuervoranmeldung',
      filingFrequency: 'Abgabefrequenz',
      monthly: 'Monatlich',
      quarterly: 'Vierteljährlich',
      selectPeriod: 'Zeitraum auswählen',
      generateReport: 'UStVA-Bericht erstellen',
      incomeFolder: 'Einnahmen',
      expensesFolder: 'Ausgaben',
      vatSummary: 'UStVA-Übersicht',
      outputVAT: 'Umsatzsteuer',
      inputVAT: 'Vorsteuer',
      netVAT: 'Zu zahlende/Erstattete USt',
      vatRate: 'MwSt-Satz',
      netAmount: 'Nettobetrag',
      vatAmount: 'MwSt-Betrag',
      grossAmount: 'Bruttobetrag',
      total: 'Gesamt',
      deductible: 'Abzugsfähig',
      nonDeductible: 'Nicht abzugsfähig',
      exportExcel: 'Excel-Bericht exportieren',
      exportDATEV: 'DATEV-Export herunterladen (CSV)',
      exportPDF: 'Zusammenfassung PDF herunterladen',
      noData: 'Keine Daten für den ausgewählten Zeitraum verfügbar',
      deadline: 'Frist',
      dueDate: 'Fälligkeitsdatum',
      invoices: 'Rechnungen',
      expenses: 'Ausgaben',
      period: 'Zeitraum',
      year: 'Jahr',
      month: 'Monat',
      quarter: 'Quartal',
      january: 'Januar',
      february: 'Februar',
      march: 'März',
      april: 'April',
      may: 'Mai',
      june: 'Juni',
      july: 'Juli',
      august: 'August',
      september: 'September',
      october: 'Oktober',
      november: 'November',
      december: 'Dezember',
      q1: 'Q1 (Jan-Mär)',
      q2: 'Q2 (Apr-Jun)',
      q3: 'Q3 (Jul-Sep)',
      q4: 'Q4 (Okt-Dez)',
      loading: 'Steuerdaten werden geladen...',
      invoiceNumber: 'Rechnungsnummer',
      partner: 'Partner',
      date: 'Datum',
      skr03Account: 'SKR03 Konto',
      taxExempt: 'Umsatzsteuerfrei',
      standardRate: 'Regelsatz (19%)',
      reducedRate: 'Ermäßigter Satz (7%)',
      zeroRate: 'Nullsatz (0%)',
      toPay: 'Zu zahlen',
      refund: 'Erstattung',
      dashboard: 'Steuer-Dashboard',
      today: 'Heute',
      thisWeek: 'Diese Woche',
      thisMonth: 'Dieser Monat',
      thisQuarter: 'Dieses Quartal',
      thisYear: 'Dieses Jahr',
      dailyVAT: 'Täglicher MwSt-Verlauf',
      cumulativeVAT: 'Kumulativer MwSt-Verlauf',
      inputVATDaily: 'Vorsteuer (Täglich)',
      outputVATDaily: 'Umsatzsteuer (Täglich)',
      netVATDaily: 'Netto-MwSt (Täglich)',
      inputVATCumulative: 'Vorsteuer (Kumulativ)',
      outputVATCumulative: 'Umsatzsteuer (Kumulativ)',
      netVATCumulative: 'Netto-MwSt (Kumulativ)',
      revenue: 'Umsatz',
      totalRevenue: 'Gesamtumsatz',
      vatOwed: 'MwSt geschuldet',
      vatRefund: 'MwSt-Erstattung',
      clickToViewDetails: 'Klicken Sie, um Details anzuzeigen',
      drillDownTitle: 'Transaktionsdetails',
      drillDownDate: 'Datum',
      drillDownType: 'Typ',
      drillDownInvoice: 'Rechnung',
      drillDownPartner: 'Partner',
      drillDownNet: 'Netto',
      drillDownVAT: 'MwSt',
      drillDownGross: 'Brutto',
      drillDownClose: 'Schließen',
      income: 'Einnahmen',
      expense: 'Ausgaben',
      filterBy: 'Filtern nach',
      allData: 'Alle Daten',
      predictions: 'Prognosen',
      expected: 'Erwartet',
      projected: 'Projiziert',
      basedOnTrends: 'Basierend auf aktuellen Trends',
      todayPrediction: 'Heute (Projiziert)',
      weekPrediction: 'Diese Woche (Projiziert)',
      monthPrediction: 'Diesen Monat (Projiziert)'
    }
  }
}

// German VAT deadlines
const getVATDeadline = (period, filingFrequency) => {
  if (!period || !filingFrequency) return null
  
  const now = new Date()
  const currentYear = now.getFullYear()
  
  try {
    if (filingFrequency === 'monthly') {
      const parts = period.split('-')
      if (parts.length !== 2) return null
      const month = parseInt(parts[1])
      const year = parseInt(parts[0])
      if (isNaN(month) || isNaN(year)) return null
      const deadline = new Date(year, month, 10) // 10th of following month
      if (isNaN(deadline.getTime())) return null
      return deadline
    } else {
      // Quarterly
      const parts = period.split('-')
      if (parts.length !== 2) return null
      const [quarter, year] = parts
      const q = parseInt(quarter.replace('Q', ''))
      const y = parseInt(year)
      if (isNaN(q) || isNaN(y) || q < 1 || q > 4) return null
      
      // Q1 (Jan-Mar) due 10 April
      // Q2 (Apr-Jun) due 10 July
      // Q3 (Jul-Sep) due 10 October
      // Q4 (Oct-Dec) due 10 January next year
      const deadlines = {
        1: new Date(y, 3, 10),   // April 10
        2: new Date(y, 6, 10),   // July 10
        3: new Date(y, 9, 10),   // October 10
        4: new Date(y + 1, 0, 10) // January 10 next year
      }
      const deadline = deadlines[q]
      if (!deadline || isNaN(deadline.getTime())) return null
      return deadline
    }
  } catch (error) {
    console.error('Error calculating VAT deadline:', error)
    return null
  }
}

// Generate periods based on filing frequency
const generatePeriods = (filingFrequency) => {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-based (0 = January, 11 = December)
  const periods = []
  
  if (filingFrequency === 'monthly') {
    const months = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ]
    
    // Generate last 12 months including current month
    for (let i = 11; i >= 0; i--) {
      const monthOffset = currentMonth - i
      let year = currentYear
      let month = monthOffset
      
      // Handle year rollover
      if (month < 0) {
        year -= 1
        month += 12
      } else if (month >= 12) {
        year += 1
        month -= 12
      }
      
      periods.push({
        value: `${year}-${String(month + 1).padStart(2, '0')}`,
        label: `${months[month]} ${year}`,
        year,
        month: month + 1
      })
    }
  } else {
    // Quarterly - generate last 4 quarters including current quarter
    for (let i = 3; i >= 0; i--) {
      const monthOffset = currentMonth - (i * 3)
      let year = currentYear
      let month = monthOffset
      
      // Handle year rollover
      if (month < 0) {
        year -= 1
        month += 12
      }
      
      const quarter = Math.floor(month / 3) + 1
      periods.push({
        value: `Q${quarter}-${year}`,
        label: `Q${quarter} ${year}`,
        year,
        quarter
      })
    }
  }
  
  return periods
}

// Calculate VAT from gross amount
const calculateVAT = (grossAmount, vatRate) => {
  if (!grossAmount || grossAmount === 0) return { net: 0, vat: 0 }
  if (vatRate === 0) return { net: grossAmount, vat: 0 }
  
  const net = grossAmount / (1 + vatRate / 100)
  const vat = grossAmount - net
  
  return {
    net: Math.round(net * 100) / 100,
    vat: Math.round(vat * 100) / 100
  }
}

function TaxPage() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en'
  })
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })
  const [vatFilingFrequency, setVatFilingFrequency] = useState(() => {
    return localStorage.getItem('vat_filing_frequency') || 'quarterly'
  })
  const [selectedPeriod, setSelectedPeriod] = useState(null)
  const [periods, setPeriods] = useState([])
  const [loading, setLoading] = useState(false)
  const [incomeData, setIncomeData] = useState([])
  const [expensesData, setExpensesData] = useState([])
  const [vatSummary, setVatSummary] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [dailyChartData, setDailyChartData] = useState([])
  const [cumulativeChartData, setCumulativeChartData] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [drillDownData, setDrillDownData] = useState([])
  const [showDrillDown, setShowDrillDown] = useState(false)
  const [dashboardFilter, setDashboardFilter] = useState('thisMonth')
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [originalValue, setOriginalValue] = useState('')
  const editInputRef = React.useRef(null)
  const tableRef = useRef(null)
  const resizingRef = useRef(null)
  
  // Column resizing state for income table
  const [incomeColumnWidths, setIncomeColumnWidths] = useState({
    row_number: 60,
    date: 110,
    invoiceNumber: 150,
    partner: 180,
    netAmount: 120,
    vatRate: 100,
    vatAmount: 120,
    grossAmount: 120,
    skr03Account: 120
  })
  
  // Column resizing state for expenses table
  const [expensesColumnWidths, setExpensesColumnWidths] = useState({
    row_number: 60,
    date: 110,
    invoiceNumber: 150,
    partner: 180,
    netAmount: 120,
    vatRate: 100,
    vatAmount: 120,
    grossAmount: 120,
    deductiblePercentage: 120,
    skr03Account: 120
  })

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

  // Update periods when filing frequency changes
  useEffect(() => {
    localStorage.setItem('vat_filing_frequency', vatFilingFrequency)
    const newPeriods = generatePeriods(vatFilingFrequency)
    setPeriods(newPeriods)
    if (newPeriods.length > 0 && !selectedPeriod) {
      setSelectedPeriod(newPeriods[0].value)
    }
  }, [vatFilingFrequency])

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  // Fetch income data (from main_table)
  const fetchIncomeData = async (startDate, endDate) => {
    try {
      console.log('Fetching income data for period:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })

      const { data, error } = await supabase
        .from('main_table')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Process income data - assume total_amount_due is gross revenue
      // Default VAT rate: 19% for service fees, 0% for international flights (if applicable)
      const processedIncome = data.map(booking => {
        const grossAmount = parseFloat(booking.total_amount_due) || 0
        // Default VAT rate: 19% (can be adjusted per booking type)
        const vatRate = 19.00 // TODO: This should come from booking if VAT fields are added
        const { net, vat } = calculateVAT(grossAmount, vatRate)
        
        return {
          id: booking.id,
          date: booking.created_at,
          invoiceNumber: booking.booking_ref || `INV-${booking.id.substring(0, 8)}`,
          partner: `${booking.first_name || ''} ${booking.last_name || ''}`.trim() || 'Unknown Customer',
          netAmount: net,
          vatRate: vatRate,
          vatAmount: vat,
          grossAmount: grossAmount,
          skr03Account: '8400', // Revenue account (default)
          isTaxExempt: vatRate === 0
        }
      })

      console.log('Processed income records:', processedIncome.length)
      return processedIncome
    } catch (error) {
      console.error('Error fetching income data:', error)
      return []
    }
  }

  // Fetch expenses data (from expenses table)
  const fetchExpensesData = async (startDate, endDate) => {
    try {
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]
      
      console.log('Fetching expenses data for period:', {
        startDate: startDateStr,
        endDate: endDateStr
      })

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('expense_date', startDateStr)
        .lte('expense_date', endDateStr)
        .order('expense_date', { ascending: true })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Fetched expense records:', data?.length || 0)

      // Process expenses data - already has VAT fields
      const processedExpenses = data.map(expense => {
        const grossAmount = parseFloat(expense.gross_amount) || parseFloat(expense.amount) || 0
        const vatRate = parseFloat(expense.vat_rate) || 19.00
        const netAmount = parseFloat(expense.net_amount) || calculateVAT(grossAmount, vatRate).net
        const vatAmount = parseFloat(expense.vat_amount) || calculateVAT(grossAmount, vatRate).vat
        const deductiblePercentage = parseFloat(expense.deductible_percentage) || 100.00
        
        return {
          id: expense.id,
          date: expense.expense_date,
          invoiceNumber: expense.invoice_number || `EXP-${expense.id.substring(0, 8)}`,
          partner: expense.vendor_name || 'Unknown Vendor',
          netAmount: netAmount,
          vatRate: vatRate,
          vatAmount: vatAmount,
          grossAmount: grossAmount,
          skr03Account: expense.tax_category_code || '4800',
          deductiblePercentage: deductiblePercentage,
          isTaxExempt: vatRate === 0
        }
      })

      return processedExpenses
    } catch (error) {
      console.error('Error fetching expenses data:', error)
      return []
    }
  }

  // Calculate period date range
  const getPeriodDateRange = (period, filingFrequency) => {
    let startDate, endDate
    
    if (filingFrequency === 'monthly') {
      const [year, month] = period.split('-').map(Number)
      // Start of month (local time)
      startDate = new Date(year, month - 1, 1, 0, 0, 0, 0)
      // Last day of month, end of day
      endDate = new Date(year, month, 0, 23, 59, 59, 999)
    } else {
      // Quarterly
      const [quarter, year] = period.split('-')
      const q = parseInt(quarter.replace('Q', ''))
      const y = parseInt(year)
      
      const quarterMonths = {
        1: { start: 0, end: 2 },   // Jan-Mar
        2: { start: 3, end: 5 },   // Apr-Jun
        3: { start: 6, end: 8 },   // Jul-Sep
        4: { start: 9, end: 11 }   // Oct-Dec
      }
      
      const { start, end } = quarterMonths[q]
      startDate = new Date(y, start, 1, 0, 0, 0, 0)
      endDate = new Date(y, end + 1, 0, 23, 59, 59, 999) // Last day of quarter
    }
    
    return { startDate, endDate }
  }

  // Load dashboard data (all time data for dashboard)
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get date ranges for different periods
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      
      // This week (Monday to Sunday)
      const dayOfWeek = now.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - daysToMonday)
      weekStart.setHours(0, 0, 0, 0)
      
      // This month
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      
      // This quarter
      const currentQuarter = Math.floor(now.getMonth() / 3)
      const quarterStart = new Date(now.getFullYear(), currentQuarter * 3, 1, 0, 0, 0, 0)
      
      // This year
      const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
      
      // Fetch all data (we'll filter in memory for better performance)
      // Use a wide date range to get all data
      const startDate = new Date(2020, 0, 1, 0, 0, 0, 0)
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      
      const [allIncome, allExpenses] = await Promise.all([
        fetchIncomeData(startDate, endDate), // From 2020 to now
        fetchExpensesData(startDate, endDate)
      ])
      
      // Calculate KPIs for different periods
      const calculateKPIs = (income, expenses, startDate, endDate) => {
        const filteredIncome = income.filter(item => {
          const itemDate = new Date(item.date)
          return itemDate >= startDate && itemDate <= endDate
        })
        const filteredExpenses = expenses.filter(item => {
          const itemDate = new Date(item.date)
          return itemDate >= startDate && itemDate <= endDate
        })
        
        const outputVAT = filteredIncome.reduce((sum, item) => sum + item.vatAmount, 0)
        const inputVAT = filteredExpenses.reduce((sum, item) => {
          const deductibleVAT = item.vatAmount * (item.deductiblePercentage / 100)
          return sum + deductibleVAT
        }, 0)
        const netVAT = outputVAT - inputVAT
        const revenue = filteredIncome.reduce((sum, item) => sum + item.grossAmount, 0)
        
        return { outputVAT, inputVAT, netVAT, revenue, count: filteredIncome.length + filteredExpenses.length }
      }
      
      const kpis = {
        today: calculateKPIs(allIncome, allExpenses, todayStart, todayEnd),
        thisWeek: calculateKPIs(allIncome, allExpenses, weekStart, now),
        thisMonth: calculateKPIs(allIncome, allExpenses, monthStart, now),
        thisQuarter: calculateKPIs(allIncome, allExpenses, quarterStart, now),
        thisYear: calculateKPIs(allIncome, allExpenses, yearStart, now)
      }
      
      setDashboardData({ kpis, allIncome, allExpenses })
      
      // Prepare daily chart data (last 30 days)
      const chartStartDate = new Date(now)
      chartStartDate.setDate(now.getDate() - 30)
      
      const dailyData = {}
      const cumulativeData = {}
      
      // Initialize all dates in range
      for (let d = new Date(chartStartDate); d <= now; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0]
        dailyData[dateKey] = { date: dateKey, inputVAT: 0, outputVAT: 0, netVAT: 0 }
        cumulativeData[dateKey] = { date: dateKey, inputVAT: 0, outputVAT: 0, netVAT: 0 }
      }
      
      // Process income
      allIncome.forEach(item => {
        const itemDate = new Date(item.date)
        if (itemDate >= chartStartDate && itemDate <= now) {
          const dateKey = itemDate.toISOString().split('T')[0]
          if (dailyData[dateKey]) {
            dailyData[dateKey].outputVAT += item.vatAmount
            dailyData[dateKey].netVAT += item.vatAmount
          }
        }
      })
      
      // Process expenses
      allExpenses.forEach(item => {
        const itemDate = new Date(item.date)
        if (itemDate >= chartStartDate && itemDate <= now) {
          const dateKey = itemDate.toISOString().split('T')[0]
          if (dailyData[dateKey]) {
            const deductibleVAT = item.vatAmount * (item.deductiblePercentage / 100)
            dailyData[dateKey].inputVAT += deductibleVAT
            dailyData[dateKey].netVAT -= deductibleVAT
          }
        }
      })
      
      // Calculate cumulative
      let cumInputVAT = 0
      let cumOutputVAT = 0
      let cumNetVAT = 0
      
      const sortedDates = Object.keys(dailyData).sort()
      sortedDates.forEach(dateKey => {
        cumInputVAT += dailyData[dateKey].inputVAT
        cumOutputVAT += dailyData[dateKey].outputVAT
        cumNetVAT += dailyData[dateKey].netVAT
        
        cumulativeData[dateKey] = {
          date: dateKey,
          inputVAT: cumInputVAT,
          outputVAT: cumOutputVAT,
          netVAT: cumNetVAT
        }
      })
      
      setDailyChartData(Object.values(dailyData).filter(d => d.date))
      setCumulativeChartData(Object.values(cumulativeData).filter(d => d.date))
      
      // Calculate predictions based on trends
      const predictions = calculatePredictions(allIncome, allExpenses, now)
      
      // Update dashboard data with predictions
      setDashboardData({ kpis, allIncome, allExpenses, predictions })
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate predictions based on historical trends
  const calculatePredictions = (allIncome, allExpenses, now) => {
    const predictions = {
      today: { revenue: 0, netVAT: 0, outputVAT: 0, inputVAT: 0 },
      thisWeek: { revenue: 0, netVAT: 0, outputVAT: 0, inputVAT: 0 },
      thisMonth: { revenue: 0, netVAT: 0, outputVAT: 0, inputVAT: 0 }
    }

    // Calculate average daily performance from last 30 days
    const last30DaysStart = new Date(now)
    last30DaysStart.setDate(now.getDate() - 30)
    
    const last30DaysIncome = allIncome.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= last30DaysStart && itemDate < now
    })
    
    const last30DaysExpenses = allExpenses.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= last30DaysStart && itemDate < now
    })
    
    // Calculate daily averages
    const daysInPeriod = 30
    const avgDailyRevenue = last30DaysIncome.reduce((sum, item) => sum + item.grossAmount, 0) / daysInPeriod
    const avgDailyOutputVAT = last30DaysIncome.reduce((sum, item) => sum + item.vatAmount, 0) / daysInPeriod
    const avgDailyInputVAT = last30DaysExpenses.reduce((sum, item) => {
      const deductibleVAT = item.vatAmount * (item.deductiblePercentage / 100)
      return sum + deductibleVAT
    }, 0) / daysInPeriod
    const avgDailyNetVAT = avgDailyOutputVAT - avgDailyInputVAT
    
    // Calculate weekly averages (last 4 weeks)
    const last4WeeksStart = new Date(now)
    last4WeeksStart.setDate(now.getDate() - 28)
    
    const last4WeeksIncome = allIncome.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= last4WeeksStart && itemDate < now
    })
    
    const last4WeeksExpenses = allExpenses.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= last4WeeksStart && itemDate < now
    })
    
    const weeksInPeriod = 4
    const avgWeeklyRevenue = last4WeeksIncome.reduce((sum, item) => sum + item.grossAmount, 0) / weeksInPeriod
    const avgWeeklyOutputVAT = last4WeeksIncome.reduce((sum, item) => sum + item.vatAmount, 0) / weeksInPeriod
    const avgWeeklyInputVAT = last4WeeksExpenses.reduce((sum, item) => {
      const deductibleVAT = item.vatAmount * (item.deductiblePercentage / 100)
      return sum + deductibleVAT
    }, 0) / weeksInPeriod
    const avgWeeklyNetVAT = avgWeeklyOutputVAT - avgWeeklyInputVAT
    
    // Calculate monthly averages (last 3 months)
    const last3MonthsStart = new Date(now.getFullYear(), now.getMonth() - 3, 1)
    
    const last3MonthsIncome = allIncome.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= last3MonthsStart && itemDate < now
    })
    
    const last3MonthsExpenses = allExpenses.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= last3MonthsStart && itemDate < now
    })
    
    const monthsInPeriod = 3
    const avgMonthlyRevenue = last3MonthsIncome.reduce((sum, item) => sum + item.grossAmount, 0) / monthsInPeriod
    const avgMonthlyOutputVAT = last3MonthsIncome.reduce((sum, item) => sum + item.vatAmount, 0) / monthsInPeriod
    const avgMonthlyInputVAT = last3MonthsExpenses.reduce((sum, item) => {
      const deductibleVAT = item.vatAmount * (item.deductiblePercentage / 100)
      return sum + deductibleVAT
    }, 0) / monthsInPeriod
    const avgMonthlyNetVAT = avgMonthlyOutputVAT - avgMonthlyInputVAT
    
    // Calculate current period performance to adjust predictions
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const todayIncome = allIncome.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= todayStart && itemDate <= now
    })
    const todayExpenses = allExpenses.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= todayStart && itemDate <= now
    })
    
    const dayOfWeek = now.getDay()
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - daysToMonday)
    weekStart.setHours(0, 0, 0, 0)
    
    const weekIncome = allIncome.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= weekStart && itemDate <= now
    })
    const weekExpenses = allExpenses.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= weekStart && itemDate <= now
    })
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    const monthIncome = allIncome.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= monthStart && itemDate <= now
    })
    const monthExpenses = allExpenses.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= monthStart && itemDate <= now
    })
    
    // Calculate remaining time in periods
    const hoursRemainingToday = 24 - now.getHours()
    const daysRemainingWeek = 7 - (dayOfWeek === 0 ? 7 : dayOfWeek)
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysRemainingMonth = daysInMonth - now.getDate()
    
    // Calculate current performance rates
    const currentTodayRevenue = todayIncome.reduce((sum, item) => sum + item.grossAmount, 0)
    const currentTodayOutputVAT = todayIncome.reduce((sum, item) => sum + item.vatAmount, 0)
    const currentTodayInputVAT = todayExpenses.reduce((sum, item) => {
      const deductibleVAT = item.vatAmount * (item.deductiblePercentage / 100)
      return sum + deductibleVAT
    }, 0)
    
    const currentWeekRevenue = weekIncome.reduce((sum, item) => sum + item.grossAmount, 0)
    const currentWeekOutputVAT = weekIncome.reduce((sum, item) => sum + item.vatAmount, 0)
    const currentWeekInputVAT = weekExpenses.reduce((sum, item) => {
      const deductibleVAT = item.vatAmount * (item.deductiblePercentage / 100)
      return sum + deductibleVAT
    }, 0)
    
    const currentMonthRevenue = monthIncome.reduce((sum, item) => sum + item.grossAmount, 0)
    const currentMonthOutputVAT = monthIncome.reduce((sum, item) => sum + item.vatAmount, 0)
    const currentMonthInputVAT = monthExpenses.reduce((sum, item) => {
      const deductibleVAT = item.vatAmount * (item.deductiblePercentage / 100)
      return sum + deductibleVAT
    }, 0)
    
    // Calculate hourly rate for today (if we have data)
    const hoursElapsedToday = now.getHours() + (now.getMinutes() / 60)
    const hourlyRateToday = hoursElapsedToday > 0 ? currentTodayRevenue / hoursElapsedToday : avgDailyRevenue / 24
    
    // Calculate daily rate for week (based on days elapsed)
    const daysElapsedWeek = daysToMonday + 1
    const dailyRateWeek = daysElapsedWeek > 0 ? currentWeekRevenue / daysElapsedWeek : avgWeeklyRevenue / 7
    
    // Calculate daily rate for month (based on days elapsed)
    const daysElapsedMonth = now.getDate()
    const dailyRateMonth = daysElapsedMonth > 0 ? currentMonthRevenue / daysElapsedMonth : avgMonthlyRevenue / daysInMonth
    
    // Predictions: Current + (Remaining time * Average rate)
    // Today prediction
    predictions.today.revenue = currentTodayRevenue + (hourlyRateToday * hoursRemainingToday)
    predictions.today.outputVAT = currentTodayOutputVAT + ((currentTodayOutputVAT / Math.max(hoursElapsedToday, 1)) * hoursRemainingToday)
    predictions.today.inputVAT = currentTodayInputVAT + ((currentTodayInputVAT / Math.max(hoursElapsedToday, 1)) * hoursRemainingToday)
    predictions.today.netVAT = predictions.today.outputVAT - predictions.today.inputVAT
    
    // This week prediction
    predictions.thisWeek.revenue = currentWeekRevenue + (dailyRateWeek * daysRemainingWeek)
    predictions.thisWeek.outputVAT = currentWeekOutputVAT + ((currentWeekOutputVAT / Math.max(daysElapsedWeek, 1)) * daysRemainingWeek)
    predictions.thisWeek.inputVAT = currentWeekInputVAT + ((currentWeekInputVAT / Math.max(daysElapsedWeek, 1)) * daysRemainingWeek)
    predictions.thisWeek.netVAT = predictions.thisWeek.outputVAT - predictions.thisWeek.inputVAT
    
    // This month prediction
    predictions.thisMonth.revenue = currentMonthRevenue + (dailyRateMonth * daysRemainingMonth)
    predictions.thisMonth.outputVAT = currentMonthOutputVAT + ((currentMonthOutputVAT / Math.max(daysElapsedMonth, 1)) * daysRemainingMonth)
    predictions.thisMonth.inputVAT = currentMonthInputVAT + ((currentMonthInputVAT / Math.max(daysElapsedMonth, 1)) * daysRemainingMonth)
    predictions.thisMonth.netVAT = predictions.thisMonth.outputVAT - predictions.thisMonth.inputVAT
    
    return predictions
  }

  // Get date range for dashboard filter
  const getDashboardFilterRange = (filter) => {
    const now = new Date()
    let startDate, endDate
    
    switch (filter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
        break
      case 'thisWeek':
        const dayOfWeek = now.getDay()
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        startDate = new Date(now)
        startDate.setDate(now.getDate() - daysToMonday)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(now)
        endDate.setHours(23, 59, 59, 999)
        break
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        break
      case 'Q1':
        startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
        endDate = new Date(now.getFullYear(), 3, 0, 23, 59, 59, 999)
        break
      case 'Q2':
        startDate = new Date(now.getFullYear(), 3, 1, 0, 0, 0, 0)
        endDate = new Date(now.getFullYear(), 6, 0, 23, 59, 59, 999)
        break
      case 'Q3':
        startDate = new Date(now.getFullYear(), 6, 1, 0, 0, 0, 0)
        endDate = new Date(now.getFullYear(), 9, 0, 23, 59, 59, 999)
        break
      case 'Q4':
        startDate = new Date(now.getFullYear(), 9, 1, 0, 0, 0, 0)
        endDate = new Date(now.getFullYear(), 12, 0, 23, 59, 59, 999)
        break
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
        break
      default:
        // All data - use a wide range
        startDate = new Date(2020, 0, 1, 0, 0, 0, 0)
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    }
    
    return { startDate, endDate }
  }

  // Get filtered dashboard data based on selected filter
  const getFilteredDashboardData = useMemo(() => {
    if (!dashboardData) return { filteredIncome: [], filteredExpenses: [], filteredDailyChartData: [], filteredCumulativeChartData: [] }
    
    const { startDate, endDate } = getDashboardFilterRange(dashboardFilter)
    
    // Filter income and expenses
    const filteredIncome = dashboardData.allIncome.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= startDate && itemDate <= endDate
    })
    
    const filteredExpenses = dashboardData.allExpenses.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= startDate && itemDate <= endDate
    })
    
    // Filter chart data (last 30 days or filter period, whichever is shorter)
    const chartEndDate = endDate > new Date() ? new Date() : endDate
    const chartStartDate = new Date(chartEndDate)
    chartStartDate.setDate(chartEndDate.getDate() - 30)
    const actualStartDate = chartStartDate > startDate ? chartStartDate : startDate
    
    const filteredDailyData = {}
    const filteredCumulativeData = {}
    
    // Initialize dates in range
    for (let d = new Date(actualStartDate); d <= chartEndDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0]
      filteredDailyData[dateKey] = { date: dateKey, inputVAT: 0, outputVAT: 0, netVAT: 0 }
      filteredCumulativeData[dateKey] = { date: dateKey, inputVAT: 0, outputVAT: 0, netVAT: 0 }
    }
    
    // Process filtered income
    filteredIncome.forEach(item => {
      const itemDate = new Date(item.date)
      if (itemDate >= actualStartDate && itemDate <= chartEndDate) {
        const dateKey = itemDate.toISOString().split('T')[0]
        if (filteredDailyData[dateKey]) {
          filteredDailyData[dateKey].outputVAT += item.vatAmount
          filteredDailyData[dateKey].netVAT += item.vatAmount
        }
      }
    })
    
    // Process filtered expenses
    filteredExpenses.forEach(item => {
      const itemDate = new Date(item.date)
      if (itemDate >= actualStartDate && itemDate <= chartEndDate) {
        const dateKey = itemDate.toISOString().split('T')[0]
        if (filteredDailyData[dateKey]) {
          const deductibleVAT = item.vatAmount * (item.deductiblePercentage / 100)
          filteredDailyData[dateKey].inputVAT += deductibleVAT
          filteredDailyData[dateKey].netVAT -= deductibleVAT
        }
      }
    })
    
    // Calculate cumulative
    let cumInputVAT = 0
    let cumOutputVAT = 0
    let cumNetVAT = 0
    
    const sortedDates = Object.keys(filteredDailyData).sort()
    sortedDates.forEach(dateKey => {
      cumInputVAT += filteredDailyData[dateKey].inputVAT
      cumOutputVAT += filteredDailyData[dateKey].outputVAT
      cumNetVAT += filteredDailyData[dateKey].netVAT
      
      filteredCumulativeData[dateKey] = {
        date: dateKey,
        inputVAT: cumInputVAT,
        outputVAT: cumOutputVAT,
        netVAT: cumNetVAT
      }
    })
    
    return {
      filteredIncome,
      filteredExpenses,
      filteredDailyChartData: Object.values(filteredDailyData).filter(d => d.date),
      filteredCumulativeChartData: Object.values(filteredCumulativeData).filter(d => d.date)
    }
  }, [dashboardData, dashboardFilter])

  // Handle chart click for drill-down
  const handleChartClick = (data) => {
    if (!data || !data.activePayload || !data.activePayload[0]) return
    
    const clickedDate = data.activePayload[0].payload.date
    if (!clickedDate) return
    
    setSelectedDate(clickedDate)
    
    // Filter transactions for this date
    const dateTransactions = []
    
    const filteredData = getFilteredDashboardData
    filteredData.filteredIncome.forEach(item => {
      const itemDate = new Date(item.date).toISOString().split('T')[0]
      if (itemDate === clickedDate) {
        dateTransactions.push({ ...item, type: 'income' })
      }
    })
    
    filteredData.filteredExpenses.forEach(item => {
      const itemDate = new Date(item.date).toISOString().split('T')[0]
      if (itemDate === clickedDate) {
        dateTransactions.push({ ...item, type: 'expense' })
      }
    })
    
    setDrillDownData(dateTransactions.sort((a, b) => new Date(a.date) - new Date(b.date)))
    setShowDrillDown(true)
  }

  // Generate VAT report
  const generateVATReport = async () => {
    if (!selectedPeriod) {
      console.warn('No period selected')
      return
    }

    setLoading(true)
    try {
      const { startDate, endDate } = getPeriodDateRange(selectedPeriod, vatFilingFrequency)
      
      console.log('Generating VAT report:', {
        period: selectedPeriod,
        filingFrequency: vatFilingFrequency,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })
      
      // Fetch data from both tables
      const [income, expenses] = await Promise.all([
        fetchIncomeData(startDate, endDate),
        fetchExpensesData(startDate, endDate)
      ])

      console.log('Report data:', {
        incomeCount: income.length,
        expensesCount: expenses.length
      })

      setIncomeData(income)
      setExpensesData(expenses)

      // Calculate VAT Summary
      const summary = calculateVATSummary(income, expenses)
      setVatSummary(summary)
      
      console.log('VAT Summary:', summary)
    } catch (error) {
      console.error('Error generating VAT report:', error)
      alert(`Error generating report: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Calculate VAT Summary
  const calculateVATSummary = (income, expenses) => {
    // Group by VAT rate
    const incomeByRate = {
      19: { net: 0, vat: 0, count: 0 },
      7: { net: 0, vat: 0, count: 0 },
      0: { net: 0, vat: 0, count: 0 }
    }

    const expensesByRate = {
      19: { net: 0, deductibleVAT: 0, nonDeductibleVAT: 0, count: 0 },
      7: { net: 0, deductibleVAT: 0, nonDeductibleVAT: 0, count: 0 },
      0: { net: 0, deductibleVAT: 0, nonDeductibleVAT: 0, count: 0 }
    }

    // Process income
    income.forEach(inv => {
      const rate = inv.vatRate === 0 ? 0 : inv.vatRate === 7 ? 7 : 19
      if (incomeByRate[rate]) {
        incomeByRate[rate].net += inv.netAmount
        incomeByRate[rate].vat += inv.vatAmount
        incomeByRate[rate].count++
      }
    })

    // Process expenses
    expenses.forEach(exp => {
      const rate = exp.vatRate === 0 ? 0 : exp.vatRate === 7 ? 7 : 19
      if (expensesByRate[rate]) {
        const deductibleVAT = exp.vatAmount * (exp.deductiblePercentage / 100)
        const nonDeductibleVAT = exp.vatAmount - deductibleVAT
        
        expensesByRate[rate].net += exp.netAmount
        expensesByRate[rate].deductibleVAT += deductibleVAT
        expensesByRate[rate].nonDeductibleVAT += nonDeductibleVAT
        expensesByRate[rate].count++
      }
    })

    // Calculate totals
    const totalOutputVAT = incomeByRate[19].vat + incomeByRate[7].vat
    const totalInputVAT = expensesByRate[19].deductibleVAT + expensesByRate[7].deductibleVAT
    const netVAT = totalOutputVAT - totalInputVAT

    return {
      incomeByRate,
      expensesByRate,
      totalOutputVAT,
      totalInputVAT,
      netVAT,
      totalIncomeNet: incomeByRate[19].net + incomeByRate[7].net + incomeByRate[0].net,
      totalExpensesNet: expensesByRate[19].net + expensesByRate[7].net + expensesByRate[0].net
    }
  }

  // Convert logo to base64
  const getLogoBase64 = async () => {
    try {
      const response = await fetch(logo)
      const blob = await response.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error('Error loading logo:', error)
      return null
    }
  }

  // Export Excel file with perfect formatting
  const exportExcelReport = () => {
    if (!vatSummary) return

    try {
      const workbook = XLSX.utils.book_new()

      // ===== SUMMARY SHEET =====
      const summaryData = []
      
      // Header section
      summaryData.push(['LST Travel Agency - VAT Report'])
      summaryData.push([])
      summaryData.push(['Period:', selectedPeriod])
      summaryData.push(['Filing Frequency:', vatFilingFrequency === 'monthly' ? 'Monthly' : 'Quarterly'])
      const deadline = getVATDeadline(selectedPeriod, vatFilingFrequency)
      if (deadline) {
        summaryData.push(['Deadline:', deadline.toLocaleDateString('de-DE')])
      }
      summaryData.push(['Report Date:', new Date().toLocaleDateString('de-DE')])
      summaryData.push([])

      // Output VAT Summary
      summaryData.push(['OUTPUT VAT (Umsatzsteuer)'])
      summaryData.push(['VAT Rate', 'Net Amount', 'VAT Amount', 'Count'])
      summaryData.push(['19%', vatSummary.incomeByRate[19].net, vatSummary.incomeByRate[19].vat, vatSummary.incomeByRate[19].count])
      summaryData.push(['7%', vatSummary.incomeByRate[7].net, vatSummary.incomeByRate[7].vat, vatSummary.incomeByRate[7].count])
      summaryData.push(['0% / Tax-free', vatSummary.incomeByRate[0].net, vatSummary.incomeByRate[0].vat, vatSummary.incomeByRate[0].count])
      summaryData.push(['TOTAL', vatSummary.totalIncomeNet, vatSummary.totalOutputVAT, incomeData.length])
      summaryData.push([])

      // Input VAT Summary
      summaryData.push(['INPUT VAT (Vorsteuer)'])
      summaryData.push(['VAT Rate', 'Net Amount', 'Deductible VAT', 'Non-Deductible VAT', 'Count'])
      summaryData.push([
        '19%',
        vatSummary.expensesByRate[19].net,
        vatSummary.expensesByRate[19].deductibleVAT,
        vatSummary.expensesByRate[19].nonDeductibleVAT,
        vatSummary.expensesByRate[19].count
      ])
      summaryData.push([
        '7%',
        vatSummary.expensesByRate[7].net,
        vatSummary.expensesByRate[7].deductibleVAT,
        vatSummary.expensesByRate[7].nonDeductibleVAT,
        vatSummary.expensesByRate[7].count
      ])
      summaryData.push([
        '0% / Tax-free',
        vatSummary.expensesByRate[0].net,
        vatSummary.expensesByRate[0].deductibleVAT,
        vatSummary.expensesByRate[0].nonDeductibleVAT,
        vatSummary.expensesByRate[0].count
      ])
      summaryData.push([
        'TOTAL',
        vatSummary.totalExpensesNet,
        vatSummary.totalInputVAT,
        vatSummary.expensesByRate[19].nonDeductibleVAT + vatSummary.expensesByRate[7].nonDeductibleVAT,
        expensesData.length
      ])
      summaryData.push([])

      // Net VAT
      summaryData.push(['NET VAT'])
      summaryData.push([vatSummary.netVAT >= 0 ? 'Amount to Pay' : 'Refund', Math.abs(vatSummary.netVAT)])

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      
      // Set column widths for summary sheet
      summarySheet['!cols'] = [
        { wch: 25 }, // Column A
        { wch: 18 }, // Column B
        { wch: 18 }, // Column C
        { wch: 12 }, // Column D
        { wch: 18 }  // Column E
      ]

      // Add summary sheet to workbook
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

      // ===== INCOME SHEET =====
      if (incomeData.length > 0) {
        const incomeHeaders = ['Date', 'Invoice Number', 'Partner', 'Net Amount', 'VAT Rate %', 'VAT Amount', 'Gross Amount', 'SKR03 Account']
        const incomeRows = incomeData.map(inv => [
          new Date(inv.date).toLocaleDateString('de-DE'),
          inv.invoiceNumber || '',
          inv.partner || '',
          inv.netAmount,
          inv.vatRate,
          inv.vatAmount,
          inv.grossAmount,
          inv.skr03Account || ''
        ])
        
        const incomeDataArray = [incomeHeaders, ...incomeRows]
        const incomeSheet = XLSX.utils.aoa_to_sheet(incomeDataArray)
        
        // Set column widths
        incomeSheet['!cols'] = [
          { wch: 12 }, // Date
          { wch: 20 }, // Invoice Number
          { wch: 30 }, // Partner
          { wch: 15 }, // Net Amount
          { wch: 12 }, // VAT Rate
          { wch: 15 }, // VAT Amount
          { wch: 15 }, // Gross Amount
          { wch: 15 }  // SKR03 Account
        ]

        // Freeze first row (header)
        incomeSheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' }

        XLSX.utils.book_append_sheet(workbook, incomeSheet, 'Income')
      }

      // ===== EXPENSES SHEET =====
      if (expensesData.length > 0) {
        const expensesHeaders = ['Date', 'Invoice Number', 'Partner', 'Net Amount', 'VAT Rate %', 'VAT Amount', 'Deductible %', 'Gross Amount', 'SKR03 Account']
        const expensesRows = expensesData.map(exp => [
          new Date(exp.date).toLocaleDateString('de-DE'),
          exp.invoiceNumber || '',
          exp.partner || '',
          exp.netAmount,
          exp.vatRate,
          exp.vatAmount,
          exp.deductiblePercentage,
          exp.grossAmount,
          exp.skr03Account || ''
        ])
        
        const expensesDataArray = [expensesHeaders, ...expensesRows]
        const expensesSheet = XLSX.utils.aoa_to_sheet(expensesDataArray)
        
        // Set column widths
        expensesSheet['!cols'] = [
          { wch: 12 }, // Date
          { wch: 20 }, // Invoice Number
          { wch: 30 }, // Partner
          { wch: 15 }, // Net Amount
          { wch: 12 }, // VAT Rate
          { wch: 15 }, // VAT Amount
          { wch: 15 }, // Deductible %
          { wch: 15 }, // Gross Amount
          { wch: 15 }  // SKR03 Account
        ]

        // Freeze first row (header)
        expensesSheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' }

        XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Expenses')
      }

      // Write file with proper Excel format
      const fileName = `LST_Tax_Report_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(workbook, fileName, { 
        bookType: 'xlsx',
        type: 'array',
        cellStyles: true
      })
    } catch (error) {
      console.error('Error generating Excel file:', error)
      alert(`Error generating Excel file: ${error.message}`)
    }
  }

  // Export DATEV CSV with improved formatting
  const exportDATEVCSV = async () => {
    if (!vatSummary) return

    const lines = []
    
    // Header information
    lines.push('LST Travel Agency - VAT Report Export')
    lines.push(`Period: ${selectedPeriod}`)
    lines.push(`Filing Frequency: ${vatFilingFrequency === 'monthly' ? 'Monthly' : 'Quarterly'}`)
    lines.push(`Export Date: ${new Date().toLocaleDateString('de-DE', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })}`)
    lines.push('')
    lines.push('=== VAT SUMMARY ===')
    lines.push(`Total Output VAT (19%): ${formatCurrency(vatSummary.incomeByRate[19].vat).replace('€', '').trim()}`)
    lines.push(`Total Output VAT (7%): ${formatCurrency(vatSummary.incomeByRate[7].vat).replace('€', '').trim()}`)
    lines.push(`Total Input VAT (19%): ${formatCurrency(vatSummary.expensesByRate[19].deductibleVAT).replace('€', '').trim()}`)
    lines.push(`Total Input VAT (7%): ${formatCurrency(vatSummary.expensesByRate[7].deductibleVAT).replace('€', '').trim()}`)
    lines.push(`Net VAT: ${formatCurrency(vatSummary.netVAT).replace('€', '').trim()}`)
    lines.push('')
    lines.push('=== DETAILED TRANSACTIONS ===')
    lines.push('')
    
    // Column headers
    lines.push('Date;Invoice Number;Partner;Net Amount;VAT Rate;VAT Amount;Gross Amount;SKR03 Account;Type')
    
    // Income entries
    if (incomeData.length > 0) {
      lines.push('--- INCOME TRANSACTIONS ---')
      incomeData.forEach(inv => {
        const date = new Date(inv.date).toLocaleDateString('de-DE')
        const net = inv.netAmount.toFixed(2).replace('.', ',')
        const vat = inv.vatAmount.toFixed(2).replace('.', ',')
        const gross = inv.grossAmount.toFixed(2).replace('.', ',')
        lines.push(`${date};${inv.invoiceNumber || ''};${inv.partner || ''};${net};${inv.vatRate};${vat};${gross};${inv.skr03Account || ''};Income`)
      })
      lines.push('')
    }
    
    // Expense entries
    if (expensesData.length > 0) {
      lines.push('--- EXPENSE TRANSACTIONS ---')
      expensesData.forEach(exp => {
        const date = new Date(exp.date).toLocaleDateString('de-DE')
        const net = exp.netAmount.toFixed(2).replace('.', ',')
        const vat = exp.vatAmount.toFixed(2).replace('.', ',')
        const gross = exp.grossAmount.toFixed(2).replace('.', ',')
        lines.push(`${date};${exp.invoiceNumber || ''};${exp.partner || ''};${net};${exp.vatRate};${vat};${gross};${exp.skr03Account || ''};Expense`)
      })
    }
    
    const csvContent = lines.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `LST_Tax_Report_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export PDF Summary with professional layout
  const exportPDFSummary = async () => {
    if (!vatSummary) return

    try {
      const doc = new jsPDF('p', 'mm', 'a4')
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      let yPos = 20
      const margin = 15
      const contentWidth = pageWidth - (margin * 2)

      // Load logo
      const logoBase64 = await getLogoBase64()
      
      // Header with logo
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', margin, yPos, 40, 15)
      }
      
      // Company info
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('LST Travel Agency', pageWidth - margin, yPos + 5, { align: 'right' })
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Düsseldorfer Straße 14', pageWidth - margin, yPos + 10, { align: 'right' })
      doc.text('60329 Frankfurt am Main, Germany', pageWidth - margin, yPos + 15, { align: 'right' })
      
      yPos += 30

      // Title
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('VAT Report (Umsatzsteuervoranmeldung)', margin, yPos)
      
      yPos += 10

      // Period and filing frequency
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(`Period: ${selectedPeriod}`, margin, yPos)
      doc.text(`Filing Frequency: ${vatFilingFrequency === 'monthly' ? 'Monthly' : 'Quarterly'}`, margin, yPos + 5)
      
      const deadline = getVATDeadline(selectedPeriod, vatFilingFrequency)
      if (deadline) {
        doc.text(`Deadline: ${deadline.toLocaleDateString('de-DE')}`, margin, yPos + 10)
      }
      
      doc.text(`Report Date: ${new Date().toLocaleDateString('de-DE')}`, pageWidth - margin, yPos, { align: 'right' })
      
      yPos += 20

      // VAT Summary Section
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('VAT Summary', margin, yPos)
      
      yPos += 8

      // Output VAT Table
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Output VAT (Umsatzsteuer)', margin, yPos)
      yPos += 5

      const outputVATData = [
        ['VAT Rate', 'Net Amount', 'VAT Amount', 'Count'],
        ['19%', formatCurrency(vatSummary.incomeByRate[19].net), formatCurrency(vatSummary.incomeByRate[19].vat), vatSummary.incomeByRate[19].count],
        ['7%', formatCurrency(vatSummary.incomeByRate[7].net), formatCurrency(vatSummary.incomeByRate[7].vat), vatSummary.incomeByRate[7].count],
        ['0% / Tax-free', formatCurrency(vatSummary.incomeByRate[0].net), formatCurrency(vatSummary.incomeByRate[0].vat), vatSummary.incomeByRate[0].count],
        ['TOTAL', formatCurrency(vatSummary.totalIncomeNet), formatCurrency(vatSummary.totalOutputVAT), incomeData.length]
      ]

      doc.autoTable({
        startY: yPos,
        head: [outputVATData[0]],
        body: outputVATData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [74, 85, 104], textColor: 255, fontStyle: 'bold' },
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 3 }
      })

      yPos = doc.lastAutoTable.finalY + 10

      // Input VAT Table
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Input VAT (Vorsteuer)', margin, yPos)
      yPos += 5

      const inputVATData = [
        ['VAT Rate', 'Net Amount', 'Deductible VAT', 'Non-Deductible VAT', 'Count'],
        [
          '19%',
          formatCurrency(vatSummary.expensesByRate[19].net),
          formatCurrency(vatSummary.expensesByRate[19].deductibleVAT),
          formatCurrency(vatSummary.expensesByRate[19].nonDeductibleVAT),
          vatSummary.expensesByRate[19].count
        ],
        [
          '7%',
          formatCurrency(vatSummary.expensesByRate[7].net),
          formatCurrency(vatSummary.expensesByRate[7].deductibleVAT),
          formatCurrency(vatSummary.expensesByRate[7].nonDeductibleVAT),
          vatSummary.expensesByRate[7].count
        ],
        [
          '0% / Tax-free',
          formatCurrency(vatSummary.expensesByRate[0].net),
          formatCurrency(vatSummary.expensesByRate[0].deductibleVAT),
          formatCurrency(vatSummary.expensesByRate[0].nonDeductibleVAT),
          vatSummary.expensesByRate[0].count
        ],
        [
          'TOTAL',
          formatCurrency(vatSummary.totalExpensesNet),
          formatCurrency(vatSummary.totalInputVAT),
          formatCurrency(vatSummary.expensesByRate[19].nonDeductibleVAT + vatSummary.expensesByRate[7].nonDeductibleVAT),
          expensesData.length
        ]
      ]

      doc.autoTable({
        startY: yPos,
        head: [inputVATData[0]],
        body: inputVATData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [74, 85, 104], textColor: 255, fontStyle: 'bold' },
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 3 }
      })

      yPos = doc.lastAutoTable.finalY + 10

      // Net VAT
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      const netVATColor = vatSummary.netVAT >= 0 ? [220, 53, 69] : [40, 167, 69]
      doc.setTextColor(...netVATColor)
      doc.text(
        `Net VAT ${vatSummary.netVAT >= 0 ? 'to Pay' : 'Refund'}: ${formatCurrency(Math.abs(vatSummary.netVAT))}`,
        margin,
        yPos
      )
      doc.setTextColor(0, 0, 0)

      yPos += 15

      // Check if we need a new page for detailed transactions
      if (yPos > pageHeight - 60) {
        doc.addPage()
        yPos = 20
      }

      // Detailed Income Transactions
      if (incomeData.length > 0) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Income Transactions (Einnahmen)', margin, yPos)
        yPos += 5

        const incomeTableData = incomeData.map(inv => [
          new Date(inv.date).toLocaleDateString('de-DE'),
          inv.invoiceNumber || '',
          inv.partner || '',
          formatCurrency(inv.netAmount),
          `${inv.vatRate}%`,
          formatCurrency(inv.vatAmount),
          formatCurrency(inv.grossAmount),
          inv.skr03Account || ''
        ])

        doc.autoTable({
          startY: yPos,
          head: [['Date', 'Invoice #', 'Partner', 'Net', 'VAT %', 'VAT', 'Gross', 'SKR03']],
          body: incomeTableData,
          theme: 'striped',
          headStyles: { fillColor: [74, 85, 104], textColor: 255, fontStyle: 'bold' },
          margin: { left: margin, right: margin },
          styles: { fontSize: 7, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 30 },
            2: { cellWidth: 40 },
            3: { cellWidth: 25 },
            4: { cellWidth: 20 },
            5: { cellWidth: 25 },
            6: { cellWidth: 25 },
            7: { cellWidth: 25 }
          }
        })

        yPos = doc.lastAutoTable.finalY + 10
      }

      // Detailed Expense Transactions
      if (expensesData.length > 0) {
        if (yPos > pageHeight - 60) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Expense Transactions (Ausgaben)', margin, yPos)
        yPos += 5

        const expenseTableData = expensesData.map(exp => [
          new Date(exp.date).toLocaleDateString('de-DE'),
          exp.invoiceNumber || '',
          exp.partner || '',
          formatCurrency(exp.netAmount),
          `${exp.vatRate}%`,
          formatCurrency(exp.vatAmount),
          `${exp.deductiblePercentage}%`,
          formatCurrency(exp.grossAmount),
          exp.skr03Account || ''
        ])

        doc.autoTable({
          startY: yPos,
          head: [['Date', 'Invoice #', 'Partner', 'Net', 'VAT %', 'VAT', 'Deductible %', 'Gross', 'SKR03']],
          body: expenseTableData,
          theme: 'striped',
          headStyles: { fillColor: [74, 85, 104], textColor: 255, fontStyle: 'bold' },
          margin: { left: margin, right: margin },
          styles: { fontSize: 7, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 30 },
            2: { cellWidth: 40 },
            3: { cellWidth: 25 },
            4: { cellWidth: 20 },
            5: { cellWidth: 25 },
            6: { cellWidth: 25 },
            7: { cellWidth: 25 },
            8: { cellWidth: 25 }
          }
        })
      }

      // Footer
      const totalPages = doc.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(
          `Page ${i} of ${totalPages} | LST Travel Agency | Generated on ${new Date().toLocaleDateString('de-DE')}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        )
      }

      // Save PDF
      doc.save(`LST_Tax_Report_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert(`Error generating PDF: ${error.message}`)
    }
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

  // Start editing a cell
  const startEditing = (rowId, field, type, e) => {
    e.stopPropagation()
    
    let item
    if (type === 'income') {
      item = dashboardData?.allIncome.find(i => i.id === rowId) || incomeData.find(i => i.id === rowId)
    } else {
      item = dashboardData?.allExpenses.find(i => i.id === rowId) || expensesData.find(i => i.id === rowId)
    }
    
    if (!item) return
    
    let rawValue = ''
    if (field === 'date') {
      rawValue = item.date ? new Date(item.date).toISOString().split('T')[0] : ''
    } else if (field === 'netAmount' || field === 'vatAmount' || field === 'grossAmount' || field === 'vatRate' || field === 'deductiblePercentage') {
      rawValue = item[field] !== null && item[field] !== undefined ? String(item[field]) : ''
    } else {
      rawValue = item[field] || ''
    }
    
    setEditingCell({ rowId, field, type })
    setEditValue(rawValue)
    setOriginalValue(rawValue)
    
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus()
        if (editInputRef.current.select) {
          editInputRef.current.select()
        }
      }
    }, 0)
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingCell(null)
    setEditValue('')
    setOriginalValue('')
  }

  // Handle input change
  const handleInputChange = (e) => {
    setEditValue(e.target.value)
  }

  // Handle input blur
  const handleInputBlur = (rowId, field, type) => {
    if (editValue !== originalValue) {
      saveCell(rowId, field, type, editValue)
    } else {
      cancelEditing()
    }
  }

  // Handle input key down
  const handleInputKeyDown = (e, rowId, field, type) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (editValue !== originalValue) {
        saveCell(rowId, field, type, editValue)
      } else {
        cancelEditing()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEditing()
    }
  }

  // Save cell value
  const saveCell = async (rowId, field, type, value) => {
    try {
      let updateData = {}
      let recalculated = false
      
      if (type === 'income') {
        const item = dashboardData?.allIncome.find(i => i.id === rowId) || incomeData.find(i => i.id === rowId)
        if (!item) return
        
        if (field === 'date') {
          updateData.created_at = new Date(value).toISOString()
        } else if (field === 'invoiceNumber') {
          updateData.booking_ref = value
        } else if (field === 'partner') {
          const parts = value.split(' ')
          updateData.first_name = parts[0] || ''
          updateData.last_name = parts.slice(1).join(' ') || ''
        } else if (field === 'grossAmount') {
          const gross = parseFloat(value) || 0
          const vatRate = item.vatRate || 19
          const { net, vat } = calculateVAT(gross, vatRate)
          updateData.total_amount_due = gross
          recalculated = true
          item.grossAmount = gross
          item.netAmount = net
          item.vatAmount = vat
        } else if (field === 'vatRate') {
          const vatRate = parseFloat(value) || 0
          const gross = item.grossAmount || 0
          const { net, vat } = calculateVAT(gross, vatRate)
          updateData.vat_rate = vatRate
          recalculated = true
          item.vatRate = vatRate
          item.netAmount = net
          item.vatAmount = vat
        } else if (field === 'netAmount') {
          const net = parseFloat(value) || 0
          const vatRate = item.vatRate || 19
          const gross = net * (1 + vatRate / 100)
          const vat = gross - net
          updateData.total_amount_due = gross
          recalculated = true
          item.netAmount = net
          item.grossAmount = gross
          item.vatAmount = vat
        } else if (field === 'vatAmount') {
          const vat = parseFloat(value) || 0
          const vatRate = item.vatRate || 19
          const net = vat / (vatRate / 100)
          const gross = net + vat
          updateData.total_amount_due = gross
          recalculated = true
          item.netAmount = net
          item.grossAmount = gross
          item.vatAmount = vat
        } else if (field === 'skr03Account') {
          updateData.skr03_account = value
        }
        
        const { error } = await supabase
          .from('main_table')
          .update(updateData)
          .eq('id', rowId)
        
        if (error) throw error
        
        if (field === 'date') {
          item.date = updateData.created_at
        } else if (field === 'invoiceNumber') {
          item.invoiceNumber = value
        } else if (field === 'partner') {
          item.partner = value
        } else if (field === 'skr03Account') {
          item.skr03Account = value
        }
        
      } else {
        // Expenses
        const item = dashboardData?.allExpenses.find(i => i.id === rowId) || expensesData.find(i => i.id === rowId)
        if (!item) return
        
        if (field === 'date') {
          updateData.expense_date = value
        } else if (field === 'invoiceNumber') {
          updateData.invoice_number = value
        } else if (field === 'partner') {
          updateData.vendor_name = value
        } else if (field === 'grossAmount') {
          const gross = parseFloat(value) || 0
          const vatRate = item.vatRate || 19
          const { net, vat } = calculateVAT(gross, vatRate)
          updateData.gross_amount = gross
          updateData.net_amount = net
          updateData.vat_amount = vat
          recalculated = true
          item.grossAmount = gross
          item.netAmount = net
          item.vatAmount = vat
        } else if (field === 'vatRate') {
          const vatRate = parseFloat(value) || 0
          const gross = item.grossAmount || 0
          const { net, vat } = calculateVAT(gross, vatRate)
          updateData.vat_rate = vatRate
          updateData.net_amount = net
          updateData.vat_amount = vat
          recalculated = true
          item.vatRate = vatRate
          item.netAmount = net
          item.vatAmount = vat
        } else if (field === 'netAmount') {
          const net = parseFloat(value) || 0
          const vatRate = item.vatRate || 19
          const gross = net * (1 + vatRate / 100)
          const vat = gross - net
          updateData.net_amount = net
          updateData.gross_amount = gross
          updateData.vat_amount = vat
          recalculated = true
          item.netAmount = net
          item.grossAmount = gross
          item.vatAmount = vat
        } else if (field === 'vatAmount') {
          const vat = parseFloat(value) || 0
          const vatRate = item.vatRate || 19
          const net = vat / (vatRate / 100)
          const gross = net + vat
          updateData.vat_amount = vat
          updateData.net_amount = net
          updateData.gross_amount = gross
          recalculated = true
          item.netAmount = net
          item.grossAmount = gross
          item.vatAmount = vat
        } else if (field === 'deductiblePercentage') {
          updateData.deductible_percentage = parseFloat(value) || 100
          item.deductiblePercentage = parseFloat(value) || 100
        } else if (field === 'skr03Account') {
          updateData.tax_category_code = value
          item.skr03Account = value
        }
        
        const { error } = await supabase
          .from('expenses')
          .update(updateData)
          .eq('id', rowId)
        
        if (error) throw error
        
        if (field === 'date') {
          item.date = value
        } else if (field === 'invoiceNumber') {
          item.invoiceNumber = value
        } else if (field === 'partner') {
          item.partner = value
        }
      }
      
      if (dashboardData && recalculated) {
        await loadDashboardData()
      }
      
      if (vatSummary) {
        await generateVATReport()
      }
      
      cancelEditing()
    } catch (error) {
      console.error('Error saving cell:', error)
      alert(`Error saving: ${error.message}`)
      cancelEditing()
    }
  }

  // Column resize handlers
  const handleResizeStart = (field, tableType, e) => {
    e.preventDefault()
    e.stopPropagation()
    resizingRef.current = { field, tableType, startX: e.clientX, startWidth: tableType === 'income' ? incomeColumnWidths[field] : expensesColumnWidths[field] }
    
    const handleMouseMove = (e) => {
      if (!resizingRef.current) return
      const diff = e.clientX - resizingRef.current.startX
      const newWidth = Math.max(30, resizingRef.current.startWidth + diff)
      
      if (tableType === 'income') {
        setIncomeColumnWidths(prev => ({
          ...prev,
          [field]: newWidth
        }))
      } else {
        setExpensesColumnWidths(prev => ({
          ...prev,
          [field]: newWidth
        }))
      }
    }
    
    const handleMouseUp = () => {
      resizingRef.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Get column label
  const getColumnLabel = (field, type) => {
    if (field === 'row_number') return '#'
    const labels = {
      date: t.tax.date,
      invoiceNumber: t.tax.invoiceNumber,
      partner: t.tax.partner,
      netAmount: t.tax.netAmount,
      vatRate: t.tax.vatRate,
      vatAmount: t.tax.vatAmount,
      grossAmount: t.tax.grossAmount,
      deductiblePercentage: t.tax.deductible,
      skr03Account: t.tax.skr03Account
    }
    return labels[field] || field
  }

  // Get column order for income table
  const getIncomeColumnOrder = () => {
    return ['row_number', 'date', 'invoiceNumber', 'partner', 'netAmount', 'vatRate', 'vatAmount', 'grossAmount', 'skr03Account']
  }

  // Get column order for expenses table
  const getExpensesColumnOrder = () => {
    return ['row_number', 'date', 'invoiceNumber', 'partner', 'netAmount', 'vatRate', 'vatAmount', 'grossAmount', 'deductiblePercentage', 'skr03Account']
  }

  // Render editable cell
  const renderEditableCell = (item, field, type, displayValue, inputType = 'text', rowIndex = null) => {
    const isEditing = editingCell?.rowId === item.id && editingCell?.field === field && editingCell?.type === type
    
    if (field === 'row_number') {
      return (
        <div className="excel-cell">
          {rowIndex !== null ? String(rowIndex + 1) : ''}
        </div>
      )
    }
    
    if (isEditing) {
      if (inputType === 'date') {
        return (
          <input
            ref={editInputRef}
            type="text"
            className="excel-cell-input"
            value={editValue}
            onChange={handleInputChange}
            onBlur={() => handleInputBlur(item.id, field, type)}
            onKeyDown={(e) => handleInputKeyDown(e, item.id, field, type)}
            onClick={(e) => e.stopPropagation()}
            placeholder="DD-MM-YYYY"
            data-flatpickr="true"
            data-flatpickr-format="d-m-Y"
          />
        )
      } else if (inputType === 'number') {
        return (
          <input
            ref={editInputRef}
            type="number"
            step="0.01"
            className="excel-cell-input"
            value={editValue}
            onChange={handleInputChange}
            onBlur={() => handleInputBlur(item.id, field, type)}
            onKeyDown={(e) => handleInputKeyDown(e, item.id, field, type)}
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
            onBlur={() => handleInputBlur(item.id, field, type)}
            onKeyDown={(e) => handleInputKeyDown(e, item.id, field, type)}
            onClick={(e) => e.stopPropagation()}
          />
        )
      }
    }
    
    return (
      <div
        className="excel-cell excel-cell-editable"
        data-row-id={item.id}
        data-field={field}
        onClick={(e) => startEditing(item.id, field, type, e)}
      >
        {displayValue || '-'}
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
          <Link to="/tax" className="nav-item active">
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
      <main className="main-content">
        <div className="tax-page">
          {/* Page Header */}
          <div className="tax-header">
            <h1 className="tax-title">{t.tax.title}</h1>
          </div>

          {/* Tax Dashboard Section */}
          {dashboardData && (
            <div className="tax-dashboard-section">
              <div className="dashboard-header-controls">
                <h2 className="section-title">{t.tax.dashboard}</h2>
                <div className="dashboard-filter-group">
                  <label className="dashboard-filter-label">{t.tax.filterBy}:</label>
                  <select
                    className="dashboard-filter-select"
                    value={dashboardFilter}
                    onChange={(e) => setDashboardFilter(e.target.value)}
                  >
                    <option value="today">{t.tax.today}</option>
                    <option value="thisWeek">{t.tax.thisWeek}</option>
                    <option value="thisMonth">{t.tax.thisMonth}</option>
                    <option value="Q1">Q1 ({t.tax.january}-{t.tax.march})</option>
                    <option value="Q2">Q2 ({t.tax.april}-{t.tax.june})</option>
                    <option value="Q3">Q3 ({t.tax.july}-{t.tax.september})</option>
                    <option value="Q4">Q4 ({t.tax.october}-{t.tax.december})</option>
                    <option value="thisYear">{t.tax.thisYear}</option>
                    <option value="all">{t.tax.allData}</option>
                  </select>
                </div>
              </div>
              
              {/* KPI Widgets */}
              <div className="tax-kpi-grid">
                <div className="tax-kpi-card">
                  <div className="tax-kpi-header">
                    <span className="tax-kpi-label">{t.tax.today}</span>
                  </div>
                  <div className="tax-kpi-value">{formatCurrency(dashboardData.kpis.today.revenue)}</div>
                  <div className="tax-kpi-detail">
                    <span>{t.tax.netVAT}: {formatCurrency(dashboardData.kpis.today.netVAT)}</span>
                  </div>
                </div>
                
                <div className="tax-kpi-card">
                  <div className="tax-kpi-header">
                    <span className="tax-kpi-label">{t.tax.thisWeek}</span>
                  </div>
                  <div className="tax-kpi-value">{formatCurrency(dashboardData.kpis.thisWeek.revenue)}</div>
                  <div className="tax-kpi-detail">
                    <span>{t.tax.netVAT}: {formatCurrency(dashboardData.kpis.thisWeek.netVAT)}</span>
                  </div>
                </div>
                
                <div className="tax-kpi-card">
                  <div className="tax-kpi-header">
                    <span className="tax-kpi-label">{t.tax.thisMonth}</span>
                  </div>
                  <div className="tax-kpi-value">{formatCurrency(dashboardData.kpis.thisMonth.revenue)}</div>
                  <div className="tax-kpi-detail">
                    <span>{t.tax.netVAT}: {formatCurrency(dashboardData.kpis.thisMonth.netVAT)}</span>
                  </div>
                </div>
                
                <div className="tax-kpi-card">
                  <div className="tax-kpi-header">
                    <span className="tax-kpi-label">{t.tax.thisQuarter}</span>
                  </div>
                  <div className="tax-kpi-value">{formatCurrency(dashboardData.kpis.thisQuarter.revenue)}</div>
                  <div className="tax-kpi-detail">
                    <span>{t.tax.netVAT}: {formatCurrency(dashboardData.kpis.thisQuarter.netVAT)}</span>
                  </div>
                </div>
                
                <div className="tax-kpi-card">
                  <div className="tax-kpi-header">
                    <span className="tax-kpi-label">{t.tax.thisYear}</span>
                  </div>
                  <div className="tax-kpi-value">{formatCurrency(dashboardData.kpis.thisYear.revenue)}</div>
                  <div className="tax-kpi-detail">
                    <span>{t.tax.netVAT}: {formatCurrency(dashboardData.kpis.thisYear.netVAT)}</span>
                  </div>
                </div>
              </div>

              {/* Predictions Section */}
              {dashboardData?.predictions && (
                <div className="tax-predictions-section">
                  <h3 className="tax-section-title">{t.tax.predictions}</h3>
                  <p className="tax-predictions-hint">{t.tax.basedOnTrends}</p>
                  <div className="tax-kpi-grid">
                    {/* Today Prediction */}
                    <div className="tax-kpi-card tax-prediction-card">
                      <div className="tax-kpi-header">
                        <span className="tax-kpi-label">{t.tax.todayPrediction}</span>
                      </div>
                      <div className="tax-kpi-value">{formatCurrency(dashboardData.predictions.today.revenue)}</div>
                      <div className="tax-kpi-detail">
                        <span>{t.tax.netVAT}: {formatCurrency(dashboardData.predictions.today.netVAT)}</span>
                      </div>
                      <div className="tax-prediction-breakdown">
                        <div className="tax-prediction-item">
                          <span>{t.tax.outputVAT}:</span>
                          <span>{formatCurrency(dashboardData.predictions.today.outputVAT)}</span>
                        </div>
                        <div className="tax-prediction-item">
                          <span>{t.tax.inputVAT}:</span>
                          <span>{formatCurrency(dashboardData.predictions.today.inputVAT)}</span>
                        </div>
                      </div>
                    </div>

                    {/* This Week Prediction */}
                    <div className="tax-kpi-card tax-prediction-card">
                      <div className="tax-kpi-header">
                        <span className="tax-kpi-label">{t.tax.weekPrediction}</span>
                      </div>
                      <div className="tax-kpi-value">{formatCurrency(dashboardData.predictions.thisWeek.revenue)}</div>
                      <div className="tax-kpi-detail">
                        <span>{t.tax.netVAT}: {formatCurrency(dashboardData.predictions.thisWeek.netVAT)}</span>
                      </div>
                      <div className="tax-prediction-breakdown">
                        <div className="tax-prediction-item">
                          <span>{t.tax.outputVAT}:</span>
                          <span>{formatCurrency(dashboardData.predictions.thisWeek.outputVAT)}</span>
                        </div>
                        <div className="tax-prediction-item">
                          <span>{t.tax.inputVAT}:</span>
                          <span>{formatCurrency(dashboardData.predictions.thisWeek.inputVAT)}</span>
                        </div>
                      </div>
                    </div>

                    {/* This Month Prediction */}
                    <div className="tax-kpi-card tax-prediction-card">
                      <div className="tax-kpi-header">
                        <span className="tax-kpi-label">{t.tax.monthPrediction}</span>
                      </div>
                      <div className="tax-kpi-value">{formatCurrency(dashboardData.predictions.thisMonth.revenue)}</div>
                      <div className="tax-kpi-detail">
                        <span>{t.tax.netVAT}: {formatCurrency(dashboardData.predictions.thisMonth.netVAT)}</span>
                      </div>
                      <div className="tax-prediction-breakdown">
                        <div className="tax-prediction-item">
                          <span>{t.tax.outputVAT}:</span>
                          <span>{formatCurrency(dashboardData.predictions.thisMonth.outputVAT)}</span>
                        </div>
                        <div className="tax-prediction-item">
                          <span>{t.tax.inputVAT}:</span>
                          <span>{formatCurrency(dashboardData.predictions.thisMonth.inputVAT)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Charts Grid */}
              <div className="tax-charts-grid">
                {/* Daily VAT Chart */}
                <div className="tax-chart-card">
                  <h3 className="tax-chart-title">{t.tax.dailyVAT}</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart
                      data={dashboardFilter === 'all' ? dailyChartData : getFilteredDashboardData.filteredDailyChartData}
                      onClick={handleChartClick}
                      style={{ cursor: 'pointer' }}
                      margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 25%)" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: 'hsl(210, 20%, 70%)', fontSize: 11 }}
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return `${date.getDate()}/${date.getMonth() + 1}`
                        }}
                      />
                      <YAxis tick={{ fill: 'hsl(210, 20%, 70%)', fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(222, 22%, 11%)', 
                          border: '1px solid hsl(222, 15%, 25%)',
                          borderRadius: '6px',
                          color: 'hsl(0, 0%, 98%)'
                        }}
                        labelFormatter={(value) => {
                          const date = new Date(value)
                          return date.toLocaleDateString()
                        }}
                      />
                      <Legend />
                      <Bar dataKey="inputVAT" fill="hsl(152, 60%, 45%)" name={t.tax.inputVATDaily} />
                      <Bar dataKey="outputVAT" fill="hsl(4, 72%, 55%)" name={t.tax.outputVATDaily} />
                      <Line 
                        type="monotone" 
                        dataKey="netVAT" 
                        stroke="hsl(200, 80%, 55%)" 
                        strokeWidth={2}
                        name={t.tax.netVATDaily}
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                  <p className="chart-hint">{t.tax.clickToViewDetails}</p>
                </div>

                {/* Cumulative VAT Chart */}
                <div className="tax-chart-card">
                  <h3 className="tax-chart-title">{t.tax.cumulativeVAT}</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={dashboardFilter === 'all' ? cumulativeChartData : getFilteredDashboardData.filteredCumulativeChartData}
                      onClick={handleChartClick}
                      style={{ cursor: 'pointer' }}
                      margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                    >
                      <defs>
                        <linearGradient id="colorInputVAT" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(152, 60%, 45%)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorOutputVAT" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(4, 72%, 55%)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(4, 72%, 55%)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorNetVAT" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(200, 80%, 55%)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(200, 80%, 55%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 15%, 25%)" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: 'hsl(210, 20%, 70%)', fontSize: 11 }}
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return `${date.getDate()}/${date.getMonth() + 1}`
                        }}
                      />
                      <YAxis tick={{ fill: 'hsl(210, 20%, 70%)', fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(222, 22%, 11%)', 
                          border: '1px solid hsl(222, 15%, 25%)',
                          borderRadius: '6px',
                          color: 'hsl(0, 0%, 98%)'
                        }}
                        labelFormatter={(value) => {
                          const date = new Date(value)
                          return date.toLocaleDateString()
                        }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="inputVAT" 
                        stroke="hsl(152, 60%, 45%)" 
                        fillOpacity={1} 
                        fill="url(#colorInputVAT)" 
                        name={t.tax.inputVATCumulative}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="outputVAT" 
                        stroke="hsl(4, 72%, 55%)" 
                        fillOpacity={1} 
                        fill="url(#colorOutputVAT)" 
                        name={t.tax.outputVATCumulative}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="netVAT" 
                        stroke="hsl(200, 80%, 55%)" 
                        fillOpacity={1} 
                        fill="url(#colorNetVAT)" 
                        name={t.tax.netVATCumulative}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <p className="chart-hint">{t.tax.clickToViewDetails}</p>
                </div>
              </div>

              {/* Filtered Income and Expenses Tables */}
              {(getFilteredDashboardData.filteredIncome.length > 0 || getFilteredDashboardData.filteredExpenses.length > 0) && (
                <>
                  {/* Income Table */}
                  {getFilteredDashboardData.filteredIncome.length > 0 && (
                    <div className="tax-folder">
                      <h3 className="folder-title">{t.tax.incomeFolder}</h3>
                      <div className="folder-summary">
                        <span>{t.tax.invoices}: {getFilteredDashboardData.filteredIncome.length}</span>
                        <span>{t.tax.total} {t.tax.netAmount}: {formatCurrency(getFilteredDashboardData.filteredIncome.reduce((sum, item) => sum + item.netAmount, 0))}</span>
                      </div>
                      <div className="excel-table-container" ref={tableRef}>
                        <table className="excel-table">
                          <tbody>
                            <tr className="excel-column-headers-row">
                              {getIncomeColumnOrder().map((field) => {
                                const width = incomeColumnWidths[field] || 120
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
                                    <span className="excel-header-label">{getColumnLabel(field, 'income')}</span>
                                    <div
                                      className="excel-resize-handle"
                                      onMouseDown={(e) => handleResizeStart(field, 'income', e)}
                                      onDoubleClick={(e) => handleResizeDoubleClick(field, 'income')}
                                      title="Drag to resize, double-click to auto-fit"
                                    />
                                  </th>
                                )
                              })}
                            </tr>
                            {getFilteredDashboardData.filteredIncome.map((inv, index) => (
                              <tr key={inv.id}>
                                {getIncomeColumnOrder().map((field) => {
                                  const width = incomeColumnWidths[field] || 120
                                  let displayValue = ''
                                  let inputType = 'text'
                                  
                                  if (field === 'row_number') {
                                    displayValue = String(index + 1)
                                  } else if (field === 'date') {
                                    displayValue = formatDate(inv.date)
                                    inputType = 'date'
                                  } else if (field === 'invoiceNumber') {
                                    displayValue = inv.invoiceNumber || ''
                                  } else if (field === 'partner') {
                                    displayValue = inv.partner || ''
                                  } else if (field === 'netAmount') {
                                    displayValue = formatCurrency(inv.netAmount)
                                    inputType = 'number'
                                  } else if (field === 'vatRate') {
                                    displayValue = inv.vatRate.toFixed(2)
                                    inputType = 'number'
                                  } else if (field === 'vatAmount') {
                                    displayValue = formatCurrency(inv.vatAmount)
                                    inputType = 'number'
                                  } else if (field === 'grossAmount') {
                                    displayValue = formatCurrency(inv.grossAmount)
                                    inputType = 'number'
                                  } else if (field === 'skr03Account') {
                                    displayValue = inv.skr03Account || ''
                                  }
                                  
                                  return (
                                    <td
                                      key={field}
                                      style={{ 
                                        width: `${width}px`,
                                        minWidth: `${width}px`
                                      }}
                                    >
                                      {renderEditableCell(inv, field, 'income', displayValue, inputType, index)}
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Expenses Table */}
                  {getFilteredDashboardData.filteredExpenses.length > 0 && (
                    <div className="tax-folder">
                      <h3 className="folder-title">{t.tax.expensesFolder}</h3>
                      <div className="folder-summary">
                        <span>{t.tax.expenses}: {getFilteredDashboardData.filteredExpenses.length}</span>
                        <span>{t.tax.total} {t.tax.netAmount}: {formatCurrency(getFilteredDashboardData.filteredExpenses.reduce((sum, item) => sum + item.netAmount, 0))}</span>
                      </div>
                      <div className="excel-table-container" ref={tableRef}>
                        <table className="excel-table">
                          <tbody>
                            <tr className="excel-column-headers-row">
                              {getExpensesColumnOrder().map((field) => {
                                const width = expensesColumnWidths[field] || 120
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
                                    <span className="excel-header-label">{getColumnLabel(field, 'expense')}</span>
                                    <div
                                      className="excel-resize-handle"
                                      onMouseDown={(e) => handleResizeStart(field, 'expense', e)}
                                      onDoubleClick={(e) => handleResizeDoubleClick(field, 'expense')}
                                      title="Drag to resize, double-click to auto-fit"
                                    />
                                  </th>
                                )
                              })}
                            </tr>
                            {getFilteredDashboardData.filteredExpenses.map((exp, index) => (
                              <tr key={exp.id}>
                                {getExpensesColumnOrder().map((field) => {
                                  const width = expensesColumnWidths[field] || 120
                                  let displayValue = ''
                                  let inputType = 'text'
                                  
                                  if (field === 'row_number') {
                                    displayValue = String(index + 1)
                                  } else if (field === 'date') {
                                    displayValue = formatDate(exp.date)
                                    inputType = 'date'
                                  } else if (field === 'invoiceNumber') {
                                    displayValue = exp.invoiceNumber || ''
                                  } else if (field === 'partner') {
                                    displayValue = exp.partner || ''
                                  } else if (field === 'netAmount') {
                                    displayValue = formatCurrency(exp.netAmount)
                                    inputType = 'number'
                                  } else if (field === 'vatRate') {
                                    displayValue = exp.vatRate.toFixed(2)
                                    inputType = 'number'
                                  } else if (field === 'vatAmount') {
                                    displayValue = formatCurrency(exp.vatAmount)
                                    inputType = 'number'
                                  } else if (field === 'grossAmount') {
                                    displayValue = formatCurrency(exp.grossAmount)
                                    inputType = 'number'
                                  } else if (field === 'deductiblePercentage') {
                                    displayValue = exp.deductiblePercentage.toFixed(2)
                                    inputType = 'number'
                                  } else if (field === 'skr03Account') {
                                    displayValue = exp.skr03Account || ''
                                  }
                                  
                                  return (
                                    <td
                                      key={field}
                                      style={{ 
                                        width: `${width}px`,
                                        minWidth: `${width}px`
                                      }}
                                    >
                                      {renderEditableCell(exp, field, 'expense', displayValue, inputType, index)}
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && !dashboardData && (
            <div className="loading-state">
              <p>{t.tax.loading}</p>
            </div>
          )}

          {/* Settings Section */}
          <div className="tax-settings">
            <div className="setting-group">
              <label className="setting-label">{t.tax.filingFrequency}:</label>
              <select
                className="setting-select"
                value={vatFilingFrequency}
                onChange={(e) => setVatFilingFrequency(e.target.value)}
              >
                <option value="monthly">{t.tax.monthly}</option>
                <option value="quarterly">{t.tax.quarterly}</option>
              </select>
            </div>

            <div className="setting-group">
              <label className="setting-label">{t.tax.selectPeriod}:</label>
              <select
                className="setting-select"
                value={selectedPeriod || ''}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="">-- {t.tax.selectPeriod} --</option>
                {periods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="button button-primary"
              onClick={generateVATReport}
              disabled={!selectedPeriod || loading}
            >
              {loading ? t.tax.loading : t.tax.generateReport}
            </button>
          </div>

          {/* VAT Summary Section */}
          {vatSummary && (
            <div className="vat-summary-section">
              <h2 className="section-title">{t.tax.vatSummary}</h2>
              
              {selectedPeriod && (() => {
                const deadline = getVATDeadline(selectedPeriod, vatFilingFrequency)
                if (!deadline || isNaN(deadline.getTime())) return null
                return (
                  <div className="deadline-info">
                    <strong>{t.tax.deadline}:</strong> {formatDate(deadline.toISOString())}
                  </div>
                )
              })()}

              <div className="summary-grid">
                {/* Output VAT */}
                <div className="summary-card output-vat">
                  <h3>{t.tax.outputVAT}</h3>
                  <div className="summary-row">
                    <span>{t.tax.standardRate}:</span>
                    <strong>{formatCurrency(vatSummary.incomeByRate[19].vat)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>{t.tax.reducedRate}:</span>
                    <strong>{formatCurrency(vatSummary.incomeByRate[7].vat)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>{t.tax.zeroRate}:</span>
                    <strong>{formatCurrency(vatSummary.incomeByRate[0].vat)}</strong>
                  </div>
                  <div className="summary-row total">
                    <span>{t.tax.total}:</span>
                    <strong>{formatCurrency(vatSummary.totalOutputVAT)}</strong>
                  </div>
                </div>

                {/* Input VAT */}
                <div className="summary-card input-vat">
                  <h3>{t.tax.inputVAT}</h3>
                  <div className="summary-row">
                    <span>{t.tax.standardRate} ({t.tax.deductible}):</span>
                    <strong>{formatCurrency(vatSummary.expensesByRate[19].deductibleVAT)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>{t.tax.reducedRate} ({t.tax.deductible}):</span>
                    <strong>{formatCurrency(vatSummary.expensesByRate[7].deductibleVAT)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>{t.tax.nonDeductible}:</span>
                    <strong>{formatCurrency(vatSummary.expensesByRate[19].nonDeductibleVAT + vatSummary.expensesByRate[7].nonDeductibleVAT)}</strong>
                  </div>
                  <div className="summary-row total">
                    <span>{t.tax.total} ({t.tax.deductible}):</span>
                    <strong>{formatCurrency(vatSummary.totalInputVAT)}</strong>
                  </div>
                </div>

                {/* Net VAT */}
                <div className="summary-card net-vat">
                  <h3>{t.tax.netVAT}</h3>
                  <div className="net-vat-amount" style={{
                    color: vatSummary.netVAT >= 0 ? 'hsl(4, 72%, 55%)' : 'hsl(152, 60%, 45%)',
                    fontSize: '2rem',
                    fontWeight: '700'
                  }}>
                    {vatSummary.netVAT >= 0 ? t.tax.toPay : t.tax.refund}: {formatCurrency(Math.abs(vatSummary.netVAT))}
                  </div>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="export-buttons">
                <button className="button button-secondary" onClick={exportExcelReport}>
                  📊 {t.tax.exportExcel}
                </button>
                <button className="button button-secondary" onClick={exportDATEVCSV}>
                  📥 {t.tax.exportDATEV}
                </button>
                <button className="button button-secondary" onClick={exportPDFSummary}>
                  📄 {t.tax.exportPDF}
                </button>
              </div>
            </div>
          )}

          {/* Income Folder */}
          {incomeData.length > 0 && (
            <div className="tax-folder">
              <h2 className="folder-title">{t.tax.incomeFolder}</h2>
              <div className="folder-summary">
                <span>{t.tax.invoices}: {incomeData.length}</span>
                <span>{t.tax.total} {t.tax.netAmount}: {formatCurrency(vatSummary?.totalIncomeNet || 0)}</span>
              </div>
              <div className="excel-table-container" ref={tableRef}>
                <table className="excel-table">
                  <tbody>
                    <tr className="excel-column-headers-row">
                      {getIncomeColumnOrder().map((field) => {
                        const width = incomeColumnWidths[field] || 120
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
                            <span className="excel-header-label">{getColumnLabel(field, 'income')}</span>
                            <div
                              className="excel-resize-handle"
                              onMouseDown={(e) => handleResizeStart(field, 'income', e)}
                              onDoubleClick={(e) => handleResizeDoubleClick(field, 'income')}
                              title="Drag to resize, double-click to auto-fit"
                            />
                          </th>
                        )
                      })}
                    </tr>
                    {incomeData.map((inv, index) => (
                      <tr key={inv.id}>
                        {getIncomeColumnOrder().map((field) => {
                          const width = incomeColumnWidths[field] || 120
                          let displayValue = ''
                          let inputType = 'text'
                          
                          if (field === 'row_number') {
                            displayValue = String(index + 1)
                          } else if (field === 'date') {
                            displayValue = formatDate(inv.date)
                            inputType = 'date'
                          } else if (field === 'invoiceNumber') {
                            displayValue = inv.invoiceNumber || ''
                          } else if (field === 'partner') {
                            displayValue = inv.partner || ''
                          } else if (field === 'netAmount') {
                            displayValue = formatCurrency(inv.netAmount)
                            inputType = 'number'
                          } else if (field === 'vatRate') {
                            displayValue = `${inv.vatRate}%`
                            inputType = 'number'
                          } else if (field === 'vatAmount') {
                            displayValue = formatCurrency(inv.vatAmount)
                            inputType = 'number'
                          } else if (field === 'grossAmount') {
                            displayValue = formatCurrency(inv.grossAmount)
                            inputType = 'number'
                          } else if (field === 'skr03Account') {
                            displayValue = inv.skr03Account || ''
                          }
                          
                          return (
                            <td
                              key={field}
                              style={{ 
                                width: `${width}px`,
                                minWidth: `${width}px`
                              }}
                            >
                              {renderEditableCell(inv, field, 'income', displayValue, inputType, index)}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Expenses Folder */}
          {expensesData.length > 0 && (
            <div className="tax-folder">
              <h2 className="folder-title">{t.tax.expensesFolder}</h2>
              <div className="folder-summary">
                <span>{t.tax.expenses}: {expensesData.length}</span>
                <span>{t.tax.total} {t.tax.netAmount}: {formatCurrency(vatSummary?.totalExpensesNet || 0)}</span>
              </div>
              <div className="excel-table-container" ref={tableRef}>
                <table className="excel-table">
                  <tbody>
                    <tr className="excel-column-headers-row">
                      {getExpensesColumnOrder().map((field) => {
                        const width = expensesColumnWidths[field] || 120
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
                            <span className="excel-header-label">{getColumnLabel(field, 'expense')}</span>
                            <div
                              className="excel-resize-handle"
                              onMouseDown={(e) => handleResizeStart(field, 'expense', e)}
                              onDoubleClick={(e) => handleResizeDoubleClick(field, 'expense')}
                              title="Drag to resize, double-click to auto-fit"
                            />
                          </th>
                        )
                      })}
                    </tr>
                    {expensesData.map((exp, index) => (
                      <tr key={exp.id}>
                        {getExpensesColumnOrder().map((field) => {
                          const width = expensesColumnWidths[field] || 120
                          let displayValue = ''
                          let inputType = 'text'
                          
                          if (field === 'row_number') {
                            displayValue = String(index + 1)
                          } else if (field === 'date') {
                            displayValue = formatDate(exp.date)
                            inputType = 'date'
                          } else if (field === 'invoiceNumber') {
                            displayValue = exp.invoiceNumber || ''
                          } else if (field === 'partner') {
                            displayValue = exp.partner || ''
                          } else if (field === 'netAmount') {
                            displayValue = formatCurrency(exp.netAmount)
                            inputType = 'number'
                          } else if (field === 'vatRate') {
                            displayValue = `${exp.vatRate}%`
                            inputType = 'number'
                          } else if (field === 'vatAmount') {
                            displayValue = formatCurrency(exp.vatAmount)
                            inputType = 'number'
                          } else if (field === 'grossAmount') {
                            displayValue = formatCurrency(exp.grossAmount)
                            inputType = 'number'
                          } else if (field === 'deductiblePercentage') {
                            displayValue = `${exp.deductiblePercentage}%`
                            inputType = 'number'
                          } else if (field === 'skr03Account') {
                            displayValue = exp.skr03Account || ''
                          }
                          
                          return (
                            <td
                              key={field}
                              style={{ 
                                width: `${width}px`,
                                minWidth: `${width}px`
                              }}
                            >
                              {renderEditableCell(exp, field, 'expense', displayValue, inputType, index)}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !vatSummary && selectedPeriod && (
            <div className="tax-empty-state">
              <p>{t.tax.noData}</p>
            </div>
          )}

          {/* Drill-Down Modal */}
          {showDrillDown && (
            <div className="drill-down-overlay" onClick={() => setShowDrillDown(false)}>
              <div className="drill-down-modal" onClick={(e) => e.stopPropagation()}>
                <div className="drill-down-header">
                  <h2>{t.tax.drillDownTitle} - {selectedDate && new Date(selectedDate).toLocaleDateString()}</h2>
                  <button className="drill-down-close" onClick={() => setShowDrillDown(false)}>
                    ×
                  </button>
                </div>
                <div className="drill-down-content">
                  {drillDownData.length === 0 ? (
                    <p>{t.tax.noData}</p>
                  ) : (
                    <table className="drill-down-table">
                      <thead>
                        <tr>
                          <th>{t.tax.drillDownType}</th>
                          <th>{t.tax.drillDownInvoice}</th>
                          <th>{t.tax.drillDownPartner}</th>
                          <th>{t.tax.drillDownNet}</th>
                          <th>{t.tax.drillDownVAT}</th>
                          <th>{t.tax.drillDownGross}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drillDownData.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <span className={`type-badge ${item.type}`}>
                                {item.type === 'income' ? t.tax.income : t.tax.expense}
                              </span>
                            </td>
                            <td>{item.invoiceNumber}</td>
                            <td>{item.partner}</td>
                            <td>{formatCurrency(item.netAmount)}</td>
                            <td>{formatCurrency(item.vatAmount)}</td>
                            <td>{formatCurrency(item.grossAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="drill-down-footer">
                  <button className="button button-primary" onClick={() => setShowDrillDown(false)}>
                    {t.tax.drillDownClose}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default TaxPage
