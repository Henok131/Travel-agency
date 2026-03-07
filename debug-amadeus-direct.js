
import axios from 'axios'
import qs from 'qs'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// Load env
const envPath = path.resolve(process.cwd(), '.env')
dotenv.config({ path: envPath })

const AMADEUS_HOST = process.env.AMADEUS_HOST || 'https://test.api.amadeus.com'
const CLIENT_ID = process.env.AMADEUS_CLIENT_ID
const CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Missing Amadeus credentials in .env')
    process.exit(1)
}

async function getToken() {
    const res = await axios.post(
        `${AMADEUS_HOST}/v1/security/oauth2/token`,
        qs.stringify({
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )
    return res.data.access_token
}

async function testFlow() {
    try {
        const token = await getToken()
        console.log('✅ Auth Token Otained')

        // 1. Search
        console.log('🔎 Searching for flights...')
        const searchRes = await axios.get(
            `${AMADEUS_HOST}/v2/shopping/flight-offers?originLocationCode=MUC&destinationLocationCode=LHR&departureDate=2026-03-01&adults=1&max=1`,
            { headers: { Authorization: `Bearer ${token}` } }
        )

        if (!searchRes.data.data || searchRes.data.data.length === 0) {
            throw new Error('No flights found')
        }

        const offer = searchRes.data.data[0]
        console.log(`✅ Flight found: ID=${offer.id}, Price=${offer.price.total}`)
        console.log(`📦 Offer Source: ${offer.source}, InstantPayment: ${offer.instantPaymentAllowed}`)

        // 2. Try strict Order WITHOUT Pricing (as per user request)
        const travelers = [{
            id: '1',
            dateOfBirth: '1990-01-01',
            name: { firstName: 'TEST', lastName: 'USER' },
            gender: 'MALE',
            contact: {
                emailAddress: 'test@test.com',
                phones: [{ deviceType: 'MOBILE', countryCallingCode: '1', number: '1234567890' }]
            },
            documents: [{
                documentType: 'PASSPORT',
                number: '00000000',
                expiryDate: '2030-01-01',
                issuanceCountry: 'DE',
                nationality: 'DE',
                holder: true
            }]
        }]

        const orderPayload = {
            data: {
                type: 'flight-order',
                flightOffers: [offer], // Parsing exact search result
                travelers: travelers
            }
        }

        console.log('🚀 Sending ORDER request (Direct from Search)...')
        try {
            const orderRes = await axios.post(
                `${AMADEUS_HOST}/v1/shopping/flight-orders`,
                orderPayload,
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            )
            console.log('✅ Order SUCCESS!')
            console.log('PNR:', orderRes.data.data.associatedRecords[0].reference)
        } catch (err) {
            console.error('❌ Order FAILED')
            if (err.response) {
                console.error('Status:', err.response.status)
                console.error('Data:', JSON.stringify(err.response.data, null, 2))
            } else {
                console.error(err.message)
            }
        }

    } catch (e) {
        console.error('FATAL:', e.message)
        if (e.response) console.error(JSON.stringify(e.response.data, null, 2))
    }
}

testFlow()
