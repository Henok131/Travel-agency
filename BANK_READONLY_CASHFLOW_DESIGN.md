# Read-Only Bank Statement Integration - Owner Cashflow Visibility

**Generated:** 2026-01-19  
**Purpose:** Design document for read-only bank statement integration for owner cashflow visibility and accounting insights

---

## 🎯 OBJECTIVE

Provide **read-only** bank account integration to give the **owner** real-time visibility into:
- Bank account balance
- Incoming transactions
- Comparison with system-calculated revenue
- Cashflow overview
- Difference detection (bank vs calculated)

**Key Constraints:**
- ✅ Read-only access (no payments, no transfers)
- ✅ Owner-only access (not customer-facing)
- ✅ Does NOT modify existing booking/payment logic
- ✅ Bank data does NOT overwrite manual fields
- ✅ Separate dashboard for accounting insights

---

## 📊 ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    OWNER DASHBOARD                          │
│  (Read-Only Cashflow Visibility)                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐            │
│  │  Bank Balance    │    │ Calculated       │            │
│  │  (Real-time)    │    │ Revenue          │            │
│  │  €XX,XXX.XX     │    │ €XX,XXX.XX       │            │
│  └──────────────────┘    └──────────────────┘            │
│           │                       │                       │
│           └───────────┬───────────┘                       │
│                       ▼                                   │
│              ┌──────────────────┐                         │
│              │   Difference    │                         │
│              │   €X,XXX.XX     │                         │
│              └──────────────────┘                         │
│                                                           │
│  ┌──────────────────────────────────────────────┐       │
│  │  Recent Bank Transactions (Last 30 days)      │       │
│  │  - Transaction 1: €XXX.XX (Date)             │       │
│  │  - Transaction 2: €XXX.XX (Date)             │       │
│  └──────────────────────────────────────────────┘       │
│                                                           │
│  ┌──────────────────────────────────────────────┐       │
│  │  Cashflow Chart (Balance over time)           │       │
│  │  [Line Chart: Bank Balance vs Calculated]     │       │
│  └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
           ▲                           ▲
           │                           │
           │                           │
┌──────────┴──────────┐    ┌──────────┴──────────┐
│  Nordigen/GoCardless │    │  System Revenue     │
│  Bank API           │    │  Calculation        │
│  (Read-Only)        │    │  (main_table)       │
└─────────────────────┘    └─────────────────────┘
```

---

## 🗄️ DATABASE SCHEMA

### **1. Owner Bank Account** (`owner_bank_accounts`)

**Purpose:** Store owner's bank account connection (single account, owner-only)

```sql
CREATE TABLE owner_bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Account Information
  account_name TEXT NOT NULL DEFAULT 'Owner Business Account',
  account_number TEXT,
  iban TEXT NOT NULL, -- e.g., 'DE28 5134 0013 0185 3597 00'
  bic TEXT,
  bank_name TEXT NOT NULL, -- e.g., 'Commerzbank AG'
  account_type TEXT DEFAULT 'business',
  
  -- GoCardless Integration
  provider TEXT NOT NULL DEFAULT 'gocardless',
  provider_account_id TEXT, -- GoCardless account ID
  requisition_id TEXT, -- GoCardless requisition ID
  
  -- Connection Status
  connection_status TEXT NOT NULL DEFAULT 'disconnected', 
  -- Values: 'disconnected', 'connecting', 'connected', 'error', 'expired'
  
  -- Encrypted Tokens (stored securely)
  access_token_encrypted TEXT, -- Encrypted access token
  refresh_token_encrypted TEXT, -- Encrypted refresh token
  token_expires_at TIMESTAMPTZ,
  
  -- Sync Settings
  auto_sync BOOLEAN NOT NULL DEFAULT true,
  sync_frequency TEXT NOT NULL DEFAULT 'daily', 
  -- Values: 'hourly', 'daily', 'weekly'
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint: Only one owner account allowed
  CONSTRAINT single_owner_account CHECK (
    (SELECT COUNT(*) FROM owner_bank_accounts) <= 1
  )
);

-- Indexes
CREATE INDEX idx_owner_bank_accounts_status ON owner_bank_accounts(connection_status);
CREATE INDEX idx_owner_bank_accounts_sync ON owner_bank_accounts(next_sync_at) 
  WHERE connection_status = 'connected';
```

### **2. Bank Statements** (`bank_statements`)

**Purpose:** Store read-only bank transaction data (never modifies bookings)

```sql
CREATE TABLE bank_statements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Key
  bank_account_id UUID NOT NULL REFERENCES owner_bank_accounts(id) ON DELETE CASCADE,
  
  -- Transaction Details (from bank API)
  transaction_id TEXT NOT NULL, -- Unique ID from GoCardless/bank
  transaction_date DATE NOT NULL,
  value_date DATE, -- Value date (when money actually moves)
  booking_date DATE, -- Booking date from bank
  
  -- Amount
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  
  -- Transaction Information
  description TEXT,
  remittance_information TEXT, -- Payment reference/verwendungszweck
  remittance_information_unstructured TEXT,
  remittance_information_structured TEXT,
  
  -- Counterparty
  counterparty_name TEXT,
  counterparty_account TEXT, -- IBAN or account number
  counterparty_bic TEXT,
  
  -- Transaction Type
  transaction_type TEXT NOT NULL, 
  -- Values: 'credit' (incoming), 'debit' (outgoing), 'transfer'
  
  -- Category (if available from bank)
  category TEXT,
  subcategory TEXT,
  
  -- Balance Information
  balance_after NUMERIC(10,2), -- Account balance after this transaction
  
  -- Raw Data
  raw_data JSONB DEFAULT '{}'::jsonb, -- Full transaction data from API
  
  -- Timestamps
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- When we fetched from API
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one transaction per account per transaction_id
  UNIQUE(bank_account_id, transaction_id)
);

-- Indexes
CREATE INDEX idx_bank_statements_account ON bank_statements(bank_account_id);
CREATE INDEX idx_bank_statements_date ON bank_statements(transaction_date DESC);
CREATE INDEX idx_bank_statements_type ON bank_statements(transaction_type);
CREATE INDEX idx_bank_statements_credit ON bank_statements(transaction_date DESC) 
  WHERE transaction_type = 'credit'; -- For incoming payments
CREATE INDEX idx_bank_statements_reference ON bank_statements(remittance_information) 
  WHERE remittance_information IS NOT NULL;
```

### **3. Account Balances** (`bank_account_balances`)

**Purpose:** Store historical account balance snapshots for cashflow charts

```sql
CREATE TABLE bank_account_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Key
  bank_account_id UUID NOT NULL REFERENCES owner_bank_accounts(id) ON DELETE CASCADE,
  
  -- Balance Information
  balance_date DATE NOT NULL,
  balance_amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  balance_type TEXT NOT NULL DEFAULT 'expected', 
  -- Values: 'expected', 'interimAvailable', 'interimBooked', 'openingAvailable', 'openingBooked'
  
  -- Timestamps
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one balance per account per date per type
  UNIQUE(bank_account_id, balance_date, balance_type)
);

-- Indexes
CREATE INDEX idx_bank_account_balances_account ON bank_account_balances(bank_account_id);
CREATE INDEX idx_bank_account_balances_date ON bank_account_balances(balance_date DESC);
```

### **4. Sync Logs** (`bank_sync_logs`)

**Purpose:** Track sync operations for debugging and auditing

```sql
CREATE TABLE bank_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Key
  bank_account_id UUID NOT NULL REFERENCES owner_bank_accounts(id) ON DELETE CASCADE,
  
  -- Sync Details
  sync_type TEXT NOT NULL, 
  -- Values: 'full', 'incremental', 'manual', 'scheduled'
  sync_status TEXT NOT NULL, 
  -- Values: 'success', 'error', 'partial', 'expired_token'
  
  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Results
  transactions_fetched INTEGER DEFAULT 0,
  transactions_new INTEGER DEFAULT 0,
  transactions_updated INTEGER DEFAULT 0,
  balances_fetched INTEGER DEFAULT 0,
  
  -- Error Details
  error_message TEXT,
  error_code TEXT,
  error_details JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bank_sync_logs_account ON bank_sync_logs(bank_account_id);
CREATE INDEX idx_bank_sync_logs_date ON bank_sync_logs(started_at DESC);
CREATE INDEX idx_bank_sync_logs_status ON bank_sync_logs(sync_status);
```

---

## 🔧 IMPLEMENTATION COMPONENTS

### **1. Bank Service** (`src/lib/bankService.js`)

**Purpose:** Handle all GoCardless API interactions (read-only)

```javascript
/**
 * Bank Service - Read-Only Bank Account Data Integration
 * Uses GoCardless Bank Account Data API (formerly Nordigen)
 */

class BankService {
  constructor() {
    this.secretId = import.meta.env.VITE_GOCARDLESS_SECRET_ID
    this.secretKey = import.meta.env.VITE_GOCARDLESS_SECRET_KEY
    this.baseUrl = 'https://bankaccountdata.gocardless.com/api/v2'
    this.accessToken = null
    this.tokenExpiresAt = null
  }

  /**
   * Initialize and get access token
   */
  async initialize() {
    if (this.accessToken && this.tokenExpiresAt > Date.now()) {
      return this.accessToken
    }
    
    const response = await fetch(`${this.baseUrl}/token/new/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret_id: this.secretId,
        secret_key: this.secretKey
      })
    })
    
    const data = await response.json()
    this.accessToken = data.access
    this.tokenExpiresAt = Date.now() + (data.access_expires * 1000)
    
    return this.accessToken
  }

  /**
   * List available banks/institutions
   */
  async listInstitutions(country = 'DE') {
    const token = await this.initialize()
    const response = await fetch(`${this.baseUrl}/institutions/?country=${country}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  }

  /**
   * Create requisition (start OAuth flow)
   */
  async createRequisition(institutionId, redirectUri) {
    const token = await this.initialize()
    const response = await fetch(`${this.baseUrl}/requisitions/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        institution_id: institutionId,
        redirect: redirectUri,
        agreement: null, // Use default
        reference: `LST_OWNER_${Date.now()}`,
        user_language: 'DE'
      })
    })
    return response.json()
  }

  /**
   * Get accounts from requisition
   */
  async getAccounts(requisitionId) {
    const token = await this.initialize()
    const response = await fetch(`${this.baseUrl}/requisitions/${requisitionId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  }

  /**
   * Fetch account details
   */
  async getAccountDetails(accountId) {
    const token = await this.initialize()
    const response = await fetch(`${this.baseUrl}/accounts/${accountId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  }

  /**
   * Fetch transactions (read-only)
   */
  async getTransactions(accountId, dateFrom = null, dateTo = null) {
    const token = await this.initialize()
    
    let url = `${this.baseUrl}/accounts/${accountId}/transactions/`
    const params = new URLSearchParams()
    if (dateFrom) params.append('date_from', dateFrom)
    if (dateTo) params.append('date_to', dateTo)
    if (params.toString()) url += `?${params.toString()}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  }

  /**
   * Fetch account balances (read-only)
   */
  async getBalances(accountId) {
    const token = await this.initialize()
    const response = await fetch(`${this.baseUrl}/accounts/${accountId}/balances/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken) {
    const response = await fetch(`${this.baseUrl}/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refresh: refreshToken
      })
    })
    return response.json()
  }
}

export default new BankService()
```

### **2. Revenue Calculation Service** (`src/lib/revenueService.js`)

**Purpose:** Calculate system revenue from bookings (for comparison)

```javascript
/**
 * Revenue Calculation Service
 * Calculates total revenue from main_table bookings
 * Does NOT modify any booking data - read-only calculations
 */

import { supabase } from './supabase'

class RevenueService {
  /**
   * Calculate total revenue from bookings
   * Revenue = sum of total_customer_payment (cash_paid + bank_transfer)
   */
  async calculateTotalRevenue(dateFrom = null, dateTo = null) {
    let query = supabase
      .from('main_table')
      .select('total_customer_payment, cash_paid, bank_transfer, created_at')
    
    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    const total = data.reduce((sum, booking) => {
      const payment = parseFloat(booking.total_customer_payment) || 
                     (parseFloat(booking.cash_paid) || 0) + 
                     (parseFloat(booking.bank_transfer) || 0)
      return sum + payment
    }, 0)
    
    return {
      totalRevenue: total,
      bookingCount: data.length,
      breakdown: {
        cashPaid: data.reduce((sum, b) => sum + (parseFloat(b.cash_paid) || 0), 0),
        bankTransfer: data.reduce((sum, b) => sum + (parseFloat(b.bank_transfer) || 0), 0)
      }
    }
  }

  /**
   * Calculate revenue by date range (for charts)
   */
  async calculateRevenueByDateRange(dateFrom, dateTo, groupBy = 'day') {
    const { data, error } = await supabase
      .from('main_table')
      .select('total_customer_payment, cash_paid, bank_transfer, created_at')
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    // Group by day/week/month
    const grouped = {}
    data.forEach(booking => {
      const date = new Date(booking.created_at)
      let key
      
      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0]
      } else if (groupBy === 'week') {
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
      } else if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      }
      
      if (!grouped[key]) {
        grouped[key] = { date: key, revenue: 0, count: 0 }
      }
      
      const payment = parseFloat(booking.total_customer_payment) || 
                     (parseFloat(booking.cash_paid) || 0) + 
                     (parseFloat(booking.bank_transfer) || 0)
      grouped[key].revenue += payment
      grouped[key].count += 1
    })
    
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date))
  }

  /**
   * Calculate outstanding revenue (bookings not yet paid)
   */
  async calculateOutstandingRevenue() {
    const { data, error } = await supabase
      .from('main_table')
      .select('total_amount_due, total_customer_payment, cash_paid, bank_transfer')
    
    if (error) throw error
    
    const outstanding = data.reduce((sum, booking) => {
      const amountDue = parseFloat(booking.total_amount_due) || 0
      const paid = parseFloat(booking.total_customer_payment) || 
                  (parseFloat(booking.cash_paid) || 0) + 
                  (parseFloat(booking.bank_transfer) || 0)
      const balance = amountDue - paid
      return sum + Math.max(0, balance) // Only positive (owed)
    }, 0)
    
    return outstanding
  }
}

export default new RevenueService()
```

### **3. Cashflow Dashboard Component** (`src/pages/CashflowDashboard.jsx`)

**Purpose:** Owner-only dashboard showing bank balance vs calculated revenue

```javascript
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import bankService from '../lib/bankService'
import revenueService from '../lib/revenueService'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function CashflowDashboard() {
  const [bankAccount, setBankAccount] = useState(null)
  const [bankBalance, setBankBalance] = useState(null)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [calculatedRevenue, setCalculatedRevenue] = useState(null)
  const [difference, setDifference] = useState(null)
  const [cashflowData, setCashflowData] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  // Load bank account connection
  useEffect(() => {
    loadBankAccount()
  }, [])

  // Load data when account is connected
  useEffect(() => {
    if (bankAccount?.connection_status === 'connected') {
      loadCashflowData()
    }
  }, [bankAccount])

  const loadBankAccount = async () => {
    const { data, error } = await supabase
      .from('owner_bank_accounts')
      .select('*')
      .maybeSingle()
    
    if (error) {
      console.error('Error loading bank account:', error)
      return
    }
    
    setBankAccount(data)
    setLoading(false)
  }

  const loadCashflowData = async () => {
    setLoading(true)
    
    try {
      // Load bank balance
      const { data: balances } = await supabase
        .from('bank_account_balances')
        .select('*')
        .eq('bank_account_id', bankAccount.id)
        .order('balance_date', { ascending: false })
        .limit(1)
      
      if (balances && balances.length > 0) {
        setBankBalance(balances[0].balance_amount)
      }

      // Load recent transactions (last 30 days)
      const dateFrom = new Date()
      dateFrom.setDate(dateFrom.getDate() - 30)
      
      const { data: transactions } = await supabase
        .from('bank_statements')
        .select('*')
        .eq('bank_account_id', bankAccount.id)
        .gte('transaction_date', dateFrom.toISOString().split('T')[0])
        .eq('transaction_type', 'credit') // Only incoming
        .order('transaction_date', { ascending: false })
        .limit(50)
      
      setRecentTransactions(transactions || [])

      // Calculate system revenue (same period)
      const revenue = await revenueService.calculateTotalRevenue(
        dateFrom.toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      )
      setCalculatedRevenue(revenue.totalRevenue)

      // Calculate difference
      if (bankBalance && revenue.totalRevenue) {
        setDifference(bankBalance - revenue.totalRevenue)
      }

      // Load cashflow chart data (last 90 days)
      const chartDateFrom = new Date()
      chartDateFrom.setDate(chartDateFrom.getDate() - 90)
      
      const { data: balanceHistory } = await supabase
        .from('bank_account_balances')
        .select('*')
        .eq('bank_account_id', bankAccount.id)
        .gte('balance_date', chartDateFrom.toISOString().split('T')[0])
        .order('balance_date', { ascending: true })
      
      const revenueHistory = await revenueService.calculateRevenueByDateRange(
        chartDateFrom.toISOString().split('T')[0],
        new Date().toISOString().split('T')[0],
        'day'
      )

      // Combine for chart
      const chartData = balanceHistory?.map(balance => {
        const revenue = revenueHistory.find(r => r.date === balance.balance_date)
        return {
          date: balance.balance_date,
          bankBalance: parseFloat(balance.balance_amount),
          calculatedRevenue: revenue?.revenue || 0
        }
      }) || []

      setCashflowData(chartData)
    } catch (error) {
      console.error('Error loading cashflow data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      // Trigger sync via Supabase Edge Function or direct API call
      const { error } = await supabase.functions.invoke('sync-bank-account', {
        body: { account_id: bankAccount.id }
      })
      
      if (error) throw error
      
      // Reload data after sync
      await loadCashflowData()
    } catch (error) {
      console.error('Error syncing:', error)
      alert('Sync failed: ' + error.message)
    } finally {
      setSyncing(false)
    }
  }

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '€0.00'
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  if (loading && !bankAccount) {
    return <div>Loading...</div>
  }

  return (
    <div className="cashflow-dashboard">
      <div className="dashboard-header">
        <h1>Cashflow Overview</h1>
        {bankAccount?.connection_status === 'connected' && (
          <button onClick={handleSync} disabled={syncing}>
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        )}
      </div>

      {bankAccount?.connection_status !== 'connected' ? (
        <div className="connection-prompt">
          <h2>Connect Bank Account</h2>
          <p>Connect your business bank account to view real-time cashflow.</p>
          <button onClick={() => window.location.href = '/bank/connect'}>
            Connect Bank Account
          </button>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Bank Balance</h3>
              <div className="metric-value">{formatCurrency(bankBalance)}</div>
              <div className="metric-label">Current account balance</div>
            </div>
            
            <div className="metric-card">
              <h3>Calculated Revenue</h3>
              <div className="metric-value">{formatCurrency(calculatedRevenue)}</div>
              <div className="metric-label">From bookings (system)</div>
            </div>
            
            <div className={`metric-card ${difference >= 0 ? 'positive' : 'negative'}`}>
              <h3>Difference</h3>
              <div className="metric-value">{formatCurrency(difference)}</div>
              <div className="metric-label">
                {difference >= 0 ? 'Bank balance higher' : 'Bank balance lower'}
              </div>
            </div>
          </div>

          {/* Cashflow Chart */}
          <div className="chart-container">
            <h2>Cashflow Trend (Last 90 Days)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={cashflowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="bankBalance" 
                  stroke="#4caf50" 
                  fill="#4caf50" 
                  fillOpacity={0.6}
                  name="Bank Balance"
                />
                <Area 
                  type="monotone" 
                  dataKey="calculatedRevenue" 
                  stroke="#ff9800" 
                  fill="#ff9800" 
                  fillOpacity={0.6}
                  name="Calculated Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Transactions */}
          <div className="transactions-section">
            <h2>Recent Incoming Transactions (Last 30 Days)</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Reference</th>
                  <th>Counterparty</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map(tx => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.transaction_date).toLocaleDateString('de-DE')}</td>
                    <td>{formatCurrency(tx.amount)}</td>
                    <td>{tx.description || '-'}</td>
                    <td>{tx.remittance_information || '-'}</td>
                    <td>{tx.counterparty_name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default CashflowDashboard
```

---

## 🔄 SYNC WORKFLOW

### **Scheduled Sync (Daily/Hourly)**

```javascript
// Supabase Edge Function: sync-bank-account
// Runs automatically or can be triggered manually

async function syncBankAccount(accountId) {
  // 1. Get account from database
  const account = await getBankAccount(accountId)
  
  // 2. Refresh token if needed
  if (account.token_expires_at < new Date()) {
    const newTokens = await bankService.refreshToken(account.refresh_token_encrypted)
    await updateAccountTokens(accountId, newTokens)
  }
  
  // 3. Fetch transactions (last sync date to now)
  const dateFrom = account.last_sync_at || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  const transactions = await bankService.getTransactions(
    account.provider_account_id,
    dateFrom.toISOString().split('T')[0],
    new Date().toISOString().split('T')[0]
  )
  
  // 4. Store transactions (read-only, no modifications)
  for (const tx of transactions.transactions.booked) {
    await supabase.from('bank_statements').upsert({
      bank_account_id: accountId,
      transaction_id: tx.transactionId,
      transaction_date: tx.bookingDate,
      amount: parseFloat(tx.transactionAmount.amount),
      // ... other fields
      raw_data: tx
    }, { onConflict: 'bank_account_id,transaction_id' })
  }
  
  // 5. Fetch and store balance
  const balances = await bankService.getBalances(account.provider_account_id)
  for (const balance of balances.balances) {
    await supabase.from('bank_account_balances').upsert({
      bank_account_id: accountId,
      balance_date: new Date().toISOString().split('T')[0],
      balance_amount: parseFloat(balance.balanceAmount.amount),
      balance_type: balance.balanceType,
      // ...
    })
  }
  
  // 6. Update sync timestamp
  await updateAccountSyncTime(accountId)
  
  // 7. Log sync
  await logSync(accountId, 'success', transactions.transactions.booked.length)
}
```

---

## 🚫 CRITICAL CONSTRAINTS

### **1. Read-Only Access**
- ✅ **NO** payment initiation
- ✅ **NO** transfer capabilities
- ✅ **NO** modification of bank account
- ✅ **ONLY** read transactions and balances

### **2. No Booking Modifications**
- ✅ Bank data **NEVER** overwrites `bank_transfer` field in `main_table`
- ✅ Bank data **NEVER** modifies `cash_paid` field
- ✅ Bank data **NEVER** auto-matches to bookings
- ✅ Bank data is **separate** and **read-only**

### **3. Owner-Only Access**
- ✅ Only owner/admin can access cashflow dashboard
- ✅ Bank connection is owner-only
- ✅ Not visible to customers or regular users

### **4. Comparison Only**
- ✅ Bank balance vs calculated revenue = **comparison only**
- ✅ Difference detection = **insight only**
- ✅ No automatic reconciliation
- ✅ Manual review required for discrepancies

---

## 📈 BENEFITS

1. **Real-Time Visibility**
   - See actual bank balance instantly
   - Compare with system-calculated revenue
   - Identify discrepancies quickly

2. **Cashflow Management**
   - Track balance trends over time
   - Monitor incoming payments
   - Plan cashflow based on real data

3. **Accounting Insights**
   - Understand difference between bank and system
   - Identify missing payments
   - Track payment timing

4. **No Risk**
   - Read-only = no accidental payments
   - No modification of existing logic
   - Separate data storage

---

## 🔐 SECURITY

1. **Token Encryption**
   - Store access/refresh tokens encrypted
   - Use Supabase Vault or application-level encryption
   - Never expose tokens in frontend

2. **API Credentials**
   - Store GoCardless credentials in environment variables
   - Use Supabase Edge Functions for API calls
   - Never expose in client-side code

3. **Access Control**
   - Owner-only access via RLS policies
   - Check user role before displaying dashboard
   - Audit logs for all sync operations

---

## 📝 IMPLEMENTATION CHECKLIST

### **Phase 1: Database Setup**
- [ ] Create `owner_bank_accounts` table
- [ ] Create `bank_statements` table
- [ ] Create `bank_account_balances` table
- [ ] Create `bank_sync_logs` table
- [ ] Set up RLS policies (owner-only)

### **Phase 2: Bank Service**
- [ ] Implement `bankService.js`
- [ ] Add GoCardless API integration
- [ ] Implement token refresh logic
- [ ] Add error handling

### **Phase 3: Revenue Service**
- [ ] Implement `revenueService.js`
- [ ] Calculate total revenue from bookings
- [ ] Calculate revenue by date range
- [ ] Calculate outstanding revenue

### **Phase 4: UI Components**
- [ ] Create `CashflowDashboard.jsx`
- [ ] Add bank connection flow
- [ ] Display bank balance vs revenue
- [ ] Show cashflow charts
- [ ] List recent transactions

### **Phase 5: Sync System**
- [ ] Create Supabase Edge Function for sync
- [ ] Implement scheduled sync (cron)
- [ ] Add manual sync button
- [ ] Store transactions and balances

### **Phase 6: Testing**
- [ ] Test with GoCardless sandbox
- [ ] Test token refresh
- [ ] Test sync workflow
- [ ] Test dashboard display

### **Phase 7: Production**
- [ ] Deploy Edge Functions
- [ ] Connect real bank account
- [ ] Monitor sync logs
- [ ] Gather feedback

---

**End of Design Document**
