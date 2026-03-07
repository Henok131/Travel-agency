import fs from 'node:fs'
import path from 'node:path'
import net from 'node:net'
import crypto from 'node:crypto'
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import axios from 'axios'
import qs from 'qs'
import {
  assertTransition,
  canTransition,
  getAvailableTransitions,
  isEditable,
  STATUSES
} from './utils/bookingStateMachine.js'
import {
  buildTravelers
} from './services/amadeusService.js'
import {
  holdBooking,
  issueBooking,
  priceOffer,
  classifyError
} from './services/gdsAdapter.js'

const maskValue = (value) => {
  if (!value) return '❌ missing'
  if (value.length <= 4) return '***'
  if (value.length <= 8) return `${value.slice(0, 2)}***${value.slice(-2)}`
  return `${value.slice(0, 4)}***${value.slice(-4)}`
}

// Load environment variables with fallbacks so local dev picks up credentials
const envFiles = ['.env.local', 'env.local', '.env']
let loadedEnvFile = null
for (const file of envFiles) {
  const fullPath = path.resolve(process.cwd(), file)
  if (fs.existsSync(fullPath)) {
    const result = dotenv.config({ path: fullPath })
    if (!result.error) {
      loadedEnvFile = file
      break
    }
  }
}
if (!loadedEnvFile) {
  dotenv.config()
}
console.log('🔧 Env loaded from:', loadedEnvFile || 'process env only')

// ENV_PROVIDER: NONE | AMADEUS | SELF_SERVICE | ENTERPRISE. When NONE, Amadeus is disabled (no API keys required).
const ENV_PROVIDER = (process.env.ENV_PROVIDER || 'SELF_SERVICE').trim().toUpperCase()

const REQUIRED_ENV_VARS = ['AMADEUS_CLIENT_ID', 'AMADEUS_CLIENT_SECRET', 'AMADEUS_HOST']
const missingEnv = ENV_PROVIDER === 'NONE'
  ? []
  : REQUIRED_ENV_VARS.filter((v) => {
      const val = process.env[v]
      return !val || String(val).trim().length === 0
    })
if (missingEnv.length > 0) {
  console.error('❌ Missing environment variables in .env.local:', missingEnv.join(', '))
  process.exit(1)
}
if (ENV_PROVIDER === 'NONE') {
  console.log('⚠ Amadeus integration is currently disabled')
} else {
  console.log('🔎 Amadeus env check:')
  console.log('   Client ID (masked):', maskValue(process.env.AMADEUS_CLIENT_ID || ''))
  console.log('   Secret present:', !!process.env.AMADEUS_CLIENT_SECRET)
  console.log('   Host:', process.env.AMADEUS_HOST)
}
// -----------------------------------------------------------------------------
// Amadeus Configuration & Express Setup
// -----------------------------------------------------------------------------
const app = express()
const PREFERRED_PORT = Number(process.env.API_PORT || 3001)
const AMADEUS_HOST = (process.env.AMADEUS_HOST || '').trim()
const AMADEUS_CLIENT_ID = (process.env.AMADEUS_CLIENT_ID || '').trim()
const AMADEUS_CLIENT_SECRET = (process.env.AMADEUS_CLIENT_SECRET || '').trim()
const AMADEUS_TIMEOUT_MS = Number(process.env.AMADEUS_TIMEOUT_MS || 10000)
const BACKEND_PORT_FILE = path.resolve(process.cwd(), '.backend-port')

// Middleware
app.use(cors())
app.use(express.json())

// Global Request Logger
app.use((req, res, next) => {
  console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.url}`)
  if (Object.keys(req.body).length > 0) {
    console.log('   Body:', JSON.stringify(req.body).substring(0, 200) + (JSON.stringify(req.body).length > 200 ? '...' : ''))
  }
  next()
})

// Health Check — flightProviderAvailable is false when ENV_PROVIDER === 'NONE'
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    amadeus_host: ENV_PROVIDER === 'NONE' ? '' : AMADEUS_HOST,
    flightProviderAvailable: ENV_PROVIDER !== 'NONE'
  })
})

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const devOrganizationId = process.env.DEV_ORGANIZATION_ID || 'e17ed5ec-a533-4803-9568-e317ad1f9b3f'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// -----------------------------------------------------------------------------
// Amadeus Token Management
// -----------------------------------------------------------------------------
let amadeusTokenCache = { token: null, expiresAt: 0 }

const getAmadeusToken = async () => {
  const now = Date.now()
  if (amadeusTokenCache.token && amadeusTokenCache.expiresAt > now + 10_000) {
    return amadeusTokenCache.token
  }

  try {
    const response = await axios.post(
      `${AMADEUS_HOST}/v1/security/oauth2/token`,
      qs.stringify({
        grant_type: 'client_credentials',
        client_id: AMADEUS_CLIENT_ID,
        client_secret: AMADEUS_CLIENT_SECRET
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: AMADEUS_TIMEOUT_MS }
    )
    const json = response.data
    amadeusTokenCache = {
      token: json.access_token,
      expiresAt: Date.now() + (json.expires_in * 1000)
    }
    return json.access_token
  } catch (error) {
    throw new Error(`Amadeus auth failed: ${error.message}`)
  }
}

const amadeusFetch = async (path, options = {}) => {
  const token = await getAmadeusToken()
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) }

  try {
    const url = `${AMADEUS_HOST}${path}`
    const method = options.method || 'GET'
    console.log(`🔗 [AMADEUS] ${method} ${url}`)
    console.log(`🔗 [AMADEUS] BaseURL: ${AMADEUS_HOST} | Auth: ${headers.Authorization ? 'Bearer ***' : 'MISSING!'}`)
    // Handle body: fetch expects string, axios expects object
    let data = undefined
    if (options.body) {
      try { data = JSON.parse(options.body) } catch (e) { data = options.body }
    }

    const resp = await axios({
      method,
      url,
      headers,
      data,
      timeout: AMADEUS_TIMEOUT_MS
    })
    return resp.data
  } catch (err) {
    console.error(`❌ Amadeus Call Failed [${path}]:`, err.message)
    if (err.response) {
      // Amadeus often returns detailed error JSON
      const details = JSON.stringify(err.response.data)
      console.error(`   Details: ${details}`)
    }
    // Re-throw original error so callers can access err.response
    throw err
  }
}

const verifyAmadeusConnection = async () => {
  if (ENV_PROVIDER === 'NONE') return
  try {
    await getAmadeusToken()
    console.log('✅ Amadeus connected')
  } catch (err) {
    console.error('❌ Amadeus connection failed:', err.message)
  }
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
const safeNumber = (value) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const buildMainTablePayload = ({ passenger = {}, itinerary = {}, pricing = {}, bookingRef, amadeusOrderId, amadeusPnr, holdExpiresAt }) => {
  const outboundDate = itinerary.departureDate || itinerary.travelDate || null
  const returnDate = itinerary.returnDate || null
  const total = safeNumber(pricing.total || pricing.grandTotal)
  const serviceFee = pricing.serviceFee !== undefined ? safeNumber(pricing.serviceFee) : null
  const airlinesPrice = pricing.base !== undefined ? safeNumber(pricing.base) : null

  return {
    first_name: passenger.firstName || passenger.first_name || null,
    middle_name: passenger.middleName || passenger.middle_name || null,
    last_name: passenger.lastName || passenger.last_name || null,
    date_of_birth: passenger.dateOfBirth || passenger.date_of_birth || null,
    gender: passenger.gender || null,
    passport_number: passenger.passportNumber || passenger.passport_number || null,
    departure_airport: itinerary.origin || itinerary.departureAirport || null,
    destination_airport: itinerary.destination || itinerary.destinationAirport || null,
    travel_date: outboundDate,
    return_date: returnDate,
    request_types: ['flight'],
    booking_ref: bookingRef || null,
    booking_status: 'pending', // LEGACY FIELD — must NOT control booking lifecycle.
    hold_expires_at: holdExpiresAt || null,
    amadeus_offer_id: pricing.offerId || pricing.offer_id || null,
    amadeus_order_id: amadeusOrderId || null,
    amadeus_pnr: amadeusPnr || null,
    payment_status: 'unpaid',
    payment_currency: pricing.currency || 'EUR',
    total_ticket_price: total,
    airlines_price: airlinesPrice,
    service_fee: serviceFee,
    total_amount_due: total,
    passenger_json: passenger ? passenger : null,
    pricing_json: pricing ? pricing : null
  }
}

// -----------------------------------------------------------------------------
// Endpoints
// -----------------------------------------------------------------------------

// LEGACY SELF-SERVICE ENDPOINT — DO NOT USE IN ENTERPRISE MODE
// Search
app.post('/api/amadeus/search', async (req, res) => {
  if (ENV_PROVIDER === 'NONE') {
    return res.json({
      success: true,
      data: { offers: [], raw: { data: [] } },
      message: 'Flight provider temporarily unavailable'
    })
  }
  if (ENV_PROVIDER === 'ENTERPRISE') {
    return res.status(410).json({ success: false, type: 'LEGACY_DISABLED' })
  }
  try {
    const {
      originLocationCode, destinationLocationCode,
      departureDate, returnDate,
      adults = 1, currencyCode = 'EUR', nonStop
    } = req.body

    console.log('🔎 Search REQ:', JSON.stringify(req.body))

    // ── Input validation ──────────────────────────────────────────────
    if (!originLocationCode || !destinationLocationCode || !departureDate) {
      console.warn('⚠️ Missing search params')
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: originLocationCode, destinationLocationCode, departureDate'
      })
    }

    // Ensure future date
    const today = new Date().toISOString().split('T')[0]
    if (departureDate <= today) {
      return res.status(400).json({
        success: false,
        error: `Departure date must be in the future (today is ${today})`
      })
    }

    // ── Build Amadeus query ────────────────────────────────────────────
    const params = new URLSearchParams({
      originLocationCode, destinationLocationCode, departureDate, adults, currencyCode
    })
    if (returnDate) params.append('returnDate', returnDate)
    if (nonStop) params.append('nonStop', 'true')

    const url = `/v2/shopping/flight-offers?${params.toString()}`
    console.log(`✈️ Amadeus Request: ${url}`)

    const data = await amadeusFetch(url, { method: 'GET' })
    const count = data?.data?.length || 0
    console.log(`✅ Amadeus success: ${count} offers found`)

    // ── Map to simplified frontend model ──────────────────────────────
    // CRITICAL: Preserve original Amadeus offer.id (base64 string)
    // NEVER replace with array index or numeric value
    const offers = (data?.data || []).map((offer, index) => {
      // Validate that Amadeus returned a valid offer ID
      if (!offer.id) {
        console.error(`⚠️ [SEARCH] Offer at index ${index} missing ID from Amadeus`)
      } else {
        console.log(`[SEARCH] Returning offer ID: ${offer.id}, length: ${offer.id.length}`)
      }

      const itins = offer.itineraries || []
      const segs = itins[0]?.segments || []
      
      // CRITICAL: Use original Amadeus offer.id (NOT array index)
      return {
        id: offer.id,                    // ✅ Original base64 ID from Amadeus
        price: Number(offer.price?.total),
        currency: offer.price?.currency,
        airline: segs[0]?.carrierCode,
        offer: offer                     // ✅ Full raw Amadeus offer object
      }
    })

    // Log summary of returned offer IDs
    const idLengths = offers.map(o => o.id?.length || 0)
    console.log(`[SEARCH] Returning ${offers.length} offers with ID lengths:`, idLengths)
    console.log(`[SEARCH] Sample offer IDs:`, offers.slice(0, 3).map(o => ({ id: o.id, length: o.id?.length })))

    return res.json({ success: true, data: { offers, raw: data } })

  } catch (err) {
    console.error('❌ Search Error:', err.message)

    // Amadeus returned an HTTP error with a response body
    if (err.response) {
      const details = err.response.data
      console.error('❌ Amadeus Error Details:', JSON.stringify(details))

      const firstError = details?.errors?.[0]
      const cleanMsg = firstError
        ? `${firstError.title || 'Error'}: ${firstError.detail || 'Unknown'}`
        : (err.message || 'Amadeus API Error')

      return res.status(err.response.status || 500).json({
        success: false,
        error: cleanMsg,
        details
      })
    }

    // Network / timeout / other errors
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    })
  }
})

// POST /api/search/select — Convert selected offer → DRAFT booking
// Search layer ONLY: no PNR, no locking, no Amadeus mutations.
// Auto-attaches passenger from linked request (if request_id provided).
app.post('/api/search/select', async (req, res) => {
  try {
    const { offer, passengers = {}, contact = {}, request_id = null } = req.body

    // ── Validate payload structure (accept wrapper or raw) ──────────────
    if (!offer) {
      return res.status(400).json({
        success: false,
        error: 'Missing offer payload'
      })
    }

    // Extract price from wrapper or nested offer for booking creation
    const priceSource = offer.price || offer.offer?.price
    if (!priceSource?.total) {
      return res.status(400).json({
        success: false,
        error: 'Missing price information in offer payload'
      })
    }

    const totalPrice = parseFloat(priceSource.total) || 0
    const currency = priceSource.currency || 'EUR'

    // ── Pre-Resolve: Check source of request_id (main_table vs requests) ─
    let resolvedMainTableId = null
    let resolvedRequestId = null
    let passengerSource = null
    let sourceTable = null

    if (request_id) {
      // 1. Try main_table (primary frontend source)
      const { data: mainRow } = await supabase
        .from('main_table')
        .select('id, first_name, last_name, date_of_birth, gender, passport_number, request_id')
        .eq('id', request_id)
        .maybeSingle()

      if (mainRow) {
        resolvedMainTableId = mainRow.id
        // If main_table linked to request, use that request_id too
        resolvedRequestId = mainRow.request_id || null
        passengerSource = mainRow
        sourceTable = 'main_table'
      } else {
        // 2. Try requests table (fallback)
        const { data: reqRow } = await supabase
          .from('requests')
          .select('id, first_name, last_name, date_of_birth, gender, passport_number')
          .eq('id', request_id)
          .maybeSingle()

        if (reqRow) {
          resolvedRequestId = reqRow.id
          passengerSource = reqRow
          sourceTable = 'requests'
        }
      }
    }

    // ── 1. Create DRAFT booking ─────────────────────────────────────────
    // bookings.status is the ONLY lifecycle authority.
    // main_table.booking_status is legacy/financial metadata only.
    // Set draft_expires_at = created_at + 15 minutes (controlled TTL)
    const draftExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
    
    const { data: booking, error: bkErr } = await supabase.from('bookings').insert([{
      status: 'DRAFT',
      total_price: totalPrice,
      currency,
      contact_email: contact.email || null,
      contact_phone: contact.phone || null,
      user_id: req.body.user_id || null,
      request_id: resolvedRequestId,       // Use resolved request_id (or null)
      main_table_id: resolvedMainTableId,  // Use resolved main_table_id (or null)
      draft_expires_at: draftExpiresAt     // 15-minute session TTL
    }]).select('id').single()

    if (bkErr) throw bkErr

    // ── 2. Extract raw Amadeus offer (ALWAYS ignore wrapper) ─────────────
    console.log('📦 [SELECT] Received payload:', JSON.stringify({
      hasId: !!offer?.id,
      hasPrice: !!offer?.price,
      hasNestedOffer: !!offer?.offer,
      outerId: offer?.id,
      nestedId: offer?.offer?.id
    }))

    // CRITICAL: Always extract nested offer if present (ignore wrapper completely)
    let rawOffer = offer
    if (offer?.offer && typeof offer.offer === 'object') {
      console.log('📦 [SELECT] Detected wrapper — extracting nested Amadeus offer')
      rawOffer = offer.offer
    }

    console.log('📦 [SELECT] Extracted raw offer:', JSON.stringify({
      id: rawOffer?.id,
      type: rawOffer?.type,
      source: rawOffer?.source,
      hasItineraries: !!rawOffer?.itineraries,
      hasTravelerPricings: !!rawOffer?.travelerPricings,
      idLength: rawOffer?.id?.length
    }))

    // ── 3. STRICT VALIDATION: Reject invalid Amadeus offers ───────────────
    const validationErrors = []

    // Check offer ID exists (Amadeus v2 returns numeric IDs like "1", "2" - these are valid)
    if (!rawOffer?.id) {
      validationErrors.push('Missing offer.id')
    }

    // Check required fields
    if (rawOffer?.type !== 'flight-offer') {
      validationErrors.push(`Invalid offer.type: "${rawOffer?.type}" (expected "flight-offer")`)
    }

    if (rawOffer?.source !== 'GDS') {
      validationErrors.push(`Invalid offer.source: "${rawOffer?.source}" (expected "GDS")`)
    }

    if (!rawOffer?.itineraries || !Array.isArray(rawOffer.itineraries) || rawOffer.itineraries.length === 0) {
      validationErrors.push('Missing or empty offer.itineraries array')
    }

    if (!rawOffer?.travelerPricings || !Array.isArray(rawOffer.travelerPricings) || rawOffer.travelerPricings.length === 0) {
      validationErrors.push('Missing or empty offer.travelerPricings array')
    }

    // Reject if validation failed
    if (validationErrors.length > 0) {
      console.error('❌ [SELECT] Offer validation failed:', validationErrors)
      return res.status(400).json({
        success: false,
        error: 'Invalid Amadeus offer payload',
        details: validationErrors
      })
    }

    // ── 4. Store validated raw Amadeus offer ─────────────────────────────
    console.log('✅ [SELECT] Validation passed — storing raw Amadeus offer')
    console.log('📦 [SELECT] Final stored offer ID:', rawOffer.id, `(length: ${rawOffer.id.length})`)

    const { error: ofErr } = await supabase.from('booking_offers').insert([{
      booking_id: booking.id,
      offer_json: rawOffer
    }])
    if (ofErr) {
      console.error(`❌ [SELECT] booking_offers insert failed: ${ofErr.message}`)
      throw ofErr
    }

    console.log(`✅ [SELECT] Offer stored successfully: ID=${rawOffer.id}, booking=${booking.id}`)

    // ── 3. Auto-attach passenger ───────────────────────────────────────
    let attachedPassengers = 0
    if (passengerSource && passengerSource.first_name && passengerSource.last_name) {
      const { error: pErr } = await supabase.from('booking_passengers').insert([{
        booking_id: booking.id,
        first_name: passengerSource.first_name,
        last_name: passengerSource.last_name,
        dob: passengerSource.date_of_birth || null,
        gender: passengerSource.gender || null,
        passport_number: passengerSource.passport_number || null,
        passenger_type: 'ADULT',
        amadeus_traveler_id: '1'
      }])
      if (pErr) {
        console.error(`⚠️  booking_passengers insert failed: ${pErr.message}`)
      } else {
        attachedPassengers = 1
        console.log(`👤 Auto-attached passenger from ${sourceTable}: ${passengerSource.first_name} ${passengerSource.last_name} → booking ${booking.id}`)
      }
    } else if (request_id) {
      console.warn(`⚠️  Source ID ${request_id} not found or missing name — skipping auto-attach`)
    }

    console.log(`✅ DRAFT booking created: ${booking.id} (offer ID: ${rawOffer.id}, ${totalPrice} ${currency}, passengers: ${attachedPassengers})`)

    res.json({
      success: true,
      bookingId: booking.id,
      redirect: `/bookings/${booking.id}`,
      attachedPassengers
    })

  } catch (err) {
    console.error('❌ Select offer error:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

// LEGACY SELF-SERVICE ENDPOINT — DO NOT USE IN ENTERPRISE MODE
// NEW: Price Confirmation
app.post('/api/amadeus/price', async (req, res) => {
  if (ENV_PROVIDER === 'NONE') {
    return res.status(503).json({ success: false, type: 'FLIGHT_PROVIDER_UNAVAILABLE', error: 'Flight provider temporarily unavailable' })
  }
  if (ENV_PROVIDER === 'ENTERPRISE') {
    return res.status(410).json({ success: false, type: 'LEGACY_DISABLED' })
  }
  try {
    const { offer } = req.body
    if (!offer) return res.status(400).json({ error: 'Missing offer' })

    const pricing = await amadeusFetch('/v1/shopping/flight-offers/pricing', {
      method: 'POST',
      body: JSON.stringify({ data: { type: 'flight-offers-pricing', flightOffers: [offer] } })
    })

    const resultOffer = pricing.data?.flightOffers?.[0]
    if (!resultOffer) throw new Error('No priced offer returned')

    res.json({ success: true, data: resultOffer })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// LEGACY SELF-SERVICE ENDPOINT — DO NOT USE IN ENTERPRISE MODE
// UPDATED: Create Booking (Hold)
app.post('/api/amadeus/hold', async (req, res) => {
  if (ENV_PROVIDER === 'NONE') {
    return res.status(503).json({ success: false, type: 'FLIGHT_PROVIDER_UNAVAILABLE', error: 'Flight provider temporarily unavailable' })
  }
  if (ENV_PROVIDER === 'ENTERPRISE') {
    return res.status(410).json({ success: false, type: 'LEGACY_DISABLED' })
  }
  try {
    const { offer, passengers = [], pricing = {}, itinerary = {}, bookingRef, user_id, bookingId } = req.body
    if (!offer) return res.status(400).json({ error: 'Missing offer' })

    // 1. Travelers
    const travelers = passengers.map((p, i) => ({
      id: String(i + 1),
      dateOfBirth: p.dateOfBirth || p.date_of_birth,
      name: {
        firstName: (p.firstName || p.first_name || 'TEST').toUpperCase(),
        lastName: (p.lastName || p.last_name || 'TEST').toUpperCase()
      },
      gender: (p.gender || 'MALE').toUpperCase(),
      contact: {
        emailAddress: p.email || 'customer@example.com',
        phones: [{ deviceType: 'MOBILE', countryCallingCode: '1', number: '1234567890' }]
      },
      documents: p.passportNumber ? [{
        documentType: 'PASSPORT',
        number: p.passportNumber,
        expiryDate: '2030-01-01',
        issuanceCountry: 'US',
        nationality: 'US',
        holder: true
      }] : undefined
    }))

    // 2. Create Order in Amadeus
    console.log('✈️ Creating Order...')
    const orderRes = await amadeusFetch('/v1/shopping/flight-orders', {
      method: 'POST',
      body: JSON.stringify({
        data: { type: 'flight-order', flightOffers: [offer], travelers }
      })
    })

    const order = orderRes.data
    const pnr = order.associatedRecords?.[0]?.reference
    const orderId = order.id
    const expiry = order.flightOffers?.[0]?.lastTicketingDateTime
    const total = order.flightOffers?.[0]?.price?.total

    console.log(`✅ PNR: ${pnr}, Order: ${orderId}`)

    // 3. Save to Normalized Tables
    // bookings.status is the ONLY lifecycle authority.
    // main_table.booking_status is legacy/financial metadata only.
    const { data: booking, error: bkErr } = await supabase.from('bookings').insert([{
      user_id: user_id || null, gds_pnr: pnr, gds_order_id: orderId, status: 'PENDING_PAYMENT',
      total_price: total, currency: pricing.currency || 'EUR', ticket_time_limit: expiry
    }]).select().single()
    if (bkErr) throw bkErr

    await supabase.from('booking_offers').insert([{ booking_id: booking.id, offer_json: JSON.stringify(offer) }])

    // Save Passengers
    const paxInserts = passengers.map((p, i) => ({
      booking_id: booking.id, first_name: travelers[i].name.firstName, last_name: travelers[i].name.lastName,
      amadeus_traveler_id: String(i + 1)
    }))
    await supabase.from('booking_passengers').insert(paxInserts)

    // Save Flights
    const flightInserts = offer.itineraries.flatMap((itin, idx) =>
      itin.segments.map((seg, sIdx) => ({
        booking_id: booking.id, carrier_code: seg.carrierCode, flight_number: seg.number,
        departure_iata: seg.departure.iataCode, arrival_iata: seg.arrival.iataCode,
        departure_at: seg.departure.at, arrival_at: seg.arrival.at, duration: seg.duration,
        segment_order: (idx * 100) + sIdx
      }))
    )
    await supabase.from('booking_flights').insert(flightInserts)

    // 4. Update/Insert Legacy Main Table (Frontend Compatibility)
    const mainPayload = buildMainTablePayload({
      passenger: passengers[0], itinerary, pricing: { ...pricing, total }, bookingRef,
      amadeusOrderId: orderId, amadeusPnr: pnr, holdExpiresAt: expiry
    })

    let legacyData
    if (bookingId) {
      // Update existing draft
      const { data } = await supabase.from('main_table')
        // LEGACY FIELD — must NOT control booking lifecycle.
        .update({ ...mainPayload, booking_status: 'pending' })
        .eq('id', bookingId).select().single()
      legacyData = data
    } else {
      // Create new
      const { data } = await supabase.from('main_table')
        // LEGACY FIELD — must NOT control booking lifecycle.
        .insert([{ ...mainPayload, booking_status: 'pending' }])
        .select().single()
      legacyData = data
    }

    res.json({
      success: true,
      data: {
        ...legacyData,
        amadeus_pnr: pnr,
        amadeus_order_id: orderId,
        hold_expires_at: expiry
      }
    })

  } catch (err) {
    console.error('Hold failed:', err)
    res.status(500).json({ error: err.message, details: err.response || null })
  }
})

// LEGACY SELF-SERVICE ENDPOINT — DO NOT USE IN ENTERPRISE MODE
// Ticket
app.post('/api/amadeus/ticket', async (req, res) => {
  if (ENV_PROVIDER === 'NONE') {
    return res.status(503).json({ success: false, type: 'FLIGHT_PROVIDER_UNAVAILABLE', error: 'Flight provider temporarily unavailable' })
  }
  if (ENV_PROVIDER === 'ENTERPRISE') {
    return res.status(410).json({ success: false, type: 'LEGACY_DISABLED' })
  }
  try {
    const { bookingId, paymentAmount } = req.body
    if (!bookingId) return res.status(400).json({ error: 'Missing bookingId' })

    const { data: booking } = await supabase.from('main_table').select('*').eq('id', bookingId).maybeSingle()
    if (!booking?.amadeus_order_id) return res.status(400).json({ error: 'No order found' })

    try {
      const ticketRes = await amadeusFetch(`/v1/booking/flight-orders/${booking.amadeus_order_id}/ticketing`, {
        method: 'POST', body: JSON.stringify({ data: { ticketingMethod: 'AUTOMATIC' } })
      })
      const ticketNum = ticketRes.data?.ticketNumber || 'TICKET-123'

      // LEGACY FIELD — must NOT control booking lifecycle.
      await supabase.from('main_table').update({
        booking_status: 'confirmed', payment_status: 'paid', amadeus_ticket_number: ticketNum, payment_amount: paymentAmount
      }).eq('id', bookingId)

      // Also update normalized table
      await supabase.from('bookings').update({ status: 'TICKETED' }).eq('gds_order_id', booking.amadeus_order_id)

      res.json({ success: true, ticketNumber: ticketNum })
    } catch (e) {
      console.warn('Auto-ticketing failed, manual required', e.message)
      const manualTkt = `MANUAL-${booking.amadeus_order_id}`
      // LEGACY FIELD — must NOT control booking lifecycle.
      await supabase.from('main_table').update({
        booking_status: 'confirmed', payment_status: 'paid', amadeus_ticket_number: manualTkt, payment_amount: paymentAmount
      }).eq('id', bookingId)

      res.json({ success: true, ticketNumber: manualTkt, note: 'Manual intervention required' })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// LEGACY SELF-SERVICE ENDPOINT — DO NOT USE IN ENTERPRISE MODE
// Airports
app.post('/api/amadeus/airports/search', async (req, res) => {
  if (ENV_PROVIDER === 'NONE') {
    return res.json({ success: true, data: [], message: 'Flight provider temporarily unavailable' })
  }
  if (ENV_PROVIDER === 'ENTERPRISE') {
    return res.status(410).json({ success: false, type: 'LEGACY_DISABLED' })
  }
  const { keyword } = req.body
  if (!keyword || keyword.length < 2) return res.status(400).json({ error: 'Min 2 chars' })

  try {
    const data = await amadeusFetch(`/v1/reference-data/locations?subType=AIRPORT,CITY&keyword=${keyword}&page[limit]=10`, { method: 'GET' })
    res.json({ success: true, data: data.data.map(l => ({ iataCode: l.iataCode, name: l.name, cityName: l.address?.cityName })) })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// =============================================================================
// TEST ROUTE: Full-stack booking test (REMOVE BEFORE PRODUCTION)
// =============================================================================
app.post('/api/test-booking', async (req, res) => {
  try {
    const now = new Date().toISOString()

    const { data, error } = await supabase.rpc('create_booking_atomic', {
      p_user_id: null,
      p_gds_pnr: 'FS-STACK-TEST-001',
      p_gds_order_id: 'FS-STACK-ORDER-001',
      p_contact_email: 'fullstack@example.com',
      p_contact_phone: '+491234567890',
      p_total_price: 350.00,
      p_currency: 'EUR',
      p_ticket_time_limit: now,
      p_passengers: [
        {
          first_name: 'Frontend',
          last_name: 'Tester',
          dob: '1992-06-15',
          gender: 'MALE',
          passport_number: 'FS998877',
          passenger_type: 'ADT',
          ticket_number: null,
          loyalty_program: null,
          loyalty_number: null,
          amadeus_traveler_id: '1'
        }
      ],
      p_flights: [
        {
          carrier_code: 'LH',
          flight_number: '321',
          departure_iata: 'FRA',
          arrival_iata: 'JFK',
          departure_at: '2026-04-01T10:00:00Z',
          arrival_at: '2026-04-01T14:00:00Z',
          duration: 'PT4H',
          segment_order: 0
        }
      ],
      p_main_table_payload: {
        first_name: 'Frontend',
        middle_name: null,
        last_name: 'Tester',
        date_of_birth: '1992-06-15',
        gender: 'MALE',
        passport_number: 'FS998877',
        departure_airport: 'FRA',
        destination_airport: 'JFK',
        travel_date: '2026-04-01',
        return_date: null,
        request_types: ['flight'],
        booking_status: 'pending', // LEGACY FIELD — must NOT control booking lifecycle.
        amadeus_offer_id: 'fs-test-offer-001',
        payment_status: 'unpaid',
        payment_currency: 'EUR',
        total_ticket_price: 350.00,
        airlines_price: 300.00,
        service_fee: 50.00,
        total_amount_due: 350.00,
        passenger_json: { firstName: 'Frontend', lastName: 'Tester' },
        pricing_json: { total: 350.00, currency: 'EUR' }
      }
    })

    if (error) {
      console.error('❌ RPC Error:', error.message)
      return res.status(400).json({ success: false, error: error.message, code: error.code })
    }

    console.log('✅ Test booking created:', data)
    res.json({ success: true, data })
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

// =============================================================================
// Booking Detail + Lifecycle Endpoints
// =============================================================================

// GET /api/bookings/:id — Fetch full booking with passengers, flights, main_table
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Fetch booking
    const { data: booking, error: bErr } = await supabase
      .from('bookings').select('*').eq('id', id).maybeSingle()
    if (bErr) throw bErr
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' })

    // bookings.status is the ONLY lifecycle authority.
    // main_table.booking_status is legacy/financial metadata only.
    // Check hold expiry — auto-expire + unlock passengers (HELD only, not DRAFT)
    // DRAFT expiration is handled by backend repricing, not auto-expiration
    if (booking.status === 'HELD' && booking.hold_expires_at) {
      if (new Date(booking.hold_expires_at) < new Date()) {
        console.log(`⏰ Booking ${id} hold expired — auto-transitioning to EXPIRED`)
        await supabase.from('bookings').update({ status: 'EXPIRED' }).eq('id', id)
        await supabase.from('booking_passengers')
          .update({ is_locked: false }).eq('booking_id', id)
        booking.status = 'EXPIRED'
      }
    }
    // NOTE: Do NOT auto-expire DRAFT bookings based on draft_expires_at
    // Repricing during HOLD is the source of truth for offer validity

    // Fetch passengers
    const { data: passengers } = await supabase
      .from('booking_passengers').select('*').eq('booking_id', id).order('id')

    // Fetch flights
    const { data: flights } = await supabase
      .from('booking_flights').select('*').eq('booking_id', id).order('segment_order')

    // Fetch stored offer (for DRAFT bookings, this contains the raw Amadeus offer)
    const { data: offerRow } = await supabase
      .from('booking_offers').select('offer_json, created_at')
      .eq('booking_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle()
    
    const offerJson = offerRow?.offer_json || null

    // Fetch linked main_table record (if exists)
    let mainTable = null
    if (booking.main_table_id) {
      const { data } = await supabase
        .from('main_table').select('*').eq('id', booking.main_table_id).maybeSingle()
      mainTable = data
    }

    res.json({
      success: true,
      data: {
        booking,
        passengers: passengers || [],
        flights: flights || [],
        mainTable,
        offerJson,  // Raw Amadeus offer from booking_offers
        availableTransitions: getAvailableTransitions(booking.status),
        isEditable: isEditable(booking.status)
      }
    })
  } catch (err) {
    console.error('❌ Booking detail error:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

// classifyAmadeusError moved to services/selfServiceAdapter.js
// Use classifyError from gdsAdapter instead

// POST /api/bookings/:id/hold — Transition DRAFT → HELD (production Amadeus integration)
app.post('/api/bookings/:id/hold', async (req, res) => {
  const { id } = req.params
  const startTime = Date.now()

  // Accept or generate idempotency key
  const idempotencyKey = req.headers['idempotency-key'] || crypto.randomUUID()

  try {
    // ── 1. ATOMIC LOCK — acquire_hold_lock RPC ─────────────────────────
    // SELECT FOR UPDATE + set idempotency_key in one transaction.
    const { error: lockErr } = await supabase.rpc('acquire_hold_lock', {
      p_booking_id: id,
      p_idempotency_key: idempotencyKey
    })

    if (lockErr) {
      // Unique constraint violation = concurrent request with different key
      if (lockErr.code === '23505') {
        console.warn(`⛔ Concurrent hold attempt blocked for booking ${id} (idempotency conflict)`)
        return res.status(409).json({ success: false, error: 'Hold already in progress for this booking' })
      }
      throw lockErr
    }

    // ── 2. Fetch booking and validate status ─────────────────────────────
    const { data: booking, error: bkErr } = await supabase
      .from('bookings').select('*').eq('id', id).maybeSingle()

    if (bkErr) throw bkErr
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' })
    }

    // bookings.status is the ONLY lifecycle authority.
    // main_table.booking_status is legacy/financial metadata only.
    // Already HELD — idempotent return
    if (booking.status === 'HELD') {
      console.log(`ℹ️  Booking ${id} already HELD — idempotent return (PNR: ${booking.gds_pnr})`)
      return res.json({
        success: true,
        message: 'Already reserved',
        pnr: booking.gds_pnr,
        expiresAt: booking.hold_expires_at,
        priceSnapshot: booking.price_snapshot_json
      })
    }

    // bookings.status is the ONLY lifecycle authority.
    // main_table.booking_status is legacy/financial metadata only.
    // Only DRAFT can transition to HELD
    if (booking.status !== 'DRAFT') {
      console.warn(`⛔ Hold blocked: ${booking.status} → HELD for booking ${id}`)
      return res.status(409).json({
        success: false,
        type: 'INVALID_STATE',
        error: `Cannot hold booking in ${booking.status} status`
      })
    }

    // ── 4. Load & validate passengers ────────────────────────────────────
    const { data: passengers, error: pErr } = await supabase
      .from('booking_passengers').select('*').eq('booking_id', id).order('id')
    if (pErr) throw pErr
    if (!passengers || passengers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No passengers found — add passengers before reserving'
      })
    }

    // Validate completeness (Amadeus requires first_name, last_name, dob)
    const incompleteRows = []
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i]
      const missing = []
      if (!p.first_name) missing.push('first_name')
      if (!p.last_name) missing.push('last_name')
      if (!p.dob) missing.push('dob')
      if (missing.length > 0) incompleteRows.push({ row: i + 1, missing })
    }
    if (incompleteRows.length > 0) {
      const detail = incompleteRows.map(r => `Row ${r.row}: missing [${r.missing.join(', ')}]`).join('; ')
      console.warn(`⛔ Passenger validation failed for booking ${id}: ${detail}`)
      return res.status(400).json({
        success: false,
        error: `Incomplete passenger data — ${detail}`
      })
    }

    // ── 5. Load stored offer ─────────────────────────────────────────────
    const { data: offerRow, error: ofErr } = await supabase
      .from('booking_offers').select('offer_json, created_at')
      .eq('booking_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (ofErr) throw ofErr
    if (!offerRow?.offer_json) {
      return res.status(400).json({
        success: false,
        error: 'No flight offer stored for this booking — search and select a flight first'
      })
    }

    // ── 6. Build travelers & call Amadeus ─────────────────────────────────
    const travelers = buildTravelers(passengers, {
      email: booking.contact_email,
      phone: booking.contact_phone
    })

    console.log(`🌐 [HOLD] Amadeus host: ${AMADEUS_HOST}`)
    console.log(`🔄 Calling Amadeus Flight Orders for booking ${id} (${travelers.length} pax)...`)

    let orderResult
    try {
      let rawOffer = (typeof offerRow.offer_json === 'string')
        ? JSON.parse(offerRow.offer_json)
        : offerRow.offer_json

      // ── Fix: Unwrap simplified offer if present ────────────────────────
      // The frontend might send { id, price, airline, offer: { ... } }
      if (rawOffer.offer && typeof rawOffer.offer === 'object') {
        console.log('📦 [HOLD] Detected simplified offer wrapper — extracting inner Amadeus offer')
        rawOffer = rawOffer.offer
      }

      // ── Validate offer structure ────────────────────────────────────────
      if (!rawOffer || typeof rawOffer !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Invalid offer stored in database — offer is not a valid object',
          requiresNewSearch: true
        })
      }

      if (!rawOffer.id) {
        return res.status(400).json({
          success: false,
          error: 'Invalid offer stored in database — missing offer ID. The offer may be corrupted or expired.',
          requiresNewSearch: true
        })
      }

      if (!rawOffer.source) {
        console.warn(`⚠️ [HOLD] Offer missing 'source' field — this may cause issues with Amadeus`)
      }

      // Check if offer has required Amadeus structure
      if (!rawOffer.itineraries || !Array.isArray(rawOffer.itineraries) || rawOffer.itineraries.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid offer structure — missing itineraries. Please search for flights again.',
          requiresNewSearch: true
        })
      }

      console.log(`📦 [HOLD] Loaded offer from DB. ID: ${rawOffer.id}, Source: ${rawOffer.source || 'MISSING'}`)
      console.log(`📦 [HOLD] Offer has ${rawOffer.itineraries?.length || 0} itinerary/ies`)
      console.log(`🌐 [HOLD] Base URL: ${AMADEUS_HOST} (Must be https://test.api.amadeus.com)`)

      // Ensure we are using the correct host for this sensitive operation
      if (AMADEUS_HOST !== 'https://test.api.amadeus.com') {
        console.warn(`⚠️ [HOLD] Warning: AMADEUS_HOST is ${AMADEUS_HOST} but test env is recommended for this flow`)
      }

      // ── STEP 1: Always re-price before creating order ───────────────────
      // This ensures we have the latest price and validates offer is still valid
      console.log('💰 [HOLD] Step 1: Re-pricing offer...')
      let pricedOffer
      let pricingResponseId
      try {
        const pricingResult = await priceOffer(amadeusFetch, rawOffer)
        pricedOffer = pricingResult.pricedOffer
        pricingResponseId = pricingResult.pricingResponseId
        console.log(`✅ [HOLD] Re-pricing successful. New price: ${pricedOffer.price?.total} ${pricedOffer.price?.currency}`)
      } catch (pricingErr) {
        const classified = await classifyError(pricingErr)
        console.error(`❌ [HOLD] Re-pricing failed: ${classified.type} - ${classified.message}`)
        return res.status(classified.statusCode).json({
          success: false,
          type: classified.type,
          error: classified.message
        })
      }

      // ── STEP 2: Compare prices ───────────────────────────────────────────
      const oldPrice = parseFloat(rawOffer.price?.total || 0)
      const newPrice = parseFloat(pricedOffer.price?.total || 0)
      
      if (Math.abs(oldPrice - newPrice) > 0.01) { // Allow 0.01 tolerance for floating point
        console.warn(`⚠️ [HOLD] Price changed: ${oldPrice} → ${newPrice}`)
        return res.status(409).json({
          success: false,
          type: 'PRICE_CHANGED',
          oldPrice: oldPrice,
          newPrice: newPrice,
          error: `Price has changed from ${oldPrice} to ${newPrice}`
        })
      }

      // ── STEP 3: Create order using GDS adapter ───────────────────────────
      console.log('🔄 [HOLD] Step 2: Creating flight order with priced offer...')
      let orderResult
      try {
        // Use adapter's holdBooking with the already-priced offer
        // Note: holdBooking will re-price internally, but we've already validated price above
        // For efficiency, we could optimize this later, but keeping behavior identical for now
        orderResult = await holdBooking(booking, {
          amadeusFetch,
          offer: pricedOffer, // Pass already-priced offer
          passengers,
          contactInfo: {
            email: booking.contact_email || null,
            phone: booking.contact_phone || null
          }
        })

        console.log(`✅ [HOLD] Order created: PNR=${orderResult.pnr}, Order=${orderResult.orderId}, Expires=${orderResult.expiresAt}`)
      } catch (orderErr) {
        const classified = await classifyError(orderErr)
        console.error(`❌ [HOLD] Order creation failed: ${classified.type} - ${classified.message}`)
        return res.status(classified.statusCode).json({
          success: false,
          type: classified.type,
          error: classified.message
        })
      }
    } catch (err) {
      // This catch block should not be reached if error handling is done correctly above
      // But keeping it as a safety net
      const classified = await classifyError(err)
      console.error("HOLD ERROR (unexpected):", err.message)
      return res.status(classified.statusCode).json({
        success: false,
        type: classified.type,
        error: classified.message
      })
    }

    const { pnr, orderId, expiresAt, priceSnapshot, rawResponse } = orderResult
    console.log(`✈️  Amadeus success: PNR=${pnr}, Order=${orderId}, Expires=${expiresAt}`)

    // ══════════════════════════════════════════════════════════════════════
    // ── 7. ATOMIC DB WRITE — single PostgreSQL transaction via RPC ────────
    // Amadeus call succeeded. All DB writes execute atomically.
    // If RPC fails → auto-ROLLBACK, log for manual recovery.
    // ══════════════════════════════════════════════════════════════════════
    try {
      // bookings.status is the ONLY lifecycle authority.
      // main_table.booking_status is legacy/financial metadata only.
      // RPC finalize_hold_atomic updates bookings.status = 'HELD'
      const { data: rpcResult, error: rpcErr } = await supabase.rpc('finalize_hold_atomic', {
        p_booking_id: id,
        p_pnr: pnr,
        p_order_id: orderId,
        p_expires_at: expiresAt,
        p_price_snapshot: priceSnapshot,
        p_total_price: parseFloat(priceSnapshot?.total) || booking.total_price || 0,
        p_currency: priceSnapshot?.currency || booking.currency || 'EUR',
        p_raw_response: rawResponse
      })

      if (rpcErr) throw rpcErr
      console.log(`✅ finalize_hold_atomic success:`, JSON.stringify(rpcResult))
    } catch (rpcErr) {
      // PNR exists in Amadeus but DB transaction ROLLED BACK
      console.error(`🚨 CRITICAL: PNR ${pnr} created in Amadeus but DB transaction failed for booking ${id}:`, rpcErr.message)
      await supabase.from('audit_logs').insert([{
        action: 'HOLD_DB_ROLLBACK_NEEDED',
        order_id: orderId,
        status: 'ERROR',
        raw_response: {
          pnr, orderId, expiresAt, bookingId: id,
          rpcError: rpcErr.message,
          timestamp: new Date().toISOString()
        }
      }]).catch(() => { })
      return res.status(500).json({
        success: false,
        error: 'Booking reserved in Amadeus but DB transaction failed — contact support',
        pnr,
        orderId
      })
    }

    // ── 8. Return success ────────────────────────────────────────────────
    const elapsed = Date.now() - startTime
    console.log(`✅ Booking ${id} held: PNR=${pnr}, expires=${expiresAt} (${elapsed}ms)`)

    res.json({
      success: true,
      pnr,
      expiresAt,
      priceSnapshot
    })

  } catch (err) {
    const elapsed = Date.now() - startTime
    console.error(`❌ Hold endpoint unexpected error (${elapsed}ms):`, err.message, err.stack?.split('\n').slice(0, 3).join(' '))
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/bookings/:id/initiate-payment — Transition HELD → PENDING_PAYMENT
app.post('/api/bookings/:id/initiate-payment', async (req, res) => {
  try {
    const { id } = req.params
    const { data: booking } = await supabase.from('bookings').select('status').eq('id', id).maybeSingle()
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' })

    // bookings.status is the ONLY lifecycle authority.
    // main_table.booking_status is legacy/financial metadata only.
    try { assertTransition(booking.status, STATUSES.PENDING_PAYMENT) } catch (e) {
      return res.status(409).json({ success: false, error: e.message })
    }

    await supabase.from('bookings').update({ status: 'PENDING_PAYMENT' }).eq('id', id)
    res.json({ success: true, message: 'Payment initiated' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/bookings/:id/confirm-payment — Transition PENDING_PAYMENT → CONFIRMED
app.post('/api/bookings/:id/confirm-payment', async (req, res) => {
  try {
    const { id } = req.params
    const { data: booking } = await supabase.from('bookings').select('status').eq('id', id).maybeSingle()
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' })

    // bookings.status is the ONLY lifecycle authority.
    // main_table.booking_status is legacy/financial metadata only.
    try { assertTransition(booking.status, STATUSES.CONFIRMED) } catch (e) {
      return res.status(409).json({ success: false, error: e.message })
    }

    await supabase.from('bookings').update({ status: 'CONFIRMED' }).eq('id', id)
    res.json({ success: true, message: 'Payment confirmed' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/bookings/:id/issue — Transition HELD → TICKETED (production Amadeus)
app.post('/api/bookings/:id/issue', async (req, res) => {
  const { id } = req.params
  const startTime = Date.now()

  try {
    // ── 1. Load booking ──────────────────────────────────────────────────
    const { data: booking, error: bErr } = await supabase
      .from('bookings').select('*').eq('id', id).maybeSingle()
    if (bErr) throw bErr
    if (!booking) {
      return res.status(404).json({ success: false, type: 'NOT_FOUND', error: 'Booking not found' })
    }

    // ── 2. Idempotency — already TICKETED returns existing ticket numbers ─
    if (booking.status === 'TICKETED') {
      console.log(`ℹ️  Booking ${id} already TICKETED — idempotent return`)
      const { data: pax } = await supabase
        .from('booking_passengers').select('id, first_name, last_name, ticket_number')
        .eq('booking_id', id).order('id')
      const ticketNumbers = (pax || []).map(p => p.ticket_number).filter(Boolean)
      return res.json({
        success: true,
        message: 'Already ticketed',
        ticketNumbers,
        passengers: pax || []
      })
    }

    // bookings.status is the ONLY lifecycle authority.
    // main_table.booking_status is legacy/financial metadata only.
    // ── 3. State machine guard (only HELD → TICKETED) ─────────────────────
    if (booking.status !== 'HELD') {
      console.warn(`⛔ Issue blocked: ${booking.status} → TICKETED for booking ${id}`)
      return res.status(409).json({
        success: false,
        type: 'INVALID_STATE',
        error: `Cannot issue ticket for booking in ${booking.status} status. Only HELD bookings can be issued.`
      })
    }

    // ── 4. Validate prerequisites ────────────────────────────────────────
    if (!booking.gds_order_id) {
      return res.status(400).json({
        success: false,
        type: 'MISSING_ORDER',
        error: 'No Amadeus order ID found — booking must be held before issuing'
      })
    }

    // ── 5. Load passengers for ticket number mapping ─────────────────────
    const { data: passengers, error: pErr } = await supabase
      .from('booking_passengers').select('*').eq('booking_id', id).order('id')
    if (pErr) throw pErr
    if (!passengers || passengers.length === 0) {
      return res.status(400).json({
        success: false,
        type: 'MISSING_PASSENGERS',
        error: 'No passengers found for this booking'
      })
    }

    // ── 6. Call Amadeus Ticketing API ─────────────────────────────────────
    console.log(`🔄 Calling Amadeus ticketing for booking ${id} (order: ${booking.gds_order_id})...`)

    let ticketResult
    try {
      ticketResult = await issueBooking(booking, {
        amadeusFetch,
        passengers
      })
    } catch (amadeusErr) {
      const classified = await classifyError(amadeusErr)
      console.error(`❌ Amadeus ticketing failed for booking ${id}: ${classified.type} - ${classified.message}`)
      return res.status(classified.statusCode).json({
        success: false,
        type: classified.type,
        error: classified.message
      })
    }

    const { ticketMap, rawTicketNumbers, rawResponse } = ticketResult
    console.log(`🎫 Amadeus success: ${rawTicketNumbers.length} ticket(s) issued`)

    // ═══════════════════════════════════════════════════════════════════════
    // ── 7. ATOMIC DB WRITE — single PostgreSQL transaction via RPC ────────
    // Amadeus ticketing succeeded. All DB writes execute atomically.
    // If RPC fails → auto-ROLLBACK, log for manual recovery.
    // ═══════════════════════════════════════════════════════════════════════
    try {
      // bookings.status is the ONLY lifecycle authority.
      // main_table.booking_status is legacy/financial metadata only.
      // RPC finalize_ticket_atomic updates bookings.status = 'TICKETED'
      const { data: rpcResult, error: rpcErr } = await supabase.rpc('finalize_ticket_atomic', {
        p_booking_id: id,
        p_order_id: booking.gds_order_id,
        p_ticket_map: ticketMap,
        p_raw_response: rawResponse
      })

      if (rpcErr) throw rpcErr
      console.log(`✅ finalize_ticket_atomic success:`, JSON.stringify(rpcResult))
    } catch (rpcErr) {
      // Tickets issued in Amadeus but DB transaction ROLLED BACK
      console.error(`🚨 CRITICAL: Tickets issued in Amadeus but DB transaction failed for booking ${id}:`, rpcErr.message)
      await supabase.from('audit_logs').insert([{
        action: 'TICKET_DB_ROLLBACK_NEEDED',
        order_id: booking.gds_order_id,
        status: 'ERROR',
        raw_response: {
          bookingId: id,
          ticketNumbers: rawTicketNumbers,
          ticketMap,
          rpcError: rpcErr.message,
          timestamp: new Date().toISOString()
        }
      }]).catch(() => { })
      return res.status(500).json({
        success: false,
        type: 'DB_ERROR',
        error: 'Tickets issued in Amadeus but DB transaction failed — contact support',
        ticketNumbers: rawTicketNumbers
      })
    }

    // ── 8. Return success ────────────────────────────────────────────────
    const elapsed = Date.now() - startTime
    console.log(`✅ Booking ${id} ticketed: [${rawTicketNumbers.join(', ')}] (${elapsed}ms)`)

    res.json({
      success: true,
      ticketNumbers: rawTicketNumbers,
      passengers: passengers.map(p => ({
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        ticket_number: ticketMap[p.id] || null
      }))
    })

  } catch (err) {
    const elapsed = Date.now() - startTime
    console.error(`❌ Issue endpoint unexpected error (${elapsed}ms):`, err.message, err.stack?.split('\n').slice(0, 3).join(' '))
    res.status(500).json({ success: false, type: 'INTERNAL_ERROR', error: err.message })
  }
})

// LEGACY SELF-SERVICE ENDPOINT — DO NOT USE IN ENTERPRISE MODE
// POST /api/bookings/:id/ticket — Transition CONFIRMED → TICKETED (production Amadeus)
// DEPRECATED: Use /api/bookings/:id/issue instead for HELD → TICKETED
app.post('/api/bookings/:id/ticket', async (req, res) => {
  if (ENV_PROVIDER === 'ENTERPRISE') {
    return res.status(410).json({ success: false, type: 'LEGACY_DISABLED' })
  }
  const { id } = req.params
  const startTime = Date.now()

  try {
    // ── 1. Load booking ──────────────────────────────────────────────────
    const { data: booking, error: bErr } = await supabase
      .from('bookings').select('*').eq('id', id).maybeSingle()
    if (bErr) throw bErr
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' })

    // ── 2. Idempotency — already TICKETED returns existing ticket numbers ─
    if (booking.status === 'TICKETED') {
      console.log(`ℹ️  Booking ${id} already TICKETED — idempotent return`)
      const { data: pax } = await supabase
        .from('booking_passengers').select('id, first_name, last_name, ticket_number')
        .eq('booking_id', id).order('id')
      const ticketNumbers = (pax || []).map(p => p.ticket_number).filter(Boolean)
      return res.json({
        success: true,
        message: 'Already ticketed',
        ticketNumbers,
        passengers: pax || []
      })
    }

    // ── 3. State machine guard (only CONFIRMED → TICKETED) ───────────────
    try { assertTransition(booking.status, STATUSES.TICKETED) } catch (e) {
      console.warn(`⛔ Ticket blocked: ${booking.status} → TICKETED for booking ${id}`)
      return res.status(409).json({ success: false, error: e.message })
    }

    // ── 4. Validate prerequisites ────────────────────────────────────────
    if (!booking.gds_order_id) {
      return res.status(400).json({
        success: false,
        error: 'No Amadeus order ID found — booking must be held before ticketing'
      })
    }

    // ── 5. Load passengers for ticket number mapping ─────────────────────
    const { data: passengers, error: pErr } = await supabase
      .from('booking_passengers').select('*').eq('booking_id', id).order('id')
    if (pErr) throw pErr
    if (!passengers || passengers.length === 0) {
      return res.status(400).json({ success: false, error: 'No passengers found for this booking' })
    }

    // ── 6. Call Amadeus Ticketing API ─────────────────────────────────────
    console.log(`🔄 Calling Amadeus ticketing for booking ${id} (order: ${booking.gds_order_id})...`)

    let ticketResult
    try {
      ticketResult = await issueBooking(booking, {
        amadeusFetch,
        passengers
      })
    } catch (amadeusErr) {
      const errDetails = amadeusErr.response?.data || null
      console.error(`❌ Amadeus ticketing failed for booking ${id}:`, {
        message: amadeusErr.message,
        status: amadeusErr.response?.status,
        details: errDetails ? JSON.stringify(errDetails).slice(0, 500) : 'none'
      })
      return res.status(502).json({
        success: false,
        error: `Amadeus ticketing failed: ${amadeusErr.message}`,
        details: errDetails
      })
    }

    const { ticketMap, rawTicketNumbers, rawResponse } = ticketResult
    console.log(`🎫 Amadeus success: ${rawTicketNumbers.length} ticket(s) issued`)

    // ═══════════════════════════════════════════════════════════════════════
    // ── 7. ATOMIC DB WRITE — single PostgreSQL transaction via RPC ────────
    // Amadeus ticketing succeeded. All DB writes execute atomically.
    // If RPC fails → auto-ROLLBACK, log for manual recovery.
    // ═══════════════════════════════════════════════════════════════════════
    try {
      // bookings.status is the ONLY lifecycle authority.
      // main_table.booking_status is legacy/financial metadata only.
      // RPC finalize_ticket_atomic updates bookings.status = 'TICKETED'
      const { data: rpcResult, error: rpcErr } = await supabase.rpc('finalize_ticket_atomic', {
        p_booking_id: id,
        p_order_id: booking.gds_order_id,
        p_ticket_map: ticketMap,
        p_raw_response: rawResponse
      })

      if (rpcErr) throw rpcErr
      console.log(`✅ finalize_ticket_atomic success:`, JSON.stringify(rpcResult))
    } catch (rpcErr) {
      // Tickets issued in Amadeus but DB transaction ROLLED BACK
      console.error(`🚨 CRITICAL: Tickets issued in Amadeus but DB transaction failed for booking ${id}:`, rpcErr.message)
      await supabase.from('audit_logs').insert([{
        action: 'TICKET_DB_ROLLBACK_NEEDED',
        order_id: booking.gds_order_id,
        status: 'ERROR',
        raw_response: {
          bookingId: id,
          ticketNumbers: rawTicketNumbers,
          ticketMap,
          rpcError: rpcErr.message,
          timestamp: new Date().toISOString()
        }
      }]).catch(() => { })
      return res.status(500).json({
        success: false,
        error: 'Tickets issued in Amadeus but DB transaction failed — contact support',
        ticketNumbers: rawTicketNumbers
      })
    }

    // ── 8. Return success ────────────────────────────────────────────────
    const elapsed = Date.now() - startTime
    console.log(`✅ Booking ${id} ticketed: [${rawTicketNumbers.join(', ')}] (${elapsed}ms)`)

    res.json({
      success: true,
      ticketNumbers: rawTicketNumbers,
      passengers: passengers.map(p => ({
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        ticket_number: ticketMap[p.id] || null
      }))
    })

  } catch (err) {
    const elapsed = Date.now() - startTime
    console.error(`❌ Ticket endpoint unexpected error (${elapsed}ms):`, err.message, err.stack?.split('\n').slice(0, 3).join(' '))
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/bookings/:id/cancel — Transition → CANCELLED
app.post('/api/bookings/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params
    const { data: booking } = await supabase.from('bookings').select('status').eq('id', id).maybeSingle()
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' })

    // bookings.status is the ONLY lifecycle authority.
    // main_table.booking_status is legacy/financial metadata only.
    try { assertTransition(booking.status, STATUSES.CANCELLED) } catch (e) {
      return res.status(409).json({ success: false, error: e.message })
    }

    await supabase.from('bookings').update({ status: 'CANCELLED' }).eq('id', id)
    res.json({ success: true, message: 'Booking cancelled' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

const startServer = async () => {
  // Always write the port file FIRST so Vite proxy reads the correct target.
  // Try the preferred port; if busy, pick a random one.
  let port = PREFERRED_PORT

  const tryBind = (p) => new Promise((resolve, reject) => {
    const s = net.createServer()
    s.once('error', reject)
    s.listen(p, () => s.close(() => resolve(p)))
  })

  try {
    await tryBind(port)
  } catch {
    // Preferred port busy — pick a random available port
    port = await new Promise((resolve) => {
      const s = net.createServer()
      s.listen(0, () => { const p = s.address().port; s.close(() => resolve(p)) })
    })
    console.warn(`⚠️ Port ${PREFERRED_PORT} busy, using ${port}`)
  }

  // Write port file before starting so Vite proxy can find it
  process.env.API_PORT = String(port)
  try { fs.writeFileSync(BACKEND_PORT_FILE, String(port)) } catch (e) { }

  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`)
    verifyAmadeusConnection()

    // ── Background Expiry Worker ────────────────────────────────────────
    // bookings.status is the ONLY lifecycle authority.
    // main_table.booking_status is legacy/financial metadata only.
    // Every 5 minutes: expire stale HELD bookings + unlock passengers.
    // Uses expire_stale_holds() RPC for atomic batch update (sets bookings.status = 'EXPIRED').
    const EXPIRY_INTERVAL_MS = 5 * 60 * 1000  // 5 minutes
    setInterval(async () => {
      try {
        const { data, error } = await supabase.rpc('expire_stale_holds')
        if (error) {
          console.error('⚠️  Expiry worker RPC error:', error.message)
          return
        }
        if (data?.expired_count > 0) {
          console.log(`⏰ Expiry worker: ${data.expired_count} booking(s) expired, ${data.unlocked_count} passenger(s) unlocked`)
        }
      } catch (err) {
        console.error('⚠️  Expiry worker unexpected error:', err.message)
      }
    }, EXPIRY_INTERVAL_MS)
    console.log(`⏰ Background expiry worker started (every ${EXPIRY_INTERVAL_MS / 1000}s)`)
  })
}

startServer()
