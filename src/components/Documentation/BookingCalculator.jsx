import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import jsPDF from 'jspdf'
import './BookingCalculator.css'

// Example scenarios
const EXAMPLE_SCENARIOS = [
  {
    name: 'Standard Flight Booking',
    values: {
      airlines_price: '500',
      service_fee: '50',
      visa_price: '0',
      service_visa: '0',
      cash_paid: '550',
      bank_transfer: '0',
      commission_from_airlines: '25',
      lst_loan_fee: '0'
    }
  },
  {
    name: 'Flight + Visa Package',
    values: {
      airlines_price: '800',
      service_fee: '75',
      visa_price: '120',
      service_visa: '30',
      cash_paid: '500',
      bank_transfer: '525',
      commission_from_airlines: '40',
      lst_loan_fee: '0'
    }
  },
  {
    name: 'High-Value Booking',
    values: {
      airlines_price: '2000',
      service_fee: '200',
      visa_price: '0',
      service_visa: '0',
      cash_paid: '0',
      bank_transfer: '2200',
      commission_from_airlines: '100',
      lst_loan_fee: '50'
    }
  },
  {
    name: 'Partial Payment',
    values: {
      airlines_price: '600',
      service_fee: '60',
      visa_price: '80',
      service_visa: '20',
      cash_paid: '300',
      bank_transfer: '200',
      commission_from_airlines: '30',
      lst_loan_fee: '0'
    }
  }
]

export default function BookingCalculator() {
  const [values, setValues] = useState({
    airlines_price: '',
    service_fee: '',
    visa_price: '',
    service_visa: '',
    cash_paid: '',
    bank_transfer: '',
    commission_from_airlines: '',
    lst_loan_fee: ''
  })

  const [selectedScenario, setSelectedScenario] = useState('')

  // Calculate all financial values
  const calculateResults = () => {
    const airlinesPrice = parseFloat(values.airlines_price) || 0
    const serviceFee = parseFloat(values.service_fee) || 0
    const visaPrice = parseFloat(values.visa_price) || 0
    const serviceVisa = parseFloat(values.service_visa) || 0
    const cashPaid = parseFloat(values.cash_paid) || 0
    const bankTransfer = parseFloat(values.bank_transfer) || 0
    const commission = parseFloat(values.commission_from_airlines) || 0
    const loanFee = parseFloat(values.lst_loan_fee) || 0

    // Total Ticket Price = Service Ticket + Airlines Price
    const totalTicketPrice = serviceFee + airlinesPrice

    // Total Visa Fees = Visa Price + Service Visa
    const totalVisaFees = visaPrice + serviceVisa

    // Total Customer Payment = Cash Paid + Bank Transfer
    const totalCustomerPayment = cashPaid + bankTransfer

    // Total Amount Due = Total Ticket Price + Total Visa Fees
    const totalAmountDue = totalTicketPrice + totalVisaFees

    // Payment Balance = Total Customer Payment - Total Amount Due
    const paymentBalance = totalCustomerPayment - totalAmountDue

    // LST Profit = Service Ticket + Service Visa + Commission - Loan Fee
    const lstProfit = serviceFee + serviceVisa + commission - loanFee

    return {
      totalTicketPrice,
      totalVisaFees,
      totalCustomerPayment,
      totalAmountDue,
      paymentBalance,
      lstProfit
    }
  }

  const results = calculateResults()

  // Format currency
  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '€0.00'
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  // Handle input change
  const handleInputChange = (field, value) => {
    if (value === '' || value === '-') {
      setValues(prev => ({ ...prev, [field]: value }))
      return
    }
    const numericValue = value.replace(/[^0-9.-]/g, '')
    if (numericValue !== value) return
    setValues(prev => ({ ...prev, [field]: numericValue }))
  }

  // Load example scenario
  const handleLoadScenario = (scenarioName) => {
    const scenario = EXAMPLE_SCENARIOS.find(s => s.name === scenarioName)
    if (scenario) {
      setValues(scenario.values)
      setSelectedScenario(scenarioName)
    }
  }

  // Reset all inputs
  const handleReset = () => {
    setValues({
      airlines_price: '',
      service_fee: '',
      visa_price: '',
      service_visa: '',
      cash_paid: '',
      bank_transfer: '',
      commission_from_airlines: '',
      lst_loan_fee: ''
    })
    setSelectedScenario('')
  }

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(18)
    doc.text('Booking Financial Calculation', 20, 20)
    
    // Date
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString('en-US')}`, 20, 30)
    
    let yPos = 45

    // Inputs Section
    doc.setFontSize(14)
    doc.text('Input Values', 20, yPos)
    yPos += 10
    
    doc.setFontSize(10)
    const inputs = [
      ['Airlines Price', formatCurrency(parseFloat(values.airlines_price) || 0)],
      ['Service Ticket', formatCurrency(parseFloat(values.service_fee) || 0)],
      ['Visa Price', formatCurrency(parseFloat(values.visa_price) || 0)],
      ['Service Visa', formatCurrency(parseFloat(values.service_visa) || 0)],
      ['Cash Paid', formatCurrency(parseFloat(values.cash_paid) || 0)],
      ['Bank Transfer', formatCurrency(parseFloat(values.bank_transfer) || 0)],
      ['Commission from Airlines', formatCurrency(parseFloat(values.commission_from_airlines) || 0)],
      ['LST Loan Fee', formatCurrency(parseFloat(values.lst_loan_fee) || 0)]
    ]

    inputs.forEach(([label, value]) => {
      doc.text(`${label}:`, 20, yPos)
      doc.text(value, 100, yPos)
      yPos += 7
    })

    yPos += 5

    // Results Section
    doc.setFontSize(14)
    doc.text('Calculated Results', 20, yPos)
    yPos += 10

    doc.setFontSize(10)
    const calculated = [
      ['Total Ticket Price', formatCurrency(results.totalTicketPrice)],
      ['Total Visa Fees', formatCurrency(results.totalVisaFees)],
      ['Total Customer Payment', formatCurrency(results.totalCustomerPayment)],
      ['Total Amount Due', formatCurrency(results.totalAmountDue)],
      ['Payment Balance', formatCurrency(results.paymentBalance)],
      ['LST Profit', formatCurrency(results.lstProfit)]
    ]

    calculated.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.text(`${label}:`, 20, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(value, 100, yPos)
      yPos += 7
    })

    // Save PDF
    doc.save(`booking-calculation-${Date.now()}.pdf`)
  }

  // Get payment balance color
  const getBalanceColor = () => {
    if (results.paymentBalance > 0) return 'positive' // Overpaid (green)
    if (results.paymentBalance < 0) return 'negative' // Underpaid (red)
    return 'zero' // Paid in full (blue)
  }

  const balanceColor = getBalanceColor()

  return (
    <motion.div
      className="booking-calculator"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="booking-calculator-header">
        <h3 className="booking-calculator-title">Booking Financial Calculator</h3>
        <p className="booking-calculator-description">
          Calculate all financial values for a booking in real-time
        </p>
      </div>

      {/* Example Scenarios */}
      <div className="booking-scenarios">
        <label className="booking-scenario-label">Example Scenarios:</label>
        <select
          className="booking-scenario-select"
          value={selectedScenario}
          onChange={(e) => {
            if (e.target.value) {
              handleLoadScenario(e.target.value)
            }
          }}
        >
          <option value="">Select an example...</option>
          {EXAMPLE_SCENARIOS.map(scenario => (
            <option key={scenario.name} value={scenario.name}>
              {scenario.name}
            </option>
          ))}
        </select>
      </div>

      <div className="booking-calculator-grid">
        {/* Input Section */}
        <div className="booking-inputs-section">
          <h4 className="booking-section-title">Input Values</h4>
          
          <div className="booking-input-grid">
            <div className="booking-input-group">
              <label className="booking-input-label">
                Airlines Price
                <span className="input-hint">Base ticket cost</span>
              </label>
              <div className="booking-input-wrapper">
                <input
                  type="text"
                  className="booking-input"
                  placeholder="0.00"
                  value={values.airlines_price}
                  onChange={(e) => handleInputChange('airlines_price', e.target.value)}
                />
                <span className="booking-input-unit">€</span>
              </div>
            </div>

            <div className="booking-input-group">
              <label className="booking-input-label">
                Service Ticket
                <span className="input-hint">LST service charge</span>
              </label>
              <div className="booking-input-wrapper">
                <input
                  type="text"
                  className="booking-input"
                  placeholder="0.00"
                  value={values.service_fee}
                  onChange={(e) => handleInputChange('service_fee', e.target.value)}
                />
                <span className="booking-input-unit">€</span>
              </div>
            </div>

            <div className="booking-input-group">
              <label className="booking-input-label">
                Visa Price
                <span className="input-hint">Base visa cost</span>
              </label>
              <div className="booking-input-wrapper">
                <input
                  type="text"
                  className="booking-input"
                  placeholder="0.00"
                  value={values.visa_price}
                  onChange={(e) => handleInputChange('visa_price', e.target.value)}
                />
                <span className="booking-input-unit">€</span>
              </div>
            </div>

            <div className="booking-input-group">
              <label className="booking-input-label">
                Service Visa
                <span className="input-hint">Visa processing fee</span>
              </label>
              <div className="booking-input-wrapper">
                <input
                  type="text"
                  className="booking-input"
                  placeholder="0.00"
                  value={values.service_visa}
                  onChange={(e) => handleInputChange('service_visa', e.target.value)}
                />
                <span className="booking-input-unit">€</span>
              </div>
            </div>

            <div className="booking-input-group">
              <label className="booking-input-label">
                Cash Paid
                <span className="input-hint">Cash payment received</span>
              </label>
              <div className="booking-input-wrapper">
                <input
                  type="text"
                  className="booking-input"
                  placeholder="0.00"
                  value={values.cash_paid}
                  onChange={(e) => handleInputChange('cash_paid', e.target.value)}
                />
                <span className="booking-input-unit">€</span>
              </div>
            </div>

            <div className="booking-input-group">
              <label className="booking-input-label">
                Bank Transfer
                <span className="input-hint">Bank payment received</span>
              </label>
              <div className="booking-input-wrapper">
                <input
                  type="text"
                  className="booking-input"
                  placeholder="0.00"
                  value={values.bank_transfer}
                  onChange={(e) => handleInputChange('bank_transfer', e.target.value)}
                />
                <span className="booking-input-unit">€</span>
              </div>
            </div>

            <div className="booking-input-group">
              <label className="booking-input-label">
                Commission from Airlines
                <span className="input-hint">Airline commission</span>
              </label>
              <div className="booking-input-wrapper">
                <input
                  type="text"
                  className="booking-input"
                  placeholder="0.00"
                  value={values.commission_from_airlines}
                  onChange={(e) => handleInputChange('commission_from_airlines', e.target.value)}
                />
                <span className="booking-input-unit">€</span>
              </div>
            </div>

            <div className="booking-input-group">
              <label className="booking-input-label">
                LST Loan Fee
                <span className="input-hint">Loan/advance fee</span>
              </label>
              <div className="booking-input-wrapper">
                <input
                  type="text"
                  className="booking-input"
                  placeholder="0.00"
                  value={values.lst_loan_fee}
                  onChange={(e) => handleInputChange('lst_loan_fee', e.target.value)}
                />
                <span className="booking-input-unit">€</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="booking-actions">
            <button
              className="btn-reset-booking"
              onClick={handleReset}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              Reset All
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="booking-results-section">
          <h4 className="booking-section-title">Calculated Results</h4>

          <div className="booking-results-grid">
            {/* Total Ticket Price */}
            <div className="booking-result-card">
              <div className="booking-result-label">Total Ticket Price</div>
              <div className="booking-result-formula">Service Ticket + Airlines Price</div>
              <div className="booking-result-value">{formatCurrency(results.totalTicketPrice)}</div>
            </div>

            {/* Total Visa Fees */}
            <div className="booking-result-card">
              <div className="booking-result-label">Total Visa Fees</div>
              <div className="booking-result-formula">Visa Price + Service Visa</div>
              <div className="booking-result-value">{formatCurrency(results.totalVisaFees)}</div>
            </div>

            {/* Total Customer Payment */}
            <div className="booking-result-card">
              <div className="booking-result-label">Total Customer Payment</div>
              <div className="booking-result-formula">Cash Paid + Bank Transfer</div>
              <div className="booking-result-value">{formatCurrency(results.totalCustomerPayment)}</div>
            </div>

            {/* Total Amount Due */}
            <div className="booking-result-card highlight-blue">
              <div className="booking-result-label">Total Amount Due</div>
              <div className="booking-result-formula">Total Ticket Price + Total Visa Fees</div>
              <div className="booking-result-value">{formatCurrency(results.totalAmountDue)}</div>
            </div>

            {/* Payment Balance */}
            <div className={`booking-result-card highlight-${balanceColor}`}>
              <div className="booking-result-label">Payment Balance</div>
              <div className="booking-result-formula">Total Customer Payment - Total Amount Due</div>
              <div className="booking-result-value">
                {formatCurrency(results.paymentBalance)}
              </div>
              <div className="booking-balance-status">
                {balanceColor === 'positive' && '✓ Overpaid'}
                {balanceColor === 'negative' && '⚠ Underpaid'}
                {balanceColor === 'zero' && '✓ Paid in Full'}
              </div>
            </div>

            {/* LST Profit */}
            <div className="booking-result-card highlight-profit">
              <div className="booking-result-label">LST Profit</div>
              <div className="booking-result-formula">Service Ticket + Service Visa + Commission - Loan Fee</div>
              <div className="booking-result-value profit-value">{formatCurrency(results.lstProfit)}</div>
            </div>
          </div>

          {/* Export Button */}
          <div className="booking-export-section">
            <button
              className="btn-export-pdf"
              onClick={handleExportPDF}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Export as PDF
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
