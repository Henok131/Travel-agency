// ============================================================================
// Airline utility functions
// Data is sourced from the centralized /data/airlines.js dataset
// ============================================================================

import { airlines as globalAirlines, normalizeAirlineValue, extractIataCode } from '../data/airlines'

// Re-export for convenience
export { normalizeAirlineValue, extractIataCode }

// Build an internal structured array from the global dataset (cached)
let airlinesCache = null

const airlinesData = globalAirlines.map((a, index) => {
  const codeMatch = a.value.match(/\(([A-Z0-9]{2,3})\)$/i)
  const iataCode = codeMatch ? codeMatch[1].toUpperCase() : ''
  const nameOnly = a.value.replace(/\s*\([A-Z0-9]{2,3}\)$/i, '').trim()
  return {
    id: index + 1,
    iata: iataCode,
    icao: '', // ICAO not needed for the dropdown but kept for compatibility
    name: nameOnly,
    country: '' // Not stored in the centralized dataset
  }
})

/**
 * Load airlines data (returns cached data if already loaded)
 */
export async function loadAirlines() {
  if (airlinesCache) {
    return airlinesCache
  }
  airlinesCache = airlinesData
  return airlinesCache
}

/**
 * Filter airlines based on search query
 * Searches in: name, IATA code
 */
export async function filterAirlines(airlines, query) {
  if (!query || query.trim().length === 0) {
    return []
  }

  const searchTerm = query.toLowerCase().trim()

  const filtered = airlines.filter(airline => {
    const nameMatch = airline.name.toLowerCase().includes(searchTerm)
    const iataMatch = airline.iata && airline.iata.toLowerCase().includes(searchTerm)
    return nameMatch || iataMatch
  })

  // Remove duplicates (same IATA + name)
  const seen = new Set()
  const unique = []
  for (const airline of filtered) {
    const key = `${airline.iata || ''}-${airline.name}`
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(airline)
    }
  }

  return unique.slice(0, 20)
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
 */
export function getAirlineLogo(code) {
  if (!code) return null
  return `https://pics.avs.io/200/200/${code.toUpperCase()}.png`
}

/**
 * Extract simple fare rules from an Amadeus flight offer.
 */
export function getFareRules(offer) {
  if (!offer) return null

  const pricing = offer.pricingOptions || {}

  if (pricing.refundableFare === true) {
    return { refundable: true, change: true, summary: 'Refundable' }
  }
  if (pricing.noRestrictionFare === true) {
    return { refundable: true, change: true, summary: 'Flexible' }
  }

  return { refundable: false, change: false, summary: 'Restricted' }
}
