-- =============================================================================
-- Migration 028: Evolve booking schema for lifecycle state machine
-- Applied: 2026-02-17
-- 
-- Purpose:
--   Adds HELD status, passenger locking, price snapshots, hold expiry,
--   and FK links to main_table/requests for the booking orchestration layer.
--
-- Safety:
--   - All operations are idempotent (IF NOT EXISTS / IF NOT EXISTS checks)
--   - No data modification or deletion
--   - No column drops or type changes
--   - Production-safe for zero-downtime deployment
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1️⃣  Add HELD to booking_status_enum (before PENDING_PAYMENT)
--     PostgreSQL 12+ supports ADD VALUE IF NOT EXISTS inside transactions
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TYPE public.booking_status_enum ADD VALUE IF NOT EXISTS 'HELD' BEFORE 'PENDING_PAYMENT';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2️⃣  Add is_locked column to booking_passengers
--     Controls whether passenger data is frozen (after HOLD)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.booking_passengers
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT false;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3️⃣  Add new columns to bookings table
-- ─────────────────────────────────────────────────────────────────────────────

-- Frozen price snapshot captured at HOLD time (airline price, taxes, total)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS price_snapshot_json JSONB;

-- Hold expiration timestamp returned by Amadeus ticketingAgreement.dateTimeLimit
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS hold_expires_at TIMESTAMPTZ;

-- FK link to main_table (financial/business record)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS main_table_id UUID;

-- FK link to originating request (if booking was created from a request)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS request_id UUID;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4️⃣  Add Foreign Key Constraints (only if they don't already exist)
-- ─────────────────────────────────────────────────────────────────────────────

-- bookings.main_table_id → main_table(id) ON DELETE SET NULL
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_bookings_main_table_id'
      AND table_schema = 'public'
      AND table_name = 'bookings'
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT fk_bookings_main_table_id
      FOREIGN KEY (main_table_id)
      REFERENCES public.main_table(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- bookings.request_id → requests(id) ON DELETE SET NULL
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_bookings_request_id'
      AND table_schema = 'public'
      AND table_name = 'bookings'
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT fk_bookings_request_id
      FOREIGN KEY (request_id)
      REFERENCES public.requests(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5️⃣  Add Indexes (IF NOT EXISTS)
--     Note: idx_bookings_status and idx_booking_passengers_booking_id
--     already exist from migration 026 — included here for completeness
-- ─────────────────────────────────────────────────────────────────────────────

-- Index on bookings.status (already exists — safe no-op)
CREATE INDEX IF NOT EXISTS idx_bookings_status
  ON public.bookings (status);

-- Index on bookings.main_table_id (new)
CREATE INDEX IF NOT EXISTS idx_bookings_main_table_id
  ON public.bookings (main_table_id);

-- Index on bookings.request_id (new)
CREATE INDEX IF NOT EXISTS idx_bookings_request_id
  ON public.bookings (request_id);

-- Index on booking_passengers.booking_id (already exists — safe no-op)
CREATE INDEX IF NOT EXISTS idx_booking_passengers_booking_id
  ON public.booking_passengers (booking_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6️⃣  Add comment annotations for documentation
-- ─────────────────────────────────────────────────────────────────────────────
COMMENT ON COLUMN public.bookings.price_snapshot_json IS
  'Frozen price snapshot at HOLD time: { total, currency, base, taxes }';

COMMENT ON COLUMN public.bookings.hold_expires_at IS
  'Hold expiration from Amadeus ticketingAgreement.dateTimeLimit. Null if not held.';

COMMENT ON COLUMN public.bookings.main_table_id IS
  'FK to main_table — links booking to its financial/business record.';

COMMENT ON COLUMN public.bookings.request_id IS
  'FK to requests — links booking back to originating customer request.';

COMMENT ON COLUMN public.booking_passengers.is_locked IS
  'When true, passenger data is frozen (set after HOLD). Prevents edits to name, passport, etc.';
