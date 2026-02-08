-- ============================================================================
-- Migration: 024_add_amadeus_columns.sql
-- Purpose : Add Amadeus integration fields to main_table for hold→ticket flow
-- ============================================================================

ALTER TABLE main_table
  ADD COLUMN IF NOT EXISTS amadeus_offer_id text,
  ADD COLUMN IF NOT EXISTS amadeus_order_id text,
  ADD COLUMN IF NOT EXISTS amadeus_pnr text,
  ADD COLUMN IF NOT EXISTS amadeus_ticket_number text,
  ADD COLUMN IF NOT EXISTS hold_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS payment_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS payment_currency text DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS eticket_url text,
  ADD COLUMN IF NOT EXISTS passenger_json jsonb,
  ADD COLUMN IF NOT EXISTS pricing_json jsonb;

COMMENT ON COLUMN main_table.amadeus_offer_id IS 'Amadeus flight offer identifier used for hold/ticket.';
COMMENT ON COLUMN main_table.amadeus_order_id IS 'Amadeus order identifier returned after hold/ticket.';
COMMENT ON COLUMN main_table.amadeus_pnr IS 'PNR/record locator returned by Amadeus.';
COMMENT ON COLUMN main_table.amadeus_ticket_number IS 'Issued e-ticket number.';
COMMENT ON COLUMN main_table.hold_expires_at IS 'Hold expiration timestamp from Amadeus.';
COMMENT ON COLUMN main_table.payment_status IS 'Local payment state: unpaid|paid|failed.';
COMMENT ON COLUMN main_table.payment_amount IS 'Captured payment amount in payment_currency.';
COMMENT ON COLUMN main_table.payment_currency IS 'Currency used for payment_amount.';
COMMENT ON COLUMN main_table.eticket_url IS 'Link to retrieved e-ticket PDF or deep link.';
COMMENT ON COLUMN main_table.passenger_json IS 'Raw passenger/traveler payload saved for audit.';
COMMENT ON COLUMN main_table.pricing_json IS 'Raw pricing payload saved for audit.';

-- Optional guard to align booking_status with UI (leave commented to avoid breaking)
-- ALTER TABLE main_table ADD CONSTRAINT booking_status_chk CHECK (booking_status IN ('draft','pending','confirmed','cancelled'));

-- ============================================================================
-- Migration Complete
-- ============================================================================
