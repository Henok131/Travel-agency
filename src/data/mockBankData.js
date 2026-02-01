// Mock Bank Data for Demo Mode
// This file contains static demo data representing bank account and transactions
// DO NOT use in production - replace with real API integration

export const mockBankAccount = {
  id: 'demo-account-1',
  accountName: 'LST Travel Business Account',
  accountNumber: '****1234',
  iban: 'DE89 3704 0044 0532 0130 00',
  bankName: 'Commerzbank AG',
  currency: 'EUR',
  balance: 45230.75,
  availableBalance: 45230.75,
  lastUpdated: '2026-01-19T10:30:00Z'
}

export const mockTransactions = [
  // Income transactions (positive amounts)
  {
    id: 'txn-001',
    date: '2026-01-19',
    description: 'Customer Payment - Booking #BK-2026-001',
    amount: 1250.00,
    type: 'credit',
    category: 'Customer Payment',
    reference: 'BK-2026-001',
    balanceAfter: 45230.75
  },
  {
    id: 'txn-002',
    date: '2026-01-18',
    description: 'Customer Payment - Booking #BK-2026-045',
    amount: 890.50,
    type: 'credit',
    category: 'Customer Payment',
    reference: 'BK-2026-045',
    balanceAfter: 43980.75
  },
  {
    id: 'txn-003',
    date: '2026-01-17',
    description: 'Customer Payment - Booking #BK-2026-032',
    amount: 2100.00,
    type: 'credit',
    category: 'Customer Payment',
    reference: 'BK-2026-032',
    balanceAfter: 43090.25
  },
  {
    id: 'txn-004',
    date: '2026-01-16',
    description: 'Customer Payment - Booking #BK-2026-028',
    amount: 675.25,
    type: 'credit',
    category: 'Customer Payment',
    reference: 'BK-2026-028',
    balanceAfter: 40990.25
  },
  {
    id: 'txn-005',
    date: '2026-01-15',
    description: 'Customer Payment - Booking #BK-2026-012',
    amount: 1450.00,
    type: 'credit',
    category: 'Customer Payment',
    reference: 'BK-2026-012',
    balanceAfter: 40315.00
  },
  // Expense transactions (negative amounts)
  {
    id: 'txn-006',
    date: '2026-01-19',
    description: 'Airlines Payment - Lufthansa',
    amount: -850.00,
    type: 'debit',
    category: 'Airlines Payment',
    reference: 'LH-2026-001',
    balanceAfter: 45230.75
  },
  {
    id: 'txn-007',
    date: '2026-01-18',
    description: 'Office Rent - January 2026',
    amount: -1200.00,
    type: 'debit',
    category: 'Rent',
    reference: 'RENT-2026-01',
    balanceAfter: 43980.75
  },
  {
    id: 'txn-008',
    date: '2026-01-17',
    description: 'Visa Processing Fee',
    amount: -150.00,
    type: 'debit',
    category: 'Service Fee',
    reference: 'VISA-FEE-001',
    balanceAfter: 43090.25
  },
  {
    id: 'txn-009',
    date: '2026-01-16',
    description: 'Airlines Payment - Turkish Airlines',
    amount: -650.00,
    type: 'debit',
    category: 'Airlines Payment',
    reference: 'TK-2026-002',
    balanceAfter: 40990.25
  },
  {
    id: 'txn-010',
    date: '2026-01-15',
    description: 'Utilities - Electricity & Internet',
    amount: -285.50,
    type: 'debit',
    category: 'Utilities',
    reference: 'UTIL-2026-01',
    balanceAfter: 40315.00
  },
  {
    id: 'txn-011',
    date: '2026-01-14',
    description: 'Customer Payment - Booking #BK-2026-019',
    amount: 980.00,
    type: 'credit',
    category: 'Customer Payment',
    reference: 'BK-2026-019',
    balanceAfter: 40600.50
  },
  {
    id: 'txn-012',
    date: '2026-01-13',
    description: 'Marketing Expenses - Online Ads',
    amount: -450.00,
    type: 'debit',
    category: 'Marketing',
    reference: 'MKT-2026-001',
    balanceAfter: 39620.50
  },
  {
    id: 'txn-013',
    date: '2026-01-12',
    description: 'Customer Payment - Booking #BK-2026-007',
    amount: 1120.00,
    type: 'credit',
    category: 'Customer Payment',
    reference: 'BK-2026-007',
    balanceAfter: 40070.50
  },
  {
    id: 'txn-014',
    date: '2026-01-11',
    description: 'Airlines Payment - Emirates',
    amount: -950.00,
    type: 'debit',
    category: 'Airlines Payment',
    reference: 'EK-2026-003',
    balanceAfter: 38950.50
  },
  {
    id: 'txn-015',
    date: '2026-01-10',
    description: 'Customer Payment - Booking #BK-2026-041',
    amount: 750.00,
    type: 'credit',
    category: 'Customer Payment',
    reference: 'BK-2026-041',
    balanceAfter: 39900.50
  }
]

// Calculate summary statistics
export const calculateCashflow = (transactions) => {
  const income = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const expenses = Math.abs(transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0))
  
  const net = income - expenses
  
  return {
    income,
    expenses,
    net,
    transactionCount: transactions.length
  }
}
