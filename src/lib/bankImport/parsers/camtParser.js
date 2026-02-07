import { readFileAsText } from '../utils/fileUtils'

export async function parseCAMT(file) {
  const xmlString = await readFileAsText(file)
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlString, 'application/xml')
    const entries = Array.from(doc.getElementsByTagName('Ntry'))
    return entries.map(entry => mapEntry(entry)).filter(Boolean)
  } catch (error) {
    console.error('Failed to parse CAMT XML', error)
    throw new Error('Invalid CAMT XML file')
  }
}

function mapEntry(entry) {
  const amountNode = entry.getElementsByTagName('Amt')[0]
  if (!amountNode) return null

  const amount = parseFloat(amountNode.textContent || '0')
  const isCredit = (entry.getElementsByTagName('CdtDbtInd')[0]?.textContent || 'CRDT').toLowerCase().includes('cr')
  const signedAmount = isCredit ? Math.abs(amount) : -Math.abs(amount)

  const bookingDate = entry.getElementsByTagName('BookgDt')[0]?.textContent ||
    entry.getElementsByTagName('Dt')[0]?.textContent ||
    entry.getElementsByTagName('CreDtTm')[0]?.textContent

  const detailNode = entry.getElementsByTagName('NtryDtls')[0]
  const remittance = detailNode?.getElementsByTagName('Ustrd')[0]?.textContent ||
    detailNode?.getElementsByTagName('RmtInf')[0]?.textContent ||
    detailNode?.getElementsByTagName('AddtlTxInf')[0]?.textContent ||
    entry.getElementsByTagName('AddtlInf')[0]?.textContent ||
    'CAMT transaction'

  const reference = entry.getElementsByTagName('AcctSvcrRef')[0]?.textContent ||
    entry.getElementsByTagName('EndToEndId')[0]?.textContent ||
    null

  return {
    date: bookingDate,
    description: remittance,
    amount: signedAmount,
    type: isCredit ? 'credit' : 'debit',
    reference
  }
}
