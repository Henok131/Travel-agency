import { createClient } from '@supabase/supabase-js'

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
// Normalize: no trailing slash to avoid double slashes in API calls
const supabaseUrl = rawUrl.replace(/\/+$/, '')
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

// Startup log for debugging
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('localhost')
)

if (!isSupabaseConfigured) {
  console.error('⚠️ Supabase is not configured correctly. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

export { isSupabaseConfigured }

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
)
