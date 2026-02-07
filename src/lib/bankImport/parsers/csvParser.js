import Papa from 'papaparse'

export async function parseCSV(file, options = {}) {
  const text = await file.text()
  // Detect Commerzbank semicolon format by header keyword
  const looksLikeCommerzbank = text.toLowerCase().includes('buchungstag;') || text.split(';').length > 3
  if (looksLikeCommerzbank) {
    return parseCommerzbankCSV(text)
  }

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data
            .filter(Boolean)
            .map(row => mapCSVRow(row, options))
          resolve(rows)
        } catch (error) {
          reject(error)
        }
      },
      error: (error) => reject(error)
    })
  })
}

function parseCommerzbankCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  // Skip header if present
  const dataLines = lines.filter(l => !l.toLowerCase().startsWith('buchungstag'))
  const transactions = []

  for (const line of dataLines) {
    const cols = line.split(';')
    if (cols.length < 6) continue
    const dateStr = cols[0].trim() // DD.MM.YYYY
    const descriptionRaw = (cols[3] || '').trim()
    const amountRaw = (cols[4] || '').trim()
    const currency = (cols[5] || 'EUR').trim() || 'EUR'

    const date = toISO(dateStr)
    if (!date) continue

    const amount = parseGermanAmount(amountRaw)
    if (!Number.isFinite(amount) || amount === 0) continue

    transactions.push({
      date,
      description: descriptionRaw.slice(0, 120),
      amount,
      type: amount >= 0 ? 'credit' : 'debit',
      currency
    })
  }

  return transactions
}

function mapCSVRow(row, options) {
  const columnMap = options.columnMap || autoDetectColumns(Object.keys(row))
  const amount = parseAmount(row[columnMap.amount], row[columnMap.creditDebit])
  const type = amount >= 0 ? 'credit' : 'debit'
  return {
    date: row[columnMap.date],
    description: row[columnMap.description],
    amount,
    type,
    reference: row[columnMap.reference] || null,
    currency: row[columnMap.currency] || 'EUR'
  }
}

function autoDetectColumns(headers) {
  const normalized = headers.map(h => h?.toString().trim())
  const map = {}
  const datePatterns = ['date', 'datum', 'transaction date', 'booking date', 'buchungsdatum']
  map.date = normalized.find(h => datePatterns.some(p => h?.toLowerCase().includes(p)))
  const descPatterns = ['description', 'beschreibung', 'purpose', 'verwendungszweck', 'details']
  map.description = normalized.find(h => descPatterns.some(p => h?.toLowerCase().includes(p)))
  const amountPatterns = ['amount', 'betrag', 'value', 'wert']
  map.amount = normalized.find(h => amountPatterns.some(p => h?.toLowerCase().includes(p)))
  const typePatterns = ['type', 'typ', 'credit/debit', 'soll/haben', 'credit debit']
  map.creditDebit = normalized.find(h => typePatterns.some(p => h?.toLowerCase().includes(p)))
  const refPatterns = ['reference', 'referenz', 'transaction id', 'transaktionsnummer']
  map.reference = normalized.find(h => refPatterns.some(p => h?.toLowerCase().includes(p)))
  const currencyPatterns = ['currency', 'währung', 'ccy']
  map.currency = normalized.find(h => currencyPatterns.some(p => h?.toLowerCase().includes(p)))
  if (!map.date || !map.description || !map.amount) {
    throw new Error('Could not auto-detect required columns. Please provide column mapping.')
  }
  return map
}

function parseAmount(amountStr, creditDebitIndicator) {
  if (!amountStr && amountStr !== 0) return 0
  let cleaned = amountStr.toString().trim()
  if (cleaned.match(/\d+\.\d{3},\d{2}/)) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  } else if (cleaned.match(/\d+,\d{3}\.\d{2}/)) {
    cleaned = cleaned.replace(/,/g, '')
  } else if (cleaned.includes(',') && !cleaned.includes('.')) {
    cleaned = cleaned.replace(',', '.')
  }
  cleaned = cleaned.replace(/[^\d.-]/g, '')
  let amount = parseFloat(cleaned)
  if (!Number.isFinite(amount)) amount = 0

  if (creditDebitIndicator) {
    const indicator = creditDebitIndicator.toString().toLowerCase()
    if (indicator.includes('debit') || indicator.includes('soll') || indicator === 's' || indicator === 'dbit') {
      amount = -Math.abs(amount)
    } else if (indicator.includes('credit') || indicator.includes('haben') || indicator === 'h' || indicator === 'crdt') {
      amount = Math.abs(amount)
    }
  }
  return amount
}

function parseGermanAmount(value) {
  if (!value) return NaN
  let v = value.toString().trim()
  // remove thousands separators, normalize decimal comma
  v = v.replace(/\./g, '').replace(',', '.')
  v = v.replace(/[^\d.-]/g, '')
  const num = parseFloat(v)
  return Number.isFinite(num) ? num : NaN
}

function toISO(ddmmyyyy) {
  const parts = ddmmyyyy.split('.')
  if (parts.length !== 3) return null
  const [dd, mm, yyyy] = parts
  if (!dd || !mm || !yyyy) return null
  return `${yyyy}-${mm}-${dd}`
}
