import { useState } from 'react'
import { BlockMath } from 'react-katex'
import { motion, AnimatePresence } from 'framer-motion'
import FormulaCalculator from './FormulaCalculator'
import VATCalculator from './VATCalculator'
import BookingCalculator from './BookingCalculator'
import 'katex/dist/katex.min.css'
import './FinancialFormulas.css'

const FORMULAS = [
  {
    id: 'total-ticket-price',
    title: 'Total Ticket Price',
    formula: '\\text{Total Ticket Price} = \\text{Airlines Price} + \\text{Service Ticket}',
    description: {
      what: 'Calculates the total price a customer pays for a flight ticket, including the base airline price and LST service ticket.',
      when: 'Used when creating or updating a booking to determine the total ticket cost.',
      components: [
        'Airlines Price: Base price charged by airlines (manual entry)',
        'Service Ticket: Service ticket charged to customer (manual entry)'
      ]
    },
    calculator: {
      inputs: [
        { id: 'airlines_price', label: 'Airlines Price', defaultValue: 500, unit: '€' },
        { id: 'service_fee', label: 'Service Ticket', defaultValue: 50, unit: '€' }
      ],
      calculate: (values) => {
        const airlinesPrice = parseFloat(values.airlines_price) || 0
        const serviceFee = parseFloat(values.service_fee) || 0
        return airlinesPrice + serviceFee
      },
      resultLabel: 'Total Ticket Price',
      resultUnit: '€'
    },
    example: {
      airlines_price: 500,
      service_fee: 50,
      result: 550
    }
  },
  {
    id: 'total-visa-fees',
    title: 'Total Visa Fees',
    formula: '\\text{Total Visa Fees} = \\text{Visa Price} + \\text{Service Visa}',
    description: {
      what: 'Calculates the total cost for visa processing, including the base visa application fee and LST visa processing service fee.',
      when: 'Used when a customer requires visa services along with their booking.',
      components: [
        'Visa Price: Base visa price (manual entry)',
        'Service Visa: Service fee for visa processing (manual entry)'
      ]
    },
    calculator: {
      inputs: [
        { id: 'visa_price', label: 'Visa Price', defaultValue: 80, unit: '€' },
        { id: 'service_visa', label: 'Service Visa', defaultValue: 20, unit: '€' }
      ],
      calculate: (values) => {
        const visaPrice = parseFloat(values.visa_price) || 0
        const serviceVisa = parseFloat(values.service_visa) || 0
        return visaPrice + serviceVisa
      },
      resultLabel: 'Total Visa Fees',
      resultUnit: '€'
    },
    example: {
      visa_price: 80,
      service_visa: 20,
      result: 100
    }
  },
  {
    id: 'total-customer-payment',
    title: 'Total Customer Payment',
    formula: '\\text{Total Customer Payment} = \\text{Cash Paid} + \\text{Bank Transfer}',
    description: {
      what: 'Sums all payments received from the customer, whether paid in cash or via bank transfer.',
      when: 'Used to track total payments received and calculate payment balance.',
      components: [
        'Cash Paid: Amount paid in cash (manual entry)',
        'Bank Transfer: Amount paid via bank transfer (manual entry)'
      ]
    },
    calculator: {
      inputs: [
        { id: 'cash_paid', label: 'Cash Paid', defaultValue: 200, unit: '€' },
        { id: 'bank_transfer', label: 'Bank Transfer', defaultValue: 450, unit: '€' }
      ],
      calculate: (values) => {
        const cashPaid = parseFloat(values.cash_paid) || 0
        const bankTransfer = parseFloat(values.bank_transfer) || 0
        return cashPaid + bankTransfer
      },
      resultLabel: 'Total Customer Payment',
      resultUnit: '€'
    },
    example: {
      cash_paid: 200,
      bank_transfer: 450,
      result: 650
    }
  },
  {
    id: 'total-amount-due',
    title: 'Total Amount Due',
    formula: '\\text{Total Amount Due} = \\text{Total Ticket Price} + \\text{Total Visa Fees}',
    description: {
      what: 'Calculates the total amount the customer owes, combining ticket and visa costs. This is the key field highlighted in orange/yellow in the UI.',
      when: 'Used to determine how much the customer needs to pay in total.',
      components: [
        'Total Ticket Price: Sum of airlines price and service ticket',
        'Total Visa Fees: Sum of visa price and service visa'
      ]
    },
    calculator: {
      inputs: [
        { id: 'total_ticket_price', label: 'Total Ticket Price', defaultValue: 550, unit: '€' },
        { id: 'total_visa_fees', label: 'Total Visa Fees', defaultValue: 100, unit: '€' }
      ],
      calculate: (values) => {
        const ticketPrice = parseFloat(values.total_ticket_price) || 0
        const visaFees = parseFloat(values.total_visa_fees) || 0
        return ticketPrice + visaFees
      },
      resultLabel: 'Total Amount Due',
      resultUnit: '€'
    },
    example: {
      total_ticket_price: 550,
      total_visa_fees: 100,
      result: 650
    }
  },
  {
    id: 'payment-balance',
    title: 'Payment Balance',
    formula: '\\text{Payment Balance} = \\text{Total Customer Payment} - \\text{Total Amount Due}',
    description: {
      what: 'Shows the difference between what the customer has paid and what they owe. Color-coded: green (fully paid), red (owes money), blue (overpaid).',
      when: 'Used to quickly identify payment status at a glance.',
      components: [
        'Total Customer Payment: Sum of cash and bank transfer payments',
        'Total Amount Due: Sum of ticket and visa costs'
      ]
    },
    calculator: {
      inputs: [
        { id: 'total_customer_payment', label: 'Total Customer Payment', defaultValue: 650, unit: '€' },
        { id: 'total_amount_due', label: 'Total Amount Due', defaultValue: 650, unit: '€' }
      ],
      calculate: (values) => {
        const customerPayment = parseFloat(values.total_customer_payment) || 0
        const amountDue = parseFloat(values.total_amount_due) || 0
        return customerPayment - amountDue
      },
      resultLabel: 'Payment Balance',
      resultUnit: '€'
    },
    example: {
      total_customer_payment: 650,
      total_amount_due: 650,
      result: 0
    }
  },
  {
    id: 'lst-profit',
    title: 'LST Profit',
    formula: '\\text{LST Profit} = \\text{Service Ticket} + \\text{Service Visa} + \\text{Commission} - \\text{Loan Fee}',
    description: {
      what: 'Calculates LST\'s profit from a booking, including service ticket, service visa fees and commissions minus any loan fees.',
      when: 'Used for financial reporting and profit analysis.',
      components: [
        'Service Ticket: Service ticket charged to customer',
        'Service Visa: Visa processing service fee',
        'Commission: Commission received from airlines',
        'Loan Fee: Any loan or advance fees deducted'
      ]
    },
    calculator: {
      inputs: [
        { id: 'service_fee', label: 'Service Ticket', defaultValue: 50, unit: '€' },
        { id: 'service_visa', label: 'Service Visa', defaultValue: 20, unit: '€' },
        { id: 'commission', label: 'Commission from Airlines', defaultValue: 25, unit: '€' },
        { id: 'loan_fee', label: 'LST Loan Fee', defaultValue: 0, unit: '€' }
      ],
      calculate: (values) => {
        const serviceFee = parseFloat(values.service_fee) || 0
        const serviceVisa = parseFloat(values.service_visa) || 0
        const commission = parseFloat(values.commission) || 0
        const loanFee = parseFloat(values.loan_fee) || 0
        return serviceFee + serviceVisa + commission - loanFee
      },
      resultLabel: 'LST Profit',
      resultUnit: '€'
    },
    example: {
      service_fee: 50,
      service_visa: 20,
      commission: 25,
      loan_fee: 0,
      result: 95
    }
  }
]

export default function FinancialFormulas({ language = 'en' }) {
  const [expandedFormula, setExpandedFormula] = useState(null)

  const toggleExpand = (formulaId) => {
    setExpandedFormula(expandedFormula === formulaId ? null : formulaId)
  }

  return (
    <div className="financial-formulas-container">
      {/* Header */}
      <div className="financial-formulas-header">
        <h2 className="financial-formulas-title">Financial Calculations & Formulas</h2>
        <p className="financial-formulas-subtitle">
          All formulas are auto-calculated in real-time as you enter data. No manual calculation required.
        </p>
      </div>

      {/* Complete Booking Calculator */}
      <div className="complete-calculator-section">
        <h3 className="section-title">Complete Booking Calculator</h3>
        <p className="section-description">
          Calculate all financial values for a booking in one place with real-time updates.
        </p>
        <BookingCalculator />
      </div>

      {/* Individual Formula Cards */}
      <div className="formulas-list">
        {FORMULAS.map((formula, index) => (
          <motion.div
            key={formula.id}
            className="formula-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {/* Title */}
            <div className="formula-card-header">
              <h3 className="formula-title">{formula.title}</h3>
            </div>

            {/* KaTeX Formula Display - Center */}
            <div className="formula-katex-display">
              <BlockMath math={formula.formula} />
            </div>

            {/* Two Column Layout */}
            <div className="formula-content-grid">
              {/* Left: Description */}
              <div className="formula-description-section">
                <div className="description-block">
                  <h4 className="description-title">What it does:</h4>
                  <p className="description-text">{formula.description.what}</p>
                </div>

                <div className="description-block">
                  <h4 className="description-title">When to use:</h4>
                  <p className="description-text">{formula.description.when}</p>
                </div>

                <div className="description-block">
                  <h4 className="description-title">Components:</h4>
                  <ul className="components-list">
                    {formula.description.components.map((component, idx) => (
                      <li key={idx}>{component}</li>
                    ))}
                  </ul>
                </div>

                {/* Example */}
                <div className="description-block example-block">
                  <h4 className="description-title">Example:</h4>
                  <div className="example-calculation">
                    {Object.entries(formula.example)
                      .filter(([key]) => key !== 'result')
                      .map(([key, value]) => (
                        <div key={key} className="example-line">
                          <span className="example-label">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
                          <span className="example-value">€{value.toFixed(2)}</span>
                        </div>
                      ))}
                    <div className="example-divider"></div>
                    <div className="example-line result-line">
                      <span className="example-label">Result:</span>
                      <span className="example-value result-value">€{formula.example.result.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Collapsible Detailed Explanation */}
                <button
                  className="expand-details-btn"
                  onClick={() => toggleExpand(formula.id)}
                >
                  <span>{expandedFormula === formula.id ? '▼' : '▶'}</span>
                  <span>Detailed Explanation</span>
                </button>

                <AnimatePresence>
                  {expandedFormula === formula.id && (
                    <motion.div
                      className="detailed-explanation"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="explanation-content">
                        <p><strong>Calculation Logic:</strong></p>
                        <ul>
                          <li>✅ Real-time calculation during editing</li>
                          <li>✅ Auto-saves to database when components change</li>
                          <li>✅ Displays with 2 decimal places</li>
                          <li>✅ Shows `-` if result = 0</li>
                        </ul>
                        <p><strong>Real-World Scenario:</strong></p>
                        <p className="scenario-text">
                          {formula.id === 'total-ticket-price' && 'Customer books a flight from Frankfurt to London. Airlines charges €500.00, LST service ticket €50.00. Total ticket price: €550.00'}
                          {formula.id === 'total-visa-fees' && 'Customer needs a UK visa. Visa application fee €80.00, LST visa processing service fee €20.00. Total visa fees: €100.00'}
                          {formula.id === 'total-customer-payment' && 'Customer pays partially in cash (€200.00) and remaining via bank transfer (€450.00). Total customer payment: €650.00'}
                          {formula.id === 'total-amount-due' && 'Customer books flight (€550.00) + visa (€100.00). Total amount due: €650.00'}
                          {formula.id === 'payment-balance' && 'Customer paid €650.00, total amount due €650.00. Payment balance: €0.00 (Fully Paid ✅)'}
                          {formula.id === 'lst-profit' && 'Service ticket €50.00 + Service visa €20.00 + Commission €25.00 - Loan fee €0.00. LST profit: €95.00'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right: Interactive Calculator */}
              <div className="formula-calculator-section">
                <FormulaCalculator
                  title={null}
                  formula={formula.formula}
                  inputs={formula.calculator.inputs}
                  calculate={formula.calculator.calculate}
                  resultLabel={formula.calculator.resultLabel}
                  resultUnit={formula.calculator.resultUnit}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* VAT Calculator Section */}
      <div className="vat-calculator-section">
        <h3 className="section-title">VAT Calculation</h3>
        <p className="section-description">
          Calculate VAT from gross amount (including VAT) or net amount (excluding VAT) with preset rates or custom rates.
        </p>
        <VATCalculator />
      </div>
    </div>
  )
}
