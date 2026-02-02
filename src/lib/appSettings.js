import { supabase } from '@/lib/supabaseClient'
import { APP_ID } from './appConfig'

// Upsert a setting value (JSON) for the fixed APP_ID
export async function setAppSetting(key, value) {
  const payload = {
    app_id: APP_ID,
    key,
    value
  }
  const { error } = await supabase
    .from('app_settings')
    .upsert(payload, { onConflict: 'app_id,key' })
  if (error) throw error
  return value
}

// Fetch a setting value, falling back to defaultValue if missing
export async function getAppSetting(key, defaultValue = null) {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('app_id', APP_ID)
    .eq('key', key)
    .maybeSingle()
  if (error) throw error
  if (!data || data.value === undefined || data.value === null) {
    return defaultValue
  }
  return data.value
}

