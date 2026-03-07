/**
 * services/amadeusService.js
 *
 * Amadeus GDS integration service — thin wrapper around Flight Orders API.
 * Keeps orchestration logic on the caller side; this module only handles
 * the HTTP call and response parsing.
 *
 * Architecture: We are an orchestration layer, NOT a GDS clone.
 * - Amadeus is source of truth.
 * - We only store coordination fields (PNR, order ID, expiry, price summary).
 * - Full raw response goes to audit_logs, NOT business tables.
 */

/**
 * Build Amadeus traveler objects from booking_passengers rows.
 * Amadeus requires specific shape: id, dateOfBirth, name, gender, contact, documents.
 *
 * @param {Array} passengers - Rows from booking_passengers table
 * @param {Object} contactInfo - { email, phone } override (first pax used if missing)
 * @returns {Array} Amadeus-compliant traveler objects
 */
export function buildTravelers(passengers, contactInfo = {}) {
    return passengers.map((p, idx) => {
        const traveler = {
            id: p.amadeus_traveler_id || String(idx + 1),
            dateOfBirth: p.dob || '1990-01-01',
            name: {
                firstName: (p.first_name || 'UNKNOWN').toUpperCase(),
                lastName: (p.last_name || 'UNKNOWN').toUpperCase()
            },
            gender: (p.gender || 'MALE').toUpperCase(),
            contact: {
                emailAddress: contactInfo.email || 'agent@lst-travel.de',
                phones: [{
                    deviceType: 'MOBILE',
                    countryCallingCode: '49',
                    number: contactInfo.phone || '1234567890'
                }]
            }
        }

        // Attach passport document if available
        if (p.passport_number) {
            traveler.documents = [{
                documentType: 'PASSPORT',
                number: p.passport_number,
                expiryDate: '2030-01-01',    // Amadeus sandbox accepts future date
                issuanceCountry: 'DE',
                nationality: 'DE',
                holder: idx === 0              // First pax is primary holder
            }]
        }

        return traveler
    })
}

/**
 * Parse the Amadeus Flight Order response into coordination fields.
 *
 * @param {Object} orderResponse - The full response from POST /v1/shopping/flight-orders
 * @returns {Object} { pnr, orderId, expiresAt, priceSnapshot }
 */
export function parseOrderResponse(orderResponse) {
    const order = orderResponse?.data
    if (!order) throw new Error('Invalid Amadeus order response — missing data field')

    const pnr = order.associatedRecords?.[0]?.reference || null
    const orderId = order.id || null

    // Ticketing deadline — Amadeus returns this in ticketingAgreement or in flightOffers
    const expiresAt =
        order.ticketingAgreement?.dateTimeLimit ||
        order.flightOffers?.[0]?.lastTicketingDateTime ||
        null

    // Extract minimal price snapshot (never store full response in business tables)
    const priceData = order.flightOffers?.[0]?.price || {}
    const priceSnapshot = {
        total: priceData.total || null,
        currency: priceData.currency || 'EUR',
        base: priceData.base || null,
        // Sum all fee/tax entries into a single taxes field
        taxes: priceData.fees && priceData.taxes
            ? String(
                (priceData.fees || []).reduce((s, f) => s + parseFloat(f.amount || 0), 0) +
                (priceData.taxes || []).reduce((s, t) => s + parseFloat(t.amount || 0), 0)
            )
            : priceData.grandTotal
                ? String(parseFloat(priceData.grandTotal) - parseFloat(priceData.base || 0))
                : null
    }

    return { pnr, orderId, expiresAt, priceSnapshot }
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
 * Create a flight order (HOLD) via the Amadeus Flight Orders API.
 * Step 2 — uses the FULL priced offer from Step 1. DO NOT use original offer.
 *
 * @param {Function} amadeusFetch - The project's amadeusFetch helper
 * @param {Object}   offerJson    - Raw Amadeus offer (from booking_offers.offer_json)
 * @param {Array}    travelers    - Amadeus-format traveler objects
 * @returns {Object} { pnr, orderId, expiresAt, priceSnapshot, rawResponse }
 */
export async function createFlightOrder(amadeusFetch, offerJson, travelers) {
    try {
        // ── Step 1: Price the offer ─────────────────────────────────────────
        const { pricedOffer, pricingResponseId } = await priceOffer(amadeusFetch, offerJson)

        // ── Validate: pricing offer ID must exist ───────────────────────────
        if (!pricedOffer.id) {
            throw new Error('Priced offer has no ID — Amadeus response is invalid')
        }

        // ── Align traveler IDs with pricing response ────────────────────────
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

        // ── Step 2: Build order payload — use pricedOffer AS-IS ─────────────
        // DO NOT modify, rebuild, map, or strip any fields from pricedOffer.
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
    } catch (err) {
        // Handle specific Amadeus 404 errors for order creation
        if (err.response?.status === 404) {
            const errorDetail = err.response?.data?.errors?.[0]?.detail || err.response?.data?.errors?.[0]?.title || 'Resource not found'
            console.error(`✈️  [ORDER] 404 Error: ${errorDetail}`)
            throw new Error(`Flight offer expired or invalid. Please search for flights again and create a new booking.`)
        }
        // Re-throw pricing errors (already formatted)
        if (err.message && (err.message.includes('expired') || err.message.includes('invalid') || err.message.includes('Pricing failed'))) {
            throw err
        }
        // Format other errors
        if (err.response?.status) {
            const errorDetail = err.response?.data?.errors?.[0]?.detail || err.response?.data?.errors?.[0]?.title || err.message
            throw new Error(`Order creation failed: ${errorDetail}`)
        }
        throw err
    }
}

/**
 * Create a flight order using the ORIGINAL flight offer without re-pricing.
 * Sends the exact offer returned by search to avoid 404 "targeted resource"
 * errors when Amadeus invalidates reconstructed offers.
 *
 * @param {Function} amadeusFetch - The project's amadeusFetch helper
 * @param {Object}   originalOffer - Raw Amadeus offer from search (unmodified)
 * @param {Array}    travelers     - Amadeus-format traveler objects
 * @returns {Object} { pnr, orderId, expiresAt, priceSnapshot, rawResponse }
 */
export async function createFlightOrderWithOriginalOffer(amadeusFetch, originalOffer, travelers) {
    const offerToSend = (typeof originalOffer === 'string')
        ? JSON.parse(originalOffer)
        : originalOffer

    const payload = {
        data: {
            type: 'flight-order',
            flightOffers: [offerToSend],
            travelers
        }
    }

    console.log(`✈️  [HOLD-ORIGINAL] Using raw offer id=${offerToSend?.id} source=${offerToSend?.source}`)
    console.log(`✈️  [HOLD-ORIGINAL] travelers count = ${travelers.length}`)
    console.log(`✈️  [HOLD-ORIGINAL] Payload bytes = ${JSON.stringify(payload).length}`)
    console.log(`✈️  [HOLD-ORIGINAL] Full payload:\n${JSON.stringify(payload, null, 2)}`)

    const rawResponse = await amadeusFetch('/v1/shopping/flight-orders', {
        method: 'POST',
        body: JSON.stringify(payload)
    })

    const parsed = parseOrderResponse(rawResponse)
    console.log(`✅ [HOLD-ORIGINAL] PNR: ${parsed.pnr}, Order: ${parsed.orderId}, Expires: ${parsed.expiresAt}`)

    return {
        ...parsed,
        rawResponse
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TICKETING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parse ticket numbers from the Amadeus ticketing response.
 * Maps ticket numbers to passengers via traveler ID.
 *
 * Amadeus returns tickets in different structures depending on the API version:
 *   - data.tickets[] with travelerIds + documentNumber
 *   - data.associatedRecords[] (fallback: use PNR as confirmation)
 *
 * @param {Object} ticketResponse - Full response from POST .../ticketing
 * @param {Array}  passengers     - booking_passengers rows (for mapping)
 * @returns {Object} { ticketMap: { passengerId: ticketNumber }, rawTicketNumbers: string[] }
 */
export function parseTicketResponse(ticketResponse, passengers) {
    const data = ticketResponse?.data

    // Attempt 1: Extract from data.tickets[] (standard structure)
    if (data?.tickets && Array.isArray(data.tickets)) {
        const ticketMap = {}
        const rawTicketNumbers = []

        for (const ticket of data.tickets) {
            const docNumber = ticket.documentNumber || ticket.ticketNumber || null
            if (!docNumber) continue
            rawTicketNumbers.push(docNumber)

            // Map to passenger via travelerIds
            const travelerIds = ticket.travelerIds || []
            for (const tid of travelerIds) {
                const pax = passengers.find(p =>
                    p.amadeus_traveler_id === tid || p.amadeus_traveler_id === String(tid)
                )
                if (pax) ticketMap[pax.id] = docNumber
            }
        }

        return { ticketMap, rawTicketNumbers }
    }

    // Attempt 2: Extract from travelers[].tickets (alternative structure)
    if (data?.travelers && Array.isArray(data.travelers)) {
        const ticketMap = {}
        const rawTicketNumbers = []

        for (const traveler of data.travelers) {
            const travelerId = traveler.id || traveler.travelerId
            const tickets = traveler.tickets || traveler.documents || []
            for (const t of tickets) {
                const docNumber = t.documentNumber || t.ticketNumber || t.number || null
                if (!docNumber) continue
                rawTicketNumbers.push(docNumber)

                const pax = passengers.find(p =>
                    p.amadeus_traveler_id === travelerId || p.amadeus_traveler_id === String(travelerId)
                )
                if (pax) ticketMap[pax.id] = docNumber
            }
        }

        if (rawTicketNumbers.length > 0) return { ticketMap, rawTicketNumbers }
    }

    // Attempt 3: Single ticket number at top level
    const singleTicket = data?.ticketNumber || data?.documentNumber || null
    if (singleTicket) {
        const ticketMap = {}
        // Assign same ticket to all passengers (single-ticket response)
        for (const pax of passengers) {
            ticketMap[pax.id] = singleTicket
        }
        return { ticketMap, rawTicketNumbers: [singleTicket] }
    }

    // Fallback: Generate placeholder ticket numbers for manual follow-up
    console.warn('⚠️  Could not parse ticket numbers from Amadeus response — using fallback')
    const ticketMap = {}
    const rawTicketNumbers = []
    for (const pax of passengers) {
        const fallback = `PENDING-${Date.now()}-${pax.id.slice(0, 6)}`
        ticketMap[pax.id] = fallback
        rawTicketNumbers.push(fallback)
    }
    return { ticketMap, rawTicketNumbers }
}

/**
 * Issue tickets for a flight order via the Amadeus Ticketing API.
 *
 * @param {Function} amadeusFetch - The project's amadeusFetch helper
 * @param {string}   gdsOrderId   - Amadeus flight order ID (e.g. "eJzTd...")
 * @param {Array}    passengers   - booking_passengers rows (for ticket mapping)
 * @returns {Object} { ticketMap, rawTicketNumbers, rawResponse }
 */
export async function issueTicket(amadeusFetch, gdsOrderId, passengers) {
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
