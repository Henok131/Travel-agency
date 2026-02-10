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
  { iata: "JP", icao: "ADR", name: "Adria Airways", country: "Slovenia" },
  { iata: "A3", icao: "AEE", name: "Aegean Airlines", country: "Greece" },
  { iata: "EI", icao: "EIN", name: "Aer Lingus", country: "Ireland" },
  { iata: "SU", icao: "AFL", name: "Aeroflot", country: "Russia" },
  { iata: "AR", icao: "ARG", name: "Aerolineas Argentinas", country: "Argentina" },
  { iata: "AM", icao: "AMX", name: "Aeromexico", country: "Mexico" },
  { iata: "AH", icao: "DAH", name: "Air Algerie", country: "Algeria" },
  { iata: "KC", icao: "KZR", name: "Air Astana", country: "Kazakhstan" },
  { iata: "BT", icao: "BTI", name: "Air Baltic", country: "Latvia" },
  { iata: "AB", icao: "BER", name: "Air Berlin", country: "Germany" },
  { iata: "AC", icao: "ACA", name: "Air Canada", country: "Canada" },
  { iata: "TX", icao: "FWI", name: "Air Caraibes", country: "France" },
  { iata: "CA", icao: "CCA", name: "Air China", country: "China" },
  { iata: "UX", icao: "AEA", name: "Air Europa", country: "Spain" },
  { iata: "AF", icao: "AFR", name: "Air France", country: "France" },
  { iata: "AI", icao: "AIC", name: "Air India", country: "India" },
  { iata: "KM", icao: "AMC", name: "Air Malta", country: "Malta" },
  { iata: "MK", icao: "MAU", name: "Air Mauritius", country: "Mauritius" },
  { iata: "NZ", icao: "ANZ", name: "Air New Zealand", country: "New Zealand" },
  { iata: "PX", icao: "ANG", name: "Air Niugini", country: "Papua New Guinea" },
  { iata: "JU", icao: "ASL", name: "Air Serbia", country: "Serbia" },
  { iata: "TS", icao: "TSC", name: "Air Transat", country: "Canada" },
  { iata: "HM", icao: "SEY", name: "Air Seychelles", country: "Seychelles" },
  { iata: "AS", icao: "ASA", name: "Alaska Airlines", country: "United States" },
  { iata: "AZ", icao: "ITY", name: "Alitalia (ITA Airways)", country: "Italy" },
  { iata: "NH", icao: "ANA", name: "All Nippon Airways", country: "Japan" },
  { iata: "AA", icao: "AAL", name: "American Airlines", country: "United States" },
  { iata: "OZ", icao: "AAR", name: "Asiana Airlines", country: "South Korea" },
  { iata: "OS", icao: "AUA", name: "Austrian Airlines", country: "Austria" },
  { iata: "AV", icao: "AVA", name: "Avianca", country: "Colombia" },
  { iata: "J2", icao: "AHY", name: "Azerbaijan Airlines", country: "Azerbaijan" },
  { iata: "PG", icao: "BKP", name: "Bangkok Airways", country: "Thailand" },
  { iata: "BG", icao: "BBC", name: "Biman Bangladesh Airlines", country: "Bangladesh" },
  { iata: "BA", icao: "BAW", name: "British Airways", country: "United Kingdom" },
  { iata: "SN", icao: "BEL", name: "Brussels Airlines", country: "Belgium" },
  { iata: "FB", icao: "LZB", name: "Bulgaria Air", country: "Bulgaria" },
  { iata: "CX", icao: "CPA", name: "Cathay Pacific", country: "Hong Kong" },
  { iata: "CI", icao: "CAL", name: "China Airlines", country: "Taiwan" },
  { iata: "MU", icao: "CES", name: "China Eastern Airlines", country: "China" },
  { iata: "CZ", icao: "CSN", name: "China Southern Airlines", country: "China" },
  { iata: "DE", icao: "CFG", name: "Condor", country: "Germany" },
  { iata: "CM", icao: "CMP", name: "Copa Airlines", country: "Panama" },
  { iata: "OU", icao: "CTN", name: "Croatia Airlines", country: "Croatia" },
  { iata: "OK", icao: "CSA", name: "Czech Airlines", country: "Czech Republic" },
  { iata: "DL", icao: "DAL", name: "Delta Air Lines", country: "United States" },
  { iata: "U2", icao: "EZY", name: "easyJet", country: "United Kingdom" },
  { iata: "MS", icao: "MSR", name: "EgyptAir", country: "Egypt" },
  { iata: "LY", icao: "ELY", name: "El Al", country: "Israel" },
  { iata: "EK", icao: "UAE", name: "Emirates", country: "United Arab Emirates" },
  { iata: "ET", icao: "ETH", name: "Ethiopian Airlines", country: "Ethiopia" },
  { iata: "EY", icao: "ETD", name: "Etihad Airways", country: "United Arab Emirates" },
  { iata: "EW", icao: "EWG", name: "Eurowings", country: "Germany" },
  { iata: "BR", icao: "EVA", name: "EVA Air", country: "Taiwan" },
  { iata: "AY", icao: "FIN", name: "Finnair", country: "Finland" },
  { iata: "FZ", icao: "FDB", name: "flydubai", country: "United Arab Emirates" },
  { iata: "BE", icao: "BEE", name: "Flybe", country: "United Kingdom" },
  { iata: "F9", icao: "FFT", name: "Frontier Airlines", country: "United States" },
  { iata: "GA", icao: "GIA", name: "Garuda Indonesia", country: "Indonesia" },
  { iata: "GF", icao: "GFA", name: "Gulf Air", country: "Bahrain" },
  { iata: "HU", icao: "CHH", name: "Hainan Airlines", country: "China" },
  { iata: "HA", icao: "HAL", name: "Hawaiian Airlines", country: "United States" },
  { iata: "HX", icao: "CRK", name: "Hong Kong Airlines", country: "Hong Kong" },
  { iata: "IB", icao: "IBE", name: "Iberia", country: "Spain" },
  { iata: "FI", icao: "ICE", name: "Icelandair", country: "Iceland" },
  { iata: "6E", icao: "IGO", name: "IndiGo", country: "India" },
  { iata: "JL", icao: "JAL", name: "Japan Airlines", country: "Japan" },
  { iata: "J9", icao: "JZR", name: "Jazeera Airways", country: "Kuwait" },
  { iata: "B6", icao: "JBU", name: "JetBlue", country: "United States" },
  { iata: "KQ", icao: "KQA", name: "Kenya Airways", country: "Kenya" },
  { iata: "KL", icao: "KLM", name: "KLM Royal Dutch Airlines", country: "Netherlands" },
  { iata: "KE", icao: "KAL", name: "Korean Air", country: "South Korea" },
  { iata: "KU", icao: "KAC", name: "Kuwait Airways", country: "Kuwait" },
  { iata: "LA", icao: "LAN", name: "LATAM Airlines", country: "Chile" },
  { iata: "LO", icao: "LOT", name: "LOT Polish Airlines", country: "Poland" },
  { iata: "LH", icao: "DLH", name: "Lufthansa", country: "Germany" },
  { iata: "LG", icao: "LGL", name: "Luxair", country: "Luxembourg" },
  { iata: "MH", icao: "MAS", name: "Malaysia Airlines", country: "Malaysia" },
  { iata: "ME", icao: "MEA", name: "Middle East Airlines", country: "Lebanon" },
  { iata: "WY", icao: "OMA", name: "Oman Air", country: "Oman" },
  { iata: "PC", icao: "PGT", name: "Pegasus Airlines", country: "Turkey" },
  { iata: "PR", icao: "PAL", name: "Philippine Airlines", country: "Philippines" },
  { iata: "QF", icao: "QFA", name: "Qantas", country: "Australia" },
  { iata: "QR", icao: "QTR", name: "Qatar Airways", country: "Qatar" },
  { iata: "AT", icao: "RAM", name: "Royal Air Maroc", country: "Morocco" },
  { iata: "BI", icao: "RBA", name: "Royal Brunei Airlines", country: "Brunei" },
  { iata: "RJ", icao: "RJA", name: "Royal Jordanian", country: "Jordan" },
  { iata: "FR", icao: "RYR", name: "Ryanair", country: "Ireland" },
  { iata: "S7", icao: "SBI", name: "S7 Airlines", country: "Russia" },
  { iata: "SK", icao: "SAS", name: "SAS", country: "Scandinavia" },
  { iata: "SV", icao: "SVA", name: "Saudia", country: "Saudi Arabia" },
  { iata: "SQ", icao: "SIA", name: "Singapore Airlines", country: "Singapore" },
  { iata: "SA", icao: "SAA", name: "South African Airways", country: "South Africa" },
  { iata: "WN", icao: "SWA", name: "Southwest Airlines", country: "United States" },
  { iata: "UL", icao: "ALK", name: "SriLankan Airlines", country: "Sri Lanka" },
  { iata: "LX", icao: "SWR", name: "Swiss International Air Lines", country: "Switzerland" },
  { iata: "TP", icao: "TAP", name: "TAP Air Portugal", country: "Portugal" },
  { iata: "RO", icao: "ROT", name: "TAROM", country: "Romania" },
  { iata: "TG", icao: "THA", name: "Thai Airways", country: "Thailand" },
  { iata: "TK", icao: "THY", name: "Turkish Airlines", country: "Turkey" },
  { iata: "PS", icao: "AUI", name: "Ukraine International Airlines", country: "Ukraine" },
  { iata: "UA", icao: "UAL", name: "United Airlines", country: "United States" },
  { iata: "VN", icao: "HVN", name: "Vietnam Airlines", country: "Vietnam" },
  { iata: "VS", icao: "VIR", name: "Virgin Atlantic", country: "United Kingdom" },
  { iata: "VA", icao: "VOZ", name: "Virgin Australia", country: "Australia" },
  { iata: "VY", icao: "VLG", name: "Vueling", country: "Spain" },
  { iata: "WS", icao: "WJA", name: "WestJet", country: "Canada" },
  { iata: "W6", icao: "WZZ", name: "Wizz Air", country: "Hungary" }
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
// ... existing code ...
// ... existing code ...
export function formatAirlineCompact(airline) {
  if (!airline) return ''
  // Format: "Name (Code)" - name + space + (code)
  if (airline.iata) {
    return `${airline.name} (${airline.iata})`
  }
  return airline.name
}

/**
 * Extract baggage allowance from an Amadeus flight offer.
 * Returns a string like "1 PC", "23 KG", or null if not found.
 */
export function getBaggageAllowance(offer) {
  if (!offer) return null

  // Try to find includedCheckedBags in the first segment of the first itinerary
  // This is a simplification; different segments might have different rules, 
  // but usually the first one gives the main allowance.
  const firstItin = offer.itineraries?.[0]
  const firstSeg = firstItin?.segments?.[0]

  // Baggage info is often in travelClass -> amenities, but in standard Search API 
  // it might be under price.additionalServices (rare) or implicit in fareDetailsBySegment.

  // Let's look at pricingOptions or fareDetailsBySegment
  const pricing = offer.pricingOptions
  const fareDetails = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]

  if (fareDetails?.includedCheckedBags) {
    const bags = fareDetails.includedCheckedBags
    if (bags.quantity !== undefined) {
      return `${bags.quantity} piece${bags.quantity !== 1 ? 's' : ''}`
    }
    if (bags.weight !== undefined) {
      return `${bags.weight} ${bags.weightUnit || 'KG'}`
    }
  }

  return null
}


/**
 * Get airline name from IATA code
 */
export function getAirlineName(code) {
  if (!code) return ''
  const airline = airlinesData.find(a => a.iata === code.toUpperCase())
  return airline ? airline.name : ''
}

/**
 * Get airline logo URL from IATA code
 * Uses a public CDN for airline logos (e.g., Duffel or similar)
 * Fallback to a generic placeholder if needed.
 */
export function getAirlineLogo(code) {
  if (!code) return null
  // Simple logo service, verify if this URL pattern is valid or use another source
  return `https://pics.avs.io/200/200/${code.toUpperCase()}.png`
}

/**
 * Extract simple fare rules from an Amadeus flight offer.
 * Returns object: { refundable: boolean, change: boolean, summary: string }
 * summary example: "Refundable" or "Non-refundable"
 */
export function getFareRules(offer) {
  if (!offer) return null

  const pricing = offer.pricingOptions || {}

  // 1. Check direct flags if available
  if (pricing.refundableFare === true) {
    return { refundable: true, change: true, summary: 'Refundable' }
  }
  if (pricing.noRestrictionFare === true) {
    return { refundable: true, change: true, summary: 'Flexible' }
  }

  // 2. Default fallback
  return { refundable: false, change: false, summary: 'Restricted' }
}
