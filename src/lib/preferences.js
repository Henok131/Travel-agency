import { getAppSetting, setAppSetting } from './appSettings'
import { supabase } from './supabaseClient'
import { APP_ID } from './appConfig'

export const DEFAULT_LANGUAGE = 'en'
export const DEFAULT_THEME = 'dark'
export const DEFAULT_VAT_FREQUENCY = 'quarterly'
export const DEFAULT_CALCULATOR_PREFS = {
  favorites: [],
  recentlyUsed: []
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return
  const nextTheme = theme || DEFAULT_THEME
  document.documentElement.className = nextTheme
  document.documentElement.setAttribute('data-theme', nextTheme)
}

export async function loadThemeAndLanguage() {
  const [language, theme] = await Promise.all([
    getAppSetting('language', DEFAULT_LANGUAGE),
    getAppSetting('theme', DEFAULT_THEME)
  ])

  return {
    language: language || DEFAULT_LANGUAGE,
    theme: theme || DEFAULT_THEME
  }
}

export async function persistLanguage(language) {
  const value = language || DEFAULT_LANGUAGE
  await setAppSetting('language', value)
  return value
}

export async function persistTheme(theme) {
  const value = theme || DEFAULT_THEME
  await setAppSetting('theme', value)
  applyTheme(value)
  return value
}

export async function loadVatFrequency() {
  const value = await getAppSetting('vat_filing_frequency', DEFAULT_VAT_FREQUENCY)
  return value || DEFAULT_VAT_FREQUENCY
}

export async function persistVatFrequency(frequency) {
  const value = frequency || DEFAULT_VAT_FREQUENCY
  await setAppSetting('vat_filing_frequency', value)
  return value
}

export async function loadCalculatorPreferences() {
  const [favorites, recentlyUsed] = await Promise.all([
    getAppSetting('calculator-favorites', DEFAULT_CALCULATOR_PREFS.favorites),
    getAppSetting('calculator-recently-used', DEFAULT_CALCULATOR_PREFS.recentlyUsed)
  ])

  return {
    favorites: Array.isArray(favorites) ? favorites : DEFAULT_CALCULATOR_PREFS.favorites,
    recentlyUsed: Array.isArray(recentlyUsed) ? recentlyUsed : DEFAULT_CALCULATOR_PREFS.recentlyUsed
  }
}

export async function persistCalculatorFavorites(favorites) {
  const value = Array.isArray(favorites) ? favorites : DEFAULT_CALCULATOR_PREFS.favorites
  await setAppSetting('calculator-favorites', value)
  return value
}

export async function persistCalculatorRecentlyUsed(recentlyUsed) {
  const value = Array.isArray(recentlyUsed) ? recentlyUsed : DEFAULT_CALCULATOR_PREFS.recentlyUsed
  await setAppSetting('calculator-recently-used', value)
  return value
}
/**
 * Load bank data from Supabase
 * Falls back to mock data if no real data exists
 */
export async function loadBankData(fallbackData) {
  try {
    const [account, invoiceSettings] = await Promise.all([
      fetchOrCreateAccount(fallbackData),
      fetchInvoiceSettings()
    ])
    if (!account) {
      console.warn('No bank account found, using mock data')
      return fallbackData
    }

    const { data: transactions, error: txError } = await supabase
      .from('bank_transactions')
      .select('id, transaction_date, description, amount, transaction_type, reference, currency')
      .eq('account_id', account.id)
      .order('transaction_date', { ascending: false })
      .limit(500)
    if (txError) throw txError

    const balance = (transactions || []).reduce((sum, t) => sum + Number(t.amount || 0), 0)
    const income = (transactions || []).filter(t => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount || 0), 0)
    const expense = Math.abs((transactions || []).filter(t => Number(t.amount) < 0).reduce((s, t) => s + Number(t.amount || 0), 0))
    const profit = income - expense

    await supabase
      .from('bank_accounts')
      .update({ balance, available_balance: balance, iban: invoiceSettings?.iban || account.iban, bank_name: invoiceSettings?.bank_name || account.bank_name })
      .eq('id', account.id)

    return {
      account: {
        id: account.id,
        bankName: invoiceSettings?.bank_name || account.bank_name || 'Primary Account',
        accountName: account.account_name || account.name || 'Primary Account',
        iban: invoiceSettings?.iban || account.iban || '—',
        balance,
        availableBalance: balance,
        currency: account.currency || 'EUR',
        income,
        expense,
        profit
      },
      transactions: (transactions || []).map(t => ({
        id: t.id,
        date: t.transaction_date,
        description: t.description,
        amount: Math.abs(Number(t.amount)),
        type: t.transaction_type,
        reference: t.reference,
        currency: t.currency || account.currency || 'EUR'
      }))
    }
  } catch (error) {
    console.error('Error loading bank data:', error)
    return fallbackData
  }
}

export async function persistBankData(data) {
  await setAppSetting('bank_data', data)
  return data
}

async function fetchOrCreateAccount(fallbackData) {
  const { data, error } = await supabase.from('bank_accounts').select('*').limit(1)
  if (error) {
    console.error('Failed to load bank account', error)
    return null
  }
  if (data && data[0]) return data[0]

  const seed = fallbackData?.account || {}
  const { data: inserted, error: insertError } = await supabase
    .from('bank_accounts')
    .insert({
      account_name: seed.accountName || 'Primary Account',
      bank_name: seed.bankName || 'Demo Bank',
      iban: seed.iban,
      currency: seed.currency || 'EUR',
      balance: seed.balance || 0,
      available_balance: seed.availableBalance || seed.balance || 0
    })
    .select()
    .single()
  if (insertError) {
    console.error('Failed to create bank account', insertError)
    return null
  }
  return inserted
}

async function fetchInvoiceSettings() {
  try {
    const setting = await getAppSetting('invoice_settings', null)
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ffa39e8e-4005-410b-ab09-927e51611360',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'preferences.js:fetchInvoiceSettings',message:'loaded invoice settings from app_settings',data:{hasSetting:Boolean(setting)},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{})
    // #endregion
    return setting
  } catch (err) {
    console.warn('Could not load invoice settings for bank details', err)
    return null
  }
}
