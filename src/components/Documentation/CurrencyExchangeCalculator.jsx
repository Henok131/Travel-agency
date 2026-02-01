import { useState, useEffect, useRef } from 'react'

// Frankfurter supports these currencies (30+ major currencies)
const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
  { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr' }
]

// Searchable Currency Selector Component
function CurrencySelector({ value, onChange, label, disabled }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef(null)

  const selectedCurrency = CURRENCIES.find(c => c.code === value)

  const filteredCurrencies = CURRENCIES.filter(currency =>
    currency.code.toLowerCase().includes(search.toLowerCase()) ||
    currency.name.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="currency-selector" ref={dropdownRef}>
      <label>{label}</label>
      <button
        type="button"
        className="currency-selector-button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="currency-code">{selectedCurrency?.code}</span>
        <span className="currency-name">{selectedCurrency?.name}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="currency-dropdown">
          <div className="currency-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search currency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="currency-list">
            {filteredCurrencies.map(currency => (
              <button
                key={currency.code}
                className={`currency-option ${value === currency.code ? 'active' : ''}`}
                onClick={() => {
                  onChange(currency.code)
                  setIsOpen(false)
                  setSearch('')
                }}
              >
                <span className="currency-code">{currency.code}</span>
                <span className="currency-name">{currency.name}</span>
                <span className="currency-symbol">{currency.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CurrencyExchangeCalculator() {
  const [amount, setAmount] = useState(100)
  const [fromCurrency, setFromCurrency] = useState('EUR')
  const [toCurrency, setToCurrency] = useState('USD')
  const [exchangeRate, setExchangeRate] = useState(null)
  const [result, setResult] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [previousState, setPreviousState] = useState(null)

  // Fetch exchange rate from Frankfurter API
  const fetchExchangeRate = async (from, to) => {
      setLoading(true)
      setError(null)

    try {
      const response = await fetch(
        `https://api.frankfurter.app/latest?from=${from}&to=${to}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rate')
      }

      const data = await response.json()
      const rate = data.rates[to]
      
      setExchangeRate(rate)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      console.error('Exchange rate fetch error:', err)
      setError('Failed to fetch exchange rates. Please try again.')
      // Fallback to approximate rate
      setExchangeRate(1.0)
    } finally {
      setLoading(false)
    }
  }

  // Fetch rate when currencies change
  useEffect(() => {
    if (fromCurrency && toCurrency && fromCurrency !== toCurrency) {
      fetchExchangeRate(fromCurrency, toCurrency)
    } else if (fromCurrency === toCurrency) {
      setExchangeRate(1.0)
      setLastUpdated(new Date())
    }
  }, [fromCurrency, toCurrency])

  // Calculate result
  useEffect(() => {
    if (exchangeRate !== null) {
      setResult(amount * exchangeRate)
    }
  }, [amount, exchangeRate])

  // Save current state for undo
  const saveCurrentState = () => {
    setPreviousState({
      amount,
      fromCurrency,
      toCurrency,
      exchangeRate,
      result
    })
  }

  const handleAmountChange = (newAmount) => {
    if (amount !== newAmount) {
      saveCurrentState()
    }
    setAmount(newAmount)
  }

  const handleFromCurrencyChange = (currency) => {
    if (fromCurrency !== currency) {
      saveCurrentState()
      setFromCurrency(currency)
    }
  }

  const handleToCurrencyChange = (currency) => {
    if (toCurrency !== currency) {
      saveCurrentState()
      setToCurrency(currency)
    }
  }

  const handleSwap = () => {
    saveCurrentState()
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const handleReset = () => {
    if (previousState) {
      setAmount(previousState.amount)
      setFromCurrency(previousState.fromCurrency)
      setToCurrency(previousState.toCurrency)
      setExchangeRate(previousState.exchangeRate)
      setResult(previousState.result)
      setPreviousState(null)
    }
  }

  const handleClear = () => {
    saveCurrentState()
    setAmount(100)
    setFromCurrency('EUR')
    setToCurrency('USD')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result.toFixed(2))
  }

  const handleRefresh = () => {
    fetchExchangeRate(fromCurrency, toCurrency)
  }

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Not updated'
    
    const now = new Date()
    const diffMs = now - lastUpdated
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins === 1) return '1 minute ago'
    if (diffMins < 60) return `${diffMins} minutes ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return '1 hour ago'
    return `${diffHours} hours ago`
  }

  return (
    <div className="calculator-content-compact">
      {/* Error Message */}
      {error && (
        <div className="exchange-error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Exchange Rate - Compact */}
      <div className="exchange-rate-compact">
        <div className="rate-info">
          <span className="rate-label">1 {fromCurrency} =</span>
          <span className="rate-value">
            {loading ? (
              <span className="rate-loading">Loading...</span>
            ) : exchangeRate !== null ? (
              `${exchangeRate.toFixed(4)} ${toCurrency}`
            ) : (
              '—'
            )}
          </span>
        </div>
        <div className="rate-meta">
          <span className="rate-updated">{formatLastUpdated()}</span>
          <button 
            className="rate-refresh" 
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh exchange rate"
            type="button"
          >
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className={loading ? 'spinning' : ''}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Form - Tight Grid */}
      <div className="calculator-grid-compact">
        <div className="form-group-compact">
          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
            disabled={loading}
          />
        </div>

        <CurrencySelector
              value={fromCurrency}
          onChange={handleFromCurrencyChange}
          label="From"
          disabled={loading}
        />

        <CurrencySelector
          value={toCurrency}
          onChange={handleToCurrencyChange}
          label="To"
          disabled={loading}
        />
        </div>

        {/* Swap Button */}
      <button className="btn-swap" onClick={handleSwap} disabled={loading} type="button">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
        Swap Currencies
          </button>

      {/* Result - Clean Card */}
      <div className="result-card-compact">
        <div className="result-label">Converted Amount</div>
        <div className="result-value">
          {loading ? '—' : `${result.toFixed(2)} ${toCurrency}`}
            </div>
        <div className="result-actions">
          <button className="btn-sm" onClick={handleCopy} disabled={loading} type="button">
            Copy
          </button>
          {previousState && (
            <button className="btn-sm btn-secondary" onClick={handleReset} type="button">
              Undo
            </button>
          )}
          <button className="btn-sm btn-secondary" onClick={handleClear} disabled={loading} type="button">
            Clear
          </button>
        </div>
      </div>

      {/* Data Source Info */}
      <div className="exchange-source">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
        <span>Exchange rates from European Central Bank</span>
            </div>
        </div>
  )
}
