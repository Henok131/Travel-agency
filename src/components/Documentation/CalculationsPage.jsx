import { useState } from 'react'
import FormulaSection from './FormulaSection'
import BookingCalculator from './BookingCalculator'
import './CalculationsPage.css'

export default function CalculationsPage({ language = 'en' }) {
  const [expandedSections, setExpandedSections] = useState({})

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  // Formula configurations
  const formulas = [
    {
      id: 'total-ticket-price',
      title: 'Total Ticket Price',
      formula: '\\text{Total Ticket Price} = \\text{Airlines Price} + \\text{Service Ticket}',
      description: 'Calculates the total cost of a flight ticket by adding the base airline price and the service ticket charged by LST.',
      components: [
        { name: 'airlines_price', description: 'Base price charged by airlines (manual entry)' },
        { name: 'service_fee', description: 'Service ticket charged to customer (manual entry)' }
      ],
      example: `Airlines Price: €500.00
Service Ticket:   €50.00
─────────────────────
Total Ticket:  €550.00`,
      calculatorConfig: {
        inputs: [
          { id: 'airlines_price', label: 'Airlines Price', defaultValue: 500, unit: '€' },
          { id: 'service_fee', label: 'Service Ticket', defaultValue: 50, unit: '€' }
        ],
        calculate: (values) => {
          const airlines = parseFloat(values.airlines_price) || 0
          const service = parseFloat(values.service_fee) || 0
          return airlines + service
        },
        resultLabel: 'Total Ticket Price',
        resultUnit: '€',
        description: 'Sum of airlines price and service ticket'
      }
    },
    {
      id: 'total-visa-fees',
      title: 'Total Visa Fees',
      formula: '\\text{Total Visa Fees} = \\text{Visa Price} + \\text{Service Visa}',
      description: 'Calculates the total cost of visa processing by adding the base visa price and the visa service fee.',
      components: [
        { name: 'visa_price', description: 'Base visa price (manual entry)' },
        { name: 'service_visa', description: 'Service fee for visa processing (manual entry)' }
      ],
      example: `Visa Price:    €80.00
Service Visa:  €20.00
─────────────────────
Total Visa:    €100.00`,
      calculatorConfig: {
        inputs: [
          { id: 'visa_price', label: 'Visa Price', defaultValue: 80, unit: '€' },
          { id: 'service_visa', label: 'Service Visa', defaultValue: 20, unit: '€' }
        ],
        calculate: (values) => {
          const visa = parseFloat(values.visa_price) || 0
          const service = parseFloat(values.service_visa) || 0
          return visa + service
        },
        resultLabel: 'Total Visa Fees',
        resultUnit: '€',
        description: 'Sum of visa price and visa service fee'
      }
    },
    {
      id: 'total-customer-payment',
      title: 'Total Customer Payment',
      formula: '\\text{Total Customer Payment} = \\text{Cash Paid} + \\text{Bank Transfer}',
      description: 'Calculates the total amount paid by the customer by summing cash payments and bank transfers.',
      components: [
        { name: 'cash_paid', description: 'Amount paid in cash (manual entry)' },
        { name: 'bank_transfer', description: 'Amount paid via bank transfer (manual entry)' }
      ],
      example: `Cash Paid:        €200.00
Bank Transfer:    €450.00
─────────────────────────
Total Payment:    €650.00`,
      calculatorConfig: {
        inputs: [
          { id: 'cash_paid', label: 'Cash Paid', defaultValue: 200, unit: '€' },
          { id: 'bank_transfer', label: 'Bank Transfer', defaultValue: 450, unit: '€' }
        ],
        calculate: (values) => {
          const cash = parseFloat(values.cash_paid) || 0
          const bank = parseFloat(values.bank_transfer) || 0
          return cash + bank
        },
        resultLabel: 'Total Customer Payment',
        resultUnit: '€',
        description: 'Sum of all customer payments'
      }
    },
    {
      id: 'total-amount-due',
      title: 'Total Amount Due',
      formula: '\\text{Total Amount Due} = \\text{Total Ticket Price} + \\text{Total Visa Fees}',
      description: 'Calculates the total amount the customer owes by adding the ticket price and visa fees. This is highlighted in orange/yellow in the UI.',
      components: [
        { name: 'total_ticket_price', description: 'Sum of airlines price and service ticket' },
        { name: 'tot_visa_fees', description: 'Sum of visa price and service visa' }
      ],
      example: `Total Ticket Price: €550.00
Total Visa Fees:    €100.00
────────────────────────────
Total Amount Due:  €650.00`,
      calculatorConfig: {
        inputs: [
          { id: 'total_ticket_price', label: 'Total Ticket Price', defaultValue: 550, unit: '€' },
          { id: 'tot_visa_fees', label: 'Total Visa Fees', defaultValue: 100, unit: '€' }
        ],
        calculate: (values) => {
          const ticket = parseFloat(values.total_ticket_price) || 0
          const visa = parseFloat(values.tot_visa_fees) || 0
          return ticket + visa
        },
        resultLabel: 'Total Amount Due',
        resultUnit: '€',
        description: 'Total amount customer needs to pay'
      }
    },
    {
      id: 'payment-balance',
      title: 'Payment Balance',
      formula: '\\text{Payment Balance} = \\text{Total Customer Payment} - \\text{Total Amount Due}',
      description: 'Shows the payment status: positive (overpaid), zero (fully paid), or negative (customer owes). Color-coded: green (fully paid), red (owes), blue (overpaid).',
      components: [
        { name: 'total_customer_payment', description: 'Sum of cash and bank transfer payments' },
        { name: 'total_amount_due', description: 'Total amount customer needs to pay' }
      ],
      example: `Total Customer Payment: €650.00
Total Amount Due:        €650.00
────────────────────────────────
Payment Balance:         €0.00 ✅ Fully Paid`,
      calculatorConfig: {
        inputs: [
          { id: 'total_customer_payment', label: 'Total Customer Payment', defaultValue: 650, unit: '€' },
          { id: 'total_amount_due', label: 'Total Amount Due', defaultValue: 650, unit: '€' }
        ],
        calculate: (values) => {
          const payment = parseFloat(values.total_customer_payment) || 0
          const due = parseFloat(values.total_amount_due) || 0
          return payment - due
        },
        resultLabel: 'Payment Balance',
        resultUnit: '€',
        description: 'Difference between payment and amount due'
      }
    },
    {
      id: 'lst-profit',
      title: 'LST Profit',
      formula: '\\text{LST Profit} = \\text{Service Ticket} + \\text{Service Visa} + \\text{Commission} - \\text{Loan Fee}',
      description: 'Calculates the profit for LST by summing service ticket, service visa fees and commission, then subtracting any loan fees. Can be negative (loss) if loan fees exceed income.',
      components: [
        { name: 'service_fee', description: 'Service ticket income (positive)' },
        { name: 'service_visa', description: 'Visa service fee income (positive)' },
        { name: 'commission_from_airlines', description: 'Commission received (positive)' },
        { name: 'lst_loan_fee', description: 'Loan fee deduction (subtracted)' }
      ],
      example: `Service Ticket:            €50.00
Service Visa:           €20.00
Commission:             €30.00
──────────────────────────────
Total Income:           €100.00
Loan Fee:              -€10.00
──────────────────────────────
LST Profit:             €90.00 ✅ Profit`,
      calculatorConfig: {
        inputs: [
          { id: 'service_fee', label: 'Service Ticket', defaultValue: 50, unit: '€' },
          { id: 'service_visa', label: 'Service Visa', defaultValue: 20, unit: '€' },
          { id: 'commission_from_airlines', label: 'Commission from Airlines', defaultValue: 30, unit: '€' },
          { id: 'lst_loan_fee', label: 'LST Loan Fee', defaultValue: 10, unit: '€' }
        ],
        calculate: (values) => {
          const serviceFee = parseFloat(values.service_fee) || 0
          const serviceVisa = parseFloat(values.service_visa) || 0
          const commission = parseFloat(values.commission_from_airlines) || 0
          const loanFee = parseFloat(values.lst_loan_fee) || 0
          return serviceFee + serviceVisa + commission - loanFee
        },
        resultLabel: 'LST Profit',
        resultUnit: '€',
        description: 'Net profit after all fees and commissions'
      }
    }
  ]

  return (
    <div className="calculations-page">
      {/* Header */}
      <div className="calculations-page-header">
        <h2 className="calculations-page-title">
          {language === 'de' ? 'Finanzielle Berechnungen & Formeln' : 'Financial Calculations & Formulas'}
        </h2>
        <p className="calculations-page-description">
          {language === 'de' 
            ? 'Alle finanziellen Berechnungen werden in Echtzeit automatisch berechnet, während Sie Daten eingeben. Keine manuelle Berechnung erforderlich.'
            : 'All financial calculations are auto-calculated in real-time as you enter data. No manual calculation required.'}
        </p>
      </div>

      {/* Complete Booking Calculator */}
      <div className="calculations-complete-calculator">
        <h3 className="calculations-section-title">
          {language === 'de' ? 'Vollständiger Buchungsrechner' : 'Complete Booking Calculator'}
        </h3>
        <p className="calculations-section-description">
          {language === 'de'
            ? 'Berechnen Sie alle finanziellen Werte für eine Buchung auf einmal mit diesem interaktiven Rechner.'
            : 'Calculate all financial values for a booking at once with this interactive calculator.'}
        </p>
        <BookingCalculator />
      </div>

      {/* Individual Formula Sections */}
      <div className="calculations-formulas">
        <h3 className="calculations-section-title">
          {language === 'de' ? 'Einzelne Formeln' : 'Individual Formulas'}
        </h3>
        <p className="calculations-section-description">
          {language === 'de'
            ? 'Erfahren Sie mehr über jede Formel und testen Sie sie mit interaktiven Rechnern.'
            : 'Learn about each formula and test them with interactive calculators.'}
        </p>

        {formulas.map((formula, index) => (
          <FormulaSection
            key={formula.id}
            title={formula.title}
            formula={formula.formula}
            description={formula.description}
            components={formula.components}
            example={formula.example}
            calculatorConfig={formula.calculatorConfig}
            expanded={expandedSections[formula.id]}
          />
        ))}
      </div>
    </div>
  )
}
