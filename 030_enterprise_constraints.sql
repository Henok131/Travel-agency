-- =============================================================================
-- Migration 030: Enterprise Protection — Constraints, Idempotency, Locking
-- Purpose: Add unique constraints, idempotency key, row-level lock RPC,
--          and background expiry worker RPC.
-- Applied: PENDING MANUAL REVIEW
-- =============================================================================
-- SAFETY RULES:
--   - All CREATE/ALTER use IF NOT EXISTS patterns
--   - No column drops, no enum modifications
--   - NULLs are allowed (DRAFT bookings have no PNR/order)
--   - Partial unique indexes used for nullable columns
--   - Idempotent: safe to run multiple times
-- =============================================================================


-- ═══════════════════════════════════════════════════════════════════════════════
-- PROTECTION 1: Unique Constraints on GDS Fields
-- Prevents duplicate PNR or order corruption across retries or race conditions.
-- Uses partial index (WHERE ... IS NOT NULL) so DRAFT bookings with NULLs don't collide.
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
    -- Check for existing duplicate gds_order_id values
    IF EXISTS (
        SELECT gds_order_id, COUNT(*)
        FROM public.bookings
        WHERE gds_order_id IS NOT NULL
        GROUP BY gds_order_id
        HAVING COUNT(*) > 1
    ) THEN
        RAISE WARNING 'DUPLICATE_GDS_ORDER_IDS_FOUND: Cannot add unique constraint. Review bookings table for duplicates.';
    ELSE
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE indexname = 'unique_gds_order'
        ) THEN
            CREATE UNIQUE INDEX unique_gds_order
                ON public.bookings (gds_order_id)
                WHERE gds_order_id IS NOT NULL;
            RAISE NOTICE 'Created unique partial index: unique_gds_order';
        END IF;
    END IF;
END $$;

-- Comment for documentation
COMMENT ON INDEX unique_gds_order IS 'Prevents duplicate Amadeus order IDs across bookings. Partial index: NULLs allowed for DRAFT bookings.';

DO $$
BEGIN
    IF EXISTS (
        SELECT gds_pnr, COUNT(*)
        FROM public.bookings
        WHERE gds_pnr IS NOT NULL
        GROUP BY gds_pnr
        HAVING COUNT(*) > 1
    ) THEN
        RAISE WARNING 'DUPLICATE_GDS_PNR_FOUND: Cannot add unique constraint. Review bookings table for duplicates.';
    ELSE
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE indexname = 'unique_gds_pnr'
        ) THEN
            CREATE UNIQUE INDEX unique_gds_pnr
                ON public.bookings (gds_pnr)
                WHERE gds_pnr IS NOT NULL;
            RAISE NOTICE 'Created unique partial index: unique_gds_pnr';
        END IF;
    END IF;
END $$;

COMMENT ON INDEX unique_gds_pnr IS 'Prevents duplicate PNR references across bookings. Partial index: NULLs allowed for DRAFT bookings.';


-- ═══════════════════════════════════════════════════════════════════════════════
-- PROTECTION 2: Idempotency Key Column
-- Stores caller-provided or server-generated UUID per hold request.
-- Unique constraint prevents duplicate Amadeus calls on retry.
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Partial unique index (only enforce when key is set)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'unique_idempotency_key'
    ) THEN
        CREATE UNIQUE INDEX unique_idempotency_key
            ON public.bookings (idempotency_key)
            WHERE idempotency_key IS NOT NULL;
        RAISE NOTICE 'Created unique partial index: unique_idempotency_key';
    END IF;
END $$;

COMMENT ON INDEX unique_idempotency_key IS 'Prevents duplicate hold/ticket operations via caller-supplied or server-generated idempotency key.';


-- ═══════════════════════════════════════════════════════════════════════════════
-- PROTECTION 3: Row-Level Lock RPC (acquire_hold_lock)
-- Atomically: SELECT FOR UPDATE → verify DRAFT → set idempotency_key → return.
-- Short transaction — lock released before Amadeus HTTP call.
-- Second concurrent caller gets: unique violation OR sees non-DRAFT status.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.acquire_hold_lock(
    p_booking_id       UUID,
    p_idempotency_key  TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_booking RECORD;
    v_existing_key TEXT;
BEGIN
    -- =========================================================================
    -- STEP 1: Lock the booking row (blocks concurrent callers)
    -- =========================================================================
    SELECT * INTO v_booking
    FROM public.bookings
    WHERE id = p_booking_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'BOOKING_NOT_FOUND: No booking with id=%', p_booking_id
            USING ERRCODE = 'P0002';
    END IF;

    -- =========================================================================
    -- STEP 2: Check idempotency — same key means retry of same request
    -- =========================================================================
    IF v_booking.idempotency_key IS NOT NULL
       AND v_booking.idempotency_key = p_idempotency_key THEN
        -- Same caller retrying — return current state for idempotent handling
        RETURN jsonb_build_object(
            'lock_status',  'IDEMPOTENT_RETRY',
            'status',       v_booking.status,
            'gds_pnr',      v_booking.gds_pnr,
            'gds_order_id', v_booking.gds_order_id,
            'hold_expires_at', v_booking.hold_expires_at,
            'price_snapshot_json', v_booking.price_snapshot_json
        );
    END IF;

    -- =========================================================================
    -- STEP 3: Check if already HELD (different key — true idempotency check)
    -- =========================================================================
    IF v_booking.status = 'HELD' THEN
        RETURN jsonb_build_object(
            'lock_status', 'ALREADY_HELD',
            'status',      v_booking.status,
            'gds_pnr',     v_booking.gds_pnr,
            'gds_order_id', v_booking.gds_order_id,
            'hold_expires_at', v_booking.hold_expires_at,
            'price_snapshot_json', v_booking.price_snapshot_json
        );
    END IF;

    -- =========================================================================
    -- STEP 4: Verify status is DRAFT (state machine guard)
    -- =========================================================================
    IF v_booking.status != 'DRAFT' THEN
        RETURN jsonb_build_object(
            'lock_status', 'INVALID_STATUS',
            'status',      v_booking.status
        );
    END IF;

    -- =========================================================================
    -- STEP 5: Claim the booking — set idempotency key (prevents concurrent holds)
    -- Unique constraint on idempotency_key prevents race condition:
    -- If two requests arrive with DIFFERENT keys, second one gets unique violation.
    -- If two arrive with SAME key, step 2 catches the retry.
    -- =========================================================================
    UPDATE public.bookings
    SET idempotency_key = p_idempotency_key
    WHERE id = p_booking_id;

    -- Return success — caller is cleared to proceed with Amadeus call
    RETURN jsonb_build_object(
        'lock_status',      'ACQUIRED',
        'status',           v_booking.status,
        'contact_email',    v_booking.contact_email,
        'contact_phone',    v_booking.contact_phone,
        'total_price',      v_booking.total_price,
        'currency',         v_booking.currency
    );
END;
$$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- PROTECTION 4: Background Expiry Worker RPC (expire_stale_holds)
-- Server calls this every 5 minutes via setInterval.
-- Updates HELD → EXPIRED where hold_expires_at < now().
-- Also unlocks passengers for expired bookings.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.expire_stale_holds()
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_expired_ids  UUID[];
    v_count        INT;
    v_unlocked     INT;
BEGIN
    -- Find and update all expired HELD bookings
    WITH expired AS (
        UPDATE public.bookings
        SET status = 'EXPIRED'
        WHERE status = 'HELD'
          AND hold_expires_at IS NOT NULL
          AND hold_expires_at < NOW()
        RETURNING id
    )
    SELECT ARRAY_AGG(id), COUNT(*)
    INTO v_expired_ids, v_count
    FROM expired;

    -- Unlock passengers for all expired bookings
    IF v_count > 0 AND v_expired_ids IS NOT NULL THEN
        UPDATE public.booking_passengers
        SET is_locked = FALSE
        WHERE booking_id = ANY(v_expired_ids);

        GET DIAGNOSTICS v_unlocked = ROW_COUNT;
    ELSE
        v_count := 0;
        v_unlocked := 0;
    END IF;

    RETURN jsonb_build_object(
        'expired_count',   v_count,
        'unlocked_count',  v_unlocked,
        'expired_ids',     COALESCE(to_jsonb(v_expired_ids), '[]'::jsonb)
    );
END;
$$;
