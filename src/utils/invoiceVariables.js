// Invoice Variables Mapping
// Maps main_table fields to invoice template variables
// Used for customizable invoice generation

// Complete variable mapping from main_table
export const INVOICE_VARIABLES = {
  // Header Company Info (Static - will be customizable in template)
  '{{company_name}}': () => 'LST Travel Agency',
  '{{company_contact_person}}': () => 'Yodli Hagos Mebratu',
  '{{company_address}}': () => 'Düsseldorfer Straße 14',
  '{{company_postal}}': () => '60329 Frankfurt a/M',
  '{{company_email}}': () => 'info@lst-travel.de',
  '{{company_phone}}': () => '069/75848875',
  '{{company_mobile}}': () => '01602371650',
  
  // Invoice Info
  '{{invoice_number}}': (row) => generateInvoiceNumber(row),
  '{{invoice_date}}': () => formatDate(new Date(), 'de'),
  '{{booking_reference}}': 'booking_ref',
  '{{booking_id}}': 'id',
  
  // Passenger Information
  '{{passenger_full_name}}': (row) => {
    const parts = [row.first_name, row.middle_name, row.last_name].filter(Boolean)
    return parts.join(' ')
  },
  '{{first_name}}': 'first_name',
  '{{middle_name}}': 'middle_name',
  '{{last_name}}': 'last_name',
  '{{passport_number}}': 'passport_number',
  '{{date_of_birth}}': (row) => formatDate(row.date_of_birth, 'de'),
  '{{gender}}': 'gender',
  '{{nationality}}': 'nationality',
  
  // Flight Details
  '{{departure_date}}': (row) => formatDate(row.travel_date, 'de-long'),
  '{{departure_airport}}': 'departure_airport',
  '{{departure_city}}': (row) => extractCity(row.departure_airport),
  '{{return_date}}': (row) => formatDate(row.return_date, 'de-long'),
  '{{destination_airport}}': 'destination_airport',
  '{{return_airport}}': 'destination_airport', // Alias
  '{{destination_city}}': (row) => extractCity(row.destination_airport),
  '{{return_city}}': (row) => extractCity(row.destination_airport), // Alias
  '{{airlines}}': 'airlines',
  '{{airline}}': 'airlines',
  '{{pnr}}': 'booking_ref',
  '{{rfn}}': 'booking_ref',
  '{{booking_ref}}': 'booking_ref',
  
  // Financial Details
  '{{ticket_price}}': (row) => formatCurrency(row.total_ticket_price),
  '{{total_ticket_price}}': (row) => formatCurrency(row.total_ticket_price),
  '{{airlines_price}}': (row) => formatCurrency(row.airlines_price),
  '{{service_fee}}': (row) => formatCurrency(row.service_fee),
  '{{visa_fees}}': (row) => formatCurrency(row.tot_visa_fees),
  '{{tot_visa_fees}}': (row) => formatCurrency(row.tot_visa_fees),
  '{{visa_price}}': (row) => formatCurrency(row.visa_price),
  '{{service_visa}}': (row) => formatCurrency(row.service_visa),
  '{{hotel_charges}}': (row) => formatCurrency(row.hotel_charges || 0),
  '{{total_amount}}': (row) => formatCurrency(row.total_amount_due),
  '{{total_amount_due}}': (row) => formatCurrency(row.total_amount_due),
  '{{total_amount_number}}': 'total_amount_due', // For table calculations
  
  // Payment Details
  '{{payment_method}}': (row) => {
    const bankTransfer = parseFloat(row.bank_transfer || 0)
    const cashPaid = parseFloat(row.cash_paid || 0)
    
    if (bankTransfer > 0) {
      return 'BANKÜBERWEISUNG'
    }
    if (cashPaid > 0) {
      return 'BARZAHLUNG'
    }
    return 'BANKÜBERWEISUNG'
  },
  '{{cash_paid}}': (row) => formatCurrency(row.cash_paid || 0),
  '{{bank_transfer}}': (row) => formatCurrency(row.bank_transfer || 0),
  '{{total_customer_payment}}': (row) => {
    const cash = parseFloat(row.cash_paid || 0)
    const transfer = parseFloat(row.bank_transfer || 0)
    return formatCurrency(cash + transfer)
  },
  '{{payment_balance}}': (row) => {
    const total = parseFloat(row.total_amount_due || 0)
    const cash = parseFloat(row.cash_paid || 0)
    const transfer = parseFloat(row.bank_transfer || 0)
    const paid = cash + transfer
    const balance = total - paid
    return formatCurrency(balance)
  },
  '{{payment_status}}': (row) => {
    const total = parseFloat(row.total_amount_due || 0)
    const cash = parseFloat(row.cash_paid || 0)
    const transfer = parseFloat(row.bank_transfer || 0)
    const paid = cash + transfer
    if (paid >= total) return 'Bezahlt'
    return 'Ausstehend'
  },
  
  // LST Financial Details
  '{{lst_loan_fee}}': (row) => formatCurrency(row.lst_loan_fee || 0),
  '{{lst_profit}}': (row) => formatCurrency(row.lst_profit || 0),
  '{{commission_from_airlines}}': (row) => formatCurrency(row.commission_from_airlines || 0),
  
  // Bank Details (Static)
  '{{bank_name}}': () => 'Commerzbank AG',
  '{{bank_iban}}': () => 'IBAN DE28 5134 0013 0185 3597 00',
  '{{bank_bic}}': () => 'BIC: COBADEFFXXX',
  '{{bank_account_holder}}': () => 'Geschäftskonto',
  '{{tax_id}}': () => 'UST-ID DE300414297',
  '{{website}}': () => 'www.lst-travel.de',
  
  // Booking Status
  '{{booking_status}}': 'booking_status',
  '{{status}}': 'status',
  
  // Dates
  '{{created_at}}': (row) => formatDate(row.created_at, 'de'),
  '{{updated_at}}': (row) => formatDate(row.updated_at, 'de'),
  
  // Notice/Notes
  '{{notice}}': 'notice',
}

// Helper functions
function generateInvoiceNumber(booking) {
  if (!booking?.id || !booking?.created_at) {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `INV-${year}-${random}`
  }
  
  const date = new Date(booking.created_at)
  const year = date.getFullYear()
  // Use booking ID hash for deterministic invoice number
  const idHash = booking.id.replace(/-/g, '').substring(0, 4).toUpperCase()
  return `INV-${year}-${idHash}`
}

function formatDate(date, format = 'de') {
  if (!date) return ''
  
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    
    if (format === 'de') {
      return d.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      })
    }
    
    if (format === 'de-long') {
      const day = String(d.getDate()).padStart(2, '0')
      const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
                     'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
      const month = months[d.getMonth()]
      const year = String(d.getFullYear()).slice(-2)
      return `${day}. ${month} ${year}`
    }
    
    return d.toLocaleDateString('de-DE')
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined || amount === '') return '0,00'
  
  try {
    const num = parseFloat(amount)
    if (isNaN(num)) return '0,00'
    
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  } catch (error) {
    console.error('Error formatting currency:', error)
    return '0,00'
  }
}

function extractCity(airport) {
  // Extract city from airport code or full airport string
  // Examples: "FRA" -> "Frankfurt", "FRA, Frankfurt Airport" -> "Frankfurt"
  if (!airport) return ''
  
  const cityData = {
    'DXB': 'Dubai',
    'FRA': 'Frankfurt am Main',
    'ADD': 'Addis Ababa',
    'LHR': 'London',
    'JFK': 'New York',
    'DUB': 'Dublin',
    'SSK': 'Sturt Creek',
    'PED': 'Pardubice',
    'HHN': 'Hahn',
    'BER': 'Berlin'
  }
  
  // Check if it's just a code
  const code = airport.substring(0, 3).toUpperCase()
  if (cityData[code]) {
    return cityData[code]
  }
  
  // Try to extract from full string like "FRA, Frankfurt Airport, Frankfurt"
  const parts = airport.split(',')
  if (parts.length > 1) {
    // Usually the last part is the city
    return parts[parts.length - 1]?.trim() || airport
  }
  
  return airport
}

// Replace variables in HTML/template string
export function replaceInvoiceVariables(html, bookingData) {
  if (!html || !bookingData) return html || ''
  
  let result = html
  
  Object.entries(INVOICE_VARIABLES).forEach(([variable, fieldOrFunction]) => {
    let value = ''
    
    try {
      if (typeof fieldOrFunction === 'function') {
        value = fieldOrFunction(bookingData) || ''
      } else {
        value = bookingData[fieldOrFunction] || ''
      }
      
      // Escape special regex characters in variable
      const escapedVariable = variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      // Replace all occurrences
      result = result.replace(new RegExp(escapedVariable, 'g'), String(value))
    } catch (error) {
      console.error(`Error replacing variable ${variable}:`, error)
    }
  })
  
  return result
}

// Get all available variables (for template editor)
export function getAvailableVariables() {
  return Object.keys(INVOICE_VARIABLES).sort()
}

// Get variable description/help text
export function getVariableDescription(variable) {
  const descriptions = {
    '{{company_name}}': 'Company name',
    '{{company_contact_person}}': 'Contact person name',
    '{{company_address}}': 'Company street address',
    '{{company_postal}}': 'Postal code and city',
    '{{company_email}}': 'Company email address',
    '{{company_phone}}': 'Company phone number',
    '{{company_mobile}}': 'Company mobile number',
    '{{invoice_number}}': 'Auto-generated invoice number',
    '{{invoice_date}}': 'Current date',
    '{{booking_reference}}': 'Booking reference number',
    '{{passenger_full_name}}': 'Full passenger name (first + middle + last)',
    '{{first_name}}': 'Passenger first name',
    '{{middle_name}}': 'Passenger middle name',
    '{{last_name}}': 'Passenger last name',
    '{{passport_number}}': 'Passport number',
    '{{date_of_birth}}': 'Date of birth',
    '{{gender}}': 'Gender',
    '{{nationality}}': 'Nationality',
    '{{departure_date}}': 'Departure date (formatted)',
    '{{departure_airport}}': 'Departure airport code',
    '{{departure_city}}': 'Departure city name',
    '{{return_date}}': 'Return date (formatted)',
    '{{destination_airport}}': 'Destination airport code',
    '{{destination_city}}': 'Destination city name',
    '{{airlines}}': 'Airline name',
    '{{pnr}}': 'PNR/Booking reference',
    '{{ticket_price}}': 'Total ticket price (formatted)',
    '{{visa_fees}}': 'Total visa fees (formatted)',
    '{{total_amount}}': 'Total amount due (formatted)',
    '{{payment_method}}': 'Payment method (BANKÜBERWEISUNG/BARZAHLUNG)',
    '{{cash_paid}}': 'Cash payment amount (formatted)',
    '{{bank_transfer}}': 'Bank transfer amount (formatted)',
    '{{payment_balance}}': 'Remaining payment balance',
    '{{payment_status}}': 'Payment status (Bezahlt/Ausstehend)',
    '{{bank_name}}': 'Bank name',
    '{{bank_iban}}': 'Bank IBAN',
    '{{bank_bic}}': 'Bank BIC',
    '{{tax_id}}': 'Tax ID number',
  }
  
  return descriptions[variable] || 'No description available'
}
