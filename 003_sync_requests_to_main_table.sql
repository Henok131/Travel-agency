-- ============================================================================
-- Migration: 003_sync_requests_to_main_table.sql
-- Description: Creates trigger to automatically sync requests to main_table
--              When a row is inserted into requests, a corresponding row is
--              created in main_table with all shared fields copied
-- ============================================================================

-- ============================================================================
-- TRIGGER FUNCTION
-- Purpose: Copy all shared fields from requests to main_table
--          New business columns use their DEFAULT values
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_requests_to_main_table()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into main_table with all shared fields from requests
  -- New business columns (booking_ref, booking_status, print_invoice, etc.)
  -- will use their DEFAULT values as defined in the table schema
  INSERT INTO main_table (
    id,
    first_name,
    middle_name,
    last_name,
    date_of_birth,
    gender,
    nationality,
    passport_number,
    departure_airport,
    destination_airport,
    travel_date,
    return_date,
    request_types,
    status,
    is_demo,
    ocr_source,
    ocr_confidence,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.first_name,
    NEW.middle_name,
    NEW.last_name,
    NEW.date_of_birth,
    NEW.gender,
    NEW.nationality,
    NEW.passport_number,
    NEW.departure_airport,
    NEW.destination_airport,
    NEW.travel_date,
    NEW.return_date,
    NEW.request_types,
    NEW.status,
    NEW.is_demo,
    NEW.ocr_source,
    NEW.ocr_confidence,
    NEW.created_at,
    NEW.updated_at
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER
-- Purpose: Fire trigger function AFTER INSERT on requests table
-- ============================================================================

CREATE TRIGGER trigger_sync_requests_to_main_table
  AFTER INSERT ON requests
  FOR EACH ROW
  EXECUTE FUNCTION sync_requests_to_main_table();

-- ============================================================================
-- COMMENTS
-- Purpose: Document trigger for future reference
-- ============================================================================

COMMENT ON FUNCTION sync_requests_to_main_table() IS 'Trigger function to automatically sync requests table inserts to main_table. Copies all shared fields and uses DEFAULT values for new business columns.';
COMMENT ON TRIGGER trigger_sync_requests_to_main_table ON requests IS 'Automatically creates corresponding row in main_table when a new row is inserted into requests.';

-- ============================================================================
-- Migration Complete
-- ============================================================================
