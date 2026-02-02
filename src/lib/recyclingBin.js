// Recycling Bin Helper Functions
// Centralized functions for saving deleted items to recycling bin

import { supabase } from '@/lib/supabaseClient'

/**
 * Save a deleted item to the recycling bin
 * @param {Object} params - Parameters object
 * @param {string} params.originalId - ID of the original record
 * @param {string} params.originalTable - Source table name (e.g., 'requests', 'main_table', 'expenses', 'bookings')
 * @param {Object} params.itemData - Full record data to save
 * @param {string} params.itemName - Display name for the item
 * @returns {Promise<{error: Error|null}>}
 */
export async function saveToRecyclingBin({ originalId, originalTable, itemData, itemName }) {
  try {
    // Determine item type from table name
    const itemTypeMap = {
      'requests': 'request',
      'main_table': 'booking',
      'expenses': 'expense',
      'bookings': 'booking',
      'invoices': 'invoice'
    }
    
    const itemType = itemTypeMap[originalTable] || originalTable

    const insertData = {
      original_id: originalId,
      original_table: originalTable,
      item_type: itemType,
      item_name: itemName,
      item_data: itemData
    }

    console.log('Saving to recycling bin:', {
      originalId,
      originalTable,
      itemType,
      itemName
    })

    const { data, error } = await supabase
      .from('deleted_items')
      .insert(insertData)
      .select()

    if (error) {
      console.error('Error saving to recycling bin:', error)
      // If table doesn't exist, log warning but don't throw
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.error('❌ deleted_items table does not exist! Please run migration 005_create_deleted_items.sql in Supabase')
        alert('Recycling bin table not found. Please contact administrator to run database migration.')
      }
      return { error }
    }

    console.log('✅ Successfully saved to recycling bin:', data?.[0]?.id)
    return { error: null, data: data?.[0] }
  } catch (err) {
    console.error('Exception saving to recycling bin:', err)
    return { error: err }
  }
}

/**
 * Get display name from item data
 * @param {Object} itemData - Record data
 * @param {string} originalTable - Source table name
 * @param {string} originalId - Record ID
 * @returns {string} Display name
 */
export function getItemDisplayName(itemData, originalTable, originalId) {
  // Try to get name from common fields
  if (itemData.first_name && itemData.last_name) {
    return `${itemData.first_name || ''} ${itemData.last_name || ''}`.trim()
  }
  
  // For expenses, use category + amount
  if (originalTable === 'expenses' && itemData.category) {
    return `${itemData.category} - €${itemData.gross_amount || itemData.amount || '0.00'}`
  }
  
  // For bookings, try booking_ref or name
  if (originalTable === 'bookings' && itemData.booking_ref) {
    return `Booking ${itemData.booking_ref}`
  }
  
  // For invoices, try invoice number
  if (originalTable === 'invoices' && itemData.invoice_number) {
    return `Invoice ${itemData.invoice_number}`
  }
  
  // Fallback to table name + ID
  const tableDisplayName = {
    'requests': 'Request',
    'main_table': 'Booking',
    'expenses': 'Expense',
    'bookings': 'Booking',
    'invoices': 'Invoice'
  }
  
  return `${tableDisplayName[originalTable] || 'Item'} #${originalId.substring(0, 8)}`
}
