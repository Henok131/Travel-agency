-- =============================================================================
-- Migration 029: Atomic finalization RPCs for HOLD and TICKET endpoints
-- Purpose: Wrap all post-Amadeus DB writes in single PostgreSQL transactions.
--          If any step fails → automatic ROLLBACK of all mutations.
-- Applied: PENDING MANUAL REVIEW
-- =============================================================================
-- GUARDRAILS:
--   - DB writes ONLY. No external API calls.
--   - No business logic or pricing validation.
--   - Explicit RAISE EXCEPTION with error codes.
--   - Automatic rollback on any failure (Postgres default for plpgsql).
-- =============================================================================


-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNCTION 1: finalize_hold_atomic
-- Called after Amadeus Flight Orders API succeeds.
-- Wraps: bookings update + passenger lock + audit log + offers cleanup
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.finalize_hold_atomic(
    p_booking_id       UUID,
    p_pnr              TEXT,
    p_order_id         TEXT,
    p_expires_at       TEXT,          -- ISO timestamp string
    p_price_snapshot   JSONB,
    p_total_price      NUMERIC,
    p_currency         TEXT,
    p_raw_response     JSONB          -- Full Amadeus response → audit_logs only
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_rows_updated    INT;
    v_rows_locked     INT;
    v_rows_deleted    INT;
BEGIN
    -- =========================================================================
    -- STEP 1: Update bookings table (coordination fields only)
    -- =========================================================================
    UPDATE public.bookings
    SET
        status              = 'HELD',
        gds_pnr             = p_pnr,
        gds_order_id        = p_order_id,
        hold_expires_at     = p_expires_at::TIMESTAMPTZ,
        price_snapshot_json = p_price_snapshot,
        total_price         = p_total_price,
        currency            = p_currency
    WHERE id = p_booking_id;

    GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
    IF v_rows_updated = 0 THEN
        RAISE EXCEPTION 'HOLD_BOOKING_NOT_FOUND: No booking row updated for id=%', p_booking_id
            USING ERRCODE = 'P0001';
    END IF;

    -- =========================================================================
    -- STEP 2: Lock all passengers (is_locked = true)
    -- =========================================================================
    UPDATE public.booking_passengers
    SET is_locked = TRUE
    WHERE booking_id = p_booking_id;

    GET DIAGNOSTICS v_rows_locked = ROW_COUNT;
    -- v_rows_locked can be 0 if no passengers exist (edge case, already validated upstream)

    -- =========================================================================
    -- STEP 3: Insert audit log (full raw response — NEVER in business tables)
    -- =========================================================================
    INSERT INTO public.audit_logs (action, order_id, status, raw_response)
    VALUES ('HOLD_CREATED', p_order_id, 'HELD', p_raw_response);

    -- =========================================================================
    -- STEP 4: Delete spent offers (prevent re-use)
    -- =========================================================================
    DELETE FROM public.booking_offers
    WHERE booking_id = p_booking_id;

    GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;

    -- =========================================================================
    -- Return summary
    -- =========================================================================
    RETURN jsonb_build_object(
        'success',       TRUE,
        'rows_updated',  v_rows_updated,
        'rows_locked',   v_rows_locked,
        'offers_deleted', v_rows_deleted
    );
END;
$$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNCTION 2: finalize_ticket_atomic
-- Called after Amadeus Ticketing API succeeds.
-- Wraps: booking status → TICKETED + per-passenger ticket_number + audit log
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.finalize_ticket_atomic(
    p_booking_id       UUID,
    p_order_id         TEXT,
    p_ticket_map       JSONB,         -- { "passenger_uuid": "ticket_number", ... }
    p_raw_response     JSONB          -- Full Amadeus response → audit_logs only
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_rows_updated     INT;
    v_pax_key          TEXT;
    v_ticket_number    TEXT;
    v_pax_updated      INT := 0;
BEGIN
    -- =========================================================================
    -- STEP 1: Update booking status → TICKETED
    -- =========================================================================
    UPDATE public.bookings
    SET status = 'TICKETED'
    WHERE id = p_booking_id;

    GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
    IF v_rows_updated = 0 THEN
        RAISE EXCEPTION 'TICKET_BOOKING_NOT_FOUND: No booking row updated for id=%', p_booking_id
            USING ERRCODE = 'P0001';
    END IF;

    -- =========================================================================
    -- STEP 2: Update ticket_number per passenger from ticket map
    -- =========================================================================
    FOR v_pax_key, v_ticket_number IN
        SELECT key, value #>> '{}' FROM jsonb_each(p_ticket_map)
    LOOP
        UPDATE public.booking_passengers
        SET ticket_number = v_ticket_number
        WHERE id = v_pax_key::UUID
          AND booking_id = p_booking_id;

        GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
        v_pax_updated := v_pax_updated + v_rows_updated;

        IF v_rows_updated = 0 THEN
            RAISE WARNING 'Passenger % not found for booking % — ticket % not assigned',
                v_pax_key, p_booking_id, v_ticket_number;
        END IF;
    END LOOP;

    -- =========================================================================
    -- STEP 3: Insert audit log (full raw response)
    -- =========================================================================
    INSERT INTO public.audit_logs (action, order_id, status, raw_response)
    VALUES ('TICKET_ISSUED', p_order_id, 'TICKETED', p_raw_response);

    -- =========================================================================
    -- Return summary
    -- =========================================================================
    RETURN jsonb_build_object(
        'success',        TRUE,
        'pax_ticketed',   v_pax_updated,
        'ticket_count',   jsonb_object_keys_count(p_ticket_map)
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Re-raise with context so caller gets structured error
        RAISE EXCEPTION 'TICKET_ATOMIC_FAILED: % (SQLSTATE: %)', SQLERRM, SQLSTATE
            USING ERRCODE = SQLSTATE;
END;
$$;

-- Helper: count keys in a JSONB object (used by finalize_ticket_atomic)
CREATE OR REPLACE FUNCTION public.jsonb_object_keys_count(p_obj JSONB)
RETURNS INT
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT count(*)::INT FROM jsonb_object_keys(p_obj);
$$;
