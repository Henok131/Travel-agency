-- ============================================================================
-- Migration: 014_fix_organization_id_trigger.sql
-- Description: Updates sync_requests_to_main_table() trigger function to copy
--              organization_id from requests to main_table
--              This ensures new records have organization_id populated
-- ============================================================================

-- ============================================================================
-- UPDATE TRIGGER FUNCTION
-- Purpose: Copy organization_id from requests to main_table
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
    organization_id,
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
    NEW.organization_id,
    NEW.created_at,
    NEW.updated_at
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Migration Complete
-- Note: The trigger trigger_sync_requests_to_main_table already exists
--       and will automatically use the updated function
-- ============================================================================
