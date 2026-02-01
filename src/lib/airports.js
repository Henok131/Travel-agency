// Airport data loader from OurAirports dataset
// Source: https://ourairports.com/data/
// File: airports.csv

let airportsCache = null
let loadingPromise = null
let countryNamesCache = null
let countryNamesLoadingPromise = null

/**
 * Parse CSV line handling quoted fields
 */
function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++ // Skip next quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

/**
 * Load country names mapping from OurAirports countries.csv
 * Returns object mapping ISO codes to country names: { "ER": "Eritrea", "US": "United States", ... }
 */
async function loadCountryNames() {
  if (countryNamesCache) {
    return countryNamesCache
  }
  
  if (countryNamesLoadingPromise) {
    return countryNamesLoadingPromise
  }
  
  countryNamesLoadingPromise = (async () => {
    try {
      const response = await fetch('https://davidmegginson.github.io/ourairports-data/countries.csv')
      if (!response.ok) {
        throw new Error(`Failed to load countries data: ${response.status}`)
      }
      
      const csvText = await response.text()
      const lines = csvText.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('Invalid countries CSV format')
      }
      
      const headers = parseCSVLine(lines[0])
      const codeIndex = headers.indexOf('code')
      const nameIndex = headers.indexOf('name')
      
      const countryNames = {}
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i])
        if (values.length > codeIndex && values[codeIndex]) {
          const code = values[codeIndex].toUpperCase()
          const name = values[nameIndex] || ''
          countryNames[code] = name
        }
      }
      
      countryNamesCache = countryNames
      return countryNames
    } catch (error) {
      console.error('Error loading country names:', error)
      countryNamesLoadingPromise = null
      return {}
    }
  })()
  
  return countryNamesLoadingPromise
}

export { loadCountryNames }

/**
 * Load and parse airports.csv from OurAirports
 * Returns array of airport objects with: id, name, city, country, iata, icao, latitude, longitude, type
 */
export async function loadAirports() {
  // Return cached data if available
  if (airportsCache) {
    return airportsCache
  }
  
  // Return existing promise if already loading
  if (loadingPromise) {
    return loadingPromise
  }
  
  // Load airports data
  loadingPromise = (async () => {
    try {
      const response = await fetch('https://davidmegginson.github.io/ourairports-data/airports.csv')
      if (!response.ok) {
        throw new Error(`Failed to load airports data: ${response.status}`)
      }
      
      const csvText = await response.text()
      const lines = csvText.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('Invalid airports CSV format')
      }
      
      // Parse header
      const headers = parseCSVLine(lines[0])
      const idIndex = headers.indexOf('id')
      const nameIndex = headers.indexOf('name')
      const cityIndex = headers.indexOf('municipality')
      const countryIndex = headers.indexOf('iso_country')
      const iataIndex = headers.indexOf('iata_code')
      const icaoIndex = headers.indexOf('ident')
      const latIndex = headers.indexOf('latitude_deg')
      const lonIndex = headers.indexOf('longitude_deg')
      const typeIndex = headers.indexOf('type')
      
      // Parse data rows
      const airports = []
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i])
        if (values.length > nameIndex && values[nameIndex]) {
          airports.push({
            id: values[idIndex] || '',
            name: values[nameIndex] || '',
            city: values[cityIndex] || '',
            country: values[countryIndex] || '',
            iata: (values[iataIndex] || '').toUpperCase(),
            icao: (values[icaoIndex] || '').toUpperCase(),
            latitude: values[latIndex] || '',
            longitude: values[lonIndex] || '',
            type: values[typeIndex] || ''
          })
        }
      }
      
      // Filter to IATA-only airports: must have IATA code with exactly 3 characters
      const iataOnlyAirports = airports.filter(airport => {
        return airport.iata && airport.iata.length === 3
      })
      
      airportsCache = iataOnlyAirports
      return iataOnlyAirports
    } catch (error) {
      console.error('Error loading airports data:', error)
      loadingPromise = null
      throw error
    }
  })()
  
  return loadingPromise
}

/**
 * Filter airports by search query
 * Searches in: name, city, country code, country name, IATA code
 */
export async function filterAirports(airports, query) {
  if (!query || query.trim().length === 0) {
    return []
  }
  
  const searchTerm = query.trim().toLowerCase()
  
  // Load country names for search
  const countryNames = await loadCountryNames()
  
  return airports.filter(airport => {
    const name = (airport.name || '').toLowerCase()
    const city = (airport.city || '').toLowerCase()
    const countryCode = (airport.country || '').toLowerCase()
    const countryName = (countryNames[airport.country?.toUpperCase()] || '').toLowerCase()
    const iata = (airport.iata || '').toLowerCase()
    
    return name.includes(searchTerm) ||
           city.includes(searchTerm) ||
           countryCode.includes(searchTerm) ||
           countryName.includes(searchTerm) ||
           iata.includes(searchTerm)
  }).slice(0, 50) // Limit to 50 results for performance
}

/**
 * Format airport display text
 */
export function formatAirport(airport) {
  if (!airport) return ''
  const code = airport.iata || ''
  const city = airport.city || airport.name || ''
  if (city && code) return `${city.replace(/\s+/g, '')}(${code})`
  if (city) return city
  if (code) return code
  return ''
}
