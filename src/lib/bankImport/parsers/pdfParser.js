

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// Use bundled worker via Vite URL (avoids resolution and CDN issues)
GlobalWorkerOptions.workerSrc = workerSrc

export async function parsePDF(file) {
  const text = await extractTextFromPdf(file)
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const transactions = []
  for (const line of lines) {
    const parsed = parseLine(line)
    if (parsed) transactions.push(parsed)
  }
  if (transactions.length === 0) {
    throw new Error('Unsupported PDF format (text-based PDF required).')
  }
  return transactions
}

async function extractTextFromPdf(file) {
  try {
    const buffer = await file.arrayBuffer()
    const pdf = await getDocument({ data: buffer }).promise
    let textContent = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      textContent += content.items.map(item => item.str).join(' ') + '\n'
    }
    return textContent
  } catch (error) {
    console.warn('PDF text extraction failed:', error)
    return ''
  }
}

function parseLine(line) {
  // DATE DESCRIPTION AMOUNT [CURRENCY]
  const pattern = /^(\d{2}\.\d{2}\.\d{4})\s+(.+?)\s+([-+]?\d+[.,]\d{2})(?:\s+([A-Z]{3}))?$/
  const match = line.match(pattern)
  if (!match) return null
  const [, dateStr, desc, amtRaw, currency] = match
  const amount = parseFloat(amtRaw.replace(',', '.'))
  if (!Number.isFinite(amount)) return null
  const isoDate = toISO(dateStr)
  if (!isoDate) return null
  return {
    date: isoDate,
    description: desc.trim(),
    amount,
    type: amount >= 0 ? 'credit' : 'debit',
    currency: currency || 'EUR'
  }
}

function toISO(ddmmyyyy) {
  const parts = ddmmyyyy.split('.')
  if (parts.length !== 3) return null
  const [dd, mm, yyyy] = parts
  if (!dd || !mm || !yyyy) return null
  return `${yyyy}-${mm}-${dd}`
}
