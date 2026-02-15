import fs from 'node:fs'
import path from 'node:path'
import net from 'node:net'
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import axios from 'axios'
import qs from 'qs'

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

const REQUIRED_ENV_VARS = ['AMADEUS_CLIENT_ID', 'AMADEUS_CLIENT_SECRET', 'AMADEUS_HOST']
const missingEnv = REQUIRED_ENV_VARS.filter((v) => {
  const val = process.env[v]
  return !val || String(val).trim().length === 0
})
if (missingEnv.length > 0) {
  console.error('❌ Missing environment variables in .env.local:', missingEnv.join(', '))
  process.exit(1)
}
console.log('🔎 Amadeus env check:')
console.log('   Client ID (masked):', maskValue(process.env.AMADEUS_CLIENT_ID || ''))
console.log('   Secret present:', !!process.env.AMADEUS_CLIENT_SECRET)
console.log('   Host:', process.env.AMADEUS_HOST)
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

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), amadeus_host: AMADEUS_HOST })
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
      throw new Error(`Amadeus API error ${err.response.status}: ${details}`)
    }
    throw new Error(`Amadeus API error: ${err.message}`)
  }
}

const verifyAmadeusConnection = async () => {
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
    booking_status: 'pending',
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

// Search
app.post('/api/amadeus/search', async (req, res) => {
  console.log('🔎 Search REQ:', JSON.stringify(req.body))
  try {
    const { originLocationCode, destinationLocationCode, departureDate, returnDate, adults = 1, currencyCode = 'EUR', nonStop } = req.body
    if (!originLocationCode || !destinationLocationCode || !departureDate) {
      console.warn('⚠️ Missing search params')
      return res.status(400).json({ error: 'Missing search params' })
    }

    const params = new URLSearchParams({
      originLocationCode, destinationLocationCode, departureDate, adults, currencyCode
    })
    if (returnDate) params.append('returnDate', returnDate)
    if (nonStop) params.append('nonStop', 'true')

    const url = `/v2/shopping/flight-offers?${params.toString()}`
    console.log(`✈️ Amadeus Request: ${url}`)

    const data = await amadeusFetch(url, { method: 'GET' })
    const count = data?.data?.length || 0
    console.log(`✅ Amadeus Response: ${count} offers found`)

    // Map to simplified frontend model
    const offers = (data?.data || []).map((offer) => {
      const itins = offer.itineraries || []
      const segs = itins[0]?.segments || []
      return {
        id: offer.id,
        price: Number(offer.price?.total),
        currency: offer.price?.currency,
        airline: segs[0]?.carrierCode,
        offer // keep raw for booking
      }
    })

    res.json({ success: true, data: { offers, raw: data } })
  } catch (err) {
    console.error('❌ Search Error:', err.message)
    if (err.response) {
      const details = err.response.data
      console.error('❌ Amadeus Error Details:', JSON.stringify(details))

      // Extract a user-friendly message if possible (e.g. "INVALID DATE: Date/Time is in the past")
      const firstError = details.errors?.[0]
      const cleanMsg = firstError ? `${firstError.title}: ${firstError.detail}` : (err.message || 'Amadeus API Error')

      return res.status(err.response.status).json({ error: cleanMsg, details })
    }
    res.status(500).json({ error: err.message })
  }
})

// NEW: Price Confirmation
app.post('/api/amadeus/price', async (req, res) => {
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

// UPDATED: Create Booking (Hold)
app.post('/api/amadeus/hold', async (req, res) => {
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
    const { data: booking, error: bkErr } = await supabase.from('bookings').insert([{
      user_id: user_id || null, gds_pnr: pnr, gds_order_id: orderId, status: 'PENDING_PAYMENT',
      total_price: total, currency: pricing.currency || 'EUR', ticket_time_limit: expiry
    }]).select().single()
    if (bkErr) throw bkErr

    await supabase.from('booking_offers').insert([{ booking_id: booking.id, offer_json: offer }])

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
        .update({ ...mainPayload, booking_status: 'pending' })
        .eq('id', bookingId).select().single()
      legacyData = data
    } else {
      // Create new
      const { data } = await supabase.from('main_table')
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

// Ticket
app.post('/api/amadeus/ticket', async (req, res) => {
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

      await supabase.from('main_table').update({
        booking_status: 'confirmed', payment_status: 'paid', amadeus_ticket_number: ticketNum, payment_amount: paymentAmount
      }).eq('id', bookingId)

      // Also update normalized table
      await supabase.from('bookings').update({ status: 'TICKETED' }).eq('gds_order_id', booking.amadeus_order_id)

      res.json({ success: true, ticketNumber: ticketNum })
    } catch (e) {
      console.warn('Auto-ticketing failed, manual required', e.message)
      const manualTkt = `MANUAL-${booking.amadeus_order_id}`
      await supabase.from('main_table').update({
        booking_status: 'confirmed', payment_status: 'paid', amadeus_ticket_number: manualTkt, payment_amount: paymentAmount
      }).eq('id', bookingId)

      res.json({ success: true, ticketNumber: manualTkt, note: 'Manual intervention required' })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Airports
app.post('/api/amadeus/airports/search', async (req, res) => {
  const { keyword } = req.body
  if (!keyword || keyword.length < 2) return res.status(400).json({ error: 'Min 2 chars' })

  try {
    const data = await amadeusFetch(`/v1/reference-data/locations?subType=AIRPORT,CITY&keyword=${keyword}&page[limit]=10`, { method: 'GET' })
    res.json({ success: true, data: data.data.map(l => ({ iataCode: l.iataCode, name: l.name, cityName: l.address?.cityName })) })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

const startServer = async () => {
  const { port, note } = await new Promise(resolve => {
    const s = net.createServer()
    s.listen(PREFERRED_PORT, () => { s.close(() => resolve({ port: PREFERRED_PORT, note: 'preferred' })) })
    s.on('error', () => {
      const s2 = net.createServer(); s2.listen(0, () => { const p = s2.address().port; s2.close(() => resolve({ port: p, note: 'random' })) })
    })
  })

  process.env.API_PORT = String(port)
  try { fs.writeFileSync(BACKEND_PORT_FILE, String(port)) } catch (e) { }

  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`)
    verifyAmadeusConnection()
  })
}

startServer()
