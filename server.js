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

console.log('✅ Amadeus credentials loaded')
console.log('   Client ID:', maskValue(process.env.AMADEUS_CLIENT_ID || ''))
console.log('   Host:', process.env.AMADEUS_HOST)
console.log('\n🔍 Amadeus Configuration:')
console.log('Environment: TEST (sandbox)')
console.log('Host:', process.env.AMADEUS_HOST)
console.log('Client ID:', (process.env.AMADEUS_CLIENT_ID || '').substring(0, 10) + '...')
if (!String(process.env.AMADEUS_HOST || '').includes('test.api.amadeus.com')) {
  console.warn('⚠️  WARNING: Not using test environment!')
  console.warn('   Expected: https://test.api.amadeus.com')
  console.warn('   Got:', process.env.AMADEUS_HOST)
}

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

// Initialize Supabase client with service role key (bypasses RLS)
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const devOrganizationId = process.env.DEV_ORGANIZATION_ID || 'e17ed5ec-a533-4803-9568-e317ad1f9b3f'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('✅ Supabase service role client initialized')
console.log('✅ Dev Organization ID:', devOrganizationId)
console.log('✅ Amadeus host:', AMADEUS_HOST)
console.log('✅ Amadeus client_id:', maskValue(AMADEUS_CLIENT_ID))
console.log('✅ Amadeus client_secret:', AMADEUS_CLIENT_SECRET ? '*** set ***' : '❌ missing')

// -----------------------------------------------------------------------------
// Amadeus helpers (token cache + guarded fetch)
// -----------------------------------------------------------------------------

let amadeusTokenCache = {
  token: null,
  expiresAt: 0
}

const ensureAmadeusCredentials = () => {
  const missing = []
  if (!AMADEUS_CLIENT_ID) missing.push('AMADEUS_CLIENT_ID')
  if (!AMADEUS_CLIENT_SECRET) missing.push('AMADEUS_CLIENT_SECRET')
  if (!AMADEUS_HOST) missing.push('AMADEUS_HOST')

  return {
    ok: missing.length === 0,
    missing,
    message: missing.length === 0 ? 'Amadeus credentials present' : `Missing required Amadeus env vars: ${missing.join(', ')}`
  }
}

const amadeusHeaders = () => ({
  'Content-Type': 'application/x-www-form-urlencoded'
})

const getAmadeusToken = async () => {
  if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) {
    throw new Error('Amadeus credentials missing; set AMADEUS_CLIENT_ID/AMADEUS_CLIENT_SECRET')
  }

  const now = Date.now()
  if (amadeusTokenCache.token && amadeusTokenCache.expiresAt > now + 10_000) {
    return amadeusTokenCache.token
  }

  try {
    // Log request config (masked) for debugging invalid_client
    console.log('🔎 Amadeus token request:', {
      url: `${AMADEUS_HOST}/v1/security/oauth2/token`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      bodyKeys: ['grant_type', 'client_id', 'client_secret'],
      clientId: maskValue(AMADEUS_CLIENT_ID),
      secretPresent: !!AMADEUS_CLIENT_SECRET
    })

    const response = await axios.post(
      `${AMADEUS_HOST}/v1/security/oauth2/token`,
      qs.stringify({
        grant_type: 'client_credentials',
        client_id: AMADEUS_CLIENT_ID,
        client_secret: AMADEUS_CLIENT_SECRET
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: AMADEUS_TIMEOUT_MS
      }
    )

    const json = response.data || {}
    const expiresIn = json.expires_in ? Number(json.expires_in) * 1000 : 30 * 60 * 1000
    amadeusTokenCache = {
      token: json.access_token,
      expiresAt: Date.now() + expiresIn
    }
    return json.access_token
  } catch (error) {
    const msg = error?.response?.data ? JSON.stringify(error.response.data) : error.message
    console.error('❌ Amadeus token error:', msg)
    throw new Error(`Amadeus token failed: ${msg}`)
  }
}

const amadeusFetch = async (path, options = {}) => {
  try {
    const token = await getAmadeusToken()
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
    const resp = await fetch(`${AMADEUS_HOST}${path}`, {
      ...options,
      headers,
      signal: options.signal || AbortSignal.timeout(AMADEUS_TIMEOUT_MS)
    })

    if (!resp.ok) {
      const errorText = await resp.text()
      throw new Error(`Amadeus API error: ${resp.status} - ${errorText}`)
    }

    const text = await resp.text()
    const json = text ? JSON.parse(text) : {}
    return json
  } catch (error) {
    console.error('❌ Amadeus API call failed:', error.message)
    throw error
  }
}

const verifyAmadeusConnection = async () => {
  const creds = ensureAmadeusCredentials()
  if (!creds.ok) {
    console.error('❌ Amadeus credentials check failed:', creds.message)
    return
  }
  try {
    await getAmadeusToken()
    console.log('✅ Amadeus API connected')
  } catch (err) {
    console.error('❌ Amadeus API connection failed:', err.message)
  }
}

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

// API Endpoint: Create Request
app.post('/api/create-request', async (req, res) => {
  try {
    const requestData = req.body

    // Validate required fields
    if (!requestData.first_name || !requestData.last_name) {
      return res.status(400).json({
        error: 'Missing required fields: first_name and last_name are required'
      })
    }

    // Ensure organization_id is set to dev organization
    const dataToInsert = {
      ...requestData,
      organization_id: devOrganizationId
    }

    // Insert into requests table using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('requests')
      .insert([dataToInsert])
      .select()

    if (error) {
      console.error('❌ Database error:', error)
      return res.status(500).json({
        error: 'Failed to create request',
        details: error.message
      })
    }

    // If booking_ref is provided, update main_table
    if (requestData.booking_ref && data && data.length > 0) {
      const { error: updateError } = await supabase
        .from('main_table')
        .update({ booking_ref: requestData.booking_ref })
        .eq('id', data[0].id)

      if (updateError) {
        console.warn('⚠️ Warning: Failed to update main_table booking_ref:', updateError.message)
        // Don't fail the request if main_table update fails
      }
    }

    res.status(201).json({
      success: true,
      data: data[0]
    })
  } catch (error) {
    console.error('❌ Server error:', error)
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    })
  }
})

// API Endpoint: Create Multiple Requests (for family mode)
app.post('/api/create-requests', async (req, res) => {
  try {
    const requestsData = req.body.requests

    if (!Array.isArray(requestsData) || requestsData.length === 0) {
      return res.status(400).json({
        error: 'Invalid request: requests must be a non-empty array'
      })
    }

    // Validate all requests have required fields
    for (const req of requestsData) {
      if (!req.first_name || !req.last_name) {
        return res.status(400).json({
          error: 'Missing required fields: all requests must have first_name and last_name'
        })
      }
    }

    // Ensure organization_id is set to dev organization for all requests
    const dataToInsert = requestsData.map(req => ({
      ...req,
      organization_id: devOrganizationId
    }))

    // Insert all requests using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('requests')
      .insert(dataToInsert)
      .select()

    if (error) {
      console.error('❌ Database error:', error)
      return res.status(500).json({
        error: 'Failed to create requests',
        details: error.message
      })
    }

    // Update main_table with booking_ref if provided
    const bookingRef = req.body.booking_ref
    if (bookingRef && data && data.length > 0) {
      const ids = data.map(r => r.id)
      const { error: updateError } = await supabase
        .from('main_table')
        .update({ booking_ref: bookingRef })
        .in('id', ids)

      if (updateError) {
        console.warn('⚠️ Warning: Failed to update main_table booking_ref:', updateError.message)
        // Don't fail the request if main_table update fails
      }
    }

    res.status(201).json({
      success: true,
      data: data,
      count: data.length
    })
  } catch (error) {
    console.error('❌ Server error:', error)
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    })
  }
})

// API Endpoint: Signup completion (service role)
// Creates organization, user profile, and organization_members (owner) for a user
app.post('/api/signup-complete', async (req, res) => {
  try {
    const { user_id, full_name, organization_name, email } = req.body

    if (!user_id || !organization_name || !email) {
      return res.status(400).json({ error: 'Missing required fields: user_id, email, organization_name' })
    }

    // Generate slug
    const slugBase = organization_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'org'
    const slug = `${slugBase}-${user_id.substring(0, 8)}`

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert([{ name: organization_name, slug }])
      .select()
      .single()

    if (orgError) {
      // If unique constraint, try to fetch existing
      if (orgError.code === '23505') {
        const { data: existingOrg, error: fetchOrgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('slug', slug)
          .single()
        if (fetchOrgError) {
          return res.status(500).json({ error: 'Failed to create or load organization', details: fetchOrgError.message })
        }
        org = existingOrg
      } else {
        return res.status(500).json({ error: 'Failed to create organization', details: orgError.message })
      }
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert([{
        id: user_id,
        email,
        full_name
      }], { onConflict: 'id' })

    if (profileError) {
      return res.status(500).json({ error: 'Failed to create profile', details: profileError.message })
    }

    // Create organization membership as owner
    const { error: memberError } = await supabase
      .from('organization_members')
      .upsert([{
        user_id: user_id,
        organization_id: org.id,
        role: 'owner'
      }], { onConflict: 'organization_id,user_id' })

    if (memberError) {
      return res.status(500).json({ error: 'Failed to create organization membership', details: memberError.message })
    }

    return res.json({ success: true, organization: org })
  } catch (error) {
    console.error('❌ Signup completion error:', error)
    return res.status(500).json({ error: 'Signup completion failed', details: error.message })
  }
})

// ---------------------------------------------------------------------------
// Amadeus: Search flights
// ---------------------------------------------------------------------------
app.post('/api/amadeus/search', async (req, res) => {
  try {
    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults = 1,
      children = 0,
      infants = 0,
      currencyCode = 'EUR',
      travelClass,
      nonStop
    } = req.body || {}
    if (!originLocationCode || !destinationLocationCode || !departureDate) {
      return res.status(400).json({ error: 'originLocationCode, destinationLocationCode, and departureDate are required' })
    }

    const params = new URLSearchParams({
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults: String(adults),
      currencyCode
    })
    if (returnDate) params.append('returnDate', returnDate)
    if (children) params.append('children', String(children))
    if (infants) params.append('infants', String(infants))
    if (travelClass) params.append('travelClass', travelClass)
    if (nonStop !== undefined) params.append('nonStop', String(!!nonStop))

    const data = await amadeusFetch(`/v2/shopping/flight-offers?${params.toString()}`, { method: 'GET' })

    const offers = (data?.data || []).map((offer) => {
      const itineraries = offer?.itineraries || []
      const firstItinerary = itineraries[0] || {}
      const lastItinerary = itineraries[itineraries.length - 1] || firstItinerary
      const firstSeg = firstItinerary?.segments?.[0]
      const lastSeg = lastItinerary?.segments?.[lastItinerary?.segments?.length - 1]

      const departAt = firstSeg?.departure?.at || ''
      const arriveAt = lastSeg?.arrival?.at || ''

      const departTime = departAt ? departAt.slice(11, 16) : ''
      const arriveTime = arriveAt ? arriveAt.slice(11, 16) : ''

      return {
        id: offer?.id,
        price: Number(offer?.price?.total) || null,
        currency: offer?.price?.currency || currencyCode || 'EUR',
        airline: firstSeg?.carrierCode || '',
        flightNumber: firstSeg?.number || '',
        depart: departTime,
        arrive: arriveTime,
        duration: firstItinerary?.duration || '',
        from: firstSeg?.departure?.iataCode || originLocationCode,
        to: lastSeg?.arrival?.iataCode || destinationLocationCode,
        date: departAt ? departAt.slice(0, 10) : departureDate,
        offer
      }
    })

    res.json({ success: true, data: { offers, raw: data } })
  } catch (error) {
    console.error('❌ Amadeus search failed:', error)
    res.status(500).json({ error: error.message || 'Amadeus search failed', details: error.response || null })
  }
})

// ---------------------------------------------------------------------------
// Amadeus: Health check (token validation)
// ---------------------------------------------------------------------------
app.get('/api/amadeus/health', async (_req, res) => {
  const creds = ensureAmadeusCredentials()
  if (!creds.ok) {
    return res.status(400).json({ status: 'error', error: creds.message })
  }

  try {
    await getAmadeusToken()
    res.json({
      status: 'ok',
      host: AMADEUS_HOST,
      tokenCached: !!amadeusTokenCache.token,
      tokenExpiresAt: amadeusTokenCache.expiresAt ? new Date(amadeusTokenCache.expiresAt).toISOString() : null
    })
  } catch (error) {
    console.error('❌ Amadeus health failed:', error)
    res.status(500).json({ status: 'error', error: error.message || 'Amadeus health failed', details: error.response || null })
  }
})

// ---------------------------------------------------------------------------
// Amadeus: Test token endpoint (debug)
// ---------------------------------------------------------------------------
app.get('/api/amadeus/test-token', async (_req, res) => {
  const creds = ensureAmadeusCredentials()
  if (!creds.ok) {
    return res.status(400).json({
      success: false,
      error: creds.message,
      host: AMADEUS_HOST
    })
  }
  try {
    const token = await getAmadeusToken()
    console.log('🔍 Test token env:', {
      host: AMADEUS_HOST,
      clientId: maskValue(AMADEUS_CLIENT_ID)
    })
    res.json({
      success: true,
      message: 'Token generated successfully',
      tokenPreview: token ? token.substring(0, 20) + '...' : null,
      host: AMADEUS_HOST
    })
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Amadeus authentication failed',
      details: error.message,
      host: AMADEUS_HOST
    })
  }
})

// ---------------------------------------------------------------------------
// Amadeus: Airport/City search (IATA autocomplete)
// ---------------------------------------------------------------------------
app.post('/api/amadeus/airports/search', async (req, res) => {
  const { keyword } = req.body || {}
  const trimmed = (keyword || '').trim()

  if (!trimmed || trimmed.length < 2) {
    return res.status(400).json({ error: 'Keyword must be at least 2 characters' })
  }

  const creds = ensureAmadeusCredentials()
  if (!creds.ok) {
    return res.status(400).json({ error: creds.message })
  }

  try {
    const params = new URLSearchParams({
      keyword: trimmed,
      subType: 'AIRPORT,CITY',
      'page[limit]': '10'
    })

    const data = await amadeusFetch(`/v1/reference-data/locations?${params.toString()}`, { method: 'GET' })
    const airports = (data.data || []).map((location) => ({
      iataCode: location.iataCode,
      name: location.name,
      cityName: location.address?.cityName || '',
      countryCode: location.address?.countryCode || '',
      type: location.subType
    }))

    res.json({ success: true, data: airports })
  } catch (error) {
    console.error('❌ Airport search failed:', error.message)
    res.status(500).json({
      error: 'Airport search failed',
      details: error.message
    })
  }
})

// ---------------------------------------------------------------------------
// Amadeus: Create hold -> write to main_table (pending)
// ---------------------------------------------------------------------------
app.post('/api/amadeus/hold', async (req, res) => {
  try {
    const { bookingId, offer, passengers = [], pricing = {}, itinerary = {}, bookingRef, holdExpiresAt } = req.body || {}

    let amadeusOrderId = null
    let amadeusPnr = null
    let holdExpiry = holdExpiresAt || null

    // Optional: attempt to create Amadeus flight-order when offer is provided
    try {
      if (offer) {
        const normalizeTraveler = (traveler, idx) => {
          const phoneRaw = traveler?.phone || traveler?.phoneNumber || ''
          const cleanPhone = phoneRaw.replace(/[^\d+]/g, '')
          const countryCallingCode = cleanPhone.startsWith('+') ? cleanPhone.slice(1, 3) : ''
          const number = cleanPhone.startsWith('+') ? cleanPhone.slice(3) : cleanPhone

          return {
            id: String(idx + 1),
            dateOfBirth: traveler?.dateOfBirth || traveler?.date_of_birth || null,
            name: {
              firstName: (traveler?.firstName || traveler?.first_name || '').toUpperCase(),
              lastName: (traveler?.lastName || traveler?.last_name || '').toUpperCase()
            },
            gender: (traveler?.gender || '').toUpperCase(),
            contact: traveler?.email || phoneRaw ? {
              emailAddress: traveler?.email || traveler?.emailAddress || null,
              phones: phoneRaw ? [{
                deviceType: 'MOBILE',
                countryCallingCode: countryCallingCode || undefined,
                number: number || undefined
              }] : undefined
            } : undefined,
            documents: traveler?.passportNumber ? [{
              documentType: 'PASSPORT',
              number: traveler.passportNumber,
              holder: true
            }] : undefined
          }
        }

        const travelers = passengers.map(normalizeTraveler)
        const payload = {
          data: {
            type: 'flight-order',
            flightOffers: [offer],
            travelers
          }
        }
        const result = await amadeusFetch('/v1/shopping/flight-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        amadeusOrderId = result?.data?.id || null
        amadeusPnr = result?.data?.associatedRecords?.[0]?.reference || null
        holdExpiry = holdExpiry || result?.data?.flightOffers?.[0]?.lastTicketingDateTime || null
      }
    } catch (amadeusErr) {
      console.warn('⚠️ Amadeus hold call failed; falling back to local insert', amadeusErr.message)
    }

    const primaryPassenger = passengers[0] || {}
    const payload = buildMainTablePayload({
      passenger: primaryPassenger,
      itinerary,
      pricing,
      bookingRef,
      amadeusOrderId,
      amadeusPnr,
      holdExpiresAt: holdExpiry
    })

    let record = null
    if (bookingId) {
      const { data, error } = await supabase
        .from('main_table')
        .update(payload)
        .eq('id', bookingId)
        .select()
        .maybeSingle()

      if (error) throw error
      record = data
    } else {
      const { data, error } = await supabase
        .from('main_table')
        .insert([payload])
        .select()
        .maybeSingle()

      if (error) throw error
      record = data
    }

    res.json({
      success: true,
      data: {
        ...record,
        amadeus_order_id: amadeusOrderId || record?.amadeus_order_id || null,
        amadeus_pnr: amadeusPnr || record?.amadeus_pnr || null
      }
    })
  } catch (error) {
    console.error('❌ Amadeus hold failed:', error)
    res.status(500).json({ error: error.message || 'Amadeus hold failed', details: error.response || null })
  }
})

// ---------------------------------------------------------------------------
// Amadeus: Ticket issuance -> update main_table (confirmed)
// ---------------------------------------------------------------------------
app.post('/api/amadeus/ticket', async (req, res) => {
  try {
    const {
      bookingId,
      paymentAmount,
      paymentCurrency = 'EUR',
      eticketUrl
    } = req.body || {}

    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required to update ticketing' })
    }

    // Fetch booking to get order id
    const { data: booking, error: bookingError } = await supabase
      .from('main_table')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle()

    if (bookingError) throw bookingError

    if (!booking?.amadeus_order_id) {
      return res.status(400).json({ error: 'No Amadeus order found' })
    }

    const baseUpdate = {
      booking_status: 'confirmed',
      payment_status: 'paid',
      payment_amount: safeNumber(paymentAmount),
      payment_currency: paymentCurrency || 'EUR',
      bank_transfer: paymentAmount ? true : booking?.bank_transfer,
      eticket_url: eticketUrl || null
    }

    try {
      const ticketResponse = await amadeusFetch(
        `/v1/booking/flight-orders/${booking.amadeus_order_id}/ticketing`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { ticketingMethod: 'AUTOMATIC' } })
        }
      )

      const ticketNumber =
        ticketResponse?.data?.ticketNumber ||
        ticketResponse?.data?.documents?.[0]?.number ||
        `ETKT-${booking.amadeus_order_id}`

      const { data, error } = await supabase
        .from('main_table')
        .update({
          ...baseUpdate,
          amadeus_ticket_number: ticketNumber
        })
        .eq('id', bookingId)
        .select()
        .maybeSingle()

      if (error) throw error

      console.log('🟢 Amadeus ticketed', { bookingId, ticketNumber, order: booking.amadeus_order_id })

      res.json({ success: true, ticketNumber, data })
    } catch (autoErr) {
      console.warn('Auto-ticketing not available:', autoErr.message)

      const manualTicket = `MANUAL-${booking.amadeus_order_id}`
      const { data, error } = await supabase
        .from('main_table')
        .update({
          ...baseUpdate,
          amadeus_ticket_number: manualTicket
        })
        .eq('id', bookingId)
        .select()
        .maybeSingle()

      if (error) throw error

      res.json({
        success: true,
        ticketNumber: manualTicket,
        note: 'Manual ticketing required',
        data
      })
    }
  } catch (error) {
    console.error('❌ Amadeus ticket update failed:', error)
    res.status(500).json({ error: error.message || 'Amadeus ticket update failed', details: error.response || null })
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'LST Travel API',
    timestamp: new Date().toISOString()
  })
})

const findAvailablePort = (startPort, attempts = 5) =>
  new Promise((resolve) => {
    const tryListen = (port, remaining) => {
      const tester = net.createServer()
      tester.unref()
      tester.on('error', () => {
        if (remaining > 0) {
          tryListen(port + 1, remaining - 1)
        } else {
          // Fall back to any free port
          const fallback = net.createServer()
          fallback.unref()
          fallback.listen(0, () => {
            const { port: assigned } = fallback.address()
            fallback.close(() => resolve({ port: assigned, note: 'random' }))
          })
        }
      })
      tester.listen(port, () => {
        tester.close(() => resolve({ port, note: port === startPort ? 'preferred' : 'fallback' }))
      })
    }
    tryListen(startPort, attempts)
  })

const writePortFile = (port) => {
  try {
    fs.writeFileSync(BACKEND_PORT_FILE, String(port))
  } catch (err) {
    console.warn('⚠️ Could not write backend port file:', err.message)
  }
}

const startServer = async () => {
  const { port, note } = await findAvailablePort(PREFERRED_PORT)
  process.env.API_PORT = String(port)
  writePortFile(port)

  const serverInstance = app.listen(port, () => {
    console.log(`🚀 API Server running on http://localhost:${port} (${note})`)
    console.log(`📡 Endpoints:`)
    console.log(`   POST /api/create-request`)
    console.log(`   POST /api/create-requests`)
    console.log(`   POST /api/amadeus/search`)
    console.log(`   POST /api/amadeus/airports/search`)
    console.log(`   POST /api/amadeus/hold`)
    console.log(`   POST /api/amadeus/ticket`)
    console.log(`   GET  /api/amadeus/health`)
    console.log(`   GET  /api/health`)
    verifyAmadeusConnection()
  })

  serverInstance.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use. Stop other dev servers or set API_PORT to a free port.`)
      process.exit(1)
    }
    throw err
  })
}

startServer()
