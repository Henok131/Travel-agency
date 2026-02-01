import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CurrencyExchangeCalculator from '../components/Documentation/CurrencyExchangeCalculator'
import VATCalculator from '../components/Documentation/VATCalculator'
import BookingCalculator from '../components/Documentation/BookingCalculator'
import FormulaCalculator from '../components/Documentation/FormulaCalculator'
import './CalculatorDashboard.css'

// Calculator definitions
const CALCULATORS = [
  {
    id: 'currency-converter',
    name: 'Currency Converter',
    description: 'Convert between 150+ currencies with live exchange rates',
    category: 'currency',
    icon: '💱',
    component: CurrencyExchangeCalculator,
    color: '#3b82f6',
    tags: ['currency', 'exchange', 'rate', 'money', 'forex']
  },
  {
    id: 'vat-calculator',
    name: 'VAT Calculator',
    description: 'Calculate VAT from gross or net amounts with multiple rates',
    category: 'tax',
    icon: '💰',
    component: VATCalculator,
    color: '#8b5cf6',
    tags: ['vat', 'tax', 'gross', 'net', '19%', '7%']
  },
  {
    id: 'booking-calculator',
    name: 'Booking Calculator',
    description: 'Complete financial calculator for flight and visa bookings',
    category: 'booking',
    icon: '✈️',
    component: BookingCalculator,
    color: '#10b981',
    tags: ['booking', 'flight', 'visa', 'payment', 'profit', 'balance']
  },
  {
    id: 'total-ticket-price',
    name: 'Total Ticket Price',
    description: 'Calculate total ticket price from airlines price and service ticket',
    category: 'booking',
    icon: '🎫',
    component: () => (
      <FormulaCalculator
        title="Total Ticket Price"
        formula="\\text{Total Ticket Price} = \\text{Airlines Price} + \\text{Service Ticket}"
        inputs={[
          { id: 'airlines_price', label: 'Airlines Price', defaultValue: 500, unit: '€' },
          { id: 'service_fee', label: 'Service Ticket', defaultValue: 50, unit: '€' }
        ]}
        calculate={(values) => {
          const airlines = parseFloat(values.airlines_price) || 0
          const service = parseFloat(values.service_fee) || 0
          return airlines + service
        }}
        resultLabel="Total Ticket Price"
        resultUnit="€"
        description="Sum of airlines price and service ticket"
      />
    ),
    color: '#f59e0b',
    tags: ['ticket', 'price', 'airlines', 'service', 'fee']
  },
  {
    id: 'total-visa-fees',
    name: 'Total Visa Fees',
    description: 'Calculate total visa fees from visa price and service visa',
    category: 'booking',
    icon: '🛂',
    component: () => (
      <FormulaCalculator
        title="Total Visa Fees"
        formula="\\text{Total Visa Fees} = \\text{Visa Price} + \\text{Service Visa}"
        inputs={[
          { id: 'visa_price', label: 'Visa Price', defaultValue: 80, unit: '€' },
          { id: 'service_visa', label: 'Service Visa', defaultValue: 20, unit: '€' }
        ]}
        calculate={(values) => {
          const visa = parseFloat(values.visa_price) || 0
          const service = parseFloat(values.service_visa) || 0
          return visa + service
        }}
        resultLabel="Total Visa Fees"
        resultUnit="€"
        description="Sum of visa price and visa service fee"
      />
    ),
    color: '#ec4899',
    tags: ['visa', 'fees', 'service', 'price']
  },
  {
    id: 'payment-balance',
    name: 'Payment Balance',
    description: 'Calculate payment balance from customer payment and amount due',
    category: 'booking',
    icon: '⚖️',
    component: () => (
      <FormulaCalculator
        title="Payment Balance"
        formula="\\text{Payment Balance} = \\text{Total Customer Payment} - \\text{Total Amount Due}"
        inputs={[
          { id: 'total_customer_payment', label: 'Total Customer Payment', defaultValue: 650, unit: '€' },
          { id: 'total_amount_due', label: 'Total Amount Due', defaultValue: 650, unit: '€' }
        ]}
        calculate={(values) => {
          const payment = parseFloat(values.total_customer_payment) || 0
          const due = parseFloat(values.total_amount_due) || 0
          return payment - due
        }}
        resultLabel="Payment Balance"
        resultUnit="€"
        description="Difference between payment and amount due"
      />
    ),
    color: '#06b6d4',
    tags: ['payment', 'balance', 'due', 'customer']
  },
  {
    id: 'lst-profit',
    name: 'LST Profit',
    description: 'Calculate LST profit from service ticket, service visa fees, commission, and loan fees',
    category: 'booking',
    icon: '📊',
    component: () => (
      <FormulaCalculator
        title="LST Profit"
        formula="\\text{LST Profit} = \\text{Service Ticket} + \\text{Service Visa} + \\text{Commission} - \\text{Loan Fee}"
        inputs={[
          { id: 'service_fee', label: 'Service Ticket', defaultValue: 50, unit: '€' },
          { id: 'service_visa', label: 'Service Visa', defaultValue: 20, unit: '€' },
          { id: 'commission_from_airlines', label: 'Commission from Airlines', defaultValue: 30, unit: '€' },
          { id: 'lst_loan_fee', label: 'LST Loan Fee', defaultValue: 10, unit: '€' }
        ]}
        calculate={(values) => {
          const serviceFee = parseFloat(values.service_fee) || 0
          const serviceVisa = parseFloat(values.service_visa) || 0
          const commission = parseFloat(values.commission_from_airlines) || 0
          const loanFee = parseFloat(values.lst_loan_fee) || 0
          return serviceFee + serviceVisa + commission - loanFee
        }}
        resultLabel="LST Profit"
        resultUnit="€"
        description="Net profit after all fees and commissions"
      />
    ),
    color: '#14b8a6',
    tags: ['profit', 'commission', 'loan', 'fee', 'lst']
  }
]

const CATEGORIES = [
  { id: 'all', name: 'All Calculators', icon: '📱' },
  { id: 'currency', name: 'Currency & Exchange', icon: '💱' },
  { id: 'tax', name: 'Tax Calculations', icon: '💰' },
  { id: 'booking', name: 'Booking Financials', icon: '✈️' }
]

export default function CalculatorDashboard() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCalculator, setSelectedCalculator] = useState(null)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('calculator-favorites')
    return saved ? JSON.parse(saved) : []
  })
  const [recentlyUsed, setRecentlyUsed] = useState(() => {
    const saved = localStorage.getItem('calculator-recently-used')
    return saved ? JSON.parse(saved) : []
  })

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('calculator-favorites', JSON.stringify(favorites))
  }, [favorites])

  // Save recently used to localStorage
  useEffect(() => {
    localStorage.setItem('calculator-recently-used', JSON.stringify(recentlyUsed))
  }, [recentlyUsed])

  // Filter calculators
  const filteredCalculators = useMemo(() => {
    let filtered = CALCULATORS

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(calc => calc.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(calc =>
        calc.name.toLowerCase().includes(query) ||
        calc.description.toLowerCase().includes(query) ||
        calc.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [selectedCategory, searchQuery])

  // Group calculators by category
  const groupedCalculators = useMemo(() => {
    const groups = {}
    filteredCalculators.forEach(calc => {
      if (!groups[calc.category]) {
        groups[calc.category] = []
      }
      groups[calc.category].push(calc)
    })
    return groups
  }, [filteredCalculators])

  // Handle calculator click
  const handleCalculatorClick = (calculator) => {
    setSelectedCalculator(calculator)
    // Add to recently used
    setRecentlyUsed(prev => {
      const filtered = prev.filter(id => id !== calculator.id)
      return [calculator.id, ...filtered].slice(0, 5)
    })
  }

  // Toggle favorite
  const toggleFavorite = (calculatorId, e) => {
    e.stopPropagation()
    setFavorites(prev => {
      if (prev.includes(calculatorId)) {
        return prev.filter(id => id !== calculatorId)
      } else {
        return [...prev, calculatorId]
      }
    })
  }

  // Close calculator view
  const handleCloseCalculator = () => {
    setSelectedCalculator(null)
  }

  // Get category name
  const getCategoryName = (categoryId) => {
    return CATEGORIES.find(cat => cat.id === categoryId)?.name || categoryId
  }

  // If calculator is selected, show it
  if (selectedCalculator) {
    const CalculatorComponent = selectedCalculator.component
    return (
      <div className="calculator-dashboard">
        <div className="calculator-view-header">
          <button className="calculator-back-btn" onClick={handleCloseCalculator}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Dashboard
          </button>
          <div className="calculator-view-title">
            <span className="calculator-view-icon">{selectedCalculator.icon}</span>
            <h2>{selectedCalculator.name}</h2>
          </div>
        </div>
        <div className="calculator-view-content">
          <CalculatorComponent />
        </div>
      </div>
    )
  }

  return (
    <div className="calculator-dashboard">
      {/* Header */}
      <div className="calculator-dashboard-header">
        <div>
          <h1 className="calculator-dashboard-title">Financial Calculators Dashboard</h1>
          <p className="calculator-dashboard-description">
            Access all financial calculators in one place. Calculate currencies, taxes, bookings, and more.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="calculator-search-section">
        <div className="calculator-search-bar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search calculators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="calculator-search-input"
          />
          {searchQuery && (
            <button
              className="calculator-search-clear"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="calculator-categories">
        {CATEGORIES.map(category => (
          <button
            key={category.id}
            className={`calculator-category-tab ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="calculator-category-icon">{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Recently Used */}
      {recentlyUsed.length > 0 && selectedCategory === 'all' && !searchQuery && (
        <div className="calculator-section">
          <h3 className="calculator-section-title">
            <span>🕒</span> Recently Used
          </h3>
          <div className="calculator-grid">
            {recentlyUsed.map(calcId => {
              const calc = CALCULATORS.find(c => c.id === calcId)
              if (!calc) return null
              return (
                <CalculatorCard
                  key={calc.id}
                  calculator={calc}
                  isFavorite={favorites.includes(calc.id)}
                  onClick={() => handleCalculatorClick(calc)}
                  onToggleFavorite={(e) => toggleFavorite(calc.id, e)}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Favorites */}
      {favorites.length > 0 && selectedCategory === 'all' && !searchQuery && (
        <div className="calculator-section">
          <h3 className="calculator-section-title">
            <span>⭐</span> Favorites
          </h3>
          <div className="calculator-grid">
            {favorites.map(calcId => {
              const calc = CALCULATORS.find(c => c.id === calcId)
              if (!calc) return null
              return (
                <CalculatorCard
                  key={calc.id}
                  calculator={calc}
                  isFavorite={true}
                  onClick={() => handleCalculatorClick(calc)}
                  onToggleFavorite={(e) => toggleFavorite(calc.id, e)}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Calculators by Category */}
      {Object.keys(groupedCalculators).length > 0 ? (
        Object.entries(groupedCalculators).map(([categoryId, calculators]) => (
          <div key={categoryId} className="calculator-section">
            <h3 className="calculator-section-title">
              <span>{CATEGORIES.find(c => c.id === categoryId)?.icon || '📱'}</span>
              {getCategoryName(categoryId)}
            </h3>
            <div className="calculator-grid">
              {calculators.map(calculator => (
                <CalculatorCard
                  key={calculator.id}
                  calculator={calculator}
                  isFavorite={favorites.includes(calculator.id)}
                  onClick={() => handleCalculatorClick(calculator)}
                  onToggleFavorite={(e) => toggleFavorite(calculator.id, e)}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="calculator-empty-state">
          <p>No calculators found matching your search.</p>
        </div>
      )}
    </div>
  )
}

// Calculator Card Component
function CalculatorCard({ calculator, isFavorite, onClick, onToggleFavorite }) {
  return (
    <motion.div
      className="calculator-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)' }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      style={{ '--card-color': calculator.color }}
    >
      <div className="calculator-card-header">
        <div className="calculator-card-icon" style={{ backgroundColor: `${calculator.color}20` }}>
          {calculator.icon}
        </div>
        <button
          className={`calculator-favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={onToggleFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      </div>
      <div className="calculator-card-content">
        <h3 className="calculator-card-title">{calculator.name}</h3>
        <p className="calculator-card-description">{calculator.description}</p>
      </div>
      <div className="calculator-card-footer">
        <span className="calculator-card-category">{calculator.category}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </motion.div>
  )
}
