import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const app = express()
const PORT = process.env.API_PORT || 3001

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'LST Travel API',
    timestamp: new Date().toISOString()
  })
})

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`)
  console.log(`📡 Endpoints:`)
  console.log(`   POST /api/create-request`)
  console.log(`   POST /api/create-requests`)
  console.log(`   GET  /api/health`)
})
