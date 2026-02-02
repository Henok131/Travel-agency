import { getAppSetting, setAppSetting } from './appSettings'

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

export async function loadBankData(defaultValue) {
  const stored = await getAppSetting('bank_data', defaultValue)
  if (!stored && defaultValue) {
    await setAppSetting('bank_data', defaultValue)
    return defaultValue
  }
  return stored || defaultValue
}

export async function persistBankData(data) {
  await setAppSetting('bank_data', data)
  return data
}
