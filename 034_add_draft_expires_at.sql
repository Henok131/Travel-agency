-- =============================================================================
-- Migration 034: Add draft_expires_at column to bookings table
-- Applied: 2026-02-17
-- 
-- Purpose:
--   Adds draft_expires_at column for controlled 15-minute session TTL on DRAFT bookings.
--   This replaces unreliable lastTicketingDateTime from Amadeus offers.
--   Repricing during HOLD is the source of truth for offer validity.
--
-- Safety:
--   - All operations are idempotent (IF NOT EXISTS checks)
--   - No data modification or deletion
--   - Production-safe for zero-downtime deployment
-- =============================================================================

-- Add draft_expires_at column to bookings table
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS draft_expires_at TIMESTAMPTZ;

COMMENT ON COLUMN public.bookings.draft_expires_at IS 
  'Draft session expiration timestamp (created_at + 15 minutes). Used for UX countdown only. Repricing during HOLD is the source of truth for offer validity.';
