-- ============================================================================
-- Migration: 016_fix_booking_status_sync.sql
-- Description: Fix booking status update bug and sync trigger
--              1. Change booking_status default to 'Draft' in main_table
--              2. Update trigger to set booking_status to 'Draft' on sync
--              3. Ensure frontend uses UUID id for updates
-- ============================================================================

-- ============================================================================
-- STEP 1: Update main_table schema - Change booking_status default to 'Draft'
-- ============================================================================

ALTER TABLE main_table 
  ALTER COLUMN booking_status SET DEFAULT 'Draft';

-- Update existing NULL or 'pending' values to 'Draft' for consistency
UPDATE main_table 
SET booking_status = 'Draft' 
WHERE booking_status IS NULL OR booking_status = 'pending';

-- ============================================================================
-- STEP 2: Drop and recreate trigger function with booking_status = 'Draft'
-- ============================================================================

-- Drop existing trigger
DROP TRIGGER IF EXISTS trigger_sync_requests_to_main_table ON requests;

-- Drop existing function
DROP FUNCTION IF EXISTS sync_requests_to_main_table();

-- Recreate trigger function with booking_status set to 'Draft'
CREATE OR REPLACE FUNCTION sync_requests_to_main_table()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into main_table with specified fields from requests
  -- Set booking_status to 'Draft' explicitly
  INSERT INTO main_table (
    id,
    first_name,
    middle_name,
    last_name,
    date_of_birth,
    gender,
    nationality,
    passport_number,
    created_at,
    booking_status
  ) VALUES (
    NEW.id,
    NEW.first_name,
    NEW.middle_name,
    NEW.last_name,
    NEW.date_of_birth,
    NEW.gender,
    NEW.nationality,
    NEW.passport_number,
    NEW.created_at,
    'Draft'  -- Explicitly set booking_status to 'Draft'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 3: Recreate trigger
-- ============================================================================

CREATE TRIGGER trigger_sync_requests_to_main_table
  AFTER INSERT ON requests
  FOR EACH ROW
  EXECUTE FUNCTION sync_requests_to_main_table();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION sync_requests_to_main_table() IS 'Trigger function to automatically sync requests table inserts to main_table. Sets booking_status to Draft on sync.';
COMMENT ON TRIGGER trigger_sync_requests_to_main_table ON requests IS 'Automatically creates corresponding row in main_table when a new row is inserted into requests. Sets booking_status to Draft.';

-- ============================================================================
-- Migration Complete
-- ============================================================================
