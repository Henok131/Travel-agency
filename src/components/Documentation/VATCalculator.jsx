import { useState, useEffect, useRef } from 'react'

// International VAT/GST/Sales Tax Rates by Country
const COUNTRY_TAX_RATES = {
  // Europe
  DE: {
    name: 'Germany',
    currency: 'EUR',
    taxName: 'VAT (Mehrwertsteuer)',
    rates: [
      { value: 19, label: '19% (Standard Rate)' },
      { value: 7, label: '7% (Reduced Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  AT: {
    name: 'Austria',
    currency: 'EUR',
    taxName: 'VAT (Umsatzsteuer)',
    rates: [
      { value: 20, label: '20% (Standard Rate)' },
      { value: 10, label: '10% (Reduced Rate)' },
      { value: 13, label: '13% (Special Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  FR: {
    name: 'France',
    currency: 'EUR',
    taxName: 'VAT (TVA)',
    rates: [
      { value: 20, label: '20% (Standard Rate)' },
      { value: 10, label: '10% (Intermediate Rate)' },
      { value: 5.5, label: '5.5% (Reduced Rate)' },
      { value: 2.1, label: '2.1% (Super-Reduced Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  IT: {
    name: 'Italy',
    currency: 'EUR',
    taxName: 'VAT (IVA)',
    rates: [
      { value: 22, label: '22% (Standard Rate)' },
      { value: 10, label: '10% (Reduced Rate)' },
      { value: 5, label: '5% (Super-Reduced Rate)' },
      { value: 4, label: '4% (Minimum Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  ES: {
    name: 'Spain',
    currency: 'EUR',
    taxName: 'VAT (IVA)',
    rates: [
      { value: 21, label: '21% (Standard Rate)' },
      { value: 10, label: '10% (Reduced Rate)' },
      { value: 4, label: '4% (Super-Reduced Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  NL: {
    name: 'Netherlands',
    currency: 'EUR',
    taxName: 'VAT (BTW)',
    rates: [
      { value: 21, label: '21% (Standard Rate)' },
      { value: 9, label: '9% (Reduced Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  BE: {
    name: 'Belgium',
    currency: 'EUR',
    taxName: 'VAT (BTW/TVA)',
    rates: [
      { value: 21, label: '21% (Standard Rate)' },
      { value: 12, label: '12% (Intermediate Rate)' },
      { value: 6, label: '6% (Reduced Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  GB: {
    name: 'United Kingdom',
    currency: 'GBP',
    symbol: '£',
    taxName: 'VAT',
    registrationThreshold: '£90,000',
    filingFrequency: 'Quarterly',
    rates: [
      { value: 20, label: '20% (Standard Rate)', description: 'Most goods and services, electronics, restaurants, hotels' },
      { value: 5, label: '5% (Reduced Rate)', description: 'Domestic fuel/power, children\'s car seats, energy-saving materials' },
      { value: 0, label: '0% (Zero Rate)', description: 'Most food, children\'s clothing, books, medicines, public transport' },
      { value: 'custom', label: 'Custom Rate' }
    ],
    notes: [
      'Registration required if turnover exceeds £90,000/year',
      'Quarterly VAT returns using Making Tax Digital software',
      'Zero-rated supplies allow VAT reclaim on purchases',
      'Standard 20% rate since January 2011'
    ],
    exemptions: 'Financial services, insurance, education, healthcare, postal services'
  },
  CH: {
    name: 'Switzerland',
    currency: 'CHF',
    taxName: 'VAT (MWST)',
    rates: [
      { value: 8.1, label: '8.1% (Standard Rate)' },
      { value: 3.8, label: '3.8% (Special Rate)' },
      { value: 2.6, label: '2.6% (Reduced Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  SE: {
    name: 'Sweden',
    currency: 'SEK',
    taxName: 'VAT (Moms)',
    rates: [
      { value: 25, label: '25% (Standard Rate)' },
      { value: 12, label: '12% (Reduced Rate)' },
      { value: 6, label: '6% (Super-Reduced Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  DK: {
    name: 'Denmark',
    currency: 'DKK',
    taxName: 'VAT (Moms)',
    rates: [
      { value: 25, label: '25% (Standard Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  NO: {
    name: 'Norway',
    currency: 'NOK',
    taxName: 'VAT (MVA)',
    rates: [
      { value: 25, label: '25% (Standard Rate)' },
      { value: 15, label: '15% (Intermediate Rate)' },
      { value: 12, label: '12% (Reduced Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  PL: {
    name: 'Poland',
    currency: 'PLN',
    taxName: 'VAT (PTU)',
    rates: [
      { value: 23, label: '23% (Standard Rate)' },
      { value: 8, label: '8% (Reduced Rate)' },
      { value: 5, label: '5% (Super-Reduced Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  RU: {
    name: 'Russia',
    currency: 'RUB',
    taxName: 'VAT (НДС)',
    rates: [
      { value: 20, label: '20% (Standard Rate)' },
      { value: 10, label: '10% (Reduced Rate)' },
      { value: 0, label: '0% (Zero-Rated)' }
    ]
  },
  TR: {
    name: 'Turkey',
    currency: 'TRY',
    taxName: 'VAT (KDV)',
    rates: [
      { value: 20, label: '20% (Standard Rate)' },
      { value: 10, label: '10% (Reduced Rate)' },
      { value: 1, label: '1% (Super-Reduced Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  
  // North America
  US: {
    name: 'United States',
    currency: 'USD',
    taxName: 'Sales Tax',
    rates: [
      { value: 0, label: '0% (No Federal Sales Tax)' },
      { value: 6, label: '6% (Average State Rate)' },
      { value: 7.5, label: '7.5% (High Rate)' },
      { value: 10, label: '10% (Combined Rate)' },
      { value: 'custom', label: 'Custom Rate (by State)' }
    ]
  },
  CA: {
    name: 'Canada',
    currency: 'CAD',
    taxName: 'GST/HST',
    rates: [
      { value: 5, label: '5% (GST Federal)' },
      { value: 13, label: '13% (HST Ontario)' },
      { value: 15, label: '15% (HST Atlantic)' },
      { value: 0, label: '0% (Exempt)' },
      { value: 'custom', label: 'Custom Rate (by Province)' }
    ]
  },
  MX: {
    name: 'Mexico',
    currency: 'MXN',
    taxName: 'VAT (IVA)',
    rates: [
      { value: 16, label: '16% (Standard Rate)' },
      { value: 8, label: '8% (Border Region)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  
  // Asia Pacific
  AU: {
    name: 'Australia',
    currency: 'AUD',
    taxName: 'GST',
    rates: [
      { value: 10, label: '10% (Standard Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  NZ: {
    name: 'New Zealand',
    currency: 'NZD',
    taxName: 'GST',
    rates: [
      { value: 15, label: '15% (Standard Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  JP: {
    name: 'Japan',
    currency: 'JPY',
    taxName: 'Consumption Tax',
    rates: [
      { value: 10, label: '10% (Standard Rate)' },
      { value: 8, label: '8% (Reduced Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  CN: {
    name: 'China',
    currency: 'CNY',
    taxName: 'VAT',
    rates: [
      { value: 13, label: '13% (Standard Rate)' },
      { value: 9, label: '9% (Reduced Rate)' },
      { value: 6, label: '6% (Services)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  IN: {
    name: 'India',
    currency: 'INR',
    taxName: 'GST',
    rates: [
      { value: 28, label: '28% (Luxury Rate)' },
      { value: 18, label: '18% (Standard Rate)' },
      { value: 12, label: '12% (Mid Rate)' },
      { value: 5, label: '5% (Lower Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  SG: {
    name: 'Singapore',
    currency: 'SGD',
    taxName: 'GST',
    rates: [
      { value: 9, label: '9% (Standard Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  MY: {
    name: 'Malaysia',
    currency: 'MYR',
    taxName: 'SST',
    rates: [
      { value: 10, label: '10% (Sales Tax)' },
      { value: 6, label: '6% (Service Tax)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  TH: {
    name: 'Thailand',
    currency: 'THB',
    taxName: 'VAT',
    rates: [
      { value: 7, label: '7% (Standard Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  
  // Middle East & Africa
  AE: {
    name: 'United Arab Emirates',
    currency: 'AED',
    taxName: 'VAT',
    rates: [
      { value: 5, label: '5% (Standard Rate)' },
      { value: 0, label: '0% (Zero-Rated)' }
    ]
  },
  SA: {
    name: 'Saudi Arabia',
    currency: 'SAR',
    taxName: 'VAT',
    rates: [
      { value: 15, label: '15% (Standard Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  ZA: {
    name: 'South Africa',
    currency: 'ZAR',
    taxName: 'VAT',
    rates: [
      { value: 15, label: '15% (Standard Rate)' },
      { value: 0, label: '0% (Zero-Rated)' }
    ]
  },
  IL: {
    name: 'Israel',
    currency: 'ILS',
    taxName: 'VAT',
    rates: [
      { value: 17, label: '17% (Standard Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  },
  KE: {
    name: 'Kenya',
    currency: 'KES',
    symbol: 'KSh',
    taxName: 'VAT',
    registrationThreshold: 'KES 5,000,000',
    filingFrequency: 'Monthly',
    rates: [
      { value: 16, label: '16% (Standard Rate)', description: 'Most goods and services, imports, digital services, telecommunications' },
      { value: 2, label: '2% (Withholding VAT)', description: 'Government withholding on public sector supplies' },
      { value: 0, label: '0% (Zero Rate)', description: 'Exports, international transport, tea, coffee packaging, medical supplies' },
      { value: 'custom', label: 'Custom Rate' }
    ],
    notes: [
      'Registration required if turnover exceeds KES 5 million/year',
      'Monthly VAT returns due by 20th of following month',
      'eTIMS (Electronic Tax Invoice) system mandatory',
      'Non-resident digital services taxable at 16%',
      'Government bodies withhold 6% of VAT on purchases'
    ],
    exemptions: 'Financial services, insurance, education, healthcare, residential rent'
  },
  
  // Latin America
  BR: {
    name: 'Brazil',
    currency: 'BRL',
    taxName: 'ICMS/IPI',
    rates: [
      { value: 17, label: '17% (ICMS Average)' },
      { value: 12, label: '12% (Reduced ICMS)' },
      { value: 7, label: '7% (Interstate)' },
      { value: 0, label: '0% (Exempt)' },
      { value: 'custom', label: 'Custom Rate (by State)' }
    ]
  },
  AR: {
    name: 'Argentina',
    currency: 'ARS',
    taxName: 'VAT (IVA)',
    rates: [
      { value: 21, label: '21% (Standard Rate)' },
      { value: 10.5, label: '10.5% (Reduced Rate)' },
      { value: 27, label: '27% (Increased Rate)' },
      { value: 0, label: '0% (Exempt)' }
    ]
  }
}

// Country selector component
function CountrySelector({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef(null)

  const selectedCountry = COUNTRY_TAX_RATES[value]

  const filteredCountries = Object.entries(COUNTRY_TAX_RATES).filter(
    ([code, country]) =>
      country.name.toLowerCase().includes(search.toLowerCase()) ||
      code.toLowerCase().includes(search.toLowerCase())
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
      <label>Country</label>
      <button
        type="button"
        className="currency-selector-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="currency-code">{value}</span>
        <span className="currency-name">{selectedCountry?.name}</span>
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
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="currency-list">
            {filteredCountries.map(([code, country]) => (
              <button
                key={code}
                className={`currency-option ${value === code ? 'active' : ''}`}
                onClick={() => {
                  onChange(code)
                  setIsOpen(false)
                  setSearch('')
                }}
              >
                <span className="currency-code">{code}</span>
                <span className="currency-name">{country.name}</span>
                <span className="currency-symbol">{country.currency}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function VATCalculator() {
  const [country, setCountry] = useState('DE') // Default Germany
  const [mode, setMode] = useState('gross')
  const [amount, setAmount] = useState(100)
  const [vatRate, setVatRate] = useState(19)
  const [customRate, setCustomRate] = useState('')
  const [result, setResult] = useState({ net: 0, vat: 0, gross: 0 })
  const [previousState, setPreviousState] = useState(null)

  const currentCountry = COUNTRY_TAX_RATES[country]

  // Reset VAT rate when country changes
  useEffect(() => {
    const defaultRate = currentCountry.rates[0].value
    if (defaultRate !== 'custom') {
      setVatRate(defaultRate)
      setCustomRate('')
    } else {
      setVatRate('custom')
    }
  }, [country])

  useEffect(() => {
    let net, vat, gross
    const rate = vatRate === 'custom' ? (parseFloat(customRate) || 0) : vatRate

    if (mode === 'gross') {
      gross = amount
      net = amount / (1 + rate / 100)
      vat = gross - net
    } else {
      net = amount
      vat = amount * (rate / 100)
      gross = net + vat
    }

    setResult({ net, vat, gross })
  }, [amount, vatRate, customRate, mode, country])

  const saveCurrentState = () => {
    setPreviousState({ country, mode, amount, vatRate, customRate, result })
  }

  const handleCountryChange = (newCountry) => {
    if (country !== newCountry) {
      saveCurrentState()
      setCountry(newCountry)
    }
  }

  const handleModeChange = (newMode) => {
    if (mode !== newMode) {
      saveCurrentState()
    }
    setMode(newMode)
  }

  const handleAmountChange = (newAmount) => {
    if (amount !== newAmount) {
      saveCurrentState()
    }
    setAmount(newAmount)
  }

  const handleVatRateChange = (newRate) => {
    if (vatRate !== newRate) {
      saveCurrentState()
    }
    setVatRate(newRate)
    if (newRate !== 'custom') {
      setCustomRate('')
    }
  }

  const handleReset = () => {
    if (previousState) {
      setCountry(previousState.country)
      setMode(previousState.mode)
      setAmount(previousState.amount)
      setVatRate(previousState.vatRate)
      setCustomRate(previousState.customRate)
      setResult(previousState.result)
      setPreviousState(null)
    }
  }

  const handleClear = () => {
    saveCurrentState()
    setAmount(100)
    setVatRate(currentCountry.rates[0].value)
    setCustomRate('')
    setMode('gross')
  }

  const handleCopy = () => {
    const currency = currentCountry.currency
    const text = `Net: ${currency} ${result.net.toFixed(2)}, ${currentCountry.taxName}: ${currency} ${result.vat.toFixed(2)}, Gross: ${currency} ${result.gross.toFixed(2)}`
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="calculator-content-compact">
      {/* Country Info Banner */}
      <div className="vat-country-banner">
        <div className="country-header">
          <span className="country-code">{country}</span>
          <div>
            <div className="country-name">{currentCountry.name}</div>
            <div className="tax-name">{currentCountry.taxName} System</div>
      </div>
        </div>
        {(currentCountry.registrationThreshold || currentCountry.filingFrequency) && (
          <div className="country-meta">
            {currentCountry.registrationThreshold && (
              <div className="meta-item">
                <span className="meta-label">Threshold</span>
                <span className="meta-value">{currentCountry.registrationThreshold}</span>
            </div>
          )}
            {currentCountry.filingFrequency && (
              <div className="meta-item">
                <span className="meta-label">Filing</span>
                <span className="meta-value">{currentCountry.filingFrequency}</span>
        </div>
            )}
          </div>
        )}
      </div>

      {/* Form */}
      <div className="calculator-grid-compact-vat">
        <CountrySelector value={country} onChange={handleCountryChange} />

        <div className="form-group-compact">
          <label>Calculation Mode</label>
          <select value={mode} onChange={(e) => handleModeChange(e.target.value)}>
            <option value="gross">From Gross Amount</option>
            <option value="net">From Net Amount</option>
          </select>
      </div>

        <div className="form-group-compact">
          <label>Amount ({currentCountry.currency})</label>
            <input
            type="number"
              value={amount}
            onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
            />
        </div>

        <div className="form-group-compact">
          <label>Tax Rate</label>
          <select value={vatRate} onChange={(e) => handleVatRateChange(e.target.value)}>
            {currentCountry.rates.map(rate => (
              <option key={rate.value} value={rate.value}>
                  {rate.label}
              </option>
            ))}
          </select>
          </div>

        {vatRate === 'custom' && (
          <div className="form-group-compact">
            <label>Custom Rate (%)</label>
                <input
              type="number"
                  value={customRate}
              onChange={(e) => setCustomRate(e.target.value)}
              placeholder="Enter rate"
                />
              </div>
          )}
      </div>

      {/* Result Breakdown */}
      <div className="vat-breakdown-compact">
        <div className="vat-item">
          <span className="label">Net Amount</span>
          <span className="value">{currentCountry.currency} {result.net.toFixed(2)}</span>
                </div>
        <div className="vat-item">
          <span className="label">
            {currentCountry.taxName.split(' ')[0]} ({vatRate === 'custom' ? customRate : vatRate}%)
          </span>
          <span className="value">{currentCountry.currency} {result.vat.toFixed(2)}</span>
                  </div>
        <div className="vat-item vat-total">
          <span className="label">Gross Amount</span>
          <span className="value">{currentCountry.currency} {result.gross.toFixed(2)}</span>
                </div>
              </div>

      {/* Actions */}
      <div className="result-actions">
        <button className="btn-sm" onClick={handleCopy} type="button">Copy</button>
        {previousState && (
          <button className="btn-sm btn-secondary" onClick={handleReset} type="button">Undo</button>
        )}
        <button className="btn-sm btn-secondary" onClick={handleClear} type="button">Clear</button>
      </div>

      {/* Tax Info Panel */}
      {currentCountry.notes && currentCountry.notes.length > 0 && (
        <div className="tax-info-panel">
          <div className="info-header">Key Information</div>
          <ul className="info-list">
            {currentCountry.notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
