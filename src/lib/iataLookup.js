const CACHE_KEY = 'iata_lookup_cache_v1'
const MAX_CACHE = 50

const readCache = () => {
  if (typeof localStorage === 'undefined') return { entries: {}, order: [] }
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return { entries: {}, order: [] }
    const parsed = JSON.parse(raw)
    return {
      entries: parsed.entries || {},
      order: parsed.order || []
    }
  } catch (_) {
    return { entries: {}, order: [] }
  }
}

const writeCache = (cache) => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (_) {
    // ignore storage errors (quota, privacy modes)
  }
}

const cacheResult = (keyword, results) => {
  const cache = readCache()
  const key = keyword.toLowerCase()
  cache.entries[key] = { results, ts: Date.now() }
  cache.order = [key, ...cache.order.filter((k) => k !== key)].slice(0, MAX_CACHE)
  writeCache(cache)
  return results
}

const findCachedAirportByCode = (code) => {
  const cache = readCache()
  const upper = code.toUpperCase()
  for (const key of cache.order) {
    const entry = cache.entries[key]
    if (!entry || !entry.results) continue
    const match = entry.results.find((a) => (a.iataCode || '').toUpperCase() === upper)
    if (match) return match
  }
  return null
}

export const formatAirportLabel = (airport) => {
  if (!airport) return ''
  const code = airport.iataCode || airport.iata || ''
  const name = airport.name || airport.detailedName || ''
  const city = airport.cityName || airport.city || ''

  if (city && name && code) return `${city} – ${name} (${code})`
  if (name && code) return `${name} (${code})`
  if (city && code) return `${city} (${code})`
  return code || name || ''
}

export const searchAirports = async (keyword) => {
  const trimmed = (keyword || '').trim()
  if (!trimmed) return []
  const key = trimmed.toLowerCase()

  // Serve from cache first
  const cached = readCache().entries[key]
  if (cached && cached.results) {
    return cached.results
  }

  try {
    const resp = await fetch('/api/amadeus/airports/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: trimmed })
    })
    if (!resp.ok) {
      throw new Error(`Search failed: ${resp.status}`)
    }
    const body = await resp.json().catch(() => ({}))
    const results = body?.data || []
    return cacheResult(trimmed, results)
  } catch (err) {
    console.warn('Airport search failed; falling back to cache/manual:', err.message || err)
    return cached?.results || []
  }
}

export const getAirportName = async (iataCode) => {
  const code = (iataCode || '').trim().toUpperCase()
  if (!code) return ''

  const cached = findCachedAirportByCode(code)
  if (cached) return formatAirportLabel(cached)

  const results = await searchAirports(code)
  const match = results.find((a) => (a.iataCode || '').toUpperCase() === code)
  if (match) return formatAirportLabel(match)
  return code
}
