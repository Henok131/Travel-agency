// Airline data with IATA codes, names, and countries
// Source: Curated list of major airlines worldwide

let airlinesCache = null

/**
 * Airline data structure:
 * {
 *   iata: "AA",           // IATA code (2-3 letters)
 *   icao: "AAL",          // ICAO code (3 letters)
 *   name: "American Airlines",  // Full airline name
 *   country: "United States"   // Country name
 * }
 */

const airlinesData = [
  { iata: "BT", icao: "BTI", name: "Air Baltic", country: "Latvia" },
  { iata: "AC", icao: "ACA", name: "Air Canada", country: "Canada" },
  { iata: "CA", icao: "CCA", name: "Air Caina", country: "China" },
  { iata: "TX", icao: "", name: "Air Caribbes", country: "" },
  { iata: "UX", icao: "AEA", name: "Air Europa", country: "Spain" },
  { iata: "AF", icao: "AFR", name: "Air France", country: "France" },
  { iata: "AI", icao: "AIC", name: "Air Indian", country: "India" },
  { iata: "EI", icao: "EIN", name: "Aer Lingus", country: "Ireland" },
  { iata: "AM", icao: "AMX", name: "Aeromexico", country: "Mexico" },
  { iata: "JC", icao: "", name: "Air Greece", country: "Greece" },
  { iata: "AA", icao: "AAL", name: "American Airlines", country: "United States" },
  { iata: "OS", icao: "AUA", name: "Austrian Airlines", country: "Austria" },
  { iata: "QT", icao: "", name: "Avianca Cargo", country: "Colombia" },
  { iata: "BA", icao: "BAW", name: "British Airways", country: "United Kingdom" },
  { iata: "SN", icao: "BEL", name: "Brussels Airlines", country: "Belgium" },
  { iata: "CZ", icao: "CSN", name: "China Southern Airlines", country: "China" },
  { iata: "DE", icao: "CFG", name: "Condor Flugdienst", country: "Germany" },
  { iata: "U2", icao: "EZY", name: "Easyjet Airlines", country: "United Kingdom" },
  { iata: "MS", icao: "MSR", name: "Egyptair", country: "Egypt" },
  { iata: "EK", icao: "UAE", name: "Emirates", country: "United Arab Emirates" },
  { iata: "ET", icao: "ETH", name: "Ethiopian Airlines", country: "Ethiopia" },
  { iata: "EW", icao: "EWG", name: "Eurowings", country: "Germany" },
  { iata: "AY", icao: "FIN", name: "Finnair", country: "Finland" },
  { iata: "FZ", icao: "FDB", name: "Flydubai", country: "United Arab Emirates" },
  { iata: "GF", icao: "GFA", name: "Gulf Air", country: "Bahrain" },
  { iata: "IB", icao: "IBE", name: "Iberia", country: "Spain" },
  { iata: "AZ", icao: "ITY", name: "ITA Airways", country: "Italy" },
  { iata: "KQ", icao: "KQA", name: "Kenyan Airways", country: "Kenya" },
  { iata: "KL", icao: "KLM", name: "KIM", country: "Netherlands" },
  { iata: "KU", icao: "KAC", name: "Kuwait Airways", country: "Kuwait" },
  { iata: "LH", icao: "DLH", name: "Lufthansa", country: "Germany" },
  { iata: "PC", icao: "PGT", name: "Pegasus Airlines", country: "Turkey" },
  { iata: "QR", icao: "QTR", name: "Qatar Airways", country: "Qatar" },
  { iata: "RJ", icao: "RJA", name: "Royal Jordanian Airlines", country: "Jordan" },
  { iata: "LX", icao: "SWR", name: "Swiss Air", country: "Switzerland" },
  { iata: "TK", icao: "THY", name: "Turkish Airlines", country: "Turkey" },
  { iata: "UA", icao: "UAL", name: "United Airlines", country: "United States" },
  { iata: "WS", icao: "WJA", name: "WestJet", country: "Canada" }
]

/**
 * Load airlines data (returns cached data if already loaded)
 */
export async function loadAirlines() {
  if (airlinesCache) {
    return airlinesCache
  }
  
  // Add unique IDs to each airline
  airlinesCache = airlinesData.map((airline, index) => ({
    ...airline,
    id: index + 1
  }))
  
  return airlinesCache
}

/**
 * Filter airlines based on search query
 * Searches in: name, IATA code, ICAO code, and country
 */
export async function filterAirlines(airlines, query) {
  if (!query || query.trim().length === 0) {
    return []
  }
  
  const searchTerm = query.toLowerCase().trim()

  // First filter by search term
  const filtered = airlines.filter(airline => {
    const nameMatch = airline.name.toLowerCase().includes(searchTerm)
    const iataMatch = airline.iata && airline.iata.toLowerCase().includes(searchTerm)
    const icaoMatch = airline.icao && airline.icao.toLowerCase().includes(searchTerm)
    const countryMatch = airline.country && airline.country.toLowerCase().includes(searchTerm)
    return nameMatch || iataMatch || icaoMatch || countryMatch
  })

  // Then remove duplicates (same IATA + name)
  const seen = new Set()
  const unique = []
  for (const airline of filtered) {
    const key = `${airline.iata || ''}-${airline.name}`
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(airline)
    }
  }

  return unique.slice(0, 20) // Limit to 20 unique results
}

/**
 * Format airline for display
 * Returns: "Airline Name (IATA) - Country" or just "Airline Name" if no code
 */
export function formatAirline(airline) {
  if (!airline) return ''
  
  const parts = [airline.name]
  if (airline.iata) {
    parts.push(`(${airline.iata})`)
  }
  if (airline.country) {
    parts.push(`- ${airline.country}`)
  }
  
  return parts.join(' ')
}

/**
 * Format airline for compact display (just name and code)
 * Format: "Name (Code)" - name + space + (code)
 */
export function formatAirlineCompact(airline) {
  if (!airline) return ''
  // Format: "Name (Code)" - name + space + (code)
  if (airline.iata) {
    return `${airline.name} (${airline.iata})`
  }
  return airline.name
}
