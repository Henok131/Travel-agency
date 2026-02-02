import React, { useState, useEffect, useMemo } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { applyTheme, DEFAULT_LANGUAGE, DEFAULT_THEME, loadBankData, loadThemeAndLanguage, persistLanguage, persistTheme } from '@/lib/preferences'
import logo from '../assets/logo.png'
import taxLogo from '../assets/tax-logo.png'
import settingLogo from '../assets/setting-logo.png'
import { mockBankAccount, mockTransactions, calculateCashflow } from '../data/mockBankData'
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
      title: 'Bank Dashboard',
      loading: 'Loading bank accounts...',
      noAccounts: 'No bank accounts found.',
      error: 'Error loading bank accounts',
      refresh: 'Refresh',
      connectBank: 'Connect Bank Account',
      demoNote: 'Data synced from Supabase (single-tenant)',
      accountSummary: 'Account Summary',
      cashflow: 'Cashflow',
      transactions: 'Recent Transactions',
      balance: 'Balance',
      availableBalance: 'Available Balance',
      totalIncome: 'Total Income',
      totalExpenses: 'Total Expenses',
      netCashflow: 'Net Cashflow',
      date: 'Date',
      description: 'Description',
      amount: 'Amount',
      type: 'Type',
      reference: 'Reference',
      credit: 'Income',
      debit: 'Expense',
      noTransactions: 'No transactions found'
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
      title: 'Bank Dashboard',
      loading: 'Bankkonten werden geladen...',
      noAccounts: 'Keine Bankkonten gefunden.',
      error: 'Fehler beim Laden der Bankkonten',
      refresh: 'Aktualisieren',
      connectBank: 'Bankkonto verbinden',
      demoNote: 'Daten aus Supabase (Single-Tenant)',
      accountSummary: 'Kontozusammenfassung',
      cashflow: 'Cashflow',
      transactions: 'Letzte Transaktionen',
      balance: 'Kontostand',
      availableBalance: 'Verfügbarer Saldo',
      totalIncome: 'Gesamteinnahmen',
      totalExpenses: 'Gesamtausgaben',
      netCashflow: 'Netto-Cashflow',
      date: 'Datum',
      description: 'Beschreibung',
      amount: 'Betrag',
      type: 'Typ',
      reference: 'Referenz',
      credit: 'Einnahme',
      debit: 'Ausgabe',
      noTransactions: 'Keine Transaktionen gefunden'
    }
  }
}

const DEFAULT_BANK_DATA = {
  account: mockBankAccount,
  transactions: mockTransactions
}

function BankList() {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE)
  const [theme, setTheme] = useState(DEFAULT_THEME)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bankData, setBankData] = useState(DEFAULT_BANK_DATA)

  const t = translations[language]

  useEffect(() => {
    let active = true
    const hydrate = async () => {
      try {
        const [{ language: savedLanguage, theme: savedTheme }, storedBankData] = await Promise.all([
          loadThemeAndLanguage(),
          loadBankData(DEFAULT_BANK_DATA)
        ])
        if (!active) return
        setLanguage(savedLanguage)
        setTheme(savedTheme)
        applyTheme(savedTheme)
        setBankData(storedBankData || DEFAULT_BANK_DATA)
      } catch (err) {
        console.error('Failed to load bank data from Supabase', err)
        if (active) setError('Failed to load bank data from Supabase')
      } finally {
        if (active) setLoading(false)
      }
    }
    hydrate()
    return () => {
      active = false
    }
  }, [])

  const updateLanguage = async (nextLanguage) => {
    setLanguage(nextLanguage)
    try {
      await persistLanguage(nextLanguage)
    } catch (err) {
      console.error('Failed to persist language to Supabase', err)
    }
  }

  const handleThemeChange = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    applyTheme(newTheme)
    try {
      await persistTheme(newTheme)
    } catch (err) {
      console.error('Failed to persist theme to Supabase', err)
    }
  }

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const account = bankData?.account || DEFAULT_BANK_DATA.account
  const transactions = Array.isArray(bankData?.transactions)
    ? bankData.transactions
    : DEFAULT_BANK_DATA.transactions

  // Calculate cashflow statistics
  const cashflow = useMemo(() => calculateCashflow(transactions), [transactions])

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(language === 'de' ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency: account.currency || 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  // Sort transactions by date (newest first)
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [transactions])

  const refreshBankData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await loadBankData(DEFAULT_BANK_DATA)
      setBankData(data || DEFAULT_BANK_DATA)
    } catch (err) {
      console.error('Failed to refresh bank data from Supabase', err)
      setError(t.table.error)
    } finally {
      setLoading(false)
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
            onClick={() => updateLanguage('de')}
          >
            DE
          </button>
          <button 
            className={`lang-button ${language === 'en' ? 'active' : ''}`} 
            type="button" 
            title="English"
            onClick={() => updateLanguage('en')}
          >
            EN
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/main" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
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
            </svg>
            <span>{t.sidebar.requests}</span>
          </NavLink>
          <NavLink to="/bookings" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
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
            <span>{t.sidebar.settings}</span>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                padding: '0.5rem 1rem',
                background: 'hsl(45, 93%, 47%, 0.1)',
                border: '1px solid hsl(45, 93%, 47%, 0.3)',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                color: 'hsl(45, 93%, 47%)',
                fontWeight: '500'
              }}>
                ⚠️ {t.table.demoNote}
              </div>
              <button className="button button-primary" onClick={refreshBankData}>
                + {t.table.connectBank}
              </button>
            </div>
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

          {!loading && !error && (
            <>
              {/* Account Summary Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '1rem'
                }}>
                  {t.table.accountSummary}
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1rem'
                }}>
                  {/* Bank Account Card */}
                  <div style={{
                    background: 'hsl(222, 22%, 11%)',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    border: '1px solid hsl(222, 15%, 25%)',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '0.5rem',
                        background: 'hsla(200, 80%, 55%, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(200, 80%, 55%)" strokeWidth="2">
                          <rect x="2" y="6" width="20" height="12" rx="2"/>
                          <path d="M2 10h20"/>
                          <path d="M7 14h.01"/>
                          <path d="M11 14h.01"/>
                        </svg>
                      </div>
                      <div>
                        <h3 style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: 'hsl(210, 20%, 70%)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          margin: 0,
                          marginBottom: '0.25rem'
                        }}>
                          {account.bankName}
                        </h3>
                        <p style={{
                          fontSize: '0.75rem',
                          color: 'hsl(210, 20%, 60%)',
                          margin: 0
                        }}>
                          {account.accountName}
                        </p>
                      </div>
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid hsl(222, 15%, 25%)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'hsl(210, 20%, 70%)', marginBottom: '0.5rem' }}>
                        {t.table.balance}
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: '700', color: 'hsl(0, 0%, 98%)' }}>
                        {formatCurrency(account.balance)}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'hsl(210, 20%, 70%)', marginTop: '0.5rem' }}>
                        {t.table.availableBalance}: {formatCurrency(account.availableBalance)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'hsl(210, 20%, 60%)', marginTop: '0.5rem' }}>
                        IBAN: {account.iban}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cashflow Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '1rem'
                }}>
                  {t.table.cashflow}
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1rem'
                }}>
                  {/* Total Income Card */}
                  <div style={{
                    background: 'hsl(222, 22%, 11%)',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    border: '1px solid hsl(152, 60%, 45%, 0.2)',
                    borderLeft: '4px solid hsl(152, 60%, 45%)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
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
                          <line x1="12" y1="19" x2="12" y2="5"/>
                          <polyline points="5 12 12 5 19 12"/>
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
                        {t.table.totalIncome}
                      </h3>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'hsl(152, 60%, 45%)' }}>
                      {formatCurrency(cashflow.income)}
                    </div>
                  </div>

                  {/* Total Expenses Card */}
                  <div style={{
                    background: 'hsl(222, 22%, 11%)',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    border: '1px solid hsl(4, 72%, 55%, 0.2)',
                    borderLeft: '4px solid hsl(4, 72%, 55%)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
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
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <polyline points="19 12 12 19 5 12"/>
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
                        {t.table.totalExpenses}
                      </h3>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'hsl(4, 72%, 55%)' }}>
                      {formatCurrency(cashflow.expenses)}
                    </div>
                  </div>

                  {/* Net Cashflow Card */}
                  <div style={{
                    background: 'hsl(222, 22%, 11%)',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    border: '1px solid hsl(210, 80%, 55%, 0.2)',
                    borderLeft: '4px solid hsl(210, 80%, 55%)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '0.5rem',
                        background: 'hsla(210, 80%, 55%, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(210, 80%, 55%)" strokeWidth="2">
                          <line x1="12" y1="1" x2="12" y2="23"/>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
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
                        {t.table.netCashflow}
                      </h3>
                    </div>
                    <div style={{
                      fontSize: '1.75rem',
                      fontWeight: '700',
                      color: cashflow.net >= 0 ? 'hsl(152, 60%, 45%)' : 'hsl(4, 72%, 55%)'
                    }}>
                      {formatCurrency(cashflow.net)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(210, 20%, 70%)', marginTop: '0.5rem' }}>
                      {cashflow.transactionCount} transactions
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions Section */}
              <div>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '1rem'
                }}>
                  {t.table.transactions}
                </h2>
                {sortedTransactions.length === 0 ? (
                  <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: 'hsl(210, 20%, 70%)'
                  }}>
                    {t.table.noTransactions}
                  </div>
                ) : (
                  <div style={{
                    background: 'hsl(222, 22%, 11%)',
                    borderRadius: '0.5rem',
                    border: '1px solid hsl(222, 15%, 25%)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr 150px 100px 150px',
                      gap: '1rem',
                      padding: '1rem',
                      background: 'hsl(222, 20%, 13%)',
                      borderBottom: '1px solid hsl(222, 15%, 25%)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'hsl(210, 20%, 70%)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      <div>{t.table.date}</div>
                      <div>{t.table.description}</div>
                      <div>{t.table.amount}</div>
                      <div>{t.table.type}</div>
                      <div>{t.table.reference}</div>
                    </div>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                      {sortedTransactions.map((transaction, index) => (
                        <div
                          key={transaction.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '120px 1fr 150px 100px 150px',
                            gap: '1rem',
                            padding: '1rem',
                            borderBottom: index < sortedTransactions.length - 1 ? '1px solid hsl(222, 15%, 25%)' : 'none',
                            fontSize: '0.875rem',
                            color: 'var(--text-primary)',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'hsl(222, 20%, 13%)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <div>{formatDate(transaction.date)}</div>
                          <div>{transaction.description}</div>
                          <div style={{
                            fontWeight: '600',
                            color: transaction.type === 'credit' ? 'hsl(152, 60%, 45%)' : 'hsl(4, 72%, 55%)'
                          }}>
                            {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                          </div>
                          <div>
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: transaction.type === 'credit' ? 'hsla(152, 60%, 45%, 0.1)' : 'hsla(4, 72%, 55%, 0.1)',
                              color: transaction.type === 'credit' ? 'hsl(152, 60%, 45%)' : 'hsl(4, 72%, 55%)'
                            }}>
                              {transaction.type === 'credit' ? t.table.credit : t.table.debit}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'hsl(210, 20%, 70%)' }}>
                            {transaction.reference}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default BankList
