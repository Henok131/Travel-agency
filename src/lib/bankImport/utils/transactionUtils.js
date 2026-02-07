
// Browser-compatible SHA-256 hash
export function normalizeTransaction(rawRow, accountId) {
  const isoDate = toISODate(rawRow.date || rawRow.transactionDate || rawRow.bookingDate)
  const description = sanitizeText(
    rawRow.description ||
    rawRow.details ||
    rawRow.remittance ||
    rawRow.reference ||
    'Unknown transaction'
  )
  const numericAmount = Number(rawRow.amount || 0)
  const explicitType = rawRow.type ? rawRow.type.toString().toLowerCase() : null
  const type = explicitType || (numericAmount >= 0 ? 'credit' : 'debit')
  const signedAmount = type === 'debit' ? -Math.abs(numericAmount) : Math.abs(numericAmount)

  return {
    account_id: accountId,
    transaction_date: isoDate,
    description,
    amount: Number.isFinite(signedAmount) ? signedAmount : 0,
    transaction_type: type,
    reference: rawRow.reference || rawRow.endToEndId || null,
    currency: rawRow.currency || 'EUR'
  }
}

export async function computeTransactionHash(row) {
  const hashInput = [
    row.transaction_date || row.date,
    Number(row.amount || 0).toFixed(2),
    (row.description || '').trim().toLowerCase(),
    (row.transaction_type || row.type || '').toLowerCase()
  ].join('|')
  const encoder = new TextEncoder()
  const data = encoder.encode(hashInput)
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function attachTransactionHashes(rows) {
  const results = []
  for (const row of rows) {
    const hash = await computeTransactionHash(row)
    results.push({ ...row, transaction_hash: hash })
  }
  return results
}

export function toISODate(dateString) {
  if (!dateString) throw new Error('Missing transaction date')

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString

  const normalized = dateString.toString().trim()
  const dotFormat = normalized.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (dotFormat) return `${dotFormat[3]}-${dotFormat[2]}-${dotFormat[1]}`

  const slashFormat = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (slashFormat) return `${slashFormat[3]}-${slashFormat[1]}-${slashFormat[2]}`

  const yymmdd = normalized.match(/^(\d{2})(\d{2})(\d{2})$/)
  if (yymmdd) {
    const year = Number(yymmdd[1])
    const fullYear = year >= 70 ? 1900 + year : 2000 + year
    return `${fullYear}-${yymmdd[2]}-${yymmdd[3]}`
  }

  const parsed = new Date(normalized)
  if (!isNaN(parsed.getTime())) {
    const month = `${parsed.getUTCMonth() + 1}`.padStart(2, '0')
    const day = `${parsed.getUTCDate()}`.padStart(2, '0')
    return `${parsed.getUTCFullYear()}-${month}-${day}`
  }

  throw new Error(`Invalid date format: ${dateString}`)
}

function sanitizeText(text) {
  return text?.toString().trim().replace(/\s+/g, ' ').replace(/[^\x20-\x7E]/g, '') || ''
}
