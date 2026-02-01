// Debug helper to check if deleted_items table exists
import { supabase } from './supabase'

export async function checkRecyclingBinTable() {
  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('deleted_items')
      .select('id')
      .limit(1)

    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          exists: false,
          error: 'Table does not exist. Please run migration 005_create_deleted_items.sql in Supabase SQL Editor.'
        }
      }
      return { exists: false, error: error.message }
    }

    return { exists: true, error: null }
  } catch (err) {
    return { exists: false, error: err.message }
  }
}
