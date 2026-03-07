/**
 * services/gdsAdapter.js
 *
 * GDS Adapter Layer — Provider abstraction for GDS operations.
 * Routes to appropriate provider adapter based on ENV_PROVIDER.
 *
 * This is the ONLY entry point for GDS operations from server.js.
 * All GDS-specific logic is delegated to provider-specific adapters.
 *
 * Supported providers:
 * - NONE: No Amadeus (noOpAdapter) — no API calls, no keys required
 * - AMADEUS: Treated as SELF_SERVICE (Amadeus REST)
 * - SELF_SERVICE: Amadeus REST API (via selfServiceAdapter)
 * - ENTERPRISE: Amadeus SOAP Web Services (via enterpriseAdapter)
 */

const ENV_PROVIDER = (process.env.ENV_PROVIDER || 'SELF_SERVICE').trim().toUpperCase()

/** Resolve effective provider: AMADEUS → SELF_SERVICE; NONE uses noOp. */
const effectiveProvider = () => ENV_PROVIDER === 'NONE' ? 'NONE' : (ENV_PROVIDER === 'AMADEUS' ? 'SELF_SERVICE' : ENV_PROVIDER)

/**
 * Price an offer (for price comparison before holding).
 * Routes to appropriate provider adapter.
 *
 * @param {Function} amadeusFetch - The amadeusFetch helper (SELF_SERVICE) or SOAP client (ENTERPRISE)
 * @param {Object} offer - Raw GDS offer
 * @returns {Object} { pricedOffer, pricingResponseId }
 */
export async function priceOffer(amadeusFetch, offer) {
  if (effectiveProvider() === 'NONE') {
    const noOpAdapter = await import('./noOpAdapter.js')
    return await noOpAdapter.priceOffer(amadeusFetch, offer)
  }

  if (effectiveProvider() === 'SELF_SERVICE') {
    const selfServiceAdapter = await import('./selfServiceAdapter.js')
    return await selfServiceAdapter.priceOffer(amadeusFetch, offer)
  }

  if (ENV_PROVIDER === 'ENTERPRISE') {
    const enterpriseAdapter = await import('./enterpriseAdapter.js')
    return await enterpriseAdapter.priceOffer(offer, { soapClient: amadeusFetch })
  }

  throw new Error(`Unknown ENV_PROVIDER: ${ENV_PROVIDER}. Must be NONE, AMADEUS, SELF_SERVICE or ENTERPRISE.`)
}

/**
 * Classify GDS errors into structured error types.
 * Routes to appropriate provider-specific error classifier.
 *
 * @param {Error} error - The error object from GDS API call
 * @returns {Object} { type: string, statusCode: number, message: string }
 */
export async function classifyError(error) {
  if (effectiveProvider() === 'NONE') {
    const noOpAdapter = await import('./noOpAdapter.js')
    return noOpAdapter.classifyError(error)
  }

  if (effectiveProvider() === 'SELF_SERVICE') {
    const selfServiceAdapter = await import('./selfServiceAdapter.js')
    return selfServiceAdapter.classifyAmadeusError(error)
  }

  if (ENV_PROVIDER === 'ENTERPRISE') {
    const enterpriseAdapter = await import('./enterpriseAdapter.js')
    return enterpriseAdapter.classifyError(error)
  }

  throw new Error(`Unknown ENV_PROVIDER: ${ENV_PROVIDER}. Must be NONE, AMADEUS, SELF_SERVICE or ENTERPRISE.`)
}

/**
 * Hold a booking (price + create flight order).
 * Routes to appropriate provider adapter.
 *
 * @param {Object} booking - Booking object with offer and passenger data
 * @param {Object} config - Configuration object (provider-specific)
 * @returns {Object} { pnr, orderId, expiresAt, priceSnapshot, rawResponse }
 */
export async function holdBooking(booking, config) {
  if (effectiveProvider() === 'NONE') {
    const noOpAdapter = await import('./noOpAdapter.js')
    return await noOpAdapter.holdBooking(booking, config)
  }

  if (effectiveProvider() === 'SELF_SERVICE') {
    const selfServiceAdapter = await import('./selfServiceAdapter.js')
    return await selfServiceAdapter.holdBooking(booking, config)
  }

  if (ENV_PROVIDER === 'ENTERPRISE') {
    const enterpriseAdapter = await import('./enterpriseAdapter.js')
    return await enterpriseAdapter.holdBooking(booking, config)
  }

  throw new Error(`Unknown ENV_PROVIDER: ${ENV_PROVIDER}. Must be NONE, AMADEUS, SELF_SERVICE or ENTERPRISE.`)
}

/**
 * Issue tickets for a held booking.
 * Routes to appropriate provider adapter.
 *
 * @param {Object} booking - Booking object with gds_order_id
 * @param {Object} config - Configuration object (provider-specific)
 * @returns {Object} { ticketMap, rawTicketNumbers, rawResponse }
 */
export async function issueBooking(booking, config) {
  if (effectiveProvider() === 'NONE') {
    const noOpAdapter = await import('./noOpAdapter.js')
    return await noOpAdapter.issueBooking(booking, config)
  }

  if (effectiveProvider() === 'SELF_SERVICE') {
    const selfServiceAdapter = await import('./selfServiceAdapter.js')
    return await selfServiceAdapter.issueBooking(booking, config)
  }

  if (ENV_PROVIDER === 'ENTERPRISE') {
    const enterpriseAdapter = await import('./enterpriseAdapter.js')
    return await enterpriseAdapter.issueBooking(booking, config)
  }

  throw new Error(`Unknown ENV_PROVIDER: ${ENV_PROVIDER}. Must be NONE, AMADEUS, SELF_SERVICE or ENTERPRISE.`)
}

/**
 * Cancel a held booking.
 * Routes to appropriate provider adapter.
 *
 * @param {Object} booking - Booking object
 * @param {Object} config - Configuration object (provider-specific)
 * @returns {Object} Cancellation result
 */
export async function cancelBooking(booking, config) {
  if (effectiveProvider() === 'NONE') {
    const noOpAdapter = await import('./noOpAdapter.js')
    return await noOpAdapter.cancelBooking(booking, config)
  }

  if (effectiveProvider() === 'SELF_SERVICE') {
    const selfServiceAdapter = await import('./selfServiceAdapter.js')
    return await selfServiceAdapter.cancelBooking(booking, config)
  }

  if (ENV_PROVIDER === 'ENTERPRISE') {
    const enterpriseAdapter = await import('./enterpriseAdapter.js')
    return await enterpriseAdapter.cancelBooking(booking, config)
  }

  throw new Error(`Unknown ENV_PROVIDER: ${ENV_PROVIDER}. Must be NONE, AMADEUS, SELF_SERVICE or ENTERPRISE.`)
}
