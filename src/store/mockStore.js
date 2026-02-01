// Simple in-memory mock store for all application data
// No authentication, no backend, no Supabase - just pure in-memory data
import { STATUS, STATUS_ORDER, normalizeStatus } from '../constants/statuses.js'

const STORAGE_KEY = 'lst-mock-store'

let requests = []
let mainTable = []
let expenses = []
let invoices = []
let bookings = []
let customers = []
let bankTransactions = []

// Persist state to localStorage (best-effort, ignore errors)
const saveState = () => {
  try {
    if (typeof localStorage === 'undefined') return
  const data = {
    requests,
    mainTable,
    expenses,
    invoices,
    bookings,
    customers,
    bankTransactions
  }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (_) {
    // ignore persistence errors
  }
}

// Load state from localStorage on startup (best-effort)
const loadState = () => {
  try {
    if (typeof localStorage === 'undefined') return
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw)
    const normArray = (arr) => Array.isArray(arr) ? arr : []
    requests = normArray(data.requests).map((r) => ({
      ...r,
      status: normalizeStatus(r.status, STATUS.DRAFT),
      booking_status: normalizeStatus(r.booking_status || r.status, STATUS.DRAFT)
    }))
    mainTable = normArray(data.mainTable).map((m) => ({
      ...m,
      status: normalizeStatus(m.status, STATUS.DRAFT),
      booking_status: normalizeStatus(m.booking_status || m.status, STATUS.DRAFT)
    }))
    expenses = normArray(data.expenses)
    invoices = normArray(data.invoices)
    bookings = normArray(data.bookings)
    customers = normArray(data.customers)
    bankTransactions = normArray(data.bankTransactions)
  } catch (_) {
    // ignore load errors
  }
}

loadState()

// Generate a simple UUID-like ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Listeners for reactive updates
const listeners = new Set()

const notifyListeners = () => {
  saveState()
  listeners.forEach(listener => listener())
}

export const mockStore = {
  // Requests operations
  requests: {
    getAll: () => [...requests],
    getById: (id) => requests.find(r => r.id === id),
    create: (data) => {
      const newRequest = {
        id: generateId(),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: normalizeStatus(data.status, STATUS.DRAFT),
        booking_status: normalizeStatus(data.booking_status || data.status, STATUS.DRAFT)
      }
      requests.push(newRequest)
      
      // Also add to main table
      const mainTableEntry = {
        id: newRequest.id,
        ...newRequest,
        // Map request fields to main table fields
        first_name: newRequest.first_name || newRequest.firstName,
        last_name: newRequest.last_name || newRequest.lastName,
        middle_name: newRequest.middle_name || newRequest.middleName,
        date_of_birth: newRequest.date_of_birth || newRequest.dateOfBirth,
        passport_number: newRequest.passport_number || newRequest.passportNumber,
        departure_airport: newRequest.departure_airport || newRequest.departureAirport,
        destination_airport: newRequest.destination_airport || newRequest.destinationAirport,
        travel_date: newRequest.travel_date || newRequest.travelDate,
        return_date: newRequest.return_date || newRequest.returnDate,
        request_types: newRequest.request_types || newRequest.requestTypes || [],
        booking_ref: newRequest.booking_ref || newRequest.bookingRef || '',
        booking_status: newRequest.booking_status || newRequest.status || STATUS.DRAFT,
        created_at: newRequest.created_at,
        updated_at: newRequest.updated_at
      }
      mainTable.push(mainTableEntry)
      
      notifyListeners()
      return { data: [newRequest], error: null }
    },
    createMultiple: (dataArray) => {
      const created = dataArray.map(data => {
        const newRequest = {
          id: generateId(),
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: normalizeStatus(data.status, STATUS.DRAFT),
          booking_status: normalizeStatus(data.booking_status || data.status, STATUS.DRAFT)
        }
        requests.push(newRequest)
        
        // Also add to main table
        const mainTableEntry = {
          id: newRequest.id,
          ...newRequest,
          first_name: newRequest.first_name || newRequest.firstName,
          last_name: newRequest.last_name || newRequest.lastName,
          middle_name: newRequest.middle_name || newRequest.middleName,
          date_of_birth: newRequest.date_of_birth || newRequest.dateOfBirth,
          passport_number: newRequest.passport_number || newRequest.passportNumber,
          departure_airport: newRequest.departure_airport || newRequest.departureAirport,
          destination_airport: newRequest.destination_airport || newRequest.destinationAirport,
          travel_date: newRequest.travel_date || newRequest.travelDate,
          return_date: newRequest.return_date || newRequest.returnDate,
          request_types: newRequest.request_types || newRequest.requestTypes || [],
          booking_ref: newRequest.booking_ref || newRequest.bookingRef || '',
          booking_status: newRequest.booking_status || newRequest.status || STATUS.DRAFT,
          created_at: newRequest.created_at,
          updated_at: newRequest.updated_at
        }
        mainTable.push(mainTableEntry)
        return newRequest
      })
      
      notifyListeners()
      return { data: created, error: null }
    },
    update: (id, updates) => {
      const index = requests.findIndex(r => r.id === id)
      if (index === -1) {
        return { data: null, error: { message: 'Request not found' } }
      }
      const current = requests[index]
      const nextStatus = updates.booking_status || updates.status
      if (nextStatus) {
        const normalized = normalizeStatus(nextStatus, current.status || STATUS.DRAFT)
        updates.status = normalized
        updates.booking_status = normalized
      }
      requests[index] = {
        ...current,
        ...updates,
        status: updates.status ? normalizeStatus(updates.status, STATUS.DRAFT) : current.status,
        booking_status: updates.booking_status ? normalizeStatus(updates.booking_status, STATUS.DRAFT) : current.booking_status,
        updated_at: new Date().toISOString()
      }
      
      // Also update main table
      const mainTableIndex = mainTable.findIndex(m => m.id === id)
      if (mainTableIndex !== -1) {
        mainTable[mainTableIndex] = {
          ...mainTable[mainTableIndex],
          ...updates,
          status: updates.status ? normalizeStatus(updates.status, STATUS.DRAFT) : mainTable[mainTableIndex].status,
          booking_status: updates.booking_status ? normalizeStatus(updates.booking_status, STATUS.DRAFT) : mainTable[mainTableIndex].booking_status,
          updated_at: new Date().toISOString()
        }
      }
      
      notifyListeners()
      return { data: [requests[index]], error: null }
    },
    delete: (id) => {
      const index = requests.findIndex(r => r.id === id)
      if (index === -1) {
        return { error: { message: 'Request not found' } }
      }
      requests.splice(index, 1)
      
      // Also remove from main table
      const mainTableIndex = mainTable.findIndex(m => m.id === id)
      if (mainTableIndex !== -1) {
        mainTable.splice(mainTableIndex, 1)
      }
      
      notifyListeners()
      return { error: null }
    }
  },

  // Main table operations
  mainTable: {
    getAll: () => [...mainTable],
    getById: (id) => mainTable.find(m => m.id === id),
    update: (id, updates) => {
      const index = mainTable.findIndex(m => m.id === id)
      if (index === -1) {
        return { data: null, error: { message: 'Entry not found' } }
      }
      const current = mainTable[index]
      const nextStatus = updates.booking_status || updates.status
      if (nextStatus) {
        const normalized = normalizeStatus(nextStatus, current.status || STATUS.DRAFT)
        updates.status = normalized
        updates.booking_status = normalized
      }

      mainTable[index] = {
        ...current,
        ...updates,
        status: updates.status ? normalizeStatus(updates.status, STATUS.DRAFT) : current.status,
        booking_status: updates.booking_status ? normalizeStatus(updates.booking_status, STATUS.DRAFT) : current.booking_status,
        updated_at: new Date().toISOString()
      }
      
      // Also update requests
      const requestIndex = requests.findIndex(r => r.id === id)
      if (requestIndex !== -1) {
        requests[requestIndex] = {
          ...requests[requestIndex],
          ...updates,
          updated_at: new Date().toISOString()
        }
      }
      
      notifyListeners()
      return { data: [mainTable[index]], error: null }
    },
    delete: (id) => {
      const index = mainTable.findIndex(m => m.id === id)
      if (index === -1) {
        return { error: { message: 'Entry not found' } }
      }
      mainTable.splice(index, 1)
      
      // Also remove from requests
      const requestIndex = requests.findIndex(r => r.id === id)
      if (requestIndex !== -1) {
        requests.splice(requestIndex, 1)
      }
      
      notifyListeners()
      return { error: null }
    }
  },

  // Expenses operations
  expenses: {
    getAll: () => [...expenses],
    getById: (id) => expenses.find(e => e.id === id),
    create: (data) => {
      const newExpense = {
        id: generateId(),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      expenses.push(newExpense)
      notifyListeners()
      return { data: [newExpense], error: null }
    },
    update: (id, updates) => {
      const index = expenses.findIndex(e => e.id === id)
      if (index === -1) {
        return { data: null, error: { message: 'Expense not found' } }
      }
      expenses[index] = {
        ...expenses[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      notifyListeners()
      return { data: [expenses[index]], error: null }
    },
    delete: (id) => {
      const index = expenses.findIndex(e => e.id === id)
      if (index === -1) {
        return { error: { message: 'Expense not found' } }
      }
      expenses.splice(index, 1)
      notifyListeners()
      return { error: null }
    }
  },

  // Invoices operations
  invoices: {
    getAll: () => [...invoices],
    getById: (id) => invoices.find(i => i.id === id),
    create: (data) => {
      const newInvoice = {
        id: generateId(),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      invoices.push(newInvoice)
      notifyListeners()
      return { data: [newInvoice], error: null }
    },
    update: (id, updates) => {
      const index = invoices.findIndex(i => i.id === id)
      if (index === -1) {
        return { data: null, error: { message: 'Invoice not found' } }
      }
      invoices[index] = {
        ...invoices[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      notifyListeners()
      return { data: [invoices[index]], error: null }
    },
    delete: (id) => {
      const index = invoices.findIndex(i => i.id === id)
      if (index === -1) {
        return { error: { message: 'Invoice not found' } }
      }
      invoices.splice(index, 1)
      notifyListeners()
      return { error: null }
    }
  },

  // Bookings operations
  bookings: {
    getAll: () => [...bookings],
    getById: (id) => bookings.find(b => b.id === id),
    create: (data) => {
      const newBooking = {
        id: generateId(),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      bookings.push(newBooking)
      notifyListeners()
      return { data: [newBooking], error: null }
    },
    update: (id, updates) => {
      const index = bookings.findIndex(b => b.id === id)
      if (index === -1) {
        return { data: null, error: { message: 'Booking not found' } }
      }
      bookings[index] = {
        ...bookings[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      notifyListeners()
      return { data: [bookings[index]], error: null }
    },
    delete: (id) => {
      const index = bookings.findIndex(b => b.id === id)
      if (index === -1) {
        return { error: { message: 'Booking not found' } }
      }
      bookings.splice(index, 1)
      notifyListeners()
      return { error: null }
    }
  },

  // Customers operations
  customers: {
    getAll: () => [...customers],
    getById: (id) => customers.find(c => c.id === id),
    create: (data) => {
      const newCustomer = {
        id: generateId(),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      customers.push(newCustomer)
      notifyListeners()
      return { data: [newCustomer], error: null }
    },
    update: (id, updates) => {
      const index = customers.findIndex(c => c.id === id)
      if (index === -1) {
        return { data: null, error: { message: 'Customer not found' } }
      }
      customers[index] = {
        ...customers[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      notifyListeners()
      return { data: [customers[index]], error: null }
    },
    delete: (id) => {
      const index = customers.findIndex(c => c.id === id)
      if (index === -1) {
        return { error: { message: 'Customer not found' } }
      }
      customers.splice(index, 1)
      notifyListeners()
      return { error: null }
    }
  },

  // Bank transactions operations
  bankTransactions: {
    getAll: () => [...bankTransactions],
    getById: (id) => bankTransactions.find(b => b.id === id),
    create: (data) => {
      const newTransaction = {
        id: generateId(),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      bankTransactions.push(newTransaction)
      notifyListeners()
      return { data: [newTransaction], error: null }
    },
    update: (id, updates) => {
      const index = bankTransactions.findIndex(b => b.id === id)
      if (index === -1) {
        return { data: null, error: { message: 'Transaction not found' } }
      }
      bankTransactions[index] = {
        ...bankTransactions[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      notifyListeners()
      return { data: [bankTransactions[index]], error: null }
    },
    delete: (id) => {
      const index = bankTransactions.findIndex(b => b.id === id)
      if (index === -1) {
        return { error: { message: 'Transaction not found' } }
      }
      bankTransactions.splice(index, 1)
      notifyListeners()
      return { error: null }
    }
  },

  // Subscribe to changes
  subscribe: (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }
}
