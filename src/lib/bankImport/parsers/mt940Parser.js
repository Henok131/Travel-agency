import { readFileAsText } from '../utils/fileUtils'

export async function parseMT940(file) {
  const content = await readFileAsText(file)
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const transactions = []
  let currentTx = null

  const flush = () => {
    if (currentTx) {
      if (currentTx.descriptionBuffer?.length) {
        currentTx.description = currentTx.descriptionBuffer.join(' ').trim()
      }
      delete currentTx.descriptionBuffer
      transactions.push(currentTx)
      currentTx = null
    }
  }

  for (const line of lines) {
    if (line.startsWith(':61:')) {
      flush()
      const parsed = parse61Line(line)
      currentTx = parsed ? { ...parsed, descriptionBuffer: [] } : null
    } else if (line.startsWith(':86:')) {
      if (currentTx) {
        currentTx.descriptionBuffer.push(line.replace(':86:', '').trim())
      }
    } else if (currentTx && line && !line.startsWith(':')) {
      currentTx.descriptionBuffer.push(line.trim())
    }
  }

  flush()
  return transactions
}

function parse61Line(line) {
  // Example :61:2401020102D123,45NTRFNONREF
  const regex = /^:61:(\d{6})(?:\d{4})?([CD])([0-9,]+)([A-Z]{0,3})?(.*)$/i
  const match = line.match(regex)
  if (!match) return null
  const [, yymmdd, creditDebit, amountStr,, rest] = match
  const amount = parseAmount(amountStr, creditDebit)
  const description = rest?.trim() || ''
  return {
    date: convertYYMMDDToISO(yymmdd),
    amount,
    type: amount >= 0 ? 'credit' : 'debit',
    description: description || 'MT940 transaction'
  }
}

function parseAmount(value, indicator) {
  const normalized = value.replace(',', '.')
  const numeric = parseFloat(normalized)
  if (!Number.isFinite(numeric)) return 0
  const sign = indicator?.toUpperCase() === 'C' ? 1 : -1
  return sign * Math.abs(numeric)
}

function convertYYMMDDToISO(yymmdd) {
  const yy = Number(yymmdd.slice(0, 2))
  const mm = yymmdd.slice(2, 4)
  const dd = yymmdd.slice(4, 6)
  const fullYear = yy >= 70 ? 1900 + yy : 2000 + yy
  return `${fullYear}-${mm}-${dd}`
}
