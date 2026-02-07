import { supabase } from '@/lib/supabaseClient'
import { parseCSV } from './parsers/csvParser'
import { parsePDF } from './parsers/pdfParser'
import { parseMT940 } from './parsers/mt940Parser'
import { parseCAMT } from './parsers/camtParser'
import { parseImage } from './parsers/imageParser'
import { attachTransactionHashes, normalizeTransaction } from './utils/transactionUtils'
import { detectFileType } from './utils/fileUtils'

/**
 * Main import orchestrator
 * File → Detect format → Parse → Normalize → Dedupe → Insert → Recalc balance
 */
export async function importBankFile(file, accountIdOverride, options = {}) {
  const account = await ensureBankAccount(accountIdOverride)
  const fileType = await detectFileType(file)
  const rawRows = await parseFile(file, fileType, options)
  const normalizedRows = rawRows.map(row => normalizeTransaction(row, account.id))
  const rowsWithHashes = await attachTransactionHashes(normalizedRows)

  const { newRows, duplicates } = await deduplicateTransactions(rowsWithHashes, account.id)
  const insertResults = await insertTransactions(newRows)
  await refreshAccountBalance(account.id)

  return {
    success: true,
    fileType,
    stats: {
      total: rawRows.length,
      imported: insertResults.success.length,
      duplicates: duplicates.length,
      failed: insertResults.failed.length
    }
  }
}

async function ensureBankAccount(accountId) {
  const looksLikeUUID = typeof accountId === 'string' && /^[0-9a-fA-F-]{32,36}$/.test(accountId)
  if (looksLikeUUID) {
    const { data: existing, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('id', accountId)
      .single()
    if (!error && existing) return existing
  }

  const { data } = await supabase.from('bank_accounts').select('*').limit(1)
  if (data && data[0]) return data[0]
  const { data: inserted, error } = await supabase
    .from('bank_accounts')
    .insert({
      account_name: 'Primary Account',
      balance: 0,
      currency: 'EUR'
    })
    .select()
    .single()
  if (error) throw error
  return inserted
}

async function parseFile(file, fileType, options) {
  switch (fileType) {
    case 'csv':
      return parseCSV(file, options)
    case 'pdf':
      return parsePDF(file, options)
    case 'image':
      return parseImage(file)
    case 'mt940':
      return parseMT940(file)
    case 'camt':
      return parseCAMT(file)
    default:
      throw new Error('Unsupported file type. Use CSV, PDF, image, MT940/942, or CAMT XML.')
  }
}

async function deduplicateTransactions(rows, accountId) {
  if (rows.length === 0) return { newRows: [], duplicates: [] }

  const hashes = rows.map(r => r.transaction_hash)
  const { data: existing } = await supabase
    .from('bank_transactions')
    .select('transaction_hash')
    .eq('account_id', accountId)
    .in('transaction_hash', hashes)

  const existingHashes = new Set(existing?.map(t => t.transaction_hash) || [])
  const newRows = rows.filter(r => !existingHashes.has(r.transaction_hash))
  const duplicates = rows.filter(r => existingHashes.has(r.transaction_hash))
  return { newRows, duplicates }
}

async function insertTransactions(rows) {
  const success = []
  const failed = []
  const chunkSize = 500
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { data, error } = await supabase
      .from('bank_transactions')
      .insert(chunk)
      .select()
    if (error) {
      console.error('Batch insert error:', error)
      failed.push(...chunk)
    } else {
      success.push(...(data || []))
    }
  }
  return { success, failed }
}

async function refreshAccountBalance(accountId) {
  const { data, error } = await supabase
    .from('bank_transactions')
    .select('amount')
    .eq('account_id', accountId)
  if (error) {
    console.error('Failed to refresh balance', error)
    return
  }
  const balance = (data || []).reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const { error: updateError } = await supabase
    .from('bank_accounts')
    .update({ balance, available_balance: balance })
    .eq('id', accountId)
  if (updateError) {
    console.error('Failed to update bank_accounts balance', updateError)
  }
}
