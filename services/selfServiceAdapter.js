/**
 * services/selfServiceAdapter.js
 *
 * Self-Service GDS Adapter — Amadeus REST API implementation.
 * Contains all Self-Service specific logic moved from amadeusService.js.
 *
 * This adapter implements the GDS operations for Self-Service mode:
 * - holdBooking: Price + create flight order
 * - issueBooking: Issue tickets for a held order
 * - cancelBooking: Cancel a held order (not yet implemented)
 */

import {
  buildTravelers,
  parseOrderResponse,
  parseTicketResponse
} from './amadeusService.js'

/**
 * Classify Amadeus errors into structured error types for better frontend handling.
 * Maps Amadeus error codes and HTTP status codes to specific error types.
 * 
 * @param {Error} error - The error object from Amadeus API call
 * @returns {Object} { type: string, statusCode: number, message: string }
 */
export function classifyAmadeusError(error) {
  // Check for specific Amadeus error codes
  const errorCode = error.response?.data?.errors?.[0]?.code
  const httpStatus = error.response?.status
  
  // Code 38196 = Offer expired
  if (errorCode === 38196 || errorCode === '38196') {
    return {
      type: 'EXPIRED',
      statusCode: 410,
      message: 'Flight offer expired or invalid'
    }
  }
  
  // 5xx errors = GDS system down
  if (httpStatus >= 500 && httpStatus < 600) {
    return {
      type: 'GDS_DOWN',
      statusCode: 502,
      message: 'Airline system temporarily unavailable'
    }
  }
  
  // 404 = Resource not found (expired offer)
  if (httpStatus === 404) {
    return {
      type: 'EXPIRED',
      statusCode: 410,
      message: 'Flight offer expired or invalid'
    }
  }
  
  // Default error
  const errorDetail = error.response?.data?.errors?.[0]?.detail || 
                     error.response?.data?.errors?.[0]?.title || 
                     error.message || 
                     'Unknown error'
  return {
    type: 'GDS_ERROR',
    statusCode: 400,
    message: errorDetail
  }
}

/**
 * Price an offer via the Amadeus Flight Offers Pricing API.
 * MANDATORY Step 1 — sandbox returns 404 without this.
 * Sends the EXACT raw offer from search. DO NOT modify any fields.
 *
 * @param {Function} amadeusFetch - The project's amadeusFetch helper
 * @param {Object}   offer       - Raw Amadeus offer (from booking_offers.offer_json)
 * @returns {Object} { pricedOffer, pricingResponseId }
 */
export async function priceOffer(amadeusFetch, offer) {
  console.log(`💰 [PRICING] ═══════════════════════════════════════════════`)
  console.log(`💰 [PRICING] Step 1 — POST /v1/shopping/flight-offers/pricing`)
  console.log(`💰 [PRICING] Input offer.id = ${offer.id}`)
  console.log(`💰 [PRICING] Input offer.source = ${offer.source}`)
  console.log(`💰 [PRICING] Input offer keys: [${Object.keys(offer).join(', ')}]`)

  // Validate offer structure before attempting to price
  if (!offer || typeof offer !== 'object') {
    throw new Error('Invalid offer: offer must be an object')
  }
  if (!offer.id) {
    throw new Error('Invalid offer: missing offer.id — offer may be corrupted or expired')
  }
  if (!offer.source) {
    throw new Error('Invalid offer: missing offer.source — offer may be corrupted or expired')
  }

  try {
    // Send EXACT raw offer — no modification
    const pricingResponse = await amadeusFetch('/v1/shopping/flight-offers/pricing', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'flight-offers-pricing',
          flightOffers: [offer]
        }
      })
    })

    // Log pricing response ID
    const pricingResponseId = pricingResponse?.data?.id || pricingResponse?.id || null
    console.log(`💰 [PRICING] Response ID: ${pricingResponseId}`)
    console.log(`💰 [PRICING] Response type: ${pricingResponse?.data?.type}`)
    console.log(`💰 [PRICING] Response keys: [${Object.keys(pricingResponse?.data || {}).join(', ')}]`)

    const pricedOffers = pricingResponse?.data?.flightOffers
    if (!pricedOffers || pricedOffers.length === 0) {
      console.error(`💰 [PRICING] FAILED — no flightOffers in response`)
      console.error(`💰 [PRICING] Full response data keys: ${JSON.stringify(Object.keys(pricingResponse || {}))}`)
      throw new Error('Amadeus pricing returned no priced offer — cannot proceed')
    }

    const pricedOffer = pricedOffers[0]
    console.log(`✅ [STRICT 2-STEP] Priced offer.id = ${pricedOffer.id}`)
    console.log(`✅ [STRICT 2-STEP] Priced offer.source = ${pricedOffer.source}`)
    console.log(`✅ [STRICT 2-STEP] Price: ${pricedOffer.price?.total} ${pricedOffer.price?.currency}`)
    console.log(`✅ [STRICT 2-STEP] Full Priced Offer:\n${JSON.stringify(pricedOffer, null, 2)}`)

    return { pricedOffer, pricingResponseId }
  } catch (err) {
    // Handle specific Amadeus 404 errors
    if (err.response?.status === 404) {
      const errorDetail = err.response?.data?.errors?.[0]?.detail || err.response?.data?.errors?.[0]?.title || 'Resource not found'
      console.error(`💰 [PRICING] 404 Error: ${errorDetail}`)
      throw new Error(`Flight offer expired or invalid. Please search for flights again. (Offer ID: ${offer.id})`)
    }
    // Re-throw other errors with context
    if (err.response?.status) {
      const errorDetail = err.response?.data?.errors?.[0]?.detail || err.response?.data?.errors?.[0]?.title || err.message
      throw new Error(`Pricing failed: ${errorDetail}`)
    }
    throw err
  }
}

/**
 * Hold a booking (price + create flight order).
 * This is the unified interface for holding a booking in Self-Service mode.
 *
 * @param {Object} booking - Booking object with offer and passenger data
 * @param {Object} config - Configuration object
 * @param {Function} config.amadeusFetch - The amadeusFetch helper
 * @param {Object} config.offer - Raw Amadeus offer (from booking_offers.offer_json)
 * @param {Array} config.passengers - booking_passengers rows
 * @param {Object} config.contactInfo - { email, phone } override
 * @returns {Object} { pnr, orderId, expiresAt, priceSnapshot, rawResponse }
 */
export async function holdBooking(booking, config) {
  const { amadeusFetch, offer, passengers, contactInfo = {} } = config

  // Step 1: Price the offer
  const { pricedOffer, pricingResponseId } = await priceOffer(amadeusFetch, offer)

  // Step 2: Build travelers
  const travelers = buildTravelers(passengers, contactInfo)

  // Step 3: Align traveler IDs with pricing response
  const travelerPricings = pricedOffer.travelerPricings || []
  if (travelerPricings.length > 0) {
    const expectedIds = travelerPricings.map(tp => tp.travelerId)
    console.log(`✈️  [ORDER] Pricing traveler IDs: [${expectedIds.join(', ')}]`)
    console.log(`✈️  [ORDER] Our traveler IDs:     [${travelers.map(t => t.id).join(', ')}]`)

    for (let i = 0; i < travelers.length && i < expectedIds.length; i++) {
      if (travelers[i].id !== expectedIds[i]) {
        console.log(`✈️  [ORDER] Remapping traveler ${travelers[i].id} → ${expectedIds[i]}`)
        travelers[i].id = expectedIds[i]
      }
    }
  }

  // Step 4: Build order payload — use pricedOffer AS-IS
  const payload = {
    data: {
      type: 'flight-order',
      flightOffers: [pricedOffer],
      travelers
    }
  }

  console.log(`✈️  [STRICT 2-STEP] ═══════════════════════════════════════════════`)
  console.log(`✈️  [STRICT 2-STEP] Step 2 — POST /v1/shopping/flight-orders`)
  console.log(`✈️  [STRICT 2-STEP] Pricing response ID: ${pricingResponseId}`)
  console.log(`✈️  [STRICT 2-STEP] flightOffers[0].id = ${pricedOffer.id}`)
  console.log(`✈️  [STRICT 2-STEP] flightOffers[0].source = ${pricedOffer.source}`)
  console.log(`✈️  [ORDER] travelers count = ${travelers.length}`)
  console.log(`✈️  [ORDER] Payload size = ${JSON.stringify(payload).length} bytes`)
  console.log(`✈️  [ORDER] Full payload:\n${JSON.stringify(payload, null, 2)}`)

  const rawResponse = await amadeusFetch('/v1/shopping/flight-orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  })

  // Parse into coordination fields
  const parsed = parseOrderResponse(rawResponse)

  console.log(`✅ [ORDER] PNR: ${parsed.pnr}, Order: ${parsed.orderId}, Expires: ${parsed.expiresAt}`)

  return {
    ...parsed,
    rawResponse
  }
}

/**
 * Issue tickets for a held booking.
 * This is the unified interface for issuing tickets in Self-Service mode.
 *
 * @param {Object} booking - Booking object with gds_order_id
 * @param {Object} config - Configuration object
 * @param {Function} config.amadeusFetch - The amadeusFetch helper
 * @param {Array} config.passengers - booking_passengers rows (for ticket mapping)
 * @returns {Object} { ticketMap, rawTicketNumbers, rawResponse }
 */
export async function issueBooking(booking, config) {
  const { amadeusFetch, passengers } = config
  const gdsOrderId = booking.gds_order_id

  if (!gdsOrderId) {
    throw new Error('Missing gds_order_id — booking must be held before issuing tickets')
  }

  console.log(`🎫 Amadeus issueTicket — order: ${gdsOrderId}`)

  const rawResponse = await amadeusFetch(`/v1/booking/flight-orders/${gdsOrderId}/ticketing`, {
    method: 'POST',
    body: JSON.stringify({
      data: { ticketingMethod: 'AUTOMATIC' }
    })
  })

  const { ticketMap, rawTicketNumbers } = parseTicketResponse(rawResponse, passengers)

  console.log(`✅ Tickets issued: [${rawTicketNumbers.join(', ')}]`)

  return {
    ticketMap,
    rawTicketNumbers,
    rawResponse  // Caller stores in audit_logs.raw_response ONLY
  }
}

/**
 * Cancel a held booking.
 * Not yet implemented for Self-Service mode.
 *
 * @param {Object} booking - Booking object
 * @param {Object} config - Configuration object
 * @returns {Object} Cancellation result
 */
export async function cancelBooking(booking, config) {
  throw new Error('Cancel booking not yet implemented for Self-Service mode')
}
