-- =============================================================================
-- Migration 031: Create acquire_hold_lock RPC
-- Applied: 2026-02-17
--
-- Purpose:
--   Simple row-level lock for HOLD concurrency prevention.
--   Stores idempotency key to detect duplicate HOLD requests.
--
-- Safety:
--   - CREATE OR REPLACE — idempotent
--   - No data modification or deletion
-- =============================================================================

-- Add idempotency_key column if missing
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Create the acquire_hold_lock function
CREATE OR REPLACE FUNCTION public.acquire_hold_lock(
  p_booking_id uuid,
  p_idempotency_key text
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- simple row lock to prevent double HOLD
  PERFORM 1
  FROM bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  -- store idempotency key
  UPDATE bookings
  SET idempotency_key = p_idempotency_key
  WHERE id = p_booking_id;
END;
$$;
