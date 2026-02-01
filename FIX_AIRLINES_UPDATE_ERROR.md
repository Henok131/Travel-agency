# Fix for "Error updating airlines: TypeError: Failed to fetch"

## Problem
The error occurs when trying to update the `airlines` field in MainTable. The error message "Failed to fetch" is too generic and doesn't provide useful debugging information.

## Root Cause Analysis

Based on the pattern in `RequestsList.jsx` and `ExpensesList.jsx`, the issue is likely:
1. **Missing proper error handling** - Network errors aren't being caught properly
2. **Generic error messages** - The catch block shows `err.message` which might be undefined for network errors
3. **No validation** - Not checking if Supabase client is properly initialized

## Solution

### Step 1: Verify Supabase Import
Ensure MainTable.jsx imports Supabase correctly:
```javascript
import { supabase } from '../lib/supabase'
```

### Step 2: Fix the saveCell Function
Replace the error handling in `saveCell` function with this improved version:

```javascript
const saveCell = async (rowId, field, value, skipCancel = false) => {
  const request = requests.find(r => r.id === rowId)
  if (!request) return

  let dbValue = value.trim()
  
  // ... existing field conversion logic (dates, etc.) ...

  // Store original requests for rollback
  const originalRequests = [...requests]

  // Update local state optimistically
  const updatedRequests = requests.map(r => {
    if (r.id === rowId) {
      const updated = { ...r }
      updated[field] = dbValue || null
      return updated
    }
    return r
  })
  setRequests(updatedRequests)

  // Update backend with improved error handling
  try {
    // Validate Supabase client
    if (!supabase) {
      throw new Error('Supabase client is not initialized. Please check your environment variables.')
    }

    const updateData = {}
    updateData[field] = dbValue

    const { data, error: updateError } = await supabase
      .from('main_table')  // Ensure correct table name
      .update(updateData)
      .eq('id', rowId)
      .select()  // Return updated data for verification

    if (updateError) {
      // Supabase-specific error
      throw new Error(`Supabase error: ${updateError.message || updateError.code || 'Unknown error'}`)
    }

    // Verify update was successful
    if (!data || data.length === 0) {
      throw new Error(`No rows updated. Row ID: ${rowId}`)
    }

  } catch (err) {
    console.error(`Error updating ${field}:`, err)
    
    // Revert on error
    setRequests(originalRequests)
    
    // Provide detailed error message
    let errorMessage = `Error updating ${field}: `
    
    if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
      errorMessage += 'Network error - please check your internet connection and Supabase configuration.'
    } else if (err.message) {
      errorMessage += err.message
    } else if (err.code) {
      errorMessage += `Error code: ${err.code}`
    } else {
      errorMessage += 'Unknown error occurred. Please check the console for details.'
    }
    
    // Log full error details for debugging
    console.error('Full error details:', {
      error: err,
      field,
      rowId,
      value: dbValue,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
    })
    
    alert(errorMessage)
  }

  if (!skipCancel) {
    cancelEditing()
  }
}
```

### Step 3: Verify Environment Variables
Check that `env.local` or `.env` file contains:
```
VITE_SUPABASE_URL=https://xhfcerpeymkapyrglnly.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Check Network Tab
1. Open browser DevTools → Network tab
2. Try updating airlines field
3. Look for the failed request
4. Check:
   - Request URL (should be Supabase REST API endpoint)
   - Request method (should be PATCH)
   - Response status code
   - CORS headers

### Step 5: Verify Table and Column Names
Ensure the database table and column exist:
- Table: `main_table`
- Column: `airlines` (TEXT type)

## Testing Checklist

- [ ] Restore MainTable.jsx file
- [ ] Apply the improved error handling code
- [ ] Verify Supabase import is correct
- [ ] Check environment variables are loaded
- [ ] Test updating airlines field
- [ ] Verify error messages are now descriptive
- [ ] Check browser console for detailed error logs
- [ ] Verify network request in DevTools

## Expected Behavior After Fix

1. **Better error messages**: Instead of "Failed to fetch", you'll see:
   - "Network error - please check your internet connection..."
   - "Supabase error: [specific error message]"
   - "No rows updated. Row ID: [id]"

2. **Detailed console logs**: Full error details including:
   - Error object
   - Field name
   - Row ID
   - Value being saved
   - Supabase configuration status

3. **Proper error recovery**: Local state reverts on error, preventing UI inconsistencies
